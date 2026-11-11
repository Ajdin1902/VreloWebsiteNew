# Leistungen in vier Seiten, Vorlagen als Haustür, 2-Wochen-Garantie, Wartung neu: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut `/leistungen` from eight subpages to four with sub-service overviews and named scenes, send every primary CTA to `/vorlagen`, replace the 14-day money-back guarantee with the 2-week first-result guarantee, and ship the new Wartung tiers (Minimum · Standard · Partner).

**Architecture:** All copy stays in typed modules (`src/lib/*.ts`), components hold no German. `LeistungPage` gains optional blocks (`angebote`, `szenen`, `abschnitte`, `eigentum`, `wartung`) rendered by new block components in the existing `[slug]` template; two new single-source modules hold the guarantee (`garantie.ts`) and the tiers (`wartung.ts`) so hero, Proof, FAQ, Leistungen and the Weg can never disagree. CTA routing changes in one place (`prozessCheckCta.ts`). The `_kit` Angebot (separate repo `Clients/`) gets a requirements list and the new clause.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4 tokens, Vitest + RTL; `_kit`: Node ESM + `node --test`, Mustache-style HTML templates.

**Spec:** [docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md](../specs/2026-11-11-leistungen-vorlagen-garantie-design.md). Read it first; §3 is final copy, §6a are calls to keep.

## Global Constraints

- German copy: quotes „…“ = U+201E + U+201C, never ASCII `"`; no U+2013/U+2014 anywhere in German strings; no „, und“; du; generic masculine; `Ajdin Dzafic` ASCII. Edit/Write downgrade the closing quote: after each write run `python -I <scratchpad>/tools/fixq.py <file>` or the perl repair in Website/CLAUDE.md „Gotchas“, then `npm test`.
- Leistungen pages carry **no price** (`€`, `EUR`, `<digit> Euro`). Prices only in `src/lib/faq.ts`.
- MDZ never appears without the family tie („Betrieb meines Vaters“ or „meines Vaters“). Velp shows only „5 Stunden pro Kunde“, never a price.
- Numbers allowed on pages: MDZ assistant „2 Stunden am Tag“, Velp engine „5 Stunden pro Kunde“, own inbox 174/96/66/8. Nothing else.
- Claude copy: always „innerhalb der EU“; never Microsoft, Azure, Foundry, Frankfurt, Deutschland.
- `/vorlagen/elektro-bauplan`, `/bauplan/<code>`, `elektroBauplanPage.ts` and the Agentur-Paket stay untouched.
- New customer prose (scene texts, card blurbs, section text, Wartung rows) runs through `stop-slop` before its task's commit; Brand.md wins on conflicts.
- Work on branch `feat/leistungen-vorlagen-garantie` in `Website/` and `feat/garantie-2-wochen` in `Clients/`. Never push; Ajdin reviews on localhost (`npm start`, server started from `C:\Users\ajdin\Vrelo\Website`).
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; on PowerShell use `git commit -F <file>`.

## Review Focus

1. **Old link with an anchor** (`/leistungen/claude` from LinkedIn or a sent mail): must land on the Claude section, heading not hidden under the sticky header. → Task 6 redirect test + Task 5 `scroll-mt-24` on the element carrying the `id`.
2. **`/vorlagen` opened without `?src=`**: card links must stay clean (no `?src=undefined`). → Task 3 `withSrc` test.
3. **Hostile or overlong `?src=`** on `/vorlagen`: must be dropped, never echoed into a link. → Task 3 `withSrc` test via `normalizeSource`.
4. **Link that already carries `?src=`** (Prozess-Check card `/prozess-check?src=vorlagen`): the visitor's src replaces it, never duplicates. → Task 3 test.
5. **A leftover 14-day money-back promise** anywhere in `src/` or `_kit`: the hero would contradict another page (UWG §5). → Task 1 repo-wide guard + Task 9 `_kit` grep step.

---

### Task 1: Guarantee single source + homepage Proof, FAQ, Weg

**Files:**
- Create: `src/lib/garantie.ts`, `src/lib/garantie.test.ts`
- Modify: `src/components/home/Proof.tsx:27-30`, `src/components/home/Proof.test.tsx`, `src/lib/faq.ts` (entry „Was passiert nach dem Projekt?“ + new entry), `src/lib/faq.test.ts:32`, `src/lib/leistungen-weg.ts:26-60`, `src/lib/leistungen-weg.test.ts:49-60`
- First: `git checkout -b feat/leistungen-vorlagen-garantie`, commit the spec + this plan.

**Interfaces:**
- Produces: `export const GARANTIE: { hero: string; titel: string; text: string; faqFrage: string; faqAntwort: string }` in `src/lib/garantie.ts`.

- [ ] **Step 1: Write the failing test `src/lib/garantie.test.ts`**

