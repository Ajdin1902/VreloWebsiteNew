import { describe, it, expect } from "vitest";
import { bildhinweis, storyBeats } from "./ueber-mich";

describe("storyBeats", () => {
  it("has the four arc beats in order", () => {
    expect(storyBeats.map((b) => b.slug)).toEqual([
      "quelle",
      "ripples",
      "fluss",
      "merak",
    ]);
  });

  it("each beat has a heading and a real (non-placeholder) body", () => {
    for (const beat of storyBeats) {
      expect(beat.heading.length).toBeGreaterThan(0);
      expect(beat.body.length).toBeGreaterThan(80);
      expect(beat.body).not.toContain("[Platzhalter]");
    }
  });

  it("carries an AI-imagery note that names KI and denies real places", () => {
    // Compliance guard: this line is why /ueber-mich can show a generated
    // karst spring next to a first-person Bosnia story. Don't delete it
    // without re-reading Knowledge/Compliance/KI-Transparenzpflichten.md.
    expect(bildhinweis).toContain("KI");
    expect(bildhinweis).toContain("keine realen Orte");
  });

  it("alternates the video side", () => {
    expect(storyBeats.map((b) => b.side)).toEqual([
      "left",
      "right",
      "left",
      "right",
    ]);
  });
});
