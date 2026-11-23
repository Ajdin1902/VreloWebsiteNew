# Prozess-Check v2, Plan 1: Website and fallback Vorab-Fahrplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/prozess-check` with the v2 questionnaire, the contact form with call consent, and a Vorab-Fahrplan PDF built from fixed blocks (the spec's fallback path), mailed in the Vrelo look. This works and ships on its own. Plan 2 adds the research run on server1.

**Architecture:** Pure answer model + copy in `src/lib/prozessCheck.ts`. A new folder `src/lib/vorabFahrplan/` holds the content shape (shared with Plan 2), the fixed blocks, the text guards, the react-pdf document and the mails. The server action validates the input, checks the sending caps in Upstash and sends internal mail #1. Then it renders the PDF and sends the visitor mail.

**Tech Stack:** Next.js 16.2.7 App Router, React 19, TypeScript, Vitest 4 + RTL, Resend 6, `@upstash/redis` (already installed), `@react-pdf/renderer` (new).

**Spec:** `docs/superpowers/specs/2026-11-23-prozess-check-v2-vorab-fahrplan-design.md` (read §4 to §7, §10, §11). Plan 2: `docs/superpowers/plans/2026-11-23-prozess-check-v2-plan-2-research.md`.

## Global Constraints

- Work on branch `feat/prozess-check-v2` cut from `main`. Never touch `docs/pages.md` (unrelated change on another branch). Commit the spec file in Task 1.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. On PowerShell 5.1 use `git commit -F <file>`.
- Run Vitest and `next dev` from `C:\…` (capital C). Keep `experimental.turbopackFileSystemCacheForDev: false` in `next.config.ts`.
- German copy: quotes „…“ only, no `–` or `—`, no „, und“, du-form, no €, no Vrelo price, no competitor name, no hype words (Brand.md). Components hold no German; copy lives in `src/lib/…` objects that the copy-guard tests walk.
- After writing German copy with the Edit tool, check the bytes (`grep -n '"' file` should show code quotes only; „ is U+201E, “ is U+201C).
- The PDF and the visitor mail never contain a price, a € sign, or the words „Fahrplan“ alone for the auto document. It is always „Vorab-Fahrplan“; the hand-made one is „dein ausführlicher Fahrplan“.
- Contact data (name, e-mail, phone) appears only in the mails. It never goes into logs, except the one recovery log of a failed internal mail (§10).
- No push to `main` until Ajdin has seen it on localhost and approved the copy.

## Review Focus

1. **A visitor who goes back and changes the picked areas.** Hours and the „nervt“ answer for areas no longer picked must disappear, so the result and the PDF never show an area the visitor removed. Test in Task 3.
2. **„Was noch?“ with junk** (one long string without commas, 30 names, emoji, a URL). Expect at most 8 programs in total, each ≤ 40 chars, URLs gone. Test in Task 2.
3. **Firma or Name with characters that break a filename or HTML** (`Müller & Söhne / GmbH`, `<b>`). Expect a safe filename `Vrelo-Vorab-Fahrplan-Mueller-Soehne-GmbH.pdf` and escaped HTML. Tests in Tasks 5 and 6.
4. **Upstash not configured or down.** The submit must still send internal mail #1 and the visitor PDF (fail open). Test in Task 7.
5. **The visitor picks exactly one area with 0 hours.** Total is zero, so the honest exit shows and no form appears. Test in Task 3.

---

### Task 1: Answer model v2 and the steps

**Files:**
- Modify: `src/lib/prozessCheck.ts` (types, `AREA_IDS`, labels, `STEPS`, `resultCopy`)
- Modify: `src/lib/prozessCheck.test.ts`
- Add to git: `docs/superpowers/specs/2026-11-23-prozess-check-v2-vorab-fahrplan-design.md`, this plan, Plan 2

