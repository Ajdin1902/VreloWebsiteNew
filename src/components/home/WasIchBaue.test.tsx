import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WasIchBaue } from "./WasIchBaue";
import { leistungGroups } from "@/lib/leistungenPages";

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

  // 2026-11-05: four door cards instead of eight service chips; Prüfen goes to the
  // audit page, the other doors to their group on the hub.
  // 2026-11-11: three doors, Befähigen folded into KI-Automatisierung.
  it("shows the three doors in hub order, one card each", () => {
    render(<WasIchBaue />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.map((li) => li.textContent?.slice(0, 20))).toEqual(
      leistungGroups.map((g) => expect.stringContaining(g.label)),
    );
    expect(screen.getByRole("link", { name: /^Prüfen/ })).toHaveAttribute("href", "/leistungen/prozess-audit");
    expect(screen.getByRole("link", { name: /^Bauen/ })).toHaveAttribute("href", "/leistungen#gruppe-bauen");
    expect(screen.getByRole("link", { name: /^Betreiben/ })).toHaveAttribute("href", "/leistungen/betreuung");
  });
});
