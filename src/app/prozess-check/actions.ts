"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { calBookingUrl, contactFrom, contactTo, isContactConfigured, isHoneypotTripped, isTooFast, resendKey } from "@/lib/contact";
import { CAP_GRUND, FORM_ERRORS, PDF_FEHLER_GRUND, RECHERCHE_GRUND, VERSAND_FEHLER_GRUND, consentFor } from "@/lib/vorabFahrplan/blocks";
import { checkResearchCaps, checkSendCaps, releaseResearch } from "@/lib/vorabFahrplan/caps";
import { buildFallbackPlan } from "@/lib/vorabFahrplan/fallback";
import { parkJob, postJob, researchConfigured, takeJob, toResearchJob } from "@/lib/vorabFahrplan/job";
import { buildLeadMail, buildVisitorMail } from "@/lib/vorabFahrplan/mails";
import { pdfFilename, renderVorabFahrplanPdf } from "@/lib/vorabFahrplan/pdf";
import { parseSubmission, sendLeadMailWithRetry, submissionErrors, type FieldErrors } from "@/lib/vorabFahrplan/submission";

export type VorabFahrplanState =
  | { status: "idle" }
  // recherche: n8n took the job, the PDF follows by mail (deliver route); else it went out already.
  | { status: "ok"; recherche: boolean }
  | { status: "error"; message: string }
  | { status: "invalid"; errors: FieldErrors };

type LeadStatus = { status: "recherche" } | { status: "fallback"; grund?: string } | { status: "nicht-versendet" | "gesperrt"; grund: string };

// Spec §6, §8.1, §10: caps → research hand-off (if configured) → else the Plan 1 fallback send.
export async function submitVorabFahrplan(_prev: VorabFahrplanState, formData: FormData): Promise<VorabFahrplanState> {
  const s = parseSubmission(formData);
  if (isHoneypotTripped(s.honeypot)) return { status: "ok", recherche: false };
  if (isTooFast(s.renderedAt, Date.now())) return { status: "error", message: FORM_ERRORS.tooFast };
  const errors = submissionErrors(s);
  if (errors.antworten) return { status: "error", message: errors.antworten };
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };
  if (!isContactConfigured()) return { status: "error", message: FORM_ERRORS.notConfigured };

  const { answers, contact, submittedAt } = s;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const caps = await checkSendCaps({ ip, email: contact.email });
  // Same env check as the page render, so the lead records the consent the form showed.
  const research = researchConfigured();
  const consent = consentFor(research);

  const resend = new Resend(resendKey());
  // Set once the fallback PDF exists; the research lead mail goes out without it.
  let attachments: { filename: string; content: Buffer }[] | undefined = undefined;
  const sendLead = (st: LeadStatus) => {
    const lead = buildLeadMail({ contact, answers, raw: s.raw, source: s.source, submittedAt, consent, ...st });
    return sendLeadMailWithRetry({
      resend,
      payload: { from: contactFrom()!, to: contactTo()!, replyTo: lead.replyTo, subject: lead.subject, html: lead.html, text: lead.text, attachments },
      contact,
      submittedAt,
    });
  };

  // Research hand-off: no PDF and no visitor mail here, the deliver route sends both.
  let fallbackGrund: string | undefined;
  if (caps.ok && research) {
    // The caps reserve the run first (atomic); a failed hand-off gives the slot back.
    const rc = await checkResearchCaps(contact.email);
    if (rc.research) {
      const jobId = randomUUID();
      const parked = await parkJob(jobId, s);
      if (parked && (await postJob(toResearchJob(s, jobId, rc.frisch)))) {
        await sendLead({ status: "recherche" });
        return { status: "ok", recherche: true };
      }
      await takeJob(jobId); // drop the parked contact data; a late n8n answer finds nothing
      await releaseResearch(contact.email, rc.frisch);
      fallbackGrund = parked ? RECHERCHE_GRUND.webhook : RECHERCHE_GRUND.speicher;
    } else {
      fallbackGrund = RECHERCHE_GRUND[rc.grund];
    }
  }

  let plan: ReturnType<typeof buildFallbackPlan> | undefined;
  let pdf: Buffer | undefined;
  try {
    plan = buildFallbackPlan(answers, contact, submittedAt);
    pdf = await renderVorabFahrplanPdf(plan);
  } catch {
    // Handled below: the lead mail still goes out, flagged, so Ajdin follows up by hand.
  }
  attachments = pdf ? [{ filename: pdfFilename(contact.firma), content: pdf }] : undefined;

  await sendLead(
    !pdf
      ? { status: "nicht-versendet", grund: PDF_FEHLER_GRUND }
      : caps.ok
        ? { status: "fallback", grund: fallbackGrund }
        : { status: "gesperrt", grund: CAP_GRUND[caps.grund] },
  );

  if (!pdf || !plan) return { status: "error", message: FORM_ERRORS.generic };
  // Capped: the visitor sees the normal success state (spec §6), only Ajdin got the mail.
  if (!caps.ok) return { status: "ok", recherche: false };

  const visitor = buildVisitorMail(plan, calBookingUrl());
  let delivered = false;
  try {
    const sent = await resend.emails.send({
      from: contactFrom()!,
      to: contact.email,
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
  if (delivered) return { status: "ok", recherche: false };
  // The first lead mail read as sent and the caps already counted this address:
  // correct the record so Ajdin sends the PDF by hand.
  await sendLead({ status: "nicht-versendet", grund: VERSAND_FEHLER_GRUND });
  return { status: "error", message: FORM_ERRORS.generic };
}
