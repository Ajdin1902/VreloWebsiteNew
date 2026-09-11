import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KartePage, { metadata } from "./page";

describe("KartePage", () => {
  it("is noindex", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("shows the contact details and a save link", () => {
    render(<KartePage />);
    expect(screen.getByText("Ajdin Dzafic")).toBeTruthy();
    expect(screen.getByText(/Automatisierung für Betriebe/)).toBeTruthy();
    expect(screen.getByText("ajdin@vrelo-ki.de")).toBeTruthy();
    expect(screen.getByText("+49 176 4380 6085")).toBeTruthy();
    const save = screen.getByText("Kontakt speichern").closest("a");
    expect(save?.getAttribute("href")).toBe("/karte/kontakt.vcf");
  });

  it("links email and phone as tap targets", () => {
    render(<KartePage />);
    expect(screen.getByText("ajdin@vrelo-ki.de").closest("a")?.getAttribute("href"))
      .toBe("mailto:ajdin@vrelo-ki.de");
    expect(screen.getByText("+49 176 4380 6085").closest("a")?.getAttribute("href"))
      .toBe("tel:+4917643806085");
  });
});
