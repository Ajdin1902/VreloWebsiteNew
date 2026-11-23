"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { calBookingUrl, contactFrom, contactTo, isContactConfigured, isHoneypotTripped, isTooFast, resendKey } from "@/lib/contact";
import { CAP_GRUND, FORM_ERRORS, PDF_FEHLER_GRUND, VERSAND_FEHLER_GRUND } from "@/lib/vorabFahrplan/blocks";
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
  if (errors.antworten) return { status: "error", message: errors.antworten };
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };
  if (!isContactConfigured()) return { status: "error", message: FORM_ERRORS.notConfigured };

  const { answers, contact, submittedAt } = s;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const caps = await checkSendCaps({ ip, email: contact.email });

  let plan: ReturnType<typeof buildFallbackPlan> | undefined;
  let pdf: Buffer | undefined;
  try {
    plan = buildFallbackPlan(answers, contact, submittedAt);
    pdf = await renderVorabFahrplanPdf(plan);
  } catch {
    // Handled below: the lead mail still goes out, flagged, so Ajdin follows up by hand.
  }
  const attachments = pdf ? [{ filename: pdfFilename(contact.firma), content: pdf }] : undefined;

  const resend = new Resend(resendKey());
  const sendLead = (st: { status: "fallback" } | { status: "nicht-versendet" | "gesperrt"; grund: string }) => {
    const lead = buildLeadMail({ contact, answers, raw: s.raw, source: s.source, submittedAt, ...st });
    return sendLeadMailWithRetry({
      resend,
      payload: { from: contactFrom()!, to: contactTo()!, replyTo: lead.replyTo, subject: lead.subject, html: lead.html, text: lead.text, attachments },
      contact,
      submittedAt,
    });
  };
  await sendLead(
    !pdf
      ? { status: "nicht-versendet", grund: PDF_FEHLER_GRUND }
      : caps.ok
        ? { status: "fallback" }
        : { status: "gesperrt", grund: CAP_GRUND[caps.grund] },
  );

  if (!pdf || !plan) return { status: "error", message: FORM_ERRORS.generic };
  // Capped: the visitor sees the normal success state (spec §6), only Ajdin got the mail.
  if (!caps.ok) return { status: "ok" };

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
  if (delivered) return { status: "ok" };
  // The first lead mail read as sent and the caps already counted this address:
  // correct the record so Ajdin sends the PDF by hand.
  await sendLead({ status: "nicht-versendet", grund: VERSAND_FEHLER_GRUND });
  return { status: "error", message: FORM_ERRORS.generic };
}
