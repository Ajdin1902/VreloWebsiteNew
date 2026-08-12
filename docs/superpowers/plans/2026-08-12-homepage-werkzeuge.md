# „Läuft mit deinen Werkzeugen" — Homepage-Sektion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a calm, static homepage section that reassures visitors they keep the tools they already use — a grouped grid of tool *names* (no logos, no carousel), placed after `WasIchBaue`.

**Architecture:** One new server component `Werkzeuge` built from the existing `Section` + `Reveal` primitives, holding its copy and tool list inline (like `WasIchBaue`). Rendered on the homepage between `WasIchBaue` and `Steps`, on a petrol surface to preserve the deliberate cool→warm arc. No new lib module, no data layer.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind v4 (`@theme` tokens), Vitest + React Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-08-12-homepage-werkzeuge-design.md`

**Branch:** `feat/homepage-werkzeuge` (already checked out; the spec commits live here).

---

## File Structure

- **Create** `src/components/home/Werkzeuge.tsx` — the section component. Responsibility: render heading + subline + 4 tool clusters + catch-all line. Holds all German copy and the tool list inline.
- **Create** `src/components/home/Werkzeuge.test.tsx` — component tests (Vitest + RTL).
- **Modify** `src/app/page.tsx` — import `Werkzeuge`, render it between `<WasIchBaue />` and `<Steps />`.

### Copy (German, final — plain sentences, NOT wrapped in quotation marks)

- **Heading (h2):** `Läuft mit den Werkzeugen, die du schon nutzt.`
- **Subline (p):** `Du wechselst nichts und lernst nichts Neues. Ich baue die Automatisierung um das herum, womit du heute schon arbeitest.`
- **Catch-all (p):** `Und viele weitere – wenn dein Werkzeug eine Schnittstelle hat, lässt es sich meist anbinden.`
  - The dash is the German Gedankenstrich = **spaced en-dash U+2013** (` – `), never hyphen/em-dash. This is the ONLY special glyph in the component — a dedicated repair step below guarantees it.

### Tool clusters (4 × 3 = 12)

| Label | Tools |
|---|---|
| `E-Mail & Kalender` | Outlook · Gmail · Google Kalender |
| `CRM & Kontakte` | onOffice · HubSpot · Pipedrive |
| `Aufgaben & Ablage` | ClickUp · Notion · Google Sheets |
| `Rechnung & Buchhaltung` | sevDesk · lexoffice · DATEV |

---

## Task 1: `Werkzeuge` component (TDD)

**Files:**
- Create: `src/components/home/Werkzeuge.tsx`
- Test: `src/components/home/Werkzeuge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/home/Werkzeuge.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Werkzeuge } from "./Werkzeuge";

const TOOLS = [
  "Outlook",
  "Gmail",
  "Google Kalender",
  "onOffice",
  "HubSpot",
  "Pipedrive",
  "ClickUp",
  "Notion",
  "Google Sheets",
  "sevDesk",
  "lexoffice",
  "DATEV",
];

const LABELS = [
  "E-Mail & Kalender",
  "CRM & Kontakte",
  "Aufgaben & Ablage",
  "Rechnung & Buchhaltung",
];

