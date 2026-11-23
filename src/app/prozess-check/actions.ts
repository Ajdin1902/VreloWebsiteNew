"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { calBookingUrl, contactFrom, contactTo, isContactConfigured, isHoneypotTripped, isTooFast, resendKey } from "@/lib/contact";
import { CAP_GRUND, FORM_ERRORS, PDF_FEHLER_GRUND } from "@/lib/vorabFahrplan/blocks";
import { checkSendCaps } from "@/lib/vorabFahrplan/caps";
import { buildFallbackPlan } from "@/lib/vorabFahrplan/fallback";
import { buildLeadMail, buildVisitorMail } from "@/lib/vorabFahrplan/mails";
import { pdfFilename, renderVorabFahrplanPdf } from "@/lib/vorabFahrplan/pdf";
import { parseSubmission, sendLeadMailWithRetry, submissionErrors, type FieldErrors } from "@/lib/vorabFahrplan/submission";

export type VorabFahrplanState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; errors: FieldErrors };

// Plan 1 flow (spec §6, §10). Plan 2 inserts the research branch after the caps check.
export async function submitVorabFahrplan(_prev: VorabFahrplanState, formData: FormData): Promise<VorabFahrplanState> {
  const s = parseSubmission(formData);
  if (isHoneypotTripped(s.honeypot)) return { status: "ok" };
  if (isTooFast(s.renderedAt, Date.now())) return { status: "error", message: FORM_ERRORS.tooFast };
  const errors = submissionErrors(s);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };
  if (!isContactConfigured()) return { status: "error", message: FORM_ERRORS.notConfigured };

  const { answers, contact, submittedAt } = s;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const caps = await checkSendCaps({ ip, email: contact.email });

  const plan = buildFallbackPlan(answers, contact, submittedAt);
  let pdf: Buffer | undefined;
  try {
    pdf = await renderVorabFahrplanPdf(plan);
  } catch {
    // Handled below: the lead mail still goes out, flagged, so Ajdin follows up by hand.
  }
  const attachments = pdf ? [{ filename: pdfFilename(contact.firma), content: pdf }] : undefined;

  const resend = new Resend(resendKey());
  const lead = buildLeadMail({
    contact,
    answers,
    source: s.source,
    submittedAt,
    ...(!pdf
      ? { status: "nicht-versendet" as const, grund: PDF_FEHLER_GRUND }
      : caps.ok
        ? { status: "fallback" as const }
        : { status: "nicht-versendet" as const, grund: CAP_GRUND[caps.grund] }),
  });
  await sendLeadMailWithRetry({
    resend,
    payload: { from: contactFrom()!, to: contactTo()!, replyTo: lead.replyTo, subject: lead.subject, html: lead.html, text: lead.text, attachments },
    contact,
    submittedAt,
  });

  if (!pdf) return { status: "error", message: FORM_ERRORS.generic };
  // Capped: the visitor sees the normal success state (spec §6), only Ajdin got the mail.
  if (!caps.ok) return { status: "ok" };

  const visitor = buildVisitorMail(plan, calBookingUrl());
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
    return sent.error ? { status: "error", message: FORM_ERRORS.generic } : { status: "ok" };
  } catch {
    return { status: "error", message: FORM_ERRORS.generic };
  }
}