**Interfaces:**
- Produces:
  - `type AreaId = "anfragen" | "angebote" | "auftraege" | "rechnungen" | "postfach" | "daten" | "erinnern" | "orga"`. `AREA_IDS` follows this order, which is also the tie-break order.
  - `type Kanal = "telefon" | "mail" | "formular" | "whatsapp" | "portal" | "papier"`, `KANAL_PRIORITY: readonly Kanal[] = ["mail","formular","whatsapp","telefon","portal","papier"]`
  - `type Menge = "bis5" | "5bis20" | "20bis50" | "mehr"`, `type Wer = "ich" | "buero" | "alle"`, `type Arbeitsort = "buero" | "unterwegs" | "beides"`
  - `type ProzessCheckAnswers = { bereiche: AreaId[]; stunden: Partial<Record<AreaId, number>>; nervt: AreaId; kanaele: Kanal[]; menge: Menge; wer: Wer; programme: string[]; arbeitstag: string; abende: Abende; versucht: Versucht; branche: Branche; team: Team; arbeitsort: Arbeitsort; website?: string }`
  - `PROGRAMM_CHIPS: readonly string[]` (max 12, spec §4.5)
  - `type StepId = "intro" | "bereiche" | "stunden" | "nervt" | "aufgabe" | "programme" | "arbeitstag" | "abende" | "versucht" | "branche" | "team" | "arbeitsort" | "website"` and `STEPS: readonly Step[]` in that order (the Step union is extended with kinds `"intro" | "multi" | "grid" | "choice" | "aufgabe" | "programme" | "text" | "url"`)
  - `activeSteps(a: Partial<ProzessCheckAnswers>): Step[]`. It drops `nervt` when fewer than 2 `bereiche` are picked.
  - `QUESTION_COUNT: number`, the number of question steps without `intro` when `nervt` is shown. It is used by `vorlagen.ts`.
  - `resultCopy(a)` is unchanged in shape and computed over `a.bereiche` only.

- [ ] **Step 1: Create the branch and commit the docs.** From `C:\Users\ajdin\Vrelo\Website`: `git switch main`, `git pull`, `git switch -c feat/prozess-check-v2`, then commit the spec and both plans (`docs: prozess-check v2 spec and plans`).
- [ ] **Step 2: Write failing tests** in `src/lib/prozessCheck.test.ts`. Replace the old 6-area fixtures with v2 answers.
  - `it("has eight areas in tie-break order")`: `expect(AREA_IDS).toEqual(["anfragen","angebote","auftraege","rechnungen","postfach","daten","erinnern","orga"])`
  - `it("skips nervt with one picked area")`: `activeSteps({bereiche:["anfragen"]}).map(s=>s.id)` does not contain `"nervt"`, and with two areas it does
  - `it("ignores hours of areas not picked")`: `bereiche:["anfragen"], stunden:{anfragen:3, orga:9}` gives `totalHours === 3` and `topAreas` ids `["anfragen"]`
  - `it("one area at zero hours is the honest exit")`: `fits === false`
  - `it("keeps the year line arithmetic")`: 9 h gives „rund 52 volle Arbeitstage“
  - Keep the existing copy-guard style checks (no `"`, no dashes, balanced „“, no currency) over `STEPS`, `AREA_LABEL`, `AREA_SENTENCE`, `RESULT_UI`, `PROGRAMM_CHIPS`.
- [ ] **Step 3: Run** `npx vitest run src/lib/prozessCheck.test.ts`. Expect FAIL (unknown ids, `activeSteps` not defined).
- [ ] **Step 4: Implement.** The labels for `angebote` and `postfach` come from spec §4.1 („Angebote schreiben und nachfassen“, „Das E-Mail-Postfach“), and so do their `AREA_SENTENCE`s (same tone as the six existing ones). The question labels come verbatim from spec §4. The intro step carries the intro copy from spec §4.0. The `website` step's hint is „Dann schaue ich sie mir für deinen Fahrplan an.“ Mark the new copy `// COPY: Ajdin approves`.
- [ ] **Step 5: Run** the test file. Expect PASS. Then run `npx tsc --noEmit`. Expect errors only in files Tasks 2 to 8 rewrite (components, `prozessCheckEmail.ts`, the action, `vorlagen.ts`). List them in the commit message body.
- [ ] **Step 6: Fix `vorlagen.ts` now.** Use `QUESTION_COUNT` instead of `STEPS.length`. Change the card to „Fünf Minuten, …“ and „5 Minuten · direkt auf der Seite“ and mention the Vorab-Fahrplan in `text`. Update `vorlagen.test.ts` to the new strings. Run it and expect PASS.
- [ ] **Step 7: Commit** `feat(prozess-check): v2 answer model and steps`.

