# Vrelo Ratgeber Per-Article Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Ratgeber article a required cover photograph — a banner above the title on the article page and a thumbnail in the `/ratgeber` index list.

**Architecture:** Add required `cover`/`coverAlt` frontmatter (enforced by `parseArticle` throwing when absent). Reuse the existing `PageImage` panel (extended with an optional `sizes` prop) for both the article banner and the index thumbnail. Convert three source PNGs to committed WebP. Branded OG image and the index page-banner are untouched.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind v4 `@theme` tokens, `next/image`, `gray-matter` (frontmatter), Vitest + React Testing Library, `sharp` (PNG→WebP, resolvable at 0.34.5).

**Branch:** `feat/ratgeber-covers` (already checked out; spec already committed there).

**Spec:** `docs/superpowers/specs/2026-06-07-vrelo-ratgeber-covers-design.md`

---

## File structure

| File | Responsibility | Change |
|---|---|---|
| `public/images/ratgeber-{termine,zeit,system}.webp` | Committed cover assets | Create (Task 1) |
| `src/components/PageImage.tsx` | Reusable image panel | Add optional `sizes` prop (Task 2) |
| `src/components/PageImage.test.tsx` | PageImage unit test | Create (Task 2) |
| `src/lib/ratgeber.ts` | Article model + parsing | Add `cover`/`coverAlt`, throw if missing (Task 3) |
| `src/lib/ratgeber.test.ts` | Parsing unit tests | Add cases + fix fixtures (Task 3) |
| `src/lib/ratgeber.io.test.ts` | IO tests over temp dir | Fix temp fixtures (Task 3) |
| `src/components/ratgeber/ArticleHeader.test.tsx` | Header test | Fix `Article` literal (Task 3) |
| `src/components/ratgeber/RatgeberIndex.test.tsx` | Index test | Fix `Article` factory (Task 3) |
| `src/lib/jsonld.test.ts` | JSON-LD test | Fix `Article` literal (Task 3) |
| `content/ratgeber/*.mdx` (×3) | Seed articles | Add `cover`/`coverAlt` frontmatter (Task 4) |
| `src/lib/ratgeber.covers.test.ts` | Content-integrity guard | Create (Task 5) |
| `src/components/ratgeber/ArticleCard.tsx` | Index row | Add leading thumbnail (Task 6) |
| `src/components/ratgeber/ArticleCard.test.tsx` | Card test | Fix literal + assert thumbnail (Task 6) |
| `src/app/ratgeber/[slug]/page.tsx` | Article page | Add cover banner above header (Task 7) |

---

## Task 1: Convert the three cover PNGs to WebP

**Files:**
- Create: `public/images/ratgeber-termine.webp`
- Create: `public/images/ratgeber-zeit.webp`
- Create: `public/images/ratgeber-system.webp`
- Source (gitignored): `Images/Ratgeber_article_1.png`, `Images/Ratgeber_article_3.png`, `Images/Ratgeber_article_2.png`

- [ ] **Step 1: Convert the three mapped PNGs**

Run (single line):

```bash
node -e "const sharp=require('sharp');const map=[['Images/Ratgeber_article_1.png','public/images/ratgeber-termine.webp'],['Images/Ratgeber_article_3.png','public/images/ratgeber-zeit.webp'],['Images/Ratgeber_article_2.png','public/images/ratgeber-system.webp']];(async()=>{for(const [src,out] of map){await sharp(src).webp({quality:80,effort:6}).toFile(out);console.log('wrote',out);}})()"
```

Expected output: three `wrote public/images/ratgeber-*.webp` lines.

- [ ] **Step 2: Verify the files exist and are ~16:9**

Run:

```bash
node -e "const sharp=require('sharp');const fs=require('fs');(async()=>{for(const f of ['termine','zeit','system']){const p='public/images/ratgeber-'+f+'.webp';const m=await sharp(p).metadata();console.log(p,fs.statSync(p).size+'B',m.width+'x'+m.height,(m.width/m.height).toFixed(3));}})()"
```

Expected: three lines, each `1376x768 1.792`, sizes in the tens-of-KB range.

- [ ] **Step 3: Commit**

```bash
git add public/images/ratgeber-termine.webp public/images/ratgeber-zeit.webp public/images/ratgeber-system.webp
git commit -m "feat(ratgeber): add three article cover images (WebP)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Note: `Images/` is gitignored (root-anchored `/Images/`), so the source PNGs are correctly excluded; only the WebP under `public/images/` are committed.

---

## Task 2: Add an optional `sizes` prop to PageImage

**Files:**
- Create: `src/components/PageImage.test.tsx`
- Modify: `src/components/PageImage.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/PageImage.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PageImage } from "./PageImage";

