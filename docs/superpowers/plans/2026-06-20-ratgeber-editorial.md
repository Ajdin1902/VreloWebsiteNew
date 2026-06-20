# Ratgeber Editorial Design Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the Ratgeber article page and index from functional to calm-editorial — title+lede first with a slim cover, a drop-cap opening, a centered pull-quote, and a typographic index — without changing any article copy.

**Architecture:** Pure layout + typographic craft on existing components. The article page reorders its header/cover and wraps the MDX body in an `.article-body` div that a CSS `::first-letter` rule turns into a drop-cap. Pull-quotes are restyled in `Prose.tsx` via Tailwind arbitrary variants (`[&_p]:…`) so the mapped inner `<p>` is overridden. The index drops thumbnails for a typographic list. Spec: `docs/superpowers/specs/2026-06-20-ratgeber-editorial-design.md`.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 `@theme` tokens, `next-mdx-remote/rsc`, Vitest + React Testing Library.

---

## File structure

- `src/components/Prose.tsx` — MDX element map; **modify** the `blockquote` → centered pull-quote.
- `src/components/Prose.test.tsx` — **create**; covers the pull-quote.
- `src/app/globals.css` — **modify**; add the `.article-body` drop-cap rule.
- `src/components/ratgeber/ArticleHeader.tsx` — **modify** to a left-aligned editorial header (meta line + lede).
- `src/components/ratgeber/ArticleHeader.test.tsx` — **modify** for the new header.
- `src/app/ratgeber/[slug]/page.tsx` — **modify**; cover moves below the header (21:9), body wrapped in `.article-body`, back-link added.
- `src/components/ratgeber/ArticleCard.tsx` — **modify** to a thumbnail-less typographic row.
- `src/components/ratgeber/ArticleCard.test.tsx` — **modify** for the new row.
- `src/app/ratgeber/page.tsx` — **modify**; drop the intro banner image.

`RatgeberIndex.tsx` is unchanged (it just maps `ArticleCard`). No article MDX content changes.

---

## Task 0: Branch

- [ ] **Step 1: Create the feature branch**

```bash
cd "Vrelo Website New" && git checkout -b feat/ratgeber-editorial
```

---

## Task 1: Pull-quote in Prose

**Files:**
- Create: `src/components/Prose.test.tsx`
- Modify: `src/components/Prose.tsx:26-28` (the `blockquote` entry)

- [ ] **Step 1: Write the failing test**

Create `src/components/Prose.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { proseComponents } from "./Prose";

describe("proseComponents.blockquote (pull-quote)", () => {
  it("renders a centered pull-quote with an amber drop mark and no left stripe", () => {
    const Blockquote = proseComponents.blockquote;
    const { container } = render(
      <Blockquote>
        <p>Ein ruhiger Satz.</p>
      </Blockquote>,
    );
    const bq = container.querySelector("blockquote")!;
    expect(bq).toBeTruthy();
    expect(bq.className).toContain("text-center");
    expect(bq.className).not.toContain("border-l");
    expect(bq.querySelector("span[aria-hidden]")).toBeTruthy();
    expect(bq.textContent).toContain("Ein ruhiger Satz.");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/Prose.test.tsx`
Expected: FAIL — the current blockquote className contains `border-l` and has no `text-center` / drop span.

- [ ] **Step 3: Implement the pull-quote**

In `src/components/Prose.tsx`, replace the `blockquote` entry (lines 26-28) with:

```tsx
  blockquote: ({ children, ...rest }: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-10 text-center [&_p]:mt-0 [&_p]:font-serif [&_p]:text-2xl [&_p]:italic [&_p]:leading-relaxed [&_p]:text-tiefes-wasser"
      {...rest}
    >
      <span
        aria-hidden
        className="mx-auto mb-3 block h-4 w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
      />
      {children}
    </blockquote>
  ),
```

