import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MerakClose } from "./MerakClose";

describe("MerakClose", () => {
  // The close answers the Problem section with the dream outcome.
  it("mirrors the hero problem with the dream outcome", () => {
    render(<MerakClose />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Die Prozesse laufen von selbst. Deine Zeit gehört wieder dir." }),
    ).toBeInTheDocument();
  });

  it("keeps the Merak-Effekt as the one line under the headline", () => {
    const { container } = render(<MerakClose />);
    expect(screen.getByText(/Merak/)).toBeInTheDocument();
    // Review 2026-11-04: the page explains the word where it first uses it.
    expect(screen.getByText(/der Moment, in dem Ruhe einkehrt, weil etwas einfach läuft\./)).toBeInTheDocument();
    expect(container.textContent).not.toContain("Der erste Schritt dauert drei Minuten");
  });

  it("leads straight to the check, with the cost line and the quiet call link", () => {
    render(<MerakClose />);
    expect(screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" })).toHaveAttribute(
      "href",
      "/vorlagen?src=home-close",
    );
    expect(screen.getByText("Vorlage, Gespräch und Fahrplan: alles kostenlos.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Erstgespräch buchen" })).toBeNull();
  });

  it("drops the no-sales-call line (the button leads to a questionnaire now)", () => {
    const { container } = render(<MerakClose />);
    expect(container.textContent).not.toContain("Kein Verkaufsgespräch");
  });
});
