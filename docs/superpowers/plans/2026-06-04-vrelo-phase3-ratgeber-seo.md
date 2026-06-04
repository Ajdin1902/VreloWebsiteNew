# Vrelo Phase 3 — Ratgeber (MDX) + SEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/ratgeber` into a working German MDX blog and lay the full site-wide SEO foundation (JSON-LD, sitemap, robots, branded OG images), with three draft seed articles.

**Architecture:** Content collection at `content/ratgeber/*.mdx` read by a typed loader (`src/lib/ratgeber.ts`) that splits pure parsing/selection logic from `fs` IO. Articles render via `next-mdx-remote/rsc` with a brand-styled components map (`Prose`) and a dependency-free remark plugin that auto-wraps „Vrelo“/„Merak“ in `<BrandWord>`. Drafts are dev-only (rendered in `next dev`, excluded + 404 in production). SEO is plain typed JSON-LD builders + Next metadata routes (`sitemap.ts`, `robots.ts`, `opengraph-image.tsx`).

**Tech Stack:** Next.js 16 (App Router, RSC, Turbopack) · TypeScript · Tailwind v4 (`@theme` tokens) · `next-mdx-remote` v6 · `gray-matter` · Vitest + React Testing Library · `next/og` (`ImageResponse`).

**Spec:** [docs/superpowers/specs/2026-06-04-vrelo-phase3-ratgeber-seo-design.md](../specs/2026-06-04-vrelo-phase3-ratgeber-seo-design.md)

**Branch:** `feat/phase3-ratgeber-seo` (already checked out). Commit after every task. Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## Conventions (read once)

- **Commands:** `npm test` (Vitest, run-once) · `npx tsc --noEmit` · `npm run lint` · `npm run build`. Use `npm run dev` / `npm start` for manual smoke.
- **Run a single test file:** `npx vitest run src/lib/ratgeber.test.ts`.
- **Brand discipline:** colors only via Tailwind `@theme` tokens (`text-tiefes-wasser`, `bg-amber`, `border-faden`, …, defined in [src/app/globals.css](../../../src/app/globals.css)). „Vrelo“/„Merak“ only via `<BrandWord>` (renders `font-serif italic`). Background is `papier`, never white.
- **German quotes:** `„…“` = U+201E (open) + U+201C (close). NEVER ASCII `"`. The Edit tool can silently downgrade these — after any edit that touches German copy, verify bytes (see the verification snippet in Task 23).
- **Path alias:** `@/` → `src/` (configured in both `tsconfig.json` and `vitest.config.ts`).
- **Next 16 note:** route `params` is a `Promise` — always `await params` in `page.tsx`/`generateMetadata`/`opengraph-image.tsx`.

## File overview

**Create — lib**
- `src/lib/site.ts` — `siteUrl`, `siteName` (single source for the base URL).
- `src/lib/ratgeber.ts` — `Article` type, `readingMinutes`, `formatDate`, `parseArticle`, `selectArticles` (pure) + `getAllArticles`, `getArticleSlugs`, `getArticleBySlug`, `draftsVisible` (IO).
- `src/lib/remark-brandword.ts` — dependency-free remark plugin (`splitText`, `remarkBrandword`).
- `src/lib/jsonld.ts` — `professionalServiceLd`, `personLd`, `faqPageLd`, `articleLd`, `breadcrumbLd`.

**Create — components**
- `src/components/JsonLd.tsx` — renders a JSON-LD `<script>`.
- `src/components/Prose.tsx` — `proseComponents` map for MDX.
- `src/components/ratgeber/ArticleCard.tsx` — index row (layout A).
- `src/components/ratgeber/ArticleHeader.tsx` — article header (B).
- `src/components/ratgeber/RatgeberIndex.tsx` — list + empty state.

**Create — routes & content**
- `src/app/ratgeber/page.tsx` — index.
- `src/app/ratgeber/[slug]/page.tsx` — article.
- `src/app/sitemap.ts`, `src/app/robots.ts`.
- `src/app/opengraph-image.tsx`, `src/app/ratgeber/[slug]/opengraph-image.tsx`.
- `src/lib/og.tsx` — shared OG render + font loader.
- `content/ratgeber/{terminbestaetigungen-automatisieren,taeglich-stunden-zurueckgewinnen,flickenteppich-oder-saubere-quelle}.mdx`.

**Modify**
- `src/app/page.tsx` (Home → ProfessionalService + Breadcrumb JSON-LD).
- `src/app/ueber-mich/page.tsx` (Person + Breadcrumb JSON-LD).
- `src/app/faq/page.tsx` (FAQPage + Breadcrumb JSON-LD).
- `src/app/leistungen/page.tsx` (Breadcrumb JSON-LD).
- `CLAUDE.md` (status/roadmap at the end).

---

## Task 1: Install dependencies

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install runtime deps**

Run:
```bash
npm install next-mdx-remote@^6 gray-matter@^4
```

- [ ] **Step 2: Verify they resolve and types are intact**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

