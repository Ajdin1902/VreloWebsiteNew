---
name: ratgeber-article
description: Use when writing, drafting, or scaffolding a new German Ratgeber (blog) article for the Vrelo marketing site — a new MDX post under content/ratgeber/, a "Ratgeber-Artikel", or a new Vrelo blog post.
---

# Ratgeber Article

## Overview
Scaffolds one German Vrelo Ratgeber MDX article end to end: a short interactive intake, a full first draft in the brand voice, valid frontmatter (including the **required** `cover` + `coverAlt`), and the matching cover-image prompt with a generation checklist. The founder refines the draft. Nothing publishes automatically — articles are written `draft: true`.

Client copy is German; code/comments are English. The article must read like the founder wrote it: calm, first-person „Ich“, specific, dry self-aware humour, never hype.

## Read first (ground yourself)
- **Voice model (read in full):** `content/ratgeber/wieso-ist-ki-jetzt-revolutionaer.mdx`. Every future article follows its language, humour, comparisons and arc (Ajdin, 2026-10-20). The moves are spelled out in `references/voice-and-structure.md` → „The moves“. For a how-to guide, also skim a Praxis article (e.g. `terminbestaetigungen-automatisieren.mdx`) for how much substance a guide carries, **for depth only, not voice**: the older articles predate the voice model (repeated „Das ist kein X. Das ist Y.“, summary pull-quotes, Merak closes).
- **Schema + slug/draft rules:** `src/lib/ratgeber.ts` (`parseArticle` throws if `cover`/`coverAlt` are missing).
- **Cover prompts:** `image_prompt.md` §9 „Ratgeber article headers“ — base prompt + theme→motif table + variation knobs. The single source of truth for covers; do not invent a new style.
- **Voice + article shape + the self-check:** `references/voice-and-structure.md` in this skill.

## Process

