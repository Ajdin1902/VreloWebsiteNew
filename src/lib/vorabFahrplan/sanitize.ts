// Makes model text safe for the visitor's PDF and mail (spec §8.5): no link, no price,
// German punctuation, no brand-banned words, capped at a word boundary.
import { stripContacts } from "./guards";

// Stricter than guards: any lowercase ASCII TLD, because a leaked link is worse than a lost word.
// „ggf.später“ still survives (the TLD must end before a letter).
const ANY_DOMAIN = /(?<![\p{L}\d-])[\p{L}\d-]+(?:\.[\p{L}\d-]+)*\.[a-z]{2,}(?![\p{L}\d-])(?:\/\S*)?/gu;
const PREIS = /(?:\b(?:ab|für|nur|je|rund|ca\.)\s+)?(?:€\s*\d+(?:[.,]\d+)*|\d+(?:[.,]\d+)*(?:,-)?\s*(?:€|EUR\b|Euro\b))/giu;
const BANNED = /(?<![\p{L}\d-])(?:skalieren|game-changer|ki-magie|revolutionär\p{L}*)(?![\p{L}\d-])/giu;

function cut(s: string, max: number): string {
  if (s.length <= max) return s;
  const i = s.lastIndexOf(" ", max);
  let out = i > 0 ? s.slice(0, i) : s.slice(0, max);
  if (out.split("„").length > out.split("“").length) out = out.slice(0, out.lastIndexOf("„")); // no open quote
  return out.replace(/[\s,;:]+$/, "");
}

export function sanitizeVisitorText(s: string, max: number): string {
  const out = stripContacts(s)
    .replace(ANY_DOMAIN, " ")
    .replace(PREIS, " ")
    .replace(/€/g, " ")
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 bis $2")
    .replace(/(\d)\s+-\s+(\d)/g, "$1 bis $2")
    .replace(/\s+[–—-]\s+/g, ", ")
    .replace(/\s*[–—]\s*/g, ": ")
    .replace(/„([^"“„]*)"/g, "„$1“")
    .replace(/"([^"]*)"/g, "„$1“")
    .replace(/“([^“”„"]*)”/g, "„$1“")
    .replace(/["”]/g, " ")
    .replace(/,\s*und\b/g, " und")
    .replace(BANNED, " ")
    .replace(/\(\s*\)/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.:;!?])/g, "$1")
    .replace(/([,:;])(?=[,.:;])/g, "")
    .replace(/^[\s,.:;]+/, "")
    .trim();
  return cut(out, max);
}
