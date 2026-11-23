// The two mails of the /prozess-check v2 flow, in the house mail style of
// buildSummaryEmail / newsletter-confirm: the visitor mail that carries the
// Vorab-Fahrplan PDF and the internal lead mail #1 (spec §6, §10).
import { signaturHtml, signaturText } from "@/lib/email/signatur";
import { sourceLabel } from "@/lib/source";
import { AREA_LABEL, STEPS, rankAreas, totalHours, type ParsedAnswers, type StepId } from "@/lib/prozessCheck";
import { CONSENT_TEXT, CONSENT_VERSION } from "./blocks";
import type { VorabFahrplan } from "./content";

// Style constants copied from prozessCheckEmail.ts (Task 8 deletes that file's mail code).
const BODY_STYLE = "margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b";
const SERIF = "font-family:Georgia,'Times New Roman',serif";
// escapeHtml in prozessCheckEmail.ts is private and that file stays untouched (Task 8 deletes it).
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const CELL = "padding:7px 8px;border-bottom:1px solid #e3dccc;vertical-align:top";

// COPY: Ajdin approves before go-live
export const MAIL_UI = {
  label: "Dein Vorab-Fahrplan",
  hallo: "Hallo {vorname}, im Anhang ist dein Vorab-Fahrplan.",
  zuerst: "Zuerst würde ich bei {titel} anfangen.",
  panel: "Ich rufe dich in den nächsten Tagen an, kläre ein paar Details und mache daraus deinen ausführlichen Fahrplan. Kostenlos, er gehört dir.",
  termin: "Lieber gleich einen Termin?",
  button: "Termin buchen",
  gruss: "Bis bald",
  einmalig: "Du bekommst diese E-Mail einmalig, weil du dir deinen Vorab-Fahrplan hast schicken lassen.",
  wasser: "Aus einem Tropfen fließt ein Fluss, aus einer Idee deine Zeit zurück.",
};

export type Mail = { subject: string; html: string; text: string };

