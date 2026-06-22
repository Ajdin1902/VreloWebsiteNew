# Homepage Problem + Proof Depth Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the two pale homepage sections contained depth and real substance — wrap the Problem task list in a card-depth panel, and rebuild Proof from an apologetic paragraph into four value cards + an honest references footnote.

**Architecture:** Pure presentational React components (no logic). Reuse the `Steps.tsx` card pattern (`card-depth rounded-2xl border … p-6`) as a light-surface analogue on the existing papier sections. Keep the centered spine and the `Reveal` scroll-stagger. No section recoloring (palette rhythm reserves tiefes-wasser for Hero/Footer; petrol block sits above Proof).

**Tech Stack:** Next.js 16 + React, Tailwind v4 (`@theme` tokens), Vitest + React Testing Library (jsdom). `IntersectionObserver` is stubbed in `vitest.setup.ts`, so `Reveal` children render in tests.

**Spec:** `docs/superpowers/specs/2026-06-22-homepage-problem-proof-depth-design.md`

**Typography gotcha:** the German copy uses the spaced en-dash `–` (U+2013), never em-dash. There are NO German quote marks („…“) inside the rendered strings (the copy quotes nothing). After writing each component, byte-verify: em-dash count must be 0. Tokens only — `bg-papier`, `border-faden`, `card-depth`, `text-vrelo-petrol`, `text-tinte`, `text-stumm` — no hand-rolled colors, no pure white.

---

## File Structure
- Modify: `src/components/home/Problem.tsx` — task list moves into a contained card-depth panel.
- Create: `src/components/home/Problem.test.tsx` — render assertions.
- Modify: `src/components/home/Proof.tsx` — connector + four value cards + footnote.
- Create: `src/components/home/Proof.test.tsx` — render assertions.

---

### Task 1: Problem — contained list panel

**Files:**
- Create: `src/components/home/Problem.test.tsx`
- Modify: `src/components/home/Problem.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/home/Problem.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Problem } from "./Problem";

describe("Problem", () => {
  it("renders the heading and all four recurring tasks", () => {
    render(<Problem />);
    expect(
      screen.getByRole("heading", { name: /Kleinkram frisst deinen Tag/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Termine bestätigen und daran erinnern/i)).toBeInTheDocument();
    expect(screen.getByText(/Rechnungen schreiben und nachfassen/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Daten von einem Tool ins nächste übertragen/i),
    ).toBeInTheDocument();
  });

  it("wraps the task list in a card-depth panel", () => {
    const { container } = render(<Problem />);
    const panel = container.querySelector(".card-depth");
    expect(panel).not.toBeNull();
    expect(panel?.querySelectorAll("li")).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/home/Problem.test.tsx`
Expected: FAIL — the second test fails (`.card-depth` is null; the list is not yet in a panel).

- [ ] **Step 3: Implement the panel**

Replace the entire contents of `src/components/home/Problem.tsx`:

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

// The recurring everyday tasks, phrased as daily pains (verbs); the Was-ich-baue
// section then shows them handled (problem -> solution echo).
const tasks = [
  "Termine bestätigen und daran erinnern",
  "Nach jedem Auftrag um eine Bewertung bitten",
  "Rechnungen schreiben und nachfassen",
  "Daten von einem Tool ins nächste übertragen",
];

