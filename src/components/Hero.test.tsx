import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("leads the H1 with the short pain headline", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Manuelle Prozesse rauben dir die Zeit/);
  });

  it("renders the Merak scene image", () => {
    render(<Hero />);
    const img = screen.getByTestId("hero-image") as HTMLImageElement;
    expect(img.getAttribute("src") || "").toMatch(/hero-flow/);
  });

  it("uses the token-hardened deep-water background (no inline gradient)", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("hero-deepwater");
    expect(section?.getAttribute("style")).toBeFalsy();
  });

  // Ajdin 2026-11-11: the hero names what is free and what is guaranteed.
  it("names the free audit and the 2-week guarantee in the sub line", () => {
    render(<Hero />);
    expect(
      screen.getByText(
        "Maßgeschneiderte Automatisierungen geben dir deine Stunden zurück. Kostenloser Prozess-Audit mit Fahrplan. Erste Ergebnisse nach 2 Wochen, sonst bekommst du dein Geld zurück.",
      ),
    ).toBeInTheDocument();
  });

  it("sends the one primary CTA to the Vorlagen", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" })).toHaveAttribute(
      "href",
      "/vorlagen?src=home-hero",
    );
  });

  it("names the friction reducers under the CTA", () => {
    render(<Hero />);
    expect(screen.getByText("Bauplan für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos.")).toBeInTheDocument();
  });

  it("has no Erstgespräch link in the hero (Ajdin 2026-11-11)", () => {
    render(<Hero />);
    expect(screen.queryByRole("link", { name: "Erstgespräch buchen" })).toBeNull();
  });

  it("applies the staggered reveal classes (H1 rise-only, sub + CTA fade-up)", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("hero-reveal-h1");
    expect(screen.getByText(/^Maßgeschneiderte Automatisierungen geben dir deine Stunden zurück\./)).toHaveClass("hero-reveal-sub");
    const ctaWrapper = screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" }).parentElement as HTMLElement;
    expect(ctaWrapper).toHaveClass("hero-reveal-cta");
  });
});
