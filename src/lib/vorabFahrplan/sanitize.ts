// The visitor gate for model text (spec §8.5), in two parts: findForbidden detects what
// must never reach the visitor (the caller drops the whole claim, never cuts it out);
// polish only fixes punctuation and length, it never removes words.

const NUM = String.raw`\d{1,3}(?:[ \u00a0\u202f.]\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?`;
const CUR = String.raw`EUR|Euros?|USD|US-Dollars?|Dollars?|CHF|Cents?`;
const PRICE_RES = [
  /[€$]/,
  new RegExp(`(?<![\\p{L}\\d])(?:${CUR})\\s*(?:${NUM})`, "iu"),
  new RegExp(`(?:${NUM})\\s*(?:${CUR})(?![\\p{L}])`, "iu"),
];
const PERCENT = /\d\s*(?:%|Prozent\b)/i;
const URL = /https?:\/\/|\bwww\./i;
// Any lowercase ASCII TLD (stricter than guards.ts: a leaked link is worse than a lost claim);
// „ggf.später“ passes because the TLD must end before a letter. „@“ catches mail addresses.
const DOMAIN = /(?<![\p{L}\d-])[\p{L}\d-]+(?:\.[\p{L}\d-]+)*\.[a-z]{2,}(?![\p{L}\d-])|@/u;
const PHONE = /\+?\d(?:[\s/().-]{0,3}\d){5,}/;
const BANNED = /(?<![\p{L}\d-])(?:skalieren|game-changer|ki-magie|revolutionär\p{L}*)(?![\p{L}\d-])/iu;

export type Forbidden = "price" | "percent" | "url" | "domain" | "contact" | "banned";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Why `s` must not reach the visitor; empty when it may. `allowNames` (the visitor's
 *  program names) are exempt from the domain check, so „monday.com“ can be named. */
export function findForbidden(s: string, { allowNames = [] }: { allowNames?: readonly string[] } = {}): Forbidden[] {
  let ohneNamen = s;
  for (const n of allowNames.filter((n) => n.includes("."))) {
    ohneNamen = ohneNamen.replace(new RegExp(`(?<![\\p{L}\\d.-])${escape(n)}(?![\\p{L}\\d-]|\\.[\\p{L}\\d])`, "giu"), " ");
  }
  const out: Forbidden[] = [];
  if (PRICE_RES.some((re) => re.test(s))) out.push("price");
  if (PERCENT.test(s)) out.push("percent");
  if (URL.test(s)) out.push("url");
  if (DOMAIN.test(ohneNamen)) out.push("domain");
  if (PHONE.test(s)) out.push("contact");
  if (BANNED.test(s)) out.push("banned");
  return out;
}

/** Drops an unmatched „ or “ so no quote stays open. */
function balanceQuotes(s: string): string {
  const drop = new Set<number>();
  let open = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "„") {
      if (open >= 0) drop.add(open);
      open = i;
    } else if (s[i] === "“") {
      if (open < 0) drop.add(i);
      else open = -1;
    }
  }
  if (open >= 0) drop.add(open);
  return drop.size ? [...s].filter((_, i) => !drop.has(i)).join("") : s;
}

function cut(s: string, max: number): string {
  if (s.length <= max) return s;
  const i = s.lastIndexOf(" ", max);
  return (i > 0 ? s.slice(0, i) : s.slice(0, max)).replace(/[\s,;:]+$/, "");
}

/** German punctuation, whitespace and the word-boundary cut. Never removes a word. */
export function polish(s: string, max: number): string {
  const out = s
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 bis $2")
    .replace(/(\d)\s+-\s+(\d)/g, "$1 bis $2")
    .replace(/(\p{L}\.)[–—](\p{L})/gu, "$1 bis $2") // Mo.–Fr.
    .replace(/\s*[–—]\s*|\s+-\s+/g, ", ")
    .replace(/„([^"“„]*)"/g, "„$1“")
    .replace(/"([^"]*)"/g, "„$1“")
    .replace(/“([^“”„"]*)”/g, "„$1“")
    .replace(/["”]/g, " ")
    .replace(/,\s*und\b/g, " und")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.:;!?])/g, "$1")
    .replace(/^[\s,.:;]+|[\s,;:]+$/g, "");
  return balanceQuotes(cut(balanceQuotes(out), max)).replace(/\s+/g, " ").trim();
}
