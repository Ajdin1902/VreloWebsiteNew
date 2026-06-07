# Vrelo Subpage Design Polish — Design Spec

**Date:** 2026-06-07
**Branch:** `feat/subpage-design-polish`
**Status:** Approved (design + per-page sequencing)

## Goal

Apply the same design-skill pass the homepage received (design-taste → high-end-visual-design → impeccable) to the three content subpages — **Leistungen, Über mich, FAQ** — so they share the homepage's visual "hand". Redesign-preserve: the locked brand stays (Fraunces + Plus Jakarta Sans, papier/petrol/tiefes-wasser/amber water palette, `BrandWord`, calm-over-loud). This is a polish pass, not a redo.

## Scope

In scope:
- `src/app/leistungen/page.tsx` + `src/components/leistungen/{LeistungDetail,Referenzen}.tsx`
- `src/app/ueber-mich/page.tsx` + `src/components/ueber-mich/StoryBeat.tsx` + `src/lib/ueber-mich.ts` (only to drop per-beat `eyebrow` data if we remove the field)
- `src/app/faq/page.tsx` + `src/components/faq/{FaqAccordion,FaqItem}.tsx`
- Shared, used by these pages: `src/components/PageIntro.tsx`, `src/components/ClosingCta.tsx` (type discipline only)

Out of scope:
- The homepage (already polished) — do not regress it. It uses neither `PageIntro` nor `ClosingCta` (it has `Hero`/`MerakClose`), so shared-component edits carry no homepage risk; still verify.
- Ratgeber index/article, Kontakt, Newsletter, legal pages — a later pass.
- Copy rewrites (copy is already done + en-dash-swept). Typographic touch-ups only (`text-balance`/`text-pretty`, never content edits).
- New imagery / new image generation.

## The shared "one hand" (applied to all three pages)

The homepage defined this vocabulary; the subpages have not received it. Apply consistently:

1. **Depth** — `.card-depth` (deep-water shadow + inset top edge-light, defined in `globals.css`) on elevated content panels; `.shadow-deepwater` on imagery and `LazyVideo` (PageImage already has it; LazyVideo does not).
2. **Type discipline** — `tracking-tight` + `text-balance` on the sans headings (`h1`/`h2`/`h3`); `text-pretty` on body paragraphs. None of the subpage headings currently have this; every homepage heading does.
3. **Eyebrow restraint** — one kicker per page (the `PageIntro` eyebrow). Über-mich's **4 per-beat eyebrows are removed** (the beat headings already carry "Quelle/Wellen/Fluss/Merak"). FAQ's 3 theme labels stay (genuine group headers, not section eyebrows).
4. **Motion** — bring the homepage `Reveal` scroll-reveal primitive (`src/components/Reveal.tsx`) to the subpages (they have zero scroll motion today). Already reduced-motion-safe, CLS-safe, and no-JS-safe via the `.reveal-ready` gate set by the root layout script. Stagger via `delayMs` like the homepage; keep it calm (small offsets, not a uniform reflex on every element).
5. **AA contrast audit** — every new text-on-panel pairing checked against WCAG AA (4.5:1 body, 3:1 large), exactly like the homepage ember/gletscher fixes. Use existing tokens; if a pairing fails, prefer darkening toward the ink end over inventing a token.

## Per page

### Leistungen — Treatment A (refined stack)
Chosen via the visual companion over a flat-stack-current and an editorial-alternating alternative.
- `LeistungDetail`: wrap the service in a `.card-depth` panel. Serif italic number sits inline (baseline-aligned) with a `tracking-tight` title. Body gets `text-pretty`. Outcome pills refined and AA-checked against their `bg-gletscher/40` fill.
- Wrap each stacked `Section`/detail in `Reveal` (fade-up on scroll).
- `Referenzen`: keep the "Bald: Stimmen aus echten Betrieben." placeholder; apply the same heading type discipline; do not invent fake testimonials.
- Keep the `PageIntro` eyebrow ("Was ich baue").
- The alternating `tint` on stacked sections stays; verify the card panels read well on both the plain and tinted backgrounds.

### Über mich
- Remove the 4 per-beat eyebrows (eyebrow restraint). If `StoryBeat`/`ueber-mich.ts` keep the `eyebrow` field, stop rendering it; if cleaner, remove the field + its data + the test assertion that references it.
- `LazyVideo` panels: `shadow-deepwater` + consistent rounding (`rounded-2xl`, already present).
- `text-balance` on the beat headings, `text-pretty` on the paragraphs (`StoryBeat.renderBody`).
- `Reveal` per beat.
- Keep the `PageIntro` eyebrow ("Die Person hinter der Arbeit"); keep the full 4-clip video sequence (locked decision).

### FAQ
- `FaqItem`: smoother open/close affordance and hover state; the `+`→rotate-45 indicator already exists — keep it, verify focus-visible ring + AA on the `text-tiefes-wasser` summary and `text-tinte` answer. Add `text-pretty` to the answer.
- `FaqAccordion`: set each theme group on a cleaner surface (a subtle `.card-depth` panel or a refined divider rhythm — decide during the high-end pass, keep calm). Keep the 3 theme labels as group headers.
- `Reveal` per group.
- Trailing `PageImage` section + `ClosingCta` are already fine; apply shared type discipline only.

## Shared components (type discipline only)
- `PageIntro`: `text-balance` on the `h1`, `text-pretty` on the lead. (`tracking-tight` optional — match homepage h1, which is not tracking-tight; keep h1 as-is unless the high-end pass decides otherwise.)
- `ClosingCta`: `text-balance` on the heading, `text-pretty` on the lead. It already uses `CTAButton` (button-in-button, `cta-fx`) — verify primary variant renders the nested arrow.

## Execution sequencing (per-page)
One branch `feat/subpage-design-polish`. Run the full trio per page, in order, committing per page:
1. **Leistungen** (sets the `card-depth` panel pattern) → taste → high-end → impeccable → browser-verify (1440 + 390) + AA → commit.
2. **Über mich** → same trio → verify → commit.
3. **FAQ** → same trio → verify → commit.

Establishing the vocabulary on page 1 and reusing it keeps the three pages consistent (the reason per-page beat per-skill for a 3-page set).

## Constraints (locked)
- **German typography:** quotes „…“ = U+201E + U+201C, never ASCII `"`. Gedankenstrich = en-dash „ – “ (U+2013), never em-dash. Copy is already swept; do not reintroduce.
- **Tokens only** — no hand-rolled hex; `BrandWord` for „Vrelo“/„Merak“; ember token stays `#7e5527`.
- **Reduced motion** — every reveal/animation has a reduced-motion path (the `Reveal` primitive + `.cta-fx` already do).
- **No CLS** — motion is transform/opacity only; reveals never gate content visibility without the `.reveal-ready` no-JS fallback.
- **Manual checks** use `npm start` (production build), not `npm run dev`.
- Generic-masculine voice; calm-over-loud.

## Verification
- Per page: browser at 1440 + 390, screenshot before/after, AA contrast spot-check on every new pairing.
- Gate before merge: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` all green.
- Regression: load the homepage once after the shared-component edits to confirm no visual change there.

## Out-of-scope follow-ups (carry forward)
- Same pass on Ratgeber (index + article), Kontakt, Newsletter, legal pages.
- Real `Referenzen` testimonials when available.
