# Wartung in four tiers + review fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four Betreuung tiers (Minimum 95 · Basis 249 · Standard 945 · Partner auf Anfrage), an honest cancellation line, an unconditional Fahrplan, a signature in the Prozess-Check mail, the new Claude naming + clip, and five small review fixes.

**Architecture:** All copy lives in the typed copy modules under `src/lib/`; components only render. Tier data stays in `src/lib/wartung.ts` (one source for table + FAQ). The e-mail signature becomes its own module so the Bauplan mails can reuse it later.

**Tech Stack:** Next.js 16, TypeScript, Vitest + RTL, ffmpeg-made video asset (already rendered).

**Spec:** `docs/superpowers/specs/2026-11-12-wartung-vier-stufen-review-fixes-design.md`

## Global Constraints

- German copy: quotes „…“ (U+201E/U+201C), no Gedankenstrich (U+2013/U+2014), no comma before „und“, generic masculine, „du“. Edit/Write downgrade the closing quote: verify bytes after every write that adds German quotes.
- No Partner price anywhere public (page, FAQ, tests that assert rendered copy contains it).
- Never say or imply Vrelo hosts or pays for the server; the only server figure stays „rund 30 €“.
- Tests run from PowerShell in `C:\Users\ajdin\Vrelo\Website` (`npx vitest run`); a `/c/...` cwd makes the whole suite fail.
- Branch: keep working on `feat/leistungen-vorlagen-garantie` (3 unpushed commits). No push without Ajdin's OK.
- Commit messages via file (`git commit -F`, UTF-8 without BOM), ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- Partner has no `preisNetto`: any code that formats prices (`wartungPreisSatz`, table price cell) must not print `undefined €` or `NaN` → pinned in Task 1/2 tests.
- Four columns at tablet width: the table must not appear below `lg`; cards cover `< lg` → class assertion in Task 2.
- Signature links: `tel:` must be digits only (`tel:+4917643806085`), LinkedIn must be the founder profile, not the company page → Task 4 test.
- The plain-text e-mail must carry the signature too (many clients show text) → Task 4 test.
- The prompt must stay ≤ 2,700 chars after the Cowork rename → existing `claudeGehirn.test.ts` guard, run in Task 6.

---

### Task 1: Tier data, FAQ sentence, cancellation lines

**Files:**
- Modify: `src/lib/wartung.ts`, `src/lib/wartung.test.ts`
- Modify: `src/lib/leistungenPages.ts:269` (Betreuung „Alles gehört dir.“ card body)
- Modify: `src/lib/faq.test.ts` (only if it pins the old sentence text)

**Interfaces:**
- Produces: `WartungTierId = "minimum" | "basis" | "standard" | "partner"`; `WartungTier.preisNetto?: number` (Partner none); `wartungPreis(t): string` returning `"95 €"`, `"249 €"`, `"945 €"`, `"Auf Anfrage"`; `WARTUNG_PREIS_ZUSATZ = "im Monat, netto"`; `WARTUNG_PREIS_LABEL = "Preis"`; `wartungPreisSatz(): string`; `WARTUNG_TITEL`; `WARTUNG_HINWEIS`.

- [ ] **Step 1: Rewrite `wartung.test.ts` expectations**

```ts
expect(wartungTiers.map((t) => [t.id, t.name, t.preisNetto])).toEqual([
  ["minimum", "Minimum", 95], ["basis", "Basis", 249], ["standard", "Standard", 945], ["partner", "Partner", undefined],
]);
expect(wartungTiers.map(wartungPreis)).toEqual(["95 €", "249 €", "945 €", "Auf Anfrage"]);
expect(wartungTiers.map((t) => t.zeilen.fehler)).toEqual([["72 Stunden"], ["48 Stunden"], ["24 Stunden"], ["12 Stunden"]]);
expect(wartungTiers[0].motto).toBe("Ich halte dein System aktuell");
expect(wartungTiers[0].zeilen.laeuft).toEqual(["Updates für Server und Programme", "Dein Server bleibt auf deinem Konto"]);
for (const z of ["zeit", "anpassen", "verbessern", "team", "bericht"] as const) expect(wartungTiers[0].zeilen[z]).toEqual(["Nicht enthalten"]);
expect(wartungTiers[0].zeilen.ergebnis).toEqual(["Es bleibt aktuell", "Richtig, wenn dein System einfach aktuell bleiben soll"]);
expect(wartungTiers[1].zeilen.laeuft[0]).toBe("Alles aus Minimum");
expect(wartungTiers[1].zeilen.laeuft).toContain("Überwachung mit echtem Alarm");
expect(wartungTiers[1].motto).toBe("Ich passe im Hintergrund auf");
expect(wartungTiers[3].grenze).toBe("Für höchstens zwei Betriebe");
expect(WARTUNG_TITEL).toBe("Die vier Stufen unterscheiden sich darin, wie viel Zeit du von mir bekommst.");
expect(WARTUNG_HINWEIS).toBe("Ab dem 3. Monat monatlich kündbar. Kündigst du, läuft dein System weiter, nur ohne Updates und Anpassungen von mir.");
expect(wartungPreisSatz()).toBe(
  "Vier Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: Minimum für 95, Basis für 249 oder Standard für 945 Euro im Monat, netto und ab dem 3. Monat monatlich kündbar. Partner gibt es auf Anfrage und für höchstens zwei Betriebe.",
);
expect(wartungPreisSatz()).not.toMatch(/9\.?900|undefined|NaN/);
```

