// src/lib/regensburg.test.ts
import { describe, it, expect } from "vitest";
import { REGENSBURG, REGENSBURG_PATH } from "./regensburg";
import { findCopyIssues } from "./ratgeberCopy";

// Every German string, skipping link targets.
function copyStrings(value: unknown, out: string[] = [], key = ""): string[] {
  if (key === "href") return out;
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) copyStrings(v, out, key);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) copyStrings(v, out, k);
  return out;
}

describe("Regensburg page copy", () => {
  const strings = copyStrings(REGENSBURG);

  it("lives at /automatisierung-regensburg", () => {
    expect(REGENSBURG_PATH).toBe("/automatisierung-regensburg");
  });

  it("passes the site's German copy guards", () => {
    for (const s of strings) expect(findCopyIssues(s), s).toEqual([]);
  });

  it("fits Google's title and the compact hero line", () => {
    expect(`${REGENSBURG.meta.title} - Vrelo`.length).toBeLessThanOrEqual(60);
    expect(REGENSBURG.hero.line.length).toBeLessThanOrEqual(90);
  });

  it("names no price", () => {
    expect(strings.join(" ")).not.toMatch(/€|Euro/);
  });

  it("never names MDZ and keeps the family tie on the references line (UWG §5)", () => {
    expect(strings.join(" ")).not.toMatch(/MDZ/);
    expect(REGENSBURG.bloecke.some((b) => b.text.includes("Betrieb meines Vaters"))).toBe(true);
  });

  it("links the three build doors and the references", () => {
    const hrefs = REGENSBURG.bloecke.flatMap((b) => (b.links ?? []).map((l) => l.href));
    expect(hrefs).toEqual([
      "/leistungen/prozess-audit",
      "/leistungen/prozessautomatisierung",
      "/leistungen/ki-automatisierung",
      "/referenzen",
    ]);
  });
});
