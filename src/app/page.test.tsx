import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Home from "./page";

describe("homepage", () => {
  it("renders eight sections in front-door order, with no Steps section", () => {
    const { container } = render(<Home />);
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual([
      "Der Kleinkram frisst deinen Tag.",
      "Wie viele Stunden sind es bei dir?",
      "Ich nehme dir die immer gleichen Aufgaben ab.",
      "Läuft mit den Werkzeugen, die du schon nutzt.",
      "Sorgfältig gebaut. Verlässlich im Betrieb.",
      "So läuft es in echten Betrieben.",
      "Stell dir den Montagmorgen vor, an dem schon zwei Stunden Arbeit erledigt sind.",
    ]);
    expect(container.textContent).not.toContain("In drei klaren Schritten");
  });
});