Existing tests that index tiers by position (`wartungTiers[2]` = Partner, Minimum vs Standard comparisons, „4 Wochen“/„2 Wochen“ lines, copy guard loop) shift by one: Basis keeps today's Minimum content (4-week call), Standard keeps its 2-week call, Partner moves to index 3.

- [ ] **Step 2: Run, expect FAIL** — `npx vitest run src/lib/wartung.test.ts`

- [ ] **Step 3: Implement in `wartung.ts`**

Prepend the Minimum tier (copy exactly as in the test), rename today's Minimum to `id: "basis", name: "Basis"` with `laeuft: ["Alles aus Minimum", "Überwachung mit echtem Alarm", "Backup geprüft", "Doku bei jeder Änderung", "KI-Modelle und Prompts aktuell, wenn dein System KI nutzt"]`, drop Partner's `preisNetto`. Re-add `wartungPreis`, `WARTUNG_PREIS_ZUSATZ`, `WARTUNG_PREIS_LABEL` (removed in `a1cb844`); `wartungPreis` returns `"Auf Anfrage"` when `preisNetto` is undefined. Build `wartungPreisSatz` from the first three tiers. Standard's `laeuft[0]` changes from „Alles aus Minimum“ to „Alles aus Basis“ (add `expect(wartungTiers[2].zeilen.laeuft[0]).toBe("Alles aus Basis")` to Step 1).

- [ ] **Step 4: Change the Betreuung card** in `leistungenPages.ts`: body → „Kündigst du, läuft dein System weiter, nur ohne Updates und Anpassungen von mir. Server, Konten, Daten und Doku bleiben bei dir.“ Grep `src/` and `content/` for `sicher weiter` and change any other hit the same way.

- [ ] **Step 5: Run `npx vitest run src/lib`**, expect PASS (fix `faq.test.ts` / `leistungenPages.test.ts` if they pin old strings).

- [ ] **Step 6: Commit** `feat: four Wartung tiers, Partner on request, honest cancellation line`

### Task 2: Table with four columns and the price row

