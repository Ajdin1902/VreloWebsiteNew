# Claude-Gehirn: free setup prompt + page — Design

**Date:** 2026-10-03 · **Status:** approved in conversation, awaiting spec review · **Repo:** `Website/` (branch `feat/claude-gehirn`)

## 1. Why

A free asset for owners and teams who use Claude: **one ready-to-paste prompt that sets up a personal business brain** in a folder, built on the same principles Vrelo's own brain runs on (HQ `CLAUDE.md` router + `Vrelo/` LLM wiki + memory). The owner pastes it once; from then on Claude knows the business, files new information on its own and keeps itself tidy.

**It is a gift, not a funnel.** No email gate, no CTA, no ask anywhere on the page or in the post. Its value to Vrelo is indirect: it shows the „Claude für Unternehmen“ and KI-Schulung competence (HQ §3, KI-Menü 2026-10-01) by giving the real thing away, and it gives the LinkedIn channel a substantial, shareable post.

## 2. Decisions (made in conversation 2026-10-03)

| # | Decision | Why |
|---|---|---|
| D1 | **Surface: Claude Desktop app, Cowork, nothing else installed.** Page states this up front. | Our brain lives in files; Cowork reads/writes a local folder without VS Code, terminal or Git. Browser Projects can't write files → no self-maintenance. |
| D2 | **Delivery: website page `/claude-gehirn`, ungated, no CTA.** Announced as a LinkedIn post that carries the full prompt; page link in the first comment (playbook: no links in the post). | Pure gift; value first. |
| D3 | **One compact prompt, identical everywhere** (approach A). Rejected: short/long two-version split (two to maintain, „the better one is on the site“ reads as an ask); bootstrap-from-URL prompt (prompt-injection pattern, ties their brain to our site, breaks „kein Waisenkind“). | One source of truth. |
| D4 | **Prompt budget ≤ 2,700 characters, plain text** (no `**`, `#`, backticks). LinkedIn post max 3,000 chars, plain text; comments max 1,250 → the prompt can't be split across comments. | Fits in the post with a short intro. |
| D5 | **Self-maintenance lives as rules in `CLAUDE.md`, not as a skill.** | `CLAUDE.md` is auto-loaded by Cowork every session; skill pick-up from a shared folder is unverified. |
| D6 | **„Arbeit zuerst“ overrides all upkeep rules.** | The brain must never turn work into a documentation chore. |
| D7 | Plain body-text link from `/leistungen/claude` to `/claude-gehirn`. | Brings service-page visitors to the gift; it's a link on the service page, not a CTA on the gift page. |

## 3. Facts the design rests on (researched 2026-10-03, partly from secondary sources → verified in §8 tests)

- Cowork: in Claude Desktop, Windows + macOS, **paid plans only (Pro, Max, Team, Enterprise)**, still a **research preview**. Works on one user-selected folder; files persist on disk.
- Cowork **auto-loads `CLAUDE.md`** from the selected folder at session start (support.claude.com article 13345190). The prompt still tells Claude to read it first, as a belt-and-braces line.
- Cowork **scheduled tasks cannot access local folder files** → no overnight self-maintenance; upkeep happens in sessions.
- The Desktop „Code“ tab (Claude Code) also loads `CLAUDE.md` and needs no Git on Windows → valid fallback, named in the FAQ.

## 4. What the prompt makes Claude build

```
Mein Gehirn/
├── CLAUDE.md      das Gehirn: wird in jeder Sitzung zuerst geladen
├── inhalt.md      Landkarte: jede Seite, eine Zeile
├── verlauf.md     Verlauf: datiert, nur anhängen
├── quellen/       Rohmaterial des Inhabers. Claude liest, ändert nie.
└── wissen/        Seiten, die Claude schreibt und aktuell hält
    ├── kunden/
    ├── ablaeufe/
    └── themen/    (Claude legt weitere Ordner an, wenn nötig)
```

**Per file:**
- **`CLAUDE.md`** (≤ 150 lines): Wer ich bin und was mein Betrieb macht · Woran ich gerade arbeite (priorities, ordered) · Offene Fragen ❓ + To-dos ☐ with absolute dates · Entscheidungen (date + reason) · So arbeiten wir (preferences + corrections; replaces our separate memory system) · the one routing rule: „Für alles, was hier nicht steht: erst `inhalt.md` lesen, dann die passende Seite öffnen.“ The rules from §5 live here too.
- **`inhalt.md`** = our `Vrelo/index.md`: one line per page (path + one sentence), grouped by folder; updated whenever a page is added or renamed. The only map (no separate „Wegweiser“ in `CLAUDE.md`).
- **`verlauf.md`**: dated, append-only, newest at the bottom; what changed, which pages, why. Claude reads only the last 20 entries unless asked.
- **`wissen/<ordner>/<seite>.md`**: one topic per page; „Stand: TT.MM.JJJJ“ line, 1–3 sentence lead, content, links to related pages, source note when content came from `quellen/`.
- **`quellen/`**: whatever the owner drops in; never edited.

