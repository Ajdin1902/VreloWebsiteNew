// src/components/ratgeber/ArticleHeader.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleHeader } from "./ArticleHeader";
import type { Article } from "@/lib/ratgeber";

const article: Article = {
  slug: "x", title: "Der Titel", description: "Die kurze Einleitung.",
  date: "2026-05-28", tags: ["Termine", "Automatisierung"],
  draft: false, readingMinutes: 6, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.",
};

describe("ArticleHeader", () => {
  it("renders an editorial header: left-aligned, lede, meta with date/reading/tags", () => {
    const { container } = render(<ArticleHeader article={article} />);
    const header = container.querySelector("header")!;
    expect(header.className).toContain("max-w-2xl");
    expect(header.className).not.toContain("text-center");
    const h1 = screen.getByRole("heading", { level: 1, name: "Der Titel" });
    expect(h1).toHaveClass("font-serif");
    expect(screen.getByText(/Die kurze Einleitung/)).toBeInTheDocument();
    expect(screen.getByText(/28\. Mai 2026/)).toBeInTheDocument();
    expect(screen.getByText(/6 Min Lesezeit/)).toBeInTheDocument();
    expect(screen.getByText(/Termine/)).toBeInTheDocument();
    expect(screen.getByText(/Automatisierung/)).toBeInTheDocument();
  });

  it("marks drafts", () => {
    render(<ArticleHeader article={{ ...article, draft: true }} />);
    expect(screen.getByText(/Entwurf/)).toBeInTheDocument();
  });
});
