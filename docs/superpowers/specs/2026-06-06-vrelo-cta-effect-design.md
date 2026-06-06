# Vrelo CTA Button Effect · Design Spec

> Date: 2026-06-06 · Status: approved (brainstorm) → ready to build
> Branch: `feat/cta-effect` (from `main`) · Idea: [Ideas.md](../../../Ideas.md) #7

## Goal

Give the **primary** CTA a premium, calm micro-interaction: a **sheen sweep + slight lift** on hover (option D from the brainstorm). Applies everywhere the primary `CTAButton` is used (Hero, header, Merak-close, etc.) via the shared component.

## Effect (option D)

On `:hover` (pointer): a soft skewed light streak glides left→right across the button (sheen), and the button rises `-2px` with a soft drop-shadow. Single, quick, understated — "light moving over water." No loop.

## Non-negotiables

- `@theme` tokens for brand color; the only raw values are the **neutral white sheen** gradient and the **black lift shadow**, centralized in `globals.css` (same pattern as the existing `.hero-drop` glow / hero panel shadow — not scattered hex in components).
- `prefers-reduced-motion: reduce` → **no sheen, no lift** (instant, static button).
- Must **not** affect the `focus-visible` ring, the `tone` (papier/dark) ring-offset, or tap latency.
- Calm over loud (Brand.md): subtle, premium, not flashy.

## Implementation

### `src/app/globals.css` — add a `.cta-fx` utility (near the hero rules)

```css
/* Primary-CTA micro-interaction: a sheen sweep + slight lift on hover.
   Raw values (neutral white sheen, black lift shadow) live here, not in the
   component. Uses filter: drop-shadow (NOT box-shadow) so it never overrides
   the Tailwind focus-visible ring (which is a box-shadow). */
.cta-fx {
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, filter 0.25s ease;
}
.cta-fx::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 55%;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
}
.cta-fx:hover::before {
  left: 130%;
}
.cta-fx:hover {
  transform: translateY(-2px);
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.28));
}
@media (prefers-reduced-motion: reduce) {
  .cta-fx,
  .cta-fx::before {
    transition: none;
  }
  .cta-fx::before {
    display: none;
  }
  .cta-fx:hover {
    transform: none;
    filter: none;
  }
}
```

### `src/components/CTAButton.tsx`

- Add `cta-fx` to the className **only for `variant === "primary"`** (the filled amber button; the sheen reads wrong on the transparent `ghost`, which keeps its current `hover:bg-gletscher`).
- Wrap `{children}` in `<span className="relative z-[1]">{children}</span>` so the label always paints above the sheen `::before`.
- Everything else (base classes, `tone` offset logic, `variant` styles, focus ring) unchanged.

Resulting structure:
```tsx
const fx = variant === "primary" ? " cta-fx" : "";
return (
  <Link href={href} className={`${base} ${styles}${fx}`}>
    <span className="relative z-[1]">{children}</span>
  </Link>
);
```

## Files

- Modify: `src/app/globals.css` (add `.cta-fx`), `src/components/CTAButton.tsx` (conditional class + label wrapper).
- Test: `src/components/CTAButton.test.tsx` (extend).

## Testing & gates

- Extend `CTAButton.test.tsx`:
  - `primary` (default) button has class `cta-fx`.
  - `ghost` button does **not** have `cta-fx`.
  - label text still rendered (e.g. „Quelle erkunden" present).
  - existing tests (href, default/`dark` ring-offset) stay green.
- Full gate: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
- Manual (`npm start`): hover the Hero/header CTA → sheen sweeps + button lifts; Tab to it → focus ring intact (not clipped); OS reduced-motion → no sheen/lift.

## Out of scope

- No change to the `ghost` variant's interaction, the CTA copy, or where CTAs are placed.
- No click-ripple (option C was not chosen).
- Idea #8 (hero text reveal-on-load) is a separate spec/build.