Mapping to ours: `CLAUDE.md` = HQ router; `quellen/` + `wissen/` + `inhalt.md` + `verlauf.md` = the `Vrelo/` vault. Dropped on purpose: separate schema file (merged into `CLAUDE.md`), separate memory folder (→ „So arbeiten wir“), YAML frontmatter (→ „Stand:“ line).

## 5. Character and rules (content the prompt must carry)

**Character:** „Du bist mein Partner für meinen Betrieb, nicht nur ein Assistent: du denkst mit, sagst ehrlich, wenn du etwas anders sehen würdest, und sprichst klar und kurz.“

**Rule 0, ranks above all upkeep rules: Arbeit zuerst.**
- The owner's task comes first; upkeep happens after, never in front of the work.
- Save only what passes „Brauche ich das in einem Monat noch?“ (customers, prices, decisions, how something is done, deadlines, preferences); not wording drafts, small talk, one-off questions, intermediate steps.
- Claude decides what to save; never asks „Soll ich das speichern?“, never asks the owner to write or review anything; the owner never edits a file. Only exception: a real contradiction → one short question.
- Write per finished task, not per message.
- Report quietly: at most one line at the end of an answer („Notiert: …“); nothing on days with nothing new.

**Wahrheit**
1. Eine Quelle der Wahrheit: current state lives in the brain, not in the chat.
2. Erst nachsehen, dann fragen: `CLAUDE.md` → `inhalt.md` → page, before asking or re-deriving.
3. Nichts erfinden: say when the brain doesn't know; mark guesses „Vermutung“.
4. Widersprüche zeigen, nie still überschreiben: keep both, mark, let the owner decide.

**Ordnung**
5. `quellen/` stays untouched.
6. Absolute dates („bis 10.10.2026“, never „nächste Woche“).
7. **`CLAUDE.md` bleibt schlank:** hard cap 150 lines · test: only what almost every session needs, everything else → page + one line in `inhalt.md` · pruning in step „Aufräumen“ (done to-dos out, answered questions → decision or page, decisions older than ~3 months → `wissen/themen/entscheidungen.md`) · at the cap: trim before adding, and say what moved where.

**Pflege (automatic, no instruction needed)**
8. Sitzungsstart: files in `quellen/` not yet named in `verlauf.md` are read and filed; one-line report.
9. Mitschreiben: worth-keeping facts from the conversation are filed when a task is finished (Rule 0 applies).
10. Aufräumen: when a task is done or the owner says „fertig“, apply rule 7's pruning; log in `verlauf.md`.
11. Gesundheitscheck: if the last check in `verlauf.md` is > 14 days old, spend a minute at session start on contradictions, stale pages, pages missing from `inhalt.md`, old open questions; list at most three, ask before changing; „später“ postpones without follow-up.
12. Korrekturen merken: a correction goes under „So arbeiten wir“.

**Sicherheit**
13. Ask before deleting, overwriting, or anything that leaves the folder (mail, upload).
14. Never store passwords, access data or bank data.

## 6. Setup flow (what happens after pasting)

