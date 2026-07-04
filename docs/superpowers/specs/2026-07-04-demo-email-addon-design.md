# Design — E-Mail add-on for the `/demo` reveal

**Date:** 2026-07-04
**Area:** `Website/` — Termin-Quelle interactive demo (`/demo`)
**Status:** approved, ready for planning

## Goal

The demo bot should capture the (simulated) client's **e-mail address** alongside the
name at the close of the booking chat. The reveal (`Protokoll`) then shows the e-mail in
the „Terminnotiz" **and** renders a **simulated confirmation-email preview** — visibly an
add-on so the broker sees the payoff, but **nothing is actually sent or stored**
(consistent with the demo's existing „nichts gespeichert/versendet" posture).

This is a *simulation*, not the real n8n/e-mail engine.

## Context

The demo runs a 7-step booking flow (`src/lib/demo/prompt.ts`). The bot asks for the
name last, appends an `[ENDE]` sentinel once the Termin is confirmed and the follow-up
answered, and the reveal POSTs the transcript to the fail-safe `/demo/summary` route,
which returns a structured `Terminnotiz` (Name · Anliegen · Termin · Offene Punkte).
`Protokoll.tsx` renders that card above the full transcript. Notes are **display-only**.

## Changes (four touch-points)

### 1. Prompt flow — `src/lib/demo/prompt.ts`

Step 6 currently asks only for the name at the close. Extend it to ask for **name and
e-mail in the same closing question**, e.g.:

> „Auf welchen Namen darf ich den Termin notieren – und an welche E-Mail-Adresse darf
> ich die Bestätigung schicken?"

Step 7's `[ENDE]` gate then also waits for the e-mail before closing. `MAX_TURNS`
(backstop) unchanged. Keep the calm brand voice — no hype, no „!!!".

### 2. Terminnotiz shape — `src/lib/demo/summary.ts`

- Add `email: string` to the `Terminnotiz` type and to `EMPTY_NOTIZ`.
- Add `email` to the JSON schema emitted in `buildSummarySystem` (with a one-line German
  hint: `email = E-Mail-Adresse des Kunden`).
- Parse it in `parseNotes`: `String(o?.email ?? "").trim().slice(0, 160)`.
  **No format validation** — it is a simulation; an empty field is fine and degrades
  gracefully like the other fields.

### 3. Reveal — `src/components/demo/Protokoll.tsx`

- Add an **E-Mail** row to the Terminnotiz `<dl>`, conditional on `notiz.email` (same
  pattern as the existing rows).
- **Only when `notiz.email` is present**, render a subtle simulated mail-preview card
  below the Terminnotiz (and before the transcript):
  - Eyebrow: „Bestätigungsmail (Vorschau)".
  - **An:** `{notiz.email}`
  - **Betreff:** „Ihr Termin – Bestätigung" (or similar calm line).
  - One-line German body, built **client-side, deterministically** from `notiz.name` /
    `notiz.termin` — greet the client by name and name the Termin. No extra model call,
    so it stays free and cannot fail.
  - Footnote: „In der Live-Version wird diese Bestätigung automatisch versendet."
  - Styling reuses existing tokens (`border-faden`, `bg-papier`, `text-stumm`,
    `text-tinte`, `font-serif`) — matches the Terminnotiz card. No brand words inside the
    mail, so the „Vrelo"/„Merak" italic rule does not apply.

### 4. Tests

- `src/lib/demo/summary.test.ts`: `parseNotes` extracts `email`; empty when absent;
  `EMPTY_NOTIZ.email === ""`.
- `src/components/demo/Protokoll.test.tsx`: the E-Mail row renders when present; the
  preview card appears only with an e-mail and is hidden without one.

## Out of scope (YAGNI)

- No real e-mail sending.
- No e-mail format validation.
- No storage / no PII persistence.
- No change to `/demo/summary/route.ts` logic (it passes `parseNotes` through untouched;
  the new field rides along automatically).

## Brand / compliance notes

- German client-facing copy; generic masculine; calm-over-hype voice.
- German quotes „…" (U+201E / U+201C), spaced en-dash „ – " — verify bytes after writing.
- Datenschutz stance unchanged: display-only, nothing stored or sent — no new privacy
  surface, so `datenschutz.ts` needs no change.
