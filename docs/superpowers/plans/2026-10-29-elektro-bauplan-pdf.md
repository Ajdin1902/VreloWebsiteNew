# Bauplan für Elektrobetriebe (PDF) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A five-page branded PDF „Bauplan für Elektrobetriebe“ (lead magnet), rendered offline from an HTML template, copy-guarded by a Vitest test, reviewed by Ajdin before anything is committed under its final name.

**Architecture:** One HTML template `content/bauplan/elektro-bauplan.html` (kit convention: `{{{BRAND_CSS}}}` + `{{{LOGO_SVG}}}` placeholders, all non-ASCII as HTML entities), rendered by the kit renderer `../Clients/_kit/brand-pdf/render-doc.mjs` through a small Website script that also enforces the page count. The entity decoding of the existing Agentur-Bauplan guard moves into a shared helper so both guards use one map.

**Tech Stack:** HTML/CSS (kit `brand.css`), Node ESM script, puppeteer (inside the kit), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-29-elektro-bauplan-pdf-design.md` (read it fully; §4 is the page content, §6 the facts the copy must stay inside). Approved page-1 mockup: `docs/design/elektro-bauplan/page1-mockup.html`.

## Global Constraints

- Branch `feat/elektro-bauplan-pdf` from `main` (Website repo); never push without Ajdin's go.
- du-Ansprache, generic masculine, first person „ich“ where Ajdin speaks.
- No Gedankenstrich (U+2013/U+2014), ranges with „bis“; no comma before „und“; German quotes „…“ written as `&#8222;…&#8220;`.
- Template is pure ASCII: every non-ASCII character as an entity that the shared `ENTITIES` map decodes (add new ones there first).
- No price, no €/Euro, no durations (no „Wochen“, „Tage(n)“, „Monat(e)“), no running costs, no SEO agent.
- No client or Power-Connect specifics: Power-Connect, Öksüz, MDZ, Velp, Alen, Bergisch Gladbach, Benetics, Vodafone, SEO, Frankfurt.
- AI location always „innerhalb der EU“; never claim an interface for Rexel or FEGA & Schmitt; never „alle/jeder Großhändler“.
- A4 portrait, exactly **5 pages**, visible white space on every page; when a page is full, shorten copy, never shrink type below the mockup sizes.
- Client PDFs use a white page background (Brand exception); *Vrelo* in Fraunces italic.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; in PowerShell use `git commit -F <file>`.
- Nothing under its final name is committed before Ajdin approved the rendered PDF (Task 5).

## Review Focus

1. **Content overflowing a page** (a sixth page, a heading alone at a page foot): a reader expects five calm pages. → the page gate in Task 2's script fails on anything but 5; Task 4 adds a visual check for orphan headings.
2. **Google Fonts not loading at render time** (offline, slow network): the PDF silently falls back to a system serif and *Vrelo* loses Fraunces italic. → Task 3 Step 6 checks the wordmark in the rendered PDF.
3. **The source link not clickable in the PDF** (the 61 % is only credible if it can be followed). → Task 3 Step 6 clicks it in a PDF viewer.
4. **Edit/Write tools downgrading quotes or decoding entities into literal characters**: the template must stay ASCII. → the guard's „decodes every entity“ and an ASCII-only assertion (Task 1).
5. **Page 1 drifting from the approved mockup** (type smaller, order changed, cards instead of the list). → Task 3 Step 6 compares side by side with the mockup; the guard pins the page-1 element order.

---

### Task 1: Shared template-text helper + the Elektro guard (red)

**Files:**
- Create: `src/lib/bauplanTemplateText.ts`
- Modify: `src/lib/bauplanTemplate.test.ts` (use the helper, drop its local map and decoding)
- Create: `src/lib/elektroBauplanTemplate.test.ts`

**Interfaces:**
- Produces: `ENTITIES: Record<string, string>` (the existing map plus `"&#167;": "§"`), `templateText(html: string): string` (strip comments, `<style>`, tags; decode entities), `partHeadings(html: string): string[]` (decoded text of every `<h2 class="part">`).

