// src/components/ratgeber/RatgeberIndex.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatgeberIndex } from "./RatgeberIndex";
import type { Article } from "@/lib/ratgeber";

const a = (slug: string, title: string): Article => ({
  slug, title, description: "d", date: "2026-05-01", tags: [],
  draft: false, readingMinutes: 1, body: "b",
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
});