```ts
it("holds the approved guarantee copy", () => {
  expect(GARANTIE.hero).toBe("Erste Ergebnisse nach 2 Wochen, sonst bekommst du dein Geld zurück.");
  expect(GARANTIE.titel).toBe("Erste Ergebnisse in 2 Wochen. Sonst Geld zurück.");
  expect(GARANTIE.text).toBe("Im Angebot steht die Liste deiner Anforderungen. Der erste Punkt läuft zwei Wochen nach dem Onboarding. Wenn nicht, bekommst du alles zurück, was du bis dahin gezahlt hast.");
});
it("spells out all four conditions in the FAQ answer", () => {
  for (const s of ["Prozess-Audit", "Zugänge", "wartet", "zurück", "Feinschliff"]) expect(GARANTIE.faqAntwort).toContain(s);
});
it("leaves no 14-day money-back promise anywhere in src/", () => {
  // walk src/**/*.{ts,tsx} except *.test.*; fail on /14 Tage[^.]*(Betrag|Geld|zurück)/ and /14 Tage Geld/
});
it("passes the copy guards", () => { for (const s of Object.values(GARANTIE)) expect(findCopyIssues(s)).toEqual([]); });
```

- [ ] **Step 2: Run `npx vitest run src/lib/garantie.test.ts`** → FAIL (module missing).

- [ ] **Step 3: Create `src/lib/garantie.ts`** with `hero`, `titel`, `text` exactly as in the test, and:
  - `faqFrage`: „Wie funktioniert die Garantie?“
  - `faqAntwort`: „Im Angebot steht die Liste deiner Anforderungen. Der erste Punkt läuft zwei Wochen nach dem Onboarding. Die zwei Wochen beginnen, sobald ich alle Zugänge habe. Warte ich auf etwas von dir, etwa Daten oder eine Antwort, ruht die Frist so lange. Läuft der erste Punkt dann nicht, baue ich alles sauber zurück. Du bekommst alles zurück, was du bis dahin gezahlt hast. Das gilt für jeden Bau, dem der kostenlose Prozess-Audit vorausging. Nach der Übergabe folgen 14 Tage Feinschliff: Ich justiere nach, eine Erstattung gehört nicht dazu.“

- [ ] **Step 4: Use it.**
  - Proof card 6 → `{ title: GARANTIE.titel, body: GARANTIE.text }`.
  - FAQ: add entry `{ question: GARANTIE.faqFrage, answer: GARANTIE.faqAntwort }` in the same theme as „Was passiert nach dem Projekt?“; that answer becomes „Nach der Übergabe beobachte ich dein System 14 Tage lang und justiere nach, ohne dass du dich darum kümmerst. Danach bin ich weiter erreichbar. Weil alles sauber dokumentiert ist, lässt sich dein System anpassen, wenn sich etwas in deinem Betrieb ändert.“
  - `leistungen-weg.ts`: insert phase `{ id: "ergebnis", title: "Erstes Ergebnis in 2 Wochen", text: "Zwei Wochen nach dem Onboarding läuft der erste Punkt aus deiner Anforderungsliste. Wenn nicht, bekommst du alles zurück, was du bis dahin gezahlt hast." }` after `bauen`; `feinschliff.text` = „14 Tage nach der Übergabe beobachte ich dein System und justiere nach, ohne dass du dich darum kümmerst.“ Update the file's chronology comment.
  - Update `Proof.test.tsx`, `faq.test.ts`, `leistungen-weg.test.ts` (last phase still `feinschliff`, contains „14 Tage“, contains no „zurück“; `ergebnis` contains „2 Wochen“).

- [ ] **Step 5: Run `npm test`** → all green (fix quote bytes first if a guard fails).

- [ ] **Step 6: Commit** `feat: 2-week first-result guarantee replaces the 14-day money-back`.

---

### Task 2: Wartung tiers single source + FAQ prices

**Files:**
- Create: `src/lib/wartung.ts`, `src/lib/wartung.test.ts`
- Modify: `src/lib/faq.ts` (entry „Fallen laufende Kosten an?“)

**Interfaces:**
- Produces:
```ts
export type WartungTierId = "minimum" | "standard" | "partner";
export type WartungZeile = "zeit" | "fehler" | "laeuft" | "anpassen" | "verbessern" | "team" | "bericht";
export type WartungTier = { id: WartungTierId; name: string; motto: string; preisNetto: number; grenze?: string; zeilen: Record<WartungZeile, string> };
export const wartungZeilen: { id: WartungZeile; label: string }[];
export const wartungTiers: WartungTier[]; // order minimum, standard, partner
export const WARTUNG_HINWEIS: string;
export function wartungPreisSatz(): string; // FAQ sentence, built from wartungTiers
```

- [ ] **Step 1: Write the failing test**

```ts
it("has three tiers with the agreed names, mottos and prices", () => {
  expect(wartungTiers.map((t) => [t.id, t.name, t.preisNetto])).toEqual([["minimum","Minimum",249],["standard","Standard",945],["partner","Partner",9900]]);
  expect(wartungTiers.map((t) => t.motto)).toEqual(["Es läuft.", "Es läuft und wird besser.", "Ich gehöre zu deinem Team."]);
  expect(wartungTiers[2].grenze).toBe("Für höchstens zwei Betriebe");
});
it("fills every row for every tier and keeps fix times 48/24/12", () => {
  for (const t of wartungTiers) for (const z of wartungZeilen) expect(t.zeilen[z.id].trim()).not.toBe("");
  expect(wartungTiers.map((t) => t.zeilen.fehler)).toEqual(["48 Stunden", "24 Stunden", "12 Stunden"]);
});
it("never calls a tier Basis and passes the copy guards", () => { /* no /Basis/ in JSON; findCopyIssues on every string */ });
it("builds the FAQ price sentence", () => {
  expect(wartungPreisSatz()).toBe("Drei Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: Minimum für 249, Standard für 945 oder Partner für 9.900 Euro im Monat, netto und monatlich kündbar. Partner gibt es für höchstens zwei Betriebe.");
});
```

