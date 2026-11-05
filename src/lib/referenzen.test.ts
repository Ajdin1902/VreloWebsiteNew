import { describe, it, expect } from "vitest";
import { referenzen, referenzAnchorId } from "./referenzen";

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
const [mdz, velp] = referenzen;

// No Vrelo price ever appears on the site.
const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("referenzen copy", () => {
  it("ships MDZ first, then Velp, with unique slugs", () => {
    expect(referenzen.map((r) => r.slug)).toEqual(["mdz", "velp"]);
  });

  it("gives every card its required fields, a logo and its tools", () => {
    for (const r of referenzen) {
      for (const f of ["name", "label", "inhaber", "intro", "titel", "kompakt", "kennzahl", "kennzahlLabel"] as const) {
        expect(r[f].length, `${r.slug}.${f}`).toBeGreaterThan(0);
      }
      expect(r.logo.src.startsWith("/images/referenzen/"), r.slug).toBe(true);
      expect(r.werkzeuge.length, r.slug).toBeGreaterThan(0);
      expect(r.problem.length, r.slug).toBeGreaterThan(1);
      expect(r.ergebnis.length, r.slug).toBeGreaterThan(1);
    }
  });

  it("keeps every bullet short", () => {
    for (const r of referenzen) for (const b of [...r.problem, ...r.ergebnis]) expect(b.split(" ").length, b).toBeLessThanOrEqual(12);
  });

  it("names the MDZ builds in Ajdin's order", () => {
    const order = ["Telegram-Assistent", "Rechnungsautomat", "MDZ Core", "Entsorgungsplan", "Website"].map((w) => mdz.ergebnis.findIndex((b) => b.includes(w)));
    expect(order.every((i) => i >= 0), mdz.ergebnis.join(" | ")).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("shows the MDZ clip and the Velp chain from HubSpot to ClickUp", () => {
    expect(mdz.visual).toEqual({ kind: "clip", mp4: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" });
    expect(velp.visual.kind).toBe("ablauf");
    if (velp.visual.kind !== "ablauf") return;
    expect(velp.visual.schritte.map((s) => s.werkzeug)).toEqual(["HubSpot", "sevDesk", "BoldSign", "Google Drive", "ClickUp"]);
    // Every tool in the chain is also in the tool list.
    for (const s of velp.visual.schritte) expect(velp.werkzeuge).toContain(s.werkzeug);
  });

  it("carries the family tie on MDZ only", () => {
    expect(mdz.familie?.kurz).toBe("Betrieb meines Vaters");
    expect(mdz.familie?.lang).toMatch(/^Der Betrieb meines Vaters\./);
    expect(velp.familie).toBeUndefined();
  });

  it("closes the MDZ card on Mirsad's quote in German quotes", () => {
    expect(mdz.stimme?.text).toBe("„Meine ganze Büroarbeit wird unterwegs direkt per Chatnachricht erledigt. Nichts wird vergessen.“");
    expect(mdz.stimme?.name).toBe("Mirsad Dzafic");
    expect(mdz.stimme?.text.startsWith("„") && mdz.stimme?.text.endsWith("“")).toBe(true);
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
