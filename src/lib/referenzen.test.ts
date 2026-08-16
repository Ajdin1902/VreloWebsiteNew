import { describe, it, expect } from "vitest";
import { referenzen } from "./referenzen";

// Walk the copy object and collect every string, so the guards below cover
// every field of every card without listing them by hand. (Same pattern as
// makler.test.ts.)
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(referenzen);

// No Vrelo price ever appears on the site, and these anonymized cards name no
// figure with a currency at all.
const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("referenzen copy", () => {
  it("ships exactly two anonymized cards with unique slugs", () => {
    expect(referenzen).toHaveLength(2);
    const slugs = referenzen.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(2);
  });

  it("gives every card all content fields", () => {
    for (const r of referenzen) {
      for (const field of ["label", "titel", "problem", "gebaut", "laeuft", "ergebnis", "kompakt", "kennzahl", "kennzahlLabel"] as const) {
        expect(r[field].length).toBeGreaterThan(0);
      }
    }
  });

  it("uses German quotes, never ASCII double quotes", () => {
    expect(all.filter((s) => s.includes('"'))).toEqual([]);
  });

  it("uses the en-dash, never the em-dash", () => {
    expect(all.filter((s) => s.includes("—"))).toEqual([]);
  });

  it("pairs every opening German quote with a closing one", () => {
    for (const s of all) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });

  it("names no price or currency (site rule)", () => {
    expect(all.filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("uses generic masculine, no :innen gendered forms", () => {
    expect(all.filter((s) => /:innen\b/i.test(s))).toEqual([]);
  });

  it("keeps the client anonymous — no client names", () => {
    const forbidden = /velp|purisic|alen|mdz|halilovic/i;
    expect(all.filter((s) => forbidden.test(s))).toEqual([]);
  });
});
