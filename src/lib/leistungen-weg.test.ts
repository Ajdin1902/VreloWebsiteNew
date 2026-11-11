import { describe, it, expect } from "vitest";
import { wennDuBaust, woranEsScheitert } from "./leistungen-weg";
import { faqAnchor, faqGroups } from "./faq";

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

  it("closes the build sequence on the Feinschliff, without a refund (2026-11-11)", () => {
    const last = wennDuBaust.phases[wennDuBaust.phases.length - 1];
    expect(last.id).toBe("feinschliff");
    expect(last.text).toContain("14 Tage");
    expect(last.text).not.toMatch(/zurück|Betrag/);
  });

  // Ajdin 2026-11-11: the 2-week first-result guarantee replaces the 14-day one.
  // It still presupposes the Prozess-Audit (UWG §5: no more than the Angebot says).
  it("promises the first result in 2 weeks, tied to the Prozess-Audit, right after the build", () => {
    const ids = wennDuBaust.phases.map((p) => p.id);
    expect(ids.indexOf("ergebnis")).toBe(ids.indexOf("bauen") + 1);
    const p = wennDuBaust.phases.find((x) => x.id === "ergebnis")!;
    expect(p.title).toBe("Erstes Ergebnis in 2 Wochen");
    expect(p.text).toContain("Onboarding");
    const audit = p.text.indexOf("Prozess-Audit");
    expect(audit).toBeGreaterThan(-1);
    expect(audit).toBeLessThan(p.text.indexOf("alles zurück"));
  });

  it("keeps the free steps (Prozess-Check/Audit) out of the build phases", () => {
    const titles = wennDuBaust.phases.map((p) => p.title.toLowerCase());
    expect(titles.some((t) => t.includes("check") || t.includes("audit"))).toBe(false);
  });

  it("links the first two objections into the funnel", () => {
    expect(woranEsScheitert.rows[0].link.href).toBe("/prozess-check?src=leistungen-einwand");
    expect(woranEsScheitert.rows[1].link.href).toBe("/leistungen/prozess-audit");
  });

  it("gives every objection a named solution and a link", () => {
    for (const row of woranEsScheitert.rows) {
      expect(row.loesungName.length).toBeGreaterThan(0);
      expect(row.link.href.length).toBeGreaterThan(0);
      expect(row.link.label.length).toBeGreaterThan(0);
    }
  });
});

describe("FAQ deep links", () => {
  it("point every /faq# link at an existing question", () => {
    const anchors = new Set(faqGroups.flatMap((g) => g.entries.map((e) => faqAnchor(e.question))));
    const hrefs = strings(woranEsScheitert).filter((s) => s.startsWith("/faq#"));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(anchors.has(h.slice("/faq#".length)), h).toBe(true);
  });
});