### Task 2: Input guards

**Files:**
- Create: `src/lib/vorabFahrplan/guards.ts`, `src/lib/vorabFahrplan/guards.test.ts`

**Interfaces:**
- Produces:
  - `stripContacts(s: string): string` removes URLs (`http(s)://…`, `www.…`, bare `name.tld/…`), e-mail addresses and phone-like runs of ≥ 6 digits (with spaces, `/`, `-` or `+`). It collapses whitespace and trims.
  - `normalizePhone(raw: string): string | null` keeps digits and one leading `+`. It returns null when there are < 6 or > 20 digits.
  - `normalizeWebsite(raw: string): string | null` adds `https://` when no scheme is given, reuses `parseHttpUrl` from `src/lib/demo/fetchGuard.ts`, and rejects IP literals, `localhost` and hosts without a dot. It returns `u.origin + u.pathname`.
  - `parseProgramme(chips: string[], freeText: string): string[]` takes the chips that are in `PROGRAMM_CHIPS` plus the free text split on `,`, `;`, `/` and newline. Each name goes through `stripContacts`, gets trimmed, is cut to 40 chars and dropped if empty. Duplicates are removed case-insensitively. The result is capped at 8 names in total, chips first.
  - `capText(s: string, max: number): string`
  - `safeFilenamePart(s: string): string` turns `ä→ae, ö→oe, ü→ue, ß→ss` and replaces everything outside `[A-Za-z0-9]` with `-`, collapses runs, and cuts to 40 chars. An empty result becomes `"Betrieb"`.
- [ ] **Step 1: Write failing tests.** Cover each function with the Review Focus cases:
  - `stripContacts("Ruf an 0941 123456 oder info@x.de, www.x.de")` gives `"Ruf an oder ,"` collapsed. Assert that it has no digits run, no `@` and no `www`.
  - `parseProgramme([], "a".repeat(200))` gives one name of length 40.
  - `parseProgramme(PROGRAMM_CHIPS.slice(0,6), "x, y, z, q")` has length 8.
  - `parseProgramme([], "Lexoffice, lexoffice")` gives `["Lexoffice"]`.
  - `normalizePhone("+49 (941) 12-34 56")` gives `"+49941123456"`, and `normalizePhone("123")` gives `null`.
  - `normalizeWebsite("mueller-bau.de")` gives `"https://mueller-bau.de/"`, and `normalizeWebsite("http://127.0.0.1")` and `normalizeWebsite("localhost")` give `null`.
  - `safeFilenamePart("Müller & Söhne / GmbH")` gives `"Mueller-Soehne-GmbH"`.
