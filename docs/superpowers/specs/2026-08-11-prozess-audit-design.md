# Der Prozess-Audit — paid discovery offer + Leistungen block

**Date:** 2026-08-11
**Status:** design approved, spec for review
**Scope:** a new packaged offer (a paid process audit that delivers a detailed process handbook), and the website change that introduces it on `/leistungen`.

---

## 1. What we're building

A productized, **paid** version of Phase-1 Discovery + the plan half of Phase-2. The client pays a fixed fee for a structured audit of their processes and receives a finished, branded process handbook. The fee is **fully credited** against any build that follows.

This is deliberately **Route A** (the tripwire audit), not Route B (teach-you-to-DIY consulting). The mechanism (Claude Code, n8n) never appears in the client's deliverable or on the site — it is *how Vrelo builds*, never something the client learns or operates. This keeps the offer on-brand with the north-star (§3a: „the client never has to maintain or understand the tech“) and with „Ergebnis vor Mechanik“ (Brand.md).

### Why this offer, now
- **Access is the binding constraint, not demand** (HQ §3). A small paid step is a low-commitment door — a broker says yes to a €499 audit far more easily than to a €2.000 build.
- It **monetizes discovery** that is currently given away free in the sales talk, and produces a warm, fully-mapped lead every time.
- It generates **cash now** in the validating stage.

### What changes in the business (name it explicitly)
Discovery becomes a **paid, deliverable-backed step**. The existing free Erstgespräch is redefined as *pre-discovery qualification* (fit + trust), **not** the audit itself — this protects the value now being charged for.

---

## 2. Commercial model