- [ ] **Step 2: Run `npx vitest run src/lib/wartung.test.ts`** → FAIL.

- [ ] **Step 3: Implement `src/lib/wartung.ts`.** Row labels: zeit „Zeit mit mir“, fehler „Fehler behoben in (Mo bis Fr, 7 bis 17 Uhr)“, laeuft „Läuft weiter“, anpassen „Anpassen“, verbessern „Verbessern“, team „Dein Team“, bericht „Bericht“. Row copy (draft, stop-slop pass before commit):

| | minimum | standard | partner |
|---|---|---|---|
| zeit | „Alle 4 Wochen 30 Minuten Call, wenn du ihn brauchst. Dazu E-Mail.“ | „Alle 2 Wochen 30 Minuten Call, wenn du ihn brauchst. Antwort am selben Werktag.“ | „Jede Woche 90 Minuten Arbeitssitzung. Direkter Draht per Telegram oder WhatsApp, Antwort in 2 Stunden. Ein Tag im Monat mit deinem Team.“ |
| fehler | „48 Stunden“ | „24 Stunden“ | „12 Stunden“ |
| laeuft | „Überwachung mit echtem Alarm, KI-Modelle und Prompts aktuell, Updates, Backup geprüft, Doku bei jeder Änderung“ | „Wie Minimum, dazu jedes Quartal eine getestete Wiederherstellung“ | „Wie Standard“ |
| anpassen | „Ich behebe, was bricht. Eine kleine Änderung im Monat.“ | „Ich passe an, bevor ein angebundenes Programm etwas kaputt macht. Drei kleine Änderungen im Monat.“ | „Alles, sobald es ansteht.“ |
| verbessern | „Nicht enthalten“ | „Jedes Quartal ein neuer kleiner Baustein. Im Quartalsgespräch aktualisieren wir deinen Fahrplan.“ | „Jeden Monat ein fester Bautag für den nächsten Baustein.“ |
| team | „Nicht enthalten“ | „Jedes Quartal ein neuer Mitarbeiter eingewiesen“ | „So oft ihr es braucht“ |
| bericht | „Eine Zahl im Monat“ | „Zahl, Notiz und Empfehlung“ | „Jede Woche“ |

  `WARTUNG_HINWEIS` = „KI-Modelle und Prompts halte ich aktuell, wenn dein System KI nutzt. Monatlich kündbar: Kündigst du, läuft dein System sicher weiter, nur ohne Anpassungen.“ `wartungPreisSatz()` formats with `Intl.NumberFormat("de-DE")`.

- [ ] **Step 4: FAQ** „Fallen laufende Kosten an?“: replace the sentence from „Drei Stufen, je nach Reaktionszeit …“ through „… für größere Unternehmen nach Absprache.“ with `${wartungPreisSatz()}`; keep the rest. Update the FAQ test if it pins 219/420/1.019.

- [ ] **Step 5: Run `npm test`** → green.

- [ ] **Step 6: Commit** `feat: Wartung tiers Minimum, Standard, Partner as one source`.

---

### Task 3: Primary CTA → `/vorlagen` + Prozess-Check card + src passthrough

**Files:**
- Modify: `src/lib/prozessCheckCta.ts`, `src/lib/prozessCheckCta.test.ts`, `src/lib/vorlagen.ts`, `src/lib/vorlagen.test.ts`, `src/app/vorlagen/page.tsx`, `src/lib/nav.ts:6-14`, `src/lib/nav.test.ts`, callers: `Header.tsx`, `MobileNav.tsx`, `Footer.tsx`, `Hero.tsx`, `home/DerWeg.tsx`, `home/MerakClose.tsx`, `ClosingCta.tsx`, `CompactHero.tsx`, `app/karte/page.tsx`, `lib/prozess-audit.ts:35` + their tests
- Create: `src/components/vorlagen/SrcLink.tsx` (client)

**Interfaces:**
- Produces in `prozessCheckCta.ts`:
```ts
export function vorlagenHref(src: CheckSrc): string; // `/vorlagen?src=${src}`
export function withSrc(href: string, raw: string | null | undefined): string; // internal hrefs only
export const VORLAGEN_CTA: { label: "Kostenlose Vorlagen ansehen"; short: "Vorlagen"; microcopy: string; closeMicrocopy: string; secondaryPrefix: "Noch unsicher?"; secondaryLabel: "Erst eine kostenlose Vorlage ansehen" };
```
  `checkHref`, `kontaktHref`, `CHECK_CTA.direct*`, `CHECK_CTA.kontaktHint*` stay (Prozess-Check card, `/kontakt` hint, Weg-Einwand link).