- [ ] **Step 1:** Create the branch `feat/elektro-bauplan-pdf` from `main`.
- [ ] **Step 2:** Move the map and decoding from `bauplanTemplate.test.ts` into `bauplanTemplateText.ts` with the three exports above; the Agentur test imports them, behaviour unchanged.
- [ ] **Step 3:** Run `npx vitest run src/lib/bauplanTemplate.test.ts`. Expected: all 5 tests PASS (refactor is behaviour-neutral).
- [ ] **Step 4: Write the Elektro guard** `src/lib/elektroBauplanTemplate.test.ts`, reading `content/bauplan/elektro-bauplan.html`, `text = templateText(html)`. Tests, grouped:

  `describe("template")`:
  - `decodes every entity`: `text.match(/&#?\w+;/g) ?? []` equals `[]`.
  - `stays ASCII`: `/[^\x00-\x7F]/.test(html)` is false.
  - `has five pages`: `(html.match(/<section class="page/g) ?? []).length === 5`.

  `describe("page 1")` (text of the first `<section class="page` only):
  - contains, in this order: `"Bauplan für Elektrobetriebe"`, `"Mehr Büro als Baustelle?"`, `"Heute"`, `"Mit dem Büroassistenten"`, `"61 %"`, `"Der Weg in fünf Stufen"`, `"Drei Regeln, die immer gelten"`.
  - contains `"Durch Bürokratie bleibt weniger Zeit für die Aufträge."` and `"Handwerkskammer Dortmund"` and `"hwk-do.de"`.
  - `html` contains `href="https://www.hwk-do.de/wp-content/uploads/2023/10/HWK-Pressedienst-57-Konjunktur-Sonderumfrage_Buerokratiebelastungen-im-Handwerk.pdf"`.
  - contains the three rules verbatim: `"Nichts Verbindliches ohne deine Freigabe."`, `"Preise rechnet ein fester Rechenschritt, nicht die KI."`, `"Alles läuft auf deinen Namen."`.
  - the stages are a list, not cards: page-1 html contains `<ol` and no `class="tiles"`.

  `describe("pages 2 to 5")`:
  - `partHeadings(html)` contains, in order, headings starting with `"So arbeitet der Assistent"`, `"Stufe 1"`, `"Stufe 2"`, `"Stufe 3"`, `"Stufe 4"`, `"Stufe 5"`.
  - names the reader's tools: each of `sevDesk`, `Lexware`, `Label`, `TopKontor`, `ELDIS`, `Sonepar`, `Rexel`, `Obeta`, `FEGA & Schmitt`, `Alexander Bürkle`, `Datanorm`, `IDS Connect`, `OpenMasterData` occurs.
  - DSGVO and roles: contains `"innerhalb der EU"`; matches `/Telegram[^.]*keinen? Auftragsverarbeitungsvertrag/`; contains `"Freigeben"`.
  - Art. 50: matches `/meldet sich als KI-Assistent/` and contains `"KI-Verordnung"`.
  - closing: contains `"Alles gehört dir"`, `"Hörst du mit mir auf, läuft es weiter."`, `"Für einen Hausmeisterservice läuft ein Sprachassistent nach diesem Muster."`, `"Wenn du magst, schauen wir zusammen, welche Stufe bei dir zuerst dran ist."`, `"ajdin@vrelo-ki.de"`, `"0176 4380 6085"`.

  `describe("whole document")`:
  - `findCopyIssues(text)` equals `[]` (from `./ratgeberCopy`).
  - no price or duration: `text` does not match `/€|\bEuro\b|\bnetto\b|\bWochen\b|\bTagen?\b|\bMonate?n?\b/`.
  - no client specifics: does not match `/Power-Connect|Öksüz|\bMDZ\b|Velp|\bAlen\b|Bergisch|Benetics|Vodafone|\bSEO\b|Frankfurt/`.
  - no over-claim: does not match `/\b(alle|jeder|jedem)\s+(Elektro)?[Gg]roßhändler/`.
