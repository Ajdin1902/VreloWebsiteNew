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

  it("sends the one primary CTA to the Prozess-Check", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=home-hero",
    );
  });

  it("names the friction reducers under the CTA", () => {
    render(<Hero />);
    expect(screen.getByText("Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.")).toBeInTheDocument();
  });

  it("keeps the Erstgespräch as a quiet secondary link", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });

  it("applies the staggered reveal classes (H1 rise-only, sub + CTA fade-up)", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("hero-reveal-h1");
    expect(screen.getByText("Maßgeschneiderte Automatisierungen geben dir deine Stunden zurück. Finde in drei Minuten heraus, wo du anfängst.")).toHaveClass("hero-reveal-sub");
    const ctaWrapper = screen.getByRole("link", { name: "Prozess-Check starten" }).parentElement as HTMLElement;
    expect(ctaWrapper).toHaveClass("hero-reveal-cta");
  });
});