- Produces `CTA kind` rename used by Task 4/5: `cta.kind: "vorlagen" | "kontakt"` (was `"check" | "kontakt"`); `ClosingCta` and `CompactHero` accept `primary: "vorlagen" | "kontakt"`.

- [ ] **Step 1: Failing tests in `prozessCheckCta.test.ts`**

```ts
expect(vorlagenHref(CHECK_SRC.homeHero)).toBe("/vorlagen?src=home-hero");
expect(VORLAGEN_CTA.microcopy).toBe("Bauplan für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos.");
expect(VORLAGEN_CTA.closeMicrocopy).toBe("Vorlage, Gespräch und Fahrplan: alles kostenlos.");
expect(withSrc("/vorlagen/shk-bauplan", "home-hero")).toBe("/vorlagen/shk-bauplan?src=home-hero");
expect(withSrc("/vorlagen/shk-bauplan", null)).toBe("/vorlagen/shk-bauplan");
expect(withSrc("/vorlagen/shk-bauplan", "<script>")).toBe("/vorlagen/shk-bauplan");
expect(withSrc("/prozess-check?src=vorlagen", "home-weg")).toBe("/prozess-check?src=home-weg");
expect(withSrc("/vorlagen/vrelo-ki-betriebssystem.pdf", "home-hero")).toBe("/vorlagen/vrelo-ki-betriebssystem.pdf");
expect(withSrc("https://example.com/x", "home-hero")).toBe("https://example.com/x");
```
  Plus in `vorlagen.test.ts`: an item `id: "prozess-check"`, `gruppe: "alle"`, link href `/prozess-check?src=vorlagen`, text containing `questionCountPhrase(STEPS.length)`.

- [ ] **Step 2: Run `npx vitest run src/lib/prozessCheckCta.test.ts src/lib/vorlagen.test.ts`** → FAIL.

- [ ] **Step 3: Implement.**
  - `withSrc`: validate with `normalizeSource` from `src/lib/source.ts`; skip `.pdf` and non-`/` hrefs; replace an existing `src` via `URLSearchParams`.
  - The four slugs of the folded pages stay in `CHECK_SRC` until Task 5 removes those entries.
  - Vorlagen item: titel „Prozess-Check“, umfang „3 Minuten“, text `` `Drei Minuten, ${questionCountPhrase(STEPS.length)}. Du siehst sofort, wie viele Stunden pro Woche der Kleinkram kostet.` `` (count spelled from `STEPS`, same pattern as `DerWeg`), link text „Prozess-Check starten“, href `/prozess-check?src=vorlagen`. First item in group `alle`.
  - `SrcLink` (client, `useSearchParams` inside `<Suspense>` with a plain-href fallback, like `ProzessCheckFromUrl`): renders `next/link` with `withSrc(href, searchParams.get("src"))`. `/vorlagen/page.tsx` uses it for internal non-PDF card links; PDF keeps the plain `<a>`.
  - `/vorlagen` page: one quiet line under the groups (my call, spec §3.3 funnel): „Danach: 30 Minuten Gespräch, dann dein Fahrplan. Kostenlos.“ with link „Gespräch buchen“ → `kontaktHref(CHECK_SRC.vorlagen)` (add slug `vorlagen: "vorlagen"` to `CHECK_SRC`). Copy lives in `vorlagen.ts`.
  - Callers: every primary button switches to `vorlagenHref(...)` + `VORLAGEN_CTA.label` (`short` in Header compact + Footer + Karte); Hero + DerWeg show `VORLAGEN_CTA.microcopy`; MerakClose shows `closeMicrocopy`; ClosingCta/CompactHero secondary for `kontakt` pages uses `secondaryPrefix/secondaryLabel` → `vorlagenHref(src)`. `prozess-audit.ts` card CTA → `vorlagenHref(CHECK_SRC.leistungenAudit)` + `VORLAGEN_CTA.label`. `CheckHint` and the Weg-Einwand link stay on `checkHref`.
  - `nav.ts`: drop `{ href: "/vorlagen", label: "Vorlagen" }` from `navLinks` (the header button already goes there; spec §6 builder call). Update `nav.test.ts`.

- [ ] **Step 4: Run `npm test`** → green; update caller tests that expected `/prozess-check?src=` on a primary button.

- [ ] **Step 5: Commit** `feat: primary CTAs lead to /vorlagen, Prozess-Check becomes a free tool there`.

---

### Task 4: Hero + DerWeg copy

**Files:**
- Modify: `src/components/Hero.tsx:30-46`, `src/components/home/DerWeg.tsx:9-25, 54`, their tests if present (`grep -l "Hero\|DerWeg" src/**/*.test.tsx`)

**Interfaces:**
- Consumes: `GARANTIE.hero` (Task 1), `VORLAGEN_CTA`, `vorlagenHref` (Task 3).

- [ ] **Step 1: Failing test** (`src/components/Hero.test.tsx`, create if missing):

