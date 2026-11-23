// n8n on server1 posts the research result here (spec §8.1, §8.5). The secret gates it,
// the parked submission says where the PDF goes, and the zod gate decides what the
// visitor sees. A bad pdf part never blocks delivery: the fallback PDF goes out instead.
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { z } from "zod";
import { contactFrom, contactTo, calBookingUrl, resendKey } from "@/lib/contact";
import { DOSSIER_UI, PDF_FEHLER_GRUND } from "@/lib/vorabFahrplan/blocks";
import type { VorabFahrplan } from "@/lib/vorabFahrplan/content";
import { buildDossierMail } from "@/lib/vorabFahrplan/dossier";
import { buildFallbackPlan } from "@/lib/vorabFahrplan/fallback";
import { parkJob, researchConfigured, takeJob } from "@/lib/vorabFahrplan/job";
import { buildVisitorMail } from "@/lib/vorabFahrplan/mails";
import { pdfFilename, renderVorabFahrplanPdf } from "@/lib/vorabFahrplan/pdf";
import { mergeResearch, ResearchResultSchema, type ResearchResult } from "@/lib/vorabFahrplan/research";
import { sendLeadMailWithRetry } from "@/lib/vorabFahrplan/submission";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY = 256 * 1024;
const Envelope = ResearchResultSchema.pick({ fallback: true, grund: true, erlaubteQuellen: true });
const { pdf: PdfSchema, dossier: DossierSchema } = ResearchResultSchema.shape;

function secretOk(req: Request): boolean {
  if (!researchConfigured()) return false;
  const got = Buffer.from(req.headers.get("x-vrelo-secret") ?? "");
  const want = Buffer.from(process.env.PC_SHARED_SECRET!);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** The body as text, or null once it passes `max` bytes (stops reading there). */
async function readTextCapped(req: Request, max: number): Promise<string | null> {
  if (Number(req.headers.get("content-length")) > max) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Short zod summary for the dossier: the first three paths with their message. */
const kurz = (e: z.ZodError, prefix: string) =>
  e.issues
    .slice(0, 3)
    .map((i) => `${[prefix, ...i.path].filter((x) => x !== "").join(".")}: ${i.message}`)
    .join("; ");

export async function POST(req: Request): Promise<Response> {
  if (!secretOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const raw = await readTextCapped(req, MAX_BODY);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw ?? "");
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const jobId = body && typeof body === "object" && !Array.isArray(body) ? body.jobId : undefined;
  if (typeof jobId !== "string" || !jobId || jobId.length > 100) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  // GETDEL: a duplicate, or n8n's late answer after the website already sent the fallback.
  const s = await takeJob(jobId);
  if (!s) return NextResponse.json({ status: "already-delivered" });

  // Partial parse (spec §8.5): each part fails on its own, the reason goes to the dossier.
  const hinweise: string[] = [];
  const env = Envelope.safeParse(body);
  const pdf = PdfSchema.safeParse(body.pdf);
  const dossier = DossierSchema.safeParse(body.dossier);
  if (!env.success) hinweise.push(`${DOSSIER_UI.rechercheUnbrauchbar}: ${kurz(env.error, "")}`);
  else if (env.data.fallback) hinweise.push(`${DOSSIER_UI.rechercheAus}${env.data.grund ? `: ${env.data.grund.slice(0, 300)}` : ""}`);
  else if (!pdf.success) hinweise.push(`${DOSSIER_UI.rechercheUnbrauchbar}: ${kurz(pdf.error, "pdf")}`);
  if (!dossier.success) hinweise.push(`${DOSSIER_UI.dossierUnbrauchbar}: ${kurz(dossier.error, "dossier")}`);
  const result: ResearchResult = {
    jobId,
    fallback: !env.success || env.data.fallback || !pdf.success,
    erlaubteQuellen: env.success ? env.data.erlaubteQuellen : [],
    pdf: pdf.success ? pdf.data : undefined,
    dossier: dossier.success ? dossier.data : undefined,
  };

  const resend = new Resend(resendKey());
  const sendDossier = (plan: VorabFahrplan | undefined, verworfen: string[], attachments?: { filename: string; content: Buffer }[]) => {
    const m = buildDossierMail({ contact: s.contact, plan, result, verworfen, grund: hinweise.join(" · ") || undefined });
    // Retries once and logs the contact on failure; never fails the response.
    return sendLeadMailWithRetry({
      resend,
      payload: { from: contactFrom()!, to: contactTo()!, replyTo: m.replyTo, subject: m.subject, html: m.html, text: m.text, attachments },
      contact: s.contact,
      submittedAt: s.submittedAt,
    });
  };

  let plan: VorabFahrplan;
  let verworfen: string[];
  let content: Buffer;
  try {
    const base = buildFallbackPlan(s.answers, s.contact, new Date());
    ({ plan, verworfen } = mergeResearch(base, result, base.datum, s.answers.programme));
    content = await renderVorabFahrplanPdf(plan);
  } catch {
    hinweise.push(`${PDF_FEHLER_GRUND}. ${DOSSIER_UI.pdfFehlt}`);
    await sendDossier(undefined, []);
    await parkJob(jobId, s);
    return NextResponse.json({ error: "pdf" }, { status: 502 });
  }
  const attachments = [{ filename: pdfFilename(s.contact.firma), content }];

  const visitor = buildVisitorMail(plan, calBookingUrl());
  let delivered = false;
  try {
    const sent = await resend.emails.send({
      from: contactFrom()!,
      to: s.contact.email,
      replyTo: contactTo()!,
      subject: visitor.subject,
      html: visitor.html,
      text: visitor.text,
      attachments,
    });
    delivered = !sent.error;
  } catch {
    // handled below
  }
  if (!delivered) {
    // Re-park so n8n's retry (3 tries) can deliver. Ruling P: after the last failed try
    // the parked job expires with its TTL; Ajdin has had lead mail #1 since submit.
    await parkJob(jobId, s);
    return NextResponse.json({ error: "visitor-mail" }, { status: 502 });
  }

  await sendDossier(plan, verworfen, attachments);
  return NextResponse.json({ status: "delivered", verworfen: verworfen.length });
}
