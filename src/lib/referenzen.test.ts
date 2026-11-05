import { describe, it, expect } from "vitest";
import { referenzen, stimmen, referenzAnchorId } from "./referenzen";

// Walk the copy object and collect every string, so the guards below cover
// every field of every card and every quote without listing them by hand.
// (Same pattern as makler.test.ts.)
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings([referenzen, stimmen]);
const [mdz, velp] = referenzen;

// No Vrelo price ever appears on the site.
const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("referenzen copy", () => {
  it("ships MDZ first, then Velp, with unique slugs", () => {
    expect(referenzen.map((r) => r.slug)).toEqual(["mdz", "velp"]);
  });

  it("gives every card its required fields and at least one Baustein", () => {
    for (const r of referenzen) {
      for (const f of ["name", "label", "inhaber", "titel", "ueberblick", "resultat", "kompakt", "kennzahl", "kennzahlLabel"] as const) {
        expect(r[f].length, `${r.slug}.${f}`).toBeGreaterThan(0);
      }
      expect(r.bausteine.length).toBeGreaterThan(0);
    }
  });

  it("lists the MDZ Bausteine in Ajdin's order", () => {
    expect(mdz.bausteine.map((b) => b.titel)).toEqual(["Telegram-Assistent", "Rechnungsautomat", "MDZ Core", "Entsorgungsplan", "Website"]);
  });

  it("carries the family tie on MDZ only", () => {
    expect(mdz.familie?.kurz).toBe("Betrieb meines Vaters");
    expect(mdz.familie?.lang).toMatch(/^Der Betrieb meines Vaters\./);
    expect(velp.familie).toBeUndefined();
  });

  it("publishes no Velp number until Alen approves one", () => {
    expect(/\d/.test(velp.kennzahl + velp.kennzahlLabel)).toBe(false);
  });

  it("pins the MDZ number Mirsad confirmed", () => {
    expect([mdz.kennzahl, mdz.kennzahlLabel]).toEqual(["2 Std./Tag", "Büroarbeit weniger"]);
  });

  it("never says kostenlos, never leaks private data, spells names in ASCII", () => {
    expect(all.filter((s) => /kostenlos|pro bono/i.test(s))).toEqual([]);
    expect(all.filter((s) => /IBAN|Steuernummer|Umsatz/i.test(s))).toEqual([]);
    expect(all.filter((s) => /[ČčĆćŽžŠšĐđ]/.test(s))).toEqual([]);
  });

  it("ships Mirsad's three quotes, each wrapped in German quotes", () => {
    expect(stimmen).toHaveLength(3);
    for (const s of stimmen) {
      expect(s.text.startsWith("„") && s.text.endsWith("“"), s.text).toBe(true);
      expect([s.name, s.firma]).toEqual(["Mirsad Dzafic", "MDZ Hausmeisterservice"]);
    }
  });

  it("builds the anchor id from the slug", () => {
    expect(referenzAnchorId("mdz")).toBe("referenz-mdz");
  });

  it("uses German quotes, never ASCII double quotes", () => {
    expect(all.filter((s) => s.includes('"'))).toEqual([]);
  });

  it("uses no dash at all (Gedankenstrich retired site-wide)", () => {
    expect(all.filter((s) => s.includes("—") || s.includes("–"))).toEqual([]);
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
});
