# Phase 2c — Video system (`LazyVideo`) + Über mich

Design spec for Phase 2c of the Vrelo website. Builds the reusable video primitive once, then wires it into the two surfaces the brand arc calls for: the full 4-clip narrative on **Über mich**, and the `End.mp4` sunset behind the homepage **Merak-close**.

- Brand brief: [Brand.md](../../../Brand.md)
- Master design spec: [2026-06-01-vrelo-website-design.md](2026-06-01-vrelo-website-design.md) — §4 (video assets) is the source of truth this phase implements.

> Client-facing copy is **German**; code & comments **English**. German typographic quotes only: „…“ (U+201E … U+201C), never `"`.

---

## 1. Goal & scope

Phase 2c delivers:

1. A reusable **`LazyVideo`** client component (lazy, motion-safe, poster-fallback) — the only stateful unit.
2. An **asset pipeline** that turns the 4 raw clips in `Videos/` into web-optimized derivatives in `public/video/`.
3. The **Über mich** page: first-person („Ich“) story spine of 4 beats, each beat pairing a clip with a story beat.
4. Wiring the **homepage MerakClose** sunset video slot.

**Out of scope:** real Über-mich biography copy (founder writes it; we ship `[Platzhalter]` prompts), and any cross-clip scroll orchestration (rejected — see §7).

## 2. Decisions locked in brainstorming

- **Asset strategy:** install ffmpeg and optimize now (no ffmpeg was present locally). One reproducible prep step → mp4 + webm + poster per clip, target ≤~2 MB.
- **Über-mich copy:** structure + clearly-flagged `[Platzhalter]` prompts per beat. No invented biographical claims; the founder fills the real story. (Same draft-to-verify discipline as Phase 2b, but here the body text is left as explicit placeholders rather than drafted.)
- **Component shape:** one "dumb" `LazyVideo`; layout/positioning owned by the parents (`StoryBeat`, `MerakClose`). No `VideoSequence` orchestrator (YAGNI).

## 3. `LazyVideo` — `src/components/LazyVideo.tsx`

A single `"use client"` component. Knows nothing about layout; the parent supplies sizing and object-fit.

### Props

```ts
type LazyVideoProps = {
  mp4: string;        // e.g. "/video/quelle.mp4"
  webm?: string;      // e.g. "/video/quelle.webm" — offered first when present
  poster: string;     // "/video/quelle-poster.jpg" — also the reduced-motion still
  className?: string;  // sizing + object-fit, owned by the parent
  aspect?: string;     // Tailwind aspect utility, e.g. "aspect-[4/5]", to reserve space (no CLS)
};
```

### Behavior (implements master spec §4)

- Renders `<video muted loop playsinline preload="none" poster={poster}>` with `<source>` children in order: webm (if given) then mp4.
- **Decorative:** the narrative meaning lives in the adjacent text, so the media is `aria-hidden`. No captions needed (no audio, no information conveyed).
- **Reduced motion:** on mount, read `window.matchMedia("(prefers-reduced-motion: reduce)")`. If reduced → render **only** `<img src={poster} aria-hidden>` — zero video bytes, no observer.
- **Lazy autoplay:** otherwise attach an `IntersectionObserver` (threshold ~0.25). On enter → `.play()`; on leave → `.pause()`. With `preload="none"`, nothing downloads until the first `play()`. Battery/CPU friendly.
- **Resilience:** guard the `play()` promise rejection (autoplay can be blocked) — on failure the poster simply remains. Disconnect the observer on unmount.
- **No-JS / no-IO:** the `poster` attribute means a still shows even if scripts never run.

### Layout reservation

The parent passes an `aspect` utility so the box has intrinsic size before the video loads (prevents layout shift). Actual aspect ratio is chosen from the real clip dimensions discovered during the asset prep step (§4).

## 4. Asset pipeline — `scripts/optimize-videos.mjs` → `public/video/`

- **Tooling:** install ffmpeg (`winget install ffmpeg`; fallback `ffmpeg-static` + `ffprobe-static` as devDependencies, referenced by resolved binary path).
- **Inputs:** the 4 originals in `Videos/` (stay there, untouched):
  | Original | Arc beat | Slug |
  |---|---|---|
  | `Beginning.mp4` | drop = Quelle | `quelle` |
  | `Second_Part.mp4` | pond ripples | `ripples` |
  | `Thrid_Part.mp4` | delta = Fluss | `fluss` |
  | `End.mp4` | sunset = Merak | `merak` |
- **Outputs** to `public/video/` per slug:
  - `<slug>.mp4` — H.264, scaled to ≤1280px wide, `-crf 28 -an -movflags +faststart`. Target ≤~2 MB.
  - `<slug>.webm` — VP9, comparable quality/size; offered first.
  - `<slug>-poster.jpg` — a representative frame.
