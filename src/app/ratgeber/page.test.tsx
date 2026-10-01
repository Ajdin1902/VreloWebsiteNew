import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RatgeberPage from "./page";

// Ajdin 2026-10-01: the Ratgeber index opens with the compact hero, like
// /leistungen, and its list is no longer pulled up under a paper intro.
describe("/ratgeber", () => {
  it("puts the line on the hero image, without a button", () => {
    render(<RatgeberPage />);
    const hero = screen.getByRole("heading", { level: 1, name: "Gedanken zur ruhigen Automatisierung" }).closest("section")!;
    expect(hero.querySelector("img")).not.toBeNull();
    expect(hero).toHaveTextContent("Praxisnahe Notizen, wie du wiederkehrende Arbeit abgibst und Zeit zurückgewinnst.");
    expect(hero.querySelectorAll("a")).toHaveLength(0);
  });

  it("does not pull the article list over the hero", () => {
    const { container } = render(<RatgeberPage />);
    expect(container.querySelector("section.-mt-24")).toBeNull();
  });
});
