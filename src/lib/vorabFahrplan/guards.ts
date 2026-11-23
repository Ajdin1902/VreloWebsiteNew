import { parseHttpUrl } from "@/lib/demo/fetchGuard";
import { PROGRAMM_CHIPS } from "@/lib/prozessCheck";

const CONTACT_RES = [
  /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, // e-mail
  /https?:\/\/\S+/gi,
  /\bwww\.\S+/gi,
  /\b[\w-]+(?:\.[\w-]+)+\/\S*/g, // bare name.tld/path
  /\+?\d(?:[\s/-]?\d){5,}/g, // phone-like run of >= 6 digits
];

export function stripContacts(s: string): string {
  let out = s;
  for (const re of CONTACT_RES) out = out.replace(re, " ");
  return out.replace(/\s+/g, " ").trim();
}

export function normalizePhone(raw: string): string | null {
  const t = raw.trim();
  const digits = t.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 20) return null;
  return (t.startsWith("+") ? "+" : "") + digits;
}

export function normalizeWebsite(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const u = parseHttpUrl(/^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`);
  if (!u) return null;
  const h = u.hostname;
  if (h === "localhost" || !h.includes(".") || h.startsWith("[") || /^[\d.]+$/.test(h)) return null;
  return u.origin + u.pathname;
}

export function capText(s: string, max: number): string {
  return s.slice(0, max);
}

export function parseProgramme(chips: string[], freeText: string): string[] {
  const names = [
    ...chips.filter((c) => PROGRAMM_CHIPS.includes(c)),
    ...freeText.split(/[,;/\n]/),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    const name = stripContacts(n).trim().slice(0, 40);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out.slice(0, 8);
}

export function safeFilenamePart(s: string): string {
  const out = s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
  return out || "Betrieb";
}
