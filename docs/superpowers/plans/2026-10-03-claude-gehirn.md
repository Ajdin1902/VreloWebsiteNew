# Claude-Gehirn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a free, ungated page `/claude-gehirn` that gives away one ready-to-paste prompt which sets up a self-maintaining business brain in a Claude Cowork folder, plus the LinkedIn post that carries the same prompt.

**Architecture:** The prompt lives in exactly one plain-text file (`content/claude-gehirn/prompt.txt`), read by a tiny server-side loader and guarded by Vitest (length, plain text, house typography, must-carry rules). The page is a static server route whose German copy lives in one typed module (`src/lib/claudeGehirnPage.ts`, house pattern: components hold no German strings); a small client component renders the prompt with a copy button. A live Cowork test run on Ajdin's machine gates the merge.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind v4 tokens · Vitest + React Testing Library (jsdom).

**Spec:** [docs/superpowers/specs/2026-10-03-claude-gehirn-design.md](../specs/2026-10-03-claude-gehirn-design.md)

## Global Constraints

- Branch `feat/claude-gehirn` (already created from `main`, spec committed). Never push to `main` before Task 7's gate; push to `main` auto-deploys.
- Prompt: **≤ 2,700 characters**, plain text, no `#`, no `*`, no backticks (LinkedIn shows them literally).
- All German copy (prompt + page): „du“, generic masculine, **no Gedankenstrich** (U+2013/U+2014), **no comma before „und“**, German quotes „…“ (U+201E/U+201C), never ASCII `"`, no Vrelo price, no euro figure for the Anthropic plan, never „Partner“/„zertifiziert“ next to Claude or Anthropic.
- **No CTA in the page body and no `ClosingCta` on this page.** The site `Header` (with its Prozess-Check button) stays: decided 2026-10-03, spec §7.
- Page is indexed and in the sitemap. Hero image `/images/bg-karst-quelle.webp`.
- ⚠️ Write/Edit downgrade the closing quote U+201C to U+201D. After writing any file with German copy, run the repair and re-check (commands in Task 1 Step 4). In test code, write quote characters as `„` / `“` escapes, never literally.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- Run commands from `Website/`. Manual browser checks use `npm run build && npm start`, not `npm run dev`.

## Review Focus

1. **Clipboard unavailable** (older browser, permission denied, non-secure context): the button must show a visible „copy by hand“ message and the text must stay selectable. Pinned in Task 4.
2. **CRLF checkout on Windows**: `prompt.txt` may come back with `\r\n`, which changes the length count and leaks `\r` into the page. The loader normalises to `\n`. Pinned in Task 1.
3. **Closing-quote downgrade** by the editing tools in `prompt.txt` or the copy module: `findCopyIssues` reports `wrong-closing-quote`. Pinned in Tasks 1 and 3.
4. **Internal link opening a new tab**: `NoteBlock` today forces `target="_blank"` + „(öffnet in neuem Tab)“, which would be false for `/claude-gehirn`. Pinned in Task 6.
5. **Phone width (390 px)**: the long prompt in a `<pre>` can force horizontal page scroll. `whitespace-pre-wrap break-words` is pinned in Task 4; the visual check runs in Task 7.

---

### Task 1: The prompt file, its loader and its guard

**Files:**
- Create: `content/claude-gehirn/prompt.txt`
- Create: `src/lib/claudeGehirn.ts`
- Test: `src/lib/claudeGehirn.test.ts`

**Interfaces:**
- Produces: `getGehirnPrompt(): string` (normalised to `\n`, trimmed) · `PROMPT_MAX_CHARS = 2700` · `promptLength(text: string): number` (Unicode code points).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/claudeGehirn.test.ts
import { describe, it, expect } from "vitest";
import { getGehirnPrompt, promptLength, PROMPT_MAX_CHARS } from "./claudeGehirn";
import { findCopyIssues } from "./ratgeberCopy";

// The prompt is posted verbatim on LinkedIn (plain text, 3,000-char post
// limit, spec D4) and shown on /claude-gehirn. One file, two surfaces.
const prompt = getGehirnPrompt();