- [ ] **Step 2: Run, expect FAIL. Step 3: Implement. Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(vorab-fahrplan): input guards`.

### Task 3: Wizard UI

**Files:**
- Modify: `src/components/prozess-check/ProzessCheck.tsx`, `HoursGrid.tsx` (takes `areas: AreaId[]`), `Question.tsx`
- Create: `src/components/prozess-check/MultiChoice.tsx`, `AufgabeStep.tsx`, `ProgrammeStep.tsx`, `TextStep.tsx`, `IntroStep.tsx`
- Modify tests: `ProzessCheck.test.tsx`, `HoursGrid.test.tsx`

**Interfaces:**
- Consumes: `STEPS`, `activeSteps`, `PROGRAMM_CHIPS`, `ProzessCheckAnswers` (Task 1).
- Produces: `<ProzessCheck calLink source />` (same props as today). When it finishes, it renders `<Result answers={final} …/>` with a complete `ProzessCheckAnswers`. `programme` is the raw chip picks plus the raw free text, kept as `programmeChips: string[]` and `programmeText: string` in component state. `parseProgramme` runs at submit (Task 8), and the result screen shows nothing about programs.

- [ ] **Step 1: Write failing tests** in `ProzessCheck.test.tsx`:
  - `it("starts on the intro and its button opens question 1")`: „Dein Vorab-Fahrplan in 5 Minuten“ is visible; click „Los geht's“, then „Wo möchtest du Hilfe?“ is visible.
  - `it("asks hours only for picked areas")`: pick two areas, then exactly 2 sliders.
  - `it("progress counts the conditional step")`: with one area, the progress text on the hours step reads „Frage 2 von N-1“, where N = `QUESTION_COUNT`.
  - `it("dropping an area drops its hours and nervt")`: pick A+B, set hours, pick nervt=B, go back to areas, unpick B, finish. The result does not show B's label.
  - `it("optional steps can be skipped")`: the Arbeitstag and Website steps have a „Überspringen“ button.
  - `it("one area at zero hours ends on the honest exit without a form")`
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.** Keep the card styling and the `role="status"` progress line of today's `ProzessCheck.tsx`. Multi-select uses checkbox semantics (`role="checkbox"`, `aria-checked`) and a „Weiter“ button that is disabled until at least one item is picked. The Aufgabe step is one screen with three groups (multi, choice, choice). Text steps cap input with `maxLength` (Arbeitstag 500, Website 200). Replace the old privacy line with spec §4.0's rewritten line: `RESULT_UI.privacyLine` = „Deine Antworten bleiben in deinem Browser, bis du dir den Vorab-Fahrplan schicken lässt.“
- [ ] **Step 4: Run** `npx vitest run src/components/prozess-check`. Expect PASS.
- [ ] **Step 5: Commit** `feat(prozess-check): v2 wizard`.

### Task 4: Fallback content blocks and the content shape

**Files:**
- Create: `src/lib/vorabFahrplan/content.ts` (shape), `src/lib/vorabFahrplan/blocks.ts` (fixed copy), `src/lib/vorabFahrplan/fallback.ts`, plus tests `blocks.test.ts` and `fallback.test.ts`

**Interfaces:**
- Produces (Plan 2 fills the same shape from research):
```ts
export type Quelle = { n: number; url: string; abgerufen: string /* dd.mm.yyyy */ };
export type Schritt = {
  rang: "Zuerst" | "Danach" | "Später";
  bereich: AreaId;
  titel: string;          // ≤ 40
  idee: string;           // ≤ 260
  mitProgrammen?: string; // ≤ 180, research only
  tipp?: string;          // ≤ 180, Zuerst only
  quellen: number[];      // ids into VorabFahrplan.quellen
};
export type ProgrammZeile = { name: string; zeilen: string[] /* ≤ 3 × ≤ 160 */; quellen: number[] };
export type VorabFahrplan = {
  firma: string; name: string; datum: string;
  stundenZeile: string;   // "Rund 9 Stunden pro Woche · 52 Arbeitstage im Jahr"
  arbeitstag?: string;    // quoted
  zeitVerteilung: { label: string; stunden: number; satz: string }[]; // ≤ 3
  aufgabeZeile: string;   // "kommt per Mail rein · 20 bis 50 pro Woche · macht das Büro"
  schritte: Schritt[];    // 1..3
  programme: ProgrammZeile[]; // empty in fallback
  quellen: Quelle[];      // empty in fallback, except tip sources
  recherchiert: boolean;  // false in fallback: no KI footer, no page 2
};
export const LIMITS: { titel: 40; idee: 260; mitProgrammen: 180; tipp: 180; programmZeile: 160; arbeitstag: 500 };
```
  - `buildFallbackPlan(a: ProzessCheckAnswers & { programme: string[] }, contact: { firma: string; name: string }, now: Date): VorabFahrplan`
  - `schrittOrder(a): AreaId[]` sets the order: nervt first (even at 0 h), then the other picked areas with hours > 0 by hours, at most 3 (spec §7.2).
- `blocks.ts` exports `AREA_IDEE: Record<AreaId, { titel: string; lang: string; kurz: string }>`, `KANAL_VARIANTE: Partial<Record<AreaId, Partial<Record<Kanal, string>>>>` (15 to 20 entries, the first sentence of `lang`) and `TIPPS: { programm: string; bereich: AreaId; text: string; quelle: string /* URL */ }[]` (10 to 15, chip programs only, each with a real vendor-doc URL that the implementer opened and checked).

- [ ] **Step 1: Draft the copy** in `blocks.ts`, following spec §7.2 and the example there. Zuerst uses `lang` with the channel variant swapped in as its first sentence (`KANAL_PRIORITY` picks the variant). Danach and Später use `kurz`. Run the `stop-slop` skill over the drafted strings. Mark the file `// COPY: Ajdin approves before go-live`.
- [ ] **Step 2: Write failing tests:**
  - `blocks.test.ts`: the copy guards (walk all strings: no `"`, no `–`/`—`, balanced „“, no currency, no „, und“, no word from `["skalieren","Game-Changer","KI-Magie","revolution"]`). Every `TIPPS[i].programm` is in `PROGRAMM_CHIPS`. Every `quelle` starts with `https://`. `KANAL_VARIANTE` has 15 to 20 entries. Every `lang` ≤ 260 and `kurz` ≤ 160.
  - `fallback.test.ts`:
    - the nervt area at 0 h is still `Zuerst`
    - two channels `["papier","mail"]` use the `mail` variant
    - a tip appears only under Zuerst, only for a program the visitor named, and its URL lands in `quellen` as `n: 1` with `schritte[0].quellen` `[1]`
    - `recherchiert === false`, `programme` is empty
    - `aufgabeZeile` lists all picked channels