export function buildVisitorMail(p: VorabFahrplan, calUrl?: string): Mail {
  const vorname = p.name.trim().split(/\s+/)[0] || p.name;
  const titel = p.schritte[0]?.titel ?? "";
  // "Rund 9 Stunden pro Woche · 52 Arbeitstage im Jahr" -> "rund 9 Stunden pro Woche"
  const stunden = p.stundenZeile.split(" · ")[0].replace(/^R/, "r");
  const headline = `${p.firma}: ${stunden}`;
  const intro = MAIL_UI.hallo.replace("{vorname}", vorname);
  const zuerst = MAIL_UI.zuerst.replace("{titel}", titel);

  const button = calUrl
    ? `<p style="font-size:14.5px;line-height:1.6;margin:0 0 10px;text-align:center">${MAIL_UI.termin}</p>
      <p style="text-align:center;margin:0 0 26px"><a href="${escapeHtml(calUrl)}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px">${MAIL_UI.button}</a></p>`
    : "";

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:520px;margin:0 auto">
      <p style="text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#696359;margin:0 0 14px">${MAIL_UI.label}</p>
      <p style="${SERIF};text-align:center;font-size:24px;line-height:1.35;color:#0a2538;margin:0 0 18px">${escapeHtml(headline)}</p>
      <div style="width:44px;height:3px;background:#d4a24c;margin:0 auto 22px"></div>
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px">${escapeHtml(intro)} ${escapeHtml(zuerst)}</p>
      <div style="background:#1b5063;border-radius:12px;padding:22px;text-align:center;margin:0 0 22px">
        <p style="${SERIF};color:#f4efe6;font-size:17px;line-height:1.45;margin:0">${MAIL_UI.panel}</p>
      </div>
      ${button}
      <p style="font-size:14.5px;line-height:1.6;margin:0 0 14px">${MAIL_UI.gruss}</p>
      ${signaturHtml()}
      <p style="${SERIF};font-style:italic;font-size:14px;line-height:1.6;color:#1b5063;margin:0 0 14px">${MAIL_UI.wasser}</p>
      <hr style="border:none;border-top:1px solid #e3dccc;margin:0 0 14px" />
      <p style="font-size:12px;color:#696359;margin:0">${MAIL_UI.einmalig}</p>
    </div>
  </body>
</html>`;

  const text = [
    MAIL_UI.label.toUpperCase(),
    headline,
    "",
    `${intro} ${zuerst}`,
    "",
    MAIL_UI.panel,
    ...(calUrl ? ["", `${MAIL_UI.termin} ${calUrl}`] : []),
    "",
    MAIL_UI.gruss,
    "",
    ...signaturText(),
    "",
    MAIL_UI.wasser,
    "",
    MAIL_UI.einmalig,
  ].join("\n");

  return { subject: `Dein Vorab-Fahrplan, ${p.firma.replace(/\s+/g, " ")}`, html, text };
}

export type LeadContact = { name: string; firma: string; email: string; telefon: string; anrufOk: boolean };

// Readable label of a choice/aufgabe option from the wizard definition.
function optLabel(step: StepId, value: string): string {
  const s = STEPS.find((x) => x.id === step);
  const opts =
    s && "options" in s ? s.options
    : s && s.kind === "aufgabe" ? [...s.kanaele, ...s.menge, ...s.wer]
    : [];
  return opts.find((o) => o.value === value)?.label ?? value;
}

const berlin = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function buildLeadMail(x: {
  contact: LeadContact;
  answers: ParsedAnswers;
  source?: string;
  submittedAt: Date;
  status: "recherche" | "fallback" | "nicht-versendet";
  grund?: string;
}): Mail & { replyTo: string } {
  const { contact: c, answers: a } = x;
  const statusLine =
    x.status === "recherche"
      ? "Recherche läuft"
      : x.status === "fallback"
        ? `Fallback${x.grund ? `, weil ${x.grund}` : ""}`
        : `Vorab-Fahrplan nicht versendet${x.grund ? `, Grund: ${x.grund}` : ""}`;
  const areas = rankAreas(a).map((id) => `${AREA_LABEL[id]}: ${a.stunden[id] || 0} Std.`);
  const kanaele = a.kanaele.map((k) => optLabel("aufgabe", k)).join(", ") || "-";
  const programme = a.programme.join(", ") || "-";

  // [label, raw value]; raw values are escaped once, in html only.
  const rows: Array<[string, string]> = [
    ["Name", c.name],
    ["Firma", c.firma],
    ["E-Mail", c.email],
    ["Telefon", c.telefon],
    ["Anruf erlaubt", c.anrufOk ? "Ja" : "Nein, nur eine Mail"],
    ["Stunden je Bereich", areas.join("\n")],
    ["Summe", `${totalHours(a)} Std./Woche`],
    ["Nervt am meisten", AREA_LABEL[a.nervt]],
    ["Kommt rein", kanaele],
    ["Menge", optLabel("aufgabe", a.menge)],
    ["Wer macht das", optLabel("aufgabe", a.wer)],
    ["Programme", programme],
    ["Arbeitstag", a.arbeitstag || "-"],
    ["Abends/Wochenende", optLabel("abende", a.abende)],
    ["Schon versucht", optLabel("versucht", a.versucht)],
    ["Branche", optLabel("branche", a.branche)],
    ["Team", optLabel("team", a.team)],
    ["Arbeitsort", optLabel("arbeitsort", a.arbeitsort)],
    ["Website", a.website || "-"],
    ["Einwilligung", CONSENT_TEXT],
    ["Textversion", CONSENT_VERSION],
    ["Zeitpunkt (Server)", berlin.format(x.submittedAt)],
    ["Quelle", sourceLabel(x.source)],
    ["Status", statusLine],
  ];

  const tr = ([k, v]: [string, string]) =>
    `<tr><td style="${CELL};color:#696359;width:34%">${k}</td><td style="${CELL};font-weight:bold">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`;
  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:520px;margin:0 auto">
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px">
        ${rows.map(tr).join("\n        ")}
      </table>
      <p style="font-size:12.5px;color:#696359;margin:18px 0 0">Auf „Antworten“ schreibst du ${escapeHtml(c.name)} direkt.</p>
    </div>
  </body>
</html>`;

  const text = rows.map(([k, v]) => `${k}: ${v.includes("\n") ? `\n${v}` : v}`).join("\n");

  return {
    subject: `Neuer Lead: ${c.firma.replace(/\s+/g, " ")} · ${AREA_LABEL[a.nervt]}`,
    html,
    text,
    replyTo: c.email,
  };
}
