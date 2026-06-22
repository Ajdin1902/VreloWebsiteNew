# Homepage — Problem + Proof depth pass (design)

**Status:** approved 2026-06-22 (brainstorming). Ready for writing-plans.

**Goal:** Fix the two pale homepage sections that read as near-empty voids — `Problem` and `Proof` — by giving them contained depth and, for `Proof`, real substance. No recoloring of whole sections; depth comes from contained `card-depth` panels/cards on the existing light surfaces.

**Why not full-dark sections:** the palette rhythm reserves `tiefes-wasser` for Hero + Footer, and the petrol `WasIchBaue`+`Steps` block sits directly above `Proof`. Making either pale section fully dark would clump the rhythm (Hero dark → … → two petrol → dark Proof). So the depth is added *within* the light sections via panels/cards, keeping the calm centered spine intact.

## Scope
- `src/components/home/Problem.tsx` — wrap the task list in a contained panel.
- `src/components/home/Proof.tsx` — replace the apologetic single paragraph with a connector + four value cards + a small honest footnote.
- Tests for both; browser-verify 1440/390 + AA.
- **Out of scope:** Hero, WasIchBaue, Steps, MerakClose; section padding/rhythm tuning; any new imagery.

## Reusable pattern (from `Steps.tsx`)
Cards use `card-depth rounded-2xl border … p-6`. Steps' cards are dark (`bg-tiefes-wasser/40 border-gletscher/20`) on a petrol section. The Problem/Proof panels are the **light analogue**: `card-depth rounded-2xl border border-faden bg-papier p-6/8`. Depth comes from the `card-depth` shadow + inset edge-light + border lifting the panel off the textured papier. (Browser-verify the lift on the textured Proof bg; if flat, add a faint `ring-1 ring-tiefes-wasser/5` — no hand-rolled colors, no pure white per brand.)

## Problem — contained list panel
Keep all copy and the centered spine. Heading, intro, and the closing „Zusammen sind es Stunden …“ line stay on the centered axis as now. Change: the four-task `ul` moves **inside a single contained panel**:

- Panel: `card-depth rounded-2xl border border-faden bg-papier` with padding (`p-8`), centered, `max-w-xl mx-auto`, left-aligned list inside (amber-dot bullets unchanged).
- Deliberately a **single panel, not a card grid** — keeps the "pile of small tasks" feeling and avoids two identical grids back-to-back with Proof.
- Keep the `Reveal` stagger (heading 0 / intro 80 / panel 160 / close 240).

## Proof — rebuilt with value cards
Keep the `Section` (faint water texture + `bg-papier/88` overlay) and the heading „Ruhig gebaut. Verlässlich im Betrieb.“ **Remove** the „Echte Referenzen folgen in Kürze …“ paragraph and the stale TODO.

Structure:
1. Heading (unchanged) on the centered spine.
2. Connector `p`, centered: „**Worauf du dich verlassen kannst:**“
3. **Four value cards** — `grid gap-5 sm:grid-cols-2`, each `card-depth rounded-2xl border border-faden bg-papier p-6`. **No icons.** Card title `h3` in `text-vrelo-petrol font-semibold text-xl`; body in `text-tinte`. Copy (German, generic masculine, calm, spaced en-dash „ – “, no hype):
   - **Ein Ansprechpartner.** „Du redest immer mit mir – kein Team, keine Tickets, keine Warteschleife.“
   - **Praxiserprobt.** „Seit über drei Jahren automatisiere ich Prozesse in einem internationalen Unternehmen – du bekommst diese Erfahrung in jedem System.“
   - **Maßgeschneidert statt von der Stange.** „Ein System, das zu deinem Betrieb passt – sauber gebaut und dokumentiert.“
   - **Du wartest nichts.** „Einrichten, absichern, am Laufen halten – das übernehme ich. Du musst nichts lernen.“
4. **Footnote** `p`, small + de-emphasized (`text-sm text-stumm`), centered below the cards: „Erste Kundenreferenzen folgen, sobald die laufenden Projekte abgeschlossen sind.“
5. `Reveal` stagger: heading 0 / connector 80 / card grid 160 / footnote 240.

Notes: do **not** name the employer („ein internationales Unternehmen“ stays generic — confidential + credible). The experience card leads as the real proof; the references footnote keeps it honest without making absence the whole section.

## Accessibility / brand
- All text tokens used (`tinte`, `stumm`, `vrelo-petrol`, `tiefes-wasser`) already clear WCAG AA on papier (see CLAUDE.md Gotchas). Re-confirm `vrelo-petrol` titles + `stumm` footnote on the card surface during browser-verify.
- Smart quotes „…“ (U+201E/U+201C) and spaced en-dash „ – “ (U+2013) in all copy; byte-verify after writing.
- Tokens only (`bg-papier`, `border-faden`, `card-depth`, `text-vrelo-petrol`) — no hand-rolled colors, no pure white.

## Testing
- `Problem.test.tsx` / `Proof.test.tsx` (add if missing): assert the four Proof titles render (e.g. „Praxiserprobt“), the references footnote text renders, and the Problem tasks still render inside the panel.
- Full gate: `npx tsc --noEmit` · `npm run lint` · `npm test`.
- Browser-verify the live build at **1440** and **390**: cards lift off the bg, 2×2 → 1-col stack on mobile, Reveal fires, no overflow, contrast holds.

## Verification of the win
Both sections read as substantial, contained, and on-brand — no more floating-in-cream voids; Proof now leads with real credibility (3+ yrs experience) instead of admitting "no references yet."
