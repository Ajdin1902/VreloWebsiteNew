import { describe, it, expect } from "vitest";
import {
  readingMinutes,
  formatDate,
  parseArticle,
  selectArticles,
  type Article,
} from "./ratgeber";

const sampleMdx = `---
title: "Beispielartikel"
description: "Eine kurze Beschreibung."
date: "2026-05-20"
tags: ["Zeit", "Praxis"]
draft: true
---

Erster Absatz mit ein paar Wörtern.
`;

describe("readingMinutes", () => {
  it("rounds words / 200 up to at least 1", () => {
    expect(readingMinutes("eins zwei drei")).toBe(1);
    expect(readingMinutes(Array(400).fill("wort").join(" "))).toBe(2);
  });
});

describe("formatDate", () => {
  it("formats an ISO date as a German long date (UTC-stable)", () => {
    expect(formatDate("2026-05-28")).toBe("28. Mai 2026");
  });
});

describe("parseArticle", () => {
  it("parses frontmatter, derives slug from filename, computes reading time", () => {
    const a = parseArticle("beispielartikel.mdx", sampleMdx);
    expect(a.slug).toBe("beispielartikel");
    expect(a.title).toBe("Beispielartikel");
    expect(a.description).toBe("Eine kurze Beschreibung.");
    expect(a.date).toBe("2026-05-20");
    expect(a.tags).toEqual(["Zeit", "Praxis"]);
    expect(a.draft).toBe(true);
    expect(a.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(a.body).toContain("Erster Absatz");
    expect(a.body).not.toContain("title:");
  });

  it("defaults draft to false and tags to [] when absent", () => {
    const a = parseArticle("x.mdx", `---\ntitle: "T"\ndescription: "D"\ndate: "2026-01-01"\n---\nBody`);
    expect(a.draft).toBe(false);
    expect(a.tags).toEqual([]);
  });
});

describe("selectArticles", () => {
  const base: Omit<Article, "slug" | "date"> = {
    title: "t", description: "d", tags: [], draft: false, readingMinutes: 1, body: "b",
  };
  const articles: Article[] = [
    { ...base, slug: "old", date: "2026-01-01" },
    { ...base, slug: "new", date: "2026-03-01" },
    { ...base, slug: "draft", date: "2026-02-01", draft: true },
  ];

  it("sorts newest-first and excludes drafts when includeDrafts is false", () => {
    const r = selectArticles(articles, { includeDrafts: false });
    expect(r.map((a) => a.slug)).toEqual(["new", "old"]);
  });

  it("includes drafts (still newest-first) when includeDrafts is true", () => {
    const r = selectArticles(articles, { includeDrafts: true });
    expect(r.map((a) => a.slug)).toEqual(["new", "draft", "old"]);
  });
});
