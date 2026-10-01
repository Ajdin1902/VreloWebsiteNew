import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FaqPage from "./page";

// Ajdin 2026-10-01: FAQ opens with the compact hero (line on the image, no
// button, no separate lead band), like /leistungen.
describe("/faq", () => {
  it("puts the line on the hero image, without a button", () => {
    render(<FaqPage />);
    const hero = screen.getByRole("heading", { level: 1, name: "Häufige Fragen" }).closest("section")!;
    expect(hero.querySelector("img")).not.toBeNull();
    expect(hero).toHaveTextContent("Was Betriebe und Unternehmen vor der Zusammenarbeit am häufigsten fragen.");
    expect(hero.querySelectorAll("a")).toHaveLength(0);
  });

  it("drops the separate lead band", () => {
    const { container } = render(<FaqPage />);
    expect(container.textContent).not.toContain("Deine Frage ist nicht dabei?");
  });
});
