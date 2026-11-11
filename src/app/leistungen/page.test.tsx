import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeistungenPage from "./page";
import { leistungenHub } from "@/lib/leistungenPages";

// Ajdin 2026-11-11: the hub follows the subpages' order, with the three doors as the Lösung.
describe("/leistungen", () => {
  it("puts the line on the hero image, without a button", () => {
    render(<LeistungenPage />);
    const hero = screen.getByRole("heading", { level: 1, name: "Leistungen" }).closest("section")!;
    expect(hero.querySelector("img")).not.toBeNull();
    expect(hero).toHaveTextContent("Ich baue KI- und Prozessautomatisierungen, richte sie ein und halte sie am Laufen.");
    expect(hero.querySelectorAll("a")).toHaveLength(0);
  });

  it("runs Kennst du das?, the three doors, proof, Warum ich and the close, nothing else", () => {
    const { container } = render(<LeistungenPage />);
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual([
      leistungenHub.pain.heading,
      "Prüfen",
      "Bauen",
      "Betreiben",
      leistungenHub.szenen.heading,
      "Warum ich",
      leistungenHub.cta.heading,
    ]);
    expect(container.textContent).not.toContain("Wenn du mit mir baust");
    expect(container.textContent).not.toContain("Woran es bei den meisten scheitert");
  });

  it("closes on the Vorlagen with the hub's own src", () => {
    render(<LeistungenPage />);
    const links = screen.getAllByRole("link", { name: /Kostenlose Vorlagen ansehen/ });
    expect(links.at(-1)).toHaveAttribute("href", "/vorlagen?src=leistungen-close");
  });

  // Ajdin 2026-11-11: the KI-Agenten examples get their own card in the Bauen row.
  it("shows the KI-Agenten page as a card under Bauen", () => {
    const { container } = render(<LeistungenPage />);
    const bauen = container.querySelector("#gruppe-bauen")!.closest("section")!;
    const hrefs = [...bauen.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/leistungen/prozessautomatisierung", "/leistungen/ki-automatisierung", "/leistungen/ki-agenten"]);
    expect(bauen).toHaveTextContent("KI-Agenten");
  });
});
