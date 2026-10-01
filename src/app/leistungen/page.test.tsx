import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeistungenPage from "./page";

// Ajdin 2026-10-01: the hub opens like the subpages, one short line on the
// image and no separate lead band. Unlike the subpages it carries no button:
// the page itself is the menu, the close makes the ask.
describe("/leistungen", () => {
  it("puts the line on the hero image, without a button", () => {
    render(<LeistungenPage />);
    const hero = screen.getByRole("heading", { level: 1, name: "Leistungen" }).closest("section")!;
    expect(hero.querySelector("img")).not.toBeNull();
    expect(hero).toHaveTextContent("Ich baue KI- und Prozessautomatisierungen, richte sie ein und halte sie am Laufen.");
    expect(hero.querySelectorAll("a")).toHaveLength(0);
  });

  it("drops the separate lead band", () => {
    const { container } = render(<LeistungenPage />);
    expect(container.textContent).not.toContain("Such dir aus, wo du anfangen willst.");
  });

  it("keeps the closing call to the Prozess-Check", () => {
    render(<LeistungenPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Lass uns deine Quelle bauen." })).toBeInTheDocument();
  });
});
