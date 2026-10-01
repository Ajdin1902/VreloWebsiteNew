import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WasIchBaue } from "./WasIchBaue";
import { leistungenPages } from "@/lib/leistungenPages";

describe("WasIchBaue", () => {
  it("renders on a deep cool band (Spine A god-rays)", () => {
    const { container } = render(<WasIchBaue />);
    expect(container.querySelector("section")).toHaveClass("bg-tiefes-wasser");
  });

  it("uses an amber accent for the link (legible on petrol)", () => {
    render(<WasIchBaue />);
    expect(screen.getByRole("link", { name: /Alle Leistungen ansehen/i })).toHaveClass(
      "text-honig",
    );
  });

  it("drops the lead that repeated the Proof cards (copy trim 2026-09-26)", () => {
    const { container } = render(<WasIchBaue />);
    expect(container.textContent).not.toContain("Ein Ansprechpartner, der weiß");
  });
  it("links each of the seven services to its subpage", () => {
    render(<WasIchBaue />);
    for (const p of leistungenPages)
      expect(screen.getByRole("link", { name: p.navLabel })).toHaveAttribute("href", `/leistungen/${p.slug}`);
  });
});
