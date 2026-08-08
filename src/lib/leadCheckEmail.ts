// src/lib/leadCheckEmail.ts
import { EMAIL_RE, isHoneypotTripped, isTooFast } from "./contact";
import {
  computeResult,
  type LeadCheckAnswers,
  type LeadCheckResult,
  type Reaktionszeit,
  type AbendsWochenende,
  type ImTermin,
  type Nachfassen,
} from "./leadCheck";

export function validateLeadCheckEmail(email: string): string | undefined {
  if (!EMAIL_RE.test(email.trim())) return "Bitte gib eine gültige E-Mail-Adresse an.";
  return undefined;
}

const nf = new Intl.NumberFormat("de-DE");
const NBSP = "\u00A0";
const eurFmt = (n: number) => `${nf.format(n)}${NBSP}€`;

const SCORE_LABEL: Record<LeadCheckResult["score"], string> = {
  schnell: "schnell",
  solide: "solide",
  langsam: "langsam",
};

// Shared inline-style snippets (mirror src/lib/email/newsletter-confirm.ts)
const BODY_STYLE = "margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b";
const SERIF = "font-family:Georgia,'Times New Roman',serif";

export type LeadSummaryEmail = { to: string; subject: string; html: string; text: string };

// The summary the lead asked for on /lead-check. Copy mirrors Result.tsx —
// including its honesty rule: a "schnell" score gets no € promise. The only
// link is the Cal booking URL (never a site link while the site lives on
// *.vercel.app).
export function buildLeadSummaryEmail(p: {
  email: string;
  result: LeadCheckResult;
  calUrl?: string;
}): LeadSummaryEmail {
  const { result, calUrl } = p;
  const fast = result.score === "schnell";
  const subject = "Dein Ergebnis: Lead-Reaktions-Check";

  const heroHtml = fast
    ? `<p style="${SERIF};text-align:center;font-size:25px;line-height:1.35;color:#0a2538;margin:0 0 6px">Du reagierst schon schnell.</p>
<p style="text-align:center;font-size:14px;margin:0 0 18px">Dann geht es bei der Termin-Quelle eher darum, dass das so bleibt – auch wenn mehr reinkommt.</p>`
    : `<p style="${SERIF};text-align:center;font-size:25px;line-height:1.35;color:#0a2538;margin:0 0 6px">Rund <strong>${result.zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr</strong> – ca. <strong>${eurFmt(result.eurUpside)}</strong>.</p>
<p style="text-align:center;font-size:14px;margin:0 0 18px">Mit einer Antwort in unter 5 Minuten. Ohne eine einzige neue Anfrage.</p>`;

  const contextHtml = fast
    ? ""
    : `<p style="font-size:14.5px;line-height:1.6;margin:0 0 8px">Aktuell werden rund ${result.currentLossPct}${NBSP}% deiner Anfragen kalt, bevor daraus ein Termin wird – das sind ca. ${nf.format(result.verloreneAnfragenProJahr)} im Jahr.</p>
<p style="font-size:12.5px;color:#696359;margin:0 0 22px">${
        result.provisionWasDefault
          ? `Gerechnet mit ${eurFmt(result.provisionUsed)} pro Abschluss – dem Branchenschnitt.`
          : `Gerechnet mit ${eurFmt(result.provisionUsed)} pro Abschluss.`
      }</p>`;

  const tipsHeading = fast ? "Drei Dinge, die dein Tempo absichern" : "Drei Dinge, die du sofort tun kannst";

  const ctaInner = calUrl
    ? `<a href="${calUrl}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px">15-Minuten-Gespräch buchen</a>`
    : `<span style="color:#f4efe6;font-size:14px">Antworte einfach auf diese E-Mail – dann melde ich mich.</span>`;

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <p style="text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#696359;margin:0 0 14px">Deine Lead-Reaktion: <b style="color:#0a2538">${SCORE_LABEL[result.score]}</b></p>
      ${heroHtml}
      <div style="width:44px;height:3px;background:#d4a24c;margin:0 auto 22px"></div>
      ${contextHtml}
      <div style="background:#ece3d2;border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.6;margin:0 0 22px"><strong>Wie wir rechnen:</strong> Grundlage ist die Lead-Response-Forschung (HBR/InsideSales) – nach der Fünf-Minuten-Marke fällt die Chance, einen Lead zu erreichen, um rund das Acht- bis Zehnfache. Wir rechnen bewusst konservativ, und selbst dann, wenn nur jeder fünfte zurückgeholte Termin zum Abschluss wird.</div>
      <p style="font-size:15px;font-weight:bold;color:#0a2538;margin:0 0 8px">${tipsHeading}</p>
      <ul style="margin:0 0 8px;padding-left:20px;font-size:14.5px;line-height:1.6">
        <li style="margin-bottom:4px">Eine feste Fünf-Minuten-Regel für neue Anfragen.</li>
        <li style="margin-bottom:4px">Eine einfache Auto-Antwort, die sofort bestätigt.</li>
        <li>Eine feste Nachfass-Routine für alle, die sich nicht melden.</li>
      </ul>
      <p style="font-size:12.5px;color:#696359;margin:0 0 24px">Das Schwere ist, das <strong>konsequent</strong> zu tun – nachts, im Termin, bei jeder Anfrage.</p>
      <div style="background:#1b5063;border-radius:12px;padding:24px 22px;text-align:center;margin:0 0 26px">
        <p style="${SERIF};color:#f4efe6;font-size:17px;line-height:1.45;margin:0 0 16px">Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die Termin-Quelle.</p>
        ${ctaInner}
      </div>
      <p style="font-size:14.5px;line-height:1.6;margin:0 0 24px">Bis bald<br>Ajdin von <em style="${SERIF};font-style:italic">Vrelo</em></p>
      <hr style="border:none;border-top:1px solid #e3dccc;margin:0 0 14px" />
      <p style="font-size:12px;color:#696359;margin:0">Du bekommst diese E-Mail einmalig, weil du dir die Zusammenfassung deines Lead-Reaktions-Checks schicken lassen hast.</p>
    </div>
  </body>
</html>`;

  const textLines = [
    `Deine Lead-Reaktion: ${SCORE_LABEL[result.score]}`,
    "",
    ...(fast
      ? [
          "Du reagierst schon schnell.",
          "Dann geht es bei der Termin-Quelle eher darum, dass das so bleibt – auch wenn mehr reinkommt.",
        ]
      : [
          `Rund ${result.zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr – ca. ${nf.format(result.eurUpside)} €.`,
          "Mit einer Antwort in unter 5 Minuten. Ohne eine einzige neue Anfrage.",
          "",
          `Aktuell werden rund ${result.currentLossPct} % deiner Anfragen kalt, bevor daraus ein Termin wird – das sind ca. ${nf.format(result.verloreneAnfragenProJahr)} im Jahr.`,
          result.provisionWasDefault
            ? `Gerechnet mit ${nf.format(result.provisionUsed)} € pro Abschluss – dem Branchenschnitt.`
            : `Gerechnet mit ${nf.format(result.provisionUsed)} € pro Abschluss.`,
        ]),
    "",
    "Wie wir rechnen: Grundlage ist die Lead-Response-Forschung (HBR/InsideSales) – nach der Fünf-Minuten-Marke fällt die Chance, einen Lead zu erreichen, um rund das Acht- bis Zehnfache. Wir rechnen bewusst konservativ, und selbst dann, wenn nur jeder fünfte zurückgeholte Termin zum Abschluss wird.",
    "",
    `${tipsHeading}:`,
    "- Eine feste Fünf-Minuten-Regel für neue Anfragen.",
    "- Eine einfache Auto-Antwort, die sofort bestätigt.",
    "- Eine feste Nachfass-Routine für alle, die sich nicht melden.",
    "Das Schwere ist, das konsequent zu tun – nachts, im Termin, bei jeder Anfrage.",
    "",
    "Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die Termin-Quelle.",
    calUrl ? `15-Minuten-Gespräch buchen: ${calUrl}` : "Antworte einfach auf diese E-Mail – dann melde ich mich.",
    "",
    "Bis bald",
    "Ajdin von Vrelo",
    "",
    "Du bekommst diese E-Mail einmalig, weil du dir die Zusammenfassung deines Lead-Reaktions-Checks schicken lassen hast.",
  ];

  return { to: p.email.trim(), subject, html, text: textLines.join("\n") };
}

const REAKTIONSZEIT_LABEL: Record<Reaktionszeit, string> = {
  unter5min: "unter 5 Minuten",
  unter1std: "unter 1 Stunde",
  selberTag: "am selben Tag",
  "1bis2tage": "1–2 Tage",
  wennZeit: "wenn ich dazu komme",
};
const ABENDS_LABEL: Record<AbendsWochenende, string> = { immer: "immer", manchmal: "manchmal", nein: "nein" };
const TERMIN_LABEL: Record<ImTermin, string> = {
  automatisch: "wird automatisch beantwortet",
  wartet: "wartet, bis ich Zeit habe",
  gehtUnter: "geht manchmal unter",
};
const NACHFASS_LABEL: Record<Nachfassen, string> = {
  mehrmals: "mehrmals, systematisch",
  einmal: "einmal",
  selten: "selten",
  nie: "nie",
};

// The lead's address is the only user-controlled string that reaches HTML.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type LeadCheckEmail = { subject: string; text: string; html: string; replyTo: string };

export function buildLeadCheckEmail(p: {
  email: string;
  answers: LeadCheckAnswers;
  result: LeadCheckResult;
}): LeadCheckEmail {
  const { answers, result } = p;
  const email = p.email.trim();
  const fast = result.score === "schnell";
  const subject = `Lead-Check: ${email} – ${SCORE_LABEL[result.score]}${fast ? "" : ` · ${nf.format(result.eurUpside)} €`}`;

  const rows: Array<[string, string]> = [
    ["E-Mail", escapeHtml(email)],
    ["Anfragen/Woche", String(answers.anfragenProWoche)],
    ["Reaktionszeit", REAKTIONSZEIT_LABEL[answers.reaktionszeit]],
    ["Abends/Wochenende", ABENDS_LABEL[answers.abendsWochenende]],
    ["Im Termin", TERMIN_LABEL[answers.imTermin]],
    ["Nachfassen", NACHFASS_LABEL[answers.nachfassen]],
    ["Provision", `${eurFmt(result.provisionUsed)}${result.provisionWasDefault ? " (Standard)" : ""}`],
    ["Verlorene Anfragen/Jahr", `≈ ${nf.format(result.verloreneAnfragenProJahr)}`],
    ["Zusätzliche Abschlüsse/Jahr", `≈ ${nf.format(result.zusaetzlicheAbschluesse)}`],
  ];

  const kpiCell = (n: string, l: string, main = false) =>
    `<td style="width:33%;background:${main ? "#0a2538" : "#ece3d2"};border-radius:8px;padding:12px 8px;text-align:center"><span style="${SERIF};display:block;font-size:${main ? "22px" : "20px"};color:${main ? "#d4a24c" : "#0a2538"}">${n}</span><span style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${main ? "#dce7eb" : "#696359"}">${l}</span></td>`;

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:6px 0;margin:0 0 18px"><tr>
        ${kpiCell(eurFmt(result.eurUpside), "Potenzial/Jahr", true)}
        ${kpiCell(SCORE_LABEL[result.score], "Score")}
        ${kpiCell(`${result.currentLossPct}${NBSP}%`, "Verlust aktuell")}
      </tr></table>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;color:#696359;width:46%">${k}</td><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;font-weight:bold">${v}</td></tr>`,
          )
          .join("\n        ")}
      </table>
      <p style="font-size:12.5px;color:#696359;margin:18px 0 0">Der Lead hat seine Zusammenfassung bereits automatisch bekommen. Auf ‚Antworten‘ schreibst du ihm direkt.</p>
    </div>
  </body>
