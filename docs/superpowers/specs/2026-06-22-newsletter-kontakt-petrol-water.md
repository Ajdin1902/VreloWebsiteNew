# Newsletter + Kontakt — petrol water form sections (design spec)

**Date:** 2026-06-22
**Status:** approved

## Problem

On `/newsletter` and `/kontakt` the form is a dark `bg-tiefes-wasser` card sitting in a
large empty **papier** section. The dark card floats in a bland off-white field — the
focus is on the card, but the surround is dead space.

## Decision

Make the form section **petrol with a faint flowing-water backdrop** — the homepage
`Steps` treatment (`fliessen.webp` under a `bg-vrelo-petrol/70` overlay). The dark
`tiefes-wasser` card then floats on living petrol water (darker card on lighter-petrol
field = the card pops as the focal point), with a `ring-1 ring-gletscher/15` edge so it
reads crisply. Thematically apt: newsletter = ideas that flow, kontakt = the first
ripple.

```
Intro            papier (light)
████████████  petrol + flowing-water texture
  ┌────────┐   ◄ tiefes-wasser card, gletscher ring
  │  form  │
  └────────┘
████████████  (kontakt: ripple banner joins the same petrol room)
```

## Changes

### New component

1. **`src/components/WaterSection.tsx`** — a petrol `Section` with the `fliessen.webp`
   backdrop + `bg-vrelo-petrol/70` overlay, `relative isolate overflow-hidden`, children
   rendered above. Props: `className` (forwarded to the Section, e.g. the `-mt` pull-up),
   `children`. This is the `Steps` backdrop extracted as a reusable section. (Steps
   itself is left as-is for now — a possible later DRY follow-up.)

### Newsletter

2. **`src/components/newsletter/NewsletterSuccess.tsx`** — it renders directly on the
   section (not inside a card), so its text goes on-dark: heading
   `text-tiefes-wasser` → `text-papier`; body `text-stumm` → `text-gletscher`. The amber
   `success-ring` and the `PageImage` banner are unchanged (already fine on petrol). It
   is only ever shown on the now-petrol `/newsletter` section, so the on-dark colours are
   hardcoded (no prop).
3. **`src/components/newsletter/NewsletterForm.tsx`** — the full-variant card
   (`bg-tiefes-wasser …`) gains `ring-1 ring-gletscher/15`. The `compact` footer variant
   is untouched.
4. **`src/app/newsletter/page.tsx`** — swap the form `<Section tone="paper" -mt>` for
   `<WaterSection className="-mt-24 md:-mt-32">`. The "bald verfügbar" placeholder card
   also gains `ring-1 ring-gletscher/15`.

### Kontakt

5. **`src/app/kontakt/page.tsx`** — combine the two stacked sections into **one**
   `<WaterSection className="-mt-24 md:-mt-32">` containing the form card (with the ring)
   followed by the ripple-banner `<figure>` (spaced with `mt-16 md:mt-20`). The
   figcaption „Der erste Tropfen genügt." goes `text-tiefes-wasser` → `text-papier`. The
   `RippleImage` (already `ring-1 ring-gletscher/10` + shadow) is unchanged. `ContactForm`
   and `ContactSuccess` live inside the dark card and are already on-dark — untouched.

## Out of scope

- No copy changes. No change to the footer newsletter embed (compact variant).
- Steps refactor to use `WaterSection` (note only).

## Testing

- **WaterSection:** renders children; the `<section>` has `bg-vrelo-petrol`; contains an
  `aria-hidden` `<img>` whose `src` includes `fliessen`.
- **NewsletterSuccess:** the „Fast geschafft." heading has `text-papier` (on-dark).
- Existing newsletter/kontakt action + confirm tests stay green (server logic untouched).
- Browser-verify `/newsletter` (form + success states) and `/kontakt` at 1440 + 390:
  card pops on the textured petrol, all field/label/error text legible, ripple banner +
  figcaption read on petrol.
