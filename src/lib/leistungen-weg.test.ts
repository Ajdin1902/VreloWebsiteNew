import { describe, it, expect } from "vitest";
import { wennDuBaust, woranEsScheitert } from "./leistungen-weg";

// Same copy-guard pattern as makler.test.ts: walk the exported objects and
// check every string, so new rows and phases are covered automatically.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = [...strings(wennDuBaust), ...strings(woranEsScheitert)];

const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("leistungen-weg copy", () => {
  it("uses German quotes, never ASCII double quotes", () => {
    const bad = all.filter((s) => s.includes('"'));
    expect(bad).toEqual([]);
  });

  it("uses no dash at all (Gedankenstrich retired site-wide)", () => {
    const bad = all.filter((s) => s.includes("—") || s.includes("–"));
    expect(bad).toEqual([]);
  });

  it("pairs every opening German quote with a closing one", () => {
    for (const s of all) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });

  it("names no price except the client's own server cost, once", () => {
    const hits = all.filter((s) => CURRENCY.test(s));
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain("rund 30 Euro");
  });

  it("never names the Vrelo build price bands (those live in the FAQ only)", () => {
    const bad = all.filter((s) => /1\.500|25\.000|350|1\.000/.test(s));
    expect(bad).toEqual([]);
  });

  it("closes the build sequence on the Feinschliff with the guarantee", () => {
    const last = wennDuBaust.phases[wennDuBaust.phases.length - 1];
    expect(last.id).toBe("feinschliff");
    expect(last.text).toContain("14 Tage");
    expect(last.text).toContain("vollen Betrag zurück");
  });

  it("keeps the free steps in the intro, not as build phases", () => {
    expect(wennDuBaust.intro).toContain("kostenlose");
    const titles = wennDuBaust.phases.map((p) => p.title.toLowerCase());
    expect(titles.some((t) => t.includes("check") || t.includes("audit"))).toBe(false);
  });

  it("links the first two objections into the funnel", () => {
    expect(woranEsScheitert.rows[0].link.href).toBe("/prozess-check");
    expect(woranEsScheitert.rows[1].link.href).toBe("#prozess-audit");
  });

  it("gives every objection a named solution and a link", () => {
    for (const row of woranEsScheitert.rows) {
      expect(row.loesungName.length).toBeGreaterThan(0);
      expect(row.link.href.length).toBeGreaterThan(0);
      expect(row.link.label.length).toBeGreaterThan(0);
    }
  });
});
