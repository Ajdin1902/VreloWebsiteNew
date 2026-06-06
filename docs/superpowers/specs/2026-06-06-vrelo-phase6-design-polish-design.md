# Vrelo Phase 6 — End-stage Design Polish · Design Spec

> Date: 2026-06-06 · Status: approved (brainstorm) → ready for writing-plans
> Branch: `feat/design-polish`
> Source ideas: [Ideas.md](../../../Ideas.md) #1, #2, #4, #5, #6 · Rules: [Brand.md](../../../Brand.md)

## Goal

A single, cohesive end-stage frontend polish pass over the shipped site (Phases 1–5, all
live). Elevate craft and depth without rebuilding: add an interactive water Hero, bring the
brand mark onto every surface, restore tonal rhythm below the fold, weave in a quiet
long-term-partner feeling, and harden the design system — all in one coherent vision rather
than page-by-page drift.

**Ambition level:** *Refined polish* across all 9 routes. Keep existing structure and brand
language; raise spacing/type rhythm, motion, micro-interactions, a11y, and token discipline.

## Non-negotiables (hold across every task)

- Brand `@theme` tokens only — no hand-rolled hex except where already established; this pass
  should *reduce* inline hex, not add it.
- `<BrandWord>` for „Vrelo" / „Merak" everywhere they appear as words.
- `prefers-reduced-motion` honored on **every** animation (ripple, drop-seed, drawer, glow).
- German typographic quotes „…" = U+201E (open) + U+201C (close) in all client-facing copy.
  Verify bytes when inserting (the Edit tool can silently downgrade to ASCII).
- **Hero stays the LCP focal point** — the static water image is the LCP element; WebGL is
  deferred and must not regress LCP.
- Calm over loud (Brand.md §3); 70/20/10 palette weighting (Petrol leads cool, Amber accents).
- German client-facing copy; English code + comments.

---

## 1 · Hero — interactive water (centerpiece)

### Layout
The Hero keeps its deep-water radial-gradient background and becomes a two-column composition
at `md+`:
- **Left:** existing H1 (`<BrandWord>Vrelo</BrandWord> errichtet die Quelle. Du erlebst den
  <BrandWord>Merak</BrandWord>-Effekt.`), sub-paragraph, and `<CTAButton href="/kontakt" />`.
  Copy unchanged.
- **Right:** a **contained, rounded water panel** showing `public/video/ripples-poster.jpg`
  with the interactive ripple. Panel aspect ~`4/5` on desktop.
- Below `md`: single column — text first, then the water panel full-width with a shorter
  aspect (e.g. `16/10`). The panel never pushes the H1 below the fold.

### Ripple component (`RippleImage`)
A self-contained client component — a **native WebGL reimplementation** of the hover-ripple
(the referenced Framer `Ripple` module is WebGL; we do **not** vendor it — it depends on the
Framer runtime). One `<canvas>` over a static `<img>`.

Technique (validated in the brainstorm demo):
- Full-screen quad + fragment shader. The image is a texture, cover-fit by aspect.
- A ring buffer of up to ~24 recent ripple origins, each `(x, y, birth)` in UV space, passed
  as a `uniform vec3[]`. The shader sums per-ripple radial displacement: a sine wave localized
  to an expanding wavefront (`exp(-(dist - t*speed)^2 * k)`) with exponential time decay, and
  displaces the sampled UV along the radial direction. A small specular term from displacement
  magnitude adds a wet highlight.
- `pointermove` / `pointerdown` push new origins (throttled by distance/time). `touch` drag
  works via the same Pointer Events.
- **Tuned parameters (locked):** `strength = 0.010`, ring spread / frequency `= 22`,
  `decay = 2.0`, wave `speed ≈ 0.55`. Calm and clearly visible, never showy.

### Amber drop — "seeds the ripple"
- The existing glowing amber drop (`motion-safe:animate-drop-glow`) is positioned **above the
  top edge of the water panel**, horizontally near the panel's center-right.
- On a slow interval (e.g. ~every 4–6s), the drop **seeds a ripple** at its x-position on the
  panel surface — an occasional poetic "plink". Implemented by the component pushing a ripple
  origin on a timer; gated behind reduced-motion (no seeding when reduced).

### LCP & performance
- The static `<img>` (`ripples-poster.jpg`, `priority`) is the LCP element and renders
  immediately. The `<canvas>` + WebGL initialize **after hydration / on idle**
  (`requestIdleCallback` fallback to `setTimeout`) and draw on top once ready.
