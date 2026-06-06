# Vrelo Scroll-Reveal · Design Spec

> Date: 2026-06-06 · Status: approved (brainstorm) → ready for writing-plans
> Branch: `feat/scroll-reveal` (from `main`)

## Goal

As the user scrolls the **homepage**, each section's elements **fade up** as they enter the
viewport and **fade back out** as they leave (two-way), staggered like the hero's load reveal.
Directs attention to the content currently in view. Reference: PayPal DE homepage.

## Decisions (from brainstorm)

- **Behavior:** two-way (reveal on enter, un-reveal on exit).
- **Scope:** homepage sections **below the hero** only. The hero keeps its own load-reveal and
  is excluded. Other pages/body text are out of scope.
- **Granularity:** staggered per element within each section (eyebrow → heading → lead → cards),
  ~80ms apart.
- **Technique:** a reusable `Reveal` client component using `IntersectionObserver` (not CSS
  `animation-timeline: view()` — that lacks reliable two-way support in Safari/Firefox).

## Motion

- Hidden state: `opacity: 0; transform: translateY(28px)`.
- Shown state: `opacity: 1; transform: none`.
- Transition: `0.6s cubic-bezier(0.22, 0.61, 0.36, 1)` on `opacity` + `transform`.
- Per-element stagger via inline `transition-delay` (applies to enter and exit symmetrically).

## Architecture — `Reveal` primitive

`src/components/Reveal.tsx` (client component):

```tsx
"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  as?: ElementType;        // rendered tag (default "div") — no extra wrapper
  delayMs?: number;        // stagger delay
  className?: string;
  children: ReactNode;
} & Record<string, unknown>; // forward id / aria-* / etc. onto the element

// Two-way scroll reveal: toggles data-shown as the element enters/leaves the
// viewport. The hidden styling is gated behind html.reveal-ready (set by an
// inline script in the root layout), so without JS everything renders visible
// (no FOUC, never stuck hidden). prefers-reduced-motion shows everything.
export function Reveal({ as, delayMs = 0, className = "", children, ...rest }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "-8% 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      {...rest}
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      data-shown={shown}
      className={`reveal ${className}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  );
}
```

(Callback ref so a single `HTMLElement` ref works across any `as` tag without polymorphic-ref
type gymnastics. `rest` is spread first so the component's own `className`/`style`/`data-shown`
win.)

## CSS — `src/app/globals.css` (near the hero rules)

```css
/* Two-way scroll reveal (homepage). Hidden state is gated behind .reveal-ready
   (set by the root-layout inline script) so no-JS renders everything visible. */
.reveal-ready .reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.reveal-ready .reveal[data-shown="true"] {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal-ready .reveal,
  .reveal-ready .reveal[data-shown="true"] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Root layout — `src/app/layout.tsx`

Add a tiny synchronous inline script in `<head>` so the hidden state applies before first
paint (no FOUC), and is absent without JS (content stays visible):

```tsx
<head>
  {/* enable scroll-reveal hidden states only when JS is available */}
  <script
    dangerouslySetInnerHTML={{
      __html: "document.documentElement.classList.add('reveal-ready')",
    }}
  />
</head>
```

(If the layout has no explicit `<head>`, add one inside `<html>` alongside `<body>`.)

## Per-section wrapping (homepage only)

Wrap the existing elements in `Reveal` with staggered `delayMs`. Keep all existing classNames
and ARIA attributes (forwarded via `...rest`). Sections themselves (`<Section>`) are unchanged;
only their inner elements are wrapped.

- **`Problem.tsx`** — eyebrow `p` (0), `h2` (80), lead `p` (160).
- **`WasIchBaue.tsx`** — eyebrow `p` (0), `h2` (80), lead `p` (160), `ul` (240, whole list as
  one), link `a` (320). Keep `id`/`aria-labelledby`.
- **`GeschichteTeaser.tsx`** — eyebrow `p` (0), `blockquote` (80), `p` (160), link `a` (240).
- **`Steps.tsx`** — eyebrow `p` (0), `h2` (80), `ol` (160, whole list as one).
- **`Proof.tsx`** — eyebrow `p` (0), `h2` (80), lead `p` (160).
- **`MerakClose.tsx`** — `h2` (0), `p` (80), CTA wrapper `div` (160). Leave the `LazyVideo`
  background + warm tint divs untouched (not wrapped).

The **Hero is not touched** (it has its own load reveal).

## Testing & gates

- `src/components/Reveal.test.tsx`:
  - renders children; default tag is `div`; `as="h2"` renders an `h2`.
  - applies the `reveal` class and merges the passed `className`.
  - forwards arbitrary props (e.g. `aria-labelledby`) onto the element.
  - sets `transition-delay` from `delayMs`.
  - two-way toggle: with a mocked `IntersectionObserver` (capture the callback, like
    `LazyVideo.test`), firing `isIntersecting: true` sets `data-shown="true"`, and
    `false` sets `data-shown="false"`.
- Existing homepage component tests (`WasIchBaue`, `Steps`) must stay green — the petrol-tone /
  content assertions still hold after wrapping (classNames preserved). Update them only if a
  query breaks (e.g. role/text still present).
- Full gate: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
- Manual (`npm start`): scroll the homepage — sections fade up on enter, fade out on exit,
  staggered; no layout jump (CLS); with JS disabled or reduced-motion on, all content is fully
  visible and static.

## Out of scope

- Non-homepage pages, body text, FAQ answers, Ratgeber article bodies.
- The hero (unchanged).
- Scroll-scrubbed "focus follows center" mode (option 3) — not chosen.

## Risks / watch-items

- **FOUC / no-JS invisibility** — mitigated by the `reveal-ready` gate (hidden only with JS).
- **CLS** — only opacity/transform animate; elements keep their box. Verify in manual check.
- **Over-busyness** — homepage-only + gentle timing keeps it calm; revisit stagger/threshold if
  the two-way exit feels distracting.
