# /vorlagen Aufwand-Skala Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A band under the `/vorlagen` hero shows the free offers on one scale from „Du machst es selbst“ to „Ich mache es für dich“, ending at the price-free Umsetzung.

**Architecture:** Copy lives in `vorlagenPage.skala` (`src/lib/vorlagen.ts`), rendered by a new string-free `AufwandSkala` component placed between `CompactHero` and the card groups in `src/app/vorlagen/page.tsx`. Cards and groups stay; group wrappers gain ids so the Baupläne stop can jump there.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4 tokens, Vitest + RTL.

**Spec:** `docs/superpowers/specs/2026-11-21-vorlagen-aufwand-skala-design.md`

## Global Constraints
- Branch `feat/vorlagen-aufwand-skala`; run Vitest/servers from `C:/Users/ajdin/Vrelo/Website` (capital `C:`).
- German copy: du, „…“ (U+201E/U+201C), no U+2013/U+2014, no comma before „und“, no price token; verify bytes after writing.
- Components hold no German strings; colours only via `@theme` tokens (`amber`, `honig`, `vrelo-petrol`, `tinte`, `stumm`, `papier`).
- Anchored elements carry `scroll-mt-*` on the element with the `id`; never wrap them in `Reveal`.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; message via file + `git commit -F`.

## Review Focus
- An anchor stop whose target id doesn't exist (card id renamed later) → test: every `#…` href resolves to a card `id` or `gruppe-<group id>`.
- Phone width (390): six stops must not squeeze into one row → vertical list below `md`.
- Keyboard/screen reader: order must survive without the line → `<ol>`, each stop a real link with its name as link text.
- Sticky header hiding the jump target → `scroll-mt-28` on cards and group wrappers.
- Umsetzung accidentally marked free or priced → test: stop 6 `kostenlos: false`, copy guard „names no price“ covers `skala`.

---

### Task 1: Skala copy + data tests

**Files:**
- Modify: `src/lib/vorlagen.ts` (type `vorlagenPage`, add `skala`)
- Test: `src/lib/vorlagen.test.ts`

**Interfaces:**
- Produces: `vorlagenPage.skala: { titel: string; text: string; links: string; rechts: string; stopps: { titel: string; notiz: string; href: string; kostenlos: boolean }[] }`

- [ ] **Step 1: Write failing tests** in `describe("vorlagen skala")`:
  - `stopps.map(s => s.titel)` equals `["Claude-Gehirn", "Baupläne", "KI-Betriebssystem", "Prozess-Check", "Gespräch und Fahrplan", "Umsetzung"]`.
  - `stopps.map(s => s.kostenlos)` equals `[true, true, true, true, true, false]`.
  - every `href` starting with `#` is in `[...vorlagenPage.items.map(v => "#" + v.id), ...VORLAGEN_GRUPPEN.map(g => "#gruppe-" + g.id)]`.
  - stop 5 `href` equals `vorlagenPage.weiter.link.href`; stop 6 `href` equals `leistungHref("prozessautomatisierung")`.
  - `links` = „Du machst es selbst“, `rechts` = „Ich mache es für dich“.
- [ ] **Step 2:** `npx vitest run src/lib/vorlagen.test.ts` → FAIL (`skala` undefined).
- [ ] **Step 3: Add `skala`** with exactly this copy: `titel` „Wer macht die Arbeit?“ · `text` „Links machst du es selbst, rechts übernehme ich. Bis zum Fahrplan ist alles kostenlos.“ · notes: „Du richtest es ein und pflegst es“ `#claude-gehirn` · „Du baust nach Plan“ `#gruppe-handwerk` · „Du siehst, wo du anfängst“ `#haus` · „Du bekommst deine Zahl“ `#prozess-check` · „Ich plane, du entscheidest“ `kontaktHref(CHECK_SRC.vorlagen)` · „Ich baue es für dich“ `"/leistungen/prozessautomatisierung"` (literal; avoids importing leistungenPages).
- [ ] **Step 4:** same command → PASS, incl. the existing copy-guard and no-price tests (they walk all of `vorlagenPage`). Check bytes: `grep -c $'\u201D' src/lib/vorlagen.ts` → 0.
- [ ] **Step 5: Commit** `feat(vorlagen): Aufwand-Skala copy`.

### Task 2: AufwandSkala component + page wiring

**Files:**
- Create: `src/components/vorlagen/AufwandSkala.tsx`
- Modify: `src/app/vorlagen/page.tsx` (render band, group `id`, `scroll-mt-28`)
- Test: `src/app/vorlagen/page.test.tsx`

**Interfaces:**
- Consumes: `vorlagenPage.skala` (Task 1).
- Produces: `AufwandSkala({ skala }: { skala: typeof vorlagenPage.skala }): JSX.Element` (server component).

- [ ] **Step 1: Write failing tests** in `page.test.tsx`:
  - `screen.getByRole("heading", { name: "Wer macht die Arbeit?" })` exists.
  - the list `getByRole("list", { name: "Wer macht die Arbeit?" })` has 6 `listitem`s; within it links „Claude-Gehirn“ → `#claude-gehirn` and „Umsetzung“ → `/leistungen/prozessautomatisierung`.
  - both end labels render as text.
  - `document.getElementById("gruppe-handwerk")` is not null.
- [ ] **Step 2:** `npx vitest run src/app/vorlagen/page.test.tsx` → FAIL.
- [ ] **Step 3: Build `AufwandSkala`**: `<section>` with `h2` (id for `aria-labelledby`), `text`, end labels, `<ol aria-labelledby=…>` of `<li>` each holding a `Link` (title) + note + „kostenlos“ chip when `kostenlos`. Below `md`: vertical, left border line (`border-l`), most effort first. `md+`: grid of 6 columns with a horizontal line behind the dots, amber getting deeper to the right (`from-honig to-amber` gradient), end labels above the line at its two ends. Plain `<a>` for `#…` hrefs, `Link` otherwise. Place it inside the existing `<Section>` before the group map (no extra Section, so no double padding).
- [ ] **Step 4: Page edits**: group wrapper `<div key id={`gruppe-${g.id}`} className="… scroll-mt-28">`; card `<li … className="… scroll-mt-28">`.
- [ ] **Step 5:** same command → PASS; then full gate: `npx vitest run`, `npx tsc --noEmit`, `npm run lint` all green.
- [ ] **Step 6: Visual check**: `npm run dev` from `C:/…`, open `/vorlagen` at 1440 and 390; jump links land below the sticky header. Stop the server afterwards (kill port 3000 holder).
- [ ] **Step 7: Commit** `feat(vorlagen): Aufwand-Skala band under the hero`. Do not push: show Ajdin on localhost, push only on his OK (stop servers, `npm run build` first).
