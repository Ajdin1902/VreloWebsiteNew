import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeistungenPage from "./page";

// Ajdin 2026-10-01: the hub opens like the subpages, one short line and the
// button on the image, no separate lead band below it.
describe("/leistungen", () => {
  it("puts the line and the Prozess-Check on the hero image", () => {
    render(<LeistungenPage />);
    const hero = screen.getByRole("heading", { level: 1, name: "Leistungen" }).closest("section")!;
    expect(hero.querySelector("img")).not.toBeNull();
    expect(hero).toHaveTextContent("Ich baue KI- und Prozessautomatisierungen, richte sie ein und halte sie am Laufen.");
    expect(hero.querySelector("a[href='/prozess-check?src=leistungen-hero']")).not.toBeNull();
    expect(hero.querySelector("a[href='/kontakt']")).not.toBeNull();
  });

  it("drops the separate lead band", () => {
    const { container } = render(<LeistungenPage />);
    expect(container.textContent).not.toContain("Such dir aus, wo du anfangen willst.");
  });
});
