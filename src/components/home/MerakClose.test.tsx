import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MerakClose } from "./MerakClose";

describe("MerakClose", () => {
  // The close answers the hero („Manuelle Prozesse rauben dir die Zeit.“) with
  // the dream outcome, so the page opens on the pain and ends on it solved.
  it("mirrors the hero problem with the dream outcome", () => {
    render(<MerakClose />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Die Prozesse laufen von selbst. Deine Zeit gehört wieder dir." }),
    ).toBeInTheDocument();
  });

  it("keeps the Merak-Effekt as the one line under the headline", () => {
    const { container } = render(<MerakClose />);
    expect(screen.getByText(/Merak/)).toBeInTheDocument();
    expect(container.textContent).not.toContain("Der erste Schritt dauert drei Minuten");
  });

  it("leads straight to the check, with the cost line and the quiet call link", () => {
    render(<MerakClose />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=home-close",
    );
    expect(screen.getByText("Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });

  it("drops the no-sales-call line (the button leads to a questionnaire now)", () => {
    const { container } = render(<MerakClose />);
    expect(container.textContent).not.toContain("Kein Verkaufsgespräch");
  });
});
