# Ratgeber Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship nine German Ratgeber articles, backdated weekly from 2026-06-04 to 2026-07-30, that turn the Ratgeber from three awareness-stage posts into a broker-targeted lead channel with commercial intent.

**Architecture:** Two layers. First a **typography copy-guard** — a pure function in `src/lib/ratgeberCopy.ts` plus a corpus test that walks every article in `content/ratgeber/` — mirroring the existing `src/lib/makler.test.ts` copy-guard pattern. Then nine **content tasks**, each producing one `.mdx` file via the `.claude/skills/ratgeber-article` skill, with the skill's step-1 intake supplied from the spec instead of a live interview. The guard makes the mechanical brand rules enforceable in CI; the judgement rules stay in the skill's human self-check.

**Tech Stack:** Next.js 16 · TypeScript · Vitest · `gray-matter` (already a dependency, used by `src/lib/ratgeber.ts`) · MDX content files · `sharp` 0.34.5 for the cover WebP conversion.

**Spec:** [`docs/superpowers/specs/2026-07-28-ratgeber-cluster-design.md`](../specs/2026-07-28-ratgeber-cluster-design.md)

**Branch:** `feat/ratgeber-cluster` (already created; the spec is committed on it as `49d86e1`).

---

## Ground truth established before planning

Verified in the repo, not assumed:

- **No git hooks are active** (`.git/hooks/` contains only samples, no husky). Commits are mechanically possible while `npm test` is red.
- **The covers test blocks the green gate.** `src/lib/ratgeber.covers.test.ts` asserts the cover WebP exists for **every** article including drafts. Nine new articles = nine covers needed before `npm test` passes. Cover generation is a **founder action** — the available image tool has 1 credit on a free plan, so it cannot produce them.
- **The three existing articles already satisfy a body-scoped guard:** 0 em-dashes, 0 ASCII double quotes in the body, balanced „…“, 0 wrong-direction `”`. Their ASCII quotes live only in YAML frontmatter, so **the guard must strip frontmatter before checking.**
- **A hard „≤1 water metaphor“ assertion would fail the existing corpus** — `durcheinander-oder-saubere-quelle` uses „Quelle“ 4×, `taeglich-stunden-zurueckgewinnen` uses „Tropfen“ 2×. The rule means one metaphor *concept*, not one word occurrence. It stays a human judgement check.
- **Existing article length:** 770–812 words. The new batch targets the skill's *short* tier, 600–750.

---

## File structure

| File | Status | Responsibility |
|---|---|---|
| `src/lib/ratgeberCopy.ts` | Create | Pure typography guard. Strips frontmatter, returns a list of issues. No I/O, no filesystem. |
| `src/lib/ratgeberCopy.test.ts` | Create | Unit tests for the pure function — proves each detector catches its violation. |
| `src/lib/ratgeber.corpus.test.ts` | Create | Walks `content/ratgeber/*.mdx` and asserts every article is clean. The regression net. |
| `content/ratgeber/<slug>.mdx` × 9 | Create | The articles. One file each, self-contained. |
| `public/images/ratgeber-<slug>.webp` × 9 | Create (founder) | Covers. Required by `ratgeber.covers.test.ts`. |

`ratgeberCopy.ts` is deliberately split from the existing `ratgeber.ts`: `ratgeber.ts` owns parsing and selection and is imported by pages; the guard is test-only concern with a different reason to change. Keeping them apart follows the repo's pure-core pattern (`leadCheck.ts` / `leadCheckEmail.ts`).

---

## Per-article procedure (applies to Tasks 3–11)

Every article task follows these six steps. They are stated once here in full; each task below supplies its own complete content (frontmatter, grounding, outline, pull-quote, cover prompt) and never depends on reading another task.

