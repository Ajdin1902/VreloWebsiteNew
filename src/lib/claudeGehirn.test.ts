// src/lib/claudeGehirn.test.ts
import { describe, it, expect } from "vitest";
import { getGehirnPrompt, promptLength, PROMPT_MAX_CHARS } from "./claudeGehirn";
import { findCopyIssues } from "./ratgeberCopy";

// The prompt is posted verbatim on LinkedIn (plain text, 3,000-char post
// limit, spec D4) and shown on /claude-gehirn. One file, two surfaces.
const prompt = getGehirnPrompt();

describe("Claude-Gehirn prompt", () => {
  it("fits the LinkedIn budget", () => {
    expect(promptLength(prompt)).toBeLessThanOrEqual(PROMPT_MAX_CHARS);
    expect(promptLength(prompt)).toBeGreaterThan(1500);
  });

  it("is normalised: no carriage returns, no outer whitespace", () => {
    expect(prompt).not.toContain("\r");
    expect(prompt).toBe(prompt.trim());
  });

  it("is plain text: no Markdown characters LinkedIn would show literally", () => {
    expect(prompt).not.toMatch(/[#*`]/);
  });

  it("follows the house typography (dashes, quotes, comma before und, gendered forms)", () => {
    expect(findCopyIssues(prompt)).toEqual([]);
  });

  it("carries the structure and the rules the spec requires", () => {
    for (const must of [
      "CLAUDE.md",
      "inhalt.md",
      "verlauf.md",
      "quellen/",
      "wissen/ablaeufe/",
      "150 Zeilen",
      "14 Tage",
      "Arbeit zuerst",
      "Erst nachsehen",
      "Widersprüche",
      "So arbeiten wir",
      "Passwörter",
    ]) {
      expect(prompt).toContain(must);
    }
  });

  // Final review 2026-10-03: the history must carry what later rules look up,
  // postponing must be recorded, and self-pruning must not trigger the ask-first rule.
  it("logs what the upkeep rules look up later", () => {
    expect(prompt).toContain("Jede eingearbeitete Datei und jeden Gesundheitscheck eintragen");
    expect(prompt).toContain("Die Einrichtung zählt als erster Gesundheitscheck");
    expect(prompt).toContain("„später“ zählt als Check");
  });

  it("scopes the ask-first rule so pruning the brain needs no question", () => {
    expect(prompt).toContain("CLAUDE.md, inhalt.md und wissen/ pflegst du selbst");
    expect(prompt).toContain("Frag, bevor du Dateien löschst, quellen/ änderst");
  });

  it("keeps the map current and the rules from being pruned away", () => {
    expect(prompt).toContain("bei jeder neuen Seite ergänzen");
    expect(prompt).toContain("Die Regeln bleiben vollständig in CLAUDE.md");
    expect(prompt).toContain("Was gilt, steht im Gehirn");
  });

  it("counts code points, not UTF-16 units", () => {
    expect(promptLength("„ä“")).toBe(3);
  });
});
