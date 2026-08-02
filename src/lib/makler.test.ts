import { describe, it, expect } from "vitest";
import { makler } from "./makler";

// Walk the copy object and collect every string, so the guards below cover
// nested products, bullets and flow steps without listing them by hand.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(makler);

// Vrelo prices never appear on the site. The one permitted exception is the
// client's own third-party server cost, which HQ wants said out loud as proof
// that the retainer is pure Vrelo-Leistung and not disguised hosting.
const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("makler copy", () => {
  it("collects a substantial body of copy", () => {
    expect(all.length).toBeGreaterThan(40);
  });

  it("uses German quotes, never ASCII double quotes", () => {
    const bad = all.filter((s) => s.includes('"'));
    expect(bad).toEqual([]);
  });

  it("uses the en-dash, never the em-dash", () => {
    const bad = all.filter((s) => s.includes("—"));
    expect(bad).toEqual([]);
  });

  it("pairs every opening German quote with a closing one", () => {
    for (const s of all) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });

  it("names no price outside the server note", () => {
    const serverNote = new Set(strings(makler.voraussetzungen));
    const elsewhere = all.filter((s) => !serverNote.has(s));
    expect(elsewhere.filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("allows exactly one currency figure – the client's own server cost", () => {
    const hits = strings(makler.voraussetzungen).filter((s) => s.includes("€"));
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain("rund 30 €");
  });

  it("never claims Vrelo provides the server", () => {
    // n8n is fair-code: the client running it on his OWN server is permitted,
    // Vrelo hosting or reselling it is not. It is also what makes the Document
    // Concierge trust paragraph true. See the design spec §2.1.
    const server = makler.voraussetzungen.items[0].body;
    expect(server).toContain("deinem eigenen Konto");
    expect(server).toContain("er gehört dir");
  });

  it("points the demo invitation at /demo and the CTA at the booking anchor", () => {
    expect(makler.terminQuelle.proof?.href).toBe("/demo");
    expect(makler.cta.href).toBe("#termin");
    expect(makler.cta.short.length).toBeLessThan(makler.cta.label.length);
  });

  it("keeps the hero free of CTA copy and drops the bridge", () => {
    expect(makler.hero).not.toHaveProperty("cta");
    expect(makler).not.toHaveProperty("bridge");
    expect(makler.close).not.toHaveProperty("body");
  });

  it("trims the objections to four", () => {
    expect(makler.einwaende.items).toHaveLength(4);
  });

  it("ships the Document Concierge without a video until one is recorded", () => {
    expect(makler.documentConcierge.demoVideo).toBeNull();
  });
});
