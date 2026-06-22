# Über-mich — dark reading rhythm (design spec)

**Date:** 2026-06-22
**Status:** approved

## Problem

The Über-mich page has no reading rhythm. Its six stacked sections are all light
(paper → paper → faint `gletscher/30` tint → paper → faint tint → warm). The tint on
beats 2 and 4 barely registers, so the page reads as one continuous beige with no
anchors for the eye. The homepage, by contrast, alternates light and petrol-dark
blocks (Hero dark → Problem light → WasIchBaue/Steps petrol → Proof light → Close warm
→ Footer dark) and breathes as a result.

## Decision

Borrow the homepage vocabulary: turn the two already-alternating story beats —
**Ripples** (the moment it clicked) and **Merak** (the payoff feeling) — from a faint
tint into real **petrol-dark** sections. Two dark anchors, same alternation parity that
already drives the tint (`index % 2 === 1`). The two darkened beats are the emotional
peaks of the arc, so the visual weight lands where the story peaks.

Rhythm (section order unchanged):

```
Intro    light   ┐ merge under intro (existing -mt pull-up)
Quelle   light   ┘
Ripples  PETROL  ◄ dark anchor
Fluss    light
Merak    PETROL  ◄ dark anchor
CTA      warm
```

## Changes

### 1. `src/components/ueber-mich/StoryBeat.tsx`

Add an `onDark?: boolean` prop. When true, swap the hardcoded dark-ink classes for the
site's established on-petrol vocabulary (identical to `WasIchBaue`/`Steps`):

- heading: `text-tiefes-wasser` → `text-papier`
- body paragraphs: `text-tinte` → `text-gletscher`
- video panel: add `ring-1 ring-gletscher/15` (the `shadow-deepwater` reads as nothing
  on dark, so the panel needs a light edge instead)

`BrandWord` (*Vrelo*/*Merak*) inherits color from its parent, so it stays legible on
dark automatically — no change there. Default (light) behaviour is unchanged.

### 2. `src/app/ueber-mich/page.tsx`

Map beats so that index 1 (ripples) and 3 (merak) render as `Section tone="petrol"`
with `<StoryBeat ... onDark />`; index 0 (quelle) and 2 (fluss) stay `tone="paper"`.
Replace the current `tint={index % 2 === 1}` with a `const onDark = index % 2 === 1`
that drives both the section `tone` and the `onDark` prop. The `-mt-24 md:-mt-32`
pull-up on beat 0 and the warm `ClosingCta` are untouched. No divider borders — the
petrol/paper contrast is the divider.

## Out of scope

- Flat petrol only — no texture overlay (keeps the anchors calm; nature/water clips
  already look rich on deep teal).
- Leistungen and FAQ subpages get the same treatment in a later pass (tracked in
  CLAUDE.md). This spec is Über-mich only.

## Testing

- StoryBeat: add a case asserting `onDark` renders a `text-papier` heading +
  `text-gletscher` body, and that the default still renders `text-tiefes-wasser` /
  `text-tinte`.
- Existing StoryBeat and `ueber-mich` lib tests unchanged.
