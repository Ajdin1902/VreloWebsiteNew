import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ServiceGroups } from "./ServiceGroups";
import { leistungenPages } from "@/lib/leistungenPages";

describe("ServiceGroups", () => {
  it("shows the three doors in order", () => {
    render(<ServiceGroups />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Prüfen", "Bauen", "Betreiben"]);
  });

  it("links every service card to its subpage with its one-line definition", () => {
    render(<ServiceGroups />);
    for (const p of leistungenPages) {
      const card = screen.getByRole("link", { name: new RegExp("^" + p.navLabel.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&")) });
      expect(card).toHaveAttribute("href", `/leistungen/${p.slug}`);
      expect(within(card).getByText(p.kurz)).toBeInTheDocument();
    }
  });
});
