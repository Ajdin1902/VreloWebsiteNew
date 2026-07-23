import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaklerHeader } from "./MaklerHeader";
import { navLinks } from "@/lib/nav";

describe("MaklerHeader", () => {
  it("shows the brand lockup linked to the homepage", () => {
    render(<MaklerHeader />);
    expect(screen.getByRole("link", { name: /startseite/i })).toHaveAttribute("href", "/");
  });

  it("carries a CTA pointing at the booking section on the page", () => {
    render(<MaklerHeader />);
    const cta = screen.getByRole("link", { name: "Erstgespräch vereinbaren" });
    expect(cta).toHaveAttribute("href", "#termin");
  });

  it("has no site navigation — the page has one job", () => {
    render(<MaklerHeader />);
    for (const l of navLinks) {
      expect(screen.queryByRole("link", { name: l.label })).not.toBeInTheDocument();
    }
  });
});