describe("Claude-Gehirn prompt", () => {
  it("fits the LinkedIn budget", () => {
    expect(promptLength(prompt)).toBeLessThanOrEqual(PROMPT_MAX_CHARS);
    expect(promptLength(prompt)).toBeGreaterThan(1500);
  });

  it("is normalised: no carriage returns, no outer whitespace", () => {
    expect(prompt).not.toContain("\r");
    expect(prompt).toBe(prompt.trim());
  });

  it("is plain text: no Markdown characters LinkedIn would show literally", () => {
    expect(prompt).not.toMatch(/[#*`]/);
  });

  it("follows the house typography (dashes, quotes, comma before und, gendered forms)", () => {
    expect(findCopyIssues(prompt)).toEqual([]);
  });

  it("carries the structure and the rules the spec requires", () => {
    for (const must of [
      "CLAUDE.md",
      "inhalt.md",
      "verlauf.md",
      "quellen/",
      "wissen/ablaeufe/",
      "150 Zeilen",
      "14 Tage",
      "Arbeit zuerst",
      "Erst nachsehen",
      "Widersprüche",
      "So arbeiten wir",
      "Passwörter",
    ]) {
      expect(prompt).toContain(must);
    }
  });

  it("counts code points, not UTF-16 units", () => {
    expect(promptLength("„ä“")).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/claudeGehirn.test.ts`
Expected: FAIL, `Failed to resolve import "./claudeGehirn"`.

- [ ] **Step 3: Write the loader and the prompt**

```ts
// src/lib/claudeGehirn.ts
//
// The Claude-Gehirn prompt (spec 2026-10-03). It lives in one plain-text file
// so the page and the LinkedIn post can never drift apart. Server-side only.
import fs from "node:fs";
import path from "node:path";

export const PROMPT_PATH = path.join(process.cwd(), "content", "claude-gehirn", "prompt.txt");

/** LinkedIn posts cap at 3,000 characters; the intro above the prompt needs the rest. */
export const PROMPT_MAX_CHARS = 2700;

/** Length in Unicode code points, the way a reader (and LinkedIn) counts characters. */
export function promptLength(text: string): number {
  return [...text].length;
}

export function getGehirnPrompt(): string {
  // A Windows checkout can turn LF into CRLF; normalise so the count and the page match.
  return fs.readFileSync(PROMPT_PATH, "utf8").replace(/\r\n/g, "\n").trim();
}
```

`content/claude-gehirn/prompt.txt` (draft v1; Task 2 may revise it):

```text
Richte in diesem Ordner ein Gehirn für meinen Betrieb ein, das sich selbst aktuell hält.

Du bist mein Partner für den Betrieb, nicht nur ein Assistent. Du denkst mit und sprichst klar und kurz. Siehst du etwas anders, sagst du es ehrlich.

Aufbau:
CLAUDE.md: wer ich bin, was mein Betrieb macht, woran ich gerade arbeite, offene Fragen und To-dos mit Datum, Entscheidungen mit Datum und Grund, „So arbeiten wir“ (meine Vorlieben und Korrekturen) und diese Regeln. Höchstens 150 Zeilen, nur was fast jede Sitzung braucht.
inhalt.md: jede Seite mit Pfad und einem Satz.
verlauf.md: datierte Einträge, nur anhängen, lies nur die letzten 20.
quellen/: mein Rohmaterial. Lesen, nie ändern.
wissen/kunden/, wissen/ablaeufe/, wissen/themen/: eine Seite pro Thema mit „Stand: TT.MM.JJJJ“, Links auf verwandte Seiten und Quelle.

Einrichtung:
1. Liegen schon Dateien im Ordner, frag, ob sie nach quellen/ dürfen.
2. Bitte mich, Unterlagen in quellen/ zu legen (Angebote, Preislisten, Notizen, Mails). Lies sie und sag kurz, was du gelernt hast.
3. Frag dann einzeln nur, was fehlt: Rolle, Betrieb, Kunden, Programme, Ziele, größter Zeitfresser, Schreibstil, Tabus. „weiter“ überspringt.
4. Leg alles an. Aus dem größten Zeitfresser wird die erste Seite in wissen/ablaeufe/.
5. Zeig mir das Ergebnis in fünf Zeilen und drei Beispielsätze für morgen.

Regeln für jede Sitzung:
Arbeit zuerst: Meine Aufgabe kommt vor der Pflege. Speichere nur, was ich in einem Monat noch brauche, etwa Kunden, Preise, Entscheidungen, Abläufe, Fristen, Vorlieben. Das entscheidest du selbst, frag nie „Soll ich das speichern?“. Schreib nach jeder erledigten Aufgabe, melde das in höchstens einer Zeile („Notiert: …“), ohne Neues gar nicht.
Erst nachsehen, dann fragen: CLAUDE.md, dann inhalt.md, dann die Seite.
Nichts erfinden. Vermutungen als Vermutung kennzeichnen.
Widersprüche zeigen, nie still überschreiben. Ich entscheide.
Immer absolute Daten, nie „nächste Woche“.
Zu Beginn jeder Sitzung: CLAUDE.md lesen und Dateien in quellen/, die noch nicht in verlauf.md stehen, einarbeiten.
Ist der letzte Gesundheitscheck in verlauf.md über 14 Tage alt: nach Widersprüchen, Veraltetem und alten Fragen schauen, höchstens drei Punkte nennen, erst nach meinem Ja ändern. „später“ verschiebt ihn.
Ist eine Aufgabe fertig oder sage ich „fertig“: aufräumen. Erledigtes aus CLAUDE.md streichen, Details auf Seiten auslagern, alte Entscheidungen nach wissen/themen/entscheidungen.md. Ist CLAUDE.md voll, erst kürzen, dann ergänzen.
Korrigiere ich dich, notier es unter „So arbeiten wir“.
Frag, bevor du löschst, überschreibst oder etwas den Ordner verlässt.
Keine Passwörter, Zugangs- oder Bankdaten.
```

- [ ] **Step 4: Repair and verify the German quotes**

```bash
f=content/claude-gehirn/prompt.txt
perl -CSD -0777 -i -pe 's/\x{201E}([^\x{201E}\x{201C}\n]*?)\x{201D}/\x{201E}${1}\x{201C}/g' $f
perl -CSD -0777 -ne '$o=()=/\x{201E}/g; $c=()=/\x{201C}/g; $w=()=/\x{201D}/g; print "open $o close $c wrong $w\n"' $f
```
Expected: `open N close N wrong 0` (same N twice).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/claudeGehirn.test.ts`
Expected: PASS, 6 tests. If „fits the LinkedIn budget“ fails, shorten the interview line (Einrichtung step 3) first, never the rules (spec §6).

- [ ] **Step 6: Commit**

```bash
git add content/claude-gehirn/prompt.txt src/lib/claudeGehirn.ts src/lib/claudeGehirn.test.ts
git commit -m "feat(claude-gehirn): prompt file, loader and guard

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Live gate in Cowork (Ajdin runs it, Claude guides and records)

Blocks the merge in Task 7, not the build: Tasks 3 to 6 may proceed while this is pending. Every finding that changes the prompt goes back through Task 1 Steps 4 and 5.

**Files:**
- Modify: `content/claude-gehirn/prompt.txt` (only if a run fails)
- Modify: `docs/superpowers/specs/2026-10-03-claude-gehirn-design.md` (append §11 „Testergebnis“)
- Test material (outside the repo, never committed): three fictional files

- [ ] **Step 1: Prepare the fictional test material** in a scratch folder (no real client data):

`angebot-musterstrasse.txt`:
```text
Malerbetrieb Huber, Inhaber Thomas Huber, Regensburg. Angebot Nr. 2026-114 für Familie Berger, Musterstraße 4: Wohnzimmer und Flur streichen, 62 m² Wandfläche, Abdeckarbeiten, 1.480 Euro netto. Gültig bis 31.10.2026.
```
`preisliste-2026.txt`:
```text
Preisliste Malerbetrieb Huber 2026: Wände streichen 14 Euro/m², Decken 17 Euro/m², Lackierarbeiten Türen 95 Euro/Stück, Anfahrt Stadtgebiet frei, Umland 35 Euro.
```
`notizen.txt`:
```text
5 Mitarbeiter, 2 Azubis. Termine im Google Kalender, Angebote in Word. Mich nervt: jedes Angebot von Hand aus alten Word-Dateien zusammenkopieren, ca. 4 Std. pro Woche. Mit Kunden immer Sie.
```

- [ ] **Step 2: Run (a), empty folder, no documents.** New empty local folder, choose it in Cowork, paste the prompt from `content/claude-gehirn/prompt.txt`, answer the interview as „Malerbetrieb Huber“.
Pass when: full interview runs one question at a time · all five entries exist (`CLAUDE.md`, `inhalt.md`, `verlauf.md`, `quellen/`, `wissen/` with three subfolders) · `CLAUDE.md` ≤ 150 lines · a page in `wissen/ablaeufe/` describes the biggest time-eater · the tour ends with three example sentences.

- [ ] **Step 3: Run (b), documents first.** New empty folder; paste the prompt; when asked, drop the three files from Step 1 into `quellen/`.
Pass when: Claude summarises what it learned · it does **not** ask for Betrieb, Programme, Zeitfresser or Schreibstil (all in the files) · the Angebote page links the source.

- [ ] **Step 4: Run (c), folder in OneDrive** (with „Immer auf diesem Gerät behalten“). Same as (b).
Pass when: all files are created and visible in Explorer and on onedrive.com, and a second session reads them. **This decides the fallback sentence on the page** (Task 3, `ordner.fallback`).

- [ ] **Step 5: Second session in the folder from (b).** Close Cowork, open a new task on the same folder, then:
  1. ask „Was weißt du über meinen Betrieb?“ → answers from the brain without re-asking;
  2. drop a new file `quellen/termin-berger.txt` („Termin Familie Berger verschoben auf 14.10.2026.“) and start a new session → reported in one line at session start and filed;
  3. ask „Wie spät ist es in Tokio?“ → answers, saves nothing, no „Notiert“ line;
  4. say „Frau Berger hat zugesagt, Start am 20.10.2026.“ → files it, one „Notiert“ line, no question.
  5. say „Das Angebot an Familie Berger ist raus, fertig.“ → the to-do disappears from `CLAUDE.md` **without** a question (ask-first rule is scoped to files, `quellen/` and anything leaving the folder), `verlauf.md` gets an entry.
  6. open `verlauf.md` → every processed `quellen/` file and the setup (as first Gesundheitscheck) are listed.

- [ ] **Step 5b: Run (f), added folder instead of copies.** Put the three files from Step 1 into a separate folder (e.g. `C:\Huber-Angebote`), add it to the Cowork project, start a fresh brain folder, paste the prompt, and give Claude the path when it asks for documents.
Pass when: Claude reads the files in place, copies nothing, notes the folder in `CLAUDE.md`, and the files in `C:\Huber-Angebote` are unchanged afterwards (dates + content). Then drop a new file into `C:\Huber-Angebote` and open a new session: it gets picked up at session start.

- [ ] **Step 6: Overflow test.** In the (b) folder, ask Claude to append 120 lines of fictional to-dos to `CLAUDE.md` until it is at 150 lines, then start a new session and say „Neuer Kunde: Firma Lenz, Treppenhaus, Angebot bis 15.10.2026.“
Pass when: Claude trims `CLAUDE.md` before adding and says what moved where.

- [ ] **Step 7: Fix and re-run.** For each failed check: change one line of the prompt, re-run Task 1 Steps 4 and 5, re-run the failed run. Keep the prompt ≤ 2,700 characters.

- [ ] **Step 8: Record the result** by appending to the spec:

```markdown
## 11. Testergebnis (Cowork, <Datum>)

| Run | Ergebnis | Änderung am Prompt |
|---|---|---|
| (a) leerer Ordner | pass/fail + one line | none / what changed |
| (b) Dokumente zuerst | … | … |
| (c) OneDrive | … | … |
| Zweite Sitzung | … | … |
| Überlauf | … | … |

OneDrive-Empfehlung: bleibt / wird ersetzt (Grund).
```

- [ ] **Step 9: Commit**

```bash
git add content/claude-gehirn/prompt.txt docs/superpowers/specs/2026-10-03-claude-gehirn-design.md
git commit -m "test(claude-gehirn): live Cowork runs recorded, prompt adjusted

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Page copy module and its copy-guard

**Files:**
- Create: `src/lib/claudeGehirnPage.ts`
- Test: `src/lib/claudeGehirnPage.test.ts`

**Interfaces:**
- Produces: `export const gehirnPage: GehirnPage` with the shape in Step 3 (used by Task 4 for `prompt.copyLabel/copiedLabel/failedLabel/boxLabel` and by Task 5 for everything else).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/claudeGehirnPage.test.ts
import { describe, it, expect } from "vitest";
import { gehirnPage } from "./claudeGehirnPage";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(gehirnPage);

describe("/claude-gehirn copy", () => {
  it("collects a substantial body of copy", () => {
    expect(all.length).toBeGreaterThan(50);
  });

  it("follows the house typography in every string", () => {
    const bad = all.flatMap((s) => findCopyIssues(s).map((i) => `${i.kind}: ${s}`));
    expect(bad).toEqual([]);
  });

  it("names no price and no euro figure", () => {
    expect(all.filter((s) => /€|\bEUR\b|\bEuro\b/i.test(s))).toEqual([]);
  });

  it("never claims a partnership or certification with Anthropic", () => {
    expect(all.filter((s) => /Partner|zertifiziert/i.test(s))).toEqual([]);
  });

  it("states the requirements honestly, up front", () => {
    const v = strings(gehirnPage.voraussetzungen).join(" ");
    expect(v).toContain("Pro");
    expect(v).toContain("kostenlosen Tarif nicht enthalten");
    expect(v).toContain("Vorschau");
  });

  it("covers all four storage options plus our own way", () => {
    expect(gehirnPage.ordner.options.map((o) => o.name)).toEqual([
      "Lokal auf deinem Rechner",
      "OneDrive",
      "iCloud Drive",
      "Google Drive",
    ]);
    expect(gehirnPage.ordner.unserWeg.body).toContain("jede Stunde");
  });

  it("asks for nothing: no CTA copy anywhere", () => {
    expect(all.filter((s) => /Erstgespräch|Prozess-Check|buchen|Termin vereinbaren/i.test(s))).toEqual([]);
  });

  it("says Vrelo is not affiliated with Anthropic", () => {
    expect(gehirnPage.hinweis).toContain("nicht mit Anthropic verbunden");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/claudeGehirnPage.test.ts`
Expected: FAIL, cannot resolve `./claudeGehirnPage`.

- [ ] **Step 3: Write the copy module**

```ts
// src/lib/claudeGehirnPage.ts
//
// Every German string for /claude-gehirn (spec 2026-10-03 §7). The page and
// its components hold none. A gift page: nothing here asks for anything.

export type GehirnPage = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; line: string; image: string };
  intro: string;
  voraussetzungen: { heading: string; items: string[]; hinweis: string };
  schritte: { heading: string; steps: [string, string, string]; tipp: string };
  ordner: {
    heading: string;
    intro: string;
    options: { name: string; wo: string; plus: string[]; minus: string[] }[];
    unserWeg: { heading: string; body: string };
    fallback: string;
    warnungen: string[];
  };
  prompt: { heading: string; lead: string; boxLabel: string; copyLabel: string; copiedLabel: string; failedLabel: string };
  ergebnis: { heading: string; tree: string; files: { name: string; body: string }[] };
  regeln: { heading: string; lead: string; items: { title: string; body: string }[] };
  alltag: { heading: string; beispiele: string[] };
  nichtHinein: { heading: string; items: string[]; datenschutz: string };
  fragen: { heading: string; items: { frage: string; antwort: string }[] };
  hinweis: string;
};

export const gehirnPage: GehirnPage = {
  meta: {
    title: "Ein Gehirn für deinen Betrieb, mit Claude",
    description:
      "Ein kostenloser Text zum Einfügen: Claude legt in einem Ordner ein Gehirn für deinen Betrieb an, lernt aus deinen Unterlagen und hält sein Wissen selbst aktuell.",
  },
  hero: {
    eyebrow: "Kostenlos · ohne Anmeldung",
    title: "Ein Gehirn für deinen Betrieb, mit Claude",
    line: "Ein Text zum Einfügen. Danach kennt Claude deinen Betrieb und hält sein Wissen selbst aktuell.",
    image: "/images/bg-karst-quelle.webp",
  },
  intro:
    "So arbeite ich selbst jeden Tag: Zu Beginn jeder Sitzung liest Claude, was in meinem Betrieb gerade wichtig ist. Neues schreibt es selbst mit. Hier ist der Text, mit dem du dir dasselbe einrichtest.",
  voraussetzungen: {
    heading: "Was du brauchst",
    items: [
      "Die Claude-App für Windows oder Mac.",
      "Einen bezahlten Claude-Tarif, ab Pro. Cowork, der Arbeitsmodus mit Zugriff auf einen Ordner, ist im kostenlosen Tarif nicht enthalten.",
      "Etwa 15 Minuten.",
    ],
    hinweis: "Cowork ist bei Anthropic noch eine Vorschau. Es kann sich also noch ändern.",
  },
  schritte: {
    heading: "In drei Schritten",
    steps: [
      "Leg einen neuen, leeren Ordner an, zum Beispiel „Mein Gehirn“.",
      "Öffne in der Claude-App Cowork und wähle diesen Ordner aus.",
      "Kopiere den Text unten, füg ihn ein und schick ihn ab. Claude führt dich durch den Rest.",
    ],
    tipp: "Hast du Angebote, Preislisten oder Notizen? Leg sie in den Ordner „quellen“, sobald Claude ihn angelegt hat. Was Claude dort findet, muss es dich nicht mehr fragen.",
  },
  ordner: {
    heading: "Wo du den Ordner anlegst",
    intro: "Claude braucht den Ordner auf deinem Rechner. Du hast vier Möglichkeiten.",
    options: [
      {
        name: "Lokal auf deinem Rechner",
        wo: "Windows: Laufwerk C:, zum Beispiel Dokumente\\Mein Gehirn. Mac: ein Ordner außerhalb von iCloud.",
        plus: ["Am schnellsten, auch ohne Internet.", "Nichts wird zwischendurch abgeglichen."],
        minus: [
          "Liegt nur auf diesem einen Gerät.",
          "Ohne eigene Sicherung ist alles weg, wenn der Rechner kaputtgeht.",
        ],
      },
      {
        name: "OneDrive",
        wo: "Windows und Mac.",
        plus: [
          "Automatische Sicherung mit Versionsverlauf: Überschreibt Claude einmal etwas falsch, holst du die alte Fassung zurück.",
          "Auch auf dem Handy lesbar.",
        ],
        minus: [
          "Stell den Ordner auf „Immer auf diesem Gerät behalten“. Sonst liegen manche Dateien nur in der Cloud.",
          "Bearbeitest du auf zwei Geräten gleichzeitig, entstehen doppelte Dateien.",
        ],
      },
      {
        name: "iCloud Drive",
        wo: "Mac.",
        plus: ["Schon eingebaut, nichts zu installieren."],
        minus: [
          "Schalte „Mac-Speicher optimieren“ aus. Sonst lagert der Mac ältere Dateien aus.",
          "Läuft gut nur auf Apple-Geräten.",
        ],
      },
      {
        name: "Google Drive",
        wo: "Windows und Mac, mit der App Google Drive.",
        plus: ["Sicherung über mehrere Geräte."],
        minus: [
          "Im Standardmodus „Streamen“ liegen die Dateien nur in der Cloud. Stell den Ordner auf „Offline verfügbar“ oder nutze „Spiegeln“.",
          "Eine App mehr auf dem Rechner.",
        ],
      },
    ],
    unserWeg: {
      heading: "So mache ich es",
      body: "Mein Gehirn liegt lokal auf C:, weil es dort am schnellsten läuft. Dafür liegt es nur auf diesem einen Rechner. Deshalb kopiert ein kleines Skript es jede Stunde nach OneDrive.",
    },
    // Depends on Task 2 run (c). If OneDrive failed there, replace with:
    // "Leg den Ordner lokal an und kopier ihn regelmäßig an einen zweiten Ort, zum Beispiel in deine Cloud."
    fallback:
      "Willst du keine eigene Sicherung einrichten, kommt OneDrive mit „Immer auf diesem Gerät behalten“ dem am nächsten.",
    warnungen: [
      "Unter Windows liegt „Dokumente“ oft schon in OneDrive, am Mac kann iCloud den Ordner „Dokumente“ übernehmen. Ein Blick auf den Pfad zeigt es dir.",
      "Kein USB-Stick, keine externe Festplatte, kein Netzlaufwerk: Ist es nicht verbunden, findet Claude sein Gehirn nicht.",
    ],
  },
  prompt: {
    heading: "Der Text zum Einfügen",
    lead: "Kopieren, in Cowork einfügen, abschicken. Es ist derselbe Text wie in meinem LinkedIn-Beitrag.",
    boxLabel: "Der Text zum Einfügen",
    copyLabel: "Text kopieren",
    copiedLabel: "Kopiert. Jetzt in Cowork einfügen.",
    failedLabel: "Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn von Hand.",
  },
  ergebnis: {
    heading: "Was danach in deinem Ordner liegt",
    tree: [
      "Mein Gehirn/",
      "├── CLAUDE.md",
      "├── inhalt.md",
      "├── verlauf.md",
      "├── quellen/",
      "└── wissen/",
      "    ├── kunden/",
      "    ├── ablaeufe/",
      "    └── themen/",
    ].join("\n"),
    files: [
      {
        name: "CLAUDE.md",
        body: "Das Gehirn. Claude liest es zu Beginn jeder Sitzung: wer du bist, woran du arbeitest, was entschieden ist, wie du arbeiten willst. Höchstens 150 Zeilen.",
      },
      { name: "inhalt.md", body: "Die Landkarte. Jede Seite mit einem Satz, damit Claude die richtige findet, ohne alles zu lesen." },
      { name: "verlauf.md", body: "Was sich wann geändert hat. Wird nur ergänzt, nie umgeschrieben." },
      { name: "quellen/", body: "Dein Rohmaterial. Claude liest es, ändert es aber nie." },
      { name: "wissen/", body: "Die Seiten, die Claude schreibt und aktuell hält: Kunden, Abläufe, Themen." },
    ],
  },
  regeln: {
    heading: "Die Regeln dahinter",
    lead: "Jede Regel stammt aus meinem eigenen Alltag mit Claude. Sie stehen alle im Text oben. Hier steht, warum.",
    items: [
      {
        title: "Arbeit zuerst.",
        body: "Deine Aufgabe kommt vor der Pflege. Claude speichert nur, was du in einem Monat noch brauchst, entscheidet das selbst und meldet sich mit höchstens einer Zeile. Ein Gehirn, das ständig nachfragt, schaltet man nach einer Woche ab.",
      },
      {
        title: "Eine Quelle der Wahrheit.",
        body: "Was gilt, steht im Gehirn, nicht irgendwo im Chat. Ändert sich etwas, ändert sich die Seite.",
      },
      {
        title: "Erst nachsehen, dann fragen.",
        body: "Claude schaut in seine Unterlagen, bevor es dich fragt. Du erklärst nichts zweimal.",
      },
      {
        title: "Nichts erfinden.",
        body: "Weiß das Gehirn etwas nicht, sagt Claude es. Vermutungen stehen als Vermutung da.",
      },
      {
        title: "Widersprüche zeigen.",
        body: "Passt eine neue Information nicht zur alten, überschreibt Claude nichts still. Es zeigt dir beide, du entscheidest.",
      },
      {
        title: "CLAUDE.md bleibt schlank.",
        body: "Höchstens 150 Zeilen, alles andere wandert auf eigene Seiten. Ein Gehirn, das zu viel auf einmal lädt, wird langsamer und ungenauer.",
      },
      {
        title: "Es pflegt sich selbst.",
        body: "Neue Dateien in „quellen“ arbeitet Claude zu Beginn der Sitzung ein. Alle 14 Tage schaut es kurz nach Widersprüchen und Veraltetem. Du musst es nicht daran erinnern.",
      },
      {
        title: "Erst fragen.",
        body: "Vor dem Löschen, vor dem Überschreiben und vor allem, was den Ordner verlässt, fragt Claude nach.",
      },
    ],
  },
  alltag: {
    heading: "So sprichst du im Alltag mit deinem Gehirn",
    beispiele: [
      "„Ich habe gerade mit Herrn Weber telefoniert: Er will das Angebot bis Freitag.“",
      "„Was steht diese Woche an?“",
      "„Schreib die Antwort an Frau Kaya in meinem Ton.“",
      "„Ich habe die neue Preisliste in quellen gelegt.“",
      "„fertig“",
    ],
  },
  nichtHinein: {
    heading: "Was nicht hineingehört",
    items: [
      "Passwörter, Zugangsdaten und Bankdaten.",
      "Gesundheitsdaten und alles, was unter eine Schweigepflicht fällt.",
      "Vertrauliche Daten deiner Kunden, die du nicht weitergeben darfst.",
    ],
    datenschutz:
      "Alles, was du Claude gibst, geht an Anthropic. Schau in den Datenschutz-Einstellungen deines Claude-Kontos nach, ob deine Chats zum Training verwendet werden dürfen.",
  },
  fragen: {
    heading: "Fragen",
    items: [
      {
        frage: "Gehört das Gehirn mir?",
        antwort: "Ja. Es sind einfache Textdateien in deinem Ordner. Du kannst sie lesen, kopieren und mitnehmen, auch zu einem anderen Werkzeug.",
      },
      {
        frage: "Was, wenn sich Cowork ändert?",
        antwort: "Deine Dateien bleiben davon unberührt. Das Gehirn ist Text, kein Programm.",
      },
      {
        frage: "Geht es auch ohne Cowork?",
        antwort: "Ja, im Bereich „Code“ derselben App. Er liest die Datei CLAUDE.md genauso.",
      },
      {
        frage: "Kostet der Text etwas?",
        antwort: "Nein. Du brauchst nur deinen eigenen Claude-Tarif.",
      },
    ],
  },
  hinweis: "Vrelo ist nicht mit Anthropic verbunden. Claude ist eine Marke von Anthropic.",
};
```

- [ ] **Step 4: Repair and verify the German quotes** (same commands as Task 1 Step 4, with `f=src/lib/claudeGehirnPage.ts`). Expected: `wrong 0`, open = close.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/claudeGehirnPage.test.ts src/lib/kommaUnd.test.ts`
Expected: PASS.

- [ ] **Step 6: stop-slop pass.** Invoke the `stop-slop` skill on the strings of `gehirnPage` (HQ §8: every customer-facing prose). Brand.md wins on conflict. Apply edits in the module, re-run Steps 4 and 5.

- [ ] **Step 7: Commit**

```bash
git add src/lib/claudeGehirnPage.ts src/lib/claudeGehirnPage.test.ts
git commit -m "feat(claude-gehirn): page copy module with copy-guard

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `PromptBox`, the prompt with a copy button

**Files:**
- Create: `src/components/claude-gehirn/PromptBox.tsx`
- Test: `src/components/claude-gehirn/PromptBox.test.tsx`

**Interfaces:**
- Consumes: label strings from `gehirnPage.prompt` (Task 3).
- Produces: `PromptBox({ text, boxLabel, copyLabel, copiedLabel, failedLabel }: { text: string; boxLabel: string; copyLabel: string; copiedLabel: string; failedLabel: string })`, a client component.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/claude-gehirn/PromptBox.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromptBox } from "./PromptBox";

const labels = {
  boxLabel: "Der Text zum Einfügen",
  copyLabel: "Text kopieren",
  copiedLabel: "Kopiert.",
  failedLabel: "Von Hand kopieren.",
};
const text = "Zeile eins\nZeile zwei";

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true });
}

afterEach(() => setClipboard(undefined));

describe("PromptBox", () => {
  it("shows the full text, wrapping instead of scrolling sideways", () => {
    render(<PromptBox text={text} {...labels} />);
    const box = screen.getByLabelText(labels.boxLabel);
    expect(box.textContent).toBe(text);
    expect(box.className).toContain("whitespace-pre-wrap");
    expect(box.className).toContain("break-words");
  });

  it("copies the exact text and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render(<PromptBox text={text} {...labels} />);
    fireEvent.click(screen.getByRole("button", { name: labels.copyLabel }));
    expect(await screen.findByText(labels.copiedLabel)).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(text);
  });

  it("falls back to a visible hand-copy hint when the clipboard is missing", async () => {
    setClipboard(undefined);
    render(<PromptBox text={text} {...labels} />);
    fireEvent.click(screen.getByRole("button", { name: labels.copyLabel }));
    expect(await screen.findByText(labels.failedLabel)).toBeInTheDocument();
  });

  it("falls back when the browser refuses permission", async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error("denied")) });
    render(<PromptBox text={text} {...labels} />);
    fireEvent.click(screen.getByRole("button", { name: labels.copyLabel }));
    expect(await screen.findByText(labels.failedLabel)).toBeInTheDocument();
  });

  it("announces the result politely", () => {
    render(<PromptBox text={text} {...labels} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/claude-gehirn/PromptBox.test.tsx`
Expected: FAIL, cannot resolve `./PromptBox`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/claude-gehirn/PromptBox.tsx
"use client";

import { useState } from "react";

// The Claude-Gehirn prompt with a copy button. The text stays selectable so a
// failed clipboard call (old browser, denied permission) still leaves a way.
export function PromptBox({
  text,
  boxLabel,
  copyLabel,
  copiedLabel,
  failedLabel,
}: {
  text: string;
  boxLabel: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="card-depth rounded-2xl bg-papier p-4 text-tinte md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm font-medium text-tiefes-wasser">
          {state === "copied" ? copiedLabel : state === "failed" ? failedLabel : ""}
        </p>
        <button
          type="button"
          onClick={copy}
          className="cta-fx rounded-full bg-vrelo-petrol px-5 py-2.5 text-sm font-semibold text-papier hover:bg-tiefes-wasser focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
        >
          {copyLabel}
        </button>
      </div>
      <pre
        tabIndex={0}
        aria-label={boxLabel}
        className="mt-4 max-h-[32rem] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-lesepapier p-4 font-mono text-sm leading-relaxed text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol"
      >
        {text}
      </pre>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/claude-gehirn/PromptBox.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/claude-gehirn/
git commit -m "feat(claude-gehirn): PromptBox with copy button and hand-copy fallback

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The `/claude-gehirn` route and the sitemap entry

**Files:**
- Create: `src/app/claude-gehirn/page.tsx`
- Test: `src/app/claude-gehirn/page.test.tsx`
- Modify: `src/app/sitemap.ts` (add `"/claude-gehirn"` after `"/prozess-check"`)
- Modify: `src/app/sitemap.test.ts` (new `it`)

**Interfaces:**
- Consumes: `getGehirnPrompt()` (Task 1), `gehirnPage` (Task 3), `PromptBox` (Task 4), existing `CompactHero`, `Section`, `Reveal`, `JsonLd`, `breadcrumbLd`, `canonical`, `withBrandWords`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/app/claude-gehirn/page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GehirnPage from "./page";
import { getGehirnPrompt } from "@/lib/claudeGehirn";
import { gehirnPage } from "@/lib/claudeGehirnPage";

describe("/claude-gehirn", () => {
  it("opens on the hero title without a button", () => {
    render(<GehirnPage />);
    const hero = screen.getByRole("heading", { level: 1, name: gehirnPage.hero.title }).closest("section")!;
    expect(hero.querySelectorAll("a")).toHaveLength(0);
  });

  it("shows the exact prompt from the single source file", () => {
    render(<GehirnPage />);
    expect(screen.getByLabelText(gehirnPage.prompt.boxLabel).textContent).toBe(getGehirnPrompt());
  });

  it("asks for nothing: no link to the funnel or the contact page in the page body", () => {
    const { container } = render(<GehirnPage />);
    expect(container.querySelectorAll('a[href*="prozess-check"], a[href*="kontakt"]')).toHaveLength(0);
  });

  it("names every section heading", () => {
    render(<GehirnPage />);
    for (const h of [
      gehirnPage.voraussetzungen.heading,
      gehirnPage.schritte.heading,
      gehirnPage.ordner.heading,
      gehirnPage.prompt.heading,
      gehirnPage.ergebnis.heading,
      gehirnPage.regeln.heading,
      gehirnPage.alltag.heading,
      gehirnPage.nichtHinein.heading,
      gehirnPage.fragen.heading,
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: h })).toBeInTheDocument();
    }
  });

  it("closes with the non-affiliation line", () => {
    const { container } = render(<GehirnPage />);
    expect(container.textContent).toContain("nicht mit Anthropic verbunden");
  });
});
```

Append to `src/app/sitemap.test.ts` inside the `describe`:

```ts
  it("lists the Claude-Gehirn gift page", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}/claude-gehirn`);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/claude-gehirn/page.test.tsx src/app/sitemap.test.ts`
Expected: FAIL (page module missing; sitemap lacks the URL).

- [ ] **Step 3: Write the page**

```tsx
// src/app/claude-gehirn/page.tsx
//
// The Claude-Gehirn gift page (spec 2026-10-03 §7). Ungated, no CTA in the
// body, no ClosingCta: the site header is the only chrome that sells.
// All copy: src/lib/claudeGehirnPage.ts; the prompt: content/claude-gehirn/prompt.txt.
import type { Metadata } from "next";
import { CompactHero } from "@/components/CompactHero";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { withBrandWords } from "@/components/BrandWord";
import { PromptBox } from "@/components/claude-gehirn/PromptBox";
import { gehirnPage as c } from "@/lib/claudeGehirnPage";
import { getGehirnPrompt } from "@/lib/claudeGehirn";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/claude-gehirn") },
  title: c.meta.title,
  description: c.meta.description,
  openGraph: { title: c.meta.title, description: c.meta.description },
};

const h2 = "text-balance text-3xl font-semibold md:text-4xl";
const prose = "mx-auto max-w-3xl";

export default function GehirnPage() {
  const prompt = getGehirnPrompt();
  return (
    <>
      <CompactHero eyebrow={c.hero.eyebrow} title={c.hero.title} line={c.hero.line} image={c.hero.image} />

      <Section tone="paper">
        <Reveal>
          <div className={prose}>
            <p className="text-pretty font-serif text-xl leading-relaxed md:text-2xl">{c.intro}</p>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.voraussetzungen.heading}</h2>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-lg">
              {c.voraussetzungen.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="mt-4 text-stumm">{c.voraussetzungen.hinweis}</p>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.schritte.heading}</h2>
            <ol className="mt-6 list-decimal space-y-3 pl-6 text-lg">
              {c.schritte.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <p className="mt-6 rounded-2xl bg-sonnenlicht p-5">{c.schritte.tipp}</p>
          </div>
        </Reveal>
      </Section>

      <Section tint>
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.ordner.heading}</h2>
            <p className="mt-4 text-lg">{c.ordner.intro}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {c.ordner.options.map((o) => (
                <article key={o.name} className="card-depth rounded-2xl bg-papier p-5">
                  <h3 className="text-lg font-semibold text-tiefes-wasser">{o.name}</h3>
                  <p className="mt-1 text-sm text-stumm">{o.wo}</p>
                  <ul className="mt-3 space-y-1">
                    {o.plus.map((p) => <li key={p}><span aria-hidden>+ </span>{p}</li>)}
                    {o.minus.map((m) => <li key={m}><span aria-hidden>− </span>{m}</li>)}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-sonnenlicht p-5">
              <h3 className="font-semibold text-tiefes-wasser">{c.ordner.unserWeg.heading}</h3>
              <p className="mt-2">{c.ordner.unserWeg.body}</p>
              <p className="mt-2">{c.ordner.fallback}</p>
            </div>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-stumm">
              {c.ordner.warnungen.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </Reveal>
      </Section>

      <Section tone="petrol" id="prompt" className="scroll-mt-24">
        <div className={prose}>
          <h2 className={`${h2} text-papier`}>{c.prompt.heading}</h2>
          <p className="mt-4 text-lg text-gletscher">{c.prompt.lead}</p>
          <div className="mt-8">
            <PromptBox
              text={prompt}
              boxLabel={c.prompt.boxLabel}
              copyLabel={c.prompt.copyLabel}
              copiedLabel={c.prompt.copiedLabel}
              failedLabel={c.prompt.failedLabel}
            />
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.ergebnis.heading}</h2>
            <pre className="mt-6 overflow-x-auto rounded-xl bg-lesepapier p-4 font-mono text-sm">{c.ergebnis.tree}</pre>
            <dl className="mt-6 space-y-4">
              {c.ergebnis.files.map((f) => (
                <div key={f.name}>
                  <dt className="font-mono font-semibold text-tiefes-wasser">{f.name}</dt>
                  <dd className="mt-1">{f.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Section>

      <Section tint>
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.regeln.heading}</h2>
            <p className="mt-4 text-lg">{c.regeln.lead}</p>
            <ul className="mt-8 space-y-5">
              {c.regeln.items.map((r) => (
                <li key={r.title}>
                  <p className="font-semibold text-tiefes-wasser">{r.title}</p>
                  <p className="mt-1">{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      <Section tone="paper">
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.alltag.heading}</h2>
            <ul className="mt-6 space-y-2 text-lg">
              {c.alltag.beispiele.map((b) => <li key={b}>{b}</li>)}
            </ul>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.nichtHinein.heading}</h2>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-lg">
              {c.nichtHinein.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="mt-4">{c.nichtHinein.datenschutz}</p>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.fragen.heading}</h2>
            <dl className="mt-6 space-y-5">
              {c.fragen.items.map((f) => (
                <div key={f.frage}>
                  <dt className="font-semibold text-tiefes-wasser">{f.frage}</dt>
                  <dd className="mt-1">{f.antwort}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-16 text-sm text-stumm">{withBrandWords(c.hinweis)}</p>
          </div>
        </Reveal>
      </Section>

      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: c.hero.title, path: "/claude-gehirn" },
        ])}
      />
    </>
  );
}
```

In `src/app/sitemap.ts`, insert `"/claude-gehirn",` after `"/prozess-check",`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/claude-gehirn/page.test.tsx src/app/sitemap.test.ts src/lib/kommaUnd.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/claude-gehirn/ src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat(claude-gehirn): /claude-gehirn page, indexed, no CTA

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Link from `/leistungen/claude` (NoteBlock learns internal links)

**Files:**
- Modify: `src/components/leistungen/page/NoteBlock.tsx`
- Create: `src/components/leistungen/page/NoteBlock.test.tsx`
- Modify: `src/lib/leistungenPages.ts` (add `note` to the `claude` entry, after `example`)
- Modify: `src/lib/leistungenPages.test.ts:97-105`

**Interfaces:**
- Consumes: existing `LeistungPage["note"]` type `{ heading: string; body: string; link: { label: string; href: string } }` (unchanged).

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/leistungen/page/NoteBlock.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteBlock } from "./NoteBlock";

describe("NoteBlock", () => {
  it("opens external links in a new tab and says so", () => {
    render(<NoteBlock note={{ heading: "H", body: "B", link: { label: "Extern", href: "https://example.org/" } }} />);
    const a = screen.getByRole("link", { name: /Extern/ });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveTextContent("öffnet in neuem Tab");
  });

  it("keeps internal links in the same tab, without the new-tab hint", () => {
    render(<NoteBlock note={{ heading: "H", body: "B", link: { label: "Intern", href: "/claude-gehirn" } }} />);
    const a = screen.getByRole("link", { name: "Intern" });
    expect(a).not.toHaveAttribute("target");
    expect(a).toHaveAttribute("href", "/claude-gehirn");
    expect(a).not.toHaveTextContent("öffnet in neuem Tab");
  });
});
```

Replace the test at `src/lib/leistungenPages.test.ts:97-105` (keep its Digitalbonus assertions, widen the slug list, add the Claude note):

```ts
  it("carries notes on Claude (gift page) and KI-Beratung (Digitalbonus, as a possibility)", () => {
    expect(leistungenPages.filter((p) => p.note).map((p) => p.slug)).toEqual(["claude", "ki-beratung"]);
    const note = getLeistungPage("ki-beratung")!.note!;
    expect(note.body).toContain("kann");
    expect(note.body).toContain("Antrag");
    expect(note.body).toContain("bevor");
    expect(note.body).not.toMatch(/€|%/);
    expect(note.link.href).toBe("https://www.digitalbonus.bayern/foerderprogramm/");
    expect(getLeistungPage("claude")!.note!.link.href).toBe("/claude-gehirn");
  });
```

(Read lines 97-110 first and keep any assertion there that this replacement does not repeat.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/leistungen/page/NoteBlock.test.tsx src/lib/leistungenPages.test.ts`
Expected: FAIL (internal link still gets `target="_blank"`; `claude` has no note).

- [ ] **Step 3: Implement**

`NoteBlock.tsx`, replace the `<a …>…</a>` with:

```tsx
        {/^https?:\/\//.test(note.link.href) ? (
          <a
            href={note.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {note.link.label}
            <span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
        ) : (
          <Link href={note.link.href} className={linkClass}>
            {note.link.label}
          </Link>
        )}
```

and add above the component:

```tsx
import Link from "next/link";

const linkClass =
  "mt-4 inline-block rounded-sm font-medium text-[#6f4a20] underline underline-offset-4 hover:text-[#4d3216] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sonnenlicht";
```

Update the component comment: „A small hint above the CTA (KI-Beratung: Digitalbonus Bayern; Claude: the free Claude-Gehirn page). External links open a new tab, internal ones stay.“

`leistungenPages.ts`, in the `claude` entry after `example: {…},`:

```ts
    note: {
      heading: "Zum Ausprobieren",
      body: "Wie ich Claude selbst nutze, kannst du nachbauen: Ein Text legt in einem Ordner ein Gehirn für deinen Betrieb an. Kostenlos, ohne Anmeldung.",
      link: { label: "Zum Claude-Gehirn", href: "/claude-gehirn" },
    },
```

Then repair quotes in both files (Task 1 Step 4 commands with `f=` set to each file).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/leistungen src/lib/leistungenPages.test.ts src/app/leistungen src/lib/kommaUnd.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/leistungen/page/NoteBlock.tsx src/components/leistungen/page/NoteBlock.test.tsx src/lib/leistungenPages.ts src/lib/leistungenPages.test.ts
git commit -m "feat(leistungen): Claude page links to the Claude-Gehirn gift page

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Full verification and the merge gate

**Files:** none new (fixes only, if something fails).

- [ ] **Step 1: Whole suite and static checks**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all green; the build lists `/claude-gehirn` as a static route (○).

- [ ] **Step 2: Browser check** with `npm start` at 1440 and 390 px (Playwright MCP):
  - `/claude-gehirn`: no horizontal page scroll at 390 · the prompt wraps · „Text kopieren“ shows „Kopiert. Jetzt in Cowork einfügen.“ · header button present, no other button or CTA on the page · keyboard: Tab reaches the button and the prompt box with a visible focus ring.
  - `/leistungen/claude`: the „Zum Ausprobieren“ note shows; the link opens `/claude-gehirn` in the same tab.
  - Contrast of the `+`/`−` lists and `text-stumm` lines on `tint` sections ≥ 4.5:1 (stumm on papier is 5.19:1; measure on `bg-gletscher/30`).

- [ ] **Step 3: Merge gate.** Merge only when (1) Task 2 is recorded in spec §11 with every run passing, (2) `ordner.fallback` matches the OneDrive result, (3) Ajdin has read the page at 390 px. Then use `superpowers:finishing-a-development-branch`; push to `main` deploys.

---

### Task 8: LinkedIn post and HQ bookkeeping (after deploy)

- [ ] **Step 1: Post** via the HQ skill `writing-linkedin-posts`: short intro (no link, plain text) + the prompt copied **verbatim** from `Website/content/claude-gehirn/prompt.txt`; first comment = `https://vrelo-ki.de/claude-gehirn`. After the post file is written, prove the prompt is identical:

```bash
node -e "const fs=require('fs');const p=fs.readFileSync('Website/content/claude-gehirn/prompt.txt','utf8').replace(/\r\n/g,'\n').trim();const post=fs.readFileSync(process.argv[1],'utf8').replace(/\r\n/g,'\n');console.log(post.includes(p)?'identical':'DRIFT');console.log('post chars',[...post.trim()].length)" <post-file>
```
Expected: `identical`, post chars ≤ 3000 (counting only the post text, not the file's notes).

- [ ] **Step 2: HQ `CLAUDE.md`**: one line in §2.2 Marketing (`/claude-gehirn` free gift page + prompt source path + „no CTA by decision 2026-10-03“) and the `Website/CLAUDE.md` routes list + changelog line.

- [ ] **Step 3: Vault light sync** (HQ §8): update the matching marketing page in `Vrelo/wiki/marketing/`, `index.md` one-liner, `log.md` entry.
