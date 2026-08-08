# 04 — Handoff prompt

Copy the fenced block below into a fresh session. It is self-contained — the next session will not see this audit.

````
/make-plan Redesign the claim layer and quiz interaction layer of the Vrelo outreach surfaces `/makler` and `/lead-check` (repo: C:\Users\ajdin\Vrelo\Website). Current design failed a Dieter Rams audit at 19/30 with critical gaps in principles #4 (understandable), #6 (honest) and #8 (thorough).

Verdict paragraph (quoted from the audit):
> `/makler` and `/lead-check` score 19/30 — one point below the REFINE threshold — and the failures cluster on two of the three named load-bearing dimensions (#4 understandable, #6 honest) plus #8 thorough, so the claim layer and the interaction layer must be rebuilt from purpose rather than iterated.

Why redesign and not refine: the total is below the 20-point threshold, and #4 and #6 are load-bearing. But the scope is deliberately narrow — this is NOT a visual redesign. Aesthetic and long-lasting both scored 3/3 and must not be touched.

Context that constrains every decision:
- These two pages are where all 21 Tier-A outreach messages land. Both are gated on the domain cutover, which waits on the Steuernummer arriving by post. Everything fixable before that should be fixed now, so the cutover day is a sending day, not a writing day.
- The reader is a solo German Makler or Finanz-/Versicherungsmakler, non-technical, sceptical, in a ~130-firm word-of-mouth market. His standing objection (from the HQ quote bank) is „Das würde meinen Gewinn schmälern und neue Objekte gibt es mehr als genug."
- Both products advertised on `/makler` are specced but have NEVER BEEN DELIVERED ONCE. Zero paying clients in the niche.
- Brand rules are binding and currently at zero violations — German copy, generic masculine, calm-over-hype, „…" = U+201E/U+201C, spaced en-dash U+2013 never em-dash, *Vrelo*/*Merak* in Fraunces italic. No Vrelo price may appear; the client's server cost must read „rund 30 €" identically site-wide.
- In this market the real risk is a UWG §5 Abmahnung, not a regulator.

PRESERVE (do not touch — these scored 3/3 or are verified-clean):
- The entire visual system: 2 font families, 3 weights, the 9-step type scale, the 5-color palette with its alpha ramp, the 4/8 spacing rhythm, the full-bleed water photography and Fraunces serif standfirst with petrol drop-cap. `src/app/globals.css:1-45`, `src/components/PageHero.tsx`.
- Brand-rule compliance — a codepoint scan of 24 files found 0 ASCII quotes, 0 em-dashes in German copy, 0 gendered forms, 0 hype words, 0 competitor names, 0 Vrelo prices. `src/lib/makler.test.ts:43-53` guards the price rule. Regression check: re-run the codepoint scan and `npm test` after every copy edit.
- The result is NOT email-gated — `src/components/lead-check/LeadCheck.tsx:13-23` renders the full result before any address is asked. Regression check: complete the quiz with no email and confirm score, € figure, loss % and the three tips all render.
- Scarcity de-escalation: „Ich sage das einmal, ohne Countdown – es ist schlicht der Stand." `src/lib/makler.ts:188`.
- Against-interest cancellation terms: `src/lib/makler.ts:149,180-181`.
- The „schnell" branch deliberately carries NO € figure. `src/components/lead-check/Result.tsx:35`. Regression check: assert no euro token in that branch.
- `Reveal`'s no-JS fallback (hidden state gated behind `html.reveal-ready`) — `src/components/Reveal.tsx:12-19`.
- `focus-visible:` classes on every control (14/14 verified).

DISCARD (these caused the failures):
- Absolute product promises for undelivered products. Evidence: `src/lib/makler.ts:94` („Aus jeder Anfrage wird ein Termin"), `:120` („Du fragst nie wieder nach einer Unterlage"), `:176-177` („Jede Anfrage bekommt in unter fünf Minuten eine Antwort … Darauf gebe ich mein Wort"). Caused failure on principle #6. Note `makler.ts:94` is contradicted 8 lines later by the softer „Mehr Termine" at `:102-103`.
- The claim „Die Unterlagen deiner Kunden verlassen nie deine eigene Umgebung" (`src/lib/makler.ts:134`). Caused failure on #6 — the Document Concierge sanity check sends document images to Amazon Bedrock in the client's own AWS account, and the page never mentions AWS, Bedrock or any model call. For a product touching Gehaltsabrechnungen and SCHUFA this is the single most contestable sentence on the site.
- The undisclosed-input € model. Evidence: `src/lib/leadCheck.ts:117-132` (`BASE_LOSS` 0.10–0.75, three modifiers, `ACHIEVABLE_LOSS`) driving `src/components/lead-check/Result.tsx:40-42`. Caused failure on #6.
- Borderless interactive controls. Evidence: `src/components/lead-check/Question.tsx:8` (`bg-papier` option on the `bg-papier` card at `LeadCheck.tsx:40` — fill delta 1.00, border 1.49:1). Caused failure on #4 and #8.
- The unmanaged step transition. Evidence: `src/components/lead-check/LeadCheck.tsx:27-35` — `setIndex` unmounts the focused element with no focus move and no live region. Caused failure on #8.

Top 5 moves from the audit (verbatim):
1. #6 honest — Re-derive the lead-check number and show its inputs. The „langsam" branch yields „rund 156 Abschlüsse mehr im Jahr drin – ca. 624.000 €" for 20 inquiries/week. Either surface the loss constants inside „Wie wir rechnen" and cite the HBR/InsideSales study by name, author and year — or lower the model until the output survives a sceptical broker reading it on his phone. Evidence: `src/lib/leadCheck.ts:117-132`; `src/components/lead-check/Result.tsx:40-42,62-64`.
2. #6 honest — Fix the consent defect on the email capture. The label promises one summary mail and „ich melde mich, wenn du magst"; submitting sends two mails, the second forwarding every answer plus the € valuation to Vrelo with the lead's address as replyTo. Add a Datenschutz link at the field and a real control matching „wenn du magst", or change the label to describe what actually happens. Evidence: label `src/components/lead-check/ResultEmailForm.tsx:36`, handler `src/app/lead-check/actions.ts:67-73`, internal mail `src/lib/leadCheckEmail.ts:160-227`.
3. #4 understandable — Give the quiz answer options a perceivable boundary. `bg-papier` options sit on a `bg-papier` card (fill delta 1.00) with a `border-tiefes-wasser/20` edge at 1.49:1 — both fail WCAG 1.4.11's 3:1 for interactive boundaries. Same for the „Überspringen" ghost border (1.84:1) and the number input (1.49:1). Evidence: `src/components/lead-check/Question.tsx:8,12,68` against `LeadCheck.tsx:40`.
4. #8 thorough — Rebuild the wizard's step semantics. Move focus to the new step heading on advance, wrap the options in a radiogroup/fieldset with the `<h2>` as its label, add an aria-live region for „Frage N von 6" and for the form error/success, and add a skip link. Today: focus lands on `<body>` after all six transitions, zero live regions exist, and the result view skips h1→h3 with the headline number as a `<p>`. Evidence: `src/components/lead-check/LeadCheck.tsx:27-41`, `Question.tsx:43-97`, `Result.tsx:39-42,69`.
5. #2/#5/#10 — Extend `focusRoutes` to `/lead-check`, or justify the exception in writing. The project already built `ChromeGate` on exactly this reasoning — „for single-purpose outreach pages where every nav link is an exit before the CTA" — and applied it to `/makler` while leaving 19 exits and a second email capture around the lead magnet the outreach actually links to. Evidence: `src/lib/nav.ts:16`, `src/components/ChromeGate.tsx:14`, `src/components/Footer.tsx:38`.

Also carry these two smaller corrections:
- The 30-vs-15-minute contradiction: `/makler` promises „Kostenloses Erstgespräch – 30 Minuten" (`src/lib/makler.ts:66,219`); the lead-check email says „15-Minuten-Gespräch buchen" (`src/lib/leadCheckEmail.ts:65,122`). Neither is verified against the real Cal event type — verify first, then align.
- The unconfigured-scheduler fallback is a cul-de-sac: it names a Kontaktformular without linking it (`src/lib/makler.ts:220`) and on `/lead-check` the hint isn't overridden at all, still saying „Formular unten" where no contact form exists (`src/components/lead-check/Result.tsx:85` vs `SchedulerEmbed.tsx:17`). This is the Vercel Preview state, so branch reviewers hit it. Make it a link.

Out of scope for this redesign: the visual system, the palette, typography, imagery, page layout and section order; `/demo`; the 12 Ratgeber articles; the homepage; `/leistungen`; the legal pages. Do not restyle anything that scored 3.

Redesign principles in priority order:
1. Honest (#6) — every promise on the page is one that could be defended to a sceptical broker with zero delivered clients, and every number shows its inputs.
2. Understandable (#4) — a first-time non-technical reader names every control correctly and no label contradicts its behavior.
3. Thorough (#8) — the quiz is completable by keyboard and screen reader without losing your place, and every interactive boundary is perceivable.

Deliverables for the plan:
- A claim-by-claim rewrite table for `src/lib/makler.ts`: current wording → evidence available → proposed wording. Flag any claim that cannot be evidenced at all.
- A decision on the lead-check model: either the disclosure text that makes the current numbers defensible, or new constants with the reasoning written down. Note that `src/lib/leadCheck.ts` is a pure core with existing tests — TDD it.
- New wizard semantics: focus management, group roles, live regions, skip link — with the states checklist (empty, loading, error, success, focus, disabled) re-verified after.
- Non-text contrast fixes with computed ratios for every changed boundary (target ≥3:1).
- A regression checklist covering every Preserve item above.
- Migration note: none needed — both pages are `noindex`, direct-link-only, and not yet pointed at by live outreach.
- Cutover criterion: this work must land before the domain cutover, since the outreach links to these pages.

Anti-patterns to guard against:
- Porting the old claim structure under softer adverbs — „praktisch jede Anfrage" is not a fix; either evidence it or cut it.
- Restyling anything that scored 3 (aesthetic, long-lasting). The visual system is the best work in the repo.
- Letting the honesty pass drift into hedging that reads as weakness — the brand voice is calm and confident, not apologetic. Run prose through the `stop-slop` skill, with Brand.md winning on conflicts.
- Treating the Preserve list as optional.
- Fixing the quiz a11y with `aria-` attributes on divs instead of using the native `fieldset`/`radiogroup` semantics the markup already almost has (the options are already real `<button>` elements — build on that).
````
