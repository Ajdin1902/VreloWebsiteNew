# Prozess-Check — Qualifikations-Quiz (Design)

**Date:** 2026-08-12
**Status:** design approved, pre-plan
**Route:** `/prozess-check` (new, `noindex`, direct-link-only focus route)

## Goal

A short, self-guided quiz that qualifies an unsure visitor for **Der Prozess-Audit**. Five questions
surface his own pain as he answers; the answers categorize him; the result mirrors his situation back
and tells him **honestly whether a call is a good fit** — then routes fitting visitors to the free
Erstgespräch (where the €499 audit is named). No numbers, no AI, no email capture.

## Why (strategic job)

- **Lowers the cost of the first „yes“.** A visitor who is not sure „gilt das für mich?“ answers five
  taps instead of committing to a call cold. By the last question he has talked himself into the pain.
- **Feeds the [Prozess-Audit](2026-08-11-prozess-audit-design.md) funnel** at its softest entry point —
  the `/leistungen` ProzessAudit block — without cannibalizing it (the audit still owns the calculated
  number) and without duplicating `/lead-check` (see below).
- **Own page so it travels.** A `/prozess-check` link can be dropped into outreach and posts later,
  the same way `/lead-check` and `/makler` are used.

### Distinct from `/lead-check` (must stay distinct)

`/lead-check` is a **broker-only speed-to-lead** diagnostic with a **€ scoring engine** (`leadCheck.ts`,
four commercial constants). The Prozess-Check is different on three axes and must remain so:

| | `/lead-check` | `/prozess-check` (this) |
|---|---|---|
| Audience | Makler / Finanzberater | general „kleiner Betrieb“ (du) |
| Output | quantified € upside | qualitative categorization + fit verdict |
| Job | prove a specific loss | qualify for the audit, surface the pain |

No € math here. Reusing the *wizard UI pattern* is intended; reusing the *scoring model* is not.

## Audience & voice

General small-business owner, `du`, generic masculine, calm brand voice (Brand.md). Matches the
`/leistungen` framing („deine Abläufe“), not the broker-specific `/makler`. German copy throughout;
quotes „…“ (U+201E/U+201C), Gedankenstrich = spaced en-dash „ – “ (U+2013).

## The mechanism (Hormozi Value Equation)

The quiz is a **diagnostic that agitates as it measures.** Each question does two jobs: surface one
slice of pain, and categorize. Mapped to Value = (Dream × Likelihood) ÷ (Time × Effort):

- **Dream Outcome ↑** — Q4 is the pure *Merak* anchor („abends mit nach Hause?“); the result paints the
  calm end-state.
- **Perceived Likelihood ↑** — the result names *his* task (Q1) and *his* consequence (Q3) back to him;
  specificity is the proof he is understood. Honest disqualification of poor fits (category D) makes the
  „yes“ verdict believable.
- **Time Delay ↓** — the result points at the audit → handbook in 1–2 Tagen.
- **Effort ↓** — five taps, ~60 Sekunden, no email, deterministic, done-for-you framing (Q5).

## The five questions

All single-tap `choice` steps. IDs are the stored answer keys.

1. **`aufgabe`** — identifies the build domain, surfaces repetition.
   „Welche Aufgabe machst du gefühlt jede Woche immer und immer wieder?“
   - `anfragen` — Anfragen beantworten und qualifizieren
   - `termine` — Termine ausmachen und hin- und herschieben
   - `angebote` — Angebote und Rechnungen schreiben
   - `nachfassen` — Hinterhertelefonieren und nachfassen
   - `daten` — Dieselben Daten von A nach B tippen
   - `nachrichten` — Immer die gleichen Nachrichten beantworten

2. **`zeit`** — severity, agitates the leak.
   „Wie viel Zeit frisst diese eine Sache – ehrlich geschätzt – pro Woche?“
   - `unter1` — unter 1 Stunde
   - `1bis3` — 1 bis 3 Stunden
   - `3bis5` — 3 bis 5 Stunden
   - `ueber5` — mehr als 5 Stunden

3. **`konsequenz`** — the hidden cost (strongest agitation).
   „Und wenn du mal nicht hinterherkommst – was passiert dann?“
   - `liegen` — Anfragen bleiben liegen oder springen ab
   - `termine` — Termine verrutschen oder gehen unter
   - `warten` — Kunden warten länger, als mir lieb ist
   - `nichts` — Nichts geht verloren, es kostet mich nur Zeit

4. **`abende`** — the *Merak* dream-outcome anchor.
   „Nimmst du solche Aufgaben abends oder am Wochenende mit nach Hause?“
   - `staendig` — Ja, ständig
   - `abundzu` — Ab und zu
   - `nein` — Nein, das lasse ich im Betrieb

