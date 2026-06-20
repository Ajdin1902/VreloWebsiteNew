# Ratgeber editorial design pass — spec

**Date:** 2026-06-20
**Surfaces:** the article reading page (`/ratgeber/[slug]`) and the Ratgeber index (`/ratgeber`).
**Goal:** lift the Ratgeber from functional to high-end/editorial while preserving brand voice, the `lesepapier` reading surface, and all functionality. Layout + typographic craft only — **no article copy is rewritten**.

## Problem

The current article page stacks a full-width `max-w-4xl` **16:9 cover** above a *centered*, `max-w-2xl` header. The width-jump plus the tall cover pushes the actual article text well below the fold — the reader scrolls past a big image before reaching any information. The index is a list of small-thumbnail horizontal rows that reads thin. Markdown blockquotes render as a 2px amber left-border stripe (a generic pattern).

## Decisions locked (via visual-companion mockups)

- **Register:** Editorial (calm magazine), not a bold full-bleed magazine treatment. „Ruhe vor Hype“ holds.
- **Article header:** title + meta + standfirst lede come **first**; the cover follows as a **slim 21:9 banner** in the reading column. Header is **left-aligned** (was centered).
- **Index:** **typographic list, no thumbnails** — meta · serif title · lede, divided by thin rules. Imagery lives on the article pages.

## 1. Article page

Files: `src/app/ratgeber/[slug]/page.tsx`, `src/components/ratgeber/ArticleHeader.tsx`.

New top-down order, everything on one `max-w-2xl` reading column inside `Section tone="reading"`:

1. **Meta row** — amber drop motif (existing teardrop shape) + a single line „{date} · {readingMinutes} Min Lesezeit · {tags}“ in uppercase-tracked `stumm`. Tags fold into this line; the separate `border-stein` pill row is removed. `Entwurf` (draft) marker stays, before the meta.
2. **H1** — serif, **left-aligned**, `text-3xl md:text-4xl`, `tiefes-wasser`.
3. **Standfirst lede** — the article's existing `description` field, rendered larger in Fraunces **roman** (not italic — italic is reserved for the pull-quote), `ember`, ~`text-xl`. No new content; a new role for a field we already have.
4. **Thin rule** — `border-faden`, full reading-column width.
5. **Cover** — kept, as a **21:9** banner (`PageImage`, `ratio="aspect-[21/9]"`) on the `max-w-2xl` column (not the wider `max-w-4xl`).
6. **Body** — `MDXRemote` with `proseComponents`, unchanged measure (~18px), with a **drop-cap** on the first paragraph (see §4).
7. **Foot** — a quiet „← Zurück zum Ratgeber“ link (to `/ratgeber`), then the existing `ClosingCta` (unchanged).

`ArticleHeader` owns steps 1–4 (left-aligned now); the page owns the cover (step 5) moving *below* the header, the body, the back-link, and the existing JSON-LD.

## 2. Pull-quotes

File: `src/components/Prose.tsx`.

Replace the `border-l-2 border-amber pl-4` left-stripe `blockquote` with a **centered pull-quote**:
- a small amber drop mark centered above the quote,
- Fraunces italic ~`text-2xl`, `tiefes-wasser`, centered, `leading` relaxed,
- generous vertical margin, no border.

Same markdown input (`>`), editorial output. All other `proseComponents` (h2/h3/p/ul/ol/li/a) keep their current styles; only the blockquote changes.

## 3. Index page

Files: `src/app/ratgeber/page.tsx`, `src/components/ratgeber/RatgeberIndex.tsx`, `src/components/ratgeber/ArticleCard.tsx` (rewritten as a typographic row).

- **Intro:** keep the `PageIntro` title + lead; **drop the 16:9 banner image** (`image` prop removed) so the listing doesn't reopen the "tall image first" problem. Title + lead only.
- **List entries:** each article renders as meta row (amber drop + „{date} · {readingMinutes} Min · {firstTag}“) · serif **H2 title** (a `Link` to the article) · `description` lede, separated by thin `border-t border-faden` rules (`first:border-t-0`). No `PageImage` thumbnail.
- Empty state (`articles.length === 0`) unchanged („Hier entsteht der Ratgeber.“).

## 4. Mechanics

- **Drop-cap:** a scoped CSS utility (e.g. `.article-body > p:first-of-type::first-letter`) in `globals.css`, applied to the MDX body wrapper — Fraunces, `petrol`, floated, ~3 lines tall. Pure CSS, no JS; degrades to a normal capital if Fraunces fails.
- **Reading surface:** `Section tone="reading"` (`lesepapier #ece3d2`) unchanged.
- **Contrast (all on `lesepapier`, AA verified):** lede `ember` 5.13:1, meta/back-link `stumm` 4.67:1, drop-cap & body links `petrol`, body `tinte/90`. No regressions.

## Out of scope (YAGNI)

Reading-progress bar, related/next-article block, author avatar/byline, new callout/aside/key-takeaway components, index filtering/tags-as-facets. Revisit later if content needs them.

## Testing & verification

- Update `ArticleHeader.test.tsx` (left-aligned, lede present, meta line, no pill row) and `RatgeberIndex.test.tsx` / `ArticleCard.test.tsx` (typographic row, no thumbnail). Keep `ratgeber.covers.test.ts` green (covers still required for article pages).
- Full gate: `npx tsc --noEmit` · `npm run lint` · `npm test` · `npm run build`.
- Browser-verify at 1440 and 390 (`npm start`): article — headline+lede above the fold, slim cover, drop-cap, pull-quote; index — typographic rows; AA spot-check on `lesepapier`.
- German typography byte-check on any touched copy („…“ U+201E/U+201C, spaced en-dash U+2013).

## Build order (for the plan)

1. Prose pull-quote (isolated, low-risk).
2. Drop-cap CSS utility.
3. `ArticleHeader` → left-aligned editorial header with lede + meta line.
4. Article page → reorder cover below header (21:9), body wrapper for drop-cap, back-link.
5. Index → typographic list + drop intro banner.
6. Tests + full gate + browser verify.
