# Lead-Check — Lösungs-Spiegel im Ergebnis („so übernimmt die Termin-Quelle das")

**Date:** 2026-08-10
**Area:** `Website/` — `/lead-check` result view (`src/components/lead-check/Result.tsx`)
**Type:** small copy/content addition

## Problem

The `/lead-check` result screen ends by exposing the hook — *„Das Schwere ist, das
konsequent zu tun – nachts, im Termin, bei jeder Anfrage"* — and then jumps straight
to the petrol CTA box (*„Genau das ist die Termin-Quelle"* + Cal scheduler). It names
the hard part but never shows **how** the Termin-Quelle removes it. The broker is left
to infer the bridge himself.

## Decision (approach A — mirror, not mechanism)

Add one calm block that mirrors the three self-serve tips back as things a system does
on its own. It closes the logic gap (hard part → what makes it effortless) and lifts
*Perceived Likelihood* without turning the lead magnet into a sales page.

Rejected: a concrete mechanism/feature explanation (that is `/makler`'s job — the page
this check links *from*), and an onward `/makler` link (the 2026-08-08 Rams audit
stripped 19 nav exits to keep this a focused task; founder confirmed no link).

## Placement

A block on **paper**, between the „Drei Dinge, die du sofort tun kannst" list and the
petrol CTA box. Rhythm stays intact: explanation calm on paper, the *ask* in the petrol
box. Renders for **both** score branches (`langsam`/`solide` and `schnell`) — the tips
block above it is already score-agnostic, so the mirror is too.

## Copy (final, stop-slop-passed)

> **Genau das übernimmt die Termin-Quelle**
>
> Die drei Dinge von oben sind einfach. Schwer ist nur, sie durchzuhalten – bei jeder
> Anfrage. Ein System tut genau das:
>
> - Die Termin-Quelle antwortet auf jede neue Anfrage in unter fünf Minuten – auch
>   abends, auch am Wochenende.
> - Sie stellt die richtigen Fragen und schlägt einen Termin vor.
> - Meldet sich jemand nicht, fasst sie von selbst nach – ohne dass du daran denken musst.

## Constraints (brand + compliance)

- **No „KI".** Framed as *ein System / automatisch*, never AI-touted — the quote-bank
  finding shows brokers reject „eine KI, die für dich antwortet". (`/lead-check` itself
  contains no AI, so no Art. 50 label question arises.)
- **No price.** Site convention; „unter fünf Minuten" is the offer's honest 5-min promise.
- **German punctuation:** spaced en-dash „ – " (U+2013, not em-dash), „…" quotes if any,
  generic masculine. Verify bytes after writing.
- **Voice:** calm-over-hype, first person context, Fraunces italic only for „Vrelo"/„Merak"
  via existing `BrandWord` handling (the string „Termin-Quelle" is not a brand-italic word).

## Implementation notes

- Copy stays **inline in `Result.tsx`**, matching that file's existing pattern (all its
  German is inline). Do not partially refactor it into `leadCheck.ts` — out of scope.
- Reuse existing tokens/classes from the neighbouring „Drei Dinge" block
  (`text-tiefes-wasser` heading, `list-disc … text-tinte`, `text-stumm` for the intro).

## Testing

- Extend `src/components/lead-check/Result.test.tsx`:
  - the heading „Genau das übernimmt die Termin-Quelle" renders for a `langsam` result
    **and** a `schnell` result;
  - the three mirror lines render.
- Guard the new strings against typography regressions (no ASCII `"`, no em-dash U+2014)
  in the same test, mirroring the copy-guard intent used elsewhere.

## Out of scope

- No mechanism/feature detail. No `/makler` link. No change to the result email templates
  (`leadCheckEmail.ts`) or the petrol CTA box. No change to the scoring model.
