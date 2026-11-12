import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { VORLAGEN_CTA } from "@/lib/prozessCheckCta";

describe("Hero", () => {
  // Ajdin 2026-11-12: three short words, start to finish, ending on the result.
  it("says the whole path in three words", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Prüfen\. Bauen\. Läuft\.$/);
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

  // Ajdin 2026-11-12: the sub says what we do, plain text (the button carries the link); no guarantee in the hero.
  it("explains the three words in the sub, without a link", () => {
    render(<Hero />);
    const sub = screen.getByText("Wir prüfen deine Prozesse und automatisieren, was dich jeden Tag Zeit kostet. Fang mit der kostenlosen Vorlage für deine Branche an.");
    expect(sub.tagName).toBe("P");
    expect(sub.querySelector("a")).toBeNull();
    expect(screen.queryByText(/Geld zurück/)).toBeNull();
  });

  it("sends the one primary CTA to the Vorlagen", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" })).toHaveAttribute(
      "href",
      "/vorlagen?src=home-hero",
    );
  });

  it("carries no extra line under the button (the sub says it)", () => {
    render(<Hero />);
    expect(screen.queryByText("Bauplan für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos.")).toBeNull();
  });

  it("has no Erstgespräch link in the hero (Ajdin 2026-11-11)", () => {
    render(<Hero />);
    expect(screen.queryByRole("link", { name: "Erstgespräch buchen" })).toBeNull();
  });

  it("applies the staggered reveal classes (H1 rise-only, sub + CTA fade-up)", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("hero-reveal-h1");
    expect(screen.getByText(/^Wir prüfen deine Prozesse/)).toHaveClass("hero-reveal-sub");
    const ctaWrapper = screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" }).parentElement as HTMLElement;
    expect(ctaWrapper).toHaveClass("hero-reveal-cta");
  });
});
