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
});
