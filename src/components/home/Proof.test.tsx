import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
    render(<Proof />);
    const link = screen.getByRole("link", { name: GARANTIE.faqLink });
    expect(link).toHaveAttribute("href", faqHref(GARANTIE.faqFrage));
    const questions = faqGroups.flatMap((g) => g.entries.map((e) => e.question));
    expect(questions).toContain(GARANTIE.faqFrage);
  });

  it("no longer carries the references (they live in their own section now)", () => {
    render(<Proof />);
    expect(screen.queryByText(/Erste Kundenreferenzen folgen/i)).toBeNull();
    expect(screen.queryByText("Referenzen")).toBeNull();
  });

  it("drops the lead-in line under the heading (copy trim 2026-09-26)", () => {
    const { container } = render(<Proof />);
    expect(container.textContent).not.toContain("Worauf du dich verlassen kannst");
  });
});