1. **Intake — ask in ONE message** (use the AskUserQuestion tool or a short numbered list), then wait:
   - Working title / angle (what's the article about?)
   - The reader's pain — who is this for and what problem do they feel?
   - One concrete point, example, or anecdote from his own use, plus one honest admission (what didn't work, where he was wrong)
   - Kategorie: Grundlagen / Praxis / Kosten / Meinung
   - Optional: SEO keyword to target · tags (1–2, reuse existing where possible) · length (short ≈ 4 min / standard ≈ 6 min)

2. **Draft the body** in the voice model's language (see `references/voice-and-structure.md`). Arc: hook on my own use with a Klammer-Pointe → 2–3 `##` sections with plain headings, a running image set up early → the turn as the one `>` pull-quote, late → 1–2 serious paragraphs → last line calls back the running image (the article-page CTA band makes the actual ask; do NOT end on a sales pitch). Write „Vrelo“/„Merak“ plainly; the `remark-brandword` plugin italicizes them.

3. **Compose frontmatter** (see table below). `draft: true` always. Derive the slug from the title (slug rule below); check `content/ratgeber/` for a collision first. **Also check for topic overlap** (`grep -ril "<key term>" content/ratgeber/`): if a live article already tells the same story, go deeper than it and link to it instead of retelling it.

4. **Choose the cover** — match the article's theme to a motif in `image_prompt.md` §9, fill the base prompt, and write `coverAlt` (German) to describe that motif. Keep dark + low-contrast so the headline reads over it.

5. **Run the self-check** (`references/voice-and-structure.md` → „Self-check“). This is the gate. Then **always run the `copy-editing` skill** over the draft — go line by line and tighten anything that can be said better, cut repetition and filler. **Keep it lean:** prefer the shorter length, never pad to hit a word count, and never make the same point twice in different words. (Optionally `stop-slop` too.)

6. **Show the draft, then write** `content/ratgeber/<slug>.mdx`.

7. **Emit the cover-image checklist** (below) so the founder can produce the asset.

## Frontmatter spec

```yaml
---
title: "…"            # the headline, a question works well; German quotes inside use „…“, not ASCII
description: "…"       # ≤ ~155 chars, no hype. Meinung: a teaser naming 2–3 of the article's hooks (voice model). Guides: one plain sentence.
date: "YYYY-MM-DD"     # today, ISO
tags: ["…"]            # 1–2; reuse existing tags where they fit
kategorie: "…"         # Grundlagen | Praxis | Kosten | Meinung (parseArticle throws on anything else)
leistung: "…"          # optional: the /leistungen/<slug> subpage this article explains
cover: "/images/ratgeber-<slug>.webp"
coverAlt: "…"          # German; describes the chosen motif
draft: true            # ALWAYS true here — publishing is a separate human step
---
```

## Slug rule
Kebab-case the title's key words (shorten a long title to 2 to 5 words, like `terminbestaetigungen-automatisieren`), fold umlauts: `ä→ae · ö→oe · ü→ue · ß→ss`, drop other punctuation. Match the existing style (`taeglich-stunden-zurueckgewinnen`, `durcheinander-oder-saubere-quelle`). The slug must equal the filename stem **and** the `<slug>` inside the `cover` path.

## Cover-image checklist (emit verbatim to the founder)
1. Generate from the filled prompt (Nano Banana / image tool). Keep it dark, low-contrast, cool-dominant, one small warm accent, lots of negative space.
2. Optimize to **WebP, quality 80** (the repo converts via `sharp`).
3. Save as **`public/images/ratgeber-<slug>.webp`** (must match the `cover` path).
4. The article stays `draft: true` until the image exists and the copy is reviewed. Flip to `draft: false` to publish (no code change).

> **The cover file is required to pass tests.** `src/lib/ratgeber.covers.test.ts` checks that the `cover` file **actually exists** in `public/images/` for *every* article, drafts included. So `npm test` (and CI / any commit hook) **fails until the WebP is in place** — that failing test is the signal that generating + dropping in the cover image is the one remaining step. Don't commit the `.mdx` without its cover.

## Common mistakes
- **Gedankenstrich in body copy.** Neither the en-dash (U+2013) nor the em-dash (U+2014): founder decision 2026-08-16, the copy guard fails on both. Join clauses with comma, period or colon; ranges with „bis“.
- **ASCII quotes.** German quotes are „…“ (U+201E open, U+201C close). The Write/Edit tools silently downgrade the closing one — after writing, verify the open/close counts match (or write via a small `fs` script).
- **Gendered forms.** Generic masculine only (Kunden, Inhaber, Kollegen) — never `:innen`/feminine plurals.
- **Water-metaphor flooding.** At most ONE water metaphor (Quelle/Fluss) per article.
- **Too long / repetitive.** Default to the shorter length; say each point once. If a section restates an earlier one or pads to fill space, cut it. A tight 600-word article beats a padded 1100-word one.
- **Ending on a CTA.** The CTA band already asks; the body should close on the callback or the article's point, not „melde dich unverbindlich…“.
- **Copying the voice model instead of its moves.** Terminator, the Betriebsrat, „Ich persönlich nutze Claude…“ belong to that one article. A second article opening the same way turns the voice into a template (the 2026-08 batch already had 7 of 12 closes on one sentence stem). Each article finds its own running image and its own first line.
- **Forced jokes.** One sharp Klammer-Pointe beats four weak ones. If a gag needs explaining, cut it. A guide needs fewer moves than a Meinung piece.
- **Jokes at the reader's expense.** Humour hits hype, the market, the AI or the founder himself, never the Inhaber or his staff.
- **Missing cover frontmatter.** `cover` + `coverAlt` are required — `parseArticle` throws without them.
- **Committing before the cover image exists.** The covers test requires the real WebP file, not just the frontmatter — `npm test` fails until `public/images/ratgeber-<slug>.webp` is present. Generate the cover before committing the article.
- **Publishing on creation.** Never set `draft: false`; that's a deliberate later step.
