# Vrelo Hero Refinement · Design Spec

> Date: 2026-06-06 · Status: approved (brainstorm) → ready for writing-plans
> Branch: `feat/hero-refinement` (new, from `main`)
> Follows: Phase 6 (the interactive WebGL water Hero shipped in `0c6b5d0`)

## Goal

Two focused refinements to the shipped Hero's right-side ripple panel:
1. Replace the panel image with a frame from the brand's own drop footage (`Videos/Beginning.mp4`).
2. Rework the amber drop to feel seamless and sit centered on the image, seeding the ripple from the center.

Everything else about the Hero (interactive cursor ripple, fallbacks, layout, copy, LCP discipline) stays as-is.

## Non-negotiables (unchanged from Phase 6)

- Brand `@theme` tokens; the only raw hex lives in `globals.css` (`.hero-deepwater` / `.hero-drop`) and the inline drop gradient — centralized there, not scattered in components.
- `prefers-reduced-motion` honored; no-WebGL and shader-link-failure both degrade to the static image.
- Hero stays the LCP focal point: the static `<img>` is the LCP element; WebGL is deferred.
- Calm over loud.

## 1 · New panel image (from `Videos/Beginning.mp4`)

- **Source frame:** `Beginning.mp4` at **~4.6s** — the "early ripples" moment: the rebound jet has just collapsed into crisp concentric rings with a clearly defined center. (Chosen in brainstorm over the crown splash / rebound jet / fully-calm options for being calm yet alive, with a center the drop can sit in.)
- **Asset:** extract and optimize to a new committed file **`public/video/hero-quelle.jpg`**, ~**1280px** wide (panel renders ≤ ~600px × 2 dpr), JPEG quality tuned to ~100–180 KB. Produced with the repo's bundled ffmpeg (`node_modules/ffmpeg-static`), e.g.:
  `ffmpeg -ss 4.6 -i Videos/Beginning.mp4 -frames:v 1 -vf "scale=1280:-1" -q:v 4 public/video/hero-quelle.jpg`
  (Commit the produced JPEG; it is a derivative of the owner's source clip, like the other `public/video/*-poster.jpg` assets.)
- **Do NOT** overwrite `public/video/ripples-poster.jpg` — it remains the poster for `ripples.mp4` used elsewhere.
- `RippleImage` `src` in the Hero changes from `/video/ripples-poster.jpg` to `/video/hero-quelle.jpg`. The WebGL ripple samples this image (water rings rippling under the cursor — water on water); behavior is unchanged.

## 2 · Amber drop — seamless warm bloom, centered (L2)

Replace the current hard glowing-ball `.hero-drop` with the brainstorm-approved **L2** treatment: a visible warm core that feathers out softly (no hard-cut edge), centered on the panel.

- **`.hero-drop` (in `src/app/globals.css`)** becomes:
  ```css
  .hero-drop {
    background: radial-gradient(circle at 50% 47%,
      rgba(250,242,225,0.92),
      rgba(244,228,193,0.78) 18%,
      rgba(224,176,92,0.50) 42%,
      rgba(212,162,76,0.18) 62%,
      rgba(212,162,76,0) 80%);
    filter: blur(3px);
    box-shadow: 0 0 62px 16px rgba(212,162,76,0.28);
  }
  ```
  (Brainstorm mockup used `blur(2.5px)` at a small preview size; production panel is larger, so `blur(3px)` keeps the same feathered proportion. Verify live and nudge 2.5–4px if needed — the gradient already does most of the feathering.)
- **Position & size (in `Hero.tsx`):** the drop element moves from the top-right corner to **dead center** of the panel wrapper and is sized as a fraction of the panel, not fixed px:
  - centered: `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`
  - size: `w-[40%] aspect-square` (of the panel wrapper)
  - keep `pointer-events-none`, `aria-hidden`, and `motion-safe:animate-drop-glow`.
  - The old corner classes (`-top-6 right-10 ... md:right-16 md:h-20 md:w-20`) are removed.
- The amber drop remains the **single warm focal point**; it now blends warm light into the cool water (the *Vrelo*→*Merak* duality) instead of floating as a UI ball.

## 3 · Seed alignment (ripple originates at the centered drop)

The drop "seeds" the ripple; with the drop centered, the seed must originate at the panel center.

- **`RippleImage` gains a `seedYFraction` prop** (default `0.5`). The seeding line changes from the hard-coded
  `add(seedXFraction, 0.96, performance.now() / 1000)` to
  `add(seedXFraction, seedYFraction, performance.now() / 1000)`.
- Add `seedYFraction` to the effect dependency array alongside `seedXFraction`.
- **Hero passes** `seedXFraction={0.5}` and `seedYFraction={0.5}` so the periodic ripple emanates from the bloom's center.

## Files

- **Create:** `public/video/hero-quelle.jpg` (extracted asset).
- **Modify:** `src/components/Hero.tsx` (image src, centered bloom drop, seed fractions), `src/app/globals.css` (`.hero-drop` → L2 bloom), `src/components/RippleImage.tsx` (`seedYFraction` prop + seed line + dep array), `src/components/Hero.test.tsx` (expect `/video/hero-quelle.jpg`).
- **Unchanged:** `RippleImage.test.tsx` (generic `src` prop; still valid).

## Testing & gates

- `Hero.test.tsx`: update the image-path assertion to `/video/hero-quelle.jpg`; the other Hero assertions (H1 brand words, `hero-deepwater` bg, single CTA, no inline style on section) stay.
- Optional new `RippleImage` assertion: passing `seedYFraction` does not throw / still renders the image (the WebGL path is unreachable in jsdom, so behavior is unchanged there).
- Full gate green: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
- Manual (`npm start`): the new water frame shows; the centered bloom reads as soft warm light (not a hard ball); cursor ripple works; the centered drop visibly seeds a ripple from the middle; reduced-motion shows the still frame with a static (non-pulsing) bloom.

## Out of scope

- No change to the Hero copy, layout grid, CTA, or the rest of the site.
- No change to other `public/video` assets or the `LazyVideo` usages.
- The `KI`-wording idea (#3) remains deferred.