describe("Werkzeuge", () => {
  it("renders on a petrol band (preserves the cool→warm arc)", () => {
    const { container } = render(<Werkzeuge />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });

  it("renders the reassurance heading", () => {
    render(<Werkzeuge />);
    expect(
      screen.getByRole("heading", { level: 2, name: /Läuft mit den Werkzeugen/i }),
    ).toBeInTheDocument();
  });

  it("renders every cluster label", () => {
    render(<Werkzeuge />);
    for (const label of LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders every tool name", () => {
    render(<Werkzeuge />);
    for (const tool of TOOLS) {
      expect(screen.getByText(tool)).toBeInTheDocument();
    }
  });

  it("renders the honest catch-all line", () => {
    render(<Werkzeuge />);
    expect(screen.getByText(/Und viele weitere/i)).toBeInTheDocument();
  });

  it("associates each tool list with its cluster label (aria-labelledby)", () => {
    const { container } = render(<Werkzeuge />);
    const lists = container.querySelectorAll("ul[aria-labelledby]");
    expect(lists).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/home/Werkzeuge.test.tsx`
Expected: FAIL — cannot resolve `./Werkzeuge` (module does not exist yet).

- [ ] **Step 3: Write the component**

Create `src/components/home/Werkzeuge.tsx`:

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

// Clears the silent "do I have to switch the tools I already use?" objection.
// Deliberately NOT a logo carousel (Ruhe vor Hype) and NO real logos
// (trademark/UWG risk) — tool *names* only. Grouped clusters so it reads as
// considered (and differs from WasIchBaue's flat chips directly above). Every
// tool has a public API, so "works with your tools" stays honest.
const clusters: { label: string; tools: string[] }[] = [
  { label: "E-Mail & Kalender", tools: ["Outlook", "Gmail", "Google Kalender"] },
  { label: "CRM & Kontakte", tools: ["onOffice", "HubSpot", "Pipedrive"] },
  { label: "Aufgaben & Ablage", tools: ["ClickUp", "Notion", "Google Sheets"] },
  { label: "Rechnung & Buchhaltung", tools: ["sevDesk", "lexoffice", "DATEV"] },
];

export function Werkzeuge() {
  return (
    <Section tone="petrol">
      {/* Centered spine: heading + subline on the central axis. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal
          as="h2"
          delayMs={0}
          className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl"
        >
          Läuft mit den Werkzeugen, die du schon nutzt.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-gletscher">
          Du wechselst nichts und lernst nichts Neues. Ich baue die Automatisierung
          um das herum, womit du heute schon arbeitest.
        </Reveal>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {clusters.map((cluster, i) => {
          const labelId = `werkzeuge-cluster-${i}`;
          return (
            <Reveal key={cluster.label} delayMs={160 + i * 80}>
              <p
                id={labelId}
                className="text-sm font-medium uppercase tracking-wide text-gletscher/70"
              >
                {cluster.label}
              </p>
              <ul aria-labelledby={labelId} className="mt-3 grid gap-2">
                {cluster.tools.map((tool) => (
                  <li
                    key={tool}
                    className="card-depth rounded-xl border border-gletscher/20 bg-tiefes-wasser/40 px-4 py-2.5 text-center text-gletscher"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>

      <Reveal
        as="p"
        delayMs={480}
        className="mx-auto mt-10 max-w-2xl text-center text-sm text-gletscher/80"
      >
        Und viele weitere – wenn dein Werkzeug eine Schnittstelle hat, lässt es sich
        meist anbinden.
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 4: Repair + verify the en-dash byte (the Write tool silently downgrades it)**

The catch-all's Gedankenstrich must be a **spaced en-dash (U+2013)**. Normalize whatever the editor wrote (hyphen, en-, or em-dash between `weitere` and `wenn`) to a spaced U+2013:

Run:
```bash
perl -CSD -0777 -i -pe 's/weitere\s+[-\x{2013}\x{2014}]\s+wenn/weitere \x{2013} wenn/g' src/components/home/Werkzeuge.tsx
```

Then verify the dash is U+2013 and the umlauts survived (note: every non-ASCII char in the check pattern MUST be a `\x{…}` escape — a literal `ä`/`–` in the program is raw bytes under `-CSD` and never matches; `-0777` slurps the whole file so matches across different lines work):
```bash
perl -CSD -0777 -ne 'print "dash U+2013 OK\n" if /weitere \x{2013} wenn/; print "Laeuft OK\n" if /L\x{E4}uft/; print "laesst OK\n" if /l\x{E4}sst/' src/components/home/Werkzeuge.tsx
```
Expected: `dash U+2013 OK`, `Laeuft OK`, and `laesst OK` all print. If the dash line does not print, re-run the repair command above.

Also confirm no em-dash slipped in anywhere in the file:
```bash
perl -CSD -ne 'print "STRAY em-dash L$.\n" if /\x{2014}/' src/components/home/Werkzeuge.tsx
```
Expected: no output.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/home/Werkzeuge.test.tsx`
Expected: PASS (all 6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/home/Werkzeuge.tsx src/components/home/Werkzeuge.test.tsx
git commit -m "feat(home): Werkzeuge section — calm 'keep your tools' grid

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Wire `Werkzeuge` into the homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add the import**

In `src/app/page.tsx`, add the import alongside the other home-section imports (after the `WasIchBaue` import line):

```tsx
import { Werkzeuge } from "@/components/home/Werkzeuge";
```

- [ ] **Step 2: Render it between `WasIchBaue` and `Steps`**

In the returned JSX, insert `<Werkzeuge />` so the section order reads:

```tsx
      <Hero />
      <Problem />
      <WasIchBaue />
      <Werkzeuge />
      <Steps />
      <Proof />
      <MerakClose />
```

- [ ] **Step 3: Verify the full suite, types, lint, and build all pass**

Run each and confirm success:
```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all green — full Vitest suite passes, no type errors, no lint errors, production build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): render Werkzeuge between WasIchBaue and Steps

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Optional manual check (recommended, not blocking)

Homepage sections are browser-verified in this repo. If iterating visually, run `npm start` (NOT `npm run dev` — see CLAUDE.md) and view `/` at 1440 and 390 widths. Confirm: petrol band sits cleanly between the petrol `WasIchBaue` and petrol `Steps` (three petrol sections — the new one is visually distinct via grouped clusters + eyebrow labels); four clusters read as one row on desktop, stack on mobile; `Reveal` stagger is calm; nothing auto-moves.

---

## Notes for the implementer

- **No copy-guard test needed** — homepage components (`WasIchBaue`, `Proof`) hold German strings inline without one; the byte-repair step (Task 1 / Step 4) is the punctuation safeguard here.
- **`ul`/`li`, never `dl`/`dt`** — `<dt>` forbids the label content shape and the cluster labels are rubrics, not definition terms (CLAUDE.md gotcha). The plan already uses `ul`/`li`.
- **`stop-slop`** was already applied to this copy during brainstorming; the three strings are final. Don't re-slop them.
- **Do not touch** the unrelated working-tree changes (newsletter files, root `CLAUDE.md`) — they belong to other in-progress work. Only stage the files each step names.
