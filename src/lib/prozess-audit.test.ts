import { describe, it, expect } from "vitest";
import { prozessAudit } from "./prozess-audit";

// Walk the copy object and collect every string so the guards cover the
// deliverables array and nested cta without listing them by hand.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(prozessAudit);

// The Prozess-Audit block names NO price at all (stricter than /makler, which
// permits the one server-cost figure). The build price is named only in the call.
const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b|\b499\b/i;

describe("prozess-audit copy", () => {
  it("collects a body of copy", () => {
    expect(all.length).toBeGreaterThan(8);
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

  it("names no price anywhere", () => {
    expect(all.filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("never names the mechanism", () => {
    expect(all.filter((s) => /\bn8n\b|claude/i.test(s))).toEqual([]);
  });

  it("routes the primary CTA to the free Prozess-Check funnel", () => {
    expect(prozessAudit.cta.href).toBe("/prozess-check");
  });

  it("lists five deliverables (incl. the no-preparation Fragenkatalog)", () => {
    expect(prozessAudit.deliverables).toHaveLength(5);
    expect(prozessAudit.deliverables.join(" ")).toContain("Fragenkatalog");
  });

  it("leads the heading with kostenlos", () => {
    expect(prozessAudit.heading.startsWith("Kostenlos")).toBe(true);
  });

  it("offers the Prozess-Check as a secondary on-ramp to /prozess-check", () => {
    expect(prozessAudit.check.href).toBe("/prozess-check");
    expect(prozessAudit.check.label.length).toBeGreaterThan(0);
  });
});