```ts
render(<Hero />);
expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Manuelle Prozesse rauben dir die Zeit.");
expect(screen.getByText(/Kostenloser Prozess-Audit mit Fahrplan\./)).toBeInTheDocument();
expect(screen.getByText(/Erste Ergebnisse nach 2 Wochen, sonst bekommst du dein Geld zurück\./)).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" })).toHaveAttribute("href", "/vorlagen?src=home-hero");
```
  DerWeg test: step titles `["Vorlage holen", "Gespräch", "Fahrplan"]`, button href `/vorlagen?src=home-weg`.

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement.** Hero sub = „Maßgeschneiderte Automatisierungen geben dir deine Stunden zurück. Kostenloser Prozess-Audit mit Fahrplan. “ + `GARANTIE.hero`. DerWeg steps 1 and 2 copy exactly as spec §3.2; step 3 unchanged; update the file's header comment (path is now Vorlage → Gespräch → Fahrplan).

- [ ] **Step 4: Run `npm test`** → green.

- [ ] **Step 5: Commit** `feat: hero names the free audit and the 2-week guarantee`.

---

### Task 5: Leistungen data model + new blocks

**Files:**
- Modify: `src/lib/leistungenPages.ts` (types + entries), `src/lib/leistungenPages.test.ts`, `src/app/leistungen/[slug]/page.tsx`, `src/app/leistungen/[slug]/page.test.tsx`
- Create in `src/components/leistungen/page/`: `AngeboteBlock.tsx`, `SzenenBlock.tsx`, `AbschnitteBlock.tsx`, `EigentumBlock.tsx`, `WartungBlock.tsx`; tests in `blocks.test.tsx`

**Interfaces:**
- Consumes: `wartungTiers`, `wartungZeilen`, `WARTUNG_HINWEIS` (Task 2); `cta.kind: "vorlagen" | "kontakt"` (Task 3).
- Produces (in `leistungenPages.ts`):
```ts
export type LeistungSlug = "prozess-audit" | "prozessautomatisierung" | "ki-automatisierung" | "betreuung";
export type LeistungGroup = "pruefen" | "bauen" | "betreiben";
export type AngebotKarte = { title: string; kurz: string; href?: string }; // href = "#<abschnitt-id>" or an internal path
export type Szene = { kunde: string; titel: string; vorher: string; nachher: string; ergebnis?: string };
export type AbschnittId = "ki-betriebssystem" | "claude" | "ki-server" | "ki-schulung";
export type Abschnitt = { id: AbschnittId; title: string; lead: string; absaetze: string[]; grafik?: LeistungPage["grafik"]; vergleich?: Vergleich; note?: LeistungPage["note"] };
// LeistungPage gains: angebote?: { heading: string; karten: AngebotKarte[] }; szenen?: { heading: string; items: Szene[] };
//   abschnitte?: Abschnitt[]; eigentum?: true; wartung?: true; example becomes optional.
export const EIGENTUM = { text: "Einmal gebaut, gehört es dir. Keine monatliche Pflicht: Wartung nur, wenn du sie willst.", link: { label: "Zu Betreuung & Wartung", href: "/leistungen/betreuung" } };
```

- [ ] **Step 1: Rewrite the failing tests in `leistungenPages.test.ts`:**
  - slugs in order `["prozess-audit", "prozessautomatisierung", "ki-automatisierung", "betreuung"]`; groups `pruefen → [prozess-audit]`, `bauen → [prozessautomatisierung, ki-automatisierung]`, `betreiben → [betreuung]`; `leistungGroups` labels `["Prüfen", "Bauen", "Betreiben"]`.
  - KI page `abschnitte.map(a => a.id)` = `["ki-betriebssystem", "claude", "ki-server", "ki-schulung"]`; its `angebote.karten` hrefs = `["#ki-assistenten", "#ki-betriebssystem", "#claude", "#ki-server", "#ki-schulung"]`.
  - Claude section: `vergleich === claudeVergleich`, note href `/claude-gehirn`, copy matches `/innerhalb der EU/`, no `/Microsoft|Azure|Foundry|Frankfurt|Deutschland|€/` (moved from the old page test).
  - `eigentum: true` on exactly `prozessautomatisierung` + `ki-automatisierung`; `wartung: true` only on `betreuung`.
  - Names: replace the „without client names“ test with: wherever `MDZ` appears in a page's strings, the same string contains „meines Vaters“; no `Baude|Alen|Purisic`; the only number tokens in `szenen` are „2 Stunden am Tag“, „5 Stunden pro Kunde“, 174/96/66/8.
  - Price/Partner test: price ban stays on all pages; `\bPartner\b` ban stays, `betreuung` exempt only for the tier name (tiers live in `wartung.ts`, so the page strings themselves should still pass).
  - `cta.kind`: `vorlagen` on all four.
  - Keep: copy guards over all strings incl. `angebote`, `szenen`, `abschnitte`; Fahrplan-conditional rule; hero/pain length rules; grafik test now lists `prozess-audit-balken`, `prozess-fliessband`, `ki-fluss`, `betreuung-zeitlinie` at page level plus `betriebssystem-becken`, `claude-projekt`, `ki-server-rahmen`, `schulung-vorlagen` inside KI sections.
  - `blocks.test.tsx`: `AbschnitteBlock` renders each section with `id` and class `scroll-mt-24` on the same element; `SzenenBlock` shows `ergebnis` only when set; `WartungBlock` renders 3 tier columns, 7 rows, and no `€`/`Euro`; `EigentumBlock` links to `/leistungen/betreuung`.

