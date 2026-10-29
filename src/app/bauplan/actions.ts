"use server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resend } from "resend";
import { isContactConfigured, contactFrom, contactTo, resendKey } from "@/lib/contact";
import { evaluateBauplanRequest, bauplanAttachmentName, bauplanPdfPath } from "@/lib/bauplanEmail";
import { normalizeSource } from "@/lib/source";
import { siteUrl } from "@/lib/site";
import { bauplanVariant } from "@/lib/bauplan";

export type BauplanEmailState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; email?: string }
  | { status: "invalid"; error: string; email?: string };

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

// The PDF is attached as bytes, never as a URL: Resend would fetch a URL
// asynchronously and mark the mail failed while the UI shows success.
async function loadPdf(pdfPath: string, pdfUrl: string): Promise<Buffer | undefined> {
  try {
    return await readFile(join(process.cwd(), "public", pdfPath));
  } catch (err) {
    console.error("[bauplan] PDF read from disk failed, trying fetch:", err);
  }
  try {
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error("[bauplan] PDF fetch fallback failed:", err);
    return undefined;
  }
}

export async function submitBauplanRequest(
  _prev: BauplanEmailState,
  formData: FormData,
): Promise<BauplanEmailState> {
  const get = (k: string) => String(formData.get(k) ?? "");
  const email = get("email");
  // The code picks the variant; without a valid one the request is refused below.
  const variant = bauplanVariant(get("code"));
  const pdfPath = bauplanPdfPath(variant ?? "agentur");
  const pdfUrl = `${siteUrl}${pdfPath}`;
  const decision = evaluateBauplanRequest(
    {
      email,
      honeypot: get("website"),
      renderedAt: Number(get("renderedAt")) || 0,
      source: normalizeSource(get("src")),
    },
    Date.now(),
    pdfUrl,
    variant ?? "agentur",
  );

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message, email };
  if (decision.action === "invalid") return { status: "invalid", error: decision.error, email };

  // A rotated code retires open pages: the action refuses without a valid code.
  if (!variant) return { status: "error", message: GENERIC_ERROR, email };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt.", email };
  }

  const pdf = await loadPdf(pdfPath, pdfUrl);
  if (!pdf) return { status: "error", message: GENERIC_ERROR, email };

  try {
    const resend = new Resend(resendKey());
    const reader = await resend.emails.send({
      from: contactFrom()!,
      to: decision.readerEmail.to,
      subject: decision.readerEmail.subject,
      html: decision.readerEmail.html,
      text: decision.readerEmail.text,
      replyTo: contactTo()!,
      attachments: [{ filename: bauplanAttachmentName(variant), content: pdf }],
    });
    if (reader.error) {
      console.error("[bauplan] reader mail failed:", reader.error);
      return { status: "error", message: GENERIC_ERROR, email };
    }
    try {
      const internal = await resend.emails.send({
        from: contactFrom()!,
        to: contactTo()!,
        replyTo: decision.internalEmail.replyTo,
        subject: decision.internalEmail.subject,
        html: decision.internalEmail.html,
        text: decision.internalEmail.text,
      });
      if (internal.error) console.error("[bauplan] internal mail failed:", internal.error);
    } catch (err) {
      // Internal-only failure: the reader already has the PDF.
      console.error("[bauplan] internal mail threw:", err);
    }
    return { status: "ok" };
  } catch (err) {
    console.error("[bauplan] reader mail threw:", err);
    return { status: "error", message: GENERIC_ERROR, email };
  }
}
