// src/app/claude-gehirn/page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GehirnPage from "./page";
import { getGehirnPrompt } from "@/lib/claudeGehirn";
import { gehirnPage } from "@/lib/claudeGehirnPage";

describe("/claude-gehirn", () => {
  it("opens on the hero title without a button", () => {
    render(<GehirnPage />);
    const hero = screen.getByRole("heading", { level: 1, name: gehirnPage.hero.title }).closest("section")!;
    expect(hero.querySelectorAll("a")).toHaveLength(0);
  });

  it("shows the exact prompt from the single source file", () => {
    render(<GehirnPage />);
    expect(screen.getByLabelText(gehirnPage.prompt.boxLabel).textContent).toBe(getGehirnPrompt());
  });

  it("asks for nothing: no link to the funnel or the contact page in the page body", () => {
    const { container } = render(<GehirnPage />);
    expect(container.querySelectorAll('a[href*="prozess-check"], a[href*="kontakt"]')).toHaveLength(0);
  });

  it("names every section heading", () => {
    render(<GehirnPage />);
    for (const h of [
      gehirnPage.voraussetzungen.heading,
      gehirnPage.schritte.heading,
      gehirnPage.ordner.heading,
      gehirnPage.prompt.heading,
      gehirnPage.ergebnis.heading,
      gehirnPage.regeln.heading,
      gehirnPage.alltag.heading,
      gehirnPage.nichtHinein.heading,
      gehirnPage.fragen.heading,
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: h })).toBeInTheDocument();
    }
  });

  it("closes with the non-affiliation line", () => {
    const { container } = render(<GehirnPage />);
    expect(container.textContent).toContain("nicht mit Anthropic verbunden");
  });
});
