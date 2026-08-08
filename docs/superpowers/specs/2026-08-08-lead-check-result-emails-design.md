# Lead-Check Result Emails – Design

**Date:** 2026-08-08 · **Status:** approved (visual mockup signed off by founder)
**Mockup:** Claude artifact „Lead-Check E-Mails – Design-Entwurf“ (approved 2026-08-08) – the HTML/copy below mirrors it.

## Problem

The `/lead-check` email capture promises the lead „Zusammenfassung per Mail“ and confirms „die Zusammenfassung ist unterwegs“ – but the Server Action only sends a **plain-text internal notification to `CONTACT_TO`**. The lead receives nothing. The internal mail is also an unformatted line list with the key numbers buried at the bottom.

## Goal

Two branded HTML emails per submission:

1. **Lead summary** (new) – German, brand-voiced HTML summary to the lead, main info (Abschlüsse + € upside) displayed centrally and first. Makes the on-page promise true.
2. **Internal notification** (reformatted) – HTML with the key numbers as KPI tiles up top and the answers as a table; richer subject line for inbox triage. Plain-text fallback kept.

## Architecture

All email construction stays in the pure module `src/lib/leadCheckEmail.ts` (no React/IO – same pure-core split as today). The Server Action `src/app/lead-check/actions.ts` sends both via Resend.

- `buildLeadSummaryEmail({ email, answers, result, calUrl })` → `{ to, subject, html, text }` (new)
- `buildLeadCheckEmail({ email, answers, result })` → gains an `html` field next to `text` (internal)
- `evaluateLeadCheckSubmission` returns both payloads on `action: "send"` (e.g. `{ leadEmail, internalEmail }`); honeypot / too-fast / validation logic unchanged.
- `calUrl` derivation: `NEXT_PUBLIC_CAL_LINK` is a **path** (SchedulerEmbed pins `calOrigin` to `https://cal.eu`), so the booking URL is `` `https://cal.eu/${calLink()}` ``. Derived in the action (env access), passed into the pure builder.

### Send flow (action)