- [ ] **Step 5:** Run `npx vitest run src/lib/elektroBauplanTemplate.test.ts`. Expected: FAIL with ENOENT on `content/bauplan/elektro-bauplan.html`.
- [ ] **Step 6: Commit** helper, refactored Agentur test, new guard (`test(bauplan): shared template helper + Elektro guard`).

### Task 2: Render script with page gate

**Files:**
- Create: `scripts/render-elektro-bauplan.mjs`
- Modify: `package.json` (script `"bauplan:elektro": "node scripts/render-elektro-bauplan.mjs"`)

**Interfaces:**
- Consumes: `../Clients/_kit/brand-pdf/render-doc.mjs <template> <out>` (spawned with `cwd` = kit dir, like `build-bauplan-pdf.mjs`), `../Clients/_kit/fahrplan/check-pages.mjs <pdf> <n>` (exit 0 only on exactly n pages).
- Produces: `npm run bauplan:elektro` → renders to `.preview/elektro-bauplan.pdf` (gitignored), runs the page gate with `5`, exits non-zero if render or gate fails. `npm run bauplan:elektro -- --publish` additionally copies the review PDF to `../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf`, only if the gate passed.

- [ ] **Step 1:** Write the script: header comment in the style of `build-bauplan-pdf.mjs` (offline step, never in the Vercel build; no file under `public/` until the landing page exists, spec §7). Fail early with a clear message if the kit renderer is missing.
- [ ] **Step 2:** Add the npm script.
- [ ] **Step 3:** Run `npm run bauplan:elektro` without a template. Expected: renderer error about the missing template, non-zero exit, no file under `../Knowledge/Offers/`.
- [ ] **Step 4: Commit** (`feat(bauplan): render script for the Elektro-Bauplan`).

### Task 3: Template head + page 1

**Files:**
- Create: `content/bauplan/elektro-bauplan.html`

**Interfaces:**
- Consumes: the guard from Task 1, the script from Task 2, the mockup `docs/design/elektro-bauplan/page1-mockup.html`, the Agentur template for head, fonts, `{{{BRAND_CSS}}}`/`{{{LOGO_SVG}}}` usage and page CSS.
- Produces: the template with its rules comment (copy rules from Global Constraints + „add an entity to `bauplanTemplateText.ts` before using it“), `<title>Vrelo &#183; Bauplan f&uuml;r Elektrobetriebe</title>`, five `<section class="page">` blocks (pages 2 to 5 empty for now), page 1 complete.

- [ ] **Step 1:** Write the head and page 1 from spec §4 „Page 1“, in the mockup's order and proportions: header line (logo + *Vrelo*, „Bauplan für Elektrobetriebe“), headline, subline, the Heute | Mit dem Büroassistenten columns (four paired bullets), the 61 % statistic with the source line and the `hwk-do.de` link, „Der Weg in fünf Stufen“ as an `<ol>`, the „Drei Regeln“ box, footer „Ab Seite 2: jede Stufe im Detail · Ajdin Dzafic, Vrelo, Regensburg“. Mockup font sizes are the floor.
- [ ] **Step 2:** Run `npx vitest run src/lib/elektroBauplanTemplate.test.ts -t "template|page 1|whole document"`. Expected: PASS (the four empty page sections from Step 1 satisfy `has five pages`); `pages 2 to 5` still FAIL, which is expected.
- [ ] **Step 3:** Run `npm run bauplan:elektro`. Expected: PDF written; gate prints a page count (FAIL on count is fine while pages 2 to 5 are empty).
- [ ] **Step 4:** Open `.preview/elektro-bauplan.pdf` page 1 next to the mockup (`docs/design/elektro-bauplan/page1-mockup.html` in a browser). Expected: same order, list not cards, nothing smaller than the mockup, visible white space at the foot.
- [ ] **Step 5:** Check *Vrelo* renders in Fraunces italic (not a system serif) and that clicking `hwk-do.de` in the PDF opens the HWK press release.
- [ ] **Step 6: Commit** (`feat(bauplan): Elektro-Bauplan page 1`).

