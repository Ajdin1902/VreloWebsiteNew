# Newsletter + Kontakt — honey (Merak) form cards (design spec)

**Date:** 2026-06-22
**Status:** approved

## Problem

The form cards are dark `tiefes-wasser` navy on the petrol water section — dark-on-dark,
murky, low-contrast, not aesthetic. Move to the warm Merak palette: a **honig honey**
card (`#e8b86b`) glowing on the deep petrol water (teal + gold = a premium pairing), with
the text inverted to an on-light scheme.

## Decision

Card surface → `bg-honig`. Text/controls invert from on-dark to on-light-warm:

| element | from (on navy) | to (on honey) |
|---|---|---|
| card bg | `bg-tiefes-wasser` + `ring-gletscher/15` | `bg-honig` (no ring; shadow-deepwater + the honey/petrol contrast define it) |
| heading | `text-papier` | `text-tiefes-wasser` |
| sub/reassurance | `text-gletscher` | `text-tiefes-wasser/80` |
| labels | `text-gletscher` | `text-tiefes-wasser` (font-medium) |
| inputs | `bg-gletscher/10 text-papier border-gletscher/25` | `bg-papier text-tinte border-tiefes-wasser/20`, focus `ring-vrelo-petrol ring-offset-honig` |
| primary button | `bg-amber text-tiefes-wasser` | `bg-tiefes-wasser text-papier hover:bg-vrelo-petrol`, focus `ring-tiefes-wasser ring-offset-honig` |
| consent/body text | `text-gletscher` | `text-tinte` |
| inline links | `darkLinkClass` (gletscher) | `lightLinkClass` (petrol) |
| error text | `text-signal` | `text-signal-tief` (new on-light token) |
| success ring (ContactSuccess) | amber border + dot | `border-tiefes-wasser/40` + `bg-tiefes-wasser` dot |

The dark, near-black headings/body keep ample contrast on honey; inputs are a lighter
papier well so they read as fields.

## Scope notes (what does NOT change)

- **NewsletterSuccess** renders on the petrol *section* (not in a card) → stays on-dark
  (papier/gletscher, amber success-ring). Untouched.
- The **compact footer** NewsletterForm variant stays on the dark footer → untouched.
  Only the full-variant branches change.
- `ContactForm`, `ContactSuccess`, `CardHeading` only ever render inside the kontakt card
  (now honey) → all flip to on-light.

## Changes

1. **`globals.css`** — add `--color-signal-tief: #8f3526;` (a deep brick red; on-light
   error counterpart to `signal`, AA on honey and on papier inputs), with the same
   AA-justification comment style as `signal`/`ember`/`stumm`.
2. **`components/kontakt/onDarkLink.ts`** — add
   `lightLinkClass = "text-vrelo-petrol underline underline-offset-2 hover:text-tiefes-wasser transition-colors"`.
3. **`components/newsletter/NewsletterForm.tsx`** — full-variant card → honey per the
   table (bg, heading, subtext, inputClass, labelClass, consentClass, errorClass, a new
   on-honey button branch, consentLinkClass → lightLinkClass). Compact branch unchanged.
4. **`components/kontakt/ContactForm.tsx`** — fieldClass → light; labels → tiefes-wasser;
   errors `text-signal` → `text-signal-tief`; button → navy; consent link → lightLinkClass.
5. **`components/kontakt/CardHeading.tsx`** — h2 `text-papier` → `text-tiefes-wasser`;
   subtext `text-gletscher` → `text-tiefes-wasser/80`.
6. **`components/kontakt/ContactSuccess.tsx`** — heading → tiefes-wasser; body → tinte;
   links → lightLinkClass; ring border/dot → tiefes-wasser.
7. **`app/newsletter/page.tsx`** — placeholder card `bg-tiefes-wasser` → `bg-honig`
   (drop the ring); `text-gletscher` → `text-tinte`.
8. **`app/kontakt/page.tsx`** — form card `bg-tiefes-wasser` → `bg-honig` (drop the ring);
   placeholder `text-gletscher` → `text-tinte`; mailto `darkLinkClass` → `lightLinkClass`.

## Testing

- `onDarkLink`: `lightLinkClass` includes `text-vrelo-petrol`.
- `CardHeading`: heading has `text-tiefes-wasser`.
- `ContactSuccess`: heading has `text-tiefes-wasser`.
- `NewsletterForm` (full): the card div has `bg-honig`.
- Browser-verify both pages (form, placeholder, success) at 1440 + 390: honey card on
  petrol, dark headings/body legible, papier inputs read, navy button pops, petrol links,
  error text legible (check `signal-tief` contrast), focus rings visible. 0 console errors.
