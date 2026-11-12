import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Proof } from "./Proof";
import { GARANTIE } from "@/lib/garantie";
import { faqGroups, faqHref } from "@/lib/faq";

describe("Proof", () => {
  it("renders the heading and six value cards (guarantee + ownership since 2026-11-04)", () => {
    render(<Proof />);
    expect(
      screen.getByRole("heading", { name: /Sorgfältig gebaut\. Verlässlich im Betrieb\./i }),
    ).toBeInTheDocument();
    for (const title of [
      "Ein Ansprechpartner.",
      "Praxiserprobt.",
      "Maßgeschneidert statt von der Stange.",
      "Du wartest nichts.",
      "Alles gehört dir.",
      "Erste Ergebnisse in 2 Wochen. Sonst Geld zurück.",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("links the guarantee card to its conditions in the FAQ (UWG §5)", () => {
    const { container } = render(<Proof />);
    const link = container.querySelector<HTMLAnchorElement>("[data-liste] a")!;
    expect(link).toHaveTextContent(GARANTIE.faqLink);
    expect(link).toHaveAttribute("href", faqHref(GARANTIE.faqFrage));
    const questions = faqGroups.flatMap((g) => g.entries.map((e) => e.question));
    expect(questions).toContain(GARANTIE.faqFrage);
  });

  it("no longer carries the references (they live in their own section now)", () => {
    render(<Proof />);
    expect(screen.queryByText(/Erste Kundenreferenzen folgen/i)).toBeNull();
    expect(screen.queryByText("Referenzen")).toBeNull();
  });

  // Ajdin 2026-11-12: like the KI-Agenten page, Vrelo in the middle and the
  // reasons around it; a click shows the reason in the middle.
  it("puts Vrelo in the middle and the six reasons on a ring", () => {
    const { container } = render(<Proof />);
    const kreis = container.querySelector("[data-kreis]")!;
    expect(kreis.parentElement).toHaveClass("hidden", "lg:block");
    const mitte = kreis.querySelector("[data-mitte]")!;
    expect(mitte).toHaveTextContent("Vrelo");
    expect(kreis.querySelectorAll("button[data-knoten]")).toHaveLength(6);
    expect(container.querySelector("[data-liste]")).toHaveClass("lg:hidden");
  });

  it("shows a reason in the middle on click and returns on a second click", () => {
    const { container } = render(<Proof />);
    const kreis = container.querySelector("[data-kreis]")!;
    const mitte = kreis.querySelector("[data-mitte]")!;
    const knoten = kreis.querySelector<HTMLButtonElement>('button[data-knoten="ansprechpartner"]')!;
    fireEvent.click(knoten);
    expect(knoten).toHaveAttribute("aria-pressed", "true");
    expect(mitte).toHaveTextContent("Du redest immer mit mir. Kein Team, keine Tickets, keine Warteschleife.");
    fireEvent.click(knoten);
    expect(knoten).toHaveAttribute("aria-pressed", "false");
    expect(mitte).toHaveTextContent("Vrelo");
  });

  // Ajdin 2026-11-12: option D, light papier middle with an ember ring; the
  // close link in petrol so it reads on the light circle.
  it("draws the middle light with an ember ring and a petrol close link", () => {
    const { container } = render(<Proof />);
    const kreis = container.querySelector("[data-kreis]")!;
    const mitte = kreis.querySelector("[data-mitte]")!;
    expect(mitte).toHaveClass("bg-papier/90", "border-ember");
    expect(mitte.querySelector("span")).toHaveClass("text-tiefes-wasser");
    fireEvent.click(kreis.querySelector('button[data-knoten="praxis"]')!);
    expect(screen.getByRole("button", { name: "Zurück zur Übersicht" })).toHaveClass("text-vrelo-petrol");
  });

  it("keeps the guarantee conditions one click away inside the ring", () => {
    const { container } = render(<Proof />);
    const kreis = container.querySelector("[data-kreis]")!;
    fireEvent.click(kreis.querySelector('button[data-knoten="garantie"]')!);
    const link = kreis.querySelector("[data-mitte] a")!;
    expect(link).toHaveAttribute("href", faqHref(GARANTIE.faqFrage));
  });

  it("drops the lead-in line under the heading (copy trim 2026-09-26)", () => {
    const { container } = render(<Proof />);
    expect(container.textContent).not.toContain("Worauf du dich verlassen kannst");
  });
});
