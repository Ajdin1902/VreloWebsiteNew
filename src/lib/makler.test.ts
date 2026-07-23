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

  it("never names a price", () => {
    const bad = all.filter((s) => /€|\bEUR\b|\d\s*(Euro|netto)\b/i.test(s));
    expect(bad).toEqual([]);
  });

  it("points the demo invitation at /demo and the CTA at the booking anchor", () => {
    expect(makler.terminQuelle.proof?.href).toBe("/demo");
    expect(makler.hero.cta.href).toBe("#termin");
  });

  it("ships the Document Concierge without a video until one is recorded", () => {
    expect(makler.documentConcierge.demoVideo).toBeNull();
  });
});
