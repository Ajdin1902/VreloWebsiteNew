import { describe, it, expect } from "vitest";
import { categorize, severity, STEPS, type ProzessCheckAnswers } from "./prozessCheck";

// A base answer set that scores severity 0 (D) unless overridden.
const base: ProzessCheckAnswers = {
  aufgabe: "anfragen",
  zeit: "unter1",
  konsequenz: "nichts",
  abende: "nein",
  versucht: "garnicht",
};

describe("prozessCheck categorization", () => {
  it("has five steps in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual(["aufgabe", "zeit", "konsequenz", "abende", "versucht"]);
  });

  it("routes anyone who already automates to C, regardless of severity", () => {
    expect(
      categorize({ ...base, zeit: "ueber5", konsequenz: "liegen", abende: "staendig", versucht: "laeuft" }),
    ).toBe("C");
    expect(categorize({ ...base, versucht: "laeuft" })).toBe("C");
  });

  it("routes the clear low-pain case (severity 0) to D", () => {
    expect(severity(base)).toBe(0);
    expect(categorize(base)).toBe("D");
  });

  it("routes moderate pain (severity 1-2) to B", () => {
    expect(categorize({ ...base, zeit: "1bis3" })).toBe("B"); // severity 1
    expect(categorize({ ...base, zeit: "1bis3", konsequenz: "liegen" })).toBe("B"); // severity 2
  });

  it("routes strong pain (severity >= 3) to A", () => {
    expect(categorize({ ...base, zeit: "3bis5", konsequenz: "liegen" })).toBe("A"); // 2+1 = 3
    expect(categorize({ ...base, zeit: "ueber5", abende: "staendig" })).toBe("A"); // 3+2 = 5
  });
});
