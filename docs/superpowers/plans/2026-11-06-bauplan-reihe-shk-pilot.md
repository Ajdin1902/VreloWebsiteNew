# Bauplan-Reihe: SHK pilot + reusable pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Research and publish the SHK Bauplan (8-page PDF, printed copy for 2026-11-26, public page `/vorlagen/shk-bauplan` with the e-mail form), built on a shared pipeline the other fifteen niches reuse by adding one data file, one template and one registry entry each.

**Architecture:** Research lands in the SHK section of `Knowledge/marketing/prozess-landkarten.md`. Shared chapter copy (self-check, close) and the level rule live once in `src/lib/bauplanReihe/`; each niche has a data file (landing + mail copy) and an ASCII HTML template that a generic render script turns into a gated PDF. The existing Bauplan form, server action and `/vorlagen/[slug]` route gain a third variant `shk` through the same token mechanism the public Agentur/Elektro copies use.

**Tech Stack:** Next.js 16, TypeScript, Vitest, the kit renderer `../Clients/_kit/brand-pdf/render-doc.mjs` (Puppeteer), `../Clients/_kit/fahrplan/check-pages.mjs`, Resend (existing).

**Spec:** `docs/superpowers/specs/2026-11-06-bauplan-reihe-design.md`

## Global Constraints

