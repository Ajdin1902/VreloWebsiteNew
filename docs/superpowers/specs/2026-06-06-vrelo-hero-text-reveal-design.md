# Vrelo Hero Text Reveal-on-Load · Design Spec

> Date: 2026-06-06 · Status: approved (brainstorm) → ready to build
> Branch: `feat/hero-text-reveal` (from `main`) · Idea: [Ideas.md](../../../Ideas.md) #8

## Goal

On page load, the Hero's H1, sub-paragraph, and CTA **arrive** with a soft, staggered
fade-up (reference: PayPal DE homepage) instead of being instantly present. Hero only.

## Motion (V3, chosen in brainstorm)

- Rise distance **24px**, duration **0.75s**, easing **`cubic-bezier(.22,.61,.36,1)`** (ease-out).
- Staggered: **H1 at 0s → sub at 0.14s → CTA at 0.28s**.
- Single pass on load. CSS-only — the animation runs automatically when the elements paint
  (CSS `animation` with `both` fill); no JS, no intersection observer.

## LCP / CLS safety (critical — the H1 is the LCP element)

- **H1 rises only** — `translateY(24px) → 0` with **opacity kept at 1** the whole time. It is
  never invisible, so it paints immediately and does **not** delay LCP. (A fade-from-0 on the
  H1 would push LCP ~0.75s later — not acceptable for the SEO goal.)
- **Sub + CTA fade + rise** — `opacity 0 → 1` plus `translateY(24px) → 0` with their delays.
- **No CLS:** only `transform` and `opacity` animate; both are composited and do not trigger
  layout shift. Elements keep their normal box in flow (no reflow, no reserved-space hack
  needed).
- **`prefers-reduced-motion: reduce`** → no animation; all three render at final state
  (opacity 1, no transform) instantly.

## Implementation

### `src/app/globals.css` — add three classes + two keyframes (near the hero rules)

```css
/* Hero entrance: staggered arrive-on-load. The H1 (LCP element) only rises —
   opacity stays 1 so it paints immediately (no LCP delay); the sub + CTA fade
   in. transform/opacity only → no CLS. Disabled under reduced-motion. */
@keyframes hero-rise {
  from { transform: translateY(24px); }
  to   { transform: translateY(0); }
}
@keyframes hero-reveal {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-reveal-h1 {
  animation: hero-rise 0.75s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
.hero-reveal-sub {
  opacity: 0;
  animation: hero-reveal 0.75s cubic-bezier(0.22, 0.61, 0.36, 1) 0.14s both;
}
.hero-reveal-cta {
  opacity: 0;
  animation: hero-reveal 0.75s cubic-bezier(0.22, 0.61, 0.36, 1) 0.28s both;
}
@media (prefers-reduced-motion: reduce) {
  .hero-reveal-h1,
  .hero-reveal-sub,
  .hero-reveal-cta {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### `src/components/Hero.tsx`

- Add `hero-reveal-h1` to the `<h1>`'s className.
- Add `hero-reveal-sub` to the sub `<p>`'s className.
- Add `hero-reveal-cta` to the CTA wrapper `<div className="mt-10">`.
- No other change (layout, copy, RippleImage, drop untouched). The Hero stays a Server
  Component — these are plain classes, no client hooks.

## Files

- Modify: `src/app/globals.css` (keyframes + 3 classes), `src/components/Hero.tsx` (3 classes).
- Test: `src/components/Hero.test.tsx` (extend).

## Testing & gates

- Extend `Hero.test.tsx`:
  - the H1 has class `hero-reveal-h1`.
  - the sub-paragraph has class `hero-reveal-sub`.
  - the CTA wrapper (or the element containing the CTA link) has class `hero-reveal-cta`.
  - existing Hero assertions stay green.
- Full gate: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
- Manual (`npm start`): on load the headline slides up (crisp, immediately legible) while sub +
  CTA fade up just behind it; OS reduced-motion → everything appears instantly. Confirm no
  visible layout jump (CLS) and the headline is readable from the first frame.

## Out of scope

- Hero only — no scroll-reveal on other sections (future idea if wanted; YAGNI now).
- No change to the ripple panel, the amber bloom, copy, or the CTA effect (#7, already shipped).
