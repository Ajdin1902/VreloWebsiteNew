import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HAUS_PDF, vorlageBauplaene, vorlagenPage } from "./vorlagen";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

describe("vorlagen copy", () => {
  const all = strings([vorlagenPage, vorlageBauplaene]);

  it("passes the site copy guard (quotes, dashes, comma before und)", () => {
    expect(all.flatMap((s) => findCopyIssues(s).map((i) => ({ s, i })))).toEqual([]);
  });

  it("names no price", () => {
    expect(all.filter((s) => /€|\bEUR\b|\d\s*(Euro|netto)\b/i.test(s))).toEqual([]);
  });

  it("links every Bauplan card to a public Bauplan page", () => {
    const hrefs = vorlagenPage.items.map((v) => v.link.href);
    for (const slug of Object.keys(vorlageBauplaene)) expect(hrefs).toContain(`/vorlagen/${slug}`);
  });

  it("ships the Haus PDF the card links to", () => {
    expect(existsSync(join(process.cwd(), "public", HAUS_PDF))).toBe(true);
  });
});
