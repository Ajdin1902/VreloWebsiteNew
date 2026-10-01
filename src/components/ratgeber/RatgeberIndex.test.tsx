// src/components/ratgeber/RatgeberIndex.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatgeberIndex } from "./RatgeberIndex";
import type { Article } from "@/lib/ratgeber";

const a = (slug: string, title: string): Article => ({
  slug, title, description: "d", date: "2026-05-01", tags: [],
  draft: false, readingMinutes: 1, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.",
});

describe("RatgeberIndex", () => {
  it("renders a row per article", () => {
    render(<RatgeberIndex articles={[a("one", "Eins"), a("two", "Zwei")]} />);
    expect(screen.getByRole("link", { name: "Eins" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zwei" })).toBeInTheDocument();
  });

  it("renders a calm placeholder when empty", () => {
    render(<RatgeberIndex articles={[]} />);
    expect(screen.getByText("Hier entsteht der Ratgeber.")).toBeInTheDocument();
  });

  it("groups articles under their kategorie in the order Grundlagen, Praxis, Kosten", () => {
    const mk = (slug: string, kategorie?: "Grundlagen" | "Praxis" | "Kosten"): Article => ({ ...a(slug, slug), kategorie });
    render(<RatgeberIndex articles={[mk("k", "Kosten"), mk("p", "Praxis"), mk("g", "Grundlagen"), mk("w")]} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Grundlagen", "Praxis", "Kosten", "Weitere"]);
    // Article titles drop one level under their group heading.
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["g", "p", "k", "w"]);
  });
});
