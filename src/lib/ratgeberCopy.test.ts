import { describe, it, expect } from "vitest";
import { stripFrontmatter, findCopyIssues } from "./ratgeberCopy";

const clean = `Ich habe das lange beobachtet.

## Warum das passiert

Der Kunde wartet, und niemand antwortet. „So läuft das oft.“
`;

describe("stripFrontmatter", () => {
  it("removes a leading YAML block", () => {
    const raw = `---\ntitle: "Ein Titel"\ndraft: true\n---\n\nDer Text.\n`;
    expect(stripFrontmatter(raw).trim()).toBe("Der Text.");
  });

  it("leaves a body without frontmatter untouched", () => {
    expect(stripFrontmatter("Der Text.\n").trim()).toBe("Der Text.");
  });

  it("does not strip a later --- used as a horizontal rule", () => {
    const raw = `Der Text.\n\n---\n\nMehr Text.\n`;
    expect(stripFrontmatter(raw)).toContain("Mehr Text.");
  });
});

describe("findCopyIssues", () => {
  it("passes clean German copy", () => {
    expect(findCopyIssues(clean)).toEqual([]);
  });

  it("catches the em-dash", () => {
    const issues = findCopyIssues("Der Kunde wartet — niemand antwortet.");
    expect(issues.map((i) => i.kind)).toContain("em-dash");
  });

  it("catches the en-dash (Gedankenstrich retired site-wide)", () => {
    const issues = findCopyIssues("Der Kunde wartet – niemand antwortet.");
    expect(issues.map((i) => i.kind)).toContain("en-dash");
  });

  it("catches ASCII double quotes", () => {
    const issues = findCopyIssues('Er sagte "so nicht".');
    expect(issues.map((i) => i.kind)).toContain("ascii-quote");
  });

  it("catches the wrong-direction closing quote", () => {
    // ” escape, never the literal character: a typography repair pass over
    // this file would silently "fix" the fixture and the test would then assert
    // against clean input.
    const issues = findCopyIssues("Er sagte „so nicht\u201D.");
    expect(issues.map((i) => i.kind)).toContain("wrong-closing-quote");
  });

  it("catches unbalanced German quotes", () => {
    const issues = findCopyIssues("Er sagte „so nicht.");
    expect(issues.map((i) => i.kind)).toContain("unbalanced-quotes");
  });

  it("catches punctuated gender forms", () => {
    expect(findCopyIssues("Die Kund:innen warten.").map((i) => i.kind)).toContain("gendered-form");
    expect(findCopyIssues("Die Kund*innen warten.").map((i) => i.kind)).toContain("gendered-form");
  });

  it("catches feminine plurals from the explicit list", () => {
    expect(findCopyIssues("Die Inhaberinnen warten.").map((i) => i.kind)).toContain("gendered-form");
  });

  it("does not flag ordinary words ending in -innen", () => {
    expect(findCopyIssues("Er war schon drinnen.")).toEqual([]);
  });

  it("reports the offending snippet so the failure is actionable", () => {
    const [issue] = findCopyIssues("Der Kunde wartet — niemand antwortet.");
    expect(issue.detail).toContain("wartet");
  });
});