- [ ] **Step 3: Run, expect FAIL. Step 4: Implement `fallback.ts`. Step 5: Run, expect PASS.**
- [ ] **Step 6: Commit** `feat(vorab-fahrplan): fixed blocks and fallback plan`.

### Task 5: The PDF

**Files:**
- Create: `src/lib/vorabFahrplan/pdf.tsx`, `src/lib/vorabFahrplan/pdf.test.ts`, `src/assets/fonts/` (Fraunces-Italic.ttf, PlusJakartaSans-Regular.ttf, PlusJakartaSans-Bold.ttf, from the official Google Fonts repos, OFL; add `OFL.txt`), plus the logo as PNG or SVG path data from the existing site asset
- Modify: `package.json` (add `@react-pdf/renderer`), `next.config.ts` (`outputFileTracingIncludes` for `"/prozess-check": ["./src/assets/fonts/*"]` and, for Plan 2, `"/api/prozess-check/deliver": ["./src/assets/fonts/*"]`)

**Interfaces:**
- Consumes: `VorabFahrplan` (Task 4).
- Produces: `renderVorabFahrplanPdf(p: VorabFahrplan): Promise<Buffer>` and `pdfFilename(firma: string): string`, which returns `Vrelo-Vorab-Fahrplan-${safeFilenamePart(firma)}.pdf`.

- [ ] **Step 1: Install.** Run `npm i @react-pdf/renderer`, then `npx tsc --noEmit` to check the types resolve.
- [ ] **Step 2: Write failing tests** (`// @vitest-environment node` at the top):
  - `it("renders a PDF")`: the output starts with `%PDF`.
  - `it("fallback fits one page")`: `pageCount(buf) === 1` for a fallback plan with 3 areas and a 500-char Arbeitstag. `pageCount` counts `/Type /Page` objects that are not `/Pages`; use pdf-lib only if react-pdf compresses the objects.
  - `it("researched plan fits two pages")`: build a `recherchiert: true` fixture with every field at its `LIMITS` max, 8 programs × 3 lines and 30 sources, then assert `pageCount(buf) <= 2`.
  - `it("has no price")`: the extracted text has no `€`. Skip text extraction if it's costly and assert this on the input strings instead.
  - `pdfFilename("Müller & Söhne / GmbH") === "Vrelo-Vorab-Fahrplan-Mueller-Soehne-GmbH.pdf"`
