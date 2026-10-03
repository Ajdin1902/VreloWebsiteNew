// src/app/claude-gehirn/page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GehirnPage from "./page";
import { getGehirnPrompt } from "@/lib/claudeGehirn";
import { gehirnPage } from "@/lib/claudeGehirnPage";

describe("/claude-gehirn", () => {
  it("puts the prompt right under the title, before any instructions", () => {
    render(<GehirnPage />);
    const h1 = screen.getByRole("heading", { level: 1, name: gehirnPage.top.title });
    const box = screen.getByLabelText(gehirnPage.prompt.boxLabel);
    const anleitung = screen.getByRole("heading", { level: 2, name: gehirnPage.anleitung.heading });
    expect(h1.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(box.compareDocumentPosition(anleitung) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows the exact prompt from the single source file", () => {
    render(<GehirnPage />);
    expect(screen.getByLabelText(gehirnPage.prompt.boxLabel).textContent).toBe(getGehirnPrompt());
  });

  it("opens without an image hero", () => {
    const { container } = render(<GehirnPage />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("asks for nothing: no link to the funnel or the contact page in the page body", () => {
    const { container } = render(<GehirnPage />);
    expect(container.querySelectorAll('a[href*="prozess-check"], a[href*="kontakt"]')).toHaveLength(0);
  });

  it("has exactly three short sections after the prompt", () => {
    render(<GehirnPage />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      gehirnPage.anleitung.heading,
      gehirnPage.danach.heading,
      gehirnPage.gutZuWissen.heading,
    ]);
  });

  it("closes with the non-affiliation line", () => {
    const { container } = render(<GehirnPage />);
    expect(container.textContent).toContain("nicht mit Anthropic verbunden");
  });
});