- **Properties:** script is idempotent and reproducible. After running, verify each output's size and dimensions; record the dominant aspect ratio to drive the `aspect` props.
- **Version control:** optimized derivatives are committed (Vercel serves them statically). The script keeps the derivation reproducible. Raw `Videos/` originals remain as the source.
- The script is one-off tooling — verified by output inspection, not unit-tested.

## 5. Über mich — page, data, beat component

### Data — `src/lib/ueber-mich.ts`

Mirrors the typed-data pattern of `src/lib/{leistungen,faq}.ts`.

```ts
type StoryBeat = {
  slug: string;                 // matches the clip slug: quelle | ripples | fluss | merak
  eyebrow: string;              // short German label for the beat
  heading: string;              // beat headline (German)
  body: string;                 // [Platzhalter] prompt — founder replaces with real copy
  side: "left" | "right";       // which side the video sits on (desktop); alternates
};
```

Four beats, mapped to the water arc:

1. **Quelle** (`quelle`) — origin / „Woher ich komme“. `body` = `[Platzhalter]` prompt.
2. **Wellen** (`ripples`) — the realization / why automation. `[Platzhalter]`.
3. **Fluss** (`fluss`) — how I work / what I build. `[Platzhalter]`.
4. **Merak** (`merak`) — what it feels like + bridge to the invitation. `[Platzhalter]`.

Posters/clip paths are derived from `slug` (`/video/<slug>.{mp4,webm}`, `/video/<slug>-poster.jpg`), not stored in the data.

### Beat component — `src/components/ueber-mich/StoryBeat.tsx`

Server component (no client JS of its own; `LazyVideo` is the only client island).

- Wrapped in `Section tone="paper"` with subtle `tint` alternation (same rhythm as Leistungen).
- 2-column grid on `md` (stacked on mobile, consistent **video-then-text** order); `side` flips the desktop column order via `order-*`.
- An `aria-hidden` Fraunces beat numeral `01`–`04` (consistent with `LeistungDetail` and homepage `Steps`).
- Text column: eyebrow + `h2` heading + body paragraph. Video column: `LazyVideo` in a rounded card with a reserved `aspect`.
- Calm Papier throughout — the warm payoff is the closing CTA, not the beats.

### Page — `src/app/ueber-mich/page.tsx`

- `metadata` `title: "Über mich"` → the layout template renders „Über mich — Vrelo“.
- Composition: reused **`PageIntro`** (eyebrow „Über mich“, `h1`, `[Platzhalter]` lead) → `beats.map(StoryBeat)` → reused **`ClosingCta`** (warm, „Quelle erkunden“ → `/kontakt`).
- Removes `/ueber-mich` from the known dead-links list once shipped.

## 6. Homepage MerakClose wiring — `src/components/home/MerakClose.tsx`

- Replace the placeholder gradient `<div>` with `<LazyVideo>` in **cover mode**: `absolute inset-0 -z-10 h-full w-full object-cover`, `merak` clip + poster.
- Keep a warm gradient/tint **overlay above the video** at reduced opacity so the amber register and text contrast survive over the footage.
- `Section tone="warm"` and all copy/CTA unchanged. Below the fold ⇒ no LCP cost. Reduced motion → poster still (handled by `LazyVideo`).

## 7. Rejected alternative

**`VideoSequence` orchestrator** — a parent coordinating all 4 clips as one chained sequence (one playing at a time). Rejected: each beat looping independently while in view already reads as a narrative spine; coordination adds state and test surface for no user-visible gain. YAGNI.

## 8. Testing

- **`LazyVideo.test.tsx`** (TDD — the real logic): mock `matchMedia`, `IntersectionObserver`, and `HTMLMediaElement.play`/`pause`. Assert:
  - reduced-motion → renders `<img>` poster only, no `<video>`;
  - normal → `<video>` with `poster` and both `<source>` elements (webm before mp4);
  - entering view calls `play()`; leaving calls `pause()`;
  - media is `aria-hidden`.
- **`StoryBeat.test.tsx`**: renders heading + body, the beat numeral, the correct desktop order class for `side`, and contains a video/poster.
- **`ueber-mich.test.ts`**: 4 beats; each has a clip `slug` and a `[Platzhalter]` body.
- **Page route + MerakClose change:** covered by `npm run build` + a render smoke check (no dedicated route test, matching the Phase 2b convention).

## 9. Definition of done

- `npm test`, `npm run build`, `npm run lint`, `npx tsc --noEmit` all green.
- `/ueber-mich` renders the 4-beat spine; videos lazy-load and respect `prefers-reduced-motion` (poster still).
- Homepage Merak-close plays the sunset below the fold without harming LCP.
- Per-task commits, each ending `Co-Authored-By: Claude Opus 4.8`. Branch `feat/phase2c-video-ueber-mich`.

## 10. Open items carried for the founder

- Write the real Über-mich story copy (replace the 4 `[Platzhalter]` bodies + the lead).
- Confirm the chosen poster frames read well per clip.
