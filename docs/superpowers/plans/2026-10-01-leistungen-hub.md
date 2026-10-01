# Leistungen-Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/leistungen` into a hub with seven KI/automation subpages (`/leistungen/<slug>`), each built from one five-block template (Hero, Pain, Proof, Example, CTA), with a Leistungen dropdown in the nav, the homepage Prozess-Check section removed, and the Ratgeber linked in as the knowledge layer.

**Architecture:** All German copy for the seven pages lives in one typed data file (`src/lib/leistungenPages.ts`); one static dynamic route renders any entry through five small block components. The hub, nav, homepage chips and Ratgeber back-links all read the same data, so a new service is one new entry. `/kontakt` learns to read `?src=` so Erstgespräch-first pages are attributable like Prozess-Check pages.

**Tech Stack:** Next.js 16 (App Router, `params` is a Promise — read `node_modules/next/dist/docs/` before touching routing APIs, per `AGENTS.md`), React, TypeScript, Tailwind, Vitest + Testing Library, ffmpeg (clip encode).

**Spec:** `docs/superpowers/specs/2026-10-01-leistungen-hub-design.md` — read it before starting; this plan argues from it.

## Global Constraints

- All commands run inside `Website/` (its own git repo). Commit after each task; messages end with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. **Do not push** — `main` auto-deploys to production; pushing is Ajdin's call after Task 12.
- German copy: „…“ quotes only (U+201E/U+201C), **no Gedankenstrich** (no U+2013, no U+2014), ranges with „bis“, generic masculine, **du**-address, no „!!!“, no hype words (skalieren, KI-Magie, Game-Changer).
- The Edit/Write tools can silently downgrade „“ — after every write to a copy file run the byte check in Task 3 Step 4. In perl checks every non-ASCII character must be written as `\x{…}`.
- No Vrelo price and no `€` amount on any page (study figures excepted). No competitor named. KI-Server copy says „innerhalb der EU“, never „Frankfurt“. Never „Partner“ or „zertifiziert“ anywhere in this copy (Claude/Anthropic status claim, UWG §5).
- The Digitalbonus note is worded as a possibility („kann“), always names „Antrag … bevor“, carries no `€` and no `%`.
- Client names (Velp, MDZ, Baude) never appear; cases are anonymous.
- Components hold no German copy except structural labels already established in the codebase pattern (e.g. „Quelle:“, „Mehr dazu:“, „Alle Leistungen“); page copy comes from `leistungenPages.ts`.
- Slugs (fixed): `prozessautomatisierung`, `ki-automatisierung`, `ki-server`, `claude`, `ki-schulung`, `ki-beratung`, `betreuung`.

## Review Focus

1. **A long German compound in an H1 on a 320 px phone** („Prozessautomatisierung“, „KI-Automatisierung & Assistenten“) must wrap or hyphenate, never cause horizontal page scroll → Task 5 adds `hyphens-auto break-words` to the `PageHero` H1 with a test; Task 12 checks 320 px in the browser.
2. **An unknown slug (`/leistungen/gibt-es-nicht`)** must 404, not render an empty template → Task 5 test.
3. **A junk or overlong `?src=` on `/kontakt`** (`?src=<script>`, 60 chars) must be dropped, never reach the Cal notes → Task 2 test.
4. **A `related` Ratgeber article that is still `draft: true`** must not be linked in production → Task 5 test (`relatedArticles` with drafts hidden).
5. **Keyboard users on the Leistungen dropdown**: Escape closes and returns focus to the toggle, tabbing out closes it, a click outside closes it → Task 8 tests.

---

## File map

| File | Responsibility | Task |
|---|---|---|
| `Knowledge/marketing/ki-studien.md` (HQ, not this repo) | Verified study figures + the TS block for the page | 1 |
| `src/lib/prozessCheckCta.ts` | + 7 subpage `CHECK_SRC` slugs, `kontaktHref()`; − home teaser | 2, 9 |
| `src/components/ClosingCta.tsx` | kontakt branch carries `?src=` and says „Erstgespräch buchen“ | 2 |
| `src/components/kontakt/SchedulerFromUrl.tsx` (new) | reads `?src=` client-side → scheduler notes | 2 |
| `src/app/kontakt/page.tsx` | wraps scheduler in `Suspense` + `SchedulerFromUrl` | 2 |
| `src/lib/leistungenPages.ts` (new) | types + all copy for the seven pages + helpers | 3 |
| `src/components/leistungen/page/*.tsx` (new) | `PainBlock`, `ProofBlock`, `ExampleBlock`, `NoteBlock`, `RelatedLinks` | 4 |
| `src/app/leistungen/[slug]/page.tsx` (new) | the subpage route | 5 |
| `src/lib/jsonld.ts` | + `serviceLd()` | 5 |
| `src/app/sitemap.ts` | + seven routes | 5 |
| `src/components/PageHero.tsx` | H1 hyphenation | 5 |
| `public/video/ki-assistent.mp4` + `.webp` (new) | the anonymised assistant clip | 6 |
| `src/app/leistungen/page.tsx` + `src/components/leistungen/ServiceGroups.tsx` (new) | the hub | 7 |
| `src/lib/leistungen-weg.ts` | audit link → `/leistungen/ki-beratung#prozess-audit` | 7 |
| `src/lib/nav.ts`, `src/components/LeistungenMenu.tsx` (new), `Header.tsx`, `MobileNav.tsx` | dropdown | 8 |
| `src/app/page.tsx`, `src/components/home/WasIchBaue.tsx` | homepage | 9 |
| `src/lib/ratgeber.ts`, `RatgeberIndex.tsx`, `src/app/ratgeber/[slug]/page.tsx`, `content/ratgeber/*.mdx` | kategorie + leistung | 10 |

Deleted: `src/components/home/ProzessCheckSection.tsx` (+ test), `src/components/leistungen/LeistungCard.tsx`, `src/components/leistungen/MehrMoeglich.tsx`, `src/lib/leistungen.ts` (+ test).

---

### Task 1: Research the study figures (KI-Automatisierung proof)

No code. Produces the only input Task 3 cannot write itself.

**Files:**
- Create: `C:\Users\ajdin\Vrelo\Knowledge\marketing\ki-studien.md`

**Interfaces:**
- Produces: a fenced `ts` block under the heading `## 3. TS-Block` containing exactly `export const kiStudien: StudyFigure[] = [ … ];` with 2 or 3 entries of shape `{ figure: string; claim: string; source: string; year: number; url: string }`. Task 3 pastes it verbatim.

- [ ] **Step 1: Collect candidates from primary sources only.** Search (WebSearch, mode `standard`; Firecrawl if WebFetch returns thin content — key in `Products/VreloVPS/.env`) for current figures from: Bitkom (annual KI-Studie / „Künstliche Intelligenz in Deutschland“), Destatis (Pressemitteilung „Nutzung von Künstlicher Intelligenz in Unternehmen“, IKT-Erhebung), KfW Research (Mittelstand + KI), IW Köln, IfM Bonn, ifo, McKinsey „State of AI“, BCG, Deloitte. KI-Helden's numbers are leads only, never a source.

- [ ] **Step 2: Verify each candidate on the source page itself.** Open the original page or PDF, copy the exact sentence, note sample (size class), publication year, URL, retrieval date (2026-10-xx). Drop any figure you cannot see on the source page, any figure older than 2024, and any figure whose source page is paywalled.

- [ ] **Step 3: Choose 2 or 3** that answer the visitor's question „nutzen andere das schon, und bringt es was?“: one adoption figure, one measured effect (time or cost), one barrier figure („fehlendes Wissen“ or similar). Prefer figures broken down by company size.

- [ ] **Step 4: Write the doc** with these sections:

```markdown
# KI-Studien: verifizierte Zahlen für die Website (Stand 2026-10-xx)

Zweck: Beweis-Block auf `/leistungen/ki-automatisierung`. Regel: nur Primärquellen, jede Zahl auf der Quellseite selbst geprüft, Quelle + Jahr + Link sichtbar.

## 1. Kandidaten (alle geprüften)
| Zahl | Wortlaut auf der Quelle (exakt) | Stichprobe | Quelle | Jahr | URL | abgerufen |
|---|---|---|---|---|---|---|

## 2. Auswahl für die Website (2 bis 3) und warum

## 3. TS-Block
```ts
export const kiStudien: StudyFigure[] = [
  { figure: "…", claim: "…", source: "…", year: 2025, url: "https://…" },
];
```
```