5. **`versucht`** — positions done-for-you, flags „already running“.
   „Hast du schon versucht, das loszuwerden?“
   - `toolBrach` — Ein Tool gekauft, aber es liegt brach
   - `gebastelt` — Selbst etwas gebastelt, hält aber nicht
   - `garnicht` — Noch nicht, ich weiß nicht, wo ich anfangen soll
   - `laeuft` — Läuft schon teilweise automatisch

## Categorization (deterministic)

`categorize(answers)` returns one of four categories. Evaluated in this order:

1. **`versucht === "laeuft"` → C (Optimierung).** He already automates; the audit's job shifts from
   „anfangen“ to „rundmachen“. (Overrides severity — engagement is the signal.)
2. Else compute **severity** = `zeitPts + konsequenzPts + abendePts`:
   - `zeitPts`: unter1 = 0 · 1bis3 = 1 · 3bis5 = 2 · ueber5 = 3
   - `konsequenzPts`: nichts = 0 · (liegen | termine | warten) = 1
   - `abendePts`: nein = 0 · abundzu = 1 · staendig = 2
   - **severity === 0 → D** („Noch zu klein“ — unter1 + nichts + nein, the clear low-pain case)
   - **severity ≥ 3 → A** („Eine klare Quelle“)
   - **severity 1–2 → B** („Da steckt etwas drin“)

Boundaries are test-pinned (see Tests). The four categories are a closed enum.

## The result (mirrored reflection + fit verdict)

Each category renders: a **headline**, a **body** that interpolates his task noun (`aufgabe`) and a
consequence clause (`konsequenz`), a **fit verdict**, and a **CTA** (or, for D, no booking push).

**No numbers.** Time/evenings drive the *category*, never a restated figure. The body reflects severity
only in words.

### Interpolation strings

Task noun phrase by `aufgabe`:
- anfragen → „Anfragen beantworten“ · termine → „Termine ausmachen“ · angebote → „Angebote und
  Rechnungen“ · nachfassen → „Nachfassen“ · daten → „Daten von A nach B tippen“ · nachrichten → „immer
  die gleichen Nachrichten“

Consequence clause by `konsequenz` (used in A/B only; each carries its own leading connector so it
appends cleanly after the task noun):
- liegen → „ und Anfragen bleiben dabei liegen“ · termine → „ und Termine verrutschen dir“ · warten →
  „ und Kunden warten länger, als dir lieb ist“ · nichts → „ auch wenn dabei nichts verloren geht“

*Join note:* the clause appends directly after `[Aufgabe]` (A) or after „spürbar Zeit“ (B). The
implementer smooths any awkward seam (e.g. `aufgabe = anfragen` + `konsequenz = liegen` repeating
„Anfragen“); a stop-slop pass runs on the final assembled copy before shipping.

### Category copy

- **A · „Eine klare Quelle“** (strong fit)
  Body: „Du steckst Woche für Woche einen guten Teil deiner Zeit in [Aufgabe][Konsequenz]. Genau
  dafür ist der Prozess-Audit da: eine klare Quelle, die sich rechnen lässt.“
  Verdict: „Ein Erstgespräch lohnt sich für dich.“
  CTA: **Kostenloses Erstgespräch**.

- **B · „Da steckt etwas drin“** (fit, moderate)
  Body: „Diese eine Aufgabe – [Aufgabe] – kostet dich spürbar Zeit[Konsequenz]. Ob sich das
  Automatisieren für dich schon rechnet, zeigt dir der Audit schwarz auf weiß.“
  Verdict: „Ein Erstgespräch bringt dir Klarheit.“
  CTA: **Kostenloses Erstgespräch**.

- **C · „Bei dir läuft schon einiges“** (soft fit)
  Body: „Du automatisierst schon – dann geht es bei dir weniger ums Anfangen als ums Rundmachen. Ein
  kurzes Gespräch klärt, ob ein Audit dir noch etwas bringt oder ob du gut aufgestellt bist.“
  Verdict: „Ein kurzes Gespräch sagt dir, ob sich ein Audit lohnt.“
  CTA: **Kostenloses Erstgespräch**.

- **D · „Noch zu klein“** (honest not-yet — no booking push)
  Body: „Ehrlich? So wie es klingt, kostet dich das Ganze eher Nerven als echte Stunden – und es geht
  nichts verloren. Dann lohnt sich ein Audit für dich vermutlich noch nicht. Komm wieder, wenn eine
  Aufgabe dir wirklich den Tag frisst.“
  Verdict: „Ein Gespräch ist gerade noch nicht nötig.“
  Exit: **no scheduler** — a calm „Schau dich in Ruhe um“ with a soft link to the Newsletter („Die
  Quelle“) and/or the Ratgeber. No pressure.

## Routing / CTA mechanics

