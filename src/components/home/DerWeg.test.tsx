import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DerWeg } from "./DerWeg";

describe("DerWeg", () => {
  it("names the three free steps in order and starts on a Vorlage (2026-11-11)", () => {
    render(<DerWeg />);
    expect(screen.getByRole("heading", { level: 2, name: /Kostenlos/ })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Vorlage holen",
      "Gespräch",
      "Fahrplan",
    ]);
    expect(screen.getByText("Nimm dir den Bauplan für deine Branche oder mach den Prozess-Check. Ohne Gespräch, ohne Kosten.")).toBeInTheDocument();
    expect(screen.getByText("30 Minuten. Ich gehe deine Abläufe mit dir durch und finde die Aufgabe, die dich am meisten Zeit kostet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" })).toHaveAttribute("href", "/vorlagen?src=home-weg");
    expect(screen.queryByRole("link", { name: "Erstgespräch buchen" })).toBeNull();
  });

  it("drops the intro line under the heading (Ajdin 2026-11-11)", () => {
    render(<DerWeg />);
    expect(screen.queryByText(/Drei Schritte/)).toBeNull();
  });
});