describe("PageImage", () => {
  it("uses the default banner sizes when none is given", () => {
    const { container } = render(<PageImage src="/images/x.webp" alt="x" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("sizes")).toBe("(min-width: 1152px) 1104px, 100vw");
  });

  it("applies a custom sizes prop", () => {
    const { container } = render(
      <PageImage src="/images/x.webp" alt="x" sizes="(min-width: 640px) 160px, 100vw" />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("sizes")).toBe("(min-width: 640px) 160px, 100vw");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/PageImage.test.tsx`
Expected: the second test FAILS (custom `sizes` is ignored; `img` still has the hardcoded default).

- [ ] **Step 3: Add the `sizes` prop**

Replace the body of `src/components/PageImage.tsx` with:

```tsx
import Image from "next/image";

// Rounded, deep-water-shadowed image panel used for page banners (in PageIntro)
// and standalone placements (e.g. a closing image at the bottom of a page, or a
// small index thumbnail). `ratio` is a Tailwind aspect utility, e.g. "aspect-[21/9]"
// (defaults to 16:9). `sizes` defaults to the full-width banner hint; pass a smaller
// one for thumbnails so next/image picks an appropriately small candidate.
export function PageImage({
  src,
  alt,
  ratio = "aspect-[16/9]",
  className = "",
  sizes = "(min-width: 1152px) 1104px, 100vw",
}: {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl shadow-deepwater ring-1 ring-gletscher/10 ${ratio} ${className}`.trim()}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/PageImage.test.tsx`
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageImage.tsx src/components/PageImage.test.tsx
git commit -m "feat(image): optional sizes prop on PageImage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Add required `cover`/`coverAlt` to the Article model

**Files:**
- Modify: `src/lib/ratgeber.ts`
- Modify: `src/lib/ratgeber.test.ts`
- Modify: `src/lib/ratgeber.io.test.ts`
- Modify: `src/components/ratgeber/ArticleHeader.test.tsx`
- Modify: `src/components/ratgeber/RatgeberIndex.test.tsx`
- Modify: `src/lib/jsonld.test.ts`

This task is atomic: changing `parseArticle` to throw breaks the IO fixtures and adding the required type fields breaks every `Article` literal, so all fixtures are fixed in the same commit to keep the suite green.

- [ ] **Step 1: Write the failing tests**

In `src/lib/ratgeber.test.ts`, first update the existing `sampleMdx` constant (lines 10-19) to include the new fields:

```ts
const sampleMdx = `---
title: "Beispielartikel"
description: "Eine kurze Beschreibung."
date: "2026-05-20"
tags: ["Zeit", "Praxis"]
cover: "/images/ratgeber-zeit.webp"
coverAlt: "Ruhiges Wasser im Abendlicht."
draft: true
---

Erster Absatz mit ein paar Wörtern.
`;
```

In the same file, update the existing `parseArticle` success test to also assert the new fields (add these two lines inside the first `it(...)` block, after the `a.body` assertions):

```ts
    expect(a.cover).toBe("/images/ratgeber-zeit.webp");
    expect(a.coverAlt).toBe("Ruhiges Wasser im Abendlicht.");
```

Update the existing "defaults draft to false" test so its inline MDX carries the now-required fields (replace that test's body):

```ts
  it("defaults draft to false and tags to [] when absent", () => {
    const a = parseArticle(
      "x.mdx",
      `---\ntitle: "T"\ndescription: "D"\ndate: "2026-01-01"\ncover: "/images/ratgeber-system.webp"\ncoverAlt: "Wasser."\n---\nBody`,
    );
    expect(a.draft).toBe(false);
    expect(a.tags).toEqual([]);
  });
```

Add two new tests to the `describe("parseArticle", ...)` block:

```ts
  it("throws when cover is missing", () => {
    expect(() =>
      parseArticle("x.mdx", `---\ntitle: "T"\ndescription: "D"\ndate: "2026-01-01"\ncoverAlt: "Wasser."\n---\nBody`),
    ).toThrow(/cover/);
  });

  it("throws when coverAlt is missing", () => {
    expect(() =>
      parseArticle("x.mdx", `---\ntitle: "T"\ndescription: "D"\ndate: "2026-01-01"\ncover: "/images/ratgeber-system.webp"\n---\nBody`),
    ).toThrow(/coverAlt/);
  });
```

Update the `selectArticles` `base` object (line ~56) to include the new fields:

```ts
  const base: Omit<Article, "slug" | "date"> = {
    title: "t", description: "d", tags: [], draft: false, readingMinutes: 1, body: "b",
    cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.",
  };
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/ratgeber.test.ts`
Expected: the two new "throws when …" tests FAIL (no throw yet); the cover/coverAlt assertions FAIL (`undefined`).

- [ ] **Step 3: Implement the model + enforcement**

In `src/lib/ratgeber.ts`, add `cover` and `coverAlt` to the `Article` type (after `readingMinutes`, before `body`):

```ts
export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  cover: string; // public path, e.g. "/images/ratgeber-termine.webp"
  coverAlt: string; // German alt text
  body: string; // raw MDX body, frontmatter stripped
};
```

Replace `parseArticle` with:

```ts
export function parseArticle(filename: string, raw: string): Article {
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.mdx?$/, "");
  const cover = String(data.cover ?? "").trim();
  const coverAlt = String(data.coverAlt ?? "").trim();
  if (!cover) {
    throw new Error(`Ratgeber article "${slug}" is missing required frontmatter: cover`);
  }
  if (!coverAlt) {
    throw new Error(`Ratgeber article "${slug}" is missing required frontmatter: coverAlt`);
  }
  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: data.draft === true,
    readingMinutes: readingMinutes(content),
    cover,
    coverAlt,
    body: content,
  };
}
```

- [ ] **Step 4: Fix the IO temp fixtures**

In `src/lib/ratgeber.io.test.ts`, update the three `fs.writeFileSync` frontmatter strings (lines 11-13) so each has a cover + coverAlt:

```ts
  fs.writeFileSync(path.join(dir, "alpha.mdx"), `---\ntitle: "Alpha"\ndescription: "A"\ndate: "2026-03-01"\ntags: ["X"]\ncover: "/images/ratgeber-termine.webp"\ncoverAlt: "Wasser."\n---\nKörper A`);
  fs.writeFileSync(path.join(dir, "beta.mdx"), `---\ntitle: "Beta"\ndescription: "B"\ndate: "2026-04-01"\ncover: "/images/ratgeber-zeit.webp"\ncoverAlt: "Wasser."\n---\nKörper B`);
  fs.writeFileSync(path.join(dir, "entwurf.mdx"), `---\ntitle: "Entwurf"\ndescription: "E"\ndate: "2026-05-01"\ndraft: true\ncover: "/images/ratgeber-system.webp"\ncoverAlt: "Wasser."\n---\nKörper E`);
```

- [ ] **Step 5: Fix the remaining `Article` literals**

In `src/components/ratgeber/ArticleHeader.test.tsx`, update the `article` literal (lines 7-11) to add the fields:

```ts
const article: Article = {
  slug: "x", title: "Der Titel", description: "d",
  date: "2026-05-28", tags: ["Termine", "Automatisierung"],
  draft: false, readingMinutes: 6, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.",
};
```

In `src/components/ratgeber/RatgeberIndex.test.tsx`, update the `a` factory (lines 7-10):

```ts
const a = (slug: string, title: string): Article => ({
  slug, title, description: "d", date: "2026-05-01", tags: [],
  draft: false, readingMinutes: 1, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.",
});
```

In `src/lib/jsonld.test.ts`, update the `a` literal (lines 31-34):

```ts
    const a: Article = {
      slug: "x", title: "T", description: "D", date: "2026-05-01",
      tags: [], draft: false, readingMinutes: 3, body: "b",
      cover: "/images/ratgeber-termine.webp", coverAlt: "Wasser.",
    };
```

- [ ] **Step 6: Run the full suite + type-check**

Run: `npm test`
Expected: all tests PASS (including the two new throw tests).

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ratgeber.ts src/lib/ratgeber.test.ts src/lib/ratgeber.io.test.ts src/components/ratgeber/ArticleHeader.test.tsx src/components/ratgeber/RatgeberIndex.test.tsx src/lib/jsonld.test.ts
git commit -m "feat(ratgeber): require cover/coverAlt frontmatter

parseArticle throws when either is missing; Article gains cover/coverAlt.
Fixtures updated across unit, IO, and component tests.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Add cover frontmatter to the three seed articles

**Files:**
- Modify: `content/ratgeber/terminbestaetigungen-automatisieren.mdx`
- Modify: `content/ratgeber/taeglich-stunden-zurueckgewinnen.mdx`
- Modify: `content/ratgeber/flickenteppich-oder-saubere-quelle.mdx`

After Task 3, `getAllArticles` over the real content dir will throw until these have covers. The alt text is German and draft-to-verify by the founder.

- [ ] **Step 1: Add cover + coverAlt to `terminbestaetigungen-automatisieren.mdx`**

Insert these two lines into the frontmatter block, immediately after the `tags:` line (before `draft:`):

```yaml
cover: "/images/ratgeber-termine.webp"
coverAlt: "Konzentrische Wellenringe breiten sich ruhig über dunkles Wasser aus, ausgehend von einem warmen Lichtpunkt."
```

- [ ] **Step 2: Add cover + coverAlt to `taeglich-stunden-zurueckgewinnen.mdx`**

Insert after the `tags:` line (before `draft:`):

```yaml
cover: "/images/ratgeber-zeit.webp"
coverAlt: "Sanfte Wellen auf dunklem Wasser, auf denen sich warmes Abendlicht in kleinen Reflexen wiederholt."
```

- [ ] **Step 3: Add cover + coverAlt to `flickenteppich-oder-saubere-quelle.mdx`**

Insert after the `tags:` line (before `draft:`):

```yaml
cover: "/images/ratgeber-system.webp"
coverAlt: "Bewegtes, schäumendes Wasser, durch das ein warmer Lichtschein bricht."
```

- [ ] **Step 4: Verify all real articles parse with covers**

Run (single line):

```bash
node -e "require('ts-node');" 2>/dev/null; npx tsx -e "import {getAllArticles} from './src/lib/ratgeber';for(const a of getAllArticles({includeDrafts:true})){console.log(a.slug,'->',a.cover);}"
```

If `tsx` is unavailable, verify instead by running the IO/integrity tests in Task 5. Expected: three lines mapping each slug to its `/images/ratgeber-*.webp` cover, no thrown error.

- [ ] **Step 5: Commit**

```bash
git add content/ratgeber/terminbestaetigungen-automatisieren.mdx content/ratgeber/taeglich-stunden-zurueckgewinnen.mdx content/ratgeber/flickenteppich-oder-saubere-quelle.mdx
git commit -m "content(ratgeber): assign covers to the three seed articles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Content-integrity test for covers

**Files:**
- Create: `src/lib/ratgeber.covers.test.ts`

- [ ] **Step 1: Write the test**

Create `src/lib/ratgeber.covers.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllArticles } from "./ratgeber";

// Guards that every real article (drafts included) declares a cover under
// /images that actually exists in public/. Catches a frontmatter typo or a
// forgotten WebP conversion at test time rather than at build/runtime.
describe("Ratgeber covers (content integrity)", () => {
  const articles = getAllArticles({ includeDrafts: true });

  it("has at least one article", () => {
    expect(articles.length).toBeGreaterThan(0);
  });

  it.each(articles.map((a) => [a.slug, a.cover] as const))(
    "%s: cover is under /images and the file exists",
    (_slug, cover) => {
      expect(cover.startsWith("/images/")).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "public", cover))).toBe(true);
    },
  );
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- src/lib/ratgeber.covers.test.ts`
Expected: PASS — one row per real article, each cover file found (depends on Tasks 1 + 4).

- [ ] **Step 3: Commit**

```bash
git add src/lib/ratgeber.covers.test.ts
git commit -m "test(ratgeber): content-integrity guard for cover files

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Index card thumbnail

**Files:**
- Modify: `src/components/ratgeber/ArticleCard.tsx`
- Modify: `src/components/ratgeber/ArticleCard.test.tsx`

- [ ] **Step 1: Update the test (fixture + new assertion)**

In `src/components/ratgeber/ArticleCard.test.tsx`, update the `article` fixture (lines 7-10) to include the required fields and a distinctive alt:

```ts
const article: Article = {
  slug: "mein-artikel", title: "Mein Artikel", description: "Worum es geht.",
  date: "2026-05-28", tags: ["Termine"], draft: false, readingMinutes: 6, body: "b",
  cover: "/images/ratgeber-termine.webp", coverAlt: "Ruhige Wasserringe.",
};
```

Add an assertion inside the first `it(...)` block (after the existing meta assertions):

```ts
    expect(screen.getByAltText("Ruhige Wasserringe.")).toBeInTheDocument();
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/ratgeber/ArticleCard.test.tsx`
Expected: the alt-text assertion FAILS (no image rendered yet).

- [ ] **Step 3: Add the thumbnail**

Replace `src/components/ratgeber/ArticleCard.tsx` with:

```tsx
// src/components/ratgeber/ArticleCard.tsx
import Link from "next/link";
import { PageImage } from "@/components/PageImage";
import { formatDate, type Article } from "@/lib/ratgeber";

export function ArticleCard({ article }: { article: Article }) {
  const meta = [
    formatDate(article.date),
    `${article.readingMinutes} Min`,
    article.tags[0],
    article.draft ? "Entwurf" : null,
  ].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col gap-4 border-t border-faden py-8 first:border-t-0 sm:flex-row sm:gap-6">
      <div className="sm:w-40 sm:flex-none">
        <PageImage
          src={article.cover}
          alt={article.coverAlt}
          ratio="aspect-[16/9]"
          sizes="(min-width: 640px) 160px, 100vw"
          className="rounded-xl"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
        <h2 className="mt-2 font-serif text-2xl font-medium text-tiefes-wasser">
          <Link href={`/ratgeber/${article.slug}`} className="hover:text-vrelo-petrol">
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 max-w-2xl text-tinte/80">{article.description}</p>
      </div>
    </article>
  );
}
```

The title remains the single link (no duplicate-link a11y noise); the thumbnail is an informative image with real alt text.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/ratgeber/ArticleCard.test.tsx`
Expected: all tests PASS (the existing link/meta tests plus the new alt-text assertion).

- [ ] **Step 5: Commit**

```bash
git add src/components/ratgeber/ArticleCard.tsx src/components/ratgeber/ArticleCard.test.tsx
git commit -m "feat(ratgeber): cover thumbnail in the index list

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Article-page cover banner

**Files:**
- Modify: `src/app/ratgeber/[slug]/page.tsx`

The article page is an async RSC that reads the filesystem, so it is verified through `npm run build` + a browser check (Task 8) rather than a unit test.

- [ ] **Step 1: Import PageImage**

In `src/app/ratgeber/[slug]/page.tsx`, add to the imports (after the `Section` import on line 5):

```tsx
import { PageImage } from "@/components/PageImage";
```

- [ ] **Step 2: Render the banner above the header**

Replace the first `Section` block in the returned JSX (currently lines 53-62) with:

```tsx
      <Section tone="paper">
        <div className="mx-auto mb-10 max-w-4xl">
          <PageImage src={article.cover} alt={article.coverAlt} ratio="aspect-[16/9]" />
        </div>
        <ArticleHeader article={article} />
        <div className="mx-auto mt-10 max-w-2xl">
          <MDXRemote
            source={article.body}
            components={proseComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkBrandword] } }}
          />
        </div>
      </Section>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/ratgeber/[slug]/page.tsx
git commit -m "feat(ratgeber): cover banner above the article header

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Full verification + browser check

**Files:** none (verification only)

- [ ] **Step 1: Run the gate**

Run each, expecting success:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests green, no type errors, no lint errors, build completes (static params generate the three article routes without throwing).

- [ ] **Step 2: Browser-verify**

Start the production server (use `npm start`, not `npm run dev`, in this environment):

```bash
npm run build && npm start
```

Then check in the browser (Playwright or manual) at viewports 1440 and 390:
- `/ratgeber` — each list row shows a 16:9 cover thumbnail left of the text on desktop, stacked above on mobile; the list stays aligned; titles remain readable.
- `/ratgeber/terminbestaetigungen-automatisieren` — the cover banner sits above the centered title; the title is on paper and readable; no layout shift (CLS) as the image loads.

Expected: covers render, layouts match the approved mockups, no console errors.

- [ ] **Step 3: Stop the server**

Stop `npm start` (and free port 3000 if it lingers):

```bash
# PowerShell, only if the port stays bound:
# Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

No commit needed for verification unless a fix was required; if so, commit it with a descriptive message.

---

## Self-review notes

- **Spec coverage:** required `cover`/`coverAlt` + throw (Task 3); banner-first article page (Task 7); list+thumbnail index (Task 6); PageImage `sizes` (Task 2); 3 PNG→WebP + mapping (Task 1); seed frontmatter (Task 4); tests incl. content-integrity (Tasks 2/3/5/6); OG + index banner untouched (no task — confirmed out of scope). All covered.
- **Type consistency:** field names `cover`/`coverAlt` used identically in the type, `parseArticle`, every fixture, `PageImage` (`sizes` prop), `ArticleCard`, and the article page.
- **Atomicity:** Task 3 fixes all `Article` literals and IO fixtures in one commit so the suite never goes red mid-task; Task 4 supplies real covers before the integrity test (Task 5) and build (Task 8) depend on them.
