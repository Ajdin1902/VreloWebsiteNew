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
  it("links each of the nine services to its subpage", () => {
    render(<WasIchBaue />);
    for (const p of leistungenPages)
      expect(screen.getByRole("link", { name: p.navLabel })).toHaveAttribute("href", `/leistungen/${p.slug}`);
  });

  // 2026-10-15: nine cards fill a 3 x 3 grid; in the two-column view the
  // ninth sits alone, so it is centered there (and only there).
  it("lays nine cards out 3 x 3 and centers the lone last card in two columns", () => {
    render(<WasIchBaue />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("lg:grid-cols-3");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(9);
    expect(items[8]).toHaveTextContent("Betreuung & Wartung");
    expect(items[8]).toHaveClass("sm:col-span-2", "lg:col-span-1");
    for (const item of items.slice(0, 8)) expect(item).not.toHaveClass("sm:col-span-2");
  });
});
