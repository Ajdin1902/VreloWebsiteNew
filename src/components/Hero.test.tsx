import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("keeps the H1 with the Vrelo and Merak brand words", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Vrelo errichtet die Quelle/);
    expect(h1).toHaveTextContent(/Merak-Effekt/);
  });

  it("renders the ripple water panel image", () => {
    render(<Hero />);
    const img = screen.getByTestId("ripple-img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/video/hero-quelle.jpg");
  });

  it("uses the token-hardened deep-water background (no inline gradient)", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("hero-deepwater");
    expect(section?.getAttribute("style")).toBeFalsy();
  });

  it("keeps a single primary CTA", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Quelle erkunden" })).toBeInTheDocument();
  });

  it("applies the staggered reveal classes (H1 rise-only, sub + CTA fade-up)", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("hero-reveal-h1");
    expect(
      screen.getByText(/Maßgeschneiderte Automatisierungen/),
    ).toHaveClass("hero-reveal-sub");
    const ctaWrapper = screen.getByRole("link", { name: "Quelle erkunden" })
      .parentElement as HTMLElement;
    expect(ctaWrapper).toHaveClass("hero-reveal-cta");
  });
});
