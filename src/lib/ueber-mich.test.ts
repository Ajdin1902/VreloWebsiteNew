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

  it("each beat has a heading and a real (non-placeholder) body", () => {
    for (const beat of storyBeats) {
      expect(beat.heading.length).toBeGreaterThan(0);
      expect(beat.body.length).toBeGreaterThan(80);
      expect(beat.body).not.toContain("[Platzhalter]");
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