**Files:**
- Modify: `src/components/leistungen/page/WartungTabelle.tsx`, `src/components/leistungen/page/blocks.test.tsx`, `src/app/leistungen/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: `wartungTiers`, `wartungPreis`, `WARTUNG_PREIS_ZUSATZ`, `WARTUNG_PREIS_LABEL` from Task 1.

- [ ] **Step 1: Tests**
  - `blocks.test.tsx`: 4 header columns; last `tbody` row has `data-preis`, row label `Preis`; price cells read `95 €`, `249 €`, `945 €` each with `im Monat, netto`; Partner cell reads `Auf Anfrage` plus `Für höchstens zwei Betriebe` and **not** `im Monat, netto`; the Ergebnis row sits directly before the price row; table wrapper has class `lg:block` and `hidden`, card list has `lg:hidden`; 4 cards, each with its price block after Ergebnis; no `€` in Partner's card; no text `undefined`/`NaN` anywhere.
  - `page.test.tsx`: Betreuung renders `95 €`, `249 €`, `945 €`, `Auf Anfrage`; does not contain `9.900`.
- [ ] **Step 2: Run, expect FAIL** — `npx vitest run src/components/leistungen src/app/leistungen`
- [ ] **Step 3: Implement.** Restore the price row (`a1cb844^` has the old markup: `git show a1cb844^:src/components/leistungen/page/WartungTabelle.tsx`) with Ergebnis back to top corners only (`rounded-tl-2xl` / `rounded-tr-2xl`) and the price row closing the Standard frame; Partner's `Grenze` moves back into its price cell (drop it from the header and the card top). Breakpoint `md` → `lg` on both wrappers. Header label column width ~18 % so four tier columns fit.
- [ ] **Step 4: Run, expect PASS**; `npx tsc --noEmit`.
- [ ] **Step 5: Commit** `feat: Betreuung table shows four tiers with prices, Partner on request`

### Task 3: Fahrplan always included

**Files:**
- Modify: `src/lib/leistungenPages.ts:119,120,137`, `src/lib/prozessCheck.ts:~210-216`, `src/lib/prozessCheckEmail.ts:68,87`, their tests.

- [ ] **Step 1: Tests:** a guard in `leistungenPages.test.ts` and `prozessCheckEmail.test.ts` (html + text) and `prozessCheck.test.ts` that the copy contains no `/Lohnt sich etwas|Wenn sich etwas lohnt/`.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: New copy**
  - audit meta (119): „Kostenloser Prozess-Audit und KI-Beratung für Betriebe und Unternehmen: Ich gehe deine Abläufe mit dir durch und du bekommst deinen Fahrplan.“
  - audit kurz (120): „Kostenlos: Ich gehe deine Abläufe mit dir durch und du bekommst deinen Fahrplan.“
  - audit step (137): „Ein bis zwei Werktage später bekommst du deinen Fahrplan.“
  - Prozess-Check result: replace „Lohnt sich etwas, zeigt dir ein Fahrplan den Weg.“ with „Danach zeigt dir dein Fahrplan den Weg.“; drop the „at Vrelo's discretion“ comment.
  - E-mail (html + text): „Lass uns 30 Minuten drüber sprechen. Danach bekommst du einen Fahrplan von mir, der dir gehört.“
- [ ] **Step 4: Run `npx vitest run src/lib`, expect PASS** (copy guards included).
- [ ] **Step 5: Commit** `fix: the Fahrplan is always part of the free path`

### Task 4: Signature in the Prozess-Check result e-mail

**Files:**
- Create: `src/lib/email/signatur.ts`, `src/lib/email/signatur.test.ts`
- Modify: `src/lib/prozessCheckEmail.ts` (replace „Bis bald / Ajdin von Vrelo“ block), `src/lib/prozessCheckEmail.test.ts`

**Interfaces:**
- Produces: `signaturHtml(): string`, `signaturText(): string[]` (lines), both from one `SIGNATUR` constant: name „Ajdin Dzafic“, role „Gründer · Vrelo“, claim „Durchdachte Automatisierung für Betriebe und Unternehmen.“, phone „+49 176 4380 6085“ (`tel:+4917643806085`), mail „ajdin@vrelo-ki.de“ (`mailto:`), site „vrelo-ki.de“ (`siteUrl` from `src/lib/site.ts`), „LinkedIn“ (`linkedinProfileUrl`), address „Dietrich-Bonhoeffer-Straße 2 · 93055 Regensburg“.

- [ ] **Step 1: Tests** (`signatur.test.ts`): text lines equal exactly
  `["Ajdin Dzafic", "Gründer · Vrelo", "Durchdachte Automatisierung für Betriebe und Unternehmen.", "+49 176 4380 6085  ·  ajdin@vrelo-ki.de", "vrelo-ki.de  ·  LinkedIn: <linkedinProfileUrl>", "Dietrich-Bonhoeffer-Straße 2 · 93055 Regensburg"]`; html contains `href="tel:+4917643806085"`, `href="mailto:ajdin@vrelo-ki.de"`, `href="${linkedinProfileUrl}"`, `href="${siteUrl}"`, „Vrelo“ in Georgia italic. `prozessCheckEmail.test.ts`: html and text both contain the name line and phone; the line „Ajdin von Vrelo“ is gone; a „Bis bald“ greeting stays above the signature.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** with inline styles matching the mail (12.5–13px, `#696359` for the detail lines, name bold `#0a2538`); links styled `color:#1b5063`.
- [ ] **Step 4: Run, expect PASS.** Render one preview to a scratch HTML file and open it once to eyeball.
- [ ] **Step 5: Commit** `feat: signature in the Prozess-Check result e-mail`

### Task 5: Small review fixes

**Files:**
- Modify: `src/lib/referenzen.ts:71`, `src/components/home/Werkzeuge.tsx:38`, `src/lib/legal/impressum.ts:11`, `src/lib/faq.ts` (data group), their tests.

