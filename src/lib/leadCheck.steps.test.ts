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

  it("marks only the provision step optional, pre-filled with the default", () => {
    const provision = STEPS.find((s) => s.id === "provision");
    expect(provision).toMatchObject({ kind: "number", optional: true, defaultValue: DEFAULT_PROVISION });
    expect(STEPS.filter((s) => "optional" in s && s.optional)).toHaveLength(1);
  });

  it("gives every choice step at least two options", () => {
    for (const s of STEPS) {
      if (s.kind === "choice") expect(s.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});
