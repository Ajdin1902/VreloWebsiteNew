import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoryBeat } from "./StoryBeat";
import type { StoryBeat as StoryBeatType } from "@/lib/ueber-mich";

const beat: StoryBeatType = {
  slug: "quelle",
  heading: "Woher ich komme",
  body: "[Platzhalter] Test-Text.",
  side: "left",
};

describe("StoryBeat", () => {
  it("renders the numeral, heading, and body, without an eyebrow line", () => {
    const { container } = render(<StoryBeat beat={beat} index={0} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Woher ich komme"
    );
    expect(screen.getByText("[Platzhalter] Test-Text.")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(container.querySelector(".uppercase")).toBeNull();
  });

  it("renders a video referencing the beat's clip slug", () => {
    const { container } = render(<StoryBeat beat={beat} index={0} />);
    expect(
      container.querySelector('source[src="/video/quelle.mp4"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('source[src="/video/quelle.webm"]')
    ).toBeInTheDocument();
  });

  it("splits a blank-line-separated body into multiple paragraphs", () => {
    const multi: StoryBeatType = {
      ...beat,
      body: "Erster Absatz hier.\n\nZweiter Absatz hier.",
    };
    render(<StoryBeat beat={multi} index={0} />);
    expect(screen.getByText("Erster Absatz hier.")).toBeInTheDocument();
    expect(screen.getByText("Zweiter Absatz hier.")).toBeInTheDocument();
  });

  it("wraps Vrelo and Merak in a Fraunces-italic BrandWord", () => {
    const branded: StoryBeatType = {
      ...beat,
      body: "Genau hier kommt Vrelo ins Spiel: mehr Merak im Alltag.",
    };
    render(<StoryBeat beat={branded} index={0} />);
    for (const word of ["Vrelo", "Merak"]) {
      const el = screen.getByText(word);
      expect(el.tagName).toBe("SPAN");
      expect(el).toHaveClass("italic");
    }
  });
});