Run: `npm ls next-mdx-remote gray-matter`
Expected: both listed at the installed versions, no `UNMET` peer errors (React 19 satisfies `next-mdx-remote`'s `react >=16`).

> Note: we use `next-mdx-remote/rsc` to compile MDX *strings* — no `@next/mdx` and no `next.config.ts` change. The actual MDX render is verified by `npm run build` in Task 14. If `next-mdx-remote/rsc` ever fails to build under Next 16, the fallback is `@next/mdx`'s `compileMDX` with the same components map — but do not switch unless Task 14's build fails.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add next-mdx-remote + gray-matter for Ratgeber MDX"
```

---

## Task 2: Site constants (`src/lib/site.ts`)

**Files:**
- Create: `src/lib/site.ts`
- Test: `src/lib/site.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/site.test.ts
import { describe, it, expect } from "vitest";
import { siteUrl, siteName } from "./site";

describe("site constants", () => {
  it("exposes an https base URL with no trailing slash", () => {
    expect(siteUrl).toMatch(/^https:\/\//);
    expect(siteUrl.endsWith("/")).toBe(false);
  });

  it("names the site Vrelo", () => {
    expect(siteName).toBe("Vrelo");
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/lib/site.test.ts`
Expected: FAIL (cannot find module `./site`).

- [ ] **Step 3: Implement**

```ts
// src/lib/site.ts
// Single source for the public base URL. Swap to "https://vrelo-ki.de"
// when the custom domain is connected in Phase 5.
export const siteUrl = "https://vrelo-website.vercel.app";
export const siteName = "Vrelo";
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/lib/site.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site.ts src/lib/site.test.ts
git commit -m "feat: add site base-URL constants"
```

---

## Task 3: Ratgeber pure core (types, reading time, date, parse, select)

**Files:**
- Create: `src/lib/ratgeber.ts`
- Test: `src/lib/ratgeber.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/ratgeber.test.ts
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
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/lib/ratgeber.test.ts`
Expected: FAIL (cannot find module `./ratgeber`).

- [ ] **Step 3: Implement the pure core**

```ts
// src/lib/ratgeber.ts
import matter from "gray-matter";

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  body: string; // raw MDX body, frontmatter stripped
};

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function parseArticle(filename: string, raw: string): Article {
  const { data, content } = matter(raw);
  return {
    slug: filename.replace(/\.mdx?$/, ""),
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: data.draft === true,
    readingMinutes: readingMinutes(content),
    body: content,
  };
}

export function selectArticles(
  articles: Article[],
  opts: { includeDrafts: boolean },
): Article[] {
  return articles
    .filter((a) => opts.includeDrafts || !a.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/lib/ratgeber.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ratgeber.ts src/lib/ratgeber.test.ts
git commit -m "feat: add Ratgeber pure core (parse, select, reading time, date)"
```

---

## Task 4: Ratgeber IO accessors (fs-backed)

**Files:**
- Modify: `src/lib/ratgeber.ts` (append)
- Test: `src/lib/ratgeber.io.test.ts`

- [ ] **Step 1: Write the failing test (uses a temp dir, no fixtures committed)**

```ts
// src/lib/ratgeber.io.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAllArticles, getArticleSlugs, getArticleBySlug } from "./ratgeber";

let dir: string;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "ratgeber-"));
  fs.writeFileSync(path.join(dir, "alpha.mdx"), `---\ntitle: "Alpha"\ndescription: "A"\ndate: "2026-03-01"\ntags: ["X"]\n---\nKörper A`);
  fs.writeFileSync(path.join(dir, "beta.mdx"), `---\ntitle: "Beta"\ndescription: "B"\ndate: "2026-04-01"\n---\nKörper B`);
  fs.writeFileSync(path.join(dir, "entwurf.mdx"), `---\ntitle: "Entwurf"\ndescription: "E"\ndate: "2026-05-01"\ndraft: true\n---\nKörper E`);
});

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("getAllArticles (IO)", () => {
  it("reads .mdx files, newest-first, drafts excluded by default flag override", () => {
    const r = getAllArticles({ dir, includeDrafts: false });
    expect(r.map((a) => a.slug)).toEqual(["beta", "alpha"]);
  });

  it("includes drafts when asked", () => {
    const r = getAllArticles({ dir, includeDrafts: true });
    expect(r.map((a) => a.slug)).toEqual(["entwurf", "beta", "alpha"]);
  });

  it("returns [] for a missing directory", () => {
    expect(getAllArticles({ dir: path.join(dir, "nope"), includeDrafts: true })).toEqual([]);
  });
});

describe("getArticleSlugs (IO)", () => {
  it("returns published slugs newest-first", () => {
    expect(getArticleSlugs({ dir, includeDrafts: false })).toEqual(["beta", "alpha"]);
  });
});

describe("getArticleBySlug (IO)", () => {
  it("returns the matching article (drafts findable for the route to guard)", () => {
    expect(getArticleBySlug("entwurf", { dir }).title).toBe("Entwurf");
  });

  it("throws when the slug is unknown", () => {
    expect(() => getArticleBySlug("missing", { dir })).toThrow();
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/lib/ratgeber.io.test.ts`
Expected: FAIL (exports not defined).

- [ ] **Step 3: Append the IO accessors to `src/lib/ratgeber.ts`**

```ts
// --- IO (fs-backed) ---
import fs from "node:fs";
import path from "node:path";

const RATGEBER_DIR = path.join(process.cwd(), "content", "ratgeber");

/** Drafts are visible in dev, hidden in production builds. */
export function draftsVisible(): boolean {
  return process.env.NODE_ENV !== "production";
}

type IoOpts = { dir?: string; includeDrafts?: boolean };

export function getAllArticles(opts: IoOpts = {}): Article[] {
  const dir = opts.dir ?? RATGEBER_DIR;
  const includeDrafts = opts.includeDrafts ?? draftsVisible();
  if (!fs.existsSync(dir)) return [];
  const articles = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseArticle(f, fs.readFileSync(path.join(dir, f), "utf8")));
  return selectArticles(articles, { includeDrafts });
}

export function getArticleSlugs(opts: IoOpts = {}): string[] {
  return getAllArticles(opts).map((a) => a.slug);
}

export function getArticleBySlug(slug: string, opts: { dir?: string } = {}): Article {
  // Always search including drafts; the route decides whether a draft is allowed.
  const found = getAllArticles({ dir: opts.dir, includeDrafts: true }).find(
    (a) => a.slug === slug,
  );
  if (!found) throw new Error(`Ratgeber article not found: ${slug}`);
  return found;
}
```

> Place the `import fs`/`import path` lines at the top of the file with the other imports if your linter prefers (ESLint `import/first`). Keeping all imports at the top is safest — move them up rather than mid-file.

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/lib/ratgeber.io.test.ts`
Expected: PASS.

- [ ] **Step 5: Full gate + commit**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

```bash
git add src/lib/ratgeber.ts src/lib/ratgeber.io.test.ts
git commit -m "feat: add fs-backed Ratgeber loader accessors"
```

---

## Task 5: remark-brandword plugin (dependency-free)

**Files:**
- Create: `src/lib/remark-brandword.ts`
- Test: `src/lib/remark-brandword.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/remark-brandword.test.ts
import { describe, it, expect } from "vitest";
import { splitText, remarkBrandword, type MdNode } from "./remark-brandword";

describe("splitText", () => {
  it("wraps Vrelo/Merak as BrandWord and keeps surrounding text", () => {
    const out = splitText("Hallo Vrelo und Merak!");
    expect(out).toEqual([
      { type: "text", value: "Hallo " },
      { type: "mdxJsxTextElement", name: "BrandWord", attributes: [], children: [{ type: "text", value: "Vrelo" }] },
      { type: "text", value: " und " },
      { type: "mdxJsxTextElement", name: "BrandWord", attributes: [], children: [{ type: "text", value: "Merak" }] },
      { type: "text", value: "!" },
    ]);
  });

  it("leaves text without the brand words untouched", () => {
    expect(splitText("nur normaler Text")).toEqual([{ type: "text", value: "nur normaler Text" }]);
  });
});

describe("remarkBrandword", () => {
  it("transforms text nodes inside a paragraph", () => {
    const tree: MdNode = {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", value: "Wir bei Vrelo" }] }],
    };
    remarkBrandword()(tree);
    const para = tree.children![0];
    expect(para.children!.map((c) => c.type)).toEqual(["text", "mdxJsxTextElement"]);
  });

  it("does not descend into code blocks", () => {
    const tree: MdNode = {
      type: "root",
      children: [{ type: "code", value: "const x = 'Vrelo';" }],
    };
    remarkBrandword()(tree);
    expect(tree.children![0]).toEqual({ type: "code", value: "const x = 'Vrelo';" });
  });

  it("does not double-wrap an existing BrandWord", () => {
    const tree: MdNode = {
      type: "root",
      children: [{
        type: "mdxJsxTextElement", name: "BrandWord", attributes: [],
        children: [{ type: "text", value: "Vrelo" }],
      }],
    };
    remarkBrandword()(tree);
    expect(tree.children![0].children).toEqual([{ type: "text", value: "Vrelo" }]);
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/lib/remark-brandword.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
// src/lib/remark-brandword.ts
// Dependency-free remark transformer: wraps the literal words "Vrelo"/"Merak"
// in <BrandWord> so they render in Fraunces italic everywhere in MDX content.

export interface MdNode {
  type: string;
  value?: string;
  name?: string;
  attributes?: unknown[];
  children?: MdNode[];
}

const WORDS = /(Vrelo|Merak)/g;

function brandWord(word: string): MdNode {
  return { type: "mdxJsxTextElement", name: "BrandWord", attributes: [], children: [{ type: "text", value: word }] };
}

export function splitText(value: string): MdNode[] {
  const out: MdNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  WORDS.lastIndex = 0;
  while ((m = WORDS.exec(value)) !== null) {
    if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
    out.push(brandWord(m[0]));
    last = m.index + m[0].length;
  }
  if (last < value.length || out.length === 0) {
    out.push({ type: "text", value: value.slice(last) });
  }
  return out.filter((n) => !(n.type === "text" && n.value === ""));
}

function transform(node: MdNode): void {
  if (!node.children) return;
  if (node.type === "code" || node.type === "inlineCode") return;
  if (node.type === "mdxJsxTextElement" && node.name === "BrandWord") return;

  const next: MdNode[] = [];
  for (const child of node.children) {
    if (child.type === "text" && child.value && WORDS.test(child.value)) {
      WORDS.lastIndex = 0;
      next.push(...splitText(child.value));
    } else {
      transform(child);
      next.push(child);
    }
  }
  node.children = next;
}

export function remarkBrandword() {
  return (tree: MdNode): void => transform(tree);
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/lib/remark-brandword.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/remark-brandword.ts src/lib/remark-brandword.test.ts
git commit -m "feat: add remark-brandword auto-wrap plugin"
```

---

## Task 6: JsonLd component

**Files:**
- Create: `src/components/JsonLd.tsx`
- Test: `src/components/JsonLd.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/JsonLd.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("renders a ld+json script with the serialized data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "X" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.innerHTML)).toEqual({ "@type": "Thing", name: "X" });
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/components/JsonLd.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```tsx
// src/components/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/components/JsonLd.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/JsonLd.tsx src/components/JsonLd.test.tsx
git commit -m "feat: add JsonLd component"
```

---

## Task 7: JSON-LD builders

**Files:**
- Create: `src/lib/jsonld.ts`
- Test: `src/lib/jsonld.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/jsonld.test.ts
import { describe, it, expect } from "vitest";
import {
  professionalServiceLd, personLd, faqPageLd, articleLd, breadcrumbLd,
} from "./jsonld";
import { faqGroups } from "./faq";
import { siteUrl } from "./site";
import type { Article } from "./ratgeber";

describe("jsonld builders", () => {
  it("professionalServiceLd has the right type, name and DACH area", () => {
    const ld = professionalServiceLd();
    expect(ld["@type"]).toBe("ProfessionalService");
    expect(ld.name).toBe("Vrelo");
    expect(ld.areaServed).toEqual(["DE", "AT", "CH"]);
  });

  it("personLd describes the founder", () => {
    expect(personLd()["@type"]).toBe("Person");
  });

  it("faqPageLd has one Question per faq entry", () => {
    const count = faqGroups.flatMap((g) => g.entries).length;
    const ld = faqPageLd();
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(count);
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
  });

  it("articleLd maps an article to schema.org Article", () => {
    const a: Article = {
      slug: "x", title: "T", description: "D", date: "2026-05-01",
      tags: [], draft: false, readingMinutes: 3, body: "b",
    };
    const ld = articleLd(a);
    expect(ld["@type"]).toBe("Article");
    expect(ld.headline).toBe("T");
    expect(ld.datePublished).toBe("2026-05-01");
    expect(ld.url).toBe(`${siteUrl}/ratgeber/x`);
  });

  it("breadcrumbLd numbers items from 1 with absolute urls", () => {
    const ld = breadcrumbLd([{ name: "Start", path: "/" }, { name: "Ratgeber", path: "/ratgeber" }]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].item).toBe(`${siteUrl}/ratgeber`);
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/lib/jsonld.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
// src/lib/jsonld.ts
import { siteUrl, siteName } from "./site";
import { faqGroups } from "./faq";
import type { Article } from "./ratgeber";

const FOUNDER = "Ajdin Džafić";

export function professionalServiceLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteName,
    url: siteUrl,
    description: "Maßgeschneiderte Automatisierungen für kleine Betriebe im DACH-Raum.",
    areaServed: ["DE", "AT", "CH"],
    founder: { "@type": "Person", name: FOUNDER },
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER,
    jobTitle: "Gründer",
    worksFor: { "@type": "Organization", name: siteName },
    url: `${siteUrl}/ueber-mich`,
  };
}

export function faqPageLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) => g.entries).map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}

export function articleLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    author: { "@type": "Person", name: FOUNDER },
    publisher: { "@type": "Organization", name: siteName },
    image: `${siteUrl}/ratgeber/${a.slug}/opengraph-image`,
    url: `${siteUrl}/ratgeber/${a.slug}`,
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path}`,
    })),
  };
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/lib/jsonld.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/jsonld.ts src/lib/jsonld.test.ts
git commit -m "feat: add JSON-LD builders"
```

---

## Task 8: Prose components map

**Files:**
- Create: `src/components/Prose.tsx`
- Test: `src/components/Prose.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/Prose.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { proseComponents } from "./Prose";

describe("proseComponents", () => {
  it("styles h2 with the Fraunces serif token", () => {
    const H2 = proseComponents.h2;
    render(<H2>Überschrift</H2>);
    const el = screen.getByText("Überschrift");
    expect(el.tagName).toBe("H2");
    expect(el).toHaveClass("font-serif");
  });

  it("styles links with the petrol token", () => {
    const A = proseComponents.a;
    render(<A href="/x">Link</A>);
    expect(screen.getByText("Link")).toHaveClass("text-vrelo-petrol");
  });

  it("styles blockquote in ember italic", () => {
    const BQ = proseComponents.blockquote;
    render(<BQ>Zitat</BQ>);
    const el = screen.getByText("Zitat");
    expect(el.tagName).toBe("BLOCKQUOTE");
    expect(el).toHaveClass("text-ember");
    expect(el).toHaveClass("italic");
  });

  it("exposes BrandWord to MDX scope", () => {
    expect(proseComponents.BrandWord).toBeTypeOf("function");
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/components/Prose.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```tsx
// src/components/Prose.tsx
import type { ComponentProps } from "react";
import { BrandWord } from "@/components/BrandWord";

export const proseComponents = {
  BrandWord,
  h2: (p: ComponentProps<"h2">) => (
    <h2 className="mt-10 font-serif text-2xl font-medium text-tiefes-wasser" {...p} />
  ),
  h3: (p: ComponentProps<"h3">) => (
    <h3 className="mt-8 font-serif text-xl font-medium text-tiefes-wasser" {...p} />
  ),
  p: (p: ComponentProps<"p">) => (
    <p className="mt-4 leading-relaxed text-tinte/90" {...p} />
  ),
  a: (p: ComponentProps<"a">) => (
    <a className="text-vrelo-petrol underline underline-offset-2 hover:text-ember" {...p} />
  ),
  ul: (p: ComponentProps<"ul">) => (
    <ul className="mt-4 list-disc space-y-1 pl-5 text-tinte/90" {...p} />
  ),
  ol: (p: ComponentProps<"ol">) => (
    <ol className="mt-4 list-decimal space-y-1 pl-5 text-tinte/90" {...p} />
  ),
  li: (p: ComponentProps<"li">) => <li className="leading-relaxed" {...p} />,
  blockquote: (p: ComponentProps<"blockquote">) => (
    <blockquote className="my-6 border-l-2 border-amber pl-4 font-serif text-lg italic text-ember" {...p} />
  ),
};
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/components/Prose.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Prose.tsx src/components/Prose.test.tsx
git commit -m "feat: add Prose MDX components map"
```

---

## Task 9: ArticleCard (index row)

**Files:**
- Create: `src/components/ratgeber/ArticleCard.tsx`
- Test: `src/components/ratgeber/ArticleCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ratgeber/ArticleCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/ratgeber";

const article: Article = {
  slug: "mein-artikel", title: "Mein Artikel", description: "Worum es geht.",
  date: "2026-05-28", tags: ["Termine"], draft: false, readingMinutes: 6, body: "b",
};

describe("ArticleCard", () => {
  it("links the title to the article and shows meta", () => {
    render(<ArticleCard article={article} />);
    const link = screen.getByRole("link", { name: "Mein Artikel" });
    expect(link).toHaveAttribute("href", "/ratgeber/mein-artikel");
    expect(screen.getByText(/28\. Mai 2026/)).toBeInTheDocument();
    expect(screen.getByText(/6 Min/)).toBeInTheDocument();
    expect(screen.getByText(/Termine/)).toBeInTheDocument();
  });

  it("shows an Entwurf marker for drafts", () => {
    render(<ArticleCard article={{ ...article, draft: true }} />);
    expect(screen.getByText(/Entwurf/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/components/ratgeber/ArticleCard.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```tsx
// src/components/ratgeber/ArticleCard.tsx
import Link from "next/link";
import { formatDate, type Article } from "@/lib/ratgeber";

export function ArticleCard({ article }: { article: Article }) {
  const meta = [
    formatDate(article.date),
    `${article.readingMinutes} Min`,
    article.tags[0],
    article.draft ? "Entwurf" : null,
  ].filter(Boolean).join(" · ");

  return (
    <article className="border-t border-faden py-8 first:border-t-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
      <h2 className="mt-2 font-serif text-2xl font-medium text-tiefes-wasser">
        <Link href={`/ratgeber/${article.slug}`} className="hover:text-vrelo-petrol">
          {article.title}
        </Link>
      </h2>
      <p className="mt-2 max-w-2xl text-tinte/80">{article.description}</p>
    </article>
  );
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/components/ratgeber/ArticleCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ratgeber/ArticleCard.tsx src/components/ratgeber/ArticleCard.test.tsx
git commit -m "feat: add ArticleCard (Ratgeber index row)"
```

---

## Task 10: ArticleHeader (header B)

**Files:**
- Create: `src/components/ratgeber/ArticleHeader.tsx`
- Test: `src/components/ratgeber/ArticleHeader.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ratgeber/ArticleHeader.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleHeader } from "./ArticleHeader";
import type { Article } from "@/lib/ratgeber";

const article: Article = {
  slug: "x", title: "Der Titel", description: "d",
  date: "2026-05-28", tags: ["Termine", "Automatisierung"],
  draft: false, readingMinutes: 6, body: "b",
};

describe("ArticleHeader", () => {
  it("renders the title as h1 with the date, reading time and tags", () => {
    render(<ArticleHeader article={article} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Der Titel" });
    expect(h1).toHaveClass("font-serif");
    expect(screen.getByText(/28\. Mai 2026/)).toBeInTheDocument();
    expect(screen.getByText(/6 Min Lesezeit/)).toBeInTheDocument();
    expect(screen.getByText("Termine")).toBeInTheDocument();
    expect(screen.getByText("Automatisierung")).toBeInTheDocument();
  });

  it("marks drafts", () => {
    render(<ArticleHeader article={{ ...article, draft: true }} />);
    expect(screen.getByText(/Entwurf/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/components/ratgeber/ArticleHeader.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```tsx
// src/components/ratgeber/ArticleHeader.tsx
import { formatDate, type Article } from "@/lib/ratgeber";

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      {/* amber drop motif — points up, per Brand.md */}
      <span
        aria-hidden
        className="mx-auto mb-3 block h-4 w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-stumm">
        Ratgeber{article.draft ? " · Entwurf" : ""}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-medium text-tiefes-wasser md:text-4xl">
        {article.title}
      </h1>
      <div className="mx-auto mt-4 h-0.5 w-12 bg-vrelo-petrol" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stumm">
        {formatDate(article.date)} · {article.readingMinutes} Min Lesezeit
      </p>
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {article.tags.map((t) => (
            <span key={t} className="rounded-full border border-stein px-3 py-0.5 text-xs text-vrelo-petrol">
              {t}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/components/ratgeber/ArticleHeader.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ratgeber/ArticleHeader.tsx src/components/ratgeber/ArticleHeader.test.tsx
git commit -m "feat: add ArticleHeader (brand motif header)"
```

---

## Task 11: RatgeberIndex (list + empty state)

**Files:**
- Create: `src/components/ratgeber/RatgeberIndex.tsx`
- Test: `src/components/ratgeber/RatgeberIndex.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
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
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/components/ratgeber/RatgeberIndex.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```tsx
// src/components/ratgeber/RatgeberIndex.tsx
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/ratgeber";

export function RatgeberIndex({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="font-serif text-xl italic text-stumm">Hier entsteht der Ratgeber.</p>;
  }
  return (
    <div className="mx-auto max-w-3xl">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/components/ratgeber/RatgeberIndex.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ratgeber/RatgeberIndex.tsx src/components/ratgeber/RatgeberIndex.test.tsx
git commit -m "feat: add RatgeberIndex with empty state"
```

---

## Task 12: Seed article content (3 MDX drafts)

**Files:**
- Create: `content/ratgeber/terminbestaetigungen-automatisieren.mdx`
- Create: `content/ratgeber/taeglich-stunden-zurueckgewinnen.mdx`
- Create: `content/ratgeber/flickenteppich-oder-saubere-quelle.mdx`

> This is a **content-authoring** task, not code. Write each article as genuine, useful German prose in full brand voice — first-person „Ich“, „du“ address, calm, **outcome over mechanism**, ≤1 water metaphor per article, no hype/buzzwords. Do NOT hand-type „Vrelo“/„Merak“ in `<BrandWord>` — the remark plugin wraps them automatically; just write the plain words. ~800–1200 words each. Use `##` for section headings and at least one `>` blockquote per article. All three are `draft: true`. Follow the frontmatter exactly (note: German typographic quotes are NOT needed inside YAML — YAML uses ASCII `"` for its strings; the German quotes rule applies to prose body text only).

- [ ] **Step 1: Write article 1**

Frontmatter (exact):
```yaml
---
title: "So automatisierst du Terminbestätigungen — ohne Kalender-Chaos"
description: "Kein Hinterhertelefonieren mehr: Wie eine saubere Quelle Bestätigungen, Erinnerungen und Absagen still im Hintergrund erledigt."
date: "2026-05-28"
tags: ["Termine", "Automatisierung"]
draft: true
---
```
Body outline (write full prose to this spine):
1. **Hook** — the hidden cost of manual confirmations: not the minute spent, but the broken focus afterwards.
2. **## Wo die Zeit wirklich verloren geht** — the twenty small interruptions, not the one email.
3. **## Wie eine ruhige Lösung aussieht** — bullet list: confirmation on booking, reminder the day before, cancellations that update the calendar.
4. **> Blockquote** — „Du gewinnst nicht Minuten zurück. Du gewinnst einen freien Kopf.“
5. **## Was du dafür brauchst** — reassurance: build on existing tools, no KI knowledge needed, documented.
6. **Close** — lands on the calm result (the Merak-Effekt), soft pointer to a no-obligation conversation.

- [ ] **Step 2: Write article 2**

Frontmatter (exact):
```yaml
---
title: "Wie kleine Betriebe täglich Stunden zurückgewinnen"
description: "Die wiederkehrenden Aufgaben, die dich unbemerkt Zeit kosten — und wie du sie der Reihe nach abgibst."
date: "2026-05-20"
tags: ["Zeit", "Praxis"]
draft: true
---
```
Body outline:
1. **Hook** — time doesn't vanish in big chunks; it leaks in small repeated tasks.
2. **## Die üblichen Zeitfresser** — list: Nachfass-Mails, Dateneingabe, Terminkoordination, wiederkehrende Nachrichten.
3. **## Eine Aufgabe nach der anderen** — the calm, staged approach; not „alles auf einmal“.
4. **> Blockquote** — a quiet line about Ruhe/Kopffreiheit.
5. **## Was sich dadurch ändert** — concrete before/after of a normal working day.
6. **Close** — Merak-Effekt; gentle CTA.

- [ ] **Step 3: Write article 3**

Frontmatter (exact):
```yaml
---
title: "Flickenteppich oder saubere Quelle?"
description: "Zehn Tools, die irgendwie zusammenhängen, gegen ein durchdachtes System. Warum das Eine ruhig bleibt und das Andere ständig hakt."
date: "2026-05-12"
tags: ["Grundlagen"]
draft: true
---
```
Body outline:
1. **Hook** — the accidental tool-pile most small businesses end up with.
2. **## Warum der Flickenteppich hakt** — fragility, no documentation, every change breaks something.
3. **## Was eine saubere Quelle anders macht** — designed, documented, maintainable; built once, runs quietly.
4. **> Blockquote** — a line contrasting noise vs. calm.
5. **## Woran du den Unterschied merkst** — practical signals.
6. **Close** — Merak-Effekt; gentle CTA.

- [ ] **Step 4: Verify the seed files parse**

Add a temporary check (then remove it) or simply run:
```bash
node -e "const m=require('gray-matter');const fs=require('fs');for(const f of fs.readdirSync('content/ratgeber')){const {data}=m(fs.readFileSync('content/ratgeber/'+f,'utf8'));if(!data.title||!data.date)throw new Error('bad frontmatter: '+f);console.log('ok',f);}"
```
Expected: `ok` for all three files.

- [ ] **Step 5: Verify German quote bytes in the prose**

Run:
```bash
python -c "import io,glob;[print(p,'U+201E',io.open(p,encoding='utf-8').read().count(chr(0x201e)),'U+201C',io.open(p,encoding='utf-8').read().count(chr(0x201c))) for p in glob.glob('content/ratgeber/*.mdx')]"
```
Expected: for every file, the U+201E count equals the U+201C count (balanced German quotes), and there are no German quotes left as ASCII. If counts differ, fix the closing quotes to U+201C.

- [ ] **Step 6: Commit**

```bash
git add content/ratgeber/
git commit -m "content: add 3 Ratgeber seed articles (draft-to-verify)"
```

---

## Task 13: Ratgeber index page (`/ratgeber`)

**Files:**
- Create: `src/app/ratgeber/page.tsx`

- [ ] **Step 1: Implement the page**

```tsx
// src/app/ratgeber/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { RatgeberIndex } from "@/components/ratgeber/RatgeberIndex";
import { getAllArticles } from "@/lib/ratgeber";
import { breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Ratgeber",
  description:
    "Praxisnahe Notizen zur ruhigen Automatisierung für kleine Betriebe — wie du wiederkehrende Arbeit abgibst und Kopffreiheit zurückgewinnst.",
};

export default function RatgeberPage() {
  const articles = getAllArticles();
  return (
    <>
      <PageIntro
        eyebrow="Ratgeber"
        title="Gedanken zur ruhigen Automatisierung"
        lead="Praxisnahe Notizen für kleine Betriebe — wie du wiederkehrende Arbeit abgibst und Zeit, Ruhe und einen freien Kopf zurückgewinnst."
      />
      <Section tone="paper">
        <RatgeberIndex articles={articles} />
      </Section>
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich zeige dir unverbindlich, was sich automatisieren lässt."
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Ratgeber", path: "/ratgeber" },
        ])}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify build + types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 3: Manual smoke (dev)**

Run: `npm run dev`, open `http://localhost:3000/ratgeber`.
Expected: the three draft articles list newest-first, each row shows „· Entwurf“, titles link to `/ratgeber/<slug>` (404 until Task 14). Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/ratgeber/page.tsx
git commit -m "feat: add Ratgeber index page"
```

---

## Task 14: Article page (`/ratgeber/[slug]`) — MDX render + JSON-LD + draft guard

**Files:**
- Create: `src/app/ratgeber/[slug]/page.tsx`

- [ ] **Step 1: Implement the page**

```tsx
// src/app/ratgeber/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { ArticleHeader } from "@/components/ratgeber/ArticleHeader";
import { proseComponents } from "@/components/Prose";
import { remarkBrandword } from "@/lib/remark-brandword";
import { getArticleSlugs, getArticleBySlug, draftsVisible, type Article } from "@/lib/ratgeber";
import { articleLd, breadcrumbLd } from "@/lib/jsonld";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

function loadVisible(slug: string): Article | null {
  let article: Article;
  try {
    article = getArticleBySlug(slug);
  } catch {
    return null;
  }
  if (article.draft && !draftsVisible()) return null;
  return article;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = loadVisible(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `${siteUrl}/ratgeber/${article.slug}` },
    openGraph: { title: article.title, description: article.description, type: "article" },
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = loadVisible(slug);
  if (!article) notFound();

  return (
    <>
      <Section tone="paper">
        <ArticleHeader article={article} />
        <div className="mx-auto mt-10 max-w-2xl">
          <MDXRemote
            source={article.body}
            components={proseComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkBrandword] } }}
          />
        </div>
      </Section>
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich zeige dir unverbindlich, was sich automatisieren lässt."
      />
      <JsonLd data={articleLd(article)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Ratgeber", path: "/ratgeber" },
          { name: article.title, path: `/ratgeber/${article.slug}` },
        ])}
      />
    </>
  );
}
```

> `proseComponents` is a plain object passed to `MDXRemote` — the remark plugin injects `mdxJsxTextElement` nodes named `BrandWord`, which resolve against `proseComponents.BrandWord`. This is the **MDX-compiler verification gate** for the whole phase.

- [ ] **Step 2: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 3: Manual smoke (dev) — the real MDX render check**

Run: `npm run dev`, open `http://localhost:3000/ratgeber/terminbestaetigungen-automatisieren`.
Expected: header B (drop + title + petrol rule + meta + tags), MDX body styled via `Prose`, „Vrelo“/„Merak“ rendered in Fraunces italic (BrandWord), a working booking CTA, and two `<script type="application/ld+json">` tags in the page source (Article + BreadcrumbList). Stop the dev server.

- [ ] **Step 4: Production build check (drafts excluded)**

Run: `npm run build`
Expected: PASS. Because all seeds are drafts, `generateStaticParams` returns `[]` → no `/ratgeber/[slug]` pages are statically generated (expected). `/ratgeber` builds as a static page showing the empty state.

> If `npm run build` fails specifically inside `next-mdx-remote/rsc`, this is the documented fallback point (Task 1): switch the article page to `@next/mdx`'s `compileMDX` with the same `proseComponents` + `remarkPlugins`. Otherwise proceed.

- [ ] **Step 5: Temporarily confirm a real article builds statically**

Edit `content/ratgeber/flickenteppich-oder-saubere-quelle.mdx`, set `draft: false`. Run `npm run build`.
Expected: the build now generates `/ratgeber/flickenteppich-oder-saubere-quelle` as static. Then **revert** the file back to `draft: true` (`git checkout content/ratgeber/flickenteppich-oder-saubere-quelle.mdx`) and confirm `git status` is clean for it.

- [ ] **Step 6: Commit**

```bash
git add src/app/ratgeber/[slug]/page.tsx
git commit -m "feat: add Ratgeber article page (MDX render, JSON-LD, draft guard)"
```

---

## Task 15: Retrofit JSON-LD onto existing pages

**Files:**
- Modify: `src/app/page.tsx`, `src/app/ueber-mich/page.tsx`, `src/app/faq/page.tsx`, `src/app/leistungen/page.tsx`

- [ ] **Step 1: Home — add ProfessionalService + Breadcrumb**

In `src/app/page.tsx`, add imports and render the JSON-LD inside the returned fragment (place the two `<JsonLd .../>` elements just before the closing `</>`):
```tsx
import { JsonLd } from "@/components/JsonLd";
import { professionalServiceLd, breadcrumbLd } from "@/lib/jsonld";
```
```tsx
      <JsonLd data={professionalServiceLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }])} />
```

- [ ] **Step 2: Über mich — add Person + Breadcrumb**

In `src/app/ueber-mich/page.tsx`, add before the closing `</>`:
```tsx
import { JsonLd } from "@/components/JsonLd";
import { personLd, breadcrumbLd } from "@/lib/jsonld";
```
```tsx
      <JsonLd data={personLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Über mich", path: "/ueber-mich" }])} />
```

- [ ] **Step 3: FAQ — add FAQPage + Breadcrumb**

In `src/app/faq/page.tsx`, add before the closing fragment:
```tsx
import { JsonLd } from "@/components/JsonLd";
import { faqPageLd, breadcrumbLd } from "@/lib/jsonld";
```
```tsx
      <JsonLd data={faqPageLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "FAQ", path: "/faq" }])} />
```

- [ ] **Step 4: Leistungen — add Breadcrumb**

In `src/app/leistungen/page.tsx`, add before the closing fragment:
```tsx
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
```
```tsx
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Leistungen", path: "/leistungen" }])} />
```

> If any of these pages does not currently end in a fragment `<>…</>`, wrap the existing returned element in a fragment so the `<JsonLd>` siblings can be added.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

Run: `npm run dev`, view-source on `/`, `/ueber-mich`, `/faq`, `/leistungen` and confirm a `application/ld+json` script appears on each. Stop dev.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/ueber-mich/page.tsx src/app/faq/page.tsx src/app/leistungen/page.tsx
git commit -m "feat: add site-wide JSON-LD (service, person, FAQ, breadcrumbs)"
```

---

## Task 16: sitemap.ts

**Files:**
- Create: `src/app/sitemap.ts`
- Test: `src/app/sitemap.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/app/sitemap.test.ts
import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { siteUrl } from "@/lib/site";

describe("sitemap", () => {
  it("includes the core live routes and excludes unbuilt ones", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}`);
    expect(urls).toContain(`${siteUrl}/leistungen`);
    expect(urls).toContain(`${siteUrl}/ueber-mich`);
    expect(urls).toContain(`${siteUrl}/faq`);
    expect(urls).toContain(`${siteUrl}/ratgeber`);
    expect(urls).not.toContain(`${siteUrl}/kontakt`);
    expect(urls).not.toContain(`${siteUrl}/impressum`);
  });

  it("never lists draft articles", () => {
    // all seed articles are drafts → no /ratgeber/<slug> entries
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.startsWith(`${siteUrl}/ratgeber/`))).toBe(false);
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getAllArticles } from "@/lib/ratgeber";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/leistungen", "/ueber-mich", "/faq", "/ratgeber"].map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
  }));
  // Always production semantics for the sitemap — drafts are never listed.
  const articles = getAllArticles({ includeDrafts: false }).map((a) => ({
    url: `${siteUrl}/ratgeber/${a.slug}`,
    lastModified: new Date(a.date),
  }));
  return [...staticRoutes, ...articles];
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat: add sitemap.xml (live routes + published articles)"
```

---

## Task 17: robots.ts

**Files:**
- Create: `src/app/robots.ts`
- Test: `src/app/robots.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/app/robots.test.ts
import { describe, it, expect } from "vitest";
import robots from "./robots";
import { siteUrl } from "@/lib/site";

describe("robots", () => {
  it("allows all and points to the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe(`${siteUrl}/sitemap.xml`);
    expect(r.rules).toEqual({ userAgent: "*", allow: "/" });
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/app/robots.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npx vitest run src/app/robots.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/robots.ts src/app/robots.test.ts
git commit -m "feat: add robots.txt"
```

---

## Task 18: OG font asset + loader (the fragile bit — verify in build)

**Files:**
- Create: `src/lib/og.tsx`
- Add: a static Fraunces TTF committed under `src/app/_og/Fraunces-SemiBold.ttf`

> `ImageResponse` (satori) needs a raw **ttf/otf/woff** buffer — it does NOT accept woff2. We commit one static Fraunces TTF for the OG title. Plus Jakarta Sans is not required for OG; satori's built-in font covers small text, keeping this simple.

- [ ] **Step 1: Obtain a static Fraunces TTF and commit it**

Create the folder and download a static instance from the Google Fonts repo (static directory contains real TTFs):
```bash
mkdir -p src/app/_og
curl -L -o src/app/_og/Fraunces-SemiBold.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/static/Fraunces_72pt-SemiBold.ttf"
```
Verify it is a real TTF (not an HTML error page):
```bash
node -e "const b=require('fs').readFileSync('src/app/_og/Fraunces-SemiBold.ttf');if(b.length<20000)throw new Error('too small, download failed: '+b.length);console.log('ttf bytes',b.length)"
```
Expected: a byte count in the hundreds of KB. If the path 404s, list `https://github.com/google/fonts/tree/main/ofl/fraunces/static` in a browser and pick any `Fraunces_*-SemiBold.ttf`, updating the filename.

- [ ] **Step 2: Implement the shared OG renderer**

```tsx
// src/lib/og.tsx
import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

function frauncesFont(): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "src", "app", "_og", "Fraunces-SemiBold.ttf"));
}

export function renderOg(opts: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F4EFE6", // papier
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 26, height: 34, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", backgroundColor: "#D4A24C" }} />
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#7A7468" }}>
            {opts.eyebrow}
          </div>
        </div>
        <div style={{ fontFamily: "Fraunces", fontSize: 68, lineHeight: 1.1, color: "#0A2538", maxWidth: 1000 }}>
          {opts.title}
        </div>
        <div style={{ fontSize: 30, color: "#1B5063" }}>vrelo · Durchdachte Automatisierung</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Fraunces", data: frauncesFont(), style: "normal", weight: 600 }],
    },
  );
}
```

- [ ] **Step 3: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/_og/Fraunces-SemiBold.ttf src/lib/og.tsx
git commit -m "feat: add OG renderer + Fraunces TTF for ImageResponse"
```

---

## Task 19: Site default OG image

**Files:**
- Create: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/app/opengraph-image.tsx
import { OG_SIZE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vrelo — Durchdachte Automatisierung für kleine Betriebe";

export default function Image() {
  return renderOg({
    eyebrow: "Vrelo",
    title: "Durchdachte Automatisierung für kleine Betriebe.",
  });
}
```

- [ ] **Step 2: Verify it renders (build)**

Run: `npm run build`
Expected: PASS; build output lists `/opengraph-image` as a generated route.

- [ ] **Step 3: Manual check (optional)**

Run: `npm start`, open `http://localhost:3000/opengraph-image`.
Expected: a 1200×630 PNG — Papier background, amber drop, Fraunces title. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/app/opengraph-image.tsx
git commit -m "feat: add site default OG image"
```

---

## Task 20: Per-article OG image

**Files:**
- Create: `src/app/ratgeber/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/app/ratgeber/[slug]/opengraph-image.tsx
import { OG_SIZE, renderOg } from "@/lib/og";
import { getArticleSlugs, getArticleBySlug } from "@/lib/ratgeber";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vrelo Ratgeber";

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return renderOg({ eyebrow: "Ratgeber", title: article.title });
}
```

- [ ] **Step 2: Verify (build)**

Run: `npm run build`
Expected: PASS. With all seeds drafts, `generateStaticParams` returns `[]` so no per-article OG is generated — that is expected and must not error.

- [ ] **Step 3: Manual check (dev, drafts visible)**

Run: `npm run dev`, open `http://localhost:3000/ratgeber/taeglich-stunden-zurueckgewinnen/opengraph-image`.
Expected: a PNG with the article title in Fraunces. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/app/ratgeber/[slug]/opengraph-image.tsx
git commit -m "feat: add per-article OG image"
```

---

## Task 21: Root metadata — metadataBase + default OG

**Files:**
- Modify: `src/app/layout.tsx:7-14`

- [ ] **Step 1: Add `metadataBase` and a default OG block to the existing `metadata` export**

So relative OG image URLs resolve to the production origin. Update the `metadata` object in `src/app/layout.tsx`:
```tsx
import { siteUrl } from "@/lib/site";
```
```tsx
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
    template: "%s — Vrelo",
  },
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Vrelo",
  },
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: set metadataBase + default OpenGraph in root layout"
```

---

## Task 22: Full regression gate

**Files:** none (verification only)

- [ ] **Step 1: Run the whole suite**

Run: `npm test`
Expected: PASS — all prior phase tests plus the new ones (site, ratgeber core, ratgeber IO, remark-brandword, jsonld, JsonLd, Prose, ArticleCard, ArticleHeader, RatgeberIndex, sitemap, robots).

- [ ] **Step 2: Types + lint + production build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS. Build statically renders `/`, `/leistungen`, `/ueber-mich`, `/faq`, `/ratgeber`, `sitemap.xml`, `robots.txt`, `/opengraph-image`. No `/ratgeber/[slug]` pages (all drafts) — expected.

- [ ] **Step 3: Production smoke**

Run: `npm start`. Verify: `/ratgeber` shows the empty-state placeholder; `/sitemap.xml` and `/robots.txt` resolve and contain no draft article URLs; `/ratgeber/terminbestaetigungen-automatisieren` returns 404 (drafts hidden in prod). Stop the server.

- [ ] **Step 4: Dev smoke**

Run: `npm run dev`. Verify: `/ratgeber` lists 3 drafts; an article renders with header B, styled Prose, BrandWord italics, and JSON-LD; per-article OG renders. Stop dev.

- [ ] **Step 5: Commit (if anything was adjusted)**

```bash
git commit -am "test: Phase 3 full regression gate green" --allow-empty
```

---

## Task 23: Docs — update CLAUDE.md + verify German quotes

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update status, dead-links note, resume pointer, roadmap**

In `CLAUDE.md`:
- Add a Phase 3 line to the **Status** section (Ratgeber/MDX + SEO done; built + verified).
- In **Known dead links in prod**, remove `/ratgeber` (it now resolves); keep `/kontakt`.
- Update **Resume here** to point at Phase 4 (Conversion — contact form, Cal.com, newsletter).
- Tick the Phase 3 box in the **Roadmap**.

- [ ] **Step 2: Verify German typographic quotes in the edit**

Run:
```bash
python -c "import io;t=io.open('CLAUDE.md',encoding='utf-8').read();print('U+201E',t.count(chr(0x201e)),'U+201C',t.count(chr(0x201c)))"
```
Expected: the two counts are equal (every „ has its closing “). If not, fix ASCII closings to U+201C.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 3 (Ratgeber + SEO) built + verified"
```

---

## Done

After Task 23, use **superpowers:finishing-a-development-branch** to merge `feat/phase3-ratgeber-seo` into `main` (which auto-deploys to production via Vercel). Remember: production ships with an empty Ratgeber until the founder verifies a seed article and sets `draft: false`.
