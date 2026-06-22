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
  it("renders the heading and body, without an eyebrow or numeral", () => {
    const { container } = render(<StoryBeat beat={beat} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Woher ich komme"
    );
    expect(screen.getByText("[Platzhalter] Test-Text.")).toBeInTheDocument();
    expect(screen.queryByText("01")).toBeNull();
    expect(container.querySelector(".uppercase")).toBeNull();
  });

  it("renders a video referencing the beat's clip slug", () => {
    const { container } = render(<StoryBeat beat={beat} />);
    expect(
      container.querySelector('source[src="/video/quelle.mp4"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('source[src="/video/quelle.webm"]')
    ).toBeInTheDocument();
  });

  it("renders text-only (no video) when video is false", () => {
    const { container } = render(<StoryBeat beat={{ ...beat, video: false }} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.getByText("[Platzhalter] Test-Text.")).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("source")).toBeNull();
  });

  it("splits a blank-line-separated body into multiple paragraphs", () => {
    const multi: StoryBeatType = {
      ...beat,
      body: "Erster Absatz hier.\n\nZweiter Absatz hier.",
    };
    render(<StoryBeat beat={multi} />);
    expect(screen.getByText("Erster Absatz hier.")).toBeInTheDocument();
    expect(screen.getByText("Zweiter Absatz hier.")).toBeInTheDocument();
  });

  it("uses on-dark text classes when onDark is set", () => {
    const { container } = render(<StoryBeat beat={beat} onDark />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-papier");
    expect(container.querySelector("p")).toHaveClass("text-gletscher");
  });

  it("uses dark-ink text classes by default (light beat)", () => {
    const { container } = render(<StoryBeat beat={beat} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-tiefes-wasser");
    expect(container.querySelector("p")).toHaveClass("text-tinte");
  });

  it("wraps Vrelo and Merak in a Fraunces-italic BrandWord", () => {
    const branded: StoryBeatType = {
      ...beat,
      body: "Genau hier kommt Vrelo ins Spiel: mehr Merak im Alltag.",
    };
    render(<StoryBeat beat={branded} />);
    for (const word of ["Vrelo", "Merak"]) {
      const el = screen.getByText(word);
      expect(el.tagName).toBe("SPAN");
      expect(el).toHaveClass("italic");
    }
  });
});
