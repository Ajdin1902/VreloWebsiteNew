import { describe, it, expect } from "vitest";
import { faqGroups } from "./faq";
import { questionCountPhrase } from "./prozessCheckCta";
import { STEPS } from "./prozessCheck";

describe("faq data", () => {
  it("has three themed groups in order", () => {
    expect(faqGroups.map((g) => g.theme)).toEqual([
      "Zusammenarbeit",
      "Technik & Sicherheit",
      "Kosten & Ablauf",
    ]);
  });

  it("gives every group at least one entry with question and answer", () => {
    for (const g of faqGroups) {
      expect(g.entries.length).toBeGreaterThanOrEqual(1);
      for (const e of g.entries) {
        expect(e.question).toMatch(/\S/);
        expect(e.answer).toMatch(/\S/);
      }
    }
  });

  it("has unique questions across all groups", () => {
    const questions = faqGroups.flatMap((g) => g.entries.map((e) => e.question));
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("answers what happens after the project (the long-term-partner cue)", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const after = all.find((e) => /Was passiert nach dem Projekt/i.test(e.question));
    expect(after).toBeDefined();
    expect(after!.answer).toMatch(/erreichbar|anpass/i);
  });

  it("starts people with the Prozess-Check", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const start = all.find((e) => e.question === "Wie fange ich an?");
    expect(start!.answer).toMatch(/^Mit dem Prozess-Check/);
    // Review: the FAQ repeats the question count; it must follow the quiz.
    expect(start!.answer).toContain(questionCountPhrase(STEPS.length));
  });

  it("answers whether the Prozess-Check is really free", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const free = all.find((e) => e.question === "Ist der Prozess-Check wirklich kostenlos?");
    expect(free).toBeDefined();
    expect(free!.answer).toMatch(/^Ja\./);
  });
});
