import { describe, it, expect } from "vitest";
import { parseIssue, selectIssues } from "./issue.mjs";

const raw = `---
subject: "Der Kunde, der um 22 Uhr schrieb"
previewText: "Eine Beobachtung, ein Tipp, ein Meme."
date: "2026-06-30"
draft: true
---
Intro-Absatz.

## Kurz aus der KI-Welt
Text.`;

describe("parseIssue", () => {
  it("parses frontmatter and strips it from the body", () => {
    const i = parseIssue("2026-06-30-der-kunde.md", raw);
    expect(i.slug).toBe("2026-06-30-der-kunde");
    expect(i.subject).toBe("Der Kunde, der um 22 Uhr schrieb");
    expect(i.previewText).toBe("Eine Beobachtung, ein Tipp, ein Meme.");
    expect(i.date).toBe("2026-06-30");
    expect(i.draft).toBe(true);
    expect(i.body.startsWith("Intro-Absatz.")).toBe(true);
    expect(i.body).not.toContain("subject:");
  });

  it("throws when subject is missing", () => {
    const bad = `---\ndate: "2026-06-30"\n---\nText.`;
    expect(() => parseIssue("x.md", bad)).toThrow(/subject/);
  });

  it("throws when date is missing", () => {
    const bad = `---\nsubject: "Hallo"\n---\nText.`;
    expect(() => parseIssue("x.md", bad)).toThrow(/date/);
  });

  it("defaults draft to false and previewText to empty string", () => {
    const min = `---\nsubject: "Hallo"\ndate: "2026-06-30"\n---\nText.`;
    const i = parseIssue("x.md", min);
    expect(i.draft).toBe(false);
    expect(i.previewText).toBe("");
  });

  it("normalizes an unquoted YAML date to ISO YYYY-MM-DD", () => {
    const unquoted = `---\nsubject: "Hallo"\ndate: 2026-06-30\n---\nText.`;
    const i = parseIssue("x.md", unquoted);
    expect(i.date).toBe("2026-06-30");
  });
});

describe("selectIssues", () => {
  const issues = [
    { slug: "a", date: "2026-01-01", draft: false },
    { slug: "b", date: "2026-03-01", draft: true },
    { slug: "c", date: "2026-02-01", draft: false },
  ];
  it("hides drafts unless asked and sorts newest first", () => {
    expect(selectIssues(issues, { includeDrafts: false }).map((i) => i.slug)).toEqual(["c", "a"]);
    expect(selectIssues(issues, { includeDrafts: true }).map((i) => i.slug)).toEqual(["b", "c", "a"]);
  });
});
