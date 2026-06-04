# Ideas.md — Vrelo enhancement backlog

Unscheduled ideas to consider for a future polish/design phase (likely after the core pages exist). Not committed to any phase yet. Each item notes the relevant files, brand tokens, and things to watch so a future session can pick it up without re-deriving context. See [Brand.md](Brand.md) for the rules every idea must respect (70/20/10 palette, `<BrandWord>` italics, outcome-over-mechanism voice).

---

## 1. Add the logo throughout the site

Put the brand mark in the **header**, **footer**, and anywhere else it earns its place (favicon, OG image, loading states).

- **Assets exist:** `public/logo/` has 7 SVG variants — pick by background:
  - On **dark/cool** surfaces (Hero, Footer if cool): `vrelo-symbol-paper-amber.svg` or `vrelo-symbol-navy-amber.svg`.
  - On **Papier** surfaces (Header): `vrelo-symbol-petrol-amber.svg` or a mono `vrelo-symbol-mono-navy.svg` / `vrelo-symbol-mono-ink.svg`.
  - `merak-submark-amber.svg` — **only** for emotional/Merak contexts, never as a replacement for the full Vrelo logo.
- **Files to touch:** `src/components/Header.tsx`, `src/components/Footer.tsx`.
- **Brand rules (Brand.md §logo):** drop **always points up** — never rotate/distort/shadow/hollow it; clear space ≥ drop height, min 80px height; the wordmark „Vrelo“ is **live Fraunces Italic text** (use `<BrandWord>`), not part of the outlined SVG. So: logo symbol = SVG, wordmark beside it = `<BrandWord>Vrelo</BrandWord>`.
- **Consider:** also wire `app/icon` (favicon) + an OG image once we're here.

## 2. Stronger amber drop + ripple effect on the Hero

The Hero already has a glowing amber drop (`src/components/Hero.tsx`, the `motion-safe:animate-drop-glow` element). Idea: make it more present and add a **ripple** emanating from where the drop "lands" — literalizing „Vrelo errichtet die Quelle“.

- **Files:** `src/components/Hero.tsx`; keyframes live in `src/app/globals.css` (alongside `drop-glow`).
- **Approach options:** CSS-only expanding ring(s) (`@keyframes` scaling + fading concentric circles) gated behind `motion-safe:`; or a small SVG/canvas ripple. Prefer CSS-only first (cheap, no JS, no LCP risk).
- **Watch:** Hero is the **LCP** surface — keep it GPU-cheap (transform/opacity only), honor `prefers-reduced-motion` (no ripple when reduced), and don't add a second competing focal point (Brand.md: one drop, one focal point).
- **Amber token:** `--color-amber #d4a24c` (the drop colour). Glow already uses it.

## 3. Use the term „KI“ (Künstliche Intelligenz) — carefully

Introduce „KI“ / „Künstliche Intelligenz“ where it aids clarity or SEO.

- **Tension to resolve first:** Brand.md positions the audience as *intimidated by „Tech“/„KI“* and the voice is **outcome over mechanism**. So „KI“ should appear sparingly and reassuringly (e.g. „KI-gestützte Automatisierung, die du nicht verstehen musst“) — never as hype. Likely homes: a Leistungen sub-line, an FAQ entry („Brauche ich KI-Kenntnisse?“ → no), and SEO metadata/keywords.
- **Files:** `src/lib/{leistungen,faq}.ts`, page `metadata`, future Ratgeber copy.
- **Decide with the founder** whether „KI“ is on-brand front-and-center or stays a quiet supporting term.

## 4. Bring more of the darker brand colours onto the landing page

The homepage is mostly Papier after the Hero. Idea: reintroduce the **deep/cool** end of the palette below the fold for depth and rhythm — without breaking the „calm Papier“ spine.

- **Dark/cool tokens:** `--color-tiefes-wasser #0a2538`, `--color-vrelo-petrol #1b5063` (utilities `bg-tiefes-wasser`, `text-gletscher`, `bg-vrelo-petrol`). `Section tone="cool"` already renders deep water.
- **Where:** e.g. a single cool `Section` (Proof/Vertrauen or Steps) as a tonal anchor, or a cool Footer. Keep **70/20/10** — Petrol leads cool moments, Amber only accents; don't let dark dominate the page or fight the Hero's role.
- **Files:** `src/app/page.tsx`, the `home/` sections, `src/components/Section.tsx` (`tone` prop already supports `cool`).
- **Watch:** contrast/a11y on dark sections; keep the Hero as the dominant deep-water moment so a mid-page cool band doesn't upstage it.

## 5. Flowing accents along the side of the page

Subtle „Fluss“ motif — flowing lines/gradients down the page margins to reinforce the water metaphor as the eye scrolls (Quelle → Fluss → Merak).

- **Approach:** a fixed/absolute decorative SVG or gradient hairline in the gutter, `aria-hidden`, `pointer-events-none`, very low contrast (use `--color-faden`/`--color-stein` or a faint petrol). Could subtly shift on scroll (motion-safe only).
- **Watch:** Brand.md — *water metaphor at most ONE per piece*; this is a strong one, so it may **replace** rather than add to other water cues. Must not hurt readability, mobile layout, or performance. Reduced-motion: static or hidden.
- **Files:** likely a new `src/components/FlowAccent.tsx` mounted in `layout.tsx` or per-page.

---

### Cross-cutting notes
- All of these are **design polish** — schedule after Phase 2c (and probably after the conversion/legal phases), as a dedicated „design pass“ so they're considered together (they interact: darker colours + flow accents + ripple all compete for attention).
- Respect existing enforcement: `<BrandWord>` for „Vrelo“/„Merak“, brand `@theme` tokens only (no hand-rolled hex except where already established), `prefers-reduced-motion` for every animation.
- German typographic quotes „…“ = U+201E/U+201C in any client-facing copy these ideas produce.
