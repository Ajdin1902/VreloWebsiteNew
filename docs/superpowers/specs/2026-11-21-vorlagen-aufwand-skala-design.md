# /vorlagen: Aufwand-Skala (design, short)

**Date:** 2026-11-21 · **Status:** awaiting Ajdin's approval · **Size:** small change

## Intent
Owners say „mache ich, wenn ich mehr Zeit habe“ (Schmid, H&G). The free offers differ in *who does the work*. Show that on `/vorlagen` as one scale: left = most effort for the visitor (he does it himself), right = least (Ajdin does it). It frames the talk + Fahrplan and the build as the low-effort end, matching the LinkedIn post and the Ratgeber article „Mache ich, wenn ich mehr Zeit habe?“.

## Goals / non-goals / anti-goals
- **Goal:** a visitor sees in one glance which offer costs him how much of his own work, and that everything up to the Fahrplan is free.
- **Non-goals:** re-sorting or regrouping the cards (approach B), touching the Bauplan pages, the hero or the closing line.
- **Anti-goals:** a price anywhere (public-copy rule), a minutes axis (the 3-minute Prozess-Check would look like less effort than the 30-minute talk; the axis is who does the work), a second CTA button competing with the cards.

## Approaches (Ajdin picked A, 2026-11-21)
- **A. Scale band under the hero, cards unchanged (picked):** one new component, copy in `vorlagen.ts`; smallest diff, can grow into B later. Trade-off: scale and card order don't match.
- **B. Whole page rebuilt along the scale:** page and scale agree, but the trade groups go, many tests change and the Baupläne (cold-call follow-up asset) lose their place.
- **C. Scale replaces the closing line:** few visitors scroll past 16 Bauplan cards; rejected.

## Design (A)
Band directly under `CompactHero`, before the card groups.

```
Wer macht die Arbeit?
Links machst du es selbst, rechts übernehme ich. Bis zum Fahrplan ist alles kostenlos.

Du machst es selbst ●────●────●────●────●────● Ich mache es für dich
     Claude-Gehirn  Baupläne  KI-Betriebssystem  Prozess-Check  Gespräch + Fahrplan  Umsetzung
```

| # | Stop | Note under it | Link |
|---|---|---|---|
| 1 | Claude-Gehirn | Du richtest es ein und pflegst es | `#claude-gehirn` |
| 2 | Baupläne | Du baust nach Plan | `#gruppe-handwerk` (first Bauplan group) |
| 3 | KI-Betriebssystem | Du siehst, wo du anfängst | `#haus` |
| 4 | Prozess-Check | Du bekommst deine Zahl | `#prozess-check` |
| 5 | Gespräch und Fahrplan | Ich plane, du entscheidest | `kontaktHref(CHECK_SRC.vorlagen)` (same as the closing line) |
| 6 | Umsetzung | Ich baue es für dich | `leistungHref("prozessautomatisierung")` |

- Stops 1 to 5 carry a small „kostenlos“ marker; stop 6 carries none and never a price.
- Markup: `<ol>` (order is the meaning), each stop a link; the line is decorative CSS. md+: horizontal, line runs left to right, amber deepening to the right. Mobile: vertical, most effort on top.
- Group wrappers get `id="gruppe-<id>"`; every anchor target gets `scroll-mt-*` on the element with the id (repo gotcha). No `Reveal` around anchored elements.
- Copy in `vorlagenPage.skala` (`src/lib/vorlagen.ts`), component `src/components/vorlagen/AufwandSkala.tsx` holds no German strings. Brand rules: du, „…“, no Gedankenstrich, no comma before „und“.

## Checks (TDD)
- `vorlagen.test.ts`: 6 stops in this order; every `#anchor` matches a card `id` or a group id; last stop links to the Prozessautomatisierung page; stops 1 to 5 `kostenlos`, stop 6 not; copy-guard passes (no price token, no dashes).
- Component test: renders an ordered list with 6 links and both end labels.
- Gate: test, tsc, lint, build; check at 1440 and 390 on localhost before asking to push.

## Left to the builder
Exact spacing, dot size and the amber gradient within the brand tokens; whether the „kostenlos“ marker is a chip or a line under stops 1 to 5.