| Item | Decision |
|---|---|
| Name (Leistung) | **Der Prozess-Audit** |
| Deliverable | a detailed **process handbook / audit document** — „Dein Automatisierungs-Fahrplan“ (see §4), not a thin PDF |
| Price | **€499** net (+19 % MwSt), fixed |
| Credit | **Fully credited** against any build that follows — „die €499 rechne ich voll auf den Bau an“ |
| Guarantee | **„Zeigt dir der Fahrplan nicht mindestens eine konkrete, lohnende Automatisierung, bekommst du dein Geld zurück.“** Honest, low-risk (there is always at least one), kills the „was, wenn's nichts bringt?“-objection. Worded without the figure on the site (§4 no-price rule). |
| Session | one 60–90 min remote call, screen-share (see his real inbox / CRM / process) |
| Turnaround | process handbook delivered in **1–2 working days** |
| Payment | paid up front (it is the deliverable's trigger); standard invoice via `Clients/_kit` |

**Value-Equation check (HQ §8):** ↑ Dream Outcome (he *sees* the calm end-state in a diagram) · ↑ Perceived Likelihood (a finished, detailed handbook proves competence before he risks the build — plus the money-back guarantee) · ↓ Time Delay (1–2 days) · ↓ Effort/Sacrifice (full credit → the audit costs nothing if he builds). Lifts the numerator and cuts the denominator on every axis. Offer-audit against the Hormozi framework (2026-08-11): 7–8 on every Value-Equation axis; the gains folded here are packaging/framing, not mechanics — the guarantee, the stacked handbook, sharper outcome messaging, and the DIY guard.

---

## 3. The funnel

```
Website /leistungen (Prozess-Audit block, price-free)
  → kostenloses Erstgespräch  (fit + trust, NOT the audit — existing Cal link)
  → €499-Audit offered & priced verbally in that call
  → Audit-Session (60–90 min, screen-share)
  → Automatisierungs-Fahrplan / Prozess-Handbuch (1–2 Tage)
  → Bau (€499 fully credited)
```

The free call stays the site's CTA. The €499 is **never** shown on the website (HQ §4 rule, enforced by the copy-guard tests) — it is revealed in conversation, which is where it belongs.

---

## 4. The deliverable — „Dein Automatisierungs-Fahrplan“ (das Prozess-Handbuch)

**Not a thin PDF — a real, detailed process handbook / audit document** the client keeps: his business mapped, analyzed, and planned. Rendered through the existing `rendering-vrelo-documents` / `creating-process-one-pagers` kits so it matches the Angebot/Rechnung look. It **stacks five named, self-contained assets** so €499 visibly over-delivers (Hormozi: name and stack the value, don't ship „a document“):

1. **Prozess-Landkarte** — the client's current workflow mapped end-to-end (the 3–5 repetitive, time-eating tasks, in his own words).
2. **Die-Quelle-Analyse** — the single task that costs the most, and why it's first. Quantified („~X Std./Woche“ or „~Y verlorene Anfragen/Monat“).
3. **Ziel-Prozess-Diagramm** — a diagram of the calm end-state („so läuft es danach – ohne dich“). The Merak-Effekt made visual; the single most persuasive element.
4. **Der Fahrplan** — the step-1 build in plain German, then the ladder (2nd, 3rd task).
5. **Investitions-Übersicht** — indicative price + build window for step 1; the full-credit note.

Closes on one clear next step.

**Hard rules:**
- **The handbook is „der Plan für das, was ich dir baue“ — never an instruction manual.** It documents the current state, the priority, and the target; it does not teach the client to build or operate anything. This guards the done-for-you brand (§3a) against the DIY signal that „Handbuch“ can carry — the depth sells competence, it must not sell self-service.
- **Outcome-framed throughout.** Claude Code / n8n are never named — the mechanism is *how Vrelo builds*.
- **Human-review before sending** (it is AI-drafted; a named person is accountable for the client-facing artifact).

> The handbook template itself is **out of scope for this spec** — it is a `Clients/`-side deliverable built when the first audit is sold. This spec's build scope is the **website block only**. The structure is captured here so the offer is defined end-to-end.

---

## 5. Website scope (the only thing built now)

A new **Prozess-Audit block** on `/leistungen`, styled consistently with the existing offer blocks.

### Placement
Directly tied to the `MehrMoeglich` capstone, which already voices the free/vague version („gemeinsam finden wir heraus, was sich lohnt“). The Prozess-Audit is the concrete, structured answer to „ich weiß nicht, wo ich anfangen soll.“ Recommended position: **after `MehrMoeglich`, before `Referenzen`** — the reader has seen the flagship and the building blocks; the audit catches the still-undecided visitor with a structured on-ramp rather than a vague „let's talk.“

*(Alternative considered: directly under the flagship `TerminQuelleAngebot`. Rejected for v1 — it competes with the flagship for the top slot and interrupts the flagship → toolbox flow. The bottom-of-content on-ramp position is cleaner. Final visual placement to be confirmed live during the build, per the site's brainstorm→live-demo workflow.)*

### Content angle (draft copy — finalized during build under the copy-guard tests)
- Eyebrow/label: „Nicht sicher, wo du anfangen sollst?“
- Heading: „Der Prozess-Audit – ich finde die eine Aufgabe, die dich am meisten kostet.“
- Body: „Du merkst, dass Zeit und Anfragen durchrutschen – aber nicht, wo genau. Im Prozess-Audit schaue ich mir deine Abläufe an, finde die Aufgabe, die dich täglich am meisten Zeit kostet, und du bekommst ein fertiges Handbuch – mit einem Bild, wie dein Tag ohne sie aussieht. Wenn du danach baust, ist der Audit für dich kostenlos – und zeigt dir der Fahrplan nicht mindestens eine konkrete, lohnende Automatisierung, bekommst du dein Geld zurück.“
- CTA: existing „kostenloses Erstgespräch“ (Cal link / `/kontakt`).

**Messaging guardrails (Hormozi offer-audit, 2026-08-11):**
- **Kill the vague-outcome trap** — no „verborgenes Potenzial“ / „grow“ / „improve“ abstractions. Anchor on the felt, invisible lost-lead pain (Quote-Bank: his own inbox understates the loss) + the visible end-state.
- **Guarantee on the page**, always worded *without* the figure („bekommst du dein Geld zurück“).
- **Urgency stays calm** — the real urgency is „jede Woche ohne System sind weiter verlorene Anfragen“, stated once, quietly. No countdowns, no fake scarcity (breaks the brand).
- **Never a DIY signal** — the handbook is the plan for Vrelo's build, not the client's to-do list.

**Constraints (all test-guarded where a guard exists):**
- **No price on the page.** No „€499“, no currency token. The block must pass the same copy-guard the `/makler` and Ratgeber modules use. The full-credit promise is worded qualitatively („dann ist der Audit für dich kostenlos“), never with a figure.
- **No mechanism.** No „Claude“, „n8n“, „KI-Agent“ as a *thing the client operates*.
- **German typography.** „…“ quotes (U+201E/U+201C), spaced en-dash „ – “ (U+2013). Verify bytes after every write (Edit/Write downgrade the closing quote).
- **Generic masculine**, first-person „Ich“, calm-over-hype (Brand.md).
- Copy lives in a **typed copy module** (following `src/lib/termin-quelle.ts` / `makler.ts` pattern) — the component holds no German strings — with a matching copy-guard test.

### Component shape
A new presentational component (working name `ProzessAudit`) reading from a new copy module (`src/lib/prozess-audit.ts`), rendered inside a `Section` on the Leistungen page with the established `Reveal` + petrol/paper tone rhythm. Reuses `CTAButton` (default „Zeit zurückgewinnen“ or a Kontakt link) — no new CTA primitive. No new routes, no server logic, no data.

---

## 6. Out of scope (v1)
- The Fahrplan **PDF template** (built `Clients/`-side when the first audit sells).
- Any **payment/checkout** on the site (the audit is sold in the call + invoiced via `_kit`).
- A dedicated `/prozess-audit` page (a Leistungen block is enough for v1; promote to its own page only if outreach demand justifies it).
- `/makler` changes (the outreach page already closes on the scheduler; fold the audit into that conversation verbally for now — reassess after the first audits sell).
- Route B (teach-you-to-DIY consulting) — parked.
- **Qualifikations-Quiz — parked (2026-08-11), own brainstorm next.** A short on-page quiz so a visitor can self-check whether the audit is relevant for him / what he needs, before booking the call. Almost certainly reuses/extends the existing `/lead-check` 6-question quiz engine (`src/lib/leadCheck.ts` `computeResult` + the focus-route pattern) rather than a new build. Needs its own brainstorm → spec → plan; not part of this block.

## As-built notes (post-review, 2026-08-11)
- **Eyebrow is a sentence-case lead-in, not a pill badge** — a 34-char question in the flagship's uppercase amber pill read heavy and wrapped at 390px (code-review finding). Rendered as a quiet `gletscher` lead-in the heading answers.
- **Deliverable copy made specific** (founder request): the five inclusions name the target-state diagram, the exact build roadmap, the calculated business case (cost today vs. return), and the goal + timeframe — „a clear plan on what automation gives you“, not „a document“.
- **Second risk-reversal shipped:** „Dein Fahrplan gehört dir – ob du danach mit mir baust oder nicht.“ sits above the money-back guarantee (Hormozi bonus-stack pass — the one bonus that reads well on-page; the rest stay in the sales script). Full Grand Slam Offer treatment: `Knowledge/marketing/prozess-audit-offer.md`.

---

## 7. Success criteria
- A price-free, on-brand Prozess-Audit block is live on `/leistungen`, passing lint / tsc / build and its copy-guard test.
- The block routes to the existing free Erstgespräch CTA.
- No Vrelo price and no mechanism term appears anywhere on the page.
- HQ `CLAUDE.md` reflects the new offer (§4 offering list, §5/§7 as relevant) and the redefinition of the free Erstgespräch as pre-discovery qualification.
