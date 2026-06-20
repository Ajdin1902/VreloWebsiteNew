// src/components/ratgeber/ArticleCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/ratgeber";

const article: Article = {
  slug: "mein-artikel", title: "Mein Artikel", description: "Worum es geht.",
  date: "2026-05-28", tags: ["Termine"], draft: false, readingMinutes: 6, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Ruhige Wasserringe.",
};

describe("ArticleCard", () => {
  it("renders a typographic row: link, meta, lede, no thumbnail", () => {
    const { container } = render(<ArticleCard article={article} />);
    const link = screen.getByRole("link", { name: "Mein Artikel" });
    expect(link).toHaveAttribute("href", "/ratgeber/mein-artikel");
    expect(screen.getByText(/28\. Mai 2026/)).toBeInTheDocument();
    expect(screen.getByText(/6 Min/)).toBeInTheDocument();
    expect(screen.getByText(/Termine/)).toBeInTheDocument();
    expect(screen.getByText("Worum es geht.")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows an Entwurf marker for drafts", () => {
    render(<ArticleCard article={{ ...article, draft: true }} />);
    expect(screen.getByText(/Entwurf/)).toBeInTheDocument();
  });
});
