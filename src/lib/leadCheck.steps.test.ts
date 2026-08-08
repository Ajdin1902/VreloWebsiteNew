// src/lib/leadCheck.steps.test.ts
import { describe, it, expect } from "vitest";
import { STEPS, DEFAULT_PROVISION } from "./leadCheck";

describe("STEPS", () => {
  it("has the 6 questions in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "anfragenProWoche",
      "reaktionszeit",
      "abendsWochenende",
      "imTermin",
      "nachfassen",
      "provision",
    ]);
  });

  it("marks only the provision step optional", () => {
    const provision = STEPS.find((s) => s.id === "provision");
    expect(provision).toMatchObject({ kind: "number", optional: true });
    expect(STEPS.filter((s) => "optional" in s && s.optional)).toHaveLength(1);
  });

  it("tells the user what skipping the provision step actually does", () => {
    // "Überspringen" does not omit the value — computeResult substitutes
    // DEFAULT_PROVISION, which then drives the headline € figure. The step's own
    // hint is the only place that is disclosed before the result. (Audit M3.)
    const provision = STEPS.find((s) => s.id === "provision");
    const hint = provision && "hint" in provision ? provision.hint : "";
    expect(hint).toContain(String(DEFAULT_PROVISION / 1000));
    expect(hint).toMatch(/leer/);
  });

  it("gives every choice step at least two options", () => {
    for (const s of STEPS) {
      if (s.kind === "choice") expect(s.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});