- [ ] **Step 1: Tests:** MDZ `ergebnis` has no „Website modernisiert.“; Werkzeuge heading = „Lässt sich an die Werkzeuge anbinden, die du schon nutzt.“; Impressum contains „Mein Angebot richtet sich ausschließlich an Unternehmen, nicht an Verbraucher.“; FAQ has question „Unterschreibst du einen Vertrag zur Auftragsverarbeitung?“ in the group that holds „Was passiert mit meinen Daten?“, right after it.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.** FAQ answer: „Ja. Verarbeitet dein System personenbezogene Daten, etwa von Kunden oder Mitarbeitern, schließen wir vor dem Start einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO. Telegram nutze ich nur, wenn du es willst. Für sensible Daten läuft dein System über E-Mail oder einen Kanal, den dein Betrieb schon nutzt.“ B2B line as its own paragraph after the Anbieter block (separate section body line, not inside the address).
- [ ] **Step 4: Run `npx vitest run`, expect PASS.**
- [ ] **Step 5: Commit** `fix: review points (MDZ case, tools heading, B2B line, AVV in FAQ)`

### Task 6: Claude naming + new tutorial clip

**Files:**
- Copy: `C:\Users\ajdin\Downloads\edit\final.mp4` → `public/video/claude-gehirn-anleitung.mp4`; `C:\Users\ajdin\Downloads\edit\poster.webp` → `public/video/claude-gehirn-anleitung.webp`
- Modify: `src/app/claude-gehirn/page.tsx:120` (`height={924}`), `src/lib/claudeGehirnPage.ts`, `src/lib/vorlagen.ts:170`, `content/claude-gehirn/prompt.txt:14`, `src/lib/claudeGehirn.test.ts:67-70`, `src/lib/claudeGehirnPage.test.ts:112`

- [ ] **Step 1: Verify** with one WebSearch on the Anthropic help center: is folder work in the Claude desktop app still a paid feature (keep or drop „ab Pro“)? Record the answer in the commit message.
- [ ] **Step 2: Tests:** no „Cowork“ anywhere in `claudeGehirnPage.ts`, `vorlagen.ts`, `prompt.txt` (one test each file); prompt contains „den Pfad zu einem Ordner, den ich in Claude hinzugefügt habe“; step 2 = „Öffne die Claude-App, klick unter dem Eingabefeld auf „Project or folder“, dann auf „Add folder“ und wähl deinen Ordner aus.“; caption „Die Einrichtung in 18 Sekunden, ohne Ton.“; page video `height` 924.
- [ ] **Step 3: Run, expect FAIL.**
- [ ] **Step 4: Implement.** Replacements: intro „Ein kostenloser Text für die Claude-App (ab Pro): …“ · copied label „Kopiert. Jetzt in Claude einfügen.“ · video label „Video: die Einrichtung in der Claude-App, Schritt für Schritt“ · „Die Claude-App ist nur ein Weg. Ich selbst arbeite mit Claude Code …“ (rest unchanged) · „Starte Claude ab jetzt immer in diesem Ordner.“ · „Claude hat keinen Schreibschutz für hinzugefügte Ordner. Dass es sie nicht ändert, steht als Regel im Text.“ · Vorlagen card „Ein fertiger Text für die Claude-App: …“. Copy both video files.
- [ ] **Step 5: Run `npx vitest run`, expect PASS** (the 2,700-char prompt guard included). `npm run build`, `npm start`, open `/claude-gehirn` and play the clip once.
- [ ] **Step 6: Commit** `feat: Claude-Gehirn on the merged Claude app, new 18 s clip`

### Task 7: Docs and Vault

**Files:** HQ `CLAUDE.md` (§1 none; §2.2 Sales line + Claude-Gehirn line; §4 Betrieb tiers + delivery split; §7 drop the n8n-Cloud-Onboarding ToDo, add „Baupläne: Fahrplan-Satz mit dem Begriffs-Review“), `Knowledge/Strategy/Pricing.md` §4/§5, `Clients/_kit/README.md` tier table, `Knowledge/marketing/prozess-check-funnel.md` §1a, `Website/CLAUDE.md` (Betreuung bullet, prices bullet, changelog 2026-11-12), Vault light sync (`Vrelo/CLAUDE.md` §6.4).

- [ ] **Step 1:** Update each file; every overturned rule gets a dated note („Ajdin 2026-11-12“).
- [ ] **Step 2:** Verify German quote bytes in edited lines (perl with `\x{…}` escapes).
- [ ] **Step 3:** Commit in each repo that has git (Website, Clients); HQ root and Knowledge are not git.
- [ ] **Step 4:** Ask Ajdin to push `feat/leistungen-vorlagen-garantie` to `main` (deploys all commits since `1e4c967`).
