import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UeberMichPage from "./page";
import { bildhinweis } from "@/lib/ueber-mich";

describe("/ueber-mich", () => {
  it("shows the AI-imagery note in the page body, not only in a footer", () => {
    // The note has to sit next to the Bosnia story: that is where a reader
    // could read the generated spring as a photo of a real place.
    render(<UeberMichPage />);
    expect(screen.getByText(bildhinweis)).toBeInTheDocument();
  });

  it("places the note under the first story beat", () => {
    const { container } = render(<UeberMichPage />);
    const note = screen.getByText(bildhinweis);
    const firstBeatHeading = container.querySelector("#beat-quelle");
    expect(firstBeatHeading).not.toBeNull();
    // Same Reveal wrapper as the first beat.
    expect(note.closest(".reveal")?.contains(firstBeatHeading!)).toBe(true);
  });
});
