// src/lib/bauplanEmail.ts
// Decision logic for the unlisted Bauplan page: the reader gets the PDF
// (attached and linked), Ajdin gets a short notification. No CTA, no ask.
import { EMAIL_RE, isHoneypotTripped, isTooFast } from "./contact";
import { sourceLabel } from "./source";
import type { BauplanVariant } from "./bauplan";

// Rendered by `npm run bauplan:pdf`; every re-render gets a new hash, so update this line with it.
export const BAUPLAN_PDF_PATH = "/bauplan/agentur-bauplan-52a16b4f.pdf";
// Published by `npm run bauplan:elektro -- --publish`; update this line with the name it prints.
export const ELEKTRO_BAUPLAN_PDF_PATH = "/bauplan/elektro-bauplan-20dad2a7.pdf";

type VariantMail = {
  pdfPath: string;
  attachmentName: string;
  label: string;
  readerSubject: string;
  // The sentence before the download link, then the closing paragraph.
  readerLead: string;
  readerClose: string;
  internalPrefix: string;
};

const READER_LEAD = "der Bauplan hängt als PDF an dieser Mail. Falls der Anhang nicht ankommt, lädst du ihn hier:";

const MAIL: Record<BauplanVariant, VariantMail> = {
  agentur: {
    pdfPath: BAUPLAN_PDF_PATH,
    attachmentName: "Vrelo-Bauplan-Agenturen.pdf",
    label: "Agenturen",
    readerSubject: "Dein Bauplan für Agenturen",
    readerLead: READER_LEAD,
    readerClose:
      "Du findest darin die Grundsätze für den Aufbau einer Phase und leere Seiten für die Phasen deiner eigenen Agentur. Trag deinen Ablauf direkt in die leeren Seiten ein.",
    internalPrefix: "Bauplan angefordert",
  },
  elektro: {
    pdfPath: ELEKTRO_BAUPLAN_PDF_PATH,
    attachmentName: "Vrelo-Bauplan-Elektrobetriebe.pdf",
    label: "Elektrobetriebe",
    readerSubject: "Dein Bauplan für Elektrobetriebe",
    readerLead: READER_LEAD,
    readerClose: "Fang mit der Stufe an, die dich heute am meisten Zeit kostet. Zu jeder Stufe steht drin, wie du vorgehst.",
    internalPrefix: "Elektro-Bauplan angefordert",
  },
};

export function bauplanPdfPath(v: BauplanVariant): string {
  return MAIL[v].pdfPath;
}

export function bauplanAttachmentName(v: BauplanVariant): string {
  return MAIL[v].attachmentName;
}

export type BauplanFields = { email: string; honeypot: string; renderedAt: number; source?: string };

export type BauplanDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; error: string }
  | {
      action: "send";
      readerEmail: { to: string; subject: string; html: string; text: string; pdfUrl: string };
      internalEmail: { subject: string; text: string; html: string; replyTo: string };
    };

const BODY_STYLE = "margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildReaderEmail(email: string, pdfUrl: string, m: VariantMail) {
  const subject = m.readerSubject;

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto;font-size:15px;line-height:1.6">
      <p style="margin:0 0 14px">Hallo,</p>
      <p style="margin:0 0 14px">${m.readerLead} <a href="${escapeHtml(pdfUrl)}" style="color:#1b5063">${escapeHtml(pdfUrl)}</a></p>
      <p style="margin:0 0 14px">${m.readerClose}</p>
      <p style="margin:0">Ajdin Dzafic</p>
    </div>
  </body>
</html>`;

  const text = ["Hallo,", "", m.readerLead, pdfUrl, "", m.readerClose, "", "Ajdin Dzafic"].join("\n");
  return { to: email, subject, html, text, pdfUrl };
}

function buildInternalEmail(email: string, source: string | undefined, now: number, m: VariantMail) {
  const quelle = sourceLabel(source);
  const when = new Date(now).toISOString();
  const subject = `${m.internalPrefix}: ${email}`;
  const text = [`E-Mail: ${email}`, `Bauplan: ${m.label}`, `Quelle: ${quelle}`, `Zeitpunkt: ${when}`].join("\n");
  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto;font-size:14px;line-height:1.6">
      <p style="margin:0 0 6px"><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 6px"><strong>Bauplan:</strong> ${m.label}</p>
      <p style="margin:0 0 6px"><strong>Quelle:</strong> ${escapeHtml(quelle)}</p>
      <p style="margin:0"><strong>Zeitpunkt:</strong> ${when}</p>
    </div>
  </body>
</html>`;
  return { subject, text, html, replyTo: email };
}

export function evaluateBauplanRequest(
  f: BauplanFields,
  now: number,
  pdfUrl: string,
  variant: BauplanVariant = "agentur",
): BauplanDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const email = f.email.trim();
  if (!EMAIL_RE.test(email)) return { action: "invalid", error: "Bitte gib eine gültige E-Mail-Adresse an." };
  return {
    action: "send",
    readerEmail: buildReaderEmail(email, pdfUrl, MAIL[variant]),
    internalEmail: buildInternalEmail(email, f.source, now, MAIL[variant]),
  };
}