- [ ] **Step 2: Run `npx vitest run src/lib/leistungenPages.test.ts src/components/leistungen/page`** → FAIL.

- [ ] **Step 3: Implement the types and blocks.** Block styles follow the existing subpage rhythm (petrol bands with `SectionBackdrop`, paper bands flat, `card-depth` cards; Website/CLAUDE.md „Subpage backdrops“). `SzenenBlock`: per scene a two-column Vorher/Nachher card pair (stacked below `md`), `kunde` as eyebrow, `ergebnis` as an amber chip. `AbschnitteBlock` reuses `GrafikBlock`, `VergleichBlock` (`current="ki-automatisierung"`) and `NoteBlock`. Template order in `[slug]/page.tsx`: Hero → Pain → Angebote → Proof → Grafik → Szenen → Example → Abschnitte → Vergleich → Wartung → AuditCard → Eigentum → Note → ClosingCta → Related.

- [ ] **Step 4: Rewrite the entries** (copy draft below; stop-slop pass before commit).
  - **prozess-audit**: keep entry; `cta.kind: "vorlagen"`; `angebote.heading` „Alles kostenlos“, karten: „Prozess-Check“ („Drei Minuten, du siehst sofort, wo deine Stunden hingehen.“, href `/prozess-check?src=leistung-prozess-audit`) · „Gespräch“ („30 Minuten durch deine Abläufe.“) · „Audit“ („Ich schaue mir die Aufgaben genauer an, die dich am meisten Zeit kosten.“) · „Fahrplan“ („Lohnt sich etwas, bekommst du ihn ein bis zwei Werktage später.“). `szenen`: one item `{ kunde: "Beispiel", titel: "Was in deinem Fahrplan steht", vorher: "Viele Aufgaben, unklar, wo du anfängst.", nachher: "Eine Aufgabe zuerst, der erste Schritt und die Reihenfolge danach." }` (no `ergebnis`).
  - **prozessautomatisierung**: `angebote.heading` „Was ich automatisiere“, karten (no href): „Rechnungen und Belege“ · „Angebot bis Auftrag“ · „Kunden-Onboarding“ · „Datenübernahme zwischen Programmen“, one `kurz` line each. `szenen` (replace `example`): MDZ `{ kunde: "MDZ Hausmeisterservice, der Betrieb meines Vaters", titel: "Aus einem Eintrag wird eine Rechnung", vorher: "Jede Rechnung von Hand in Word geschrieben, nummeriert und abgelegt.", nachher: "Ein Eintrag in Notion, die nummerierte Rechnung liegt als Word und PDF im Kundenordner." }` · Velp `{ kunde: "Velp, Marketingagentur in Regensburg", titel: "Jede Projektphase legt ihre Aufgaben selbst an", vorher: "Aufgaben, Fristen und Zuständige für jedes Projekt von Hand angelegt.", nachher: "Jede Phase legt ihre Aufgaben, Fristen und Zuständigkeiten selbst an.", ergebnis: "Rund 5 Stunden pro Kunde gespart" }`. Proof `case` body: remove the duplicated agency story, keep a one-line framing + objection. `eigentum: true`.
  - **ki-automatisierung**: `title`/`navLabel` „KI-Automatisierung“; `angebote.heading` „Was KI bei dir übernimmt“, karten from the old pages' `kurz`: KI-Assistenten (`#ki-assistenten`), KI-Betriebssystem, Claude für Unternehmen, KI-Server, KI-Schulung. `szenen` (section `id="ki-assistenten"` on the SzenenBlock): MDZ `{ kunde: "MDZ Hausmeisterservice, der Betrieb meines Vaters", titel: "Aufgaben per Sprachnachricht", vorher: "Unterwegs gedacht, abends vergessen.", nachher: "Eine Sprachnachricht auf Telegram, der Assistent legt Termin, E-Mail oder Notiz an. Der Inhaber gibt frei.", ergebnis: "Rund 2 Stunden am Tag gespart" }` · own inbox `{ kunde: "Mein eigenes Postfach", titel: "Die KI ist der kleinste Teil", vorher: "Jede E-Mail selbst lesen und einsortieren.", nachher: "Beim ersten Durchlauf durch 174 E-Mails haben feste Regeln und bekannte Kontakte 96 einsortiert, die KI 66. Acht blieben für mich zur Prüfung." }`. Keep the video `example`, studies proof (drop `caseLine`), `automatisierungVergleich`, Förderung note. `abschnitte`: one per old page; `title` = old `title`, `lead` = old `subline`, `absaetze` = 2 to 3 paragraphs condensed from old `proof.body`/`points` and `example`, `grafik` = old `grafik`; Claude keeps `claudeVergleich` and the Claude-Gehirn note verbatim, KI-Betriebssystem keeps its Claude-Gehirn note, KI-Schulung keeps the Art.-4 note. `related` ≤ 3 from the union of old lists. `eigentum: true`.
  - **betreuung**: `wartung: true`; `proof.body` reworded around „Der Unterschied zwischen den Stufen ist, wie viel Zeit du von mir bekommst und wie viel ich an deinem System verbessere.“; CTA lead „Betreuung gibt es für Systeme, die ich gebaut habe. Fang mit einer kostenlosen Vorlage an.“
  - Remove the entries `ki-server`, `claude`, `ki-schulung`, `ki-betriebssystem`; then the four `CHECK_SRC` slugs from Task 3.

