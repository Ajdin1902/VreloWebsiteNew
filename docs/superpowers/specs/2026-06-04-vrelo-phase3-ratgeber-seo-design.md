# Vrelo Phase 3 — Ratgeber (MDX) + SEO Foundation · Design Spec

> Date: 2026-06-04 · Branch: `feat/phase3-ratgeber-seo`
> Builds on: [main design spec](2026-06-01-vrelo-website-design.md) · [Brand.md](../../../Brand.md) · [CLAUDE.md](../../../CLAUDE.md)
> Client-facing copy is **German**; code/comments **English**. German quotes: „…“ = U+201E + U+201C.

## 1. Goal

Turn `/ratgeber` from a dead link into a working German Ratgeber (blog) and lay the **full site-wide SEO foundation**. Phase 3 delivers:

1. An MDX article system (content collection + typed loader), fully static.
2. Three on-brand seed articles (full drafts, draft-to-verify).
3. Site-wide structured data (JSON-LD), `sitemap.xml`, `robots.txt`.
4. Auto-generated branded Open Graph images per page + per article.

Out of scope (later phases): newsletter backend (Phase 4 — Resend), contact form + Cal.com (Phase 4), legal pages (Phase 5). The article-end slot uses the existing booking CTA now; the newsletter form swaps in during Phase 4.

## 2. Decisions (locked in brainstorming)

| # | Decision |
|---|---|
| D1 | **MDX system = content collection** (Approach A): `content/ratgeber/*.mdx` + typed loader `src/lib/ratgeber.ts`. Not route-file MDX. |
| D2 | **Full SEO foundation now:** Article (posts), FAQPage (`/faq`), Person (`/ueber-mich`), ProfessionalService (Home), BreadcrumbList (subpages), plus `sitemap.xml` + `robots.txt`. |
| D3 | **Article-end = booking `ClosingCta`** (already built). Newsletter deferred to Phase 4; leave a marked swap-in point. |
| D4 | **Three full on-brand draft articles** (~800–1200 words each), flagged draft-to-verify. |
| D5 | **Auto-generated branded OG images** per page + per article via `ImageResponse`. |
| D6 | **Auto-wrap remark plugin**: literal „Vrelo“/„Merak“ in MDX text auto-render via `<BrandWord>`. |
| D7 | **Index layout A** — editorial single-column rows with hairline dividers. |
| D8 | **Article header B** — subtle brand motif: amber drop + petrol rule above a centered Fraunces title; ~64ch reading column, petrol links, ember-italic Fraunces pull-quotes. |

## 3. Content model

### 3.1 Files
`content/ratgeber/<slug>.mdx`, one per article. Slug = filename (kebab-case). YAML frontmatter:

```yaml
---
title: "So automatisierst du Terminbestätigungen — ohne Kalender-Chaos"
description: "Kein Hinterhertelefonieren mehr: Wie eine saubere Quelle Bestätigungen, Erinnerungen und Absagen still im Hintergrund erledigt."
date: "2026-05-28"        # ISO date
tags: ["Termine", "Automatisierung"]
draft: true               # draft-to-verify articles; excluded from index + sitemap
---
```

Notes:
- `draft: true` is the default for the seed articles (founder must verify before go-live). Drafts are excluded from the index, `generateStaticParams`, and the sitemap. (Decision for implementation: drafts 404 in production; optionally visible in dev — keep simple, treat draft = not built.)
- Reading time is **computed** from word count (~200 wpm), not stored in frontmatter.
- No `cover` image field in Phase 3 (header is typographic + brand motif; share image is the generated OG).

### 3.2 Loader — `src/lib/ratgeber.ts`
Mirrors the existing `src/lib/*.ts` content-as-data pattern. Reads the content dir with `fs` at build time.

```ts
export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;          // ISO
  tags: string[];
  readingMinutes: number;
  body: string;          // raw MDX body (frontmatter stripped)
};

getAllArticles(): Article[]        // published only, newest-first
getArticleBySlug(slug): Article    // throws if missing or draft
getArticleSlugs(): string[]        // published slugs, for generateStaticParams
```

Frontmatter parsing: a small dependency (e.g. `gray-matter`) or a minimal in-repo parser — chosen at implementation, covered by tests. Date sort is descending. Draft filtering applied in all three accessors.

## 4. Rendering & MDX