### Task 4: Pages 2 to 5

**Files:**
- Modify: `content/bauplan/elektro-bauplan.html`

**Interfaces:**
- Consumes: spec §4 pages 2 to 5 (content), §6 (limits), the `<h2 class="part">` convention the guard reads.

- [ ] **Step 1:** Page 2 „So arbeitet der Assistent“ (flow strip, the Familie-Berger scene as a set-off panel, why one assistant, mehrere Nutzer) + „Stufe 1: Fundament“.
- [ ] **Step 2:** Page 3 „Stufe 2: Betriebsgehirn“ (incl. the Zählerschrank example) + „Stufe 3: Angebote und Rechnungen“ (sevDesk example; Lexware, Label, TopKontor; the honest tariff line).
- [ ] **Step 3:** Page 4 „Stufe 4: Großhandel“ (ELDIS example; Sonepar, Rexel, Obeta, FEGA & Schmitt, Alexander Bürkle named; Datanorm, IDS Connect, OpenMasterData each in one plain line; availability caveat; „Welche Schnittstelle dein Großhändler anbietet, klären wir vor dem Start.“).
- [ ] **Step 4:** Page 5 „Stufe 5: Ausbau“ (four modules; phone assistant „meldet sich als KI-Assistent, so verlangt es die KI-Verordnung“) + Schluss (ownership lines, Hausmeisterservice proof, the next-step sentence, contact line).
- [ ] **Step 5:** Run `npx vitest run src/lib/elektroBauplanTemplate.test.ts src/lib/bauplanTemplate.test.ts`. Expected: all PASS.
- [ ] **Step 6:** Run `npm run bauplan:elektro`. Expected: `.preview/elektro-bauplan.pdf: 5 page(s), expected 5 -> OK`.
- [ ] **Step 7:** Page through the PDF. Expected: no heading alone at a page foot, no page filled edge to edge, no page with only a few lines. If a page is full, shorten copy (spec §4 note), re-run Steps 5 and 6.
- [ ] **Step 8: Commit** (`feat(bauplan): Elektro-Bauplan pages 2 to 5`).

### Task 5: Copy pass, Ajdin's review, publish, docs

**Files:**
- Modify: `content/bauplan/elektro-bauplan.html` (copy fixes only)
- Modify: `CLAUDE.md` (Website; one bullet under the Bauplan entry)
- Modify: `../CLAUDE.md` (HQ, not a git repo; one line in §2.2)
- Create (on approval): `../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf`

- [ ] **Step 1:** Run the `stop-slop` skill over the decoded text of all five pages; apply fixes in the template (Brand.md wins on conflict). Re-run the guard and `npm run bauplan:elektro`. Expected: tests PASS, gate OK.
- [ ] **Step 2:** Run the full suite `npm test`. Expected: PASS.
- [ ] **Step 3: Review gate.** Send Ajdin the path `.preview/elektro-bauplan.pdf` and wait. Apply his changes, repeat Steps 1 to 2 until he approves. Do not proceed without his explicit OK.
- [ ] **Step 4:** Run `npm run bauplan:elektro -- --publish`. Expected: gate OK and `../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf` exists.
- [ ] **Step 5:** Website `CLAUDE.md`: one bullet „Bauplan für Elektrobetriebe (2026-10-29): PDF only, template `content/bauplan/elektro-bauplan.html`, `npm run bauplan:elektro` (review copy in `.preview/`, `--publish` copies to `Knowledge/Offers/`), guard `elektroBauplanTemplate.test.ts`; landing page not built yet, then a hashed copy under `public/bauplan/` like the Agentur-Bauplan. Spec + plan dated 2026-10-29.“ HQ `CLAUDE.md` §2.2: one line pointing to the spec and the shareable PDF.
- [ ] **Step 6: Commit** template fixes, spec, plan, mockup and Website `CLAUDE.md` (`feat(bauplan): Elektro-Bauplan PDF, reviewed`). Push only on Ajdin's go.
