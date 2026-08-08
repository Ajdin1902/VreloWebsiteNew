# 03 — Verdict

## REDESIGN

**`/makler` and `/lead-check` score 19/30 — one point below the REFINE threshold — and the failures cluster on two of the three named load-bearing dimensions (#4 understandable, #6 honest) plus #8 thorough, so the claim layer and the interaction layer must be rebuilt from purpose rather than iterated.**

## Why redesign and not refine

The Phase 3 rule is mechanical: total < 20 is REDESIGN, and this is 19. It would be dishonest to re-score to reach 20 when the evidence produced 19.

But the margin matters for *scope*, and pretending otherwise would be its own failure. This is **not** a visual redesign. The visual system scored 3/3 on both aesthetic and long-lasting, the structure is lean (12 elements on `/makler`, max 6 on screen during the quiz), the brand rules are enforced to zero violations, and the pages are genuinely handsome. Redesigning that would destroy the best work in the repo.

What has to be rebuilt from purpose is narrower and sharper:

1. **The claim layer** (#6 = 1). Two products that have never been delivered once carry absolute promises — „Aus jeder Anfrage wird ein Termin", „Du fragst nie wieder nach einer Unterlage", „Jede Anfrage bekommt in unter fünf Minuten eine Antwort. Darauf gebe ich mein Wort." The lead-check headline computes **156 additional closings and €624.000** for a solo broker from unsourced loss constants, while the disclosure beneath it calls the model „bewusst konservativ" and qualifies only the €4.000 per deal. This is not a wording pass; the numbers and the promises need re-deriving against what can actually be evidenced.

2. **The interaction layer of the quiz** (#4 = 1, #8 = 1). The primary control of the whole lead magnet — the answer option — has a **1.00 fill delta against its own card** and a **1.49:1 border**, i.e. no perceivable boundary. Focus is dropped to `<body>` after every one of six transitions, nothing is announced, and there is no skip link, so completing a six-question quiz by keyboard means re-traversing ten chrome controls six times. That is a structural rebuild of the wizard's semantics, not a CSS tweak.

The counterweight, stated plainly because it constrains the redesign: this codebase does honesty unusually well where it counts commercially. The result is not email-gated. Scarcity is explicitly de-escalated („ohne Countdown – es ist schlicht der Stand"). Cancellation terms are stated against interest. The „schnell" branch withholds a € figure precisely where showing one would pay. **Those instincts are the asset — the redesign should extend them to the claims, not overwrite them.**

## The five highest-leverage moves

1. **#6 honest — Re-derive the lead-check number and show its inputs.** The „langsam" branch yields „rund **156 Abschlüsse** mehr im Jahr drin – ca. **624.000 €**" for 20 inquiries/week. Either surface the loss constants (`BASE_LOSS` 0.10–0.75, the three modifiers, `ACHIEVABLE_LOSS`) inside „Wie wir rechnen" and cite the HBR/InsideSales study by name, author and year — or lower the model until the output survives a sceptical broker reading it on his phone. Evidence: `src/lib/leadCheck.ts:117-132`; `src/components/lead-check/Result.tsx:40-42,62-64`; measured output in 01 §C5.

2. **#6 honest — Fix the consent defect on the email capture.** The label promises one summary mail and „ich melde mich, wenn du magst"; submitting sends **two** mails, the second forwarding every answer plus the € valuation to Vrelo with the lead's address as `replyTo`. Add a Datenschutz link at the field and a real control matching „wenn du magst", or change the label to describe what actually happens. Evidence: label `src/components/lead-check/ResultEmailForm.tsx:36`, handler `src/app/lead-check/actions.ts:67-73`, internal mail `src/lib/leadCheckEmail.ts:160-227`.

3. **#4 understandable — Give the quiz answer options a perceivable boundary.** `bg-papier` options sit on a `bg-papier` card (fill delta **1.00**) with a `border-tiefes-wasser/20` edge at **1.49:1** — both fail WCAG 1.4.11's 3:1 for interactive boundaries. Same for the „Überspringen" ghost border (**1.84:1**) and the number input (**1.49:1**). Evidence: `src/components/lead-check/Question.tsx:8,12,68` against `src/components/lead-check/LeadCheck.tsx:40`; ratios in 01 §D.

4. **#8 thorough — Rebuild the wizard's step semantics.** Move focus to the new step heading on advance, wrap the options in a `radiogroup`/`fieldset` with the `<h2>` as its label, add an `aria-live` region for „Frage N von 6" and for the form error/success, and add a skip link. Today: focus lands on `<body>` after all six transitions, zero live regions exist, and the result view skips h1→h3 with the headline number as a `<p>`. Evidence: `src/components/lead-check/LeadCheck.tsx:27-41`, `Question.tsx:43-97`, `Result.tsx:39-42,69`; 01 §D1, §D2.

5. **#2 useful / #5 unobtrusive / #10 — Extend `focusRoutes` to `/lead-check`, or justify the exception in writing.** The project already built `ChromeGate` on exactly this reasoning — „for single-purpose outreach pages where every nav link is an exit before the CTA" — and applied it to `/makler` while leaving 19 exits and a second email capture around the lead magnet the outreach actually links to. Evidence: `src/lib/nav.ts:16`, `src/components/ChromeGate.tsx:14`, `src/components/Footer.tsx:38`; counts in 01 §A2.

## Two smaller corrections worth carrying

- **The 30-vs-15-minute contradiction.** `/makler` promises „Kostenloses Erstgespräch – 30 Minuten" (`makler.ts:66`, `:219`); the lead-check email CTA says „15-Minuten-Gespräch buchen" (`leadCheckEmail.ts:65`, `:122`). Neither is verified against the actual Cal event type. A prospect who sees both is being told two different things about the same call.
- **The unconfigured-scheduler fallback is a cul-de-sac.** With `NEXT_PUBLIC_CAL_LINK` unset the close renders „Schreib mir so lange einfach über das Kontaktformular" with **no link to it** on `/makler`, and on `/lead-check` the hint isn't overridden at all — it still says „Formular unten" where no contact form exists. Per `Website/CLAUDE.md` this is exactly the Vercel **Preview** state, so anyone reviewing a branch preview hits it. Make the fallback a link. Evidence: `SchedulerEmbed.tsx:17,30-37`; `makler.ts:220`; `Result.tsx:85`.

## What must be preserved

The visual system (3/3 aesthetic, 3/3 long-lasting), the brand-rule enforcement (zero violations across a codepoint scan of 24 files), the price discipline („rund 30 €" as the single permitted figure, test-guarded), the ungated result, the de-escalated scarcity, the against-interest cancellation terms, the no-JS `Reveal` fallback, and `focus-visible` on every control. See 04 for the explicit Preserve list.
