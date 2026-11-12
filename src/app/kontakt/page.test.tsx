import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/components/kontakt/SchedulerEmbed", () => ({ SchedulerEmbed: () => null }));
vi.mock("@/components/kontakt/ContactForm", () => ({ ContactForm: () => <form aria-label="Kontaktformular" /> }));
vi.mock("@/components/RippleImage", () => ({ RippleImage: () => null }));
vi.mock("@/lib/contact", () => ({ isContactConfigured: () => true, contactTo: () => "", calLink: () => "x/y" }));

import KontaktPage from "./page";

// Ajdin 2026-11-12: Kontakt opens like the other subpages, names me and the
// address above the form, and the form sits on its own water image.
describe("/kontakt", () => {
  it("opens with the compact image hero", () => {
    render(<KontaktPage />);
    const hero = screen.getByRole("heading", { level: 1, name: "Lass uns deine Quelle bauen." }).closest("section")!;
    expect(hero.querySelector("img")).not.toBeNull();
    expect(hero).toHaveTextContent("Erzähl mir, was dich täglich Zeit kostet. Ich melde mich persönlich.");
  });

  it("names me and kontakt@vrelo-ki.de above the form section", () => {
    const { container } = render(<KontaktPage />);
    const zeile = container.querySelector("[data-kontakt-zeile]")!;
    expect(zeile).toHaveTextContent("Ajdin Dzafic");
    const mail = screen.getByRole("link", { name: "kontakt@vrelo-ki.de" });
    expect(mail).toHaveAttribute("href", "mailto:kontakt@vrelo-ki.de");
    expect(zeile).toContainElement(mail);
    const formBand = screen.getByRole("form", { name: "Kontaktformular" }).closest("section")!;
    expect(zeile.compareDocumentPosition(formBand) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("puts the form on the light-shaft image, the form card in front", () => {
    const formBand = (render(<KontaktPage />), screen.getByRole("form", { name: "Kontaktformular" }).closest("section")!);
    expect(formBand.querySelector("img")).toHaveAttribute("src", "/images/bg-lichtschacht.webp");
    expect(screen.getByRole("form", { name: "Kontaktformular" }).parentElement).toHaveClass("bg-amber");
  });
});
