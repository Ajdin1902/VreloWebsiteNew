// src/lib/prozessCheckEmail.ts
// Email layer for /prozess-check. Mirrors leadCheckEmail.ts: a branded summary to
// the visitor (their hours + profile, no €, only the Cal URL as a link) and an
// internal notification so Ajdin walks into the call already knowing the profile.
import { EMAIL_RE, isHoneypotTripped, isTooFast } from "./contact";
import {
  resultCopy,
  totalHours,
  rankAreas,
  AREA_LABEL,
  type ProzessCheckAnswers,
  type Branche,
  type Team,
  type AreaId,
  type Abende,
  type Versucht,
} from "./prozessCheck";

export function validateEmail(email: string): string | undefined {
  if (!EMAIL_RE.test(email.trim())) return "Bitte gib eine gültige E-Mail-Adresse an.";
  return undefined;
}

const nf = new Intl.NumberFormat("de-DE");
const BODY_STYLE = "margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b";
const SERIF = "font-family:Georgia,'Times New Roman',serif";

function hoursLabel(n: number): string {
  return n === 1 ? "1 Stunde" : `${nf.format(n)} Stunden`;
}

export type SummaryEmail = { to: string; subject: string; html: string; text: string };

export function buildSummaryEmail(p: {
  email: string;
  answers: ProzessCheckAnswers;
  calUrl?: string;
}): SummaryEmail {
  const { answers, calUrl } = p;
  const r = resultCopy(answers);
  const subject = "Dein Ergebnis: der Prozess-Check";

  const profileHtml = r.topAreas
    .map(
      (a) =>
        `<tr><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;font-weight:bold;width:60%">${a.label}</td><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;color:#696359;text-align:right">${hoursLabel(a.hours)}/Woche</td></tr>`,
    )
    .join("\n        ");

  const ctaInner = calUrl
    ? `<a href="${calUrl}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px">30-Minuten-Gespräch buchen</a>`
    : `<span style="color:#f4efe6;font-size:14px">Antworte einfach auf diese E-Mail. Dann melde ich mich.</span>`;

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <p style="text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#696359;margin:0 0 14px">Dein Prozess-Check</p>
      <p style="${SERIF};text-align:center;font-size:24px;line-height:1.35;color:#0a2538;margin:0 0 6px">Rund <strong>${hoursLabel(r.totalHours)} pro Woche</strong> gehen in Aufgaben, die sich wiederholen.</p>
      <p style="text-align:center;font-size:14px;margin:0 0 18px">Gerechnet aus deinen eigenen Angaben.</p>
      <div style="width:44px;height:3px;background:#d4a24c;margin:0 auto 22px"></div>
      <p style="font-size:15px;font-weight:bold;color:#0a2538;margin:0 0 8px">Wo deine Zeit hingeht</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px;margin:0 0 22px">
        ${profileHtml}
      </table>
      <div style="background:#1b5063;border-radius:12px;padding:24px 22px;text-align:center;margin:0 0 26px">
        <p style="${SERIF};color:#f4efe6;font-size:17px;line-height:1.45;margin:0 0 16px">Lass uns 30 Minuten drüber sprechen. Wenn sich etwas lohnt, bekommst du danach einen Fahrplan von mir, und er gehört dir.</p>
        ${ctaInner}
      </div>
      <p style="font-size:14.5px;line-height:1.6;margin:0 0 24px">Bis bald<br>Ajdin von <em style="${SERIF};font-style:italic">Vrelo</em></p>
      <hr style="border:none;border-top:1px solid #e3dccc;margin:0 0 14px" />
      <p style="font-size:12px;color:#696359;margin:0">Du bekommst diese E-Mail einmalig, weil du dir dein Prozess-Check-Ergebnis hast schicken lassen.</p>
    </div>
  </body>
</html>`;

  const textLines = [
    "Dein Prozess-Check",
    "",
    `Rund ${hoursLabel(r.totalHours)} pro Woche gehen in Aufgaben, die sich wiederholen.`,
    "Gerechnet aus deinen eigenen Angaben.",
    "",
    "Wo deine Zeit hingeht:",
    ...r.topAreas.map((a) => `- ${a.label}: ${hoursLabel(a.hours)}/Woche`),
    "",
    "Lass uns 30 Minuten drüber sprechen. Wenn sich etwas lohnt, bekommst du danach einen Fahrplan von mir, und er gehört dir.",
    calUrl ? `30-Minuten-Gespräch buchen: ${calUrl}` : "Antworte einfach auf diese E-Mail. Dann melde ich mich.",
    "",
    "Bis bald",
    "Ajdin von Vrelo",
    "",
    "Du bekommst diese E-Mail einmalig, weil du dir dein Prozess-Check-Ergebnis hast schicken lassen.",
  ];

  return { to: p.email.trim(), subject, html, text: textLines.join("\n") };
}

const BRANCHE_LABEL: Record<Branche, string> = {
  handwerk: "Handwerk",
  immobilien: "Immobilien",
  reinigung: "Reinigung/Dienstleistung",
  praxis: "Praxis/Kanzlei",
  handel: "Handel",
  anderes: "Etwas anderes",
};
const TEAM_LABEL: Record<Team, string> = {
  allein: "Ich allein",
  "2bis5": "2 bis 5",
  "6bis20": "6 bis 20",
  ueber20: "Mehr als 20",
};
const ABENDE_LABEL: Record<Abende, string> = {
  staendig: "regelmäßig",
  abundzu: "ab und zu",
  nein: "nein",
};
const VERSUCHT_LABEL: Record<Versucht, string> = {
  nichts: "noch nichts",
  toolBrach: "Software gekauft, halb eingerichtet",
  beauftragt: "Freelancer/Agentur beauftragt",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type InternalEmail = { subject: string; text: string; html: string; replyTo: string };

export function buildInternalEmail(p: {
  email: string;
  answers: ProzessCheckAnswers;
  kontaktErlaubt: boolean;
}): InternalEmail {
  const { answers } = p;
  const email = p.email.trim();
  const total = totalHours(answers);
  const ranked = rankAreas(answers);
  const subject = `Prozess-Check: ${email}, ${total} Std./Woche`;

  const hoursRows = ranked
    .map(
      (id: AreaId) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #e3dccc;color:#696359;width:70%">${AREA_LABEL[id]}</td><td style="padding:6px 8px;border-bottom:1px solid #e3dccc;font-weight:bold;text-align:right">${answers.stunden[id] || 0} Std.</td></tr>`,
    )
    .join("\n        ");

  const meta: Array<[string, string]> = [
    ["E-Mail", escapeHtml(email)],
    ["Branche", BRANCHE_LABEL[answers.branche]],
    ["Team", TEAM_LABEL[answers.team]],
    ["Summe", `${total} Std./Woche`],
    ["Nervt am meisten", AREA_LABEL[answers.nervt]],
    ["Abends/Wochenende", ABENDE_LABEL[answers.abende]],
    ["Schon versucht", VERSUCHT_LABEL[answers.versucht]],
    ["Kontakt erlaubt", p.kontaktErlaubt ? "JA" : "NEIN, nicht anschreiben"],
  ];

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <p style="font-size:15px;font-weight:bold;color:#0a2538;margin:0 0 10px">Stunden je Bereich</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px;margin:0 0 18px">
        ${hoursRows}
      </table>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px">
        ${meta
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;color:#696359;width:46%">${k}</td><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;font-weight:bold">${v}</td></tr>`,
          )
          .join("\n        ")}
      </table>
      <p style="font-size:12.5px;color:#696359;margin:18px 0 0">Der Kunde hat seine Auswertung bereits automatisch bekommen.${
        p.kontaktErlaubt ? " Auf ‚Antworten‘ schreibst du ihm direkt." : " <strong>Er hat dem Kontakt nicht zugestimmt. Schreib ihn nicht an.</strong>"
      }</p>
    </div>
  </body>