- [ ] **Step 3: Run, expect FAIL.**
- [ ] **Step 4: Implement** the layout from spec §7.1. Page 1 has the header, hours line, Arbeitstag quote, Zeitverteilung, Aufgabe line, Zuerst/Danach/Später and „Was jetzt kommt“. Page 2 is rendered only when `recherchiert` is true and holds „Deine Programme“, „Quellen“ and the footer „Recherchiert mit KI am <datum>. Angaben ohne Gewähr, Tarife und Funktionen ändern sich.“ Source numbers render as `[n]` after the claim. Use a white background, Petrol `#0a2538`/`#1b5063`, Amber `#d4a24c`, *Vrelo* in Fraunces italic and the body in Plus Jakarta Sans. Register the fonts with `path.join(process.cwd(), "src/assets/fonts/…")`. All „Was jetzt kommt“ copy and the footer go in `blocks.ts` as `PDF_UI` (copy guards apply).
- [ ] **Step 5: Run, expect PASS.** Write the two fixture PDFs to the scratchpad and open them. Check by eye that the fonts render, the umlauts show, the quotes are „“, and nothing overflows.
- [ ] **Step 6: Commit** `feat(vorab-fahrplan): react-pdf document`.

### Task 6: The mails in the Vrelo look

**Files:**
- Create: `src/lib/vorabFahrplan/mails.ts`, `src/lib/vorabFahrplan/mails.test.ts`
- Modify: `src/lib/prozessCheckEmail.ts`. Remove `buildSummaryEmail`, `buildInternalEmail`, `evaluateSubmission` and their types once Task 8 no longer imports them. Keep `validateEmail` and `escapeHtml`, or move them into `mails.ts` and re-export them. Update `prozessCheckEmail.test.ts` the same way.

**Interfaces:**
- Consumes: `VorabFahrplan`, `ProzessCheckAnswers`, `signaturHtml`/`signaturText` from `src/lib/email/signatur.ts`, `sourceLabel`.
- Produces:
  - `CONSENT_TEXT` (spec §6, the two sentences above the button plus the checkbox label) and `CONSENT_VERSION = "pc-call-2026-11-23"`. Both live in `blocks.ts` → `FORM_UI`.
  - `buildVisitorMail(p: VorabFahrplan, calUrl?: string): { subject: string; html: string; text: string }`. The subject is `Dein Vorab-Fahrplan, ${firma}`.
  - `type LeadContact = { name: string; firma: string; email: string; telefon: string; anrufOk: boolean }`
  - `buildLeadMail(x: { contact: LeadContact; answers: ProzessCheckAnswers & { programme: string[] }; source?: string; submittedAt: Date; status: "recherche" | "fallback" | "nicht-versendet"; grund?: string }): { subject: string; html: string; text: string; replyTo: string }`. The subject is `Neuer Lead: ${firma} · ${AREA_LABEL[nervt]}`. The body lists every answer, the contact data, `CONSENT_VERSION`, the consent sentence verbatim, the server timestamp, `sourceLabel(source)` and the status line.

- [ ] **Step 1: Write failing tests:**
  - visitor HTML contains `#f4efe6`, `#0a2538`, `#d4a24c`, the signature name, „Vorab-Fahrplan“ and the Zuerst title, and contains no `€`.
  - the Cal.com button is present only when `calUrl` is given.
  - the text part has the same facts as the HTML.
  - `<b>` in Firma is escaped in both mails.
  - the lead mail contains `pc-call-2026-11-23`, the consent sentence, and „nicht versendet“ plus the reason when status is `nicht-versendet`.
  - the copy guards over the fixed strings in `mails.ts`.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** with the frame and inline-style constants of today's `buildSummaryEmail` (`BODY_STYLE`, `SERIF`, the amber rule, the Petrol panel, the water one-liner). The content order is spec §10. The first name is the first token of `name`.
