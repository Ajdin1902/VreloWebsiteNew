// src/components/ratgeber/RatgeberIndex.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RatgeberIndex } from "./RatgeberIndex";
import type { Article, RatgeberKategorie } from "@/lib/ratgeber";

const a = (slug: string, date = "2026-05-01", kategorie?: RatgeberKategorie): Article => ({
  slug, title: slug, description: "d", date, tags: [],
  draft: false, readingMinutes: 1, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.", kategorie,
});

const titles = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

describe("RatgeberIndex", () => {
  it("renders a calm placeholder when empty", () => {
    render(<RatgeberIndex articles={[]} />);
    expect(screen.getByText("Hier entsteht der Ratgeber.")).toBeInTheDocument();
  });

  it("lists every article once, newest first", () => {
    render(<RatgeberIndex articles={[a("alt", "2026-06-01", "Praxis"), a("neu", "2026-10-08", "Meinung"), a("mitte", "2026-09-01", "Grundlagen")]} />);
    expect(titles()).toEqual(["neu", "mitte", "alt"]);
    expect(screen.getAllByRole("link", { name: "neu" })).toHaveLength(1);
  });

  it("offers Alle plus every kategorie that has articles, with counts", () => {
    render(<RatgeberIndex articles={[a("p1", "2026-06-01", "Praxis"), a("p2", "2026-07-01", "Praxis"), a("k", "2026-08-01", "Kosten"), a("w")]} />);
    const buttons = screen.getAllByRole("button").map((b) => b.textContent);
    expect(buttons).toEqual(["Alle4", "Praxis2", "Kosten1"]);
    expect(screen.getByRole("button", { name: /Alle/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("filters to one kategorie and back to all", () => {
    render(<RatgeberIndex articles={[a("p", "2026-06-01", "Praxis"), a("k", "2026-08-01", "Kosten"), a("g", "2026-07-01", "Grundlagen")]} />);
    fireEvent.click(screen.getByRole("button", { name: /Praxis/ }));
    expect(titles()).toEqual(["p"]);
    expect(screen.getByRole("button", { name: /Praxis/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /Alle/ }));
    expect(titles()).toEqual(["k", "g", "p"]);
  });
});
