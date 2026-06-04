import { describe, it, expect } from "vitest";
import { storyBeats } from "./ueber-mich";

describe("storyBeats", () => {
  it("has the four arc beats in order", () => {
    expect(storyBeats.map((b) => b.slug)).toEqual([
      "quelle",
      "ripples",
      "fluss",
      "merak",
    ]);
  });

  it("each beat has an eyebrow, heading, and a placeholder body for the founder", () => {
    for (const beat of storyBeats) {
      expect(beat.eyebrow.length).toBeGreaterThan(0);
      expect(beat.heading.length).toBeGreaterThan(0);
      expect(beat.body).toContain("[Platzhalter]");
    }
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