- [ ] **Step 4: Run, expect PASS. Step 5: Commit** `feat(vorab-fahrplan): branded visitor and lead mails`.

### Task 7: Sending caps

**Files:**
- Create: `src/lib/vorabFahrplan/caps.ts`, `src/lib/vorabFahrplan/caps.test.ts`

**Interfaces:**
- Consumes: `hashIp` pattern from `src/lib/demo/ratelimit.ts`. Reuse it as is; add `hashValue(salt, s)` beside it only if needed.
- Produces: `checkSendCaps(x: { ip: string; email: string }): Promise<{ ok: true } | { ok: false; grund: "adresse" | "ip" | "tag" }>`. The caps are spec §6: 1 per recipient per 30 days (key `pc:mail:<sha256(lowercased email)>`, TTL 30 d), 3 per IP per 24 h, 50 per UTC day. Counting happens only when the visitor mail will actually be sent. It fails open (missing env or a thrown error returns `ok: true`). Export the constants `CAPS = { proAdresseTage: 30, proIpTag: 3, proTag: 50 }`.

- [ ] **Step 1: Write failing tests** with `@upstash/redis` mocked (`vi.mock`):
  - the second send to the same address returns `grund: "adresse"`
  - the 4th send from one IP returns `"ip"`
  - the 51st send of the day returns `"tag"`
  - no env returns `ok: true`
  - `incr` throwing returns `ok: true`
  - the stored keys never contain the raw e-mail or IP
- [ ] **Step 2: Run, expect FAIL. Step 3: Implement. Step 4: Run, expect PASS. Step 5: Commit** `feat(vorab-fahrplan): sending caps`.

### Task 8: Server action, form and result screen

**Files:**
- Modify: `src/app/prozess-check/actions.ts` (rewrite), `actions.test.ts`
- Create: `src/components/prozess-check/VorabFahrplanForm.tsx`. Delete `ResultEmailForm.tsx`.
- Modify: `src/components/prozess-check/Result.tsx`, `Result.test.tsx`, `src/lib/prozessCheck.ts` (`RESULT_UI`: drop `emailLabel`/`emailIntro`, add `formTitle`, `calSecondary` „Lieber gleich einen Termin?“ and `success` from spec §6)

**Interfaces:**
- Consumes: Tasks 1, 2, 4 to 7. `isHoneypotTripped`, `isTooFast` and `EMAIL_RE`/`validateEmail` from the existing modules. `clientIp(req)` doesn't apply in a server action, so read `x-forwarded-for` via `headers()` from `next/headers` (first entry).
- Produces:
  - `submitVorabFahrplan(prev: VorabFahrplanState, formData: FormData): Promise<VorabFahrplanState>` with `type VorabFahrplanState = { status: "idle" } | { status: "ok" } | { status: "error"; message: string } | { status: "invalid"; errors: Partial<Record<"name"|"firma"|"email"|"telefon"|"anruf", string>> }`
  - `parseSubmission(fd: FormData): ParsedSubmission` (exported for Plan 2). It re-validates every enum with `pick()`, clamps hours, keeps only hours of picked areas, and runs `parseProgramme`, `capText(stripContacts(arbeitstag), 500)`, `stripContacts` on Firma and `normalizeWebsite`.
  - `sendLeadMailWithRetry(mail): Promise<boolean>`. It tries twice. On the second failure it does `console.error("prozess-check lead mail failed", JSON.stringify({ name, firma, email, telefon, submittedAt }))` and returns false. This is the one allowed contact-data log (spec §10).
  - Flow (Plan 1): honeypot leads to a silent `ok`. Too fast leads to `error`. Field errors lead to `invalid`. Unchecked consent leads to `invalid.anruf` (default per spec §6). Then `checkSendCaps`. Then the lead mail (`status: "fallback"`, or `"nicht-versendet"` plus the reason when capped). If capped, return `ok`. Otherwise `buildFallbackPlan`, then `renderVorabFahrplanPdf`, then the visitor mail with `attachments: [{ filename: pdfFilename(firma), content: pdf }]`. The lead mail carries the same attachment. A visitor-mail failure returns `error`. Plan 2 inserts the research branch between the caps check and the fallback.

