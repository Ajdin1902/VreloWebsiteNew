import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Protokoll } from "./Protokoll";

describe("Protokoll", () => {
  it("shows the reveal and links to the Cal call when configured", () => {
    render(<Protokoll calLink="ajdin19/vrelo-kennenlernen" />);
    expect(screen.getByText(/Das hat dein Kunde gerade erlebt/i)).toBeTruthy();
    const cta = screen.getByRole("link", { name: /kennenlernen|Gespräch|bauen/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });
  it("still renders the reveal without a Cal link", () => {
    render(<Protokoll calLink={undefined} />);
    expect(screen.getByText(/Das hat dein Kunde gerade erlebt/i)).toBeTruthy();
  });
});
