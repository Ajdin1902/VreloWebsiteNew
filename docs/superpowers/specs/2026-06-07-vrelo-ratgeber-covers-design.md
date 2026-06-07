# Vrelo Ratgeber Per-Article Covers — Design

**Date:** 2026-06-07
**Status:** Approved (brainstorm) → ready for implementation plan

## Goal

Give every Ratgeber article a cover photograph: a banner on the article page and a
thumbnail in the `/ratgeber` index. Covers are **required** frontmatter, so no article
can render without art. Keeps the locked brand (calm-over-loud, cool-dominant water
imagery with a single warm amber accent, `@theme` tokens, German copy/alt).

## Decisions (locked)

- **Article-page placement:** banner first — cover above the existing centered text header.
- **Index layout:** the existing calm border-divided list, plus a leading 16:9 thumbnail per row.
- **Frontmatter:** `cover` is **required** (build/parse fails if missing). `coverAlt` required too.
- **OG image:** no change — the branded generated per-article OG card stays.
- **Index banner:** unchanged (`/images/ratgeber-banner.webp`).

## Cover → article mapping

Source PNGs live in the gitignored `Images/` drop folder (1376×768, ~16:9). Convert the
three mapped variants to WebP (sharp, quality 80) into `public/images/`.

| Article slug | Source PNG | WebP target | Motif |
|---|---|---|---|
| `terminbestaetigungen-automatisieren` | `Images/Ratgeber_article_1.png` | `public/images/ratgeber-termine.webp` | Concentric ripple rings spreading quietly outward |
| `taeglich-stunden-zurueckgewinnen` | `Images/Ratgeber_article_3.png` | `public/images/ratgeber-zeit.webp` | Soft repeating light glints on a dark surface |
| `flickenteppich-oder-saubere-quelle` | `Images/Ratgeber_article_2.png` | `public/images/ratgeber-system.webp` | Churning, snagging water with a warm break-through |

`Images/Ratgeber_article_.png` (calm twilight, one distant light) and
`Images/Ratgeber_Index_Header.png` remain spare for the next article / future use.

### German alt text (draft-to-verify by founder)

- **termine:** „Konzentrische Wellenringe breiten sich ruhig über dunkles Wasser aus, ausgehend von einem warmen Lichtpunkt.“
- **zeit:** „Sanfte Wellen auf dunklem Wasser, auf denen sich warmes Abendlicht in kleinen Reflexen wiederholt.“
- **system:** „Bewegtes, schäumendes Wasser, durch das ein warmer Lichtschein bricht.“

## Architecture

### Data model — `src/lib/ratgeber.ts`

Extend `Article`:

```ts
export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  cover: string;     // public path, e.g. "/images/ratgeber-termine.webp"
  coverAlt: string;  // German alt text
  body: string;
};
```

`parseArticle` reads `data.cover` / `data.coverAlt`, trims them, and **throws** a clear
error (`Ratgeber article "<slug>" is missing required frontmatter: cover`) when either is
empty/absent. This is the enforcement mechanism for "required" — `getAllArticles` therefore
throws if any real article lacks a cover, failing the build.

### Article page — `src/app/ratgeber/[slug]/page.tsx`

Decision A (banner first). Inside the existing top `Section tone="paper"`, before
`ArticleHeader`:

```tsx
<div className="mx-auto mb-10 max-w-4xl">
  <PageImage src={article.cover} alt={article.coverAlt} ratio="aspect-[16/9]" />
</div>
<ArticleHeader article={article} />
```

`ArticleHeader` is unchanged. Prose (`MDXRemote`) stays below at `max-w-2xl`.

### Index card — `src/components/ratgeber/ArticleCard.tsx`

Decision A (list + thumbnail). The row becomes a responsive flex layout: thumbnail stacks
on top on mobile, sits left at `~160px` from `sm:` up. Meta/title/description unchanged in
content. Keeps `border-t border-faden py-8 first:border-t-0`.

```tsx
<article className="flex flex-col gap-4 border-t border-faden py-8 first:border-t-0 sm:flex-row sm:gap-6">
  <Link href={`/ratgeber/${article.slug}`} className="sm:w-40 sm:flex-none">
    <PageImage src={article.cover} alt={article.coverAlt} ratio="aspect-[16/9]"
      sizes="(min-width: 640px) 160px, 100vw" className="rounded-xl" />
  </Link>
  <div className="min-w-0">
    {/* existing meta / title / description */}
  </div>
</article>
```

`RatgeberIndex` and the `max-w-3xl` container are unchanged.

### PageImage — `src/components/PageImage.tsx`

Add an optional `sizes` prop, defaulting to the current value, so the thumbnail loads an
appropriately small candidate instead of the 1104px banner asset:

```ts
sizes = "(min-width: 1152px) 1104px, 100vw"
```

Everything else (rounded panel, `shadow-deepwater`, `ring`, `fill`, `object-cover`) stays.
A `className` override already exists for per-use tweaks (e.g. `rounded-xl` on thumbnails).

## Error handling

- Missing/empty `cover` or `coverAlt` → `parseArticle` throws with the offending slug. This
  surfaces at build time (static generation) rather than rendering a broken page.
- Covers are static committed WebP under `public/images/`; `next/image` handles loading.
  Reduced-motion / lazy-load behavior is `next/image` default (no custom motion added).

## Testing

- **`src/lib/ratgeber.test.ts`:** `parseArticle` returns `cover`/`coverAlt`; throws when
  `cover` missing, throws when `coverAlt` missing. Update existing fixtures to include both
  required fields.
- **`src/lib/ratgeber.io.test.ts`:** (already reads the real content dir) continues to pass
  once seeds have covers — implicitly guards that every shipped article parses.
- **New content-integrity test** (`src/lib/ratgeber.covers.test.ts`): for every article from
  `getAllArticles({ includeDrafts: true })`, assert `cover` starts with `/images/` and the
  corresponding file exists in `public/`.
- **`src/components/ratgeber/ArticleCard.test.tsx`:** assert an `img` renders with the cover
  (alt text present); existing title/link assertions stay.
- **`src/components/ratgeber/ArticleHeader.test.tsx`:** unchanged (cover lives outside it).

## Out of scope

- OG image changes (branded card stays).
- Index banner swap (current banner stays; `Ratgeber_Index_Header` kept spare).
- The Ratgeber authoring skill (separate todo — will emit `cover`/`coverAlt` once this lands).
- Cover for a 4th/future article (spare assets are ready).

## Verification

`npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`; then `npm start` and
browser-verify `/ratgeber` and one article at 1440 + 390 (covers render, list aligns,
title readable, no CLS).