</html>`;

  const lines = [
    `E-Mail: ${email}`,
    `Branche: ${BRANCHE_LABEL[answers.branche]}`,
    `Team: ${TEAM_LABEL[answers.team]}`,
    `Summe: ${total} Std./Woche`,
    "",
    "Stunden je Bereich:",
    ...ranked.map((id) => `- ${AREA_LABEL[id]}: ${answers.stunden[id] || 0} Std.`),
    "",
    `Nervt am meisten: ${AREA_LABEL[answers.nervt]}`,
    `Abends/Wochenende: ${ABENDE_LABEL[answers.abende]}`,
    `Schon versucht: ${VERSUCHT_LABEL[answers.versucht]}`,
    "",
    `Kontakt erlaubt: ${p.kontaktErlaubt ? "JA" : "NEIN, nicht anschreiben"}`,
  ];

  return { subject, text: lines.join("\n"), html, replyTo: email };
}

export type ProzessCheckFields = {
  email: string;
  honeypot: string;
  renderedAt: number;
  answers: ProzessCheckAnswers;
  kontaktErlaubt: boolean;
};

export type ProzessCheckDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; error: string }
  | { action: "send"; leadEmail: SummaryEmail; internalEmail: InternalEmail };

export function evaluateSubmission(
  f: ProzessCheckFields,
  now: number,
  calUrl?: string,
): ProzessCheckDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const emailErr = validateEmail(f.email);
  if (emailErr) return { action: "invalid", error: emailErr };
  return {
    action: "send",
    leadEmail: buildSummaryEmail({ email: f.email, answers: f.answers, calUrl }),
    internalEmail: buildInternalEmail({ email: f.email, answers: f.answers, kontaktErlaubt: f.kontaktErlaubt }),
  };
}