- [ ] **Step 1: Write failing tests** in `actions.test.ts`, mocking `resend`, `caps` and `next/headers`, in the style of `src/app/bauplan/actions.test.ts`:
  - happy path: 2 sends; the visitor send has one attachment named `Vrelo-Vorab-Fahrplan-…pdf`; the lead mail goes first
  - missing phone returns `invalid.telefon`
  - consent unchecked returns `invalid.anruf` and nothing is sent
  - capped: only the lead mail is sent, it contains „nicht versendet“, and the status is `ok`
  - the lead mail fails twice: `console.error` is called once, and the visitor still gets the PDF
  - the honeypot returns `ok` with 0 sends
  - hours of unpicked areas sent in the form are ignored
- [ ] **Step 2: Write failing tests** in `Result.test.tsx`:
  - with hours > 0, the form shows the 4 fields, the consent text and the checkbox, and the Cal.com link reads „Lieber gleich einen Termin?“
  - with zero hours there is no form and the exit text is unchanged
- [ ] **Step 3: Run, expect FAIL. Step 4: Implement.** Put all the answers into the form as hidden inputs, the same way `ResultEmailForm` does, including `programmeChips` (one hidden input each) and `programmeText`. The form styling comes from `ResultEmailForm`. The Cal.com `SchedulerEmbed` becomes a secondary link below the form.
- [ ] **Step 5: Run** `npx vitest run` (the whole suite) and `npx tsc --noEmit`. Expect both green.
- [ ] **Step 6: Commit** `feat(prozess-check): Vorab-Fahrplan form and send flow`.

### Task 9: Page copy, Datenschutz, docs, localhost check

**Files:**
- Modify: `src/app/prozess-check/page.tsx` + `page.test.tsx` (hero sub-line and meta mention the Vorab-Fahrplan; the H1 stays), `src/lib/legal/datenschutz.ts` (the „Prozess-Check“ section)
- Modify (HQ, no git): `Knowledge/marketing/prozess-check-funnel.md` §3

- [ ] **Step 1: Rewrite the „Prozess-Check“ section in `datenschutz.ts`** for Plan 1's data. It covers name, company, e-mail, phone, website and answers; the purpose (the Vorab-Fahrplan PDF and one call); Resend; Upstash (hashed counters, spec §8.4); the consent to the call (Art. 6 Abs. 1 lit. a, revocable); and the retention pointer to „E-Mail-Kontakt“. Leave a clearly marked `// PLAN 2:` comment where the Anthropic and server1 paragraph goes. Adjust its test if it asserts the old text.
- [ ] **Step 2: Page copy + test.** Run `npx vitest run src/app/prozess-check`. Expect PASS.
- [ ] **Step 3: Full check.** Run `npx vitest run`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expect all green.
- [ ] **Step 4: Localhost.** Run `npm run dev` from `C:\Users\ajdin\Vrelo\Website`. Walk through the check twice: one area at 0 h, and 3 areas with a 500-char Arbeitstag and 8 programs. With `.env.local` pointing Resend at Ajdin's own address, submit and open the received mail and PDF. Screenshot both for Ajdin.
- [ ] **Step 5: Hand over for copy approval.** List every `// COPY: Ajdin approves` location. Do not push.
- [ ] **Step 6: Commit** `feat(prozess-check): page copy and Datenschutz for v2`. After merge, update `prozess-check-funnel.md` §3 (questions point to `STEPS`, the PDF to `src/lib/vorabFahrplan/`).
