// src/lib/bauplanEmail.ts
// Decision logic for the unlisted Bauplan page: the reader gets the PDF
// (attached and linked), Ajdin gets a short notification. No CTA, no ask.
import { EMAIL_RE, isHoneypotTripped, isTooFast } from "./contact";
import { sourceLabel } from "./source";

export const BAUPLAN_PDF_PATH = "/bauplan/agentur-bauplan.pdf"; // final hashed name set in Task 7

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

function buildReaderEmail(email: string, pdfUrl: string) {
  const subject = "Dein Bauplan für Agenturen";
  const p1 = "der Bauplan hängt als PDF an dieser Mail.";
  const p2 = "Falls der Anhang nicht ankommt, lädst du ihn hier:";
  const p3 = "Du findest darin die Grundsätze für den Aufbau einer Phase und leere Seiten für die Phasen deiner eigenen Agentur.";
  const p4 = "Trag deinen Ablauf direkt in die leeren Seiten ein.";

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto;font-size:15px;line-height:1.6">
      <p style="margin:0 0 14px">Hallo,</p>
      <p style="margin:0 0 14px">${p1} ${p2} <a href="${escapeHtml(pdfUrl)}" style="color:#1b5063">${escapeHtml(pdfUrl)}</a></p>
      <p style="margin:0 0 14px">${p3} ${p4}</p>
      <p style="margin:0">Ajdin Dzafic</p>
    </div>
  </body>
</html>`;

  const text = ["Hallo,", "", `${p1} ${p2}`, pdfUrl, "", `${p3} ${p4}`, "", "Ajdin Dzafic"].join("\n");
  return { to: email, subject, html, text, pdfUrl };
}

function buildInternalEmail(email: string, source: string | undefined, now: number) {
  const quelle = sourceLabel(source);
  const when = new Date(now).toISOString();
  const subject = `Bauplan angefordert: ${email}`;
  const text = [`E-Mail: ${email}`, `Quelle: ${quelle}`, `Zeitpunkt: ${when}`].join("\n");
  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto;font-size:14px;line-height:1.6">
      <p style="margin:0 0 6px"><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 6px"><strong>Quelle:</strong> ${escapeHtml(quelle)}</p>
      <p style="margin:0"><strong>Zeitpunkt:</strong> ${when}</p>
    </div>
  </body>
</html>`;
  return { subject, text, html, replyTo: email };
}

export function evaluateBauplanRequest(f: BauplanFields, now: number, pdfUrl: string): BauplanDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const email = f.email.trim();
  if (!EMAIL_RE.test(email)) return { action: "invalid", error: "Bitte gib eine gültige E-Mail-Adresse an." };
  return {
    action: "send",
    readerEmail: buildReaderEmail(email, pdfUrl),
    internalEmail: buildInternalEmail(email, f.source, now),
  };
}
