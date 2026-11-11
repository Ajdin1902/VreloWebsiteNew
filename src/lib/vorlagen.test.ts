import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HAUS_PDF, VORLAGEN_GRUPPEN, vorlageBauplaene, vorlagenPage } from "./vorlagen";
import { findCopyIssues } from "./ratgeberCopy";
import { questionCountPhrase } from "./prozessCheckCta";
import { STEPS } from "./prozessCheck";

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

  it("puts every card in a hub group and leaves no group empty", () => {
    const used = new Set(vorlagenPage.items.map((v) => v.gruppe));
    for (const g of VORLAGEN_GRUPPEN) expect(used.has(g.id), g.id).toBe(true);
  });

  it("has a hub card and a public page for the SHK Bauplan", () => {
    expect(vorlageBauplaene["shk-bauplan"].variant).toBe("shk");
    expect(vorlagenPage.items.map((v) => v.link.href)).toContain("/vorlagen/shk-bauplan");
  });
});

// Ajdin 2026-11-11: the Prozess-Check stays as one of the free tools here.
describe("prozess-check card", () => {
  it("leads the first group and links to the check with src=vorlagen", () => {
    const first = vorlagenPage.items[0];
    expect(first.id).toBe("prozess-check");
    expect(first.gruppe).toBe("alle");
    expect(first.link.href).toBe("/prozess-check?src=vorlagen");
    expect(first.text).toContain(questionCountPhrase(STEPS.length));
  });

  it("closes the hub with the free next step", () => {
    expect(vorlagenPage.weiter.text).toBe("Danach: 30 Minuten Gespräch, dann dein Fahrplan. Kostenlos.");
    expect(vorlagenPage.weiter.link.href).toBe("/kontakt?src=vorlagen");
  });
});