(The `[&_p]:…` variants override the mapped inner `<p>` styles via descendant-selector specificity, so the quote renders centered serif italic instead of left-aligned body text.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/Prose.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Prose.tsx src/components/Prose.test.tsx
git commit -m "feat(ratgeber): centered pull-quote, drop the side-stripe blockquote"
```

---

## Task 2: Drop-cap CSS utility

**Files:**
- Modify: `src/app/globals.css` (append a rule near the end, before the final closing of the file)

Pure CSS (`::first-letter` can't be meaningfully unit-tested in jsdom) — verified in the build (Task 6) and the browser pass.

- [ ] **Step 1: Add the drop-cap rule**

Append to `src/app/globals.css` (after the `.reveal-ready` block at the end):

```css
/* Ratgeber article drop-cap: a large Fraunces initial on the first paragraph of
   the article body. Pure CSS; degrades to a normal capital if Fraunces fails.
   petrol on lesepapier clears AA. */
.article-body > p:first-of-type::first-letter {
  font-family: var(--font-serif);
  font-weight: 500;
  float: left;
  font-size: 3.4rem;
  line-height: 0.8;
  padding: 0.35rem 0.6rem 0 0;
  color: var(--color-vrelo-petrol);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS (no TS/lint impact from CSS; this just confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(ratgeber): drop-cap CSS for the article body first paragraph"
```

---

## Task 3: Editorial ArticleHeader

**Files:**
- Modify: `src/components/ratgeber/ArticleHeader.test.tsx`
- Modify: `src/components/ratgeber/ArticleHeader.tsx`

- [ ] **Step 1: Update the test (now failing)**

Replace the whole body of `src/components/ratgeber/ArticleHeader.test.tsx` with:

```tsx
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
    expect(screen.getByText("Die kurze Einleitung.")).toBeInTheDocument();
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/ratgeber/ArticleHeader.test.tsx`
Expected: FAIL — current header is `text-center` and has no lede.

- [ ] **Step 3: Rewrite the component**

Replace the whole file `src/components/ratgeber/ArticleHeader.tsx` with:

```tsx
// src/components/ratgeber/ArticleHeader.tsx
import { formatDate, type Article } from "@/lib/ratgeber";
import { withBrandWords } from "@/components/BrandWord";

export function ArticleHeader({ article }: { article: Article }) {
  const meta = [
    formatDate(article.date),
    `${article.readingMinutes} Min Lesezeit`,
    ...article.tags,
  ].join(" · ");

  return (
    <header className="mx-auto max-w-2xl">
      {article.draft && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stumm">Entwurf</p>
      )}
      <div className="flex items-center gap-3">
        {/* amber drop motif — points up, per Brand.md */}
        <span
          aria-hidden
          className="block h-4 w-3 shrink-0 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
      </div>
      <h1 className="mt-4 font-serif text-3xl font-medium text-tiefes-wasser md:text-4xl">
        {article.title}
      </h1>
      <p className="mt-4 font-serif text-xl text-ember">{withBrandWords(article.description)}</p>
      <hr className="mt-6 border-faden" />
    </header>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/ratgeber/ArticleHeader.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ratgeber/ArticleHeader.tsx src/components/ratgeber/ArticleHeader.test.tsx
git commit -m "feat(ratgeber): left-aligned editorial header with standfirst lede"
```

---

## Task 4: Article page reorder (cover below header, drop-cap wrapper, back-link)

**Files:**
- Modify: `src/app/ratgeber/[slug]/page.tsx`

No unit test (async RSC reading MDX; the repo doesn't unit-test pages). Verified by build + browser (Task 6).

- [ ] **Step 1: Add the `Link` import**

In `src/app/ratgeber/[slug]/page.tsx`, add after the existing imports (below line 14):

```tsx
import Link from "next/link";
```

- [ ] **Step 2: Replace the returned JSX**

Replace the `return ( … )` block of `ArticlePage` (currently lines 52-80) with:

```tsx
  return (
    <>
      <Section tone="reading">
        <ArticleHeader article={article} />
        <div className="mx-auto mt-8 max-w-2xl">
          <PageImage src={article.cover} alt={article.coverAlt} ratio="aspect-[21/9]" />
        </div>
        <div className="article-body mx-auto mt-10 max-w-2xl">
          <MDXRemote
            source={article.body}
            components={proseComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkBrandword] } }}
          />
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <Link
            href="/ratgeber"
            className="text-sm font-medium text-stumm underline-offset-4 hover:text-vrelo-petrol hover:underline"
          >
            ← Zurück zum Ratgeber
          </Link>
        </div>
      </Section>
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet – ich zeige dir unverbindlich, was sich automatisieren lässt."
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
```

(The cover is now a 21:9 banner on the `max-w-2xl` column *below* the header; the body div carries `article-body` so the drop-cap rule applies. The ClosingCta lead keeps its existing spaced en-dash `–`.)

- [ ] **Step 3: Verify build + typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS; `/ratgeber/[slug]` prerenders without error.

- [ ] **Step 4: Commit**

```bash
git add "src/app/ratgeber/[slug]/page.tsx"
git commit -m "feat(ratgeber): title-first layout — slim 21:9 cover below header, drop-cap body, back-link"
```

---

## Task 5: Typographic index (no thumbnails) + drop intro banner

**Files:**
- Modify: `src/components/ratgeber/ArticleCard.test.tsx`
- Modify: `src/components/ratgeber/ArticleCard.tsx`
- Modify: `src/app/ratgeber/page.tsx`

- [ ] **Step 1: Update the ArticleCard test (now failing)**

Replace the whole body of `src/components/ratgeber/ArticleCard.test.tsx` with:

```tsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/ratgeber/ArticleCard.test.tsx`
Expected: FAIL — current card still renders an `<img>` thumbnail.

- [ ] **Step 3: Rewrite the component**

Replace the whole file `src/components/ratgeber/ArticleCard.tsx` with:

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
      <div className="flex items-center gap-3">
        {/* amber drop motif — points up, per Brand.md */}
        <span
          aria-hidden
          className="block h-4 w-3 shrink-0 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
      </div>
      <h2 className="mt-3 font-serif text-2xl font-medium text-tiefes-wasser">
        <Link href={`/ratgeber/${article.slug}`} className="hover:text-vrelo-petrol">
          {article.title}
        </Link>
      </h2>
      <p className="mt-2 max-w-2xl text-tinte/80">{article.description}</p>
    </article>
  );
}
```

- [ ] **Step 4: Run the ArticleCard + RatgeberIndex tests to verify they pass**

Run: `npx vitest run src/components/ratgeber/ArticleCard.test.tsx src/components/ratgeber/RatgeberIndex.test.tsx`
Expected: PASS (RatgeberIndex unchanged — still renders one row per article).

- [ ] **Step 5: Drop the intro banner on the index page**

In `src/app/ratgeber/page.tsx`, replace the `<PageIntro … />` block (currently lines 23-31) with:

```tsx
      <PageIntro
        title="Gedanken zur ruhigen Automatisierung"
        lead="Praxisnahe Notizen für kleine Betriebe – wie du wiederkehrende Arbeit abgibst und Zeit, Ruhe und einen freien Kopf zurückgewinnst."
      />
```

(Removes the `image={{ … }}` prop so the listing opens on the title + lead, not a tall banner.)

- [ ] **Step 6: Commit**

```bash
git add src/components/ratgeber/ArticleCard.tsx src/components/ratgeber/ArticleCard.test.tsx src/app/ratgeber/page.tsx
git commit -m "feat(ratgeber): typographic index list, drop the intro banner"
```

---

## Task 6: Full gate + browser verify

**Files:** none (verification only).

- [ ] **Step 1: Run the full gate**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: PASS — all suites green (the three updated tests + Prose.test included), clean build.

- [ ] **Step 2: German typography byte-check**

Run:

```bash
python -c "
for f in ['src/components/ratgeber/ArticleHeader.tsx','src/app/ratgeber/[slug]/page.tsx','src/app/ratgeber/page.tsx']:
    s=open(f,encoding='utf-8').read()
    print(f, 'em-dash(U+2014):', s.count(chr(0x2014)), 'en-dash(U+2013):', s.count(chr(0x2013)))
"
```

Expected: **0** em-dashes in client copy; the ClosingCta lead and index lead keep their spaced en-dash `–` (U+2013). If any `–` became `—`, fix it (replace U+2014 with U+2013).

- [ ] **Step 3: Browser-verify (production server)**

```bash
npm start -- -p 3100
```

Then in the browser at **1440** and **390**, check:
- **Article** (`/ratgeber/taeglich-stunden-zurueckgewinnen`): headline + lede are above the fold; cover is a slim 21:9 band below them; the first paragraph shows a drop-cap; a `>` quote renders as a centered pull-quote with the amber drop; „← Zurück zum Ratgeber“ link sits before the ClosingCta. No layout overflow at 390.
- **Index** (`/ratgeber`): title + lead (no banner), then typographic rows (meta · serif title · lede) divided by thin rules; no thumbnails.
- AA spot-check: lede `ember`, meta `stumm`, drop-cap `petrol` all legible on `lesepapier`.

Stop the server when done:

```bash
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }"
```

- [ ] **Step 4: Final commit (if byte-fixes were needed)**

```bash
git add -A
git commit -m "fix(ratgeber): typography byte-check corrections" || echo "nothing to fix"
```

---

## Self-review notes

- **Spec coverage:** §1 article header → Tasks 3-4; §1 cover-below + 21:9 + back-link → Task 4; §2 pull-quote → Task 1; §3 index list + drop banner → Task 5; §4 drop-cap → Task 2, contrast → Task 6 step 3; testing/verification → Task 6. All covered.
- **No new content:** the lede reuses `article.description`; no MDX article files change.
- **Type consistency:** `proseComponents.blockquote`, `ArticleHeader({ article })`, `ArticleCard({ article })`, `formatDate(date)`, `withBrandWords(text)` all match existing signatures.
- **Out of scope (unchanged):** `RatgeberIndex.tsx`, reading-progress, related-article, callouts.
