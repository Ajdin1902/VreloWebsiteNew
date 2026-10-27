"use server";

import { Resend } from "resend";
import { isContactConfigured, contactFrom, contactTo, resendKey } from "@/lib/contact";
import { evaluateBauplanRequest, BAUPLAN_PDF_PATH } from "@/lib/bauplanEmail";
import { normalizeSource } from "@/lib/source";
import { siteUrl } from "@/lib/site";

export type BauplanEmailState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; error: string };

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

export async function submitBauplanRequest(
  _prev: BauplanEmailState,
  formData: FormData,
): Promise<BauplanEmailState> {
  const get = (k: string) => String(formData.get(k) ?? "");
  const pdfUrl = `${siteUrl}${BAUPLAN_PDF_PATH}`;
  const decision = evaluateBauplanRequest(
    {
      email: get("email"),
      honeypot: get("website"),
      renderedAt: Number(get("renderedAt")) || 0,
      source: normalizeSource(get("src")),
    },
    Date.now(),
    pdfUrl,
  );

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", error: decision.error };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
    const reader = await resend.emails.send({
      from: contactFrom()!,
      to: decision.readerEmail.to,
      subject: decision.readerEmail.subject,
      html: decision.readerEmail.html,
      text: decision.readerEmail.text,
      attachments: [{ filename: "Vrelo-Bauplan-Agenturen.pdf", path: decision.readerEmail.pdfUrl }],
    });
    if (reader.error) return { status: "error", message: GENERIC_ERROR };
    try {
      await resend.emails.send({
        from: contactFrom()!,
        to: contactTo()!,
        replyTo: decision.internalEmail.replyTo,
        subject: decision.internalEmail.subject,
        html: decision.internalEmail.html,
        text: decision.internalEmail.text,
      });
    } catch {
      // Internal-only failure: the reader already has the PDF.
    }
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}