- Hard deadline: printed SHK copy for 2026-11-26. Research summary to Ajdin by 2026-11-11, rendered PDF by 2026-11-17, print-ready by 2026-11-21. The page may go live after the meeting; the print may not slip.
- No niche copy before its research is reviewed (pilot: Ajdin reads the research summary first).
- No prices of any kind, no Vrelo durations, no capacity line, no guarantee line, no client or prospect names (Schmid, Zilk, M1, Velp, MDZ, Power-Connect, Purisic, Göcze, Winter).
- One statistic per niche, primary source only, with source, year and link; none if no primary source exists.
- du; generic masculine; no Gedankenstrich (U+2013, U+2014); ranges with „bis“; no comma before „und“; German quotes „ “; *Vrelo*/*Merak* via the brand classes. All customer copy through the `stop-slop` skill; Brand.md wins.
- „KI“ is allowed; the Haus is „Dein KI-Betriebssystem“.
- Templates are pure ASCII with entities; every entity used must exist in `src/lib/bauplanTemplateText.ts` `ENTITIES`.
- A4 portrait, white page, 8 pages, office-printable without bleed. Full page = shorten copy, never shrink type.
- Bordmittel first: a station his software already covers says so and recommends no build.
- „einsammeln und ablegen, nie bewerten“ for any station touching personal documents; any bot or assistant named carries the Art.-50 line „meldet sich als KI-Assistent“.
- Chapter 7 button: `/kontakt?src=bauplan-<slug>-pdf` in the PDF, `/kontakt?src=bauplan-<slug>` on the page; the copy offers the free Prozess-Audit, the Fahrplan stays conditional.
- Work on a branch off `main` in a worktree (the `Website/` checkout sits on `feat/referenzen-page`); copy `Website/.env.local` into the worktree only for the mail test and delete it after.
- Commits end with `Co-Authored-By:` naming the model that wrote them; write messages to a file and `git commit -F`.

## Review Focus

- The self-check is filled in on paper: a reader who ticks nothing, or ticks two answers for one station, still gets a level the page explains (the level table must say what to do with blanks; tested in Task 2 via `levelFor` with all-zero counts).
- The statistic's wording drifts from its source (e.g. „der Betriebe“ where the source says „der befragten Betriebe“): Task 1 records the exact source sentence, Task 3's guard pins the PDF to it.
- A tool named in the PDF is promised an interface it doesn't have: Task 3's guard rejects „Schnittstelle“ claims outside the research's verified list.
- A request posted with a stale or forged token (`vorlage-shk` typo, an Agentur code on the SHK page) mails the wrong PDF: Task 5 tests that each token maps to its own attachment.
- The printed copy loses the link targets (a URL only in `href`): Task 3's guard requires every link to show its target as visible text.

---

### Task 1: SHK research (gate: Ajdin by 2026-11-11)

**Files:**
- Modify: `../Knowledge/marketing/prozess-landkarten.md` (section `## 1. SHK-Meisterbetrieb`: add row 13 to `### 1.1 Landkarte`, add `### 1.7 Recherche für den Bauplan (2026-11)`)

**Interfaces:**
- Produces: in `### 1.7`, five labelled parts later tasks read: **Werkzeuge** (table: tool · what it is · native features per station · public API yes/no + doc link), **Gemeldete Probleme** (bullets with source + year + link; quotes stay internal, copy paraphrases), **Statistik** (exact source sentence in German, number, sample, year, publisher, direct link to the primary document, date checked), **Tür-Station** (which station is chapter 5 and why), **Verifizierte Schnittstellen** (the only tools the PDF may call connectable).

- [ ] **Step 1: Collect what we hold.** Read `prozess-landkarten.md` §1, `first-client-conversations.md` §3, `Tools/LeadEngine/docs/superpowers/specs/2026-10-30-outreach-niches.md` (SHK row), `ki-studien.md` (format), `digitalbonus-bayern.md` (Handwerk notes). Note gaps.
- [ ] **Step 2: Tools.** WebSearch (standard, then extended where thin) + Firecrawl for vendor pages: the Handwerkersoftware SHK owners run (at least Hero, ToolTime, Craftboxx, Label Software, pds, Taifun, openHandwerk, Streit), accounting (lexoffice/Lexware Office, sevDesk, DATEV), wholesaler portals/Datanorm/IDS (GC-Gruppe, Richter+Frenzel, Pfeiffer & May), Wartungsplanung. Per tool: which stations it covers natively, API yes/no with doc link.
- [ ] **Step 3: Problems + statistic.** Sources: ZVSHK, HWK/ZDH surveys, Destatis, KfW/ifo Handwerk studies, trade press (SBZ, IKZ), owner forums. Open every candidate statistic at its primary document; record the exact sentence. Reject any number only found in a blog, a vendor survey or a secondary report.
- [ ] **Step 4: Decide the door station** (chapter 5) from the research and the Landkarte Treppe (Stufe 1 is #4 Auftrag → Monteur today); write one paragraph why.
- [ ] **Step 5: Write `### 1.7` and row 13**, then verify: every link in `### 1.7` returns 200 (`curl -s -o /dev/null -w '%{http_code}'` per URL) and the statistic sentence appears verbatim in its source.
- [ ] **Step 6: Gate.** Send Ajdin a short summary in chat (tools, top problems, the statistic, the door station); wait for his OK before Task 3 copy. (Tasks 2 and 4 may run meanwhile.)

---

### Task 2: Shared series copy + level rule

**Files:**
- Create: `src/lib/bauplanReihe/shared.ts`
- Test: `src/lib/bauplanReihe/shared.test.ts`

**Interfaces:**
- Produces:
  - `type StationStand = "laeuft" | "papier" | "kopf"`
  - `type Level = 0 | 1 | 2 | 3 | 4`
  - `levelFor(counts: { laeuft: number; papier: number; kopf: number }, fundament: boolean): Level`
  - `LEVELS: { level: Level; name: string; satz: string }[]` (names: „Im Kopf“, „Verstreut“, „Erste Station läuft“, „Ein Ort“, „Haus steht“; `satz` = what to do next, one sentence each)
  - `selbstcheck: { heading: string; intro: string; spalten: [string, string, string]; fundamentFrage: string; blankHinweis: string }`
  - `abschluss: { heading: string; text: string[]; button: string }` and `abschlussHref(slug: string, medium: "pdf" | "web"): string`

- [ ] **Step 1: Write the failing tests**

```ts
it("maps counts to levels", () => {
  expect(levelFor({ laeuft: 0, papier: 2, kopf: 11 }, false)).toBe(0);
  expect(levelFor({ laeuft: 0, papier: 8, kopf: 5 }, false)).toBe(1);
  expect(levelFor({ laeuft: 2, papier: 6, kopf: 5 }, false)).toBe(2);
  expect(levelFor({ laeuft: 9, papier: 4, kopf: 0 }, false)).toBe(2); // no foundation caps at 2
  expect(levelFor({ laeuft: 4, papier: 6, kopf: 3 }, true)).toBe(3);
  expect(levelFor({ laeuft: 10, papier: 3, kopf: 0 }, true)).toBe(4);
});
it("treats a blank sheet as level 0", () => {
  expect(levelFor({ laeuft: 0, papier: 0, kopf: 0 }, false)).toBe(0);
});
it("builds the close links", () => {
  expect(abschlussHref("shk", "pdf")).toBe("https://vrelo-ki.de/kontakt?src=bauplan-shk-pdf");
  expect(abschlussHref("shk", "web")).toBe("/kontakt?src=bauplan-shk");
});
it("keeps every shared string clean", () => {
  // walk selbstcheck, abschluss, LEVELS with findCopyIssues (src/lib/ratgeberCopy.ts) → []
  // and the price regex from src/lib/vorlagen.test.ts → no match; no "Garantie", no "noch 3"
});
it("names five levels in ladder order", () => {
  expect(LEVELS.map((l) => l.name)).toEqual(["Im Kopf", "Verstreut", "Erste Station läuft", "Ein Ort", "Haus steht"]);
});
```

- [ ] **Step 2: Run** `npx vitest run src/lib/bauplanReihe/shared.test.ts` — Expected: FAIL (module missing).
- [ ] **Step 3: Implement `shared.ts`.** Rule for `levelFor` (pinned, Claude's call): `laeuft === 0` → `papier > kopf ? 1 : 0`; `laeuft >= 1` and not `fundament` → `2`; `fundament` and `laeuft >= 10` → `4`; `fundament` and `laeuft >= 1` → `3`. Draft copy (final after stop-slop, Ajdin reviews in the PDF): `abschluss.heading` „Wenn du Fragen hast, melde dich. Kostenlos.“ (changed by Ajdin 2026-11-06); `abschluss.text` two to three sentences offering the free Prozess-Audit for his business, done together, ending in a Fahrplan if it fits; `abschluss.button` „30 Minuten Gespräch vereinbaren“. `blankHinweis` tells him an empty row counts as „im Kopf“. `abschlussHref` pdf form uses the absolute `https://vrelo-ki.de` origin (printed copy), web form is relative.
- [ ] **Step 4: Run** the test — Expected: PASS.
- [ ] **Step 5: Commit** `feat(bauplan-reihe): shared self-check, level rule and close copy`.

---

### Task 3: SHK data file, template and template guards

**Files:**
- Create: `src/lib/bauplanReihe/shk.ts`, `src/lib/bauplanReihe/index.ts`, `content/bauplan/reihe.css`, `content/bauplan/shk-bauplan.html`
- Create: `src/lib/bauplanReihe/templateGuards.ts`, `src/lib/bauplanReihe/templates.test.ts`
- Modify: `src/lib/bauplanTemplateText.ts` (only if a new entity is needed)

**Interfaces:**
- Consumes: `selbstcheck`, `abschluss`, `LEVELS`, `abschlussHref` (Task 2); Task 1 `### 1.7`.
- Produces:
  - `type ReiheSlug = "shk"` (union grows per niche)
  - `type ReiheNische = { slug: ReiheSlug; label: string; kicker: string; title: string; schmerz: string; statistik: { zahl: string; satz: string; quelle: string; linkText: string; href: string } | null; auftragsweg: { schritt: string; verlust?: string }[]; knownTools: string[]; mail: { attachmentName: string; readerSubject: string; readerClose: string; internalPrefix: string }; pdfPath: string; template: string; pages: number; verifiedInterfaces: string[] }`
  - `reiheNischen: Record<ReiheSlug, ReiheNische>` in `index.ts`
  - `checkReiheTemplate(n: ReiheNische, html?: string): string[]` in `templateGuards.ts` (reads `n.template` unless `html` is given; returns problems, `[]` = clean)
- Template contract: `<section class="page">` per page (first gets `page first`), `<h2 class="part">` per chapter with the chapter titles in skeleton order („Wo du stehst“, „Deine Werkzeuge und Datenwege“, „Das Fundament“, „Die erste Station, Schritt für Schritt“, „Die nächsten Stockwerke“, „Wenn du Fragen hast, melde dich. Kostenlos.“), `{{{BRAND_CSS}}}`, `{{{LOGO_SVG}}}` and `{{{REIHE_CSS}}}` placeholders.

- [ ] **Step 1: Write the failing test** `templates.test.ts`: for every entry of `reiheNischen`, `expect(checkReiheTemplate(n)).toEqual([])`, plus a fixture test that `checkReiheTemplate` reports each problem below on a minimal bad template string (feed it via an optional `html` override parameter: `checkReiheTemplate(n, html?: string)`).
  Problems the guard reports: non-ASCII byte · undecoded entity · `findCopyIssues` issue · page count ≠ `n.pages` · `part` headings not the six titles in order · shared `selbstcheck`/`abschluss` strings or the five `LEVELS` names missing verbatim · `abschlussHref(n.slug, "pdf")` missing as `href` · statistic `satz`, `quelle`, `href` missing (when non-null) · a client name from the Global Constraints list · price token (regex from `vorlagen.test.ts`) · duration `/\bin\s+\d+\s+(Tagen|Wochen|Monaten)\b/i` · „Garantie“ or „noch 3“ · any `href` whose URL (scheme stripped) is not also visible text · the word „Schnittstelle“ in a sentence that names a tool not in `n.verifiedInterfaces`.
- [ ] **Step 2: Run** `npx vitest run src/lib/bauplanReihe/templates.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement `templateGuards.ts`** using `templateText`/`partHeadings` from `src/lib/bauplanTemplateText.ts`; sentence split on `. ` for the interface check.
- [ ] **Step 4: Write `shk.ts`, `index.ts`, `reihe.css`, `shk-bauplan.html`** from Task 1's research (after Ajdin's OK): cover (pain line, statistic, what's inside) · Wo du stehst (13 stations in SHK vocabulary as rows with three tick boxes, the Fundament question, the level table) · Werkzeuge und Datenwege (fill-in table per station: Werkzeug heute · Daten kommen von · gehen nach, two pre-filled SHK examples) · Fundament · erste Station („So gehst du vor“ boxes: Bordmittel → workflow tool → custom build) · nächste Stockwerke · Abschluss. `reihe.css` holds everything not niche-specific; start from `content/bauplan/elektro-bauplan.html` styles. `pdfPath` stays `""` until Task 4 publishes. Run all copy through `stop-slop`.
- [ ] **Step 5: Run** the test — Expected: PASS (the page-count check runs against the HTML section count; the rendered count is Task 4's gate).
- [ ] **Step 6: Commit** `feat(bauplan-reihe): SHK data, template and series guards`.

---

### Task 4: Generic render + publish script (gate: Ajdin reviews the PDF by 2026-11-17)

**Files:**
- Create: `scripts/render-reihe-bauplan.mjs`, `content/bauplan/reihe.json`
- Modify: `package.json` (script `"bauplan:reihe": "node scripts/render-reihe-bauplan.mjs"`), `.gitignore` only if `.preview/` is not yet ignored
- Test: `src/lib/bauplanReihe/reiheJson.test.ts`

**Interfaces:**
- Consumes: template + `reihe.css` (Task 3).
- Produces: `content/bauplan/reihe.json` = `{ "shk": { "pages": 8, "shareCopy": "SHK-Bauplan-Vrelo.pdf" } }` (the `.mjs` can't import TS); CLI `npm run bauplan:reihe -- <slug> [--publish]` printing `pdfPath = "/bauplan/<slug>-bauplan-<hash8>.pdf"` on publish.

- [ ] **Step 1: Write the failing test** `reiheJson.test.ts`: every `reiheNischen` slug has a `reihe.json` entry with the same `pages`; every non-empty `pdfPath` exists under `public/`.
- [ ] **Step 2: Run** it — Expected: FAIL.
- [ ] **Step 3: Implement the script**, mirroring `scripts/render-elektro-bauplan.mjs`: replace `{{{REIHE_CSS}}}` with `content/bauplan/reihe.css`, write `.preview/<slug>-bauplan.html`, render to `.preview/<slug>-bauplan.pdf` via `render-doc.mjs` (cwd = renderer dir), gate with `check-pages.mjs` at `pages`. `--publish`: no render; gate the reviewed `.preview` PDF, copy to `../Knowledge/Offers/<shareCopy>` and `public/bauplan/<slug>-bauplan-<sha256 first 8>.pdf`, then delete older `public/bauplan/<slug>-bauplan-*.pdf` (warn on EBUSY, never touch other slugs). Unknown slug → exit 1 with the list of known slugs.
- [ ] **Step 4: Render** `npm run bauplan:reihe -- shk` — Expected: `.preview/shk-bauplan.pdf: 8 page(s), expected 8 -> OK`. Read the PDF; fix overflow by shortening copy.
- [ ] **Step 5: Gate.** Ajdin reviews the rendered PDF (and prints one page as a test on his printer). Iterate until OK.
- [ ] **Step 6: Publish** `npm run bauplan:reihe -- shk --publish`; set `pdfPath` in `shk.ts` to the printed path; run `npx vitest run src/lib/bauplanReihe` — Expected: PASS.
- [ ] **Step 7: Commit** `feat(bauplan-reihe): render/publish script, SHK PDF published` (includes `public/bauplan/shk-bauplan-*.pdf`). Hand Ajdin `Knowledge/Offers/SHK-Bauplan-Vrelo.pdf` for printing by 2026-11-21.

---

### Task 5: Mail + token for the new variant

**Files:**
- Modify: `src/lib/bauplan.ts` (`BauplanVariant` gains `"shk"`; `VORLAGE_TOKEN.shk = "vorlage-shk"`), `src/lib/bauplanEmail.ts` (`MAIL.shk` from `reiheNischen.shk.mail` + `pdfPath`), `src/app/bauplan/[code]/page.tsx` (`TITLE.shk`)
- Test: `src/lib/bauplan.test.ts`, `src/lib/bauplanEmail.test.ts`

**Interfaces:**
- Consumes: `reiheNischen` (Task 3), published `pdfPath` (Task 4).
- Produces: `bauplanFormVariant("vorlage-shk") === "shk"`; `bauplanPdfPath("shk")`, `bauplanAttachmentName("shk")`; `bauplanVariant()` still returns only `agentur` | `elektro` (coded pages unchanged).

- [ ] **Step 1: Write the failing tests:** `bauplanFormVariant(VORLAGE_TOKEN.shk)` is `"shk"`; `bauplanVariant("vorlage-shk")` is `undefined`; each of the three tokens maps to its own attachment name (`Vrelo-Bauplan-Agenturen.pdf`, `Vrelo-Bauplan-Elektrobetriebe.pdf`, the SHK name) and its own `pdfPath`; the SHK reader mail passes the existing clean-mail test (no asks, no dashes); the internal mail says `Bauplan: <label>`.
- [ ] **Step 2: Run** `npx vitest run src/lib/bauplan.test.ts src/lib/bauplanEmail.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** the three modifications.
- [ ] **Step 4: Run** the tests, then `npx tsc --noEmit` — Expected: PASS, no type errors.
- [ ] **Step 5: Commit** `feat(bauplan-reihe): SHK variant in the Bauplan form and mails`.

---

### Task 6: SHK page, hub card, sitemap

**Files:**
- Create: `src/components/bauplan/ReiheBauplanPage.tsx`, `src/components/bauplan/ReiheBauplanPage.test.tsx`
- Modify: `src/lib/vorlagen.ts` (`vorlageBauplaene["shk-bauplan"]` with `variant: "shk"`, title, description; one hub card), `src/app/vorlagen/[slug]/page.tsx` (render `ReiheBauplanPage` for reihe variants), `src/lib/vorlagen.test.ts`, `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `ReiheNische`, `abschluss`, `abschlussHref`, `wochenplan`, `deckblatt` (Tasks 2, 3 and the owner round; `inhalt` was removed by Ajdin's cover decision 2026-11-06); `BauplanPdfForm` (`copy` prop, `code = VORLAGE_TOKEN.shk`).
- Produces: `ReiheBauplanPage({ data: ReiheNische, form?: ReactNode })` — sections: kicker + title + schmerz, statistic block (only when non-null, source link visible), the job flow „Ein Auftrag, viele Hände“ from `auftragsweg` with the circled loss points and the `deckblatt` caption, the one-week path from `wochenplan`, the form, a short close teaser (`abschluss.heading` + button to `abschlussHref(slug, "web")`). Visual vocabulary from `ElektroBauplanPage` (petrol band, honig number, papier body).

- [ ] **Step 1: Write the failing tests:** component renders title, statistic number + source link, every `auftragsweg` step and circled verb, the five `wochenplan` day labels, the form slot, and a link to `/kontakt?src=bauplan-shk`; renders no statistic block when `statistik` is `null`; sitemap contains `/vorlagen/shk-bauplan`; the hub has a card linking to `/vorlagen/shk-bauplan`; vorlagen copy guard still passes.
- [ ] **Step 2: Run** `npx vitest run src/components/bauplan src/lib/vorlagen.test.ts src/app/sitemap.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** the component, the route branch and the hub entry. Hub: with five cards keep the grid; grouping waits until more than six.
- [ ] **Step 4: Run** the full suite `npx vitest run`, `npx tsc --noEmit`, `npm run lint`, `npm run build` — Expected: all pass.
- [ ] **Step 5: Localhost check** (`npx next start -p 3001` from `C:\…`): `/vorlagen`, `/vorlagen/shk-bauplan` at 1280 and 390, no horizontal overflow; one real request to `ajdin@vrelo-ki.de` with the copied `.env.local` (PDF attached, internal mail `Bauplan: <label>`, `Quelle: vorlagen`), then delete `.env.local`. Show Ajdin.
- [ ] **Step 6: Commit** `feat(bauplan-reihe): SHK page, Vorlagen card, sitemap`. Push to `main` only on Ajdin's OK.

---

### Task 7: Docs after go-live

**Files:**
- Modify: `Website/CLAUDE.md` (Bauplan-Reihe bullet: modules, script, how to add a niche in four steps), HQ `CLAUDE.md` §2.2 (one line), `Tools/LeadEngine/docs/superpowers/specs/2026-10-30-outreach-niches.md` (one line: outreach links use `/vorlagen/<slug>-bauplan?src=<prefix><nn>`, no coded page per niche), Vault light sync (`Vrelo/wiki/marketing/go-to-market.md` + `Vrelo/log.md`)

- [ ] **Step 1: Write the four docs updates**; verify German quotes with `perl -CSD` (HQ §9) after writing.
- [ ] **Step 2: Commit** the Website doc in the Website repo (`docs: Bauplan-Reihe`); HQ and Vault are not git repos.