- **Compiler:** build-time MDX compile in RSC. Primary candidate `next-mdx-remote/rsc` `compileMDX`; fallback `@next/mdx` `compileMDX`. The exact choice is pinned during implementation and **verified against Next 16.2.7 / React 19.2 with a passing render test before building on it**. Architecture is identical either way: body string + components map → rendered RSC.
- **Components map (`mdx-components.tsx` / `Prose`):** maps `h2/h3/p/a/ul/ol/li/blockquote/strong/em` to brand-styled elements (this *is* the `Prose` component). `<BrandWord>` and any future safe components are exposed to MDX scope.
- **Remark auto-wrap plugin (`src/lib/remark-brandword.ts`):** walks MDX text nodes and wraps the literal words „Vrelo“ and „Merak“ (incl. the `Merak`-Effekt stem) in `<BrandWord>`. Skips `code`/`pre` nodes and existing `<BrandWord>`. Tested in isolation.
- **Prose styling (matches Brand.md + the approved mockup):** body Plus Jakarta Sans ~15–17px, line-height ~1.75, measure ~64ch, color near `--tinte`; `h2` Fraunces 500 `--tiefes-wasser`; links `--vrelo-petrol` underlined; blockquote = Fraunces italic `--ember` with a `--amber` left rule; lists comfortable. All via brand `@theme` tokens, no hand-rolled hex.

## 5. Routes

### 5.1 `/ratgeber` — index (`src/app/ratgeber/page.tsx`)
- `PageIntro` (eyebrow „Ratgeber“, Fraunces title, lead).
- **Layout A:** single column of `ArticleCard` rows, newest-first, separated by `--faden` hairlines. Each row: meta line (`DD. Monat YYYY · N Min · TagPrimary`, uppercase `--stumm`), Fraunces title (links to article), description (~60ch).
- `ClosingCta` (booking) at the bottom.
- `metadata` (title „Ratgeber“, description). Static.

### 5.2 `/ratgeber/[slug]` — article (`src/app/ratgeber/[slug]/page.tsx`)
- `generateStaticParams` → published slugs (full SSG).
- `generateMetadata` → from frontmatter (title, description, canonical, `openGraph`).
- **Header B (`ArticleHeader`):** centered — amber drop glyph (drop points up, per Brand.md) → eyebrow „Ratgeber“ → Fraunces title → short petrol rule → meta (date · reading time) → tag chips.
- **Body:** `Prose`-rendered MDX in the ~64ch column.
- `ClosingCta` (booking; marked as the Phase-4 newsletter swap-in point).
- JSON-LD: `Article` + `BreadcrumbList` (Home › Ratgeber › Title).
- Unknown/draft slug → `notFound()`.

### 5.3 Nav
`/ratgeber` is already listed in `src/lib/nav.ts` — it simply becomes a live link. No nav change required; verify Header/Footer render it correctly and the prod 404 note in CLAUDE.md clears.

## 6. SEO layer

- **Base URL constant:** one module (e.g. `src/lib/site.ts`) exporting `siteUrl` (`https://vrelo-website.vercel.app` now; swap to `vrelo.de` later) + site name. Consumed by metadata, sitemap, JSON-LD, OG.
- **Per-page metadata:** ensure each route sets title + description + canonical + `openGraph`. Articles derive these from frontmatter via `generateMetadata`.
- **JSON-LD builders (`src/lib/jsonld.ts`) + `<JsonLd>` component** (`<script type="application/ld+json">`, serialized safely):
  - Home → `ProfessionalService` (name *Vrelo*, founder Ajdin, `areaServed` DACH: DE/AT/CH, url, description).
  - `/ueber-mich` → `Person` (Ajdin, founder of Vrelo).
  - `/faq` → `FAQPage` generated from `src/lib/faq.ts` (no copy duplication).
  - `/ratgeber/[slug]` → `Article` (headline, description, `datePublished`, author Person, `image` = the article OG URL, publisher).
  - `BreadcrumbList` on `/leistungen`, `/ueber-mich`, `/faq`, `/ratgeber`, `/ratgeber/[slug]` via a shared helper.
- **`src/app/sitemap.ts`** (`MetadataRoute.Sitemap`): `/`, `/leistungen`, `/ueber-mich`, `/faq`, `/ratgeber`, and each published article. **Excludes** drafts and unbuilt routes (`/kontakt`, `/newsletter`, `/impressum`, `/datenschutz`) until their phases. `lastModified` from article date where applicable.
- **`src/app/robots.ts`** (`MetadataRoute.Robots`): allow all, `sitemap: ${siteUrl}/sitemap.xml`, host.
- **OG images (`ImageResponse`):**
  - `src/app/opengraph-image.tsx` — site default (Papier bg, Fraunces wordmark/lockup, descriptor).
  - `src/app/ratgeber/[slug]/opengraph-image.tsx` — per-article: Papier bg, article title in Fraunces, Vrelo mark, „Ratgeber“ eyebrow.
  - *Implementation note:* `ImageResponse` requires raw font buffers — add the needed Fraunces + Plus Jakarta Sans font files (subset if possible) for the OG renderer and verify they load in the build. 1200×630.