1. Send the **lead summary first** – that is the promise on the page.
2. Then send the internal notification.
3. Failure semantics: lead-send failure → `{ status: "error" }` (user sees the existing generic error). Internal-send failure after a successful lead send → still `{ status: "ok" }` (the promise to the user was kept; don't fail the UI over our own notification). No PII in any logging.
4. `isContactConfigured()` gate unchanged.

## Email 1 – Lead summary

- **From:** `CONTACT_FROM` · **To:** the lead · no `replyTo` (replies land at kontakt@, which is `from`).
- **Subject:** `Dein Ergebnis: Lead-Reaktions-Check`
- **Only link in the mail = the Cal booking URL** (cal.eu – domain-cutover-independent). Never a site link while the site lives on `*.vercel.app`. If `NEXT_PUBLIC_CAL_LINK` is unset, the CTA button is replaced by the line „Antworte einfach auf diese E-Mail – dann melde ich mich.“ (band text stays).
- **Layout** (mirrors `src/lib/email/newsletter-confirm.ts` styling: papier `#f4efe6` body, 480px column, Georgia serif headings, Arial body, amber button, inline styles only):
  1. Centered eyebrow: `DEINE LEAD-REAKTION: {score}` (uppercase, letterspaced, stumm; score in navy).
  2. **Centered serif hero** (~25px, navy): „Rund **{zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr** – ca. **{eurUpside} €**.“ Centered sub-line: „Mit einer Antwort in unter 5 Minuten. Ohne eine einzige neue Anfrage.“
  3. Centered 44px amber rule.
  4. Loss context (left-aligned body from here on): „Aktuell werden rund {currentLossPct} % deiner Anfragen kalt, bevor daraus ein Termin wird – das sind ca. {verloreneAnfragenProJahr} im Jahr.“
  5. Fine print when `provisionWasDefault`: „Gerechnet mit 4.000 € pro Abschluss – dem Branchenschnitt.“ When the lead set a value: „Gerechnet mit {provisionUsed} € pro Abschluss.“
  6. „Wie wir rechnen“ box (lesepapier `#ece3d2`): the HBR/InsideSales honesty paragraph from `Result.tsx`, verbatim.
  7. „Drei Dinge, die du sofort tun kannst“ + the three bullets + „Das Schwere ist, das **konsequent** zu tun – nachts, im Termin, bei jeder Anfrage.“
  8. Petrol CTA band (`#1b5063`, rounded): serif „Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die Termin-Quelle.“ + amber button „15-Minuten-Gespräch buchen“ → Cal URL.
  9. Sign-off „Bis bald / Ajdin von *Vrelo*“ (brand word = serif italic `<em>`), hairline, footer: „Du bekommst diese E-Mail einmalig, weil du dir die Zusammenfassung deines Lead-Reaktions-Checks schicken lassen hast.“
- **`schnell` special case** (same rule as the result page – no invented € promise): hero = „Du reagierst schon schnell.“ / sub = „Dann geht es bei der Termin-Quelle eher darum, dass das so bleibt – auch wenn mehr reinkommt.“ **No € figure, no loss line, no provision fine print.** Tips heading becomes „Drei Dinge, die dein Tempo absichern“. Everything else identical.
- **Plain-text twin** with the same content order.

## Email 2 – Internal notification

- **From/To/replyTo:** unchanged (`CONTACT_FROM` → `CONTACT_TO`, replyTo = lead).
- **Subject:** `` `Lead-Check: ${email} – ${scoreLabel}` `` plus `` ` · ${eurUpside} €` `` when score ≠ `schnell`. (EMAIL_RE admits no whitespace → no header-injection surface.)
- **HTML:** 480px column on papier. KPI row as a **3-cell `<table>`** (email-safe, no flex): Potenzial/Jahr (navy tile, amber number) · Score · Verlust aktuell. Below: answers `<table>` – E-Mail, Anfragen/Woche, Reaktionszeit, Abends/Wochenende, Im Termin, Nachfassen, Provision (mit „(Standard)“-Zusatz), Verlorene Anfragen/Jahr, Zusätzliche Abschlüsse/Jahr – **enum answers rendered as their German labels** (single label map in the module, matching `STEPS` options). Closing line: „Der Lead hat seine Zusammenfassung bereits automatisch bekommen. Auf ‚Antworten' schreibst du ihm direkt.“
- **Escaping:** the lead's email address is the only user-controlled string in HTML → HTML-escape it. Numbers and enums are sanitized upstream (`pick()` / clamping).
- **Plain text** stays as fallback (today's format is fine there).

## Cross-cutting rules

- Numbers formatted with `Intl.NumberFormat("de-DE")`; non-breaking space before `€`.
- German copy rules apply (spaced en-dash „ – “ U+2013, „…“ quotes, generic masculine, calm voice); **byte-verify after every write** (Edit/Write downgrade smart quotes). Lead-facing copy gets a stop-slop pass.
- No AI label required: the check is deterministic (no AI), and the mail is a one-off, explicitly requested summary – not a broadcast. No unsubscribe link needed (transactional).
- No change to the scoring model, form UI, or validation flow.

## Testing

- Unit tests (Vitest) on the pure builders:
  - Normal case: html/text contain the de-DE-formatted € figure and Abschlüsse count, the Cal URL, the footer line; **no `vercel.app`** anywhere.
  - `schnell` case: no `€` figure, no loss line, keeps CTA band.
  - Provision default vs. custom fine print; missing `calUrl` → reply-line fallback, no `<a` button.
  - Internal: subject format (with/without €), email address HTML-escaped, German labels in the table.
- Action tests: two `emails.send` calls in lead-first order with correct to/replyTo; internal failure → `ok`; lead failure → `error`; honeypot/too-fast/invalid paths unchanged.