- GPU-cheap: transform/opacity-equivalent (UV displacement) only; `requestAnimationFrame`
  loop; `devicePixelRatio` capped at 2.
- The Hero background gradient and drop remain CSS — no WebGL on the gradient.

### Fallbacks
- `prefers-reduced-motion: reduce` **or** no WebGL context → render only the static image; no
  ripple, drop shows its static glow (no seeding, animation frozen).
- Component must not throw if the image or GL fails; it degrades to the `<img>`.

### Files
- Create: `src/components/RippleImage.tsx` (client), `src/components/RippleImage.test.tsx`
  (render + reduced-motion fallback; shader math not unit-tested — guard the public contract).
- Modify: `src/components/Hero.tsx` (two-column layout, mount `RippleImage`, reposition drop).
- Modify: `src/app/globals.css` (any new keyframes live here beside `drop-glow`).

---

## 2 · Logo everywhere

### Header (`src/components/Header.tsx`)
- Brand lockup = **inline SVG V-symbol** (`vrelo-symbol-navy-amber.svg`, rendered as a real
  `<img>` from `/logo/…` or inlined component) at **30px** height + live-text
  `<BrandWord>Vrelo</BrandWord>`. The wordmark is **bottom-aligned** with the symbol
  (`align-items: flex-end` on the lockup). Active route link in `text-vrelo-petrol`.
- Symbol is decorative (`alt=""` / `aria-hidden="true"`); the adjacent live „Vrelo" text is
  the accessible name. No double-announcement.
- Remove the stale Phase-2 TODO comment.

### Mobile navigation (new — real gap today)
- A burger button (`aria-label`, `aria-expanded`, `aria-controls`) visible below `md`.
- Opens **Drawer A — full-screen `tiefes-wasser` overlay**: `paper-amber` symbol + „Vrelo" at
  top with a close (✕) button, large nav tap targets (the `navLinks`), `<CTAButton>` at the
  bottom.
- A11y: focus trap while open, `Esc` closes, focus returns to the burger, body scroll locked,
  `aria-expanded` reflects state. Open/close transition is `motion-safe` gated.
- Client component (`MobileNav.tsx`); Header stays a Server Component that renders it.
- Footer nav remains the secondary fallback.

### Footer (`src/components/Footer.tsx`)
- Replace the bare text wordmark in the first column with the **lockup**: `paper-amber`
  symbol + `<BrandWord>Vrelo</BrandWord>`, same bottom-aligned treatment, on the existing
  `tiefes-wasser` background.

### Favicon + OG
- `src/app/icon.(svg|tsx)` → favicon derived from the V-symbol (drop + funnel), Papier or
  transparent ground. Replace the default Next icon.
- OG: confirm the branded OG image references the lockup; refresh if it currently omits the
  mark. (OG generation already exists from Phase 3 — reuse `src/app/_og/` infra; static font
  gotcha applies.)

### Files
- Create: `src/components/MobileNav.tsx` (+ test for open/close/Esc/aria), `src/app/icon.tsx`
  (or `icon.svg`).
- Modify: `Header.tsx`, `Footer.tsx`. Possibly a small `BrandLockup.tsx` shared by both
  (symbol + bottom-aligned BrandWord, `variant: "navy" | "paper"`) to keep it DRY.

---

## 3 · Darker palette rhythm (Option C)

Reintroduce cool depth below the fold so the page isn't flat Papier after the Hero.

- **„Was ich baue"** (`src/components/home/WasIchBaue.tsx`) → `Section tone="cool"` rendered in
  **Petrol** weighting.
- **„Wie ich arbeite"** (`src/components/home/Steps.tsx`) → also a **Petrol** cool band.
- Both use **petrol** (`#1b5063` / `bg-vrelo-petrol`), **not** full `tiefes-wasser` — that is
  reserved for the Hero and Footer so the Hero stays the dominant deep-water moment.
- Resulting flow: Hero (deep) → Problem (paper) → **Was ich baue (petrol)** → Geschichte
  (warm) → **Wie ich arbeite (petrol)** → Vertrauen (paper) → Merak-Close (warm) → Footer
  (deep). Cool→warm adjacencies mirror „Quelle → Merak".
