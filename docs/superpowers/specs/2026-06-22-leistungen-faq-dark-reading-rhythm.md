# Leistungen + FAQ — dark reading rhythm (design spec)

**Date:** 2026-06-22
**Status:** approved
**Follows:** the Über-mich dark-rhythm pass (same `index % 2 === 1` parity, same on-petrol vocabulary).

## Problem

Two more subpages read flat:

- **Leistungen** stacks 7 near-identical light `LeistungDetail` sections (alternating
  an almost-invisible `gletscher/30` tint), then a petrol `MehrMoeglich` capstone, a
  paper `Referenzen`, and the warm CTA. Seven light cards in a row is monotonous.
- **FAQ** is one paper accordion section (3 theme groups) between a paper intro and a
  warm CTA — no anchor at all.

## Decision

Apply the Über-mich treatment with the same `index % 2 === 1` rule:

- **Leistungen:** the alternating detail sections become petrol-dark bands. Each
  `LeistungDetail` is a self-contained light card, so it simply *floats* on the band —
  no text recolouring. Result (no two petrols adjacent):

  ```
  Intro            light
  0 Anfragen       light
  1 Termine        PETROL
  2 Angebote       light
  3 Nachfass       PETROL
  4 Dateneingabe   light
  5 Kommunikation  PETROL
  6 Bewertungen    light
  MehrMöglich      PETROL  (already petrol)
  Referenzen       light
  CTA              warm
  ```

- **FAQ:** split the accordion into its 3 theme groups, each its own Section. With
  `index % 2 === 1` the middle group (Technik & Sicherheit) goes petrol — one central
  anchor:

  ```
  Intro              light
  Zusammenarbeit     light  (pulled up under intro)
  Technik+Sicherheit PETROL
  Kosten & Ablauf    light
  CTA                warm
  ```

## Changes

### Leistungen

1. **`src/components/leistungen/LeistungDetail.tsx`** — add `onDark?: boolean`. When
   true the card background goes from `bg-papier/80` → `bg-papier` (fully opaque so the
   petrol band doesn't bleed through and muddy the card). Everything inside the card is
   unchanged — it stays a light card.
2. **`src/app/leistungen/page.tsx`** — in the `leistungen.map`, derive
   `const onDark = index % 2 === 1`, set `tone={onDark ? "petrol" : "paper"}` (drop
   `tint`), pass `onDark` to `LeistungDetail`. Keep the `-mt-24 md:-mt-32` on index 0.

### FAQ

3. **`src/components/faq/FaqItem.tsx`** — add `onDark?: boolean`. On dark, swap to the
   homepage on-petrol vocabulary:
   - summary: `text-tiefes-wasser` → `text-papier`; hover `hover:text-vrelo-petrol` →
     `hover:text-honig`
   - focus ring: `ring-offset-papier` → `ring-offset-vrelo-petrol`,
     `ring-vrelo-petrol` → `ring-honig`
   - `+` marker: `text-vrelo-petrol` → `text-honig`
   - answer: `text-tinte` → `text-gletscher`
   - item border: `border-faden` → `border-gletscher/20`
4. **`src/components/faq/FaqAccordion.tsx`** — instead of one `<div space-y-12>`, render
   each group inside its own `<Section tone={onDark ? "petrol" : "paper"}>` where
   `onDark = i % 2 === 1`. The first group carries the `-mt-24 md:-mt-32` pull-up. The
   theme label `text-stumm` → `text-gletscher` on dark; its underline `border-faden` →
   `border-gletscher/20`. Pass `onDark` to each `FaqItem`.
5. **`src/app/faq/page.tsx`** — remove the wrapping `<Section tone="paper" -mt…>`;
   render `<FaqAccordion groups={faqGroups} />` directly (it now emits its own sections).

## Out of scope

- Flat petrol only (no texture overlays), matching Über-mich.
- No copy changes anywhere — class/structure only.

## Testing

- **LeistungDetail:** `onDark` → card has `bg-papier`; default → `bg-papier/80`.
- **FaqItem:** `onDark` → summary `text-papier`, answer `text-gletscher`; default →
  `text-tiefes-wasser`, `text-tinte`.
- **FaqAccordion:** with 3 groups, the middle group's `<section>` is `bg-vrelo-petrol`
  and the outer two are `bg-papier`; existing heading + details-count tests stay green.