export function Problem() {
  return (
    <Section tone="paper">
      {/* Centered spine: heading, intro and close stay centered. The task list
          sits in a contained card-depth panel so it doesn't float in the void. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          Der Kleinkram frisst deinen Tag.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-tinte">
          Es sind nicht die großen Dinge – es ist das, was sich jeden Tag wiederholt:
        </Reveal>
        <Reveal as="div" delayMs={160} className="card-depth mx-auto mt-8 max-w-xl rounded-2xl border border-faden bg-papier p-8 text-left">
          <ul className="flex flex-col gap-3 text-lg text-tinte">
            {tasks.map((task) => (
              <li key={task} className="flex items-start gap-3">
                <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal as="p" delayMs={240} className="mt-7 text-pretty text-lg text-tinte">
          Jede Aufgabe für sich ist klein. Zusammen sind es Stunden – Zeit, die für die
          Arbeit fehlt, die du eigentlich liebst.
        </Reveal>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/home/Problem.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Byte-verify typography**

Run: `node -e 'const s=require("fs").readFileSync("src/components/home/Problem.tsx","utf8");console.log("em-dash:",(s.match(/—/g)||[]).length,"en-dash:",(s.match(/–/g)||[]).length)'`
Expected: `em-dash: 0 en-dash: 2`. If em-dash > 0, fix via `fs` (replace `—` with `–`).

- [ ] **Step 6: Commit**

```bash
git add src/components/home/Problem.tsx src/components/home/Problem.test.tsx
git commit -m "feat(home): contain the Problem task list in a card-depth panel"
```

---

### Task 2: Proof — value cards + footnote

**Files:**
- Create: `src/components/home/Proof.test.tsx`
- Modify: `src/components/home/Proof.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/home/Proof.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Proof } from "./Proof";

describe("Proof", () => {
  it("renders the heading, four value cards, and the references footnote", () => {
    render(<Proof />);
    expect(
      screen.getByRole("heading", { name: /Ruhig gebaut\. Verlässlich im Betrieb\./i }),
    ).toBeInTheDocument();
    for (const title of [
      "Ein Ansprechpartner.",
      "Praxiserprobt.",
      "Maßgeschneidert statt von der Stange.",
      "Du wartest nichts.",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByText(/Erste Kundenreferenzen folgen/i)).toBeInTheDocument();
  });

  it("does not show the old apologetic placeholder line", () => {
    render(<Proof />);
    expect(screen.queryByText(/Echte Referenzen folgen in Kürze/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/home/Proof.test.tsx`
Expected: FAIL — card-title headings don't exist yet; the old placeholder still present.

- [ ] **Step 3: Implement the rebuilt Proof**

Replace the entire contents of `src/components/home/Proof.tsx`:

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

const values = [
  {
    title: "Ein Ansprechpartner.",
    body: "Du redest immer mit mir – kein Team, keine Tickets, keine Warteschleife.",
  },
  {
    title: "Praxiserprobt.",
    body: "Seit über drei Jahren automatisiere ich Prozesse in einem internationalen Unternehmen – du bekommst diese Erfahrung in jedem System.",
  },
  {
    title: "Maßgeschneidert statt von der Stange.",
    body: "Ein System, das zu deinem Betrieb passt – sauber gebaut und dokumentiert.",
  },
  {
    title: "Du wartest nichts.",
    body: "Einrichten, absichern, am Laufen halten – das übernehme ich. Du musst nichts lernen.",
  },
];

export function Proof() {
  return (
    <Section tone="paper" className="relative isolate overflow-hidden border-t border-faden">
      {/* Faint cool water texture; heavy papier tint keeps the dark text AA-readable. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/section-texture.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-papier/88" />

      {/* Centered spine: heading + connector on the central axis. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          Ruhig gebaut. Verlässlich im Betrieb.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-tinte">
          Worauf du dich verlassen kannst:
        </Reveal>
      </div>

      <Reveal as="ul" delayMs={160} className="mx-auto mt-10 grid max-w-3xl gap-5 text-left sm:grid-cols-2">
        {values.map((v) => (
          <li key={v.title} className="card-depth rounded-2xl border border-faden bg-papier p-6">
            <h3 className="text-xl font-semibold text-vrelo-petrol">{v.title}</h3>
            <p className="mt-2 text-tinte">{v.body}</p>
          </li>
        ))}
      </Reveal>

      <Reveal as="p" delayMs={240} className="mx-auto mt-8 max-w-xl text-center text-sm text-stumm">
        Erste Kundenreferenzen folgen, sobald die laufenden Projekte abgeschlossen sind.
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/home/Proof.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Byte-verify typography**

Run: `node -e 'const s=require("fs").readFileSync("src/components/home/Proof.tsx","utf8");console.log("em-dash:",(s.match(/—/g)||[]).length,"en-dash:",(s.match(/–/g)||[]).length)'`
Expected: `em-dash: 0 en-dash: 4`. If em-dash > 0, fix via `fs`.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/Proof.tsx src/components/home/Proof.test.tsx
git commit -m "feat(home): rebuild Proof into value cards + honest references footnote"
```

---

### Task 3: Full gate, browser-verify, push

**Files:** none (verification only).

- [ ] **Step 1: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint src/components/home/Problem.tsx src/components/home/Proof.tsx src/components/home/Problem.test.tsx src/components/home/Proof.test.tsx`
Expected: no output / no errors.

- [ ] **Step 2: Full test suite**

Run: `npx vitest run`
Expected: all files pass (previously 213 tests + 4 new = 217).

- [ ] **Step 3: Push to deploy**

```bash
git push origin main
```
Expected: `main` updates; Vercel auto-deploys to production. (Confirm with the user before this push — it is a production deploy.)

- [ ] **Step 4: Browser-verify the live deploy**

After the deploy reports Ready, drive a browser to `https://vrelo-website.vercel.app/` at **1440** then **390**. Scroll the Problem (~y 650) and Proof (~y 2450) sections into view to fire their `Reveal`, screenshot each, and confirm:
- Problem: the task list sits in a visible elevated panel (not floating); heading/intro/close still centered.
- Proof: four cards in a 2×2 grid at 1440 (1-column stack at 390), petrol titles readable, footnote small/de-emphasized, no „Echte Referenzen folgen“ line.
- If a card/panel looks flat against the papier bg, add `ring-1 ring-tiefes-wasser/5` to the card className (tokens only), re-run the gate, commit, push.

---

## Self-Review
- **Spec coverage:** Problem panel (Task 1) ✓; Proof connector + 4 cards + footnote, old line removed (Task 2) ✓; tokens/no-icons/2×2 grid ✓; tests ✓; gate + browser-verify 1440/390 (Task 3) ✓.
- **Placeholders:** none — full component + test code inline.
- **Type consistency:** `values` items use `{ title, body }` in both the impl and the test title list; card titles are `h3` (asserted via `getByRole("heading", { name })`).
