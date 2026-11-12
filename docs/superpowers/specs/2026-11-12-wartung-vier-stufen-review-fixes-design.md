# Wartung in four tiers + review fixes (2026-11-12)

Owner: Ajdin. Source: an external site assessment (2026-11-12) triaged in chat; most of its "critical" points were stale cache reads, these are the ones Ajdin decided to act on.

## Intent

1. **Betreuung gets a floor.** Some clients only want their system kept current and nothing else. A cheap "das Mindeste" tier (€95) catches them instead of losing them to "no Betreuung at all". The old Minimum becomes Basis. Partner stops showing a price (€9.900 read as absurd next to €95 and invites the "10x jump" objection); it becomes "Auf Anfrage".
2. **Say plainly what happens without Betreuung:** the system keeps running, but updates stop. That replaces every "läuft sicher weiter" line (a liability statement for an unpatched n8n) and is the reason the €95 tier exists.
3. **Fix the copy points the review got right:** Fahrplan promise, MDZ case, outdated Cowork naming, tool-integration claim, AVV, B2B.

## Goals

- Four tiers on `/leistungen/betreuung`, in this order: **Minimum €95 · Basis €249 · Standard €945 · Partner "Auf Anfrage"**. Prices shown again in the table (reverses this morning's commit `a1cb844` for the three lower tiers). Standard stays the highlighted tier.
- FAQ price sentence follows the four tiers; Partner without a number there too.
- Every "if you cancel" line says: keeps running, no more updates from me.
- Fahrplan is **always** part of the free path, no "Lohnt sich etwas" condition anywhere.
- One FAQ entry on the AVV and Telegram; one B2B line; Cowork renamed; MDZ case without "Website modernisiert."; homepage tools heading says "anbinden".

## Non-goals

- **The terms review** (Ajdin's point 9: cut Vorlage/Bauplan/Fahrplan/Prozess-Check/Prozess-Audit/... down to the minimum). Separate project after this one.
- AGB (Ajdin: B2B line only). Telegram alternatives as a build feature. Any change to Velp copy.
- No change to the 3-month minimum term, the guarantee, or build prices.

## Anti-goals (would make this a failure)

- **Vrelo hosting or paying for the server.** The €95 tier keeps the client's own server current; the server and the n8n instance stay on the client's account and card (n8n Sustainable Use License forbids Vrelo hosting n8n as a service; HQ §4 ownership promise). Copy must never say "Hosting bei mir" or imply Vrelo provides the server. "rund 30 €" stays the only server figure.
- A Partner price anywhere public (page, FAQ, JSON-LD, OG text, tests that print it in rendered copy).
- A Minimum that quietly includes more than "updates + keep it running + 72 h fixes" (it is the floor; Basis must still read as clearly more).
- Breaking the copy guards (no dash, German quotes, no comma before "und", generic masculine).

## Decided by Ajdin (as decided)

- Tiers + order + prices: Minimum 95 (new), Basis 249 (= today's Minimum content), Standard 945 (unchanged), Partner "Auf Anfrage" (content unchanged, cap of two Betriebe stays).
- Minimum = updates and keeping the system running on the client's own server; errors fixed within **72 h**; nothing else.
- Without Betreuung updates stop; the "sicher weiter" lines go.
- Prices visible again in the table (except Partner).
- Fahrplan always included.
- Delete "Website modernisiert." (it sits on the **MDZ** card, `src/lib/referenzen.ts`).
- Cowork: adjust to the current Claude naming.
- Werkzeuge heading: "an deine Werkzeuge anbinden".
- FAQ: add an AVV / Telegram entry.
- B2B: one line, no AGB.

- **Every build runs on the client's own server, never on an n8n Cloud account** (Ajdin 2026-11-12: „we will always pursue this way“). Overturns HQ §4 „non-sensitive builds on the client's own n8n Cloud account“; update HQ §4, §7 (n8n-Cloud-Onboarding-Rezept ToDo) and any public copy that mentions n8n Cloud. Minimum's „Updates für Server und Programme“ therefore holds for every client.
- **Fahrplan always** also covers the Prozess-Check result e-mail (`src/lib/prozessCheckEmail.ts` ~:68 and ~:87). The Baupläne (`bauplanReihe/shared.ts:53` + the 14 templates + PDFs) are **out of scope here**; they change with the terms review.
- **Signature in the Prozess-Check result e-mail** (the mail to the lead), as Ajdin gave it:
  Ajdin Dzafic / Gründer · Vrelo / Durchdachte Automatisierung für Betriebe und Unternehmen. / +49 176 4380 6085 · ajdin@vrelo-ki.de / vrelo-ki.de · LinkedIn / Dietrich-Bonhoeffer-Straße 2 · 93055 Regensburg.
  „vrelo-ki.de“ and „LinkedIn“ are links (site + founder profile `linkedinProfileUrl`), phone as `tel:`, mail as `mailto:`. The phone number lives in the e-mail only; the „no phone number on the site“ decision (2026-11-04) stays. Single source for the block so the Bauplan mails can reuse it later (not wired there in this project).
- **Claude-Gehirn clip:** replaced by Ajdin's new recording (`C:\Users\ajdin\Downloads\Claude_Gehirn.mp4`), cut shorter, private paths blurred, re-encoded to the existing `public/video/claude-gehirn-anleitung.{mp4,webp}` slots. Ajdin reviews the cut before commit.

## Calls made by Claude (check these)

- **Minimum row by row** (proposed German copy, cells as fragments without full stops like the others):
  - motto: Ich halte dein System aktuell
  - Zeit mit mir: Nicht enthalten
  - Fehler behoben in: 72 Stunden
  - Läuft weiter: Updates für Server und Programme · Dein Server bleibt auf deinem Konto
  - Anpassen / Verbessern / Dein Team / Bericht: Nicht enthalten
  - Ergebnis: Es bleibt aktuell · Richtig, wenn dein System einfach aktuell bleiben soll
  - **No monitoring alarm in Minimum**: the real alarm becomes the first thing Basis adds over Minimum (Basis "Läuft weiter": Alles aus Minimum · Überwachung mit echtem Alarm · Backup geprüft · Doku bei jeder Änderung · KI-Modelle und Prompts aktuell, wenn dein System KI nutzt). Consequence: in Minimum the client notices a failure himself and mails it in; the 72 h run from his message.
  - Basis keeps today's Minimum content otherwise, motto "Ich passe im Hintergrund auf".
- The 3-month minimum term applies to all four tiers (one cancellation line stays true everywhere).
- Price cell for Partner reads "Auf Anfrage" plus the existing "Für höchstens zwei Betriebe"; the price row comes back as the last row with label "Preis" and suffix "im Monat, netto" (the three numeric tiers only). `preisNetto` becomes optional on the type; Partner has none.
- FAQ sentence: "Vier Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: Minimum für 95, Basis für 249 oder Standard für 945 Euro im Monat, netto und ab dem 3. Monat monatlich kündbar. Partner gibt es auf Anfrage und für höchstens zwei Betriebe."
- Scope of the cancellation change: only lines that promise **„sicher“** after cancelling change (`WARTUNG_HINWEIS`, Betreuung Warum card, any FAQ line with „sicher weiter“). Lines that only say „läuft weiter“ are true and stay: homepage Proof card, FAQ Kosten last sentence (already says the OS patches itself and the apps stay on the handover version), FAQ holiday answer, Ratgeber `was-ist-ein-ki-server.mdx`, `_kit` Angebot („Hörst du mit mir auf, läuft es weiter.“). Builder greps for „sicher“ near „weiter“ across `src/` and `content/` to catch the rest.
- Cancellation line (`WARTUNG_HINWEIS`, Betreuung Warum card, FAQ wherever it says so): "Kündigst du, läuft dein System weiter, nur ohne Updates und Anpassungen von mir." Wording "von mir" on purpose: the server's own OS auto-patching (VreloVPS standard) keeps running, so "ohne Updates" alone would be untrue.
- Layout: four columns are too tight at 768 px. The real table shows from `lg` up, cards below `lg` (today: `md`).
- Fahrplan wording: audit page meta + kurz + step ("Ein bis zwei Werktage später bekommst du deinen Fahrplan.") and the Prozess-Check result copy (`prozessCheck.ts` ~line 215) drop "Lohnt sich etwas"; the Prozess-Check code comment about "at Vrelo's discretion" goes too.
- Werkzeuge heading: "Lässt sich an die Werkzeuge anbinden, die du schon nutzt."
- AVV FAQ entry (group Sicherheit/Datenschutz): question "Unterschreibst du einen Vertrag zur Auftragsverarbeitung?" Answer: yes, before the start whenever the system touches personal data (Art. 28 DSGVO); Telegram (MDZ assistant) only if the owner wants it, for sensitive data the system runs on e-mail or a channel the business already uses. No claim about Telegram's server location.
- B2B line: Impressum, under Anbieter: "Mein Angebot richtet sich ausschließlich an Unternehmen, nicht an Verbraucher." The Verbraucherstreitbeilegung sentence stays (harmless, already there).

## Constraints

- All German copy lives in the typed copy modules (`src/lib/wartung.ts`, `faq.ts`, `leistungenPages.ts`, `referenzen.ts`, `vorlagen.ts`, `claudeGehirnPage.ts`, `prozessCheck.ts`, `legal/impressum.ts`), components hold no strings except `Werkzeuge.tsx` (heading is inline today; move or edit in place, builder's call).
- Copy guards: `findCopyIssues`, `kommaUnd.test.ts`, German quotes U+201E/U+201C. Edit/Write downgrade the closing quote: verify bytes after writing.
- `content/claude-gehirn/prompt.txt` is pinned by `claudeGehirn.test.ts` (≤ 2,700 chars, plain text, must-carry rules) and the folder tree on the page.
- Tests run from `C:\Users\ajdin\Vrelo\Website` in PowerShell (a `/c/` path makes the whole suite fail).
- Push to `main` deploys; Ajdin approves the push.

## Cowork (needs verification by the builder)

Anthropic merged Cowork into the main Claude app on 2026-09-16 (two modes: Chat and Code; staged rollout). Builder: confirm the current name and the exact way to work in a local folder in today's Claude desktop app (Anthropic help center), then rename across `claudeGehirnPage.ts` (8 mentions incl. the copied-label and the requirement line "ab Pro"), `vorlagen.ts` card text, and `prompt.txt` line 14 ("in Cowork hinzugefügt"). Keep the "Claude Code works too" note. The new recording shows the current UI; the page copy (steps, video label, copied-label) follows what that recording shows.

## Docs to update after the build

HQ `CLAUDE.md` §4 (Betrieb tiers), §2.2 Sales line (Fahrplan no longer conditional) · `Knowledge/Strategy/Pricing.md` §4/§5 · `Clients/_kit/README.md` tier table · `Knowledge/marketing/prozess-check-funnel.md` §1a (Fahrplan rule overturned, dated) · `Website/CLAUDE.md` (Betreuung bullet, prices bullet, changelog) · light Vault sync.

## Left to the builder

Component structure for the price row, test rewrites, where the AVV entry sits inside its FAQ group, exact Cowork wording once verified.
