# Ratgeber Authoring Skill — Design

**Date:** 2026-06-08
**Goal:** A project-level skill that scaffolds a German Vrelo Ratgeber (blog) MDX article end-to-end — interactive intake → full first draft in brand voice → frontmatter (incl. required `cover`/`coverAlt`) → matching cover-image prompt + generation checklist.

## Decisions (locked)
- **Location:** project-level, `.claude/skills/ratgeber-article/` (checked into the repo; versioned with the code it references).
- **Output:** a full first draft the founder refines (not just an outline).
- **Flow:** interactive — the skill asks a short structured intake before drafting.
- **Cover:** emit the filled cover prompt **+ a generation/optimize checklist**; image generation itself stays out of the skill.

## Files
- `.claude/skills/ratgeber-article/SKILL.md` — YAML frontmatter (`name: ratgeber-article`, `description` with trigger cues: "write/draft/scaffold a Ratgeber article", "new blog post for Vrelo") + the process, the frontmatter spec, and the self-check.
- `.claude/skills/ratgeber-article/references/voice-and-structure.md` — condensed brand-voice contract + article shape, so `SKILL.md` stays lean.
- Cover motifs are **referenced from `image_prompt.md` §9** (single source of truth; not duplicated).

## Process (when the skill runs)
1. **Ground** — read one seed article (`content/ratgeber/*.mdx`) as a structural exemplar, `src/lib/ratgeber.ts` (schema), and `image_prompt.md` §9 (covers).
2. **Interactive intake** — one structured question set: working title/angle · reader's pain (who + problem) · one concrete point or anecdote · optional SEO keyword + tags · length (short ~4 min / standard ~6 min).
3. **Draft body** — hook → 2–4 `##` sections → one `>` pull-quote → short thematic close (the article-page CTA band makes the ask). Enforce: first-person „Ich“; generic masculine; en-dash „ – “ (never em-dash); German quotes „…“ (U+201E/U+201C); **≤1 water metaphor**; *Merak* payoff near the end; write „Vrelo“/„Merak“ plainly (the `remark-brandword` plugin italicizes them).
4. **Frontmatter** — `title`; `description` (≤~155 chars, SEO); `date` = today (ISO); `tags`; **`draft: true`** (safe default — dev-only until reviewed); `cover: /images/ratgeber-<slug>.webp`; `coverAlt` (German, matches the chosen motif). Slug = kebab-case title with umlaut-fold (ä→ae, ö→oe, ü→ue, ß→ss), matching existing slug style; check `content/ratgeber/` for a collision.
5. **Cover** — pick the motif from `image_prompt.md` §9 matching the article theme, fill the base prompt, emit it + a checklist: generate (Nano Banana) → optimize to WebP q80 → save as `public/images/ratgeber-<slug>.webp`. Keep `coverAlt` consistent with the motif.
6. **Self-check + optional polish** — verify: en-dashes (no em-dash), balanced German quotes, ≤1 water metaphor, generic masculine (no `:innen`/feminine forms), *Merak* present, all required frontmatter present, slug ↔ filename ↔ cover path agree. Optionally run `copy-editing` + `stop-slop`.
7. **Write** `content/ratgeber/<slug>.mdx` after showing the draft. Remind: the cover image must exist before flipping `draft: false`; `src/lib/ratgeber.covers.test.ts` guards the frontmatter.

## Voice contract (the operational rules the skill enforces)
- Calm over loud; personal brand, first-person „Ich“; partner framing, never hype.
- **Generic masculine** (Kunden, Inhaber, Kollegen) — never `:innen`/gendered forms.
- German typography: en-dash with spaces „ – “ (U+2013); German quotes „…“ (U+201E open, U+201C close), never ASCII `"`.
- Water metaphor at most **once** per article (Quelle/Fluss). *Merak* is a feeling, always warm, paired with Vrelo, never a product name.
- Source of depth: [Brand.md](../../../Brand.md) voice section; this skill encodes the operational subset.

## Verification
- Dry-run the skill on a sample topic; confirm the generated MDX:
  - parses (cover + coverAlt present → `parseArticle` doesn't throw),
  - passes `npm test` (the covers test) and `npm run build`,
  - clears the voice self-check.
- Leave the sample as `draft: true` or delete it after verifying.

## Out of scope
- In-skill image generation (covered by the checklist + `image_prompt.md`).
- Publishing (flipping `draft: false`) — a deliberate human step after the cover image exists and the copy is reviewed.
- Automating Resend Broadcasts / newsletter sends.