</html>`;

  const lines = [
    `E-Mail: ${email}`,
    "",
    "Antworten:",
    `Anfragen/Woche: ${answers.anfragenProWoche}`,
    `Reaktionszeit: ${REAKTIONSZEIT_LABEL[answers.reaktionszeit]}`,
    `Abends/Wochenende: ${ABENDS_LABEL[answers.abendsWochenende]}`,
    `Im Termin: ${TERMIN_LABEL[answers.imTermin]}`,
    `Nachfassen: ${NACHFASS_LABEL[answers.nachfassen]}`,
    `Provision: ${nf.format(result.provisionUsed)} €${result.provisionWasDefault ? " (Standard)" : ""}`,
    "",
    "Ergebnis:",
    `Score: ${SCORE_LABEL[result.score]}`,
    `Aktueller Verlust: ${result.currentLossPct} %`,
    `Verlorene Anfragen/Jahr: ${nf.format(result.verloreneAnfragenProJahr)}`,
    `Zusätzliche Abschlüsse/Jahr: ${nf.format(result.zusaetzlicheAbschluesse)}`,
    `Euro-Potenzial/Jahr: ${nf.format(result.eurUpside)} €`,
  ];

  return { subject, text: lines.join("\n"), html, replyTo: email };
}

export type LeadCheckFields = {
  email: string;
  honeypot: string;
  renderedAt: number;
  answers: LeadCheckAnswers;
};

export type LeadCheckDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; error: string }
  | { action: "send"; leadEmail: LeadSummaryEmail; internalEmail: LeadCheckEmail };

export function evaluateLeadCheckSubmission(
  f: LeadCheckFields,
  now: number,
  calUrl?: string,
): LeadCheckDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const emailErr = validateLeadCheckEmail(f.email);
  if (emailErr) return { action: "invalid", error: emailErr };
  const result = computeResult(f.answers);
  return {
    action: "send",
    leadEmail: buildLeadSummaryEmail({ email: f.email, result, calUrl }),
    internalEmail: buildLeadCheckEmail({ email: f.email, answers: f.answers, result }),
  };
}
