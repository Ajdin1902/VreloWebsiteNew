---
name: ratgeber-article
description: Use when writing, drafting, or scaffolding a new German Ratgeber (blog) article for the Vrelo marketing site — a new MDX post under content/ratgeber/, a "Ratgeber-Artikel", or a new Vrelo blog post.
---

# Ratgeber Article

## Overview
Scaffolds one German Vrelo Ratgeber MDX article end to end: a short interactive intake, a full first draft in the brand voice, valid frontmatter (including the **required** `cover` + `coverAlt`), and the matching cover-image prompt with a generation checklist. The founder refines the draft. Nothing publishes automatically — articles are written `draft: true`.

Client copy is German; code/comments are English. The article must read like the founder wrote it: calm, first-person „Ich“, specific, never hype.

## Read first (ground yourself)
- **Exemplar:** one existing article — `content/ratgeber/terminbestaetigungen-automatisieren.mdx` (or any in `content/ratgeber/`). Match its shape and register.
- **Schema + slug/draft rules:** `src/lib/ratgeber.ts` (`parseArticle` throws if `cover`/`coverAlt` are missing).
- **Cover prompts:** `image_prompt.md` §9 „Ratgeber article headers“ — base prompt + theme→motif table + variation knobs. The single source of truth for covers; do not invent a new style.
- **Voice + article shape + the self-check:** `references/voice-and-structure.md` in this skill.

## Process

1. **Intake — ask in ONE message** (use the AskUserQuestion tool or a short numbered list), then wait:
   - Working title / angle (what's the article about?)
   - The reader's pain — who is this for and what problem do they feel?
   - One concrete point, example, or anecdote to ground it (specificity sells)
   - Optional: SEO keyword to target · tags (1–2, reuse existing where possible) · length (short ≈ 4 min / standard ≈ 6 min)

2. **Draft the body** in the brand voice (see `references/voice-and-structure.md`). Shape: hook → 2–4 `##` sections → exactly one `>` pull-quote → a short thematic close (the article-page CTA band makes the actual ask — do NOT end on a sales pitch). Write „Vrelo“/„Merak“ plainly; the `remark-brandword` plugin italicizes them.

3. **Compose frontmatter** (see table below). `draft: true` always. Derive the slug from the title (slug rule below); check `content/ratgeber/` for a collision first.

4. **Choose the cover** — match the article's theme to a motif in `image_prompt.md` §9, fill the base prompt, and write `coverAlt` (German) to describe that motif. Keep dark + low-contrast so the headline reads over it.

5. **Run the self-check** (`references/voice-and-structure.md` → „Self-check“). This is the gate. Optionally run `copy-editing` + `stop-slop` for a polish pass.

6. **Show the draft, then write** `content/ratgeber/<slug>.mdx`.

7. **Emit the cover-image checklist** (below) so the founder can produce the asset.

## Frontmatter spec

```yaml
---
title: "…"            # the headline; German quotes inside use „…“, not ASCII
description: "…"       # SEO meta, ≤ ~155 chars, one sentence, no hype
date: "YYYY-MM-DD"     # today, ISO
tags: ["…"]            # 1–2; reuse existing tags where they fit
cover: "/images/ratgeber-<slug>.webp"
coverAlt: "…"          # German; describes the chosen water motif
draft: true            # ALWAYS true here — publishing is a separate human step
---
```

## Slug rule
Kebab-case the title, fold umlauts: `ä→ae · ö→oe · ü→ue · ß→ss`, drop other punctuation. Match the existing style (`taeglich-stunden-zurueckgewinnen`, `durcheinander-oder-saubere-quelle`). The slug must equal the filename stem **and** the `<slug>` inside the `cover` path.

## Cover-image checklist (emit verbatim to the founder)
1. Generate from the filled prompt (Nano Banana / image tool). Keep it dark, low-contrast, cool-dominant, one small warm accent, lots of negative space.
2. Optimize to **WebP, quality 80** (the repo converts via `sharp`).
3. Save as **`public/images/ratgeber-<slug>.webp`** (must match the `cover` path).
4. The article stays `draft: true` until the image exists and the copy is reviewed. Flip to `draft: false` to publish (no code change).

> **The cover file is required to pass tests.** `src/lib/ratgeber.covers.test.ts` checks that the `cover` file **actually exists** in `public/images/` for *every* article, drafts included. So `npm test` (and CI / any commit hook) **fails until the WebP is in place** — that failing test is the signal that generating + dropping in the cover image is the one remaining step. Don't commit the `.mdx` without its cover.

## Common mistakes
- **Em-dash in body copy.** German uses the en-dash with spaces „ – “ (U+2013), never „—“.
- **ASCII quotes.** German quotes are „…“ (U+201E open, U+201C close). The Write/Edit tools silently downgrade the closing one — after writing, verify the open/close counts match (or write via a small `fs` script).
- **Gendered forms.** Generic masculine only (Kunden, Inhaber, Kollegen) — never `:innen`/feminine plurals.
- **Water-metaphor flooding.** At most ONE water metaphor (Quelle/Fluss) per article.
- **Ending on a CTA.** The CTA band already asks; the body should close on the article's point, not „melde dich unverbindlich…“.
- **Missing cover frontmatter.** `cover` + `coverAlt` are required — `parseArticle` throws without them.
- **Committing before the cover image exists.** The covers test requires the real WebP file, not just the frontmatter — `npm test` fails until `public/images/ratgeber-<slug>.webp` is present. Generate the cover before committing the article.
- **Publishing on creation.** Never set `draft: false`; that's a deliberate later step.
