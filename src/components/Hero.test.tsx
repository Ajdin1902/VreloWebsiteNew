import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { GARANTIE } from "@/lib/garantie";
import { VORLAGEN_CTA } from "@/lib/prozessCheckCta";

describe("Hero", () => {
  // Ajdin 2026-11-11: the H1 names the free result instead of the pain.
  it("leads the H1 with the free result", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Dein Fahrplan zum früheren Feierabend. Kostenlos.");
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
  // Ajdin 2026-11-11: no link in the sub, the one click is the Vorlagen button.
  it("sends the sub line to the Vorlagen, names the free Fahrplan and the guarantee as plain text", () => {
    render(<Hero />);
    expect(
      screen.getByText((_, el) => el?.tagName === "P" && el.textContent === "Nimm dir die kostenlose Vorlage für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos. " + GARANTIE.hero),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: GARANTIE.hero })).toBeNull();
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
    expect(screen.queryByText(VORLAGEN_CTA.microcopy)).toBeNull();
  });

  it("has no Erstgespräch link in the hero (Ajdin 2026-11-11)", () => {
    render(<Hero />);
    expect(screen.queryByRole("link", { name: "Erstgespräch buchen" })).toBeNull();
  });

  it("applies the staggered reveal classes (H1 rise-only, sub + CTA fade-up)", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("hero-reveal-h1");
    expect(screen.getByText(/^Nimm dir die kostenlose Vorlage/)).toHaveClass("hero-reveal-sub");
    const ctaWrapper = screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" }).parentElement as HTMLElement;
    expect(ctaWrapper).toHaveClass("hero-reveal-cta");
  });
});