- [ ] **Step 5: Run `npm test`** → green (expect failures in sitemap, nav, ServiceGroups, WasIchBaue, Ratgeber: fixed in Task 6; if the build of this task needs them green, do Task 6 before committing and commit both together).

- [ ] **Step 6: Commit** `feat: four Leistungen pages with overviews, named scenes and Wartung tiers`.

---

### Task 6: Redirects, Ratgeber links, hub, homepage doors, menu

**Files:**
- Modify: `next.config.ts:22-40`, `content/ratgeber/{claude-im-alltag-nutzen,claude-oder-chatgpt,ki-betriebssystem-drei-stufen,wann-arbeitest-du-eigentlich,was-ist-ein-ki-server,wo-laeuft-deine-ki}.mdx` (frontmatter `leistung:` only), `src/components/home/WasIchBaue.tsx` + test, `src/components/leistungen/ServiceGroups.tsx` + test, `src/app/sitemap.test.ts`, `src/lib/nav.test.ts`
- Create: `src/lib/leistungenRedirects.test.ts`

- [ ] **Step 1: Failing test `leistungenRedirects.test.ts`** (same pattern as `parkedRoutes.test.ts`):

```ts
const want = {
  "/leistungen/ki-server": "/leistungen/ki-automatisierung#ki-server",
  "/leistungen/claude": "/leistungen/ki-automatisierung#claude",
  "/leistungen/ki-betriebssystem": "/leistungen/ki-automatisierung#ki-betriebssystem",
  "/leistungen/ki-schulung": "/leistungen/ki-automatisierung#ki-schulung",
  "/leistungen/ki-beratung": "/leistungen/prozess-audit",
};
// each source has exactly one redirect, permanent: true, destination as above;
// every #anchor exists as an Abschnitt id on the KI page.
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement.** Add the four `permanent: true` redirects. Set the six Ratgeber `leistung:` values to `ki-automatisierung` (frontmatter line only; `ratgeber.ts` throws on unknown slugs, so the build proves it). `WasIchBaue`: heading „Prüfen. Bauen. Betreiben.“, line „Drei Wege, ein System: such dir aus, wo du anfängst.“, doors `pruefen → /leistungen/prozess-audit`, `bauen → /leistungen#gruppe-bauen`, `betreiben → /leistungen/betreuung`, bodies (draft): bauen „Prozessautomatisierung und KI: vom kleinen Baustein bis zum Assistenten.“, betreiben „Wartung, wenn du sie willst. Gebaut ist gebaut, es gehört dir.“; grid `lg:grid-cols-3`. `ServiceGroups`: works off the data; adjust the column rule for 1 to 2 cards per group. Update the tests that pin eight slugs or four doors (sitemap, nav, ServiceGroups, WasIchBaue, `[slug]/page.test.tsx`).

- [ ] **Step 4: Run `npm test && npx tsc --noEmit && npm run lint && npm run build`** → all pass; the build lists exactly four `/leistungen/[slug]` pages.

- [ ] **Step 5: Commit** `feat: redirect the four folded Leistungen pages to their KI sections`.

---

### Task 7: Browser check on localhost

- [ ] **Step 1:** Stop anything on :3000 (`Get-NetTCPConnection -LocalPort 3000`), then from `C:\Users\ajdin\Vrelo\Website`: `npm run build; npm start`.
- [ ] **Step 2:** At 1440 and 390 width, scroll each page through (Reveal) and screenshot: `/`, `/vorlagen`, `/vorlagen?src=home-hero` (hover a Bauplan card: href carries `?src=home-hero`), `/leistungen`, the four subpages, `/faq`.
- [ ] **Step 3:** Open `/leistungen/claude` → lands on `/leistungen/ki-automatisierung#claude`, heading visible below the sticky header. Same for `ki-server`.
- [ ] **Step 4:** Check AA on every new band per Website/CLAUDE.md (light text only on petrol/deep, never `text-stein` on petrol; ember/amber rules). Fix, re-run `npm test`, commit `fix: …` if needed.
- [ ] **Step 5:** Hand the localhost URLs to Ajdin. **No push** until he says so.

---

### Task 8: Docs inside Website

**Files:** `Website/CLAUDE.md` (Status routes `+4 [slug]`, „`/leistungen` = four doors“ bullet → three doors / four pages, homepage order DerWeg text, Key decisions „Primary CTA“ → `/vorlagen`, „Hero copy“, „Prices“ tiers, Changelog line 2026-11-11), `src/app/vorlagen/page.tsx` header comment.

