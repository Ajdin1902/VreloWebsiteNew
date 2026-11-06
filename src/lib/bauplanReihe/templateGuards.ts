// Series guards for the Bauplan-Reihe PDF templates. One function so every niche's
// test is a single line; it returns problems ("<kind>: <detail>"), [] means clean.
// Spec: docs/superpowers/specs/2026-11-06-bauplan-reihe-design.md (§2, §4, §6).
import { readFileSync } from "node:fs";
import { findCopyIssues } from "../ratgeberCopy";
import { partHeadings, templateText } from "../bauplanTemplateText";
import type { ReiheNische } from "./index";
import { LEVELS, abschluss, abschlussHref, selbstcheck } from "./shared";

/** The six chapter titles after the cover, in skeleton order. */
export const KAPITEL = [
  "Wo du stehst",
  "Deine Werkzeuge und Datenwege",
  "Das Fundament",
  "Die erste Station, Schritt für Schritt",
  "Die nächsten Stockwerke",
  abschluss.heading,
];

// Tool names a template may mention. A sentence with "Schnittstelle" may only name the
// niche's verifiedInterfaces. shortcut: hand-kept list, add each niche's tools when it is written.
const REIHE_TOOLS = [
  "HERO", "ToolTime", "Craftboxx", "Label", "pds", "TAIFUN", "openHandwerk", "STREIT",
  "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Excel", "Outlook",
  "WhatsApp", "Telegram", "Microsoft Teams",
  "GC-GRUPPE", "Richter+Frenzel", "Pfeiffer & May",
  "IDS Connect", "Open Masterdata", "DATANORM", "UGL", "ZUGFeRD", "OCI", "SHK-Connect",
];

const CLIENTS = /\b(Schmid|Zilk|M1|Velp|MDZ|Power-Connect|Purisic|Winter)\b|Göcze/;
const PRICE = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;
const DURATION = /\bin\s+\d+\s+(Tagen|Wochen|Monaten)\b/i;
// Pages before the close are a free guide: no first-person service offer (Elektro rule).
const FIRST_PERSON =
  /\b[Ii]ch\b|\b[Mm]it mir\b|\bohne mich\b|binde ich|richte ich|baue ich|wir zusammen|prüfen wir|klären wir|schauen wir|nehmen wir|legen wir|Wenn du magst/;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const names = (tool: string, sentence: string) =>
  new RegExp(`(?<![\\p{L}\\d])${escape(tool)}(?![\\p{L}\\d])`, "iu").test(sentence);

export function checkReiheTemplate(n: ReiheNische, html: string = readFileSync(n.template, "utf8")): string[] {
  const out: string[] = [];
  const text = templateText(html).replace(/\s+/g, " ");

  const nonAscii = html.match(/[^\x00-\x7F]/);
  if (nonAscii) out.push(`non-ascii: ${JSON.stringify(nonAscii[0])}`);
  for (const e of text.match(/&#?\w+;/g) ?? []) out.push(`entity: ${e} is not in ENTITIES`);
  for (const i of findCopyIssues(text)) out.push(`copy: ${i.kind}: ${i.detail}`);

  const pages = (html.match(/<section class="page/g) ?? []).length;
  if (pages !== n.pages) out.push(`pages: ${pages} sections, expected ${n.pages}`);

  const headings = partHeadings(html);
  if (JSON.stringify(headings) !== JSON.stringify(KAPITEL)) out.push(`headings: ${JSON.stringify(headings)}`);

  const verbatim = [
    n.kicker, n.title, n.schmerz, ...n.inhalt,
    selbstcheck.heading, selbstcheck.intro, ...selbstcheck.spalten, selbstcheck.fundamentFrage, selbstcheck.blankHinweis,
    ...LEVELS.flatMap((l) => [l.name, l.satz]),
    abschluss.heading, ...abschluss.text, abschluss.button,
    ...(n.statistik ? [n.statistik.zahl, n.statistik.satz, n.statistik.quelle] : []),
  ];
  for (const s of verbatim) if (!text.includes(s)) out.push(`missing: ${s}`);

  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => templateText(m[1]));
  if (!hrefs.includes(abschlussHref(n.slug, "pdf"))) out.push(`close link: no href="${abschlussHref(n.slug, "pdf")}"`);
  if (n.statistik && !hrefs.includes(n.statistik.href)) out.push(`statistik: no href="${n.statistik.href}"`);
  for (const h of hrefs) {
    const shown = h.replace(/^https?:\/\//, "");
    if (!text.includes(shown)) out.push(`link: ${shown} is not printed as text`);
  }

  const client = text.match(CLIENTS);
  if (client) out.push(`client: ${client[0]}`);
  const price = text.match(PRICE);
  if (price) out.push(`price: ${price[0]}`);
  const duration = text.match(DURATION);
  if (duration) out.push(`duration: ${duration[0]}`);
  const promise = text.match(/Garantie|noch 3/);
  if (promise) out.push(`promise: ${promise[0]}`);

  for (const sentence of text.split(". ")) {
    if (!/Schnittstelle/i.test(sentence)) continue;
    // "Lexware" inside a verified "Lexware Office" is the verified tool, not a second one.
    const named = REIHE_TOOLS.filter(
      (t) =>
        !n.verifiedInterfaces.includes(t) &&
        names(t, sentence) &&
        !n.verifiedInterfaces.some((v) => v.includes(t) && names(v, sentence)),
    );
    if (named.length) out.push(`interface: ${named.join(", ")} in: ${sentence.trim()}`);
  }

  const close = text.lastIndexOf(abschluss.heading);
  const person = (close >= 0 ? text.slice(0, close) : text).match(FIRST_PERSON);
  if (person) out.push(`first person before the close: ${person[0]}`);

  if (/Assistent|\bBot\b/.test(text) && !text.includes("meldet sich als KI-Assistent"))
    out.push("disclosure: an assistant is named without the line: meldet sich als KI-Assistent");

  return out;
}
