# 02 — Scorecard

Scored by the orchestrator against the Phase 2 anchors. Tie-breaker: when uncertain between two levels, the lower was taken. Where a principle had multiple representative instances, the **worst** instance was scored, not the average. Equal weights, integers 0–3, max 30.

---

**1. Good design is innovative — Score: 2/3**
Evidence: 01 §C1–C4 (result ungated, scarcity de-escalated, „schnell" branch withholds the € figure), §C `Result.tsx:59-66` („Wie wir rechnen").
Justification: The quiz → € figure → book-a-call funnel is a stock lead-magnet pattern seen across many peer products, so not a 3; but the execution genuinely improves it by inverting the genre's dishonesty — disclosing the method, and refusing the € number in exactly the branch where showing one would pay. That is refreshing an existing pattern with a clear improvement, not imitation.

**2. Good design makes a product useful — Score: 2/3**
Evidence: 01 §A1 (`/makler`: 12 elements, one in-page CTA before the close, closes on inline booking), §A2 (`/lead-check`: 19 navigational exits around a 6-element task), §A3 (task begins 1,016 px down).
Justification: Both primary tasks complete and neither page carries decoy actions — `/makler` is close to a 3 on its own — but on `/lead-check` the adjacent surface demonstrably adds steps (three renderings of the same nav list, a second email capture in the footer), which is the definition of the 2 anchor rather than the 3.

**3. Good design is aesthetic — Score: 3/3**
Evidence: 01 §B (2 font families, 3 weights, 9-step type scale, 5-color palette with a disciplined alpha ramp, spacing on the 4/8 rhythm, radii 4/8/16/24 + pill), screenshots of the `/makler` and `/lead-check` heroes.
Justification: Spacing, type and color obey one visible system with no orphan styles — the two apparent outliers resolve as legitimate scale steps (10px = Tailwind `2.5`, 2px = `0.5`) and the 25.6px element is the documented `PageHero` drop-cap, not a stray override.

**4. Good design makes a product understandable — Score: 1/3**
Evidence: 01 §C Jargon (13 flags, incl. „Document Concierge", „Lead-Response-Forschung (HBR/InsideSales)", „Auftragsverarbeitungsvertrag", bare chips „Qualifizieren"/„Protokoll"); §C M2, M3, M5; §D non-text contrast — quiz answer-option **fill delta 1.00, border 1.49:1** (`Question.tsx:8` vs `LeadCheck.tsx:40`).
Justification: Well past „2–3 controls unclear; jargon present" — three labels contradict their behavior („Termin anzeigen" shows no Termin; „Überspringen" silently adopts €4.000; „Erstgespräch vereinbaren" needs a second click), the jargon lands on a deliberately non-technical audience, and the quiz's primary control has no perceivable boundary at all, so a first-time user may not read the options as controls.

**5. Good design is unobtrusive — Score: 2/3**
Evidence: 01 §A2 (`ChromeGate` strips nav on `/makler`; `/lead-check` keeps 19 links + 2 CTAs), §A R14 (two full email-capture forms on one page).
Justification: On `/makler` the chrome genuinely recedes and content is the figure — a 3 in isolation; scoring the worst instance, `/lead-check` surrounds a single-purpose lead magnet with visible-but-quiet navigation plus a competing second ask, which is the 2 anchor and not yet „decoration competes with content".

**6. Good design is honest — Score: 1/3**
Evidence: 01 §C I1–I9 (six-plus unbacked absolute claims for two never-delivered products), **I4** („verlassen nie deine eigene Umgebung" vs the Bedrock call, `makler.ts:134`), **C5** (€624.000 / 156 Abschlüsse on undisclosed loss constants while calling itself „bewusst konservativ"), **M4** (two mails sent, „wenn du magst" with no matching control, no Datenschutz link at the field), M1 (30 vs 15 minutes), M3.
Justification: Comfortably meets „2+ inflations", but explicitly **not** a 0 — the three enumerated deceptive flows are verified absent (result ungated, scarcity de-escalated „ohne Countdown", cancellation terms stated against interest), and the page repeatedly acts against its own commercial interest; the failure is unbacked claim strength, not manipulation.

**7. Good design is long-lasting — Score: 3/3**
Evidence: 01 §B (palette, type pairing), screenshots; `Brand.md` water/Papier identity.
Justification: No dated trend markers — no fad gradients, no skeuomorph residue, no trend typography; the full-bleed water photography and Fraunces standfirst are brand-anchored rather than era-anchored, and the one contemporary touch (a `backdrop-blur` sticky header) is minor chrome that would not date the page.

**8. Good design is thorough down to the last detail — Score: 1/3**
Evidence: 01 §D1 (focus never moved across **6** step transitions), §D2 (zero live regions; error and success never announced), §D (no `radiogroup`/`fieldset`/`aria-checked`; no skip link; `/makler` has **1** landmark and **zero** `<nav>` because `MaklerHeader`/`MaklerFooter` render inside `<main>`; heading skip h1→h3; placeholder contrast **4.31** fails; four interactive borders fail 1.4.11), §B4 (one image upscaled 1584→1905 and unoptimized, neither image lazy-loaded).
Justification: The six named states all nominally exist and several are wired correctly (`aria-invalid`/`aria-describedby`, no-JS fallback, `focus-visible` on 14/14 controls) — but they are present without being *considered*: nothing is announced, the primary control has no visible boundary, and focus is dropped to `<body>` after every one of six transitions, so a keyboard user re-traverses 10 chrome controls per question.

**9. Good design is environmentally friendly — Score: 2/3**
Evidence: 01 §B weight table — JS transfer **176 KB** / **179 KB**, total **361 KB** / **312 KB**, **18** / **17** requests, **0** idle animations, **0** third-party requests on load, **0** modals or badges, no autoplay, 4 `prefers-reduced-motion` rules.
Justification: Squarely the 2 anchor — well under 500 KB with motion properly gated and no attention-taxing chrome, but initial JS is 176 KB against the 3 anchor's 100 KB threshold; the absent dark mode was **not** penalised, as a single committed light identity is a brand non-negotiable rather than an oversight.

**10. Good design is as little design as possible — Score: 2/3**
Evidence: 01 §A2 (19 chrome links on a single-purpose lead magnet), §A R14 (second email-capture form in the footer); §A R5/R3/R8 and D1–D6 (code-level duplication and dead props, not user-visible).
Justification: Two removable user-visible elements, both on `/lead-check` and both traceable to one architectural decision (not extending `focusRoutes`) — the repeated `/makler` CTA and the thrice-stated data-locality claim were judged to earn their place on an 8.2-screen page answering three different broker questions, and the duplication in R3/R5/R8 plus the six dead props are maintenance debt rather than interface clutter.

---

## Total: **19 / 30**

| # | Principle | Score |
|---|---|---|
| 1 | innovative | 2 |
| 2 | useful | 2 |
| 3 | aesthetic | **3** |
| 4 | understandable | **1** |
| 5 | unobtrusive | 2 |
| 6 | honest | **1** |
| 7 | long-lasting | **3** |
| 8 | thorough | **1** |
| 9 | environmentally friendly | 2 |
| 10 | as little design as possible | 2 |
| | **Total** | **19 / 30** |

No principle scored 0. Three principles scored 1, two of which (#4 understandable, #6 honest) are named load-bearing dimensions in the Phase 3 rule.