- Implementation: `Section` currently maps `cool` → `bg-tiefes-wasser`. Extend `Tone` with a
  new `"petrol"` value → `bg-vrelo-petrol text-gletscher` (token-based, no hand-rolled hex).
  `WasIchBaue` and `Steps` use `tone="petrol"`.
- Adjust per-section text/element colors for AA contrast on petrol (headings `text-gletscher`
  or `text-papier`; body `text-gletscher`/`text-stein` checked for contrast; amber only as
  accent). Revisit the `border-t border-faden` dividers on these now-cool sections.

### Files
- Modify: `src/components/Section.tsx` (token-based petrol cool option), `WasIchBaue.tsx`,
  `Steps.tsx` (tone + on-dark color classes). Update any affected snapshot/contrast assumptions.

---

## 4 · Implicit long-term-partner framing (Idea #5)

Felt, not claimed. **One** cue per surface, no future/scale/agency hype
(`zukunftssicher`, `skalieren`, `Partner für morgen`, etc. are banned). All new copy is
**draft-to-verify** — the founder confirms any promise (e.g. „ich bleibe erreichbar")
before go-live; mark with the same draft discipline as 2b copy.

- **FAQ** (`src/lib/faq.ts`): add Q „Was passiert nach dem Projekt?" → factual reassurance:
  reachable after the project, the system is documented and adaptable when something changes.
- **Leistungen** (`src/lib/leistungen.ts`): one durability line on a deliverable — e.g.
  „sauber dokumentiert, damit es auch in einem Jahr noch läuft." Durability as a feature.
- **Merak-Close** (`src/components/home/MerakClose.tsx`): a faint note of continuity — the
  beginning of a calm working relationship, never a CTA shout.
- (Über mich is intentionally **not** touched in this pass.)
- Respect ≤1 water metaphor per piece; `du`-voice, first person, no urgency.

### Files
- Modify: `src/lib/faq.ts`, `src/lib/leistungen.ts`, `src/components/home/MerakClose.tsx`.
  Update content tests if they assert section counts / headings.

---

## 5 · Impeccable polish (cohesive system layer)

Applied as one pass, not scattered:
- **Token hardening:** move the Hero's inline `style={{ background: … }}` hex gradient and the
  drop's inline `bg-[radial-gradient(...)]`/`shadow-[…]` toward `globals.css` utilities/tokens
  where practical; keep all new keyframes (ripple-seed if any, drop) in `globals.css` beside
  `drop-glow`. No new ad-hoc hex.
- **Type & spacing rhythm:** audit heading scale and section padding for consistency across
  routes; unify card corner-radius (backlog item).
- **Focus & motion:** verify `focus-visible` rings on every interactive element (incl. new
  burger, drawer, ripple panel is non-interactive/decorative); every animation `motion-safe`.
- **Small backlog items folded in:** `GeschichteTeaser` heading; `CTAButton` ring-offset tone
  prop (so the CTA's focus ring offset matches petrol/dark surfaces); card-radius unification.

### Files
- Modify: `src/app/globals.css`, `src/components/CTAButton.tsx`,
  `src/components/home/GeschichteTeaser.tsx`, and the components touched above. No route logic
  changes.

---

## Testing & gates

- Vitest unit/RTL: `RippleImage` (renders image; reduced-motion → no canvas/animation),
  `MobileNav` (opens, `Esc` closes, `aria-expanded` toggles, focus returns), updated content
  tests for FAQ/Leistungen/MerakClose copy.
- Shader correctness is verified visually (browser), not unit-tested; tests guard the
  component contract and fallbacks.
- Full gate must stay green: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
- Manual: `npm start` + a quick Playwright/`prefers-reduced-motion` check on the Hero and the
  mobile drawer.

## Out of scope

- No new routes, no copy rewrites beyond the three partner cues, no Über-mich changes.
- No domain/env/legal owner steps (tracked in CLAUDE.md).
- Sending newsletters / Resend Broadcasts (owner).
- `KI`-wording idea (#3) — deferred; not part of this pass.

## Risks / watch-items

- **LCP regression** from the Hero canvas — mitigate by static-image-as-LCP + deferred GL;
  measure before/after.
- **Dark dominance** from two petrol bands (Option C) — petrol (not tiefes-wasser) and
  contrast checks keep the Hero dominant; reversible to one band if it reads heavy.
- **New copy claims** — draft-to-verify; founder must confirm „ich bleibe erreichbar" before
  go-live.
- **SVG MIME** is a preview-server quirk only; production Next serves `/logo/*.svg` correctly.