1. **Look before building.** Empty folder → start. Existing files → list them and ask whether to move them into `quellen/`; nothing moves without a yes.
2. **Documents first.** Claude asks the owner to drop into `quellen/` whatever describes the business (Angebote, Preislisten, Website-Text, Notizen, typische Mails, Vorlagen), reads it, says in a few lines what it learned, then asks **only what's missing** from: Rolle · Betrieb (was, seit wann, wie viele) · Kunden und wie sie kommen · tägliche Programme · aktuelle Ziele · größter Zeitfresser · Schreibstil (kurz/ausführlich, du/Sie mit Kunden) · Tabus. One question at a time; „weiter“ skips. No documents → the full interview.
3. **Build.** Folders + files; `CLAUDE.md` from the answers; first page `wissen/ablaeufe/<aufgabe>.md` from the biggest time-eater (how it's done today); `inhalt.md`; first `verlauf.md` entry.
4. **Short tour.** Five lines on what now exists + three example sentences for tomorrow („Ich hab gerade mit Kunde X telefoniert: …“ · „Was steht diese Woche an?“ · „fertig“).

**Budget:** prompt ≤ 2,700 characters. If over: shorten the interview list first, never the rules.

## 7. The page `/claude-gehirn`

Indexed, in the sitemap. Working title „Ein Gehirn für deinen Betrieb, mit Claude“ (final copy through stop-slop + Brand.md). **No CTA in the page body.**

**Chrome (decided 2026-10-03, option a):** normal site chrome; the `Header` keeps its Prozess-Check button (site chrome every visitor expects), but the page has **no `ClosingCta`** and nothing in the body asks for anything. Rejected: focus route with logo-only chrome (removes site navigation).

1. **Opening:** one sentence what it is + „kostenlos, ohne Anmeldung“.
2. **Was du brauchst:** Claude Desktop app (Windows or Mac) · a paid Claude plan (Pro or higher; Cowork isn't in the free plan) · about 15 minutes · Cowork is a research preview at Anthropic and can change.
3. **In drei Schritten:** create an empty folder → choose it in Cowork → paste the prompt. Tip: existing documents into `quellen/` = fewer questions.
   **„Wo du den Ordner anlegst“** (inside step 1):
   - **Lokal** (Windows C:, e.g. `Dokumente\Mein Gehirn`; Mac: folder outside iCloud): ➕ fastest, offline, no sync in between ➖ only on this device, no backup unless you make one.
   - **OneDrive** (Windows + Mac): ➕ automatic backup, version history, readable on the phone ➖ set „Immer auf diesem Gerät behalten“ or files stay cloud-only; duplicates when edited on two devices at once.
   - **iCloud Drive** (Mac): ➕ built in, nothing to install ➖ switch off „Mac-Speicher optimieren“; works well only on Apple devices.
   - **Google Drive** (Windows + Mac, Google Drive app): ➕ backup across devices ➖ default „Streamen“ keeps files cloud-only → set the folder „Offline verfügbar“ or use „Spiegeln“; one more app to install.
   - **So machen wir es:** our brain lives locally on C: for the best speed, accepting it's only on this computer; a backup script copies it to OneDrive every hour. Without your own backup: OneDrive with „Immer auf diesem Gerät behalten“ comes closest.
   - Warnings: Windows „Dokumente“ often already lives in OneDrive, Mac's „Schreibtisch- und Dokumente-Ordner“ option does the same with iCloud → check the path. No USB stick, external drive or network drive.
4. **Der Prompt:** copy box + „Kopieren“ button; text identical to the post.
5. **Was danach in deinem Ordner liegt:** the tree + one sentence per file (§4).
6. **Die Regeln dahinter:** why each rule exists, first person from our own daily use („So arbeite ich selbst jeden Tag“). This is the page's proof.
7. **Im Alltag:** five example sentences.
8. **Was nicht hineingehört:** passwords, health data, confidential client data; everything goes to Anthropic; check the privacy settings for whether chats may be used for training.
9. **Fragen:** Gehört das mir? (plain text files on your disk, take them anywhere) · Was, wenn Cowork sich ändert? · Geht es ohne Cowork? (yes, the Code tab of the same app).
10. One line: „Vrelo ist nicht mit Anthropic verbunden.“

**Also:** plain body-text link on `/leistungen/claude` → `/claude-gehirn` (D7).

**Copy rules (unchanged house rules):** German, „du“, generic masculine, no Gedankenstrich, no „, und“, „…“ quotes, *Vrelo* in Fraunces italic, never „Partner“/„zertifiziert“ next to Claude or Anthropic (UWG §5; the character line in the prompt is Claude-as-the-owner's-partner, not a Vrelo–Anthropic claim), no Vrelo prices. The Anthropic plan is named without a euro figure (prices vary by region and change); ❓ verify the current Pro price before deciding whether to mention one.

## 8. Single source + LinkedIn

- The prompt text lives in **exactly one file** in the website repo (e.g. `src/content/claude-gehirn-prompt.txt`). The page reads it; the LinkedIn post file copies it verbatim.
- The post runs through the `writing-linkedin-posts` skill: short intro + the prompt as plain text; page link in the first comment.

## 9. Testing (before anything goes public)

1. **Automated guard** (Vitest) on the source file: ≤ 2,700 characters · no Markdown characters (`**`, `#`, backticks) · no Gedankenstrich (U+2013/U+2014) · no „, und“ · German quotes only (no ASCII `"`). Every non-ASCII character in test regexes as an escape (HQ §9 perl/regex trap).
2. **Live runs in Cowork on Ajdin's machine**, fresh empty folder each:
   - (a) empty folder, no documents → full interview, all files created, `CLAUDE.md` ≤ 150 lines;
   - (b) folder with Vrelo-shaped test documents in `quellen/` (no real client data) → only missing questions asked;
   - (c) folder in OneDrive → clean read/write; **decides the fallback recommendation** on the page.
3. **Second session (the real test):** new Cowork session, same folder → knows the business unprompted · picks up a new `quellen/` file on its own · stays silent when nothing is new · doesn't save trivia.
4. **Overflow test:** `CLAUDE.md` padded to 150 lines → Claude trims before adding and says what moved where.
5. **Fix → re-run** steps 1–4. Page and post go live only when all pass.

## 10. Out of scope

- A browser/Projects „lite“ version.
- Shipping our backup script.
- Any email capture, CTA or follow-up sequence.
- Skills, scheduled tasks, connectors (MCP) inside the brain — candidates for a later „Ausbaustufe“ page only if the asset proves itself.

## 11. Testergebnis (Cowork, 2026-10-03)

Run by Ajdin on his machine with the prompt as of commit 236fe05 (2,689 chars). Result reported as „successful“ for runs 1 to 4, without per-check detail.

| Run | Ergebnis | Änderung am Prompt |
|---|---|---|
| (a) leerer Ordner | pass (reported) | none |
| (b) Dokumente zuerst | pass (reported) | none |
| (c) OneDrive | pass (reported) | none |
| Zweite Sitzung | pass (reported) | none |
| Überlauf (150 Zeilen) | ☐ open | |

OneDrive-Empfehlung: bleibt (run c passed), `ordner.fallback` unchanged.
