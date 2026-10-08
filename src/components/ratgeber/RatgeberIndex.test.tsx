// src/components/ratgeber/RatgeberIndex.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RatgeberIndex } from "./RatgeberIndex";
import type { Article, RatgeberKategorie } from "@/lib/ratgeber";

const a = (slug: string, title: string): Article => ({
  slug, title, description: "d", date: "2026-05-01", tags: [],
  draft: false, readingMinutes: 1, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.",
});

describe("RatgeberIndex", () => {
  it("renders a row per article", () => {
    render(<RatgeberIndex articles={[a("one", "Eins"), a("two", "Zwei")]} />);
    // „Eins“ is the newest (first on equal dates), so it also leads under „Neu“.
    expect(screen.getAllByRole("link", { name: "Eins" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Zwei" })).toHaveLength(1);
  });

  it("renders a calm placeholder when empty", () => {
    render(<RatgeberIndex articles={[]} />);
    expect(screen.getByText("Hier entsteht der Ratgeber.")).toBeInTheDocument();
  });

  it("groups articles under their kategorie in the order Grundlagen, Praxis, Kosten, Meinung", () => {
    const mk = (slug: string, kategorie?: RatgeberKategorie): Article => ({ ...a(slug, slug), kategorie });
    render(<RatgeberIndex articles={[mk("m", "Meinung"), mk("k", "Kosten"), mk("p", "Praxis"), mk("g", "Grundlagen"), mk("w")]} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Neu", "Grundlagen", "Praxis", "Kosten", "Meinung", "Weitere"]);
    // Article titles drop one level under their group heading. Same dates, so the first one is "Neu".
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["m", "g", "p", "k", "m", "w"]);
  });

  it("puts the newest article on top under Neu and keeps it in its kategorie", () => {
    const at = (slug: string, date: string, kategorie: RatgeberKategorie): Article => ({ ...a(slug, slug), date, kategorie });
    render(<RatgeberIndex articles={[at("alt", "2026-08-01", "Praxis"), at("neu", "2026-10-08", "Meinung"), at("mitte", "2026-09-01", "Praxis")]} />);
    const neu = screen.getByRole("region", { name: "Neu" });
    expect(within(neu).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["neu"]);
    expect(within(screen.getByRole("region", { name: "Meinung" })).getByRole("link", { name: "neu" })).toBeInTheDocument();
  });
});
