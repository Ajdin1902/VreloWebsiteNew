import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoryBeat } from "./StoryBeat";
import type { StoryBeat as StoryBeatType } from "@/lib/ueber-mich";

const beat: StoryBeatType = {
  slug: "quelle",
  eyebrow: "Quelle",
  heading: "Woher ich komme",
  body: "[Platzhalter] Test-Text.",
  side: "left",
};

describe("StoryBeat", () => {
  it("renders the eyebrow, heading, body, and numeral", () => {
    render(<StoryBeat beat={beat} index={0} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Woher ich komme"
    );
    expect(screen.getByText("[Platzhalter] Test-Text.")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
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
});