- [ ] **Step 1:** Edit the listed bullets so they describe the new state; one changelog line.
- [ ] **Step 2:** Commit `docs: Website memory for the four-page Leistungen and /vorlagen front door`.

---

### Task 9: `_kit` Angebot, Kalkulator, Einseiter (repo `Clients/`)

**Files:**
- Modify: `Clients/_kit/brand-pdf/prepare.mjs`, `prepare.test.mjs`, `angebot.html:110-123`, `Clients/_kit/kalkulator/kalkulator.html:~190`, `Clients/_kit/prozess-einseiter/vrelo-prozess-einseiter.html:~111`, `Clients/_kit/README.md:~49-54`
- First: `cd Clients; git checkout -b feat/garantie-2-wochen`

**Interfaces:**
- Produces: `client.json` field `anforderungen: string[]` (≥ 1 for `angebot`); view field `anforderungen: { text: string; ersterPunkt: boolean }[]`.

- [ ] **Step 1: Failing tests in `prepare.test.mjs`:**

```js
test('angebot requires at least one Anforderung', () => {
  assert.throws(() => prepareView({ ...base, anforderungen: [] }, 'angebot'), /anforderungen/);
});
test('marks only the first Anforderung as the 2-week item', () => {
  const v = prepareView({ ...base, anforderungen: ['A', 'B'] }, 'angebot');
  assert.deepEqual(v.anforderungen, [{ text: 'A', ersterPunkt: true }, { text: 'B', ersterPunkt: false }]);
});
test('rechnung does not need anforderungen', () => { prepareView({ ...base, anforderungen: undefined }, 'rechnung'); });
```

- [ ] **Step 2: Run `node --test` in `Clients/_kit/brand-pdf`** → FAIL.

- [ ] **Step 3: Implement.** Validation joins the existing `missing` list (`anforderungen (mindestens eine)`), angebot only. In `angebot.html` add, before the guarantee note, a section „Deine Anforderungen“ as an ordered list; the first item gets „ (läuft 2 Wochen nach dem Onboarding)“. Replace the „Zufriedenheits-Garantie“ paragraph with **„Garantie:“** „Der erste Punkt deiner Anforderungen läuft zwei Wochen nach dem Onboarding. Die zwei Wochen beginnen, sobald Vrelo alle Zugänge hat. Solange Vrelo auf etwas von dir wartet, etwa Daten, Zugänge oder eine Antwort, ruhen sie. Läuft der erste Punkt bis dahin nicht, baut Vrelo das System zurück und erstattet dir alles, was du bis dahin gezahlt hast. Voraussetzung ist der gemeinsame Prozess-Audit vor dem Bau. Nach der Abnahme folgen 14 Tage Feinschliff: Vrelo justiert nach, eine Erstattung gehört nicht dazu. Und alles gehört dir: Konten, Daten, Dokumentation. Hörst du mit mir auf, läuft es weiter.“ Kalkulator + Einseiter: replace the 14-day sentence with „Läuft der erste Punkt deiner Anforderungen zwei Wochen nach dem Onboarding nicht, bekommst du alles zurück, was du bis dahin gezahlt hast.“ (Einseiter keeps its HTML-entity style). README tier table → Minimum 249 / Standard 945 / Partner 9.900 with the Wartung rows from `Website/src/lib/wartung.ts`; add `anforderungen` to the client.json field list. Add `anforderungen` to `Velp/client.json`? **No**: Velp is pro bono and gets no Angebot.

- [ ] **Step 4: Verify.** `node --test` green; render a test Angebot with a scratch client.json via the existing render command in `_kit/README.md`, then `node ../fahrplan/check-pages.mjs <pdf>` if the README names it as the gate; read the PDF page. `grep -rn "14 Tage" Clients/_kit --include=*.html` shows only the Feinschliff mentions, none with „erstatt“ or „zurück“.

- [ ] **Step 5: Commit** `feat(_kit): requirements list and 2-week guarantee in the Angebot`.

---

### Task 10: HQ docs + Vault sync (no repo)

**Files:** `Knowledge/Strategy/Pricing.md` §4/§5 (tier table → Minimum/Standard/Partner, rationale: time access + improvement, Hormozi jumps ×4/×10, Partner max 2, Basis-margin note retired), HQ `CLAUDE.md` §4 (guarantee bullet, retainer tiers line, Funnel line: primary CTA → `/vorlagen`), §2.2 Vorlagen bullet (Prozess-Check card), §5 MDZ/Velp rows (numbers now public: 2 h/day, 5 h per client), Website `Key decisions` already in Task 8; Vault light sync per `Vrelo/CLAUDE.md` §6.4 (pages: offers/pricing, marketing/website, clients/mdz, clients/velp; index one-liners; log entry).

- [ ] **Step 1:** Edit; keep HQ under its current size (`wc -c CLAUDE.md` before/after).
- [ ] **Step 2:** Quote-byte check on every touched German file.
- [ ] **Step 3:** Report the blast radius to Ajdin.
