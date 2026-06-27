# Voice & Structure (Ratgeber)

The operational subset of the Vrelo voice for blog articles. Source of depth: `Brand.md` (voice section) and the `## Gotchas` in `CLAUDE.md`.

## Voice contract (enforce all)
- **Calm over loud.** Personal brand, first-person „Ich“. Partner framing („gemeinsam“, „ich schaue mir das an“), never hype, never hard sell, never false urgency.
- **Generic masculine.** Kunden, Inhaber, Kollegen, Selbstständige — never `:innen` or feminine plurals (Inhaberinnen ✗).
- **German typography.**
  - En-dash with spaces „ – “ (U+2013) for the Gedankenstrich. Never the em-dash „—“ (U+2014). Never `--`.
  - German quotes „…“ — U+201E open, U+201C close. Never ASCII `"`.
- **Water metaphor: at most ONE** per article (Quelle / Fluss / Wasser…). The Ratgeber lives in a water-themed brand; one evocative touch, not a flood.
- ***Merak* is a feeling**, always warm, always paired with the Vrelo idea (Quelle → Effekt). Never a product or package name. Land it near the end as the emotional payoff.
- **Specificity sells.** A concrete number, a named example (a Fotograf, a Montagmorgen), a real before/after beats an abstraction. (Ogilvy.)
- **No AI tells.** Avoid the „Das ist kein X. Das ist Y.“ short-rebuttal cadence more than once; avoid buzzwords (skalieren, disrupten, KI-Magie, Game-Changer, Synergien, revolutionär).
- **BrandWord:** write „Vrelo“ and „Merak“ as plain words — the `remark-brandword` remark plugin wraps them in Fraunces italic automatically. Don't hand-italicize.

## Article shape
1. **Hook (1–3 short paragraphs)** — open on the reader's lived moment or a quiet observation, not a definition. Earn the read.
2. **2–4 `##` sections** — each advances one idea: name the problem → why it happens → what a calm solution looks like → (optionally) where Vrelo fits. Use a `-` bullet list once where it genuinely helps scanning.
3. **Exactly one `>` blockquote** — a single distilled line (the article's thesis in one breath). Renders as the ember pull-quote.
4. **Short thematic close** — land the article's point, ideally on the *Merak* feeling. Hand off to the page's CTA band; do NOT write a „melde dich unverbindlich, kein Druck…“ pitch in the body (that duplicates the band).

Length: short ≈ 600–750 words (~4 min), standard ≈ 900–1100 words (~6 min). `readingMinutes` is computed from the body. **Default to short** unless the topic genuinely needs more — a lean article that says each thing once respects the reader's time and reads more like the founder. Length is a ceiling, never a target: stop when the point is made.

## Markdown the renderer supports (`src/components/Prose.tsx`)
`##` / `###` headings · `-`/`1.` lists · `>` blockquote · `[label](url)` links · `**bold**` · `*italic*`. Body renders at 18px on the deeper article reading surface. No raw HTML, no images inside the body (the cover is the only image).

## Cover
Pick the motif from `image_prompt.md` §9 that matches the article's theme (e.g. „getting started“ → a single clean ripple; „saubere Quelle / clean foundation“ → a deep clear pool revealing pebbles). Fill the base prompt, keep it dark/low-contrast/cool with one warm accent. `coverAlt` is a plain German description of that image.

## Self-check (the gate before writing the file)
Run every line; fix before writing.
- [ ] No em-dash „—“ anywhere — only „ – “ (U+2013). (`grep -c "—"` on the draft = 0.)
- [ ] German quotes balanced — count of „ equals count of “ (U+201C). No ASCII `"` in prose.
- [ ] ≤ 1 water metaphor in the whole body.
- [ ] Generic masculine only — no `…innen` / feminine plurals.
- [ ] *Merak* appears and lands as a warm feeling near the end.
- [ ] First-person „Ich“; calm, specific, no buzzwords; cadence varied.
- [ ] Frontmatter complete: `title, description (≤~155), date, tags, cover, coverAlt, draft: true`.
- [ ] `slug` == filename stem == `<slug>` in the `cover` path; slug doesn't already exist in `content/ratgeber/`.
- [ ] Body closes on the article's point, not a CTA.
- [ ] Lean and non-repetitive — each point made once, no padding, no section restating an earlier one. Ran the `copy-editing` skill and tightened every line that could be sharper.
- [ ] Cover image exists at `public/images/ratgeber-<slug>.webp` **before committing** — the covers test (`ratgeber.covers.test.ts`) checks the file exists for every article, so `npm test` fails without it. (The `.mdx` can be written first; just don't commit until the WebP is there.)
