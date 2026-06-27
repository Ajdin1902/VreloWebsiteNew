# Lead-Reaktions-Check — Design Spec

**Date:** 2026-06-27
**Route:** `/lead-check` (`vrelo-ki.de/lead-check`)
**Status:** design approved; ready for writing-plans.

## Goal

An interactive self-check (lead magnet, „reveal-the-problem“ type) for independent finance/insurance brokers. In ~2 minutes a broker answers 6 questions and sees, **gain-led**, how many more Abschlüsse + how much € are possible with his *current* inbox if he reacted in under 5 minutes — then a calm bridge to the *Termin-Quelle* and a booked call. It is the warm door-opener for outreach (Niche_Strategy → access is the binding constraint), not an SEO page.

**Content/strategy source of truth:** HQ `Knowledge/marketing/lead-magnet-reaktions-check.md`. Offer it points at: HQ `Knowledge/Offers/Termin-Quelle.md`. This spec adds the **quantitative model** and the **web implementation**.

## Brand & compliance

- German client copy; **generic masculine**; calm, first person, no hype; „…“ quotes (U+201E/U+201C), spaced en-dash „ – “ (U+2013). See `Brand.md` + CLAUDE.md *Gotchas*.
- *Vrelo*/*Merak* via `BrandWord`. *Merak* stays a felt result, never a product name.
- AA contrast per the documented token rules (no `text-stein` on petrol; amber-card link/error tokens; etc.).
- Honesty rule: every assumption in the calc is **shown in-product** and conservative.

---

## 1. The calc model (pure, fully specified)

All numbers below are **locked**. They live in `src/lib/leadCheck.ts`.

### Inputs (the 6 answers)

| # | id | type | values |
|---|---|---|---|
| 1 | `anfragenProWoche` | number | ≥ 0 (clamp absurd input to 200) |
| 2 | `reaktionszeit` | enum | `unter5min` · `unter1std` · `selberTag` · `1bis2tage` · `wennZeit` |
| 3 | `abendsWochenende` | enum | `immer` · `manchmal` · `nein` |
| 4 | `imTermin` | enum | `automatisch` · `wartet` · `gehtUnter` |
| 5 | `nachfassen` | enum | `mehrmals` · `einmal` · `selten` · `nie` |
| 6 | `provision` | number | optional; default **4000**; clamp to [100, 1_000_000] |

### Step 1 — base cold-loss by response time
Share of Anfragen that never become a Termin (calibrated to the HBR/InsideSales ~8–10× drop after the 5-minute mark):

| `reaktionszeit` | base loss |
|---|---|
| `unter5min` | 0.10 |
| `unter1std` | 0.25 |
| `selberTag` | 0.40 |
| `1bis2tage` | 0.60 |
| `wennZeit` | 0.75 |

### Step 2 — modifiers (percentage points, additive)
Speed isn't the whole leak:

| field | value | Δ |
|---|---|---|
| `abendsWochenende` | `immer` | +0 |
| | `manchmal` | +0.05 |
| | `nein` | +0.10 |
| `imTermin` | `automatisch` | +0.00 |
| | `wartet` | +0.05 |
| | `gehtUnter` | +0.10 |
| `nachfassen` | `mehrmals` | −0.10 |
| | `einmal` | +0.00 |
| | `selten` | +0.05 |
| | `nie` | +0.10 |

`currentLoss = clamp(baseLoss + Σ modifiers, 0.10, 0.85)`

### Step 3 — achievable floor
`ACHIEVABLE_LOSS = 0.10` (the <5-min, automatic, systematic-follow-up profile — not everyone is saveable).

### Step 4 — recoverable
- `anfragenProJahr = anfragenProWoche * 52`
- `recoverableShare = max(0, currentLoss − ACHIEVABLE_LOSS)`
- `recoverableTermine = round(anfragenProJahr * recoverableShare)`

### Step 5 — € upside (gain-led headline)
- `CLOSE_RATE = 0.20` (conservative, **stated in-product**: „selbst wenn nur jeder fünfte zurückgeholte Termin zum Abschluss wird“)
- `zusaetzlicheAbschluesse = round(recoverableTermine * CLOSE_RATE)`
- `eurUpside = zusaetzlicheAbschluesse * provision`

### Score band (on `currentLoss`)
- `schnell` ≤ 0.20 · `solide` 0.21–0.45 · `langsam` > 0.45

### Output shape
```ts
type LeadCheckResult = {
  currentLossPct: number          // rounded %, for display
  score: "schnell" | "solide" | "langsam"
  anfragenProJahr: number
  verloreneAnfragenProJahr: number // round(anfragenProJahr * currentLoss) — the "loss as context"
  recoverableTermine: number
  zusaetzlicheAbschluesse: number
  eurUpside: number
  provisionUsed: number
  provisionWasDefault: boolean
}
```

### Worked example (becomes a test)
10 Anfragen/Woche (520/yr), `selberTag` (0.40), `manchmal` (+0.05), `wartet` (+0.05), `einmal` (+0) → currentLoss 0.50 → `langsam`. recoverableShare 0.40 → 208 Termine → round(208 × 0.20) = 42 Abschlüsse → 42 × €4.000 = **€168.000** upside; verloreneAnfragenProJahr = round(520 × 0.50) = 260.

### Edge cases (tests)
- `anfragenProWoche = 0` → all results 0, no NaN, no division.
- `provision` omitted → uses 4000, `provisionWasDefault = true`.
- absurd `anfragenProWoche` (e.g. 5000) → clamped to 200 before compute.
- `unter5min` + `mehrmals` + `immer` + `automatisch` → currentLoss floored at 0.10 → recoverableShare 0 → upside 0, score `schnell` (honest: „du bist schon schnell“).

---

## 2. Question & result copy (German)

### Intro (page lead, `PageIntro`)
- Eyebrow/title: „Der Lead-Reaktions-Check“
- Lead: „In zwei Minuten siehst du, wie viele Abschlüsse mit deinem heutigen Posteingang mehr drin wären – wenn jede Anfrage sofort eine Antwort bekäme. Sechs Fragen, kein Login, dein Ergebnis sofort.“

### The 6 questions (labels + options)
1. „Wie viele Anfragen bekommst du im Schnitt pro Woche?“ *(Zahl-Eingabe)*
2. „Wie schnell antwortest du typischerweise auf eine neue Anfrage?“ — unter 5 Minuten · unter 1 Stunde · am selben Tag · 1–2 Tage · wenn ich dazu komme
3. „Bekommt eine Anfrage auch abends und am Wochenende eine Antwort?“ — immer · manchmal · nein
4. „Was passiert mit einer Anfrage, während du im Termin sitzt?“ — wird automatisch beantwortet · wartet, bis ich Zeit habe · geht manchmal unter
5. „Wie oft fasst du bei jemandem nach, der sich nicht meldet?“ — mehrmals, systematisch · einmal · selten · nie
6. *(optional, vorausgefüllt)* „Was ist dir ein abgeschlossener Kunde im Schnitt wert?“ — Zahl, Standard €4.000, Hinweis: „Wir rechnen mit dem Branchenschnitt. Ist dein Schnitt anders? Hier anpassen.“

### Result (gain-led)
- **Headline (gain):** „Mit einer Antwort in unter 5 Minuten wären bei dir rund **{zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr** drin – ≈ **€{eurUpside}**. Ohne eine einzige neue Anfrage.“ (Wenn Default-Provision: Zusatz „gerechnet mit €4.000 pro Abschluss – passt du den Wert an, wird die Schätzung genauer.“)
- **Score badge:** „Deine Lead-Reaktion: {schnell|solide|langsam}“.
- **Loss as context (smaller):** „Aktuell werden rund {currentLossPct}% deiner Anfragen kalt, bevor daraus ein Termin wird – das sind ≈ {verloreneAnfragenProJahr} im Jahr.“
- **„Wie wir rechnen“ (disclosure, einklappbar):** benchmark (HBR/InsideSales, 5-Minuten-Marke), die 20-%-Annahme, „bewusst konservativ gerechnet“. Honesty beat.
- **2–3 Sofort-Tipps:** eine feste 5-Minuten-Regel · eine einfache Auto-Antwort · eine feste Nachfass-Routine. Schließt mit: das **konsequent**, nachts, im Termin, bei **jeder** Anfrage zu tun, ist das Schwere.
- **Bridge + CTA:** „Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die *Termin-Quelle*.“ → primär: „15-Minuten-Gespräch buchen“ (Cal-Scheduler); sekundär: optionale „Zusammenfassung per Mail“.
- **`schnell`-Sonderfall:** kein €-Versprechen erfinden – „Du reagierst schon schnell. Dann geht es bei der *Termin-Quelle* eher darum, dass das so bleibt, auch wenn mehr reinkommt.“ → gleiche CTA.

All copy must be byte-verified for „…“ / en-dash after writing (Edit tool downgrades them).

---

## 3. Web architecture

### Files
- **`src/lib/leadCheck.ts`** — pure: input/result types, the question+option data (German copy as typed consts), `computeResult(answers): LeadCheckResult`, clamps, score. No React, no I/O.
- **`src/lib/leadCheckEmail.ts`** — pure: `buildLeadCheckEmail({ answers, result, email })` → `{ subject, text }`; input validation (email format) + honeypot/time-trap helpers, mirroring `src/lib/contact.ts`.
- **`src/app/lead-check/page.tsx`** — server shell: metadata + `robots: { index: false }`, `PageIntro` lead, renders `<LeadCheck/>`.
- **`src/app/lead-check/actions.ts`** — `submitLeadCheckEmail` Server Action: honeypot + time-trap, calls `buildLeadCheckEmail`, sends via Resend (`isContactConfigured()` gate → graceful „bald verfügbar“ if unset). Notify-to = existing `CONTACT_TO`; optional summary to the broker. Test mock per the Vitest-v4 constructable-mock gotcha.
- **`src/components/lead-check/LeadCheck.tsx`** (client) — orchestrator: step state, progress, runs `computeResult` on finish.
- **`src/components/lead-check/Question.tsx`** — one step (number input or option list); keyboard-accessible.
- **`src/components/lead-check/Result.tsx`** — gain-led result; uses `BrandWord`, `CTAButton`, `SchedulerEmbed`, disclosure.
- **`src/components/lead-check/ResultEmailForm.tsx`** — optional email capture (calls the Server Action); reuse the amber-card / on-light token rules.

### Data flow
1. Land → `PageIntro` + `LeadCheck` (step 0 intro/start).
2. 6 steps in client state; Q6 pre-filled 4000, „überspringen“ allowed.
3. Finish → `computeResult(answers)` (client) → `Result`.
4. `Result`: gain headline → score → loss context → disclosure → tips → bridge → **primary CTA Cal scheduler** + secondary optional email.
5. Email submit → Server Action → Resend (notify you with answers+result; optional summary to him).

### Error handling
- Calc is total: invalid/empty number → 0 path, never NaN; clamps applied pre-compute.
- Email: validate email; honeypot+time-trap reject silently as bots; show inline error (`signal-tief` on amber / `signal` on dark per gotchas); success state replaces the form.
- Resend unset → email field shows „bald verfügbar“; the check + Cal CTA still fully work.

### Config / env
- Cal: existing `NEXT_PUBLIC_CAL_LINK` + EU origin (`SchedulerEmbed`, already live).
- Email: reuse `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`. No new env required for v1.

---

## 4. Testing (TDD)

- **`leadCheck.test.ts`** — each response tier; modifier stacking; cap 0.85; floor 0.10; recoverableShare 0 when already fast; € math; score bands at boundaries (0.20/0.21/0.45/0.46); the worked example (→ 42 Abschlüsse / €168.000 / 260); edges (0 Anfragen; omitted provision→default+flag; absurd anfragen clamped).
- **`leadCheckEmail.test.ts`** — valid/invalid email; honeypot/time-trap; subject+text contain the score, €upside, and the 6 answers.
- **`actions.test.ts`** — Resend mock (constructable) sends when configured; graceful when unset; bot inputs rejected.
- **Components (RTL/jsdom)** — step navigation forward/back; skip Provision uses default; result renders **gain-led** (€ headline present, loss smaller); `schnell` path shows no invented €; email form optional + honeypot hidden.

---

## 5. Scope (YAGNI)

**In:** the route, the 6-step check, the pure model, gain-led result, optional email→notify, Cal CTA, `noindex`, full tests.
**Out (v1):** close-rate slider (fixed 20 %); newsletter signup; any DB/persistence; main-nav entry (direct-link door-opener — a link from `/leistungen` Termin-Quelle block can come later); A/B testing; multi-language. Visual polish via `Website:impeccable` during build (the spec sets structure + tokens, not pixel design).