- **A / B / C** close on the free Erstgespräch by **embedding the shared `SchedulerEmbed`** directly on
  the result (resolved 2026-08-12 — mirrors `/lead-check`, lowest friction on a chrome-less focus route;
  reuses the tested EU-pinned embed with its `calLink`/`/kontakt`-fallback behaviour). C carries the same
  embed under its softer copy. The page component receives `calLink` from `NEXT_PUBLIC_CAL_LINK`, passed
  down to `Result`, exactly as `/lead-check` does.
- **D** gets no scheduler and no booking CTA — soft Newsletter/Ratgeber link only.
- **€499 never appears on the page** (§4 rule) — it is named in the call. The result sells the outcome.

## Placement, route & entry

- **New route `/prozess-check`** — a **focus route** (no site chrome): add to `focusRoutes` +
  `focusChrome` in `src/lib/nav.ts` with a **small Erstgespräch CTA in the `FocusHeader`** (resolved
  2026-08-12 — mirrors `/makler`; `focusChrome` gets a `cta` → `/kontakt`). `noindex`, absent from nav
  and `sitemap.ts` (join the `/lead-check`, `/demo`, `/makler` set).
- **Hero:** `PageHero` **reusing `/images/lead-check-banner.webp`** (resolved 2026-08-12 — no new asset;
  a dedicated image is a later polish, out of scope).
- **Entry point:** a **secondary line** on the existing `ProzessAudit` block (`/leistungen`) — e.g.
  „Nicht sicher, ob sich das lohnt? Mach den 60-Sekunden-Check.“ → `/prozess-check`. Mirrors how
  `/lead-check` is entered as a secondary CTA from `TerminQuelleAngebot`. The block's primary CTA
  (Erstgespräch) stays.

## Architecture (reuse the lead-check pattern)

- **`src/lib/prozessCheck.ts`** (pure core): `STEPS` (typed, mirrors `leadCheck.ts` shape), the answer
  types, `Category` enum, `categorize(answers): Category`, and the result-copy assembly
  (`resultCopy(answers): { category, headline, body, verdict, cta }`). Pure + deterministic, unit-tested.
- **`src/components/prozess-check/ProzessCheck.tsx`** (client): wizard state (`useState` index +
  answers), the polite `aria-live` „Frage n von 5“ counter — same accessibility shape as `LeadCheck.tsx`.
- **`src/components/prozess-check/Question.tsx`** — reuse/adapt the lead-check `Question` (choice-only;
  no number step needed → simpler). Prefer importing the existing one if its API fits.
- **`src/components/prozess-check/Result.tsx`** — renders `resultCopy` + the category-specific CTA/exit.
- **`src/app/prozess-check/page.tsx`** — `PageHero` + `ProzessCheck`; `metadata` with
  `robots: { index: false }`.

## Tests

- **Copy-guard** (`prozessCheck.test.ts`): walk every exported German string — fail on ASCII `"`,
  em-dash `—`, unbalanced „…“, and any currency/price token (`€`, `EUR`, digits-as-price). Mirrors
  `makler.test.ts`.
- **Scoring** (`prozessCheck.test.ts`): pin each category boundary — `laeuft` → C regardless; severity 0
  → D; severity 2 → B; severity 3 → A; and that `resultCopy` interpolates the right task/consequence
  strings and never emits a number.
- **Component** (`ProzessCheck.test.tsx`): advances through 5 questions, renders each category's result,
  D shows **no `SchedulerEmbed`** and no booking CTA (only the soft Newsletter/Ratgeber link), A/B/C
  render the embedded scheduler.

## Out of scope (deliberate)

- No email capture (unlike `/lead-check`) — it is a pure self-qualifier.
- No numbers / € math — the audit owns the calculated figure.
- No AI — advice, not a system → no Art. 50 duty (same posture as the audit).
- No new dependency; no new image asset (reuse an existing banner).
- The qualification quiz on `/leistungen` was parked in the Prozess-Audit offer doc — this resolves it,
  as its **own** page rather than inline.

## Compliance & brand

- **Art. 50 KI-VO:** none — the quiz is deterministic advice, carries no AI, makes no AI claim.
- **§4 price rule:** no Vrelo price on the page; the only figure the site may show publicly (server
  „rund 30 €“) is not relevant here and is not used.
- **Brand:** `du`, generic masculine, calm voice, German quotes + en-dash, verified at the byte level
  after every write (Edit/Write downgrade closing quotes).

## Resolved decisions (2026-08-12)

1. **A/B/C close:** embed the shared `SchedulerEmbed` on the result (not a `/kontakt` link).
2. **Focus-route header:** a small Erstgespräch CTA in the `FocusHeader` (mirrors `/makler`).
3. **Hero image:** reuse `/images/lead-check-banner.webp` (no new asset).
