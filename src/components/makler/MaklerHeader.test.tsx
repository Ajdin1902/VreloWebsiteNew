import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaklerHeader } from "./MaklerHeader";
import { navLinks } from "@/lib/nav";
import { makler } from "@/lib/makler";

describe("MaklerHeader", () => {
  it("shows the brand lockup linked to the homepage", () => {
    render(<MaklerHeader />);
    expect(screen.getByRole("link", { name: /startseite/i })).toHaveAttribute("href", "/");
  });

  it("carries a CTA pointing at the booking section on the page", () => {
    render(<MaklerHeader />);
    const cta = screen.getByRole("link", { name: makler.cta.label });
    expect(cta).toHaveAttribute("href", "#termin");
  });

  it("swaps in a short CTA label on narrow screens", () => {
    // The full label wraps to two lines at 390px and collides with the logo,
    // which also grows the sticky header past the #termin scroll offset.
    render(<MaklerHeader />);
    const short = screen.getByRole("link", { name: makler.cta.short });
    expect(short).toHaveAttribute("href", "#termin");
    expect(short.parentElement).toHaveClass("sm:hidden");
    expect(screen.getByRole("link", { name: makler.cta.label }).parentElement).toHaveClass(
      "hidden",
      "sm:block",
    );
  });

  it("has no site navigation — the page has one job", () => {
    render(<MaklerHeader />);
    for (const l of navLinks) {
      expect(screen.queryByRole("link", { name: l.label })).not.toBeInTheDocument();
    }
  });
});