`claim` is one German sentence in Vrelo voice (no Gedankenstrich, „…“ quotes, no exaggeration beyond the source's wording). `figure` is the number as displayed, e.g. `"36 %"` (space before `%`).

- [ ] **Step 5: Add one line to the HQ index.** In `C:\Users\ajdin\Vrelo\CLAUDE.md` §2.2, under the „Sales — live“ bullet's neighbourhood, add: `- **KI-Studien (2026-10-xx):** [ki-studien.md](Knowledge/marketing/ki-studien.md) — verifizierte Bitkom-/Destatis-/Beratungs-Zahlen für den Beweis-Block auf /leistungen/ki-automatisierung; nur Primärquellen, Quelle + Jahr + Link.` (HQ root is not a git repo; no commit.)

---

### Task 2: CTA plumbing — subpage `src` slugs and `/kontakt?src=`

**Files:**
- Modify: `src/lib/prozessCheckCta.ts` (CHECK_SRC block + new `kontaktHref`)
- Modify: `src/components/ClosingCta.tsx` (kontakt branch)
- Create: `src/components/kontakt/SchedulerFromUrl.tsx`
- Modify: `src/app/kontakt/page.tsx`
- Test: `src/lib/prozessCheckCta.test.ts`, `src/components/ClosingCta.test.tsx`, `src/components/kontakt/SchedulerFromUrl.test.tsx` (new)

**Interfaces:**
- Produces: `CHECK_SRC.leistungProzessautomatisierung | leistungKiAutomatisierung | leistungKiServer | leistungClaude | leistungKiSchulung | leistungKiBeratung | leistungBetreuung` (values `"leistung-<slug>"`), `kontaktHref(src: CheckSrc): string` → `"/kontakt?src=<src>"`, `SchedulerFromUrl({ calLink }: { calLink: string | undefined })`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/prozessCheckCta.test.ts`:

```ts
import { kontaktHref } from "./prozessCheckCta";

describe("subpage attribution", () => {
  it("has one normalisable slug per Leistungen subpage", () => {
    const slugs = [
      CHECK_SRC.leistungProzessautomatisierung,
      CHECK_SRC.leistungKiAutomatisierung,
      CHECK_SRC.leistungKiServer,
      CHECK_SRC.leistungClaude,
      CHECK_SRC.leistungKiSchulung,
      CHECK_SRC.leistungKiBeratung,
      CHECK_SRC.leistungBetreuung,
    ];
    expect(new Set(slugs).size).toBe(7);
    for (const s of slugs) expect(normalizeSource(s)).toBe(s);
  });

  it("builds the Erstgespräch link with the same src", () => {
    expect(kontaktHref(CHECK_SRC.leistungClaude)).toBe("/kontakt?src=leistung-claude");
  });
});
```

(`normalizeSource` is already imported at the top of that file.)

In `src/components/ClosingCta.test.tsx`, inside `it("flips to /kontakt primary with the check as secondary (FAQ exception)")` (it renders `<ClosingCta heading="h" lead="l" src="faq" primary="kontakt" />`), replace

```ts
    expect(screen.getByRole("link", { name: "Zeit zurückgewinnen" })).toHaveAttribute("href", "/kontakt");
```

with

```ts
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt?src=faq");
```

The secondary-link test above it (`src="ratgeber"`, default `primary="check"`) keeps `/kontakt`: the quiet Erstgespräch link under a check button is unchanged.

Create `src/components/kontakt/SchedulerFromUrl.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const params = { value: new URLSearchParams() };
vi.mock("next/navigation", () => ({ useSearchParams: () => params.value }));

const seen: { notes?: string }[] = [];
vi.mock("./SchedulerEmbed", () => ({
  SchedulerEmbed: (props: { notes?: string }) => {
    seen.push(props);
    return null;
  },
}));

import { SchedulerFromUrl } from "./SchedulerFromUrl";

describe("SchedulerFromUrl", () => {
  beforeEach(() => {
    seen.length = 0;
  });

  it("passes a valid src into the booking notes", () => {
    params.value = new URLSearchParams("src=leistung-claude");
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBe("Quelle: leistung-claude");
  });

  it("drops junk and overlong src values", () => {
    params.value = new URLSearchParams("src=%3Cscript%3E");
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBeUndefined();
    params.value = new URLSearchParams(`src=${"a".repeat(60)}`);
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBeUndefined();
  });

  it("omits notes when there is no src", () => {
    params.value = new URLSearchParams();
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/prozessCheckCta.test.ts src/components/ClosingCta.test.tsx src/components/kontakt/SchedulerFromUrl.test.tsx`
Expected: FAIL (`kontaktHref` not exported, `CHECK_SRC.leistung…` undefined, module `./SchedulerFromUrl` not found, ClosingCta link href `/kontakt`).

- [ ] **Step 3: Implement**

In `src/lib/prozessCheckCta.ts`, extend `CHECK_SRC` (keep every existing key; insert after `leistungenClose`):

```ts
  leistungProzessautomatisierung: "leistung-prozessautomatisierung",
  leistungKiAutomatisierung: "leistung-ki-automatisierung",
  leistungKiServer: "leistung-ki-server",
  leistungClaude: "leistung-claude",
  leistungKiSchulung: "leistung-ki-schulung",
  leistungKiBeratung: "leistung-ki-beratung",
  leistungBetreuung: "leistung-betreuung",
```

and below `checkHref`:

```ts
// The Erstgespräch twin of checkHref: /kontakt reads ?src= on the client and
// writes it into the Cal booking notes, so a call booked from a subpage whose
// primary button is the Erstgespräch stays attributable (spec 2026-10-01 §5).
export function kontaktHref(src: CheckSrc): string {
  return `/kontakt?src=${src}`;
}
```

In `src/components/ClosingCta.tsx`, import `kontaktHref` alongside `checkHref` and replace the kontakt branch's button:

```tsx
            <CTAButton href={kontaktHref(src)} variant="inverse">
              {CHECK_CTA.directLabel}
            </CTAButton>
```

Create `src/components/kontakt/SchedulerFromUrl.tsx`:

```tsx
// src/components/kontakt/SchedulerFromUrl.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { normalizeSource } from "@/lib/source";
import { SchedulerEmbed } from "./SchedulerEmbed";

// Reads `?src=` on the client so /kontakt stays static (same pattern as
// ProzessCheckFromUrl). The slug is allow-listed by normalizeSource before it
// reaches the Cal notes field.
export function SchedulerFromUrl({ calLink }: { calLink: string | undefined }) {
  const params = useSearchParams();
  const source = normalizeSource(params?.get("src"));
  return <SchedulerEmbed calLink={calLink} notes={source ? `Quelle: ${source}` : undefined} />;
}
```

In `src/app/kontakt/page.tsx`: add `import { Suspense } from "react";` and `import { SchedulerFromUrl } from "@/components/kontakt/SchedulerFromUrl";`, and replace `<SchedulerEmbed calLink={calLink()} />` with:

```tsx
        <Suspense fallback={<SchedulerEmbed calLink={calLink()} />}>
          <SchedulerFromUrl calLink={calLink()} />
        </Suspense>
```

- [ ] **Step 4: Run to verify they pass, then the full suite**

Run: `npx vitest run src/lib/prozessCheckCta.test.ts src/components/ClosingCta.test.tsx src/components/kontakt/SchedulerFromUrl.test.tsx`
Expected: PASS.
Run: `npm test`
Expected: PASS. If an FAQ test asserted the old „Zeit zurückgewinnen“ → `/kontakt` button, update it to `Erstgespräch buchen` → `/kontakt?src=faq` (the label change is intended: the kontakt-first close now names the step).

- [ ] **Step 5: Commit**

```bash
git add src/lib/prozessCheckCta.ts src/lib/prozessCheckCta.test.ts src/components/ClosingCta.tsx src/components/ClosingCta.test.tsx src/components/kontakt/SchedulerFromUrl.tsx src/components/kontakt/SchedulerFromUrl.test.tsx src/app/kontakt/page.tsx
git commit -m "feat(kontakt): attribute Erstgespräch bookings via ?src=, subpage slugs

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: The page data — `leistungenPages.ts`

**Files:**
- Create: `src/lib/leistungenPages.ts`
- Test: `src/lib/leistungenPages.test.ts`

**Interfaces:**
- Consumes: `CHECK_SRC`, `CheckSrc` (Task 2); `kiStudien` TS block (Task 1); `findCopyIssues` from `src/lib/ratgeberCopy.ts`; `getAllArticles` from `src/lib/ratgeber.ts`.
- Produces:
  - `type LeistungSlug = "prozessautomatisierung" | "ki-automatisierung" | "ki-server" | "claude" | "ki-schulung" | "ki-beratung" | "betreuung"`
  - `type LeistungGroup = "automatisieren" | "befaehigen" | "betreiben"`
  - `type StudyFigure`, `type Proof`, `type LeistungPage` (below)
  - `leistungGroups: { id: LeistungGroup; label: string }[]`
  - `leistungenPages: LeistungPage[]` (seven, in slug order above)
  - `getLeistungPage(slug: string): LeistungPage | undefined`
  - `leistungHref(slug: LeistungSlug): string` → `"/leistungen/<slug>"`

- [ ] **Step 1: Write the failing test** — `src/lib/leistungenPages.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { leistungenPages, leistungGroups, getLeistungPage, leistungHref, type LeistungPage } from "./leistungenPages";
import { findCopyIssues } from "./ratgeberCopy";
import { getAllArticles } from "./ratgeber";

const SLUGS = ["prozessautomatisierung", "ki-automatisierung", "ki-server", "claude", "ki-schulung", "ki-beratung", "betreuung"];
const NON_COPY_KEYS = new Set(["slug", "group", "heroImage", "url", "src", "poster", "href", "related", "kind", "year"]);

// Every German string on a page, skipping paths, URLs and enum-like keys.
function copyStrings(value: unknown, out: string[] = [], key = ""): string[] {
  if (NON_COPY_KEYS.has(key)) return out;
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) copyStrings(v, out, key);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) copyStrings(v, out, k);
  return out;
}

function nonStudyStrings(p: LeistungPage): string[] {
  const { proof, ...rest } = p;
  const proofCopy = proof.kind === "studies"
    ? [proof.heading, proof.caseLine ?? "", proof.objection]
    : copyStrings(proof);
  return [...copyStrings(rest), ...proofCopy];
}

const pub = (p: string) => path.join(process.cwd(), "public", p);

describe("leistungenPages", () => {
  it("has the seven agreed pages in order", () => {
    expect(leistungenPages.map((p) => p.slug)).toEqual(SLUGS);
  });

  it("groups three, three and one", () => {
    expect(leistungGroups.map((g) => g.label)).toEqual(["Automatisieren", "Befähigen", "Betreiben"]);
    const by = (g: string) => leistungenPages.filter((p) => p.group === g).map((p) => p.slug);
    expect(by("automatisieren")).toEqual(["prozessautomatisierung", "ki-automatisierung", "ki-server"]);
    expect(by("befaehigen")).toEqual(["claude", "ki-schulung", "ki-beratung"]);
    expect(by("betreiben")).toEqual(["betreuung"]);
  });

  it.each(leistungenPages.map((p) => [p.slug, p] as const))("%s fills every block", (_s, p) => {
    for (const s of [p.navLabel, p.title, p.subline, p.metaDescription, p.kurz, p.pain.heading, p.pain.close, p.proof.heading, p.proof.objection, p.example.heading, p.example.before, p.example.after, p.cta.heading, p.cta.lead])
      expect(s.trim().length).toBeGreaterThan(0);
    expect(p.pain.moments.length).toBeGreaterThanOrEqual(3);
    expect(p.pain.moments.length).toBeLessThanOrEqual(4);
    expect(p.example.steps).toHaveLength(3);
    expect(p.related.length).toBeGreaterThanOrEqual(1);
    expect(p.related.length).toBeLessThanOrEqual(3);
    expect(fs.existsSync(pub(p.heroImage))).toBe(true);
    expect(p.metaDescription.length).toBeLessThanOrEqual(170);
  });

  it("links only Ratgeber articles that exist", () => {
    const slugs = new Set(getAllArticles({ includeDrafts: true }).map((a) => a.slug));
    for (const p of leistungenPages) for (const r of p.related) expect(slugs.has(r), `${p.slug} → ${r}`).toBe(true);
  });

  it("proves KI-Automatisierung with 2–3 complete, recent, linked study figures", () => {
    const proof = getLeistungPage("ki-automatisierung")!.proof;
    expect(proof.kind).toBe("studies");
    if (proof.kind !== "studies") return;
    expect(proof.figures.length).toBeGreaterThanOrEqual(2);
    expect(proof.figures.length).toBeLessThanOrEqual(3);
    for (const f of proof.figures) {
      expect(f.figure.trim()).not.toBe("");
      expect(f.claim.trim()).not.toBe("");
      expect(f.source.trim()).not.toBe("");
      expect(f.year).toBeGreaterThanOrEqual(2024);
      expect(f.url).toMatch(/^https:\/\//);
    }
  });

  it("uses practice proof on Claude, Schulung and Beratung, without client names", () => {
    for (const s of ["claude", "ki-schulung", "ki-beratung"]) expect(getLeistungPage(s)!.proof.kind).toBe("practice");
    const all = leistungenPages.flatMap((p) => copyStrings(p)).join(" ");
    expect(all).not.toMatch(/\b(Velp|MDZ|Baude|Alen|Purisic)\b/);
  });

  it("splits the CTA: check on automation pages, Erstgespräch elsewhere", () => {
    const kinds = Object.fromEntries(leistungenPages.map((p) => [p.slug, p.cta.kind]));
    expect(kinds).toEqual({
      prozessautomatisierung: "check", "ki-automatisierung": "check", betreuung: "check",
      "ki-server": "kontakt", claude: "kontakt", "ki-schulung": "kontakt", "ki-beratung": "kontakt",
    });
    expect(new Set(leistungenPages.map((p) => p.cta.src)).size).toBe(7);
  });

  it("carries the Digitalbonus note only on KI-Beratung, as a possibility", () => {
    expect(leistungenPages.filter((p) => p.note).map((p) => p.slug)).toEqual(["ki-beratung"]);
    const note = getLeistungPage("ki-beratung")!.note!;
    expect(note.body).toContain("kann");
    expect(note.body).toContain("Antrag");
    expect(note.body).toContain("bevor");
    expect(note.body).not.toMatch(/€|%/);
    expect(note.link.href).toBe("https://www.digitalbonus.bayern/foerderprogramm/");
  });

  it("shows the audit card only on KI-Beratung", () => {
    expect(leistungenPages.filter((p) => p.auditCard).map((p) => p.slug)).toEqual(["ki-beratung"]);
  });

  it("points every video at a file that exists", () => {
    for (const p of leistungenPages) {
      if (!p.example.video) continue;
      expect(fs.existsSync(pub(p.example.video.src))).toBe(true);
      expect(fs.existsSync(pub(p.example.video.poster))).toBe(true);
    }
  });

  it("passes the site's German copy guards", () => {
    for (const p of leistungenPages)
      for (const s of copyStrings(p)) expect(findCopyIssues(s), `${p.slug}: ${s}`).toEqual([]);
  });

  it("names no price, no Frankfurt, no partner or certification claim", () => {
    for (const p of leistungenPages) {
      const text = nonStudyStrings(p).join(" ");
      expect(text, p.slug).not.toMatch(/€|\bEUR\b|\d\s*Euro\b/);
      expect(text, p.slug).not.toMatch(/Frankfurt/);
      // \bPartner\b, case-sensitive: „Ansprechpartner“ is fine, a partner claim is not.
      expect(text, p.slug).not.toMatch(/\bPartner\b|zertifiziert/);
    }
  });

  it("looks pages up by slug and builds their href", () => {
    expect(getLeistungPage("claude")?.title).toBe("Claude für Unternehmen");
    expect(getLeistungPage("gibt-es-nicht")).toBeUndefined();
    expect(leistungHref("ki-server")).toBe("/leistungen/ki-server");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/leistungenPages.test.ts`
Expected: FAIL — `Cannot find module './leistungenPages'`.

- [ ] **Step 3: Write `src/lib/leistungenPages.ts`**

Paste Task 1's TS block where marked. Copy is the approved draft; Task 11 reviews it.

```ts
// src/lib/leistungenPages.ts
//
// The seven Leistungen subpages (spec 2026-10-01). Every German string for
// /leistungen/<slug> lives here; the route and the block components hold none.
// One entry = one page: a new service is a new entry, never a new component.
// Rules for this copy: docs/superpowers/specs/2026-10-01-leistungen-hub-design.md §2, §4, §7.
import { CHECK_SRC, type CheckSrc } from "@/lib/prozessCheckCta";

export type LeistungSlug =
  | "prozessautomatisierung"
  | "ki-automatisierung"
  | "ki-server"
  | "claude"
  | "ki-schulung"
  | "ki-beratung"
  | "betreuung";

export type LeistungGroup = "automatisieren" | "befaehigen" | "betreiben";

export type StudyFigure = { figure: string; claim: string; source: string; year: number; url: string };

export type Proof = (
  | { kind: "studies"; heading: string; figures: StudyFigure[]; caseLine?: string }
  | { kind: "case"; heading: string; body: string }
  | { kind: "practice"; heading: string; body: string; points: { title: string; body: string }[] }
) & { objection: string };

export type LeistungPage = {
  slug: LeistungSlug;
  group: LeistungGroup;
  navLabel: string;
  title: string;
  /** One plain sentence that defines the service; shown as the hero lead. */
  subline: string;
  metaDescription: string;
  /** One sentence for the hub card. */
  kurz: string;
  heroImage: string;
  pain: { heading: string; moments: string[]; close: string };
  proof: Proof;
  example: {
    heading: string;
    before: string;
    steps: [string, string, string];
    after: string;
    video?: { src: string; poster: string; caption: string };
  };
  /** Renders the existing ProzessAudit card after the example (KI-Beratung only). */
  auditCard?: boolean;
  note?: { heading: string; body: string; link: { label: string; href: string } };
  cta: { kind: "check" | "kontakt"; src: CheckSrc; heading: string; lead: string };
  /** Ratgeber slugs for the „Mehr dazu“ line, 1 to 3. */
  related: string[];
};

export const leistungGroups: { id: LeistungGroup; label: string }[] = [
  { id: "automatisieren", label: "Automatisieren" },
  { id: "befaehigen", label: "Befähigen" },
  { id: "betreiben", label: "Betreiben" },
];

// ── Task 1 output: paste the verified TS block from Knowledge/marketing/ki-studien.md §3 here.
// export const kiStudien: StudyFigure[] = [ … ];

const PRACTICE_BODY =
  "Ich arbeite selbst jeden Tag mit Claude: für Code, Texte, Recherche und meine eigenen Automatisierungen. In meinen früheren Positionen und bei Kunden habe ich Claude eingeführt und in bestehende Abläufe eingebunden. Was du bekommst, habe ich selbst im Einsatz.";

export const leistungenPages: LeistungPage[] = [
  {
    slug: "prozessautomatisierung",
    group: "automatisieren",
    navLabel: "Prozessautomatisierung",
    title: "Prozessautomatisierung",
    subline:
      "Alles, was in deinem Betrieb jeden Tag gleich abläuft, baue ich so, dass es von allein läuft. Du machst die Arbeit, die dein Urteil braucht.",
    metaDescription:
      "Prozessautomatisierung für Betriebe und Unternehmen: Anfragen, Termine, Angebote, Rechnungen und Dateneingabe laufen von selbst. Maßgeschneidert und dokumentiert.",
    kurz: "Wiederkehrende Abläufe wie Anfragen, Termine, Rechnungen und Dateneingabe laufen von selbst.",
    heroImage: "/images/bg-steps.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Eine Anfrage kommt per E-Mail, jemand tippt sie ab und leitet sie weiter.",
        "Dieselben Kundendaten stehen in drei Programmen, und keins ist aktuell.",
        "Rechnungen gehen raus, aber das Nachfassen bleibt liegen.",
        "Aufgaben leben auf Zetteln und in Köpfen statt an einem Ort.",
      ],
      close: "Jeder Handgriff dauert nur Minuten. Zusammen sind es Stunden pro Woche, jede Woche.",
    },
    proof: {
      kind: "case",
      heading: "Aus der Praxis",
      body: "Eine Marketingagentur steuert ihre Projekte mit einer Prozess-Engine, die ich gebaut habe: Jede Projektphase legt ihre Aufgaben, Fristen und Zuständigkeiten selbst an. Niemand muss mehr nachhalten, welcher Schritt als Nächstes kommt.",
      objection:
        "Ersetzt das deine Leute? Nein. Es nimmt ihnen das Abtippen ab, damit sie Zeit für die Arbeit haben, für die du sie eingestellt hast.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Jede Anfrage wird von Hand abgetippt, weitergeleitet und nachverfolgt.",
      steps: [
        "Eine Anfrage kommt per Formular oder E-Mail rein.",
        "Das System legt den Kontakt an, bestätigt den Eingang und informiert den Zuständigen.",
        "Bleibt die Anfrage liegen, kommt nach zwei Tagen eine Erinnerung.",
      ],
      after: "Nachher: Keine Anfrage geht verloren, und niemand tippt etwas doppelt.",
    },
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungProzessautomatisierung,
      heading: "Welche Aufgabe kostet dich am meisten?",
      lead: "Der Prozess-Check zeigt dir in drei Minuten, wo deine Stunden hingehen und womit du anfängst.",
    },
    related: ["taeglich-stunden-zurueckgewinnen", "aus-jeder-anfrage-ein-termin", "durcheinander-oder-saubere-quelle"],
  },
  {
    slug: "ki-automatisierung",
    group: "automatisieren",
    navLabel: "KI-Automatisierung & Assistenten",
    title: "KI-Automatisierung & Assistenten",
    subline:
      "Wo Lesen, Sortieren und Antworten deinen Tag frisst, übernimmt die KI: Belege, E-Mails, Dokumente und ein Assistent, dem du per Sprachnachricht Aufgaben gibst.",
    metaDescription:
      "KI-Automatisierung und KI-Assistenten: Rechnungen und Dokumente auslesen, E-Mails vorsortieren, Aufgaben per Sprachnachricht erledigen. Auf Wunsch innerhalb der EU.",
    kurz: "Die KI liest Belege, sortiert E-Mails und erledigt als Assistent Aufgaben per Sprachnachricht.",
    heroImage: "/images/bg-lichtschacht.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Rechnungen kommen als PDF, und jemand überträgt Lieferant, Betrag und Datum von Hand.",
        "Das Postfach ist voll, und das Wichtige steckt irgendwo zwischen Newslettern.",
        "Unterwegs fällt dir eine Aufgabe ein, und abends weißt du nicht mehr, welche.",
        "Unterlagen von Kunden kommen unvollständig, und das Nachfragen dauert Tage.",
      ],
      close: "Das ist Arbeit, die Aufmerksamkeit braucht, aber kein Urteil. Genau die kann eine KI übernehmen.",
    },
    proof: {
      kind: "studies",
      heading: "Was die Zahlen sagen",
      figures: kiStudien,
      caseLine:
        "Aus der Praxis: Ein Hausmeisterservice gibt seinem Assistenten Aufgaben per Sprachnachricht, von Terminen über E-Mails bis zu Notizen. Der Assistent bereitet vor, der Inhaber gibt frei.",
      objection: "Die KI liest und sortiert, entscheiden tust du. Was sie vorbereitet, gibst du frei, bevor es rausgeht.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Jede Eingangsrechnung wird geöffnet, gelesen und von Hand übertragen.",
      steps: [
        "Die Rechnung kommt per E-Mail.",
        "Die KI liest Lieferant, Betrag, Datum und Rechnungsnummer aus.",
        "Die Daten liegen in deiner Buchhaltung, das PDF im richtigen Ordner.",
      ],
      after: "Nachher: Du schaust nur noch auf das, was die KI als unklar markiert hat.",
      // video: added in Task 6 once the clip is encoded and approved.
    },
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungKiAutomatisierung,
      heading: "Wo würde dir eine KI am meisten abnehmen?",
      lead: "Der Prozess-Check zeigt dir in drei Minuten, welche Aufgaben bei dir die meiste Zeit kosten. Danach reden wir, wenn du willst.",
    },
    related: ["was-ki-im-betrieb-wirklich-kann", "unterlagen-einsammeln-ohne-nachfassen", "claude-im-alltag-nutzen"],
  },
  {
    slug: "ki-server",
    group: "automatisieren",
    navLabel: "KI-Server",
    title: "KI-Server",
    subline:
      "KI für sensible Daten: auf einem Server, der dir gehört, mit einem KI-Modell, das innerhalb der EU rechnet.",
    metaDescription:
      "KI-Server für sensible Daten: eigener Server auf deinen Namen, KI-Modelle innerhalb der EU, kein Training mit deinen Daten. Eingerichtet und dokumentiert.",
    kurz: "KI für sensible Daten: auf einem Server, der dir gehört, mit Modellen innerhalb der EU.",
    heroImage: "/images/bg-karst-quelle.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Du würdest KI gern nutzen, aber Kundendaten gehören nicht in ein beliebiges Chatfenster.",
        "Niemand kann dir sagen, wo deine Daten verarbeitet werden.",
        "Deine Mitarbeiter nutzen längst private KI-Konten, und keiner weiß, was dort landet.",
        "Ein Dienstleister würde alles bei sich betreiben, und du wärst von ihm abhängig.",
      ],
      close: "Datenschutz ist kein Grund, auf KI zu verzichten. Er ist ein Grund, sie richtig aufzusetzen.",
    },
    proof: {
      kind: "case",
      heading: "So setze ich das auf",
      body: "Jeder KI-Server läuft in einem Konto auf deinen Namen: Du zahlst ihn direkt und besitzt die Daten vom ersten Tag an. Das KI-Modell rechnet innerhalb der EU, der Anbieter speichert deine Anfragen nicht und trainiert nicht damit. Das Betriebssystem aktualisiert sich selbst, die Software läuft auf geprüften Versionen.",
      objection:
        "Musst du den Server verstehen? Nein. Ich richte ihn ein, sichere ihn ab und dokumentiere alles. Endet unsere Zusammenarbeit, läuft er sicher weiter.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Sensible Dokumente werden von Hand geprüft, weil sie in keine fremde KI dürfen.",
      steps: [
        "Ein Kunde lädt seine Unterlagen über eine Seite hoch, die zu deinem Betrieb gehört.",
        "Die KI auf deinem Server prüft, ob alles vollständig und lesbar ist.",
        "Die Unterlagen liegen sortiert in deinem Ordner, Fehlendes wird beim Kunden nachgefragt.",
      ],
      after: "Nachher: Die KI arbeitet für dich, und die Daten bleiben bei dir und innerhalb der EU.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiServer,
      heading: "Lass uns über deine Daten reden.",
      lead: "Im Erstgespräch klären wir, welche Daten du verarbeiten willst und welcher Aufbau dafür passt.",
    },
    related: ["wo-laeuft-deine-ki", "selbst-bauen-oder-bauen-lassen"],
  },
  {
    slug: "claude",
    group: "befaehigen",
    navLabel: "Claude für Unternehmen",
    title: "Claude für Unternehmen",
    subline:
      "Claude ist der KI-Assistent von Anthropic. Ich richte ihn für dein Team ein: mit euren Vorlagen, eurem Wissen und klaren Regeln für eure Daten.",
    metaDescription:
      "Claude für Unternehmen einrichten: Team-Zugang, Projekte mit eurem Firmenwissen, eigene Vorlagen, Anbindung an eure Werkzeuge und klare Regeln für eure Daten.",
    kurz: "Claude für dein Team eingerichtet, mit euren Vorlagen, eurem Wissen und klaren Datenregeln.",
    heroImage: "/images/bg-abendwellen.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Jeder im Team nutzt KI anders, und keiner weiß, was die anderen tun.",
        "Claude gibt allgemeine Antworten, weil er nichts über euren Betrieb weiß.",
        "Dieselben Texte, Angebote und Zusammenfassungen werden jeden Tag neu erklärt.",
        "Niemand hat festgelegt, welche Daten in die KI dürfen und welche nicht.",
      ],
      close: "Das Werkzeug ist da. Was fehlt, ist die Einrichtung, die es zu eurem macht.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: PRACTICE_BODY,
      points: [
        { title: "Selbst im Einsatz.", body: "Mein eigener Betrieb läuft mit Claude: Texte, Recherche, Code und die Automatisierungen, die ich für Kunden baue." },
        { title: "Ein Ansprechpartner.", body: "Du redest mit dem, der einrichtet. Kein Team, keine Tickets." },
        { title: "Ehrlich, wenn es nicht passt.", body: "Passt ChatGPT oder ein anderes Werkzeug besser zu euch, sage ich dir das." },
      ],
      objection:
        "Muss dein Team dafür Technik lernen? Nein. Es arbeitet mit Claude wie mit einem Kollegen, die Einrichtung bleibt meine Aufgabe.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Jeder schreibt seine Angebote selbst und fängt jedes Mal bei null an.",
      steps: [
        "Ich lege ein Claude-Projekt mit euren Leistungen, Preisen und Musterangeboten an.",
        "Dein Mitarbeiter beschreibt in zwei Sätzen, was der Kunde braucht.",
        "Claude schreibt den Entwurf in eurem Ton, dein Mitarbeiter prüft und schickt ihn ab.",
      ],
      after: "Nachher: Jeder fängt bei einem guten Entwurf an statt bei einer leeren Seite.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungClaude,
      heading: "Lass uns Claude bei euch einrichten.",
      lead: "Im Erstgespräch schauen wir, wofür ihr Claude nutzen wollt und was dafür eingerichtet werden muss.",
    },
    related: ["claude-im-alltag-nutzen", "was-ki-im-betrieb-wirklich-kann"],
  },
  {
    slug: "ki-schulung",
    group: "befaehigen",
    navLabel: "KI-Schulung",
    title: "KI-Schulung",
    subline:
      "Dein Team lernt, Claude und einfache Automatisierungen im Arbeitsalltag sicher zu nutzen. An euren eigenen Aufgaben, nicht an Beispielen aus dem Lehrbuch.",
    metaDescription:
      "KI-Schulung für Teams: Claude im Arbeitsalltag nutzen, eigene Vorlagen bauen, wiederkehrende Aufgaben automatisieren. Praxisnah an euren eigenen Abläufen.",
    kurz: "Dein Team lernt Claude und erste Automatisierungen an euren eigenen Aufgaben.",
    heroImage: "/images/fliessen.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Die Hälfte des Teams probiert KI aus, die andere Hälfte traut sich nicht.",
        "Wer es nutzt, tippt eine Frage ein und ist von der allgemeinen Antwort enttäuscht.",
        "Niemand weiß, welche Daten in die KI dürfen.",
        "Online-Kurse erklären Werkzeuge, aber nicht eure Arbeit.",
      ],
      close: "KI bringt erst etwas, wenn dein Team weiß, wie sie zu den eigenen Aufgaben passt.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: PRACTICE_BODY,
      points: [
        { title: "An euren Aufgaben.", body: "Wir arbeiten mit euren echten Texten, Abläufen und Dokumenten. Was dein Team lernt, nutzt es am nächsten Tag." },
        { title: "Claude und Automatisierung.", body: "Kein Rundumschlag über alle Werkzeuge: Claude im Alltag und der Schritt zur ersten eigenen Automatisierung." },
        { title: "Format nach Absprache.", body: "Vor Ort oder online, für ein kleines Team oder eine Abteilung. Wir legen es im Gespräch fest." },
      ],
      objection:
        "Ersetzt KI deine Leute? Nein. Sie nimmt ihnen das Immergleiche ab, und dein Team entscheidet, wofür es die Zeit nutzt.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Jeder fasst Kundengespräche von Hand zusammen und schreibt die Nachfass-Mail selbst.",
      steps: [
        "Wir nehmen eine echte Aufgabe aus eurem Alltag.",
        "Dein Team baut sich dafür eine Vorlage in Claude, mit euren Regeln und eurem Ton.",
        "Ab dem nächsten Tag nutzt jeder diese Vorlage, und ihr seht, welche Aufgabe als Nächstes dran ist.",
      ],
      after: "Nachher: Dein Team geht mit Werkzeugen aus der Schulung, die es selbst gebaut hat.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiSchulung,
      heading: "Lass uns eure Schulung planen.",
      lead: "Im Erstgespräch klären wir, wer teilnimmt, welche Aufgaben ihr mitbringt und welches Format passt.",
    },
    related: ["claude-im-alltag-nutzen", "was-ki-im-betrieb-wirklich-kann"],
  },
  {
    slug: "ki-beratung",
    group: "befaehigen",
    navLabel: "KI-Beratung",
    title: "KI-Beratung",
    subline:
      "Du musst nicht wissen, was mit KI möglich ist. Das ist mein Job. Du weißt, was dich jeden Tag Zeit kostet, und das reicht für den Anfang.",
    metaDescription:
      "KI-Beratung für Unternehmen: Im kostenlosen Erstgespräch und Prozess-Audit finden wir heraus, wo KI und Automatisierung sich bei dir lohnen. Mit Fahrplan, wenn es passt.",
    kurz: "Kostenloses Erstgespräch und Prozess-Audit: wo sich KI bei dir lohnt, mit Fahrplan.",
    heroImage: "/images/bg-horizont.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Überall heißt es, man müsse jetzt KI einsetzen, aber nicht, wo.",
        "Du hast ein paar Werkzeuge ausprobiert, und nichts ist geblieben.",
        "Angebote von Agenturen klingen groß, teuer und schwer zu prüfen.",
        "Du weißt nicht, ob sich das für einen Betrieb deiner Größe überhaupt rechnet.",
      ],
      close: "Die Frage ist nicht, ob KI etwas kann. Die Frage ist, wo sie bei dir etwas bringt.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: "Ich arbeite selbst jeden Tag mit KI und baue die Automatisierungen, die ich empfehle. In meinen früheren Positionen und bei Kunden habe ich KI eingeführt und in bestehende Abläufe eingebunden. Ich empfehle dir nur, was ich selbst bauen und betreiben würde.",
      points: [
        { title: "Ehrlich, wenn es sich nicht rechnet.", body: "Lohnt sich eine Automatisierung bei dir nicht, sage ich dir das. Auch wenn das heißt, dass ich nichts baue." },
        { title: "Erst schauen, was du schon hast.", body: "Viele Programme können mehr, als genutzt wird. Bevor ich etwas baue, prüfe ich, ob dein Werkzeug es schon kann." },
        { title: "Der Fahrplan gehört dir.", body: "Du kannst ihn selbst umsetzen, umsetzen lassen oder mit mir bauen." },
      ],
      objection:
        "Musst du dich mit KI auskennen? Nein. Du erzählst mir, was dich Zeit kostet. Welche Technik dazu passt, ist mein Teil.",
    },
    example: {
      heading: "So läuft die Beratung",
      before: "Vorher: Viele Ideen, kein klarer erster Schritt.",
      steps: [
        "Im kostenlosen Erstgespräch erzählst du mir, was dich jeden Tag Zeit kostet.",
        "Lohnt es sich, schaue ich mir im Prozess-Audit deine Abläufe genauer an.",
        "Ein bis zwei Werktage später bekommst du einen Fahrplan: was sich automatisieren lässt, was es bringt und in welcher Reihenfolge.",
      ],
      after: "Nachher: Du weißt, womit du anfängst, und entscheidest selbst, ob und mit wem du es umsetzt.",
    },
    auditCard: true,
    note: {
      heading: "Förderung",
      body: "Sitzt dein Betrieb in Bayern und hat weniger als 50 Mitarbeiter, kann der Digitalbonus Bayern einen Teil der Kosten übernehmen, oft bis zur Hälfte. Wichtig: Der Antrag muss gestellt sein, bevor du jemanden beauftragst. Ob er bei dir passt, klären wir im Gespräch.",
      link: { label: "Zum Förderprogramm", href: "https://www.digitalbonus.bayern/foerderprogramm/" },
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiBeratung,
      heading: "Lass uns herausfinden, wo es sich lohnt.",
      lead: "Das Erstgespräch dauert 30 Minuten und kostet nichts. Danach weißt du, ob sich ein genauerer Blick lohnt.",
    },
    related: ["selbst-bauen-oder-bauen-lassen", "durcheinander-oder-saubere-quelle"],
  },
  {
    slug: "betreuung",
    group: "betreiben",
    navLabel: "Betreuung & Wartung",
    title: "Betreuung & Wartung",
    subline:
      "Ein System, das läuft, soll auch morgen noch laufen. Ich überwache deine Automatisierungen, behebe Fehler und passe sie an, wenn sich dein Betrieb verändert.",
    metaDescription:
      "Betreuung und Wartung für Automatisierungen und KI-Systeme: Überwachung mit Alarm, Fehlerbehebung, kleine Änderungen. Monatlich kündbar, für Systeme, die ich gebaut habe.",
    kurz: "Überwachung mit echtem Alarm, Fehlerbehebung und kleine Änderungen, monatlich kündbar.",
    heroImage: "/images/bg-werkzeuge.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Eine Automatisierung bricht still ab, und es fällt erst Wochen später auf.",
        "Ein Programm ändert seine Schnittstelle, und niemand passt die Verbindung an.",
        "Du willst eine Kleinigkeit ändern, aber wer es gebaut hat, ist nicht mehr erreichbar.",
        "Der Server läuft, aber niemand weiß, ob er sicher ist.",
      ],
      close: "Automatisierung spart nur Zeit, solange sie läuft. Und dass sie läuft, muss jemand prüfen.",
    },
    proof: {
      kind: "case",
      heading: "So betreue ich",
      body: "Jedes System, das ich betreue, meldet sich, wenn etwas schiefgeht: Der Alarm kommt bei mir an, bevor es dir auffällt. Ich teste, dass dieser Alarm wirklich ankommt, nicht nur, dass Daten fließen. Fehler behebe ich, kleine Änderungen sind enthalten, und einmal im Monat siehst du in einer Zeile, was dein System erledigt hat.",
      objection:
        "Bindest du dich damit? Nein. Die Betreuung ist monatlich kündbar. Ohne sie läuft dein System sicher weiter, nur ohne Anpassungen.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Ein Fehler fällt auf, wenn sich ein Kunde beschwert.",
      steps: [
        "Eine Verbindung zu einem Programm bricht nachts ab.",
        "Der Alarm kommt bei mir an, und ich sehe, welcher Schritt fehlgeschlagen ist.",
        "Ich behebe den Fehler und lasse die liegengebliebenen Vorgänge nachlaufen.",
      ],
      after: "Nachher: Du erfährst davon im Monatsbericht, nicht von deinem Kunden.",
    },
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungBetreuung,
      heading: "Erst bauen, dann betreuen.",
      lead: "Betreuung gibt es für Systeme, die ich gebaut habe. Der Prozess-Check zeigt dir, womit du anfängst.",
    },
    related: ["wo-laeuft-deine-ki", "selbst-bauen-oder-bauen-lassen"],
  },
];

export function getLeistungPage(slug: string): LeistungPage | undefined {
  return leistungenPages.find((p) => p.slug === slug);
}

export function leistungHref(slug: LeistungSlug): string {
  return `/leistungen/${slug}`;
}
```

Note: `kiStudien` must be declared **above** `leistungenPages` (paste location marked). Uncomment the `export const kiStudien …` line by replacing it with the pasted block.

- [ ] **Step 4: Run the test, then the byte check**

Run: `npx vitest run src/lib/leistungenPages.test.ts`
Expected: PASS.

Byte check (no downgraded quotes, no dashes; every non-ASCII as `\x{…}`):

```bash
perl -CSD -ne 'print "$.: dash\n" if /[\x{2013}\x{2014}]/; print "$.: bad-quote\n" if /\x{201D}/' src/lib/leistungenPages.ts
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/lib/leistungenPages.ts src/lib/leistungenPages.test.ts
git commit -m "feat(leistungen): page data for the seven KI/automation subpages

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: The block components

**Files:**
- Create: `src/components/leistungen/page/PainBlock.tsx`, `ProofBlock.tsx`, `ExampleBlock.tsx`, `NoteBlock.tsx`, `RelatedLinks.tsx`
- Test: `src/components/leistungen/page/blocks.test.tsx`

**Interfaces:**
- Consumes: `LeistungPage`, `Proof` (Task 3); `Section`, `SectionBackdrop`, `Reveal`, `LazyVideo`.
- Produces: `PainBlock({ pain })`, `ProofBlock({ proof })`, `ExampleBlock({ example })`, `NoteBlock({ note })`, `RelatedLinks({ articles }: { articles: { slug: string; title: string }[] })`.

- [ ] **Step 1: Write the failing test** — `src/components/leistungen/page/blocks.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PainBlock } from "./PainBlock";
import { ProofBlock } from "./ProofBlock";
import { ExampleBlock } from "./ExampleBlock";
import { NoteBlock } from "./NoteBlock";
import { RelatedLinks } from "./RelatedLinks";
import { getLeistungPage } from "@/lib/leistungenPages";

const page = (s: string) => getLeistungPage(s)!;

describe("PainBlock", () => {
  it("lists every moment under its heading and closes with the hours line", () => {
    const p = page("prozessautomatisierung");
    render(<PainBlock pain={p.pain} />);
    expect(screen.getByRole("heading", { level: 2, name: p.pain.heading })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(p.pain.moments.length);
    expect(screen.getByText(p.pain.close)).toBeInTheDocument();
  });
});

describe("ProofBlock", () => {
  it("shows each study figure with a linked source and year, opening in a new tab", () => {
    const proof = page("ki-automatisierung").proof;
    if (proof.kind !== "studies") throw new Error("expected studies");
    render(<ProofBlock proof={proof} />);
    for (const f of proof.figures) {
      expect(screen.getByText(f.figure)).toBeInTheDocument();
      const link = screen.getByRole("link", { name: new RegExp(`${f.source}, ${f.year}`) });
      expect(link).toHaveAttribute("href", f.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByText(proof.objection)).toBeInTheDocument();
  });

  it("renders a case body", () => {
    const proof = page("ki-server").proof;
    if (proof.kind !== "case") throw new Error("expected case");
    render(<ProofBlock proof={proof} />);
    expect(screen.getByText(proof.body)).toBeInTheDocument();
    expect(screen.getByText(proof.objection)).toBeInTheDocument();
  });

  it("renders practice points as titled cards", () => {
    const proof = page("claude").proof;
    if (proof.kind !== "practice") throw new Error("expected practice");
    render(<ProofBlock proof={proof} />);
    for (const pt of proof.points) expect(screen.getByRole("heading", { level: 3, name: pt.title })).toBeInTheDocument();
  });
});

describe("ExampleBlock", () => {
  it("shows before, three numbered steps and after", () => {
    const ex = page("ki-beratung").example;
    render(<ExampleBlock example={ex} />);
    expect(screen.getByText(ex.before)).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(list.tagName).toBe("OL");
    expect(screen.getByText(ex.after)).toBeInTheDocument();
  });

  it("renders an optional clip with its caption", () => {
    const ex = { ...page("ki-automatisierung").example, video: { src: "/video/x.mp4", poster: "/video/x.webp", caption: "Ein echter Lauf." } };
    const { container } = render(<ExampleBlock example={ex} />);
    expect(screen.getByText("Ein echter Lauf.")).toBeInTheDocument();
    expect(container.querySelector("video, img[src='/video/x.webp']")).not.toBeNull();
  });
});

describe("NoteBlock", () => {
  it("renders the note with an external link", () => {
    const note = page("ki-beratung").note!;
    render(<NoteBlock note={note} />);
    expect(screen.getByRole("complementary", { name: note.heading })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(note.link.label) })).toHaveAttribute("href", note.link.href);
  });
});

describe("RelatedLinks", () => {
  it("links each article and renders nothing when empty", () => {
    const { container, rerender } = render(<RelatedLinks articles={[{ slug: "a", title: "Artikel A" }]} />);
    expect(screen.getByRole("link", { name: "Artikel A" })).toHaveAttribute("href", "/ratgeber/a");
    rerender(<RelatedLinks articles={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/leistungen/page/blocks.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the five components**

`src/components/leistungen/page/PainBlock.tsx`:

```tsx
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import type { LeistungPage } from "@/lib/leistungenPages";

// „Kennst du das?“: the homepage Problem pattern (deep band, contained list
// panel, centered spine), reused on every Leistungen subpage.
export function PainBlock({ pain }: { pain: LeistungPage["pain"] }) {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-problem.webp" tintRgb="10 37 56" tintOpacity={0.6} />
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {pain.heading}
        </Reveal>
        <Reveal as="div" delayMs={120} className="card-depth mx-auto mt-8 max-w-xl rounded-2xl border border-gletscher/25 bg-gletscher/10 p-8 text-left">
          <ul className="flex flex-col gap-3 text-lg text-gletscher">
            {pain.moments.map((m) => (
              <li key={m} className="flex items-start gap-3">
                <span aria-hidden className="flex h-[1lh] shrink-0 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal as="p" delayMs={200} className="mt-7 text-pretty text-lg text-gletscher">
          {pain.close}
        </Reveal>
      </div>
    </Section>
  );
}
```

`src/components/leistungen/page/ProofBlock.tsx`:

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { Proof } from "@/lib/leistungenPages";

// The proof block takes one of three shapes (spec §4): verified study figures,
// one anonymous case, or own practice. Every shape ends on the page's one
// objection line, answered before the CTA (Hormozi: kill the zombies first).
export function ProofBlock({ proof }: { proof: Proof }) {
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-4xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {proof.heading}
        </Reveal>

        {proof.kind === "studies" ? (
          <>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proof.figures.map((f) => (
                <li key={`${f.url}-${f.figure}`} className="card-depth flex flex-col rounded-2xl border border-faden bg-papier p-6">
                  <p className="font-serif text-4xl text-vrelo-petrol">{f.figure}</p>
                  <p className="mt-3 flex-1 text-tinte">{f.claim}</p>
                  <p className="mt-4 text-sm text-stumm">
                    Quelle:{" "}
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm underline underline-offset-4 hover:text-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
                    >
                      {f.source}, {f.year}
                      <span className="sr-only"> (öffnet in neuem Tab)</span>
                    </a>
                  </p>
                </li>
              ))}
            </ul>
            {proof.caseLine ? <p className="mt-8 max-w-3xl text-pretty text-lg text-tinte">{proof.caseLine}</p> : null}
          </>
        ) : null}

        {proof.kind === "case" ? <p className="mt-6 max-w-3xl text-pretty text-lg text-tinte">{proof.body}</p> : null}

        {proof.kind === "practice" ? (
          <>
            <p className="mt-6 max-w-3xl text-pretty text-lg text-tinte">{proof.body}</p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {proof.points.map((pt) => (
                <li key={pt.title} className="card-depth rounded-2xl border border-faden bg-papier p-6">
                  <h3 className="text-lg font-semibold text-tiefes-wasser">{pt.title}</h3>
                  <p className="mt-2 text-tinte">{pt.body}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="mt-10 max-w-3xl border-l-4 border-amber pl-5 text-pretty text-lg font-medium text-tiefes-wasser">
          {proof.objection}
        </p>
      </div>
    </Section>
  );
}
```

`src/components/leistungen/page/ExampleBlock.tsx`:

```tsx
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { LazyVideo } from "@/components/LazyVideo";
import type { LeistungPage } from "@/lib/leistungenPages";

// The comprehension core: one concrete run, before → three steps → after.
// Nobody understands „Prozessautomatisierung“, everyone understands three
// steps. An optional real clip sits above the steps (credibility in action).
export function ExampleBlock({ example }: { example: LeistungPage["example"] }) {
  return (
    <Section tone="petrol" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-bausteine-b.webp" tintRgb="27 80 99" tintOpacity={0.7} />
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {example.heading}
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 max-w-2xl text-pretty text-lg text-gletscher">
          {example.before}
        </Reveal>

        {example.video ? (
          <Reveal as="figure" delayMs={120} className="mx-auto mt-10 max-w-sm">
            <LazyVideo
              mp4={example.video.src}
              poster={example.video.poster}
              className="w-full rounded-2xl shadow-deepwater"
            />
            <figcaption className="mt-3 text-center text-sm text-gletscher">{example.video.caption}</figcaption>
          </Reveal>
        ) : null}

        <Reveal as="ol" delayMs={160} className="mt-10 grid gap-5 md:grid-cols-3">
          {example.steps.map((s, i) => (
            <li key={s} className="card-depth rounded-2xl bg-papier p-6 text-tinte">
              <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber font-semibold text-tiefes-wasser">
                {i + 1}
              </span>
              <p className="mt-3">{s}</p>
            </li>
          ))}
        </Reveal>

        <Reveal as="p" delayMs={240} className="mt-8 max-w-2xl text-pretty text-lg font-medium text-papier">
          {example.after}
        </Reveal>
      </div>
    </Section>
  );
}
```

`src/components/leistungen/page/NoteBlock.tsx`:

```tsx
import { Section } from "@/components/Section";
import type { LeistungPage } from "@/lib/leistungenPages";

// A small hint above the CTA (KI-Beratung: Digitalbonus Bayern). Worded as a
// possibility in the data; this block only frames it.
export function NoteBlock({ note }: { note: NonNullable<LeistungPage["note"]> }) {
  return (
    <Section tone="paper" className="-mt-12 md:-mt-16">
      <aside aria-label={note.heading} className="card-depth mx-auto max-w-3xl rounded-2xl bg-sonnenlicht p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-tiefes-wasser">{note.heading}</p>
        <p className="mt-3 text-pretty text-tinte">{note.body}</p>
        <a
          href={note.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-sm font-medium text-[#6f4a20] underline underline-offset-4 hover:text-[#4d3216] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sonnenlicht"
        >
          {note.link.label}
          <span className="sr-only"> (öffnet in neuem Tab)</span>
        </a>
      </aside>
    </Section>
  );
}
```

`src/components/leistungen/page/RelatedLinks.tsx`:

```tsx
import Link from "next/link";

// The „Mehr dazu“ line under a subpage's close: the Ratgeber as the knowledge
// layer behind each service. The caller filters drafts; empty renders nothing.
export function RelatedLinks({ articles }: { articles: { slug: string; title: string }[] }) {
  if (articles.length === 0) return null;
  return (
    <div className="bg-papier">
      <div className="mx-auto max-w-6xl px-6 py-10 text-tinte">
        <p className="text-sm font-semibold uppercase tracking-wider text-stumm">Mehr dazu im Ratgeber</p>
        <ul className="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-x-8">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/ratgeber/${a.slug}`}
                className="rounded-sm font-medium text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
              >
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/leistungen/page/blocks.test.tsx`
Expected: PASS. (If the `complementary` role query fails because jsdom does not expose a labelled `<aside>` inside a `<section>` as a landmark, change the query to `screen.getByLabelText(note.heading)` — the label is the contract.)

- [ ] **Step 5: Commit**

```bash
git add src/components/leistungen/page
git commit -m "feat(leistungen): Pain, Proof, Example, Note and Related blocks

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The subpage route, JSON-LD, sitemap, H1 hyphenation

**Files:**
- Create: `src/app/leistungen/[slug]/page.tsx`
- Modify: `src/lib/jsonld.ts` (add `serviceLd`), `src/app/sitemap.ts`, `src/components/PageHero.tsx` (H1 class)
- Test: `src/app/leistungen/[slug]/page.test.tsx` (new), `src/lib/jsonld.test.ts`, `src/app/sitemap.test.ts`, `src/components/PageHero.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 3–4; `ProzessAudit` (`src/components/leistungen/ProzessAudit.tsx`); `getArticleBySlug`, `draftsVisible` from `src/lib/ratgeber.ts`.
- Produces: route `/leistungen/<slug>`; exported `relatedArticles(slugs: string[], showDrafts: boolean): { slug: string; title: string }[]`; `serviceLd(page: { slug: string; title: string; metaDescription: string })`.

- [ ] **Step 1: Write the failing tests**

`src/app/leistungen/[slug]/page.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeistungSubpage, { generateStaticParams, generateMetadata, relatedArticles } from "./page";
import { leistungenPages } from "@/lib/leistungenPages";
import { getAllArticles } from "@/lib/ratgeber";
import { canonical } from "@/lib/site";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("/leistungen/[slug]", () => {
  it("pre-renders exactly the seven pages", () => {
    expect(generateStaticParams()).toEqual(leistungenPages.map((p) => ({ slug: p.slug })));
  });

  it("sets title, description and canonical per page", async () => {
    const meta = await generateMetadata(params("ki-server"));
    expect(meta.title).toBe("KI-Server");
    expect(meta.alternates?.canonical).toBe(canonical("/leistungen/ki-server"));
  });

  it("renders the five blocks in order", async () => {
    const { container } = render(await LeistungSubpage(params("prozessautomatisierung")));
    expect(screen.getByRole("heading", { level: 1, name: "Prozessautomatisierung" })).toBeInTheDocument();
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual(["Kennst du das?", "Aus der Praxis", "So sieht das aus", "Welche Aufgabe kostet dich am meisten?"]);
  });

  it("shows the audit card and the Förderung note only on KI-Beratung, with the Erstgespräch first", async () => {
    render(await LeistungSubpage(params("ki-beratung")));
    expect(document.getElementById("prozess-audit")).not.toBeNull();
    expect(screen.getByLabelText("Förderung")).toBeInTheDocument();
    // The audit card carries its own quiet „Erstgespräch buchen“ (→ /kontakt), so
    // look for the close's attributed link among all of them.
    const hrefs = screen.getAllByRole("link", { name: "Erstgespräch buchen" }).map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/kontakt?src=leistung-ki-beratung");
  });

  it("404s an unknown slug", async () => {
    await expect(LeistungSubpage(params("gibt-es-nicht"))).rejects.toThrow();
  });

  it("hides draft Ratgeber articles unless drafts are visible", () => {
    const draft = getAllArticles({ includeDrafts: true }).find((a) => a.draft);
    const live = getAllArticles({ includeDrafts: false })[0];
    const slugs = [live.slug, ...(draft ? [draft.slug] : []), "gibt-es-nicht"];
    expect(relatedArticles(slugs, false)).toEqual([{ slug: live.slug, title: live.title }]);
    if (draft) expect(relatedArticles(slugs, true).map((a) => a.slug)).toContain(draft.slug);
  });
});
```

Append to `src/lib/jsonld.test.ts`:

```ts
import { serviceLd } from "./jsonld";

describe("serviceLd", () => {
  it("describes a Leistungen subpage as a Service provided by Vrelo", () => {
    const ld = serviceLd({ slug: "ki-server", title: "KI-Server", metaDescription: "Beschreibung." });
    expect(ld["@type"]).toBe("Service");
    expect(ld.name).toBe("KI-Server");
    expect(ld.url).toMatch(/\/leistungen\/ki-server$/);
    expect(ld.provider["@type"]).toBe("ProfessionalService");
  });
});
```

Append inside the `describe("sitemap")` block of `src/app/sitemap.test.ts`:

```ts
  it("lists all seven Leistungen subpages", () => {
    const urls = sitemap().map((e) => e.url);
    for (const p of leistungenPages) expect(urls).toContain(`${siteUrl}/leistungen/${p.slug}`);
  });
```

(add `import { leistungenPages } from "@/lib/leistungenPages";` at the top).

Append to `src/components/PageHero.test.tsx`:

```tsx
  it("lets long German compounds hyphenate instead of overflowing on phones", () => {
    render(<PageHero title="Prozessautomatisierung" src="/images/bg-steps.webp" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("hyphens-auto", "break-words");
  });
```

(if that file imports `render`/`screen` under different names, follow its existing imports).

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run "src/app/leistungen" src/lib/jsonld.test.ts src/app/sitemap.test.ts src/components/PageHero.test.tsx`
Expected: FAIL (route module missing, `serviceLd` missing, sitemap lacks routes, H1 lacks classes).

- [ ] **Step 3: Implement**

Add to `src/lib/jsonld.ts`:

```ts
export function serviceLd(page: { slug: string; title: string; metaDescription: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    serviceType: page.title,
    description: page.metaDescription,
    url: `${siteUrl}/leistungen/${page.slug}`,
    areaServed: ["DE", "AT", "CH"],
    provider: { "@type": "ProfessionalService", name: siteName, url: siteUrl },
  };
}
```

In `src/app/sitemap.ts`: `import { leistungenPages } from "@/lib/leistungenPages";` and add `...leistungenPages.map((p) => `/leistungen/${p.slug}`),` to the static route array right after `"/leistungen",`.

In `src/components/PageHero.tsx`, the H1 className gains `hyphens-auto break-words`:

```tsx
        <h1 className="max-w-4xl text-balance hyphens-auto break-words text-4xl font-semibold text-papier [text-shadow:0_2px_16px_rgb(10_37_56_/_0.45)] md:text-5xl">
```

Create `src/app/leistungen/[slug]/page.tsx`:

```tsx
// src/app/leistungen/[slug]/page.tsx
//
// One template, seven services (spec 2026-10-01 §4): Hero → Pain → Proof →
// Example → (audit card / note) → CTA → „Mehr dazu“. All copy comes from
// src/lib/leistungenPages.ts.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { ProzessAudit } from "@/components/leistungen/ProzessAudit";
import { PainBlock } from "@/components/leistungen/page/PainBlock";
import { ProofBlock } from "@/components/leistungen/page/ProofBlock";
import { ExampleBlock } from "@/components/leistungen/page/ExampleBlock";
import { NoteBlock } from "@/components/leistungen/page/NoteBlock";
import { RelatedLinks } from "@/components/leistungen/page/RelatedLinks";
import { leistungenPages, getLeistungPage } from "@/lib/leistungenPages";
import { getArticleBySlug, draftsVisible } from "@/lib/ratgeber";
import { breadcrumbLd, serviceLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return leistungenPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = getLeistungPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: canonical(`/leistungen/${page.slug}`) },
    openGraph: { title: page.title, description: page.metaDescription },
  };
}

/** Ratgeber links for the „Mehr dazu“ line: unknown slugs and hidden drafts drop out. */
export function relatedArticles(slugs: string[], showDrafts: boolean): { slug: string; title: string }[] {
  return slugs.flatMap((s) => {
    try {
      const a = getArticleBySlug(s);
      return a.draft && !showDrafts ? [] : [{ slug: a.slug, title: a.title }];
    } catch {
      return [];
    }
  });
}

export default async function LeistungSubpage({ params }: Params) {
  const { slug } = await params;
  const page = getLeistungPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero title={page.title} lead={page.subline} src={page.heroImage} />
      <PainBlock pain={page.pain} />
      <ProofBlock proof={page.proof} />
      <ExampleBlock example={page.example} />
      {page.auditCard ? (
        <Section id="prozess-audit" tone="paper" className="scroll-mt-24">
          <Reveal>
            <ProzessAudit />
          </Reveal>
        </Section>
      ) : null}
      {page.note ? <NoteBlock note={page.note} /> : null}
      <ClosingCta heading={page.cta.heading} lead={page.cta.lead} src={page.cta.src} primary={page.cta.kind} />
      <RelatedLinks articles={relatedArticles(page.related, draftsVisible())} />
      <JsonLd data={serviceLd(page)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
          { name: page.title, path: `/leistungen/${page.slug}` },
        ])}
      />
    </>
  );
}
```

Before running: open `node_modules/next/dist/docs/` and confirm `dynamicParams`, `generateStaticParams` and async `params` are still the App Router API in this Next version (AGENTS.md rule). Adjust only if the docs say otherwise.

- [ ] **Step 4: Run to verify they pass, then the suite**

Run: `npx vitest run "src/app/leistungen" src/lib/jsonld.test.ts src/app/sitemap.test.ts src/components/PageHero.test.tsx`
Expected: PASS. The `h2s` assertion in the route test must list exactly the four H2s; if `ProzessAudit` or `ClosingCta` add an H2 on other pages, that is fine (the test uses prozessautomatisierung, which has neither audit card nor note).
Run: `npm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/app/leistungen/[slug]" src/lib/jsonld.ts src/lib/jsonld.test.ts src/app/sitemap.ts src/app/sitemap.test.ts src/components/PageHero.tsx src/components/PageHero.test.tsx
git commit -m "feat(leistungen): /leistungen/[slug] route with Service JSON-LD and sitemap entries

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: The real clip on KI-Automatisierung & Assistenten

**Files:**
- Create: `public/video/ki-assistent.mp4`, `public/video/ki-assistent.webp`
- Modify: `src/lib/leistungenPages.ts` (the `ki-automatisierung` example)

**Interfaces:**
- Consumes: `example.video` field (Task 3), rendered by `ExampleBlock` (Task 4). The data test from Task 3 already asserts the files exist.

- [ ] **Step 1: Encode the clip and poster** (source: `C:\Users\ajdin\OneDrive\Pictures\Camera Roll\edit\mdz-assistent-linkedin.mp4`; ffmpeg is on PATH):

```bash
SRC="/c/Users/ajdin/OneDrive/Pictures/Camera Roll/edit/mdz-assistent-linkedin.mp4"
ffmpeg -y -i "$SRC" -vf "scale=-2:720" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart public/video/ki-assistent.mp4
ffmpeg -y -ss 2 -i "$SRC" -frames:v 1 -vf "scale=-2:720" public/video/ki-assistent.webp
ls -la public/video/ki-assistent.*
```

Expected: mp4 under ~4 MB, webp exists. If the mp4 is larger, raise `-crf` to 28.

- [ ] **Step 2: Gate — Ajdin watches it.** Ask Ajdin to open `public/video/ki-assistent.mp4` and confirm: no MDZ name, no customer name, address, phone number or other personal data visible in any frame. **Stop here until he says yes.** If he says no, skip Steps 3–4 and delete the two files; the page ships with the three steps only.

- [ ] **Step 3: Wire it into the data** — in the `ki-automatisierung` example, replace the `// video: …` comment with:

```ts
      video: {
        src: "/video/ki-assistent.mp4",
        poster: "/video/ki-assistent.webp",
        caption: "Ein echter Lauf mit Testdaten: Der Assistent bekommt eine Sprachnachricht und erledigt die Aufgabe.",
      },
```

(If the clip shows real, non-test data that Ajdin has cleared, drop „mit Testdaten“.)

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/leistungenPages.test.ts src/components/leistungen/page/blocks.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/video/ki-assistent.mp4 public/video/ki-assistent.webp src/lib/leistungenPages.ts
git commit -m "feat(leistungen): real assistant clip on KI-Automatisierung

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: The hub — `/leistungen`

**Files:**
- Create: `src/components/leistungen/ServiceGroups.tsx`, `src/components/leistungen/ServiceGroups.test.tsx`
- Modify: `src/app/leistungen/page.tsx`, `src/lib/leistungen-weg.ts`
- Delete: `src/components/leistungen/LeistungCard.tsx`, `src/components/leistungen/MehrMoeglich.tsx`, `src/lib/leistungen.ts`, `src/lib/leistungen.test.ts`
- Test: `src/lib/leistungen-weg.test.ts` (if it asserts the old anchor)

**Interfaces:**
- Consumes: `leistungGroups`, `leistungenPages`, `leistungHref` (Task 3).
- Produces: `ServiceGroups()` (no props).

- [ ] **Step 1: Write the failing test** — `src/components/leistungen/ServiceGroups.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ServiceGroups } from "./ServiceGroups";
import { leistungenPages } from "@/lib/leistungenPages";

describe("ServiceGroups", () => {
  it("shows three labelled groups", () => {
    render(<ServiceGroups />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Automatisieren", "Befähigen", "Betreiben"]);
  });

  it("links every service card to its subpage with its one-line definition", () => {
    render(<ServiceGroups />);
    for (const p of leistungenPages) {
      const card = screen.getByRole("link", { name: new RegExp(p.navLabel.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&")) });
      expect(card).toHaveAttribute("href", `/leistungen/${p.slug}`);
      expect(within(card).getByText(p.kurz)).toBeInTheDocument();
    }
  });
});
```

Also: `grep -n "prozess-audit" src/lib/leistungen-weg.test.ts` — if a test asserts `"#prozess-audit"`, change its expectation to `"/leistungen/ki-beratung#prozess-audit"` now.

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/leistungen/ServiceGroups.test.tsx src/lib/leistungen-weg.test.ts`
Expected: FAIL (module missing; weg link still `#prozess-audit` if asserted).

- [ ] **Step 3: Implement**

`src/components/leistungen/ServiceGroups.tsx`:

```tsx
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { leistungGroups, leistungenPages, leistungHref } from "@/lib/leistungenPages";

// The hub's service menu: seven cards in three groups (Automatisieren ·
// Befähigen · Betreiben), so the offer reads as one system rather than a list.
export function ServiceGroups() {
  return (
    <div className="flex flex-col gap-14">
      {leistungGroups.map((g) => {
        const headingId = `gruppe-${g.id}`;
        return (
          <Reveal key={g.id} as="section" aria-labelledby={headingId}>
            <h2 id={headingId} className="text-2xl font-semibold tracking-tight text-papier md:text-3xl">
              {g.label}
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {leistungenPages
                .filter((p) => p.group === g.id)
                .map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={leistungHref(p.slug)}
                      className="card-depth flex h-full flex-col rounded-2xl bg-papier p-6 text-tinte transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol motion-safe:hover:-translate-y-0.5"
                    >
                      <span className="hyphens-auto text-xl font-semibold text-tiefes-wasser">{p.navLabel}</span>
                      <span className="mt-2 flex-1">{p.kurz}</span>
                      <span className="mt-4 text-sm font-semibold text-vrelo-petrol">
                        Mehr erfahren <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>
        );
      })}
    </div>
  );
}
```

Replace `src/app/leistungen/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { ClosingCta } from "@/components/ClosingCta";
import { CHECK_SRC } from "@/lib/prozessCheckCta";
import { ServiceGroups } from "@/components/leistungen/ServiceGroups";
import { Referenzen } from "@/components/leistungen/Referenzen";
import { WennDuBaust } from "@/components/leistungen/WennDuBaust";
import { WoranEsScheitert } from "@/components/leistungen/WoranEsScheitert";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/leistungen") },
  title: "Leistungen",
  description:
    "KI-Automatisierung, Prozessautomatisierung, KI-Server, Claude für Unternehmen, KI-Schulung, KI-Beratung sowie Betreuung und Wartung aus einer Hand.",
};

// The hub (spec 2026-10-01 §3.2): the seven services in three groups, then the
// trust layer (what you get, the obstacles answered, references). The audit
// card moved to /leistungen/ki-beratung; the six Bausteine became the example
// runs on the subpages.
export default function LeistungenPage() {
  return (
    <>
      <PageHero
        title="Leistungen"
        src="/images/leistungen-banner.webp"
        imageClassName="scale-125 origin-bottom"
        lead="KI-Automatisierung und Prozessautomatisierung: Ich baue sie, richte sie ein und halte sie am Laufen. Such dir aus, wo du anfangen willst."
      />
      <Section tone="petrol" className="relative isolate overflow-hidden">
        <SectionBackdrop src="/images/bg-bausteine-b.webp" tintRgb="27 80 99" tintOpacity={0.7} />
        <ServiceGroups />
      </Section>
      <WennDuBaust />
      <WoranEsScheitert />
      <Referenzen />
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Fang mit drei Minuten an: Der Prozess-Check zeigt dir, welche Aufgabe dich am meisten kostet. Danach reden wir, wenn du willst."
        src={CHECK_SRC.leistungenClose}
      />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Leistungen", path: "/leistungen" }])} />
    </>
  );
}
```

In `src/lib/leistungen-weg.ts` change `{ href: "#prozess-audit", label: "Zum kostenlosen Audit" }` to `{ href: "/leistungen/ki-beratung#prozess-audit", label: "Zum kostenlosen Audit" }`.

Delete the four files:

```bash
git rm src/components/leistungen/LeistungCard.tsx src/components/leistungen/MehrMoeglich.tsx src/lib/leistungen.ts src/lib/leistungen.test.ts
grep -rn "LeistungCard\|MehrMoeglich\|@/lib/leistungen\"" src
```

Expected grep output: none. (`CHECK_SRC.leistungenAudit` stays: the audit card on KI-Beratung still uses it.)

- [ ] **Step 4: Run tests, type-check**

Run: `npx vitest run src/components/leistungen src/lib/leistungen-weg.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add -A src/app/leistungen/page.tsx src/components/leistungen src/lib/leistungen-weg.ts src/lib/leistungen-weg.test.ts
git commit -m "feat(leistungen): hub with seven services in three groups; audit card moves to KI-Beratung

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Leistungen dropdown (desktop + mobile)

**Files:**
- Modify: `src/lib/nav.ts`, `src/components/Header.tsx`, `src/components/MobileNav.tsx`
- Create: `src/components/LeistungenMenu.tsx`, `src/components/LeistungenMenu.test.tsx`
- Test: `src/lib/nav.test.ts`, `src/components/MobileNav.test.tsx`, `src/components/Header.test.tsx`

**Interfaces:**
- Consumes: `leistungGroups`, `leistungenPages`, `leistungHref` (Task 3).
- Produces: `type NavGroup = { label: string; items: NavLink[] }`, `leistungenMenu: NavGroup[]` in `nav.ts`; `LeistungenMenu({ pathname }: { pathname: string | null })`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/nav.test.ts`:

```ts
import { leistungenMenu } from "./nav";

describe("leistungenMenu", () => {
  it("groups the seven subpages under three labels", () => {
    expect(leistungenMenu.map((g) => g.label)).toEqual(["Automatisieren", "Befähigen", "Betreiben"]);
    expect(leistungenMenu.flatMap((g) => g.items)).toHaveLength(7);
    expect(leistungenMenu[1].items[0]).toEqual({ href: "/leistungen/claude", label: "Claude für Unternehmen" });
  });
});
```

Create `src/components/LeistungenMenu.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeistungenMenu } from "./LeistungenMenu";

const toggle = () => screen.getByRole("button", { name: "Leistungen-Menü" });

describe("LeistungenMenu", () => {
  it("keeps Leistungen a link to the hub and the panel closed by default", () => {
    render(<LeistungenMenu pathname="/" />);
    expect(screen.getByRole("link", { name: "Leistungen" })).toHaveAttribute("href", "/leistungen");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "KI-Schulung" })).toBeNull();
  });

  it("opens on click with all seven services and an overview link", () => {
    render(<LeistungenMenu pathname="/" />);
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "KI-Schulung" })).toHaveAttribute("href", "/leistungen/ki-schulung");
    expect(screen.getByRole("link", { name: /Alle Leistungen/ })).toHaveAttribute("href", "/leistungen");
  });

  it("closes on Escape and returns focus to the toggle", () => {
    render(<LeistungenMenu pathname="/" />);
    fireEvent.click(toggle());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(toggle()).toHaveFocus();
  });

  it("closes on a click outside and when focus leaves", () => {
    render(
      <div>
        <LeistungenMenu pathname="/" />
        <button type="button">draußen</button>
      </div>,
    );
    fireEvent.click(toggle());
    fireEvent.mouseDown(screen.getByRole("button", { name: "draußen" }));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle());
    fireEvent.focusIn(screen.getByRole("button", { name: "draußen" }));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the current subpage and highlights the section", () => {
    render(<LeistungenMenu pathname="/leistungen/claude" />);
    expect(screen.getByRole("link", { name: "Leistungen" })).toHaveClass("text-vrelo-petrol");
    fireEvent.click(toggle());
    expect(screen.getByRole("link", { name: "Claude für Unternehmen" })).toHaveAttribute("aria-current", "page");
  });
});
```

Append to `src/components/MobileNav.test.tsx` (read the file first and reuse its way of opening the drawer, e.g. clicking „Menü öffnen“):

```tsx
  it("lists the Leistungen subpages under Leistungen in the drawer", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    expect(screen.getByRole("link", { name: "KI-Server" })).toHaveAttribute("href", "/leistungen/ki-server");
    expect(screen.getByRole("link", { name: "Betreuung & Wartung" })).toHaveAttribute("href", "/leistungen/betreuung");
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/nav.test.ts src/components/LeistungenMenu.test.tsx src/components/MobileNav.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Append to `src/lib/nav.ts`:

```ts
import { leistungGroups, leistungenPages, leistungHref } from "@/lib/leistungenPages";

export type NavGroup = { label: string; items: NavLink[] };

// The Leistungen dropdown (spec 2026-10-01 §3.3), derived from the page data so
// the nav can never list a service that has no page.
export const leistungenMenu: NavGroup[] = leistungGroups.map((g) => ({
  label: g.label,
  items: leistungenPages
    .filter((p) => p.group === g.id)
    .map((p) => ({ href: leistungHref(p.slug), label: p.navLabel })),
}));
```

(Move the `import` line to the top of the file with the other imports; `nav.ts` currently has none.)

Create `src/components/LeistungenMenu.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { leistungenMenu } from "@/lib/nav";

const linkFocus =
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol";

// Desktop „Leistungen“: the label stays a link to the hub, a separate toggle
// opens the grouped panel (click/keyboard, never hover-only). Escape closes and
// returns focus to the toggle; a click outside or focus leaving closes it.
// The panel is positioned against the header <nav> (which is `relative`), so it
// never overflows the viewport at md widths.
export function LeistungenMenu({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => !wrapRef.current?.contains(e.target as Node);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (outside(e)) setOpen(false);
    };
    const onFocus = (e: FocusEvent) => {
      if (outside(e)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  const inSection = pathname?.startsWith("/leistungen") ?? false;

  return (
    <div ref={wrapRef} className="flex items-center gap-1">
      <Link
        href="/leistungen"
        aria-current={pathname === "/leistungen" ? "page" : undefined}
        className={`text-sm transition-colors hover:text-vrelo-petrol ${linkFocus} ${inSection ? "font-semibold text-vrelo-petrol" : "text-tinte"}`}
      >
        Leistungen
      </Link>
      <button
        ref={toggleRef}
        type="button"
        aria-label="Leistungen-Menü"
        aria-expanded={open}
        aria-controls="leistungen-menu"
        onClick={() => setOpen((o) => !o)}
        className={`p-1 text-tinte hover:text-vrelo-petrol ${linkFocus}`}
      >
        <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open ? (
        <div
          id="leistungen-menu"
          className="absolute inset-x-6 top-full z-50 mx-auto mt-2 grid max-w-3xl gap-6 rounded-2xl border border-faden bg-papier p-6 shadow-deepwater sm:grid-cols-3"
        >
          {leistungenMenu.map((g) => (
            <div key={g.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{g.label}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === it.href ? "page" : undefined}
                      className={`text-sm text-tinte hover:text-vrelo-petrol aria-[current=page]:font-semibold aria-[current=page]:text-vrelo-petrol ${linkFocus}`}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link
            href="/leistungen"
            onClick={() => setOpen(false)}
            className={`text-sm font-semibold text-vrelo-petrol sm:col-span-3 ${linkFocus}`}
          >
            Alle Leistungen <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
```

In `src/components/Header.tsx`:
- add `relative` to the `<nav>` className (`"relative mx-auto flex max-w-6xl …"`);
- import `LeistungenMenu`;
- inside `navLinks.map`, return `<li key={l.href}><LeistungenMenu pathname={pathname} /></li>` when `l.href === "/leistungen"`, otherwise the existing `<li>`.

In `src/components/MobileNav.tsx`:
- import `leistungenMenu` from `@/lib/nav`;
- add `overflow-y-auto` to the drawer panel's className (seven extra links must stay reachable on short screens);
- in `navLinks.map`, after the Leistungen `<Link>`, when `l.href === "/leistungen"` render:

```tsx
                {l.href === "/leistungen" ? (
                  <div className="mb-2 ml-1 border-l border-gletscher/25 pl-4">
                    {leistungenMenu.map((g) => (
                      <div key={g.label} className="mt-2">
                        <p className="text-xs uppercase tracking-wider text-gletscher/70">{g.label}</p>
                        <ul className="mt-1 flex flex-col">
                          {g.items.map((it) => (
                            <li key={it.href}>
                              <Link
                                href={it.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-sm py-1.5 text-base text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
                              >
                                {it.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/nav.test.ts src/components/LeistungenMenu.test.tsx src/components/MobileNav.test.tsx src/components/Header.test.tsx`
Expected: PASS. `Header.test.tsx` „marks the current route as active“ still finds the `Leistungen` link with `aria-current="page"` (pathname mocked as `/leistungen`). If a MobileNav test counted drawer links, raise its expected count by 7.

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav.ts src/lib/nav.test.ts src/components/LeistungenMenu.tsx src/components/LeistungenMenu.test.tsx src/components/Header.tsx src/components/MobileNav.tsx src/components/MobileNav.test.tsx
git commit -m "feat(nav): Leistungen dropdown with the seven services, grouped

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Homepage — remove the Prozess-Check section, chips become links

**Files:**
- Modify: `src/app/page.tsx`, `src/app/page.test.tsx`, `src/components/home/WasIchBaue.tsx`, `src/components/home/WasIchBaue.test.tsx`, `src/lib/prozessCheckCta.ts`, `src/lib/prozessCheckCta.test.ts`
- Delete: `src/components/home/ProzessCheckSection.tsx`, `src/components/home/ProzessCheckSection.test.tsx`

**Interfaces:**
- Consumes: `leistungenPages`, `leistungHref` (Task 3).

- [ ] **Step 1: Write the failing tests**

In `src/app/page.test.tsx`, replace the expected H2 list (and the test name) with:

```ts
  it("renders the homepage sections without the Prozess-Check teaser", () => {
    const { container } = render(<Home />);
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual([
      "Der Kleinkram frisst deinen Tag.",
      "Ich nehme dir die immer gleichen Aufgaben ab.",
      "Läuft mit den Werkzeugen, die du schon nutzt.",
      "Sorgfältig gebaut. Verlässlich im Betrieb.",
      "So läuft es in echten Betrieben.",
      "Die Prozesse laufen von selbst. Deine Zeit gehört wieder dir.",
    ]);
    expect(container.textContent).not.toContain("Wie viele Stunden sind es bei dir?");
    expect(container.querySelector('a[href="/prozess-check?src=home-hero"]')).not.toBeNull();
  });
```

Append to `src/components/home/WasIchBaue.test.tsx`:

```tsx
import { leistungenPages } from "@/lib/leistungenPages";

  it("links each of the seven services to its subpage", () => {
    render(<WasIchBaue />);
    for (const p of leistungenPages)
      expect(screen.getByRole("link", { name: p.navLabel })).toHaveAttribute("href", `/leistungen/${p.slug}`);
  });
```

(place the `import` at the top and the `it` inside the existing `describe`.)

In `src/lib/prozessCheckCta.test.ts`: change the import line to drop `CHECK_TEASER` and `SAMPLE_ANSWERS`; change `const copy = [...strings(CHECK_CTA), ...strings(CHECK_TEASER)];` to `const copy = strings(CHECK_CTA);`; delete the three `it` blocks that read `CHECK_TEASER` (lines ~51–67), the `it("feeds the teaser title …")` block, and the whole `describe("SAMPLE_ANSWERS", …)`; remove the now-unused `resultCopy`/`STEPS` imports if nothing else in the file uses them. Add:

```ts
  it("no longer carries a home teaser slug", () => {
    expect(Object.values(CHECK_SRC)).not.toContain("home-check");
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/app/page.test.tsx src/components/home/WasIchBaue.test.tsx src/lib/prozessCheckCta.test.ts`
Expected: FAIL (teaser H2 still present, chips are not links, `home-check` still in CHECK_SRC).

- [ ] **Step 3: Implement**

- `src/app/page.tsx`: remove the `ProzessCheckSection` import and `<ProzessCheckSection />`.
- `git rm src/components/home/ProzessCheckSection.tsx src/components/home/ProzessCheckSection.test.tsx`
- `src/lib/prozessCheckCta.ts`: delete `homeCheck: "home-check",`, the `const countPhrase = …` line, `CHECK_TEASER`, the `SAMPLE_ANSWERS` comment + const, and the `STEPS`/`ProzessCheckAnswers` import if now unused (keep `questionCountPhrase` and `NUMBER_WORDS`: `faq.ts` uses them).
- `src/components/home/WasIchBaue.tsx`: replace the `leistungen` string array and its `<li>` rendering with links to the subpages:

```tsx
import { leistungenPages, leistungHref } from "@/lib/leistungenPages";

// The seven services as links into their subpages (spec 2026-10-01 §3.4).
```

```tsx
      <Reveal as="ul" delayMs={200} aria-labelledby="was-ich-baue-heading" className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leistungenPages.map((p) => (
          <li key={p.slug}>
            <Link
              href={leistungHref(p.slug)}
              className="card-depth block h-full rounded-2xl border border-gletscher/25 bg-gletscher/10 px-4 py-3 text-center text-gletscher transition-colors hover:border-honig hover:text-papier focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
            >
              {p.navLabel}
            </Link>
          </li>
        ))}
      </Reveal>
```

Update the component's top comment: the four-chip highlight is now the seven services as links.

- [ ] **Step 4: Run tests and the full suite**

Run: `npx vitest run src/app/page.test.tsx src/components/home/WasIchBaue.test.tsx src/lib/prozessCheckCta.test.ts && npm test && npx tsc --noEmit`
Expected: PASS, no type errors. `grep -rn "home-check\|CHECK_TEASER\|SAMPLE_ANSWERS\|ProzessCheckSection" src` → no output.

- [ ] **Step 5: Commit**

```bash
git add -A src/app/page.tsx src/app/page.test.tsx src/components/home src/lib/prozessCheckCta.ts src/lib/prozessCheckCta.test.ts
git commit -m "feat(home): drop the Prozess-Check teaser section; service chips link to subpages

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Ratgeber as the knowledge layer (`kategorie`, `leistung`)

**Files:**
- Modify: `src/lib/ratgeber.ts`, `src/components/ratgeber/RatgeberIndex.tsx`, `src/app/ratgeber/[slug]/page.tsx`, all 12 files in `content/ratgeber/`
- Test: `src/lib/ratgeber.test.ts`, `src/components/ratgeber/RatgeberIndex.test.tsx`, `src/lib/ratgeber.corpus.test.ts`

**Interfaces:**
- Consumes: `getLeistungPage` (Task 3).
- Produces: `Article.kategorie?: RatgeberKategorie`, `Article.leistung?: LeistungSlug`, `type RatgeberKategorie = "Grundlagen" | "Praxis" | "Kosten"`, `RATGEBER_KATEGORIEN: RatgeberKategorie[]` (that order).

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/ratgeber.test.ts` (it already imports `parseArticle`; follow its fixture style):

```ts
describe("kategorie and leistung frontmatter", () => {
  const base = `---\ntitle: "T"\ndescription: "D"\ndate: "2026-10-01"\ncover: "/images/x.webp"\ncoverAlt: "Alt"\n`;

  it("reads a known kategorie and leistung", () => {
    const a = parseArticle("x.mdx", `${base}kategorie: "Grundlagen"\nleistung: "ki-server"\n---\nText.`);
    expect(a.kategorie).toBe("Grundlagen");
    expect(a.leistung).toBe("ki-server");
  });

  it("leaves both undefined when absent", () => {
    const a = parseArticle("x.mdx", `${base}---\nText.`);
    expect(a.kategorie).toBeUndefined();
    expect(a.leistung).toBeUndefined();
  });

  it("rejects an unknown kategorie or leistung", () => {
    expect(() => parseArticle("x.mdx", `${base}kategorie: "Sonstiges"\n---\nText.`)).toThrow(/kategorie/);
    expect(() => parseArticle("x.mdx", `${base}leistung: "seo"\n---\nText.`)).toThrow(/leistung/);
  });
});
```

Append to `src/lib/ratgeber.corpus.test.ts`:

```ts
import { getAllArticles } from "./ratgeber";

describe("Ratgeber corpus is categorised", () => {
  it("gives every article a kategorie", () => {
    for (const a of getAllArticles({ includeDrafts: true })) expect(a.kategorie, a.slug).toBeDefined();
  });
});
```

(if `getAllArticles` is already imported there, don't import twice.)

Append to `src/components/ratgeber/RatgeberIndex.test.tsx` (reuse its article fixture helper if it has one; otherwise build minimal `Article` objects with all required fields):

```tsx
  it("groups articles under their kategorie in the order Grundlagen, Praxis, Kosten", () => {
    const mk = (slug: string, kategorie?: "Grundlagen" | "Praxis" | "Kosten") => ({
      slug, title: slug, description: "", date: "2026-10-01", tags: [], draft: false,
      readingMinutes: 1, cover: "/images/x.webp", coverAlt: "Alt", body: "", kategorie,
    });
    render(<RatgeberIndex articles={[mk("k", "Kosten"), mk("p", "Praxis"), mk("g", "Grundlagen"), mk("w")]} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Grundlagen", "Praxis", "Kosten", "Weitere"]);
    // Article titles drop one level under their group heading.
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["g", "p", "k", "w"]);
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/ratgeber.test.ts src/lib/ratgeber.corpus.test.ts src/components/ratgeber/RatgeberIndex.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `src/lib/ratgeber.ts`:

```ts
import { getLeistungPage, type LeistungSlug } from "@/lib/leistungenPages";

export type RatgeberKategorie = "Grundlagen" | "Praxis" | "Kosten";
export const RATGEBER_KATEGORIEN: RatgeberKategorie[] = ["Grundlagen", "Praxis", "Kosten"];
```

Add to the `Article` type:

```ts
  kategorie?: RatgeberKategorie;
  leistung?: LeistungSlug; // the Leistungen subpage this article explains
```

In `parseArticle`, before `return`:

```ts
  const kategorie = data.kategorie === undefined ? undefined : String(data.kategorie);
  if (kategorie !== undefined && !RATGEBER_KATEGORIEN.includes(kategorie as RatgeberKategorie)) {
    throw new Error(`Ratgeber article "${slug}" has an unknown kategorie: ${kategorie}`);
  }
  const leistung = data.leistung === undefined ? undefined : String(data.leistung);
  if (leistung !== undefined && !getLeistungPage(leistung)) {
    throw new Error(`Ratgeber article "${slug}" has an unknown leistung: ${leistung}`);
  }
```

and add `kategorie: kategorie as RatgeberKategorie | undefined, leistung: leistung as LeistungSlug | undefined,` to the returned object.

`src/components/ratgeber/RatgeberIndex.tsx`:

```tsx
// src/components/ratgeber/RatgeberIndex.tsx
import { ArticleCard } from "./ArticleCard";
import { RATGEBER_KATEGORIEN, type Article } from "@/lib/ratgeber";

// Grouped by kategorie (Grundlagen → Praxis → Kosten); uncategorised articles
// fall under „Weitere“. Order inside a group stays newest first.
export function RatgeberIndex({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="font-serif text-xl italic text-stumm">Hier entsteht der Ratgeber.</p>;
  }
  const groups = [
    ...RATGEBER_KATEGORIEN.map((k) => ({ label: k as string, items: articles.filter((a) => a.kategorie === k) })),
    { label: "Weitere", items: articles.filter((a) => !a.kategorie) },
  ].filter((g) => g.items.length > 0);
  return (
    <div className="flex max-w-3xl flex-col gap-12">
      {groups.map((g) => (
        <section key={g.label} aria-labelledby={`ratgeber-${g.label}`}>
          <h2 id={`ratgeber-${g.label}`} className="text-sm font-semibold uppercase tracking-wider text-stumm">
            {g.label}
          </h2>
          <div className="mt-4">
            {g.items.map((article) => (
              <ArticleCard key={article.slug} article={article} headingLevel="h3" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

`src/components/ratgeber/ArticleCard.tsx` renders its title as an `<h2>` (line ~23). Add an optional prop `headingLevel?: "h2" | "h3"` (default `"h2"`, so every other caller is unchanged) and render the title through it:

```tsx
  const Heading = headingLevel ?? "h2";
  // …
      <Heading className="mt-3 font-serif text-2xl font-medium text-tiefes-wasser">
```

(keep the existing className exactly as it is in the file; only the tag becomes dynamic). Add to `ArticleCard.test.tsx`: rendering with `headingLevel="h3"` yields `getByRole("heading", { level: 3 })` with the title.

Careful: `RatgeberIndex` is imported by a page whose `ratgeber.ts` uses `node:fs`. Importing `RATGEBER_KATEGORIEN` from `@/lib/ratgeber` is fine because `RatgeberIndex` is a server component. If the build complains about `fs` in a client bundle, move `RatgeberKategorie` + `RATGEBER_KATEGORIEN` to `src/lib/ratgeberKategorie.ts` and import from there in both files.

In `src/app/ratgeber/[slug]/page.tsx`, import `getLeistungPage` and, inside the `mx-auto mt-12 max-w-2xl` div **before** the „Zurück zum Ratgeber“ link, add:

```tsx
          {article.leistung ? (
            <p className="mb-6 text-tinte">
              Mehr dazu, was ich hier baue:{" "}
              <Link
                href={`/leistungen/${article.leistung}`}
                className="rounded-sm font-medium text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-lesepapier focus-visible:ring-vrelo-petrol"
              >
                {getLeistungPage(article.leistung)?.navLabel}
              </Link>
            </p>
          ) : null}
```

Tag the 12 articles (add the lines inside each frontmatter block, after `tags:`):

| File | `kategorie` | `leistung` |
|---|---|---|
| `aus-jeder-anfrage-ein-termin.mdx` | `"Praxis"` | — |
| `claude-im-alltag-nutzen.mdx` | `"Praxis"` | `"claude"` |
| `crm-antwortet-aber-kein-termin.mdx` | `"Praxis"` | — |
| `durcheinander-oder-saubere-quelle.mdx` | `"Grundlagen"` | — |
| `selbst-bauen-oder-bauen-lassen.mdx` | `"Grundlagen"` | `"ki-beratung"` |
| `taeglich-stunden-zurueckgewinnen.mdx` | `"Grundlagen"` | `"prozessautomatisierung"` |
| `terminbestaetigungen-automatisieren.mdx` | `"Praxis"` | — |
| `unterlagen-einsammeln-ohne-nachfassen.mdx` | `"Praxis"` | — |
| `warum-makler-anfragen-verlieren.mdx` | `"Praxis"` | — |
| `was-ki-im-betrieb-wirklich-kann.mdx` | `"Grundlagen"` | `"ki-automatisierung"` |
| `was-kostet-anfragen-automatisieren.mdx` | `"Kosten"` | — |
| `wo-laeuft-deine-ki.mdx` | `"Grundlagen"` | `"ki-server"` |

Before tagging, open each file's title/description; if an article is plainly a cost piece („Was kostet …“), use `"Kosten"` instead of the table value.

- [ ] **Step 4: Run tests, type-check**

Run: `npx vitest run src/lib/ratgeber.test.ts src/lib/ratgeber.corpus.test.ts src/components/ratgeber && npm test && npx tsc --noEmit`
Expected: PASS. If an existing `RatgeberIndex` test asserted a flat list, update it to look inside the groups.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ratgeber.ts src/lib/ratgeber.test.ts src/lib/ratgeber.corpus.test.ts src/components/ratgeber "src/app/ratgeber/[slug]/page.tsx" content/ratgeber
git commit -m "feat(ratgeber): kategorie + leistung frontmatter, grouped index, back-links to subpages

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Copy review pass (with Ajdin)

All copy lives in `src/lib/leistungenPages.ts`, the hub lead/description in `src/app/leistungen/page.tsx`. This task changes strings only.

**Files:**
- Modify: `src/lib/leistungenPages.ts`, `src/app/leistungen/page.tsx`

- [ ] **Step 1: Read the copy sources** listed in spec §6b (first-client-conversations §0a/§0b, prozess-landkarten §0, prozess-check-funnel §1a, agent-platforms + bedrock-eu-findings, KI-Transparenzpflichten, the Hormozi and Codie Sanchez notes). Compare every subline, pain moment, example and objection against them; where a source has a sharper, already-rehearsed sentence, use it (§0a step 1 is the model for the Prozessautomatisierung subline).

- [ ] **Step 2: Run the skills on the copy**, in this order, applying their changes in the data file:
  1. `ogilvy` on the seven `subline`s and `cta.heading`s (headlines that sell, specific over clever);
  2. `objection-destroyer` on the seven `proof.objection` lines (one belief shift each, calm register);
  3. `stop-slop` on every string (Brand.md wins on conflict);
  4. Value-Equation check (HQ CLAUDE.md §8) per page: does the subline lift Dream Outcome, does the proof lift Perceived Likelihood, does the example cut Effort, does the CTA name a short Time Delay? Note one line per page in the commit message body.

- [ ] **Step 3: Facts check** (each must stay true; fix the copy if not):
  - KI-Server: „innerhalb der EU“, „speichert deine Anfragen nicht und trainiert nicht damit“ match `Products/DocumentConcierge/docs/bedrock-eu-findings.md`; „auf deinen Namen“ matches the VreloVPS delivery standard.
  - Betreuung: „monatlich kündbar“, „Alarm … wirklich ankommt“ match HQ §4; no tier names or prices.
  - KI-Beratung: the Fahrplan is promised only conditionally („Lohnt es sich …“), per funnel §1a.
  - Practice proof: no client names.

- [ ] **Step 4: Ajdin approves the copy.** Show him the seven pages (dev server, Task 12 Step 2) or the data file; apply his edits.

- [ ] **Step 5: Tests + byte check + commit**

Run: `npx vitest run src/lib/leistungenPages.test.ts` → PASS, then the perl byte check from Task 3 Step 4 → no output.

```bash
git add src/lib/leistungenPages.ts src/app/leistungen/page.tsx
git commit -m "copy(leistungen): review pass (ogilvy, objection-destroyer, stop-slop, value equation)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Verification in the real app

- [ ] **Step 1: Static checks**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: all pass; the build output lists `/leistungen/[slug]` with seven pre-rendered paths (●).

- [ ] **Step 2: Browser check** — `npm start`, then with Playwright (or chrome-devtools MCP) at **320 px, 375 px and 1280 px**:
  - `/leistungen`: three groups, seven cards, no horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`).
  - Each of the seven subpages: H1 wraps/hyphenates without overflow; Pain, Proof, Example, CTA visible; KI-Beratung shows the audit card and the Förderung note; KI-Automatisierung shows the clip (or poster with reduced motion) and the study sources open in a new tab.
  - Header at 1280 px: the dropdown opens by click and by keyboard (Tab to the toggle, Enter), Escape closes and focus returns; at 375 px the drawer lists the seven services and scrolls.
  - Homepage: no „Wie viele Stunden sind es bei dir?“ section; the hero button still goes to `/prozess-check?src=home-hero`; the seven chips link to subpages.
  - `/kontakt?src=leistung-claude`: click „Termin anzeigen“ and confirm the Cal notes field is prefilled with `Quelle: leistung-claude` (needs `NEXT_PUBLIC_CAL_LINK` set locally; if not set, record that this step was skipped).
  - `/leistungen/gibt-es-nicht` returns 404.
  - Contrast spot-check on the Example band (papier cards and gletscher text on petrol) and the Proof cards; anything under 4.5:1 for body text gets fixed before shipping.

- [ ] **Step 3: Report to Ajdin** what passed, what was skipped, with screenshots of the hub and one subpage at 375 px. **Do not push.** Pushing `main` deploys production; Ajdin decides.

---

### Task 13: Follow-ups outside `Website/` (HQ docs, no git)

- [ ] **Step 1: Brand.md §5** (`Website/Brand.md` is inside the repo; commit it with message `docs(brand): widen the descriptor beyond „kleine Betriebe“`): replace the descriptor slot „kleine Betriebe“ with „Betriebe und Unternehmen“ and add one dated line: `2026-10-01: Zielgruppe für die Website erweitert (auch größere Unternehmen), siehe HQ CLAUDE.md §3.` Then grep `src/` for „kleine Betriebe“ (`professionalServiceLd`, `/ratgeber` metadata) and list the hits to Ajdin rather than changing them silently; change them only on his OK.
- [ ] **Step 2: `Knowledge/marketing/first-client-conversations.md` §0a**: under „Zwei Sperren“, add: `(2026-10-01) Die „nie KI sagen“-Sperre gilt für gesprochene Walk-in-Gespräche mit vorsichtigen Inhabern. Die Website spricht KI offen an (Leistungen-Hub, HQ §3).`
- [ ] **Step 3: HQ `CLAUDE.md`**: §7 add `☐ KI-Schulung: Format festlegen (Dauer, Gruppengröße, vor Ort/online), bisher „Format nach Absprache“ auf /leistungen/ki-schulung.` and `☐ Google-Unternehmensprofil „Leistungen“ auf die sieben Leistungen ziehen.`; §2.2 the `ki-studien.md` line (if Task 1 did not already add it).
- [ ] **Step 4: Vault light sync** per `Vrelo/CLAUDE.md` §6.4: update the strategy/offer wiki pages with the 2026-10-01 menu + buyer decision, index one-liners, log entry. Report the blast radius to Ajdin.