- **Step A — Draft the body.** Shape per `.claude/skills/ratgeber-article/references/voice-and-structure.md`: hook (1–3 short paragraphs, open on the reader's lived moment, not a definition) → 2–4 `##` sections → **exactly one** `>` blockquote → short thematic close. **Never close on a CTA** — the article page's CTA band already makes the ask. Target **600–750 words**. Length is a ceiling, not a target.
- **Step B — Run the skill's self-check** (the 12-item list in `voice-and-structure.md`). This is the gate. Pay particular attention to: *Merak* lands as a warm feeling near the end; one water metaphor concept only; generic masculine; first-person „Ich“; no „Das ist kein X. Das ist Y.“ cadence more than once.
- **Step C — Run `copy-editing`, then `stop-slop`** over the draft. Tighten every line that can be sharper; cut any section restating an earlier one. `copywriting` is deliberately **not** used — it generates new marketing copy, which is the wrong tool for tightening a finished article.
- **Step D — Write the file** to `content/ratgeber/<slug>.mdx` with the frontmatter block given in the task, verbatim.
- **Step E — Verify.** Run, substituting the slug:

```bash
cd Website
SLUG=<slug>
npx vitest run src/lib/ratgeberCopy.test.ts src/lib/ratgeber.corpus.test.ts
node -e "
const m=require('gray-matter'), fs=require('fs');
const s=process.env.SLUG, f='content/ratgeber/'+s+'.mdx';
const {data,content}=m(fs.readFileSync(f,'utf8'));
for (const k of ['title','description','date','tags','cover','coverAlt']) if(!data[k]) throw new Error('missing frontmatter: '+k);
if(data.draft!==true) throw new Error('draft must be true');
if(data.cover!=='/images/ratgeber-'+s+'.webp') throw new Error('cover path must match slug: '+data.cover);
if(data.description.length>155) throw new Error('description too long: '+data.description.length);
const w=content.trim().split(/\s+/).length;
if(w<550||w>800) throw new Error('word count out of range: '+w);
console.log('OK', s, w+' words,', Math.round(w/200)+' min');
"
```

Expected: the two vitest files PASS, and the node check prints `OK <slug> <n> words`.

> `npm test` (the full suite) will still FAIL on `ratgeber.covers.test.ts` until Task 13 adds the cover images. That failing test is the expected signal, not a defect. Do not attempt to fix it by removing the cover frontmatter.

- **Step F — Commit.**

```bash
git add content/ratgeber/<slug>.mdx
git commit -m "content(ratgeber): <title>"
```

---

## Task 1: Typography guard — the pure core

**Files:**
- Create: `src/lib/ratgeberCopy.ts`
- Test: `src/lib/ratgeberCopy.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/ratgeberCopy.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { stripFrontmatter, findCopyIssues } from "./ratgeberCopy";

const clean = `Ich habe das lange beobachtet.

## Warum das passiert

Der Kunde wartet – und niemand antwortet. „So läuft das oft.“
`;

describe("stripFrontmatter", () => {
  it("removes a leading YAML block", () => {
    const raw = `---\ntitle: "Ein Titel"\ndraft: true\n---\n\nDer Text.\n`;
    expect(stripFrontmatter(raw).trim()).toBe("Der Text.");
  });

  it("leaves a body without frontmatter untouched", () => {
    expect(stripFrontmatter("Der Text.\n").trim()).toBe("Der Text.");
  });

  it("does not strip a later --- used as a horizontal rule", () => {
    const raw = `Der Text.\n\n---\n\nMehr Text.\n`;
    expect(stripFrontmatter(raw)).toContain("Mehr Text.");
  });
});

describe("findCopyIssues", () => {
  it("passes clean German copy", () => {
    expect(findCopyIssues(clean)).toEqual([]);
  });

  it("catches the em-dash", () => {
    const issues = findCopyIssues("Der Kunde wartet — niemand antwortet.");
    expect(issues.map((i) => i.kind)).toContain("em-dash");
  });

  it("catches ASCII double quotes", () => {
    const issues = findCopyIssues('Er sagte "so nicht".');
    expect(issues.map((i) => i.kind)).toContain("ascii-quote");
  });

  it("catches the wrong-direction closing quote", () => {
    // ” escape, never the literal character: a typography repair pass over
    // this file would silently "fix" the fixture and the test would then assert
    // against clean input.
    const issues = findCopyIssues("Er sagte „so nicht\u201D.");
    expect(issues.map((i) => i.kind)).toContain("wrong-closing-quote");
  });

  it("catches unbalanced German quotes", () => {
    const issues = findCopyIssues("Er sagte „so nicht.");
    expect(issues.map((i) => i.kind)).toContain("unbalanced-quotes");
  });

  it("catches punctuated gender forms", () => {
    expect(findCopyIssues("Die Kund:innen warten.").map((i) => i.kind)).toContain("gendered-form");
    expect(findCopyIssues("Die Kund*innen warten.").map((i) => i.kind)).toContain("gendered-form");
  });

  it("catches feminine plurals from the explicit list", () => {
    expect(findCopyIssues("Die Inhaberinnen warten.").map((i) => i.kind)).toContain("gendered-form");
  });

  it("does not flag ordinary words ending in -innen", () => {
    expect(findCopyIssues("Er war schon drinnen.")).toEqual([]);
  });

  it("reports the offending snippet so the failure is actionable", () => {
    const [issue] = findCopyIssues("Der Kunde wartet — niemand antwortet.");
    expect(issue.detail).toContain("wartet");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Website && npx vitest run src/lib/ratgeberCopy.test.ts`
Expected: FAIL — `Failed to resolve import "./ratgeberCopy"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/ratgeberCopy.ts`:

```ts
// Typography guard for the German Ratgeber articles. Pure: no filesystem, no
// parsing of frontmatter values — it only needs the prose body.
//
// Scope note: this enforces the MECHANICAL brand rules only. The judgement
// rules (one water-metaphor concept, Merak landing warm, no CTA close, varied
// cadence) stay in the ratgeber-article skill's human self-check, because a
// hard threshold produces false failures on legitimate copy — e.g. the
// existing „durcheinander-oder-saubere-quelle" uses „Quelle" four times by
// design.

export type CopyIssue = { kind: string; detail: string };

const EM_DASH = "—";
const OPEN_QUOTE = "„"; // „
const CLOSE_QUOTE = "“"; // “
const WRONG_CLOSE = "\u201D"; // the wrong closing quote Write/Edit silently downgrade to

// Feminine plurals we actually use. An open /\w+innen/ rule would flag
// „drinnen", „Spinnen", „von innen" — so the list is explicit on purpose.
const FEMININE_PLURALS = [
  "Kundinnen",
  "Inhaberinnen",
  "Kolleginnen",
  "Maklerinnen",
  "Beraterinnen",
  "Unternehmerinnen",
  "Selbstständiginnen",
];

/** Remove a leading YAML frontmatter block. A later `---` (horizontal rule) is left alone. */
export function stripFrontmatter(raw: string): string {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(raw);
  return match ? raw.slice(match[0].length) : raw;
}

function snippet(body: string, index: number): string {
  const start = Math.max(0, index - 40);
  return body.slice(start, index + 40).replace(/\s+/g, " ").trim();
}

export function findCopyIssues(body: string): CopyIssue[] {
  const issues: CopyIssue[] = [];

  const em = body.indexOf(EM_DASH);
  if (em !== -1) {
    issues.push({ kind: "em-dash", detail: `use the spaced en-dash „ – “: …${snippet(body, em)}…` });
  }

  const ascii = body.indexOf('"');
  if (ascii !== -1) {
    issues.push({ kind: "ascii-quote", detail: `use German quotes „…“: …${snippet(body, ascii)}…` });
  }

  const wrong = body.indexOf(WRONG_CLOSE);
  if (wrong !== -1) {
    issues.push({
      kind: "wrong-closing-quote",
      detail: `closing quote must be U+201C, not U+201D: …${snippet(body, wrong)}…`,
    });
  }

  const open = (body.match(new RegExp(OPEN_QUOTE, "g")) ?? []).length;
  const close = (body.match(new RegExp(CLOSE_QUOTE, "g")) ?? []).length;
  if (open !== close) {
    issues.push({ kind: "unbalanced-quotes", detail: `${open} opening vs ${close} closing German quotes` });
  }

  const punctuated = /[a-zäöüß][:*_]innen\b/i.exec(body);
  if (punctuated) {
    issues.push({
      kind: "gendered-form",
      detail: `generic masculine only: …${snippet(body, punctuated.index)}…`,
    });
  }

  for (const word of FEMININE_PLURALS) {
    const at = body.indexOf(word);
    if (at !== -1) {
      issues.push({ kind: "gendered-form", detail: `generic masculine only: …${snippet(body, at)}…` });
      break;
    }
  }

  return issues;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Website && npx vitest run src/lib/ratgeberCopy.test.ts`
Expected: PASS — 12 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ratgeberCopy.ts src/lib/ratgeberCopy.test.ts
git commit -m "test(ratgeber): add a typography copy-guard for article bodies"
```

---

## Task 2: Wire the guard to the whole corpus

**Files:**
- Create: `src/lib/ratgeber.corpus.test.ts`

- [ ] **Step 1: Write the test**

Create `src/lib/ratgeber.corpus.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { stripFrontmatter, findCopyIssues } from "./ratgeberCopy";

const DIR = path.join(process.cwd(), "content/ratgeber");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

describe("Ratgeber corpus typography", () => {
  it("finds article files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s has clean German typography", (file) => {
    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const issues = findCopyIssues(stripFrontmatter(raw));
    expect({ file, issues }).toEqual({ file, issues: [] });
  });

  it.each(files)("%s has a cover path matching its slug", (file) => {
    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const slug = file.replace(/\.mdx$/, "");
    expect(raw).toContain(`cover: "/images/ratgeber-${slug}.webp"`);
  });
});
```

- [ ] **Step 2: Run it — it must pass on the three existing articles**

Run: `cd Website && npx vitest run src/lib/ratgeber.corpus.test.ts`
Expected: PASS. If the cover-path assertion fails on an existing article, **do not weaken the test** — the existing covers are `ratgeber-system/zeit/termine.webp` while the slugs are longer, so this assertion is expected to fail on the three legacy files.

- [ ] **Step 3: Fix the mismatch found in Step 2**

The three legacy articles use short cover names that do not match their slugs. The skill's rule (`slug == filename stem == <slug> in the cover path`) applies to **new** articles; renaming three live images is out of scope for this plan. Narrow the assertion to the articles this plan creates by replacing the third `it.each` block with:

```ts
  // The three May-2026 articles predate the slug-matches-cover rule and use
  // short cover names (ratgeber-system/zeit/termine). Renaming live assets is
  // out of scope here, so the rule is enforced for articles created after them.
  const LEGACY = new Set([
    "durcheinander-oder-saubere-quelle.mdx",
    "taeglich-stunden-zurueckgewinnen.mdx",
    "terminbestaetigungen-automatisieren.mdx",
  ]);

  // A plain it() with a loop, not it.each — the filtered list is empty until
  // Task 3 lands the first new article, and it.each([]) throws in Vitest.
  it("new articles have a cover path matching their slug", () => {
    for (const file of files.filter((f) => !LEGACY.has(f))) {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const slug = file.replace(/\.mdx$/, "");
      expect({ file, ok: raw.includes(`cover: "/images/ratgeber-${slug}.webp"`) }).toEqual({
        file,
        ok: true,
      });
    }
  });
```

- [ ] **Step 4: Run again to verify it passes**

Run: `cd Website && npx vitest run src/lib/ratgeber.corpus.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ratgeber.corpus.test.ts
git commit -m "test(ratgeber): guard the whole article corpus for typography"
```

---

## Article tasks 3–11

Draft in the order given. Article #4 (`claude-im-alltag-nutzen`, Task 11) is **blocked on founder input** and is deliberately placed last — it is a general article that nothing else references, so deferring it does not break the batch.

Each task below gives the complete frontmatter, the grounding facts, the section outline, a pull-quote candidate, and the filled cover prompt. Follow **Steps A–F** from *Per-article procedure* above.

---

### Task 3: Article #1 — Warum Makler die meisten Anfragen schon in der ersten Stunde verlieren

**Files:** Create `content/ratgeber/warum-makler-anfragen-verlieren.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Warum Makler die meisten Anfragen schon in der ersten Stunde verlieren"
description: "Die meisten Anfragen entscheiden sich in den ersten Minuten. Warum sie trotzdem liegen bleiben – und was das im Jahr kostet."
date: "2026-06-04"
tags: ["Makler", "Automatisierung"]
cover: "/images/ratgeber-warum-makler-anfragen-verlieren.webp"
coverAlt: "Ein dünner, glatter Wasserfilm fließt gleichmäßig über eine klare Kante ins Dunkle."
draft: true
---
```

**Grounding (verified — `Vrelo/wiki/sources/makler-lead-market-research`):**
- Reacting within five minutes rather than later multiplies the odds of reaching and qualifying a lead by roughly **21× / 10×**.
- **ImmoScout24 sells the same enquiry to 2–3 brokers.** The lead is not lost to inaction — it is lost to whoever answers first.
- Vrelo's own prospecting found **0 of 37** Regensburg broker firms with automated lead reaction.

**Outline:**
- `## Der Moment, in dem die Anfrage kalt wird` — the enquiry arrives at 14:10 during a viewing; answered at 19:30; by then two competitors have called.
- `## Es liegt nicht an der Motivation` — it's structural: the lead arrives while you are doing the job you were hired for.
- `## Was sich ändert, wenn die erste Antwort nicht von dir kommt` — what a first reply actually has to do (acknowledge, qualify, offer a slot).

**Pull-quote candidate:** `> Die Anfrage geht nicht verloren, weil du sie nicht bearbeitest. Sie geht verloren, weil jemand anderes schneller war.`

**Cover prompt** (fill `image_prompt.md` §9 base with): `a smooth thin sheet of water spilling over a clean edge`

---

### Task 4: Article #2 — Was KI im Betrieb wirklich kann – und was nicht

**Files:** Create `content/ratgeber/was-ki-im-betrieb-wirklich-kann.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Was KI im Betrieb wirklich kann – und was nicht"
description: "Wo Automatisierung im Alltag tatsächlich etwas bringt, wo sie nichts ändert – und wie du den Unterschied vorher erkennst."
date: "2026-06-11"
tags: ["Grundlagen", "KI"]
cover: "/images/ratgeber-was-ki-im-betrieb-wirklich-kann.webp"
coverAlt: "Weiche Lichtstrahlen brechen von oben durch eine ruhige Wasseroberfläche."
draft: true
---
```

**Grounding:** Vrelo's own **Bordmittel rule** — before building anything, check what the system already ships natively. Told as a founder's mistake: a KPI dashboard was specced, built and shipped live before anyone noticed the platform already provided the same data natively.

> ⚠ **Tell this without naming or identifying the client.** It is the founder's mistake, not a client's. Write „ein Projekt“ / „ein Kunde“, never the name, the industry or the city.

**Outline:**
- `## Der Teil, der wirklich funktioniert` — repetitive, rule-shaped, high-volume work: sorting, replying, collecting, reminding.
- `## Der Teil, der überschätzt wird` — judgement, relationships, anything needing context only the owner has.
- `## Die Frage, die ich mir zuerst stelle` — does the tool you already pay for do this? The mistake story lands here.

**Pull-quote candidate:** `> Die beste Automatisierung ist die, die du nicht baust, weil es sie schon gibt.`

**Cover prompt:** `soft sunlight rays breaking through the surface from above`

---

### Task 5: Article #3 — Unterlagen einsammeln, ohne ständig nachzufassen

**Files:** Create `content/ratgeber/unterlagen-einsammeln-ohne-nachfassen.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Unterlagen einsammeln, ohne ständig nachzufassen"
description: "Fehlende Unterlagen kosten oft mehr Zeit als die Beratung selbst. Wie das Einsammeln läuft, ohne dass du dreimal erinnern musst."
date: "2026-06-18"
tags: ["Automatisierung", "Praxis"]
cover: "/images/ratgeber-unterlagen-einsammeln-ohne-nachfassen.webp"
coverAlt: "Einzelne Tropfen fallen in ruhigem, gleichmäßigem Takt auf dunkles Wasser."
draft: true
---
```

**Grounding (Vrelo's own design — `Knowledge/Strategy/Document_Concierge.md`):**
- A checklist goes out once; the client uploads over **one secure link**, not by mail attachment.
- **Presence + sanity check:** a blurry photo or the wrong document bounces back immediately instead of surfacing three days later.
- The nudges are **hybrid** (WhatsApp / SMS / E-Mail) and stop by themselves once the item arrives.
- Files land in the **client's own** cloud folder.

**Outline:**
- `## Das Problem ist nicht das Hochladen` — it's the chasing: knowing who still owes what, and asking again without being a nuisance.
- `## Was ein sauberer Ablauf leistet` — one link, a visible checklist, automatic reminders that stop on their own.
- `## Warum die Prüfung beim Eingang zählt` — a document that arrives wrong is worse than one that hasn't arrived; you find out at the wrong moment.

**Pull-quote candidate:** `> Nachfassen ist keine Arbeit, die jemand können muss. Sie muss nur zuverlässig passieren.`

**Cover prompt:** `slow droplets falling in a steady rhythm`

---

### Task 6: Article #5 — Dein CRM antwortet schon – warum daraus trotzdem kein Termin wird

**Files:** Create `content/ratgeber/crm-antwortet-aber-kein-termin.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Dein CRM antwortet schon – warum daraus trotzdem kein Termin wird"
description: "onOffice und FlowFact antworten sofort, meist mit dem Exposé. Was zwischen dieser Antwort und einem Termin im Kalender fehlt."
date: "2026-07-02"
tags: ["Makler", "Automatisierung"]
cover: "/images/ratgeber-crm-antwortet-aber-kein-termin.webp"
coverAlt: "Zwei ruhige Strömungen laufen langsam zu einer zusammen."
draft: true
---
```

**Grounding (verified — `Knowledge/marketing/competitive-positioning-crm.md`):**
- **Concede the auto-reply.** Both onOffice and FlowFact *do* fire an instant reply — a templated Exposé.
- Neither **qualifies** the lead; both then wait for a human task.
- onOffice has self-booking (**onPointment**) but it is a separate paid product **not wired to the reply**; FlowFact has none — the broker mails an .ICS by hand.
- Both can be configured to do more — via a flowchart builder, over 3–6 weeks, by the broker.

> **Honest boundary, do not overclaim:** never write that the CRMs do nothing or cannot let leads book. The claim is that the integrated reply → qualify → book chain is not what they hand a small broker out of the box.

**Outline:**
- `## Was dein CRM tatsächlich macht` — credit where it's due; the Exposé goes out in seconds.
- `## Wo die Kette abreißt` — the lead has a PDF and no next step; he calls the next broker.
- `## Der Unterschied zwischen Antwort und Termin` — qualifying and offering a concrete slot is a different job from sending a document.

**Pull-quote candidate:** `> Eine sofortige Antwort ist nicht dasselbe wie ein sicherer Termin.`

**Cover prompt:** `two slow streams quietly merging into one`

---

### Task 7: Article #6 — Selbst bauen oder bauen lassen?

**Files:** Create `content/ratgeber/selbst-bauen-oder-bauen-lassen.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Selbst bauen oder bauen lassen?"
description: "Automatisierung selbst zusammenstecken oder abgeben? Die ehrliche Rechnung, inklusive der Kosten, die erst nach Monaten auftauchen."
date: "2026-07-09"
tags: ["Grundlagen", "Praxis"]
cover: "/images/ratgeber-selbst-bauen-oder-bauen-lassen.webp"
coverAlt: "Wasser sucht sich seinen Weg zwischen glatten, dunklen Steinen."
draft: true
---
```

**Grounding:**
- Market rates for the alternative: **Freelancer 60–120 €/h**, Agentur 80–200 €/h (market figures, not Vrelo's).
- The honest case **for** DIY: a small, single-step automation with no sensitive data is genuinely worth doing yourself, and the tools are good now.
- The cost that shows up later: the maintenance tail. An API changes, a token expires, a format shifts — and it fails silently at the worst moment.

**Outline:**
- `## Wann Selbermachen die richtige Antwort ist` — argue this honestly and first; it earns the rest.
- `## Was in der Rechnung meistens fehlt` — not the build, the six months after it.
- `## Die Frage, die es entscheidet` — what happens when it breaks and you are with a client?

**Pull-quote candidate:** `> Die Frage ist nicht, ob du es bauen kannst. Sondern wer es repariert, während du beim Kunden sitzt.`

**Cover prompt:** `water finding its path between smooth rocks`

---

### Task 8: Article #7 — Wo läuft eigentlich deine KI?

**Files:** Create `content/ratgeber/wo-laeuft-deine-ki.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Wo läuft eigentlich deine KI?"
description: "Bevor du einem Anbieter sensible Unterlagen anvertraust: die eine Frage, die klärt, wo deine Daten und dein Modell tatsächlich liegen."
date: "2026-07-16"
tags: ["Vertrauen", "KI"]
cover: "/images/ratgeber-wo-laeuft-deine-ki.webp"
coverAlt: "Klare Lichtmuster wandern über einen hellen, sandigen Grund."
draft: true
---
```

**Grounding (the founder's own finding — genuinely his to tell):**
- Building a document workflow for sensitive papers, he found that **the model provider's first-party API offered no EU region** — the request would have left the EU while the offer said „EU-gehostet“.
- The fix was to run the same model through a **cloud platform with a real EU region**, in the client's own project, with a proper Auftragsverarbeitungsvertrag.
- **Gehaltsabrechnungen, SCHUFA-Auskünfte and Mandantenakten** are the documents where this stops being academic.

> **Two hard boundaries.** (1) **Name no competitor and no provider as a wrongdoer.** Most providers do offer EU residency; you cannot see anyone's configuration from outside. (2) The article's payload is a **question the reader asks his own provider**, never an accusation. Frame: „frag nach, wo genau das Modell läuft und wer der Auftragsverarbeiter ist.“

**Outline:**
- `## „DSGVO-konform“ steht schnell auf einer Seite` — the phrase is cheap; what it should mean is specific.
- `## Was ich selbst übersehen hätte` — the founder's own finding, told plainly, without naming the vendor.
- `## Die drei Fragen, die Klarheit schaffen` — where does the model run · who is the Auftragsverarbeiter · where do the files end up. A `-` bullet list is justified here.

**Pull-quote candidate:** `> „EU-gehostet“ ist keine Eigenschaft der Software. Es ist eine Frage, die du stellen musst.`

**Cover prompt:** `clear light caustics rippling over a pale sandy bed`

---

### Task 9: Article #8 — Was kostet es, Anfragen automatisch beantworten zu lassen?

**Files:** Create `content/ratgeber/was-kostet-anfragen-automatisieren.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Was kostet es, Anfragen automatisch beantworten zu lassen?"
description: "Echte Preisspannen statt „kommt darauf an“ – und woran du erkennst, in welchen Bereich dein eigenes Projekt fällt."
date: "2026-07-23"
tags: ["Kosten", "Grundlagen"]
cover: "/images/ratgeber-was-kostet-anfragen-automatisieren.webp"
coverAlt: "Ein tiefes, klares Becken gibt den Blick auf glatte Kiesel weit unten frei."
draft: true
---
```

**Grounding — market figures (not Vrelo's own):**
- Fertige Tools von der Stange: **200–2.000 € pro Monat**.
- Ein zugeschnittener Prozess: **5.000–25.000 € einmalig**, dazu laufend etwa **10–15 % im Jahr**.
- Vollständig individuelle Entwicklungen: **ab 25.000 €**.
- Freelancer **60–120 €/Stunde**, Agenturen **80–200 €/Stunde**.

> **The two rules that make this article publishable** (spec §1 decision 2, §3):
> 1. **Name no competitor.** The anchor works because it is the market's. Write „am Markt“, „übliche Spannen“ — never a firm.
> 2. **State no Vrelo price.** Place Vrelo qualitatively and only once: **„meine Projekte liegen meist unter diesen Spannen – je nach Projekt.“** No figure, no range, no „ab“.

**Outline:**
- `## Warum niemand gern eine Zahl nennt` — name the reason honestly (scope varies), then refuse to hide behind it.
- `## Die Spannen, die am Markt üblich sind` — the figures above. A `-` bullet list is justified here.
- `## Woran du erkennst, wo dein Projekt landet` — number of channels, sensitivity of the data, whether existing systems must be touched.

**Pull-quote candidate:** `> „Kommt darauf an“ ist keine Antwort. Es ist eine Bitte um ein Gespräch, bevor man ehrlich war.`

**Cover prompt:** `a deep clear pool revealing smooth pebbles far below`

---

### Task 10: Article #9 — Aus jeder Anfrage ein Termin – wie das konkret abläuft

**Files:** Create `content/ratgeber/aus-jeder-anfrage-ein-termin.mdx`

**Frontmatter (verbatim):**

```yaml
---
title: "Aus jeder Anfrage ein Termin – wie das konkret abläuft"
description: "Von der eingehenden Anfrage bis zum bestätigten Termin: die einzelnen Schritte, wer was macht und was davon automatisch läuft."
date: "2026-07-30"
tags: ["Makler", "Termine"]
cover: "/images/ratgeber-aus-jeder-anfrage-ein-termin.webp"
coverAlt: "Eine gleichmäßige, ununterbrochene Strömung zieht ruhig durchs Bild."
draft: true
---
```

**Grounding (Vrelo's delivery standard — `Knowledge/Offers/2026-07-14-termin-quelle-integration-design.md`):**
- It wires into the channels the broker **already** uses — no new inbox, no portal to learn, no CRM replacement.
- The reply is **hybrid**: a written answer that qualifies, leading to a **deterministic booking page** — the booking step itself uses no AI, so it cannot improvise a slot.
- Everything runs on the **broker's own server**; he owns it whether or not he stays a client.
- Per the EU AI Act, an automated assistant that talks to a lead **says that it is one**. Name this as a feature, not a footnote.

**Outline:**
- `## Was passiert, wenn die Anfrage eingeht` — walk the actual sequence, minute by minute.
- `## Wo du weiter entscheidest` — the broker sets availability and rules; the system never invents a commitment.
- `## Was davon dir gehört` — his channels, his server, his calendar.

**Pull-quote candidate:** `> Automatisch heißt nicht, dass jemand anderes entscheidet. Es heißt, dass nichts liegen bleibt.`

**Cover prompt:** `an unbroken, even, slow-moving current`

---

### Task 11: Article #4 — Wie du Claude im Alltag wirklich nutzt ⚠ BLOCKED

**Files:** Create `content/ratgeber/claude-im-alltag-nutzen.mdx`

- [ ] **Step 0 — Ask the founder these four questions and wait for real answers.** Do **not** proceed without them, and do **not** invent them. This is a first-person personal brand; a fabricated working habit is the one thing that would damage the „der Saubere“ positioning this article exists to support.

1. What do you actually use Claude for in a normal week — name two or three real tasks.
2. What surprised you: something it turned out to be good at, or bad at, that you did not expect.
3. What did you **stop** doing because of it?
4. One moment where it got something wrong and you noticed.

Question 4 carries the article. An article about an AI tool that admits nothing reads like advertising.

**If the founder has no time:** the agreed fallback (spec §4) is to drop this article from the batch and replace it with a sixth broker piece — „Was Makler bei der ersten Automatisierung falsch machen“, same date and cover motif — moving the Claude article to the forward cadence from August.

**Frontmatter (verbatim; the description may sharpen after the answers, the rest is fixed):**

```yaml
---
title: "Wie du Claude im Alltag wirklich nutzt"
description: "Wofür sich ein KI-Assistent im Arbeitsalltag lohnt, wofür nicht – und woran du merkst, dass du ihm gerade zu viel glaubst."
date: "2026-06-25"
tags: ["KI", "Praxis"]
cover: "/images/ratgeber-claude-im-alltag-nutzen.webp"
coverAlt: "Langsam aufsteigende Luftblasen lösen sich aus dunkler Tiefe."
draft: true
---
```

**Outline** (fill each section from the answers, not from general knowledge):
- `## Wofür ich es tatsächlich benutze` — answers to Q1, concrete and unglamorous.
- `## Was mich überrascht hat` — answer to Q2.
- `## Wo ich vorsichtig geworden bin` — answer to Q4. This section is the reason the article is worth reading.

**Pull-quote candidate** (replace with something from the founder's own answers if one is better): `> Ein Werkzeug wird nicht dadurch nützlich, dass es alles kann. Sondern dadurch, dass du weißt, wann du es prüfst.`

**Cover prompt:** `slow bubbles rising from the dark depths`

---

## Task 12: Cross-article pass

**Files:** Modify any of the nine `content/ratgeber/*.mdx` as needed.

- [ ] **Step 1: Check for a repeated central argument**

Run: `cd Website && npx vitest run src/lib/ratgeber.corpus.test.ts` (confirm all green), then read the nine pull-quotes in sequence:

```bash
cd Website && grep -h "^> " content/ratgeber/*.mdx
```

Expected: nine distinct claims. **No two articles may carry the same central argument.** The known risk pairs are #1 vs #9 (both about the lead→Termin path) and #6 vs #8 (both touch cost). If two overlap, narrow the later one — do not delete it.

- [ ] **Step 2: Check the water metaphors differ between neighbours**

```bash
cd Website && for f in content/ratgeber/*.mdx; do echo "== $f"; grep -oiE "Quelle|Fluss|fließ|Wasser|Strom|Welle|Tropfen|Ufer" "$f" | sort -u | tr '\n' ' '; echo; done
```

Expected: each article shows **one** metaphor concept, and articles adjacent by date do not repeat the same one. Rewrite the later of any duplicate pair.

- [ ] **Step 3: Confirm no article closes on a CTA**

```bash
cd Website && for f in content/ratgeber/*.mdx; do echo "== $f"; tail -4 "$f"; done
```

Expected: each ends on the article's own point. Any „melde dich“, „unverbindlich“, „jetzt“, „kein Druck“ in a closing paragraph must be cut — the page's CTA band already makes the ask.

- [ ] **Step 4: Commit any fixes**

```bash
git add content/ratgeber/
git commit -m "content(ratgeber): cross-article pass — distinct arguments and metaphors"
```

---

## Task 13: Covers, full gate, and finish

**Files:** Create `public/images/ratgeber-<slug>.webp` × 9

- [ ] **Step 1: Emit the cover brief for the founder**

Produce one message listing, for each of the nine articles: the slug, the title, and the **filled** `image_prompt.md` §9 base prompt with its `[MOTIF]` substituted. Include the workflow notes verbatim: generate 2–3 variants each, keep the calmest and most negative-space-heavy, feed an existing cover (`public/images/ratgeber-termine.webp`) as a colour reference so the batch shares one grade, and keep every image dark and low-contrast because a light German headline sits on top.

- [ ] **Step 2: Convert the delivered images to WebP**

The founder drops source PNG/JPEG files into the gitignored `Images/` folder. Convert with the repo's existing `sharp` (0.34.5):

```bash
cd Website && node -e "
const sharp=require('sharp'), fs=require('fs'), path=require('path');
const SRC='Images', OUT='public/images';
for (const f of fs.readdirSync(SRC)) {
  if(!/\.(png|jpe?g)\$/i.test(f)) continue;
  const slug=path.parse(f).name;
  const out=path.join(OUT,'ratgeber-'+slug+'.webp');
  sharp(path.join(SRC,f)).webp({quality:80}).toFile(out)
    .then(i=>console.log('wrote',out,Math.round(i.size/1024)+'kB'))
    .catch(e=>{console.error('FAILED',f,e.message); process.exitCode=1;});
}
"
```

Expected: nine lines `wrote public/images/ratgeber-<slug>.webp <n>kB`. The source filename stem must equal the article slug.

- [ ] **Step 3: Run the full gate**

```bash
cd Website && npm test && npx tsc --noEmit && npm run lint && npm run build
```

Expected: all four PASS. `ratgeber.covers.test.ts` now finds every cover — this is the first point in the plan where the full suite is green.

- [ ] **Step 4: Commit**

```bash
git add public/images/ratgeber-*.webp
git commit -m "content(ratgeber): add the nine article covers"
```

- [ ] **Step 5: Hand back for publishing**

The nine articles are on the branch as `draft: true`. Report to the founder that publishing is nine deliberate flips of `draft: false` — a human step by design, and the last chance to catch a backdated article that reads wrong. Then use `superpowers:finishing-a-development-branch` to merge.

---

## Notes for the implementer

- **Do not flip `draft: false`.** Publishing is the founder's decision, article by article.
- **Do not weaken a guard to make a test pass.** If the copy-guard fails, the copy is wrong.
- **Do not cite any competitor by name** in any article, and never accuse a named provider of a data-protection failure (Tasks 8 and 9 carry the specific boundaries).
- **Byte-verify after every write.** The Write/Edit tools silently downgrade the closing „…“ to `”`. Task 1's guard catches it, but repair with codepoint escapes only:
  `perl -CSD -0777 -i -pe 's/\x{201E}([^\x{201E}\x{201C}]*?)\x{201D}/\x{201E}${1}\x{201C}/gs' FILE`
  Never type a literal `”` into the perl program — it cannot match, and the check then passes on a dirty file forever.
- **The dates are backdated on purpose** (spec §1 decision 1). Use the `date` given in each task, never today's date.
