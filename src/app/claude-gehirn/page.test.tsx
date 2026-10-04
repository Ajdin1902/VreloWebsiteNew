// src/app/claude-gehirn/page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import GehirnPage from "./page";
import { getGehirnPrompt } from "@/lib/claudeGehirn";
import { gehirnPage } from "@/lib/claudeGehirnPage";

const after = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("/claude-gehirn", () => {
  it("puts requirements and the prompt right under the title, before any instructions", () => {
    render(<GehirnPage />);
    const h1 = screen.getByRole("heading", { level: 1, name: gehirnPage.top.title });
    const req = screen.getByText(gehirnPage.top.voraussetzungen[0]);
    const box = screen.getByLabelText(gehirnPage.prompt.boxLabel);
    const anleitung = screen.getByRole("heading", { level: 2, name: gehirnPage.anleitung.heading });
    expect(after(h1, req)).toBe(true);
    expect(after(req, box)).toBe(true);
    expect(after(box, anleitung)).toBe(true);
  });

  it("passes the whole-text hint to the prompt box", () => {
    render(<GehirnPage />);
    expect(screen.getByRole("status")).toHaveTextContent(gehirnPage.prompt.hintLabel);
  });

  it("shows the exact prompt from the single source file", () => {
    render(<GehirnPage />);
    expect(screen.getByLabelText(gehirnPage.prompt.boxLabel).textContent).toBe(getGehirnPrompt());
  });

  it("opens without an image hero", () => {
    const { container } = render(<GehirnPage />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("plays the tutorial only on request: controls, poster, no autoplay", () => {
    const { container } = render(<GehirnPage />);
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video!.hasAttribute("controls")).toBe(true);
    expect(video!.hasAttribute("autoplay")).toBe(false);
    expect(video!.getAttribute("poster")).toBe(gehirnPage.anleitung.video.poster);
    expect(video!.getAttribute("src")).toBe(gehirnPage.anleitung.video.src);
    expect(video!.getAttribute("aria-label")).toBe(gehirnPage.anleitung.video.label);
  });

  it("renders the folder comparison as a table with four column headers", () => {
    render(<GehirnPage />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(gehirnPage.speicherort.columns);
    expect(within(table).getAllByRole("row")).toHaveLength(3);
  });

  it("shows the other-ways note right after the folder tree", () => {
    render(<GehirnPage />);
    const note = screen.getByText(gehirnPage.ordner.andereWege);
    const beachten = screen.getByRole("heading", { level: 2, name: gehirnPage.beachten.heading });
    expect(after(screen.getByText(gehirnPage.ordner.tree[4].note), note)).toBe(true);
    expect(after(note, beachten)).toBe(true);
    const sub = screen.getByRole("heading", { level: 3, name: gehirnPage.ordner.andereWegeTitel });
    expect(after(sub, note)).toBe(true);
  });

  it("asks for nothing: no link to the funnel or the contact page in the page body", () => {
    const { container } = render(<GehirnPage />);
    expect(container.querySelectorAll('a[href*="prozess-check"], a[href*="kontakt"]')).toHaveLength(0);
  });

  it("has the six sections after the prompt, vision first", () => {
    render(<GehirnPage />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      gehirnPage.vision.heading,
      gehirnPage.anleitung.heading,
      gehirnPage.speicherort.heading,
      gehirnPage.ordner.heading,
      gehirnPage.beachten.heading,
      gehirnPage.gutZuWissen.heading,
    ]);
  });

  it("closes with the non-affiliation line", () => {
    const { container } = render(<GehirnPage />);
    expect(container.textContent).toContain("nicht mit Anthropic verbunden");
  });
});