## 7. Components & files

**New components**
- `src/components/ratgeber/ArticleCard.tsx` — index row (layout A).
- `src/components/ratgeber/ArticleHeader.tsx` — article header (B: drop + eyebrow + title + rule + meta + tags).
- `src/components/Prose.tsx` + root `mdx-components.tsx` — MDX element map / styling.
- `src/components/JsonLd.tsx` — renders a JSON-LD script tag.

**New lib**
- `src/lib/ratgeber.ts` — content loader (typed).
- `src/lib/jsonld.ts` — typed JSON-LD builders.
- `src/lib/remark-brandword.ts` — auto-wrap remark plugin.
- `src/lib/site.ts` — base URL + site constants.
- reading-time helper (in `ratgeber.ts` or its own small module).

**New routes / metadata files**
- `src/app/ratgeber/page.tsx`, `src/app/ratgeber/[slug]/page.tsx`
- `src/app/sitemap.ts`, `src/app/robots.ts`
- `src/app/opengraph-image.tsx`, `src/app/ratgeber/[slug]/opengraph-image.tsx`

**Content**
- `content/ratgeber/terminbestaetigungen-automatisieren.mdx`
- `content/ratgeber/taeglich-stunden-zurueckgewinnen.mdx`
- `content/ratgeber/flickenteppich-oder-saubere-quelle.mdx`

**Config**
- `next.config.ts` and/or a new dependency for MDX compilation + frontmatter (pinned at implementation).

**Touched existing files**
- `src/app/page.tsx` (Home JSON-LD), `src/app/ueber-mich/page.tsx` (Person JSON-LD), `src/app/faq/page.tsx` (FAQPage JSON-LD), and per-page `openGraph`/canonical where missing.

## 8. Seed articles (draft-to-verify)

All three: first-person „Ich“, „du“ address, calm, outcome-over-mechanism, ≤1 water metaphor, „Vrelo“/„Merak“ via BrandWord, lands on the *Merak*-Effekt where it fits. Marked `draft: true` until the founder verifies any factual claims.

1. **`terminbestaetigungen-automatisieren`** — „So automatisierst du Terminbestätigungen — ohne Kalender-Chaos“ · tags Termine, Automatisierung.
2. **`taeglich-stunden-zurueckgewinnen`** — „Wie kleine Betriebe täglich Stunden zurückgewinnen“ · tags Zeit, Praxis.
3. **`flickenteppich-oder-saubere-quelle`** — „Flickenteppich oder saubere Quelle?“ · tags Grundlagen.

## 9. Testing & verification

Follows the existing TDD + per-task-commit workflow. The full gate stays green at the end of each task:

- **Unit tests:** loader (frontmatter parse, ISO date sort desc, draft filter across all accessors, slug lookup + throw on miss), reading-time helper, remark-brandword (wraps „Vrelo“/„Merak“, skips code + already-wrapped + other words), JSON-LD builders (correct `@type`/shape for each, FAQPage from `faq.ts`).
- **Component render tests:** `ArticleCard`, `ArticleHeader`, `Prose` (renders headings/links/blockquote with brand classes; BrandWord present), `JsonLd` (valid JSON, correct script type).
- **Build/route checks:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build` — all routes static incl. `/ratgeber` + the 3 article pages + `sitemap.xml` + `robots.txt` + OG images render.
- **Manual smoke (via `npm start`, per CLAUDE.md):** `/ratgeber` lists articles, an article renders with header B + Prose + working CTA, JSON-LD validates, OG image renders, sitemap/robots resolve.

## 10. Risks & notes

- **MDX compiler compatibility** with Next 16 / React 19 RSC is the main unknown — de-risk first with a minimal render test before building components on top (see §4).
- **OG fonts:** `ImageResponse` needs raw font files; adding/subset­ting them is a small but real task — verify in build.
- **Draft handling:** keep it simple (draft = not built / 404 in prod). Don't over-engineer a preview mode.
- **No scope creep:** no tag filter/search UI for 3 articles (YAGNI); tags display only. No newsletter form, no contact form, no legal pages.
- **Brand discipline:** all colors via `@theme` tokens; „Vrelo“/„Merak“ only via BrandWord; verify German typographic quotes (U+201E/U+201C) survive in any committed copy (the Edit-tool downgrade gotcha from CLAUDE.md).
