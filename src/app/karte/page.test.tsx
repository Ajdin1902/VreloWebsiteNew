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

  it("anchors the card with the Vrelo brand mark", () => {
    render(<KartePage />);
    expect(screen.getByText("Vrelo")).toBeTruthy();
  });

  it("keeps Impressum and Datenschutz reachable without the site footer", () => {
    render(<KartePage />);
    expect(screen.getByRole("link", { name: "Impressum" }).getAttribute("href")).toBe("/impressum");
    expect(screen.getByRole("link", { name: "Datenschutz" }).getAttribute("href")).toBe("/datenschutz");
  });

  it("offers the Prozess-Check under the save button", () => {
    render(<KartePage />);
    expect(screen.getByRole("link", { name: "Prozess-Check" }).getAttribute("href")).toBe("/prozess-check?src=karte");
  });
});
