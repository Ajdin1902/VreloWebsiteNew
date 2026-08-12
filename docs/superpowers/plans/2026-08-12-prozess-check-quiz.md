# Prozess-Check Qualification Quiz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended)
> or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship `/prozess-check` — a five-question, pain-surfacing quiz that categorizes a visitor
(A/B/C/D) and gives an honest fit verdict for Der Prozess-Audit, closing fitting visitors on the embedded
Cal scheduler.

**Architecture:** Reuse the `/lead-check` wizard shape. Pure-core copy+logic module
(`src/lib/prozessCheck.ts`, deterministic, unit-tested), a client wizard (`ProzessCheck` + `Question` +
`Result`) under `src/components/prozess-check/`, a `noindex` focus-route page, plus a secondary entry
link on the existing `/leistungen` ProzessAudit block.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind v4 `@theme` tokens, Vitest + React
Testing Library. Reuses `SchedulerEmbed` (`@/components/kontakt/SchedulerEmbed`), `PageHero`, `calLink()`
(`@/lib/contact`), the `focusRoutes`/`focusChrome` mechanism (`@/lib/nav`).

**Design spec:** `docs/superpowers/specs/2026-08-12-prozess-check-quiz-design.md` (all German copy,
categorization logic, resolved decisions).

**Branch:** `feat/prozess-check-quiz` (already created). Ignore the unrelated dirty newsletter files on
the branch — never stage them.

**Brand invariants (all tasks):** German „…“ quotes (U+201E open / U+201C close), spaced en-dash „ – “
(U+2013) never em-dash (U+2014), `du`, generic masculine, calm voice. **After every write to a file with
German, byte-verify and repair** (Write/Edit silently downgrade the closing quote):

```bash
F=<file>
perl -CSD -0777 -i -pe 's/\x{201E}([^\x{201E}\x{201C}\x{201D}\x{22}]*)[\x{201D}\x{22}]/\x{201E}${1}\x{201C}/g' "$F"
# confirm balance + zero dirty pairs:
perl -CSD -0777 -ne '$o=0;$o++ while /\x{201E}/g; END{print "open $o\n"}' "$F"
perl -CSD -0777 -ne '$c=0;$c++ while /\x{201C}/g; END{print "close $c\n"}' "$F"
perl -CSD -0777 -ne '$d=0;$d++ while /\x{201E}[^\x{201E}\x{201C}]*\x{201D}/gs; END{print "dirty $d\n"}' "$F"
```

The `.ts`/`.tsx` copy-guard tests are the durable enforcement; the byte pass keeps the source clean
between writes. In `.tsx`, if a literal en-dash risks downgrade, render it as the JS string `{"–"}` the
way `Result.tsx` (lead-check) does.

---

## Task 1: Pure core — types, STEPS, categorization

**Files:**
- Create: `src/lib/prozessCheck.ts`
- Test: `src/lib/prozessCheck.test.ts`

- [ ] **Step 1: Write the failing scoring test**

Create `src/lib/prozessCheck.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { categorize, severity, STEPS, type ProzessCheckAnswers } from "./prozessCheck";

// A base answer set that scores severity 0 (D) unless overridden.
const base: ProzessCheckAnswers = {
  aufgabe: "anfragen",
  zeit: "unter1",
  konsequenz: "nichts",
  abende: "nein",
  versucht: "garnicht",
};

describe("prozessCheck categorization", () => {
  it("has five steps in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual(["aufgabe", "zeit", "konsequenz", "abende", "versucht"]);
  });

  it("routes anyone who already automates to C, regardless of severity", () => {
    expect(categorize({ ...base, zeit: "ueber5", konsequenz: "liegen", abende: "staendig", versucht: "laeuft" })).toBe("C");
    expect(categorize({ ...base, versucht: "laeuft" })).toBe("C");
  });

  it("routes the clear low-pain case (severity 0) to D", () => {
    expect(severity(base)).toBe(0);
    expect(categorize(base)).toBe("D");
  });

  it("routes moderate pain (severity 1–2) to B", () => {
    expect(categorize({ ...base, zeit: "1bis3" })).toBe("B"); // severity 1
    expect(categorize({ ...base, zeit: "1bis3", konsequenz: "liegen" })).toBe("B"); // severity 2
  });

  it("routes strong pain (severity ≥ 3) to A", () => {
    expect(categorize({ ...base, zeit: "3bis5", konsequenz: "liegen" })).toBe("A"); // 2+1 = 3
    expect(categorize({ ...base, zeit: "ueber5", abende: "staendig" })).toBe("A"); // 3+2 = 5
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/prozessCheck.test.ts`
Expected: FAIL — cannot import `./prozessCheck`.

- [ ] **Step 3: Implement the core module (types, STEPS, scoring)**

Create `src/lib/prozessCheck.ts`:

```ts
// src/lib/prozessCheck.ts
//
// Pure core for the /prozess-check qualification quiz. Deterministic, no AI, no
// numbers in the result. Five pain-surfacing questions categorize the visitor
// (A/B/C/D); the result gives an honest fit verdict for Der Prozess-Audit.
// Distinct from leadCheck.ts on purpose — no € scoring here.
// Design: docs/superpowers/specs/2026-08-12-prozess-check-quiz-design.md

export type Aufgabe = "anfragen" | "termine" | "angebote" | "nachfassen" | "daten" | "nachrichten";
export type Zeit = "unter1" | "1bis3" | "3bis5" | "ueber5";
export type Konsequenz = "liegen" | "termine" | "warten" | "nichts";
export type Abende = "staendig" | "abundzu" | "nein";
export type Versucht = "toolBrach" | "gebastelt" | "garnicht" | "laeuft";

export type ProzessCheckAnswers = {
  aufgabe: Aufgabe;
  zeit: Zeit;
  konsequenz: Konsequenz;
  abende: Abende;
  versucht: Versucht;
};

type ChoiceOption<V extends string> = { value: V; label: string };

export type Step =
  | { id: "aufgabe"; label: string; options: readonly ChoiceOption<Aufgabe>[] }
  | { id: "zeit"; label: string; options: readonly ChoiceOption<Zeit>[] }
  | { id: "konsequenz"; label: string; options: readonly ChoiceOption<Konsequenz>[] }
  | { id: "abende"; label: string; options: readonly ChoiceOption<Abende>[] }
  | { id: "versucht"; label: string; options: readonly ChoiceOption<Versucht>[] };

export const STEPS: readonly Step[] = [
  {
    id: "aufgabe",
    label: "Welche Aufgabe machst du gefühlt jede Woche immer und immer wieder?",
    options: [
      { value: "anfragen", label: "Anfragen beantworten und qualifizieren" },
      { value: "termine", label: "Termine ausmachen und hin- und herschieben" },
      { value: "angebote", label: "Angebote und Rechnungen schreiben" },
      { value: "nachfassen", label: "Hinterhertelefonieren und nachfassen" },
      { value: "daten", label: "Dieselben Daten von A nach B tippen" },
      { value: "nachrichten", label: "Immer die gleichen Nachrichten beantworten" },
    ],
  },
  {
    id: "zeit",
    label: "Wie viel Zeit frisst diese eine Sache – ehrlich geschätzt – pro Woche?",
    options: [
      { value: "unter1", label: "unter 1 Stunde" },
      { value: "1bis3", label: "1 bis 3 Stunden" },
      { value: "3bis5", label: "3 bis 5 Stunden" },
      { value: "ueber5", label: "mehr als 5 Stunden" },
    ],
  },
  {
    id: "konsequenz",
    label: "Und wenn du mal nicht hinterherkommst – was passiert dann?",
    options: [
      { value: "liegen", label: "Anfragen bleiben liegen oder springen ab" },
      { value: "termine", label: "Termine verrutschen oder gehen unter" },
      { value: "warten", label: "Kunden warten länger, als mir lieb ist" },
      { value: "nichts", label: "Nichts geht verloren, es kostet mich nur Zeit" },
    ],
  },
  {
    id: "abende",
    label: "Nimmst du solche Aufgaben abends oder am Wochenende mit nach Hause?",
    options: [
      { value: "staendig", label: "Ja, ständig" },
      { value: "abundzu", label: "Ab und zu" },
      { value: "nein", label: "Nein, das lasse ich im Betrieb" },
    ],
  },
  {
    id: "versucht",
    label: "Hast du schon versucht, das loszuwerden?",
    options: [
      { value: "toolBrach", label: "Ein Tool gekauft, aber es liegt brach" },
      { value: "gebastelt", label: "Selbst etwas gebastelt, hält aber nicht" },
      { value: "garnicht", label: "Noch nicht, ich weiß nicht, wo ich anfangen soll" },
      { value: "laeuft", label: "Läuft schon teilweise automatisch" },
    ],
  },
];

export type Category = "A" | "B" | "C" | "D";

const ZEIT_PTS: Record<Zeit, number> = { unter1: 0, "1bis3": 1, "3bis5": 2, ueber5: 3 };
const KONSEQUENZ_PTS: Record<Konsequenz, number> = { liegen: 1, termine: 1, warten: 1, nichts: 0 };
const ABENDE_PTS: Record<Abende, number> = { staendig: 2, abundzu: 1, nein: 0 };

export function severity(a: ProzessCheckAnswers): number {
  return ZEIT_PTS[a.zeit] + KONSEQUENZ_PTS[a.konsequenz] + ABENDE_PTS[a.abende];
}

// Order matters: "already automating" overrides severity (engagement is the
// signal → optimization, not a fresh build). Otherwise severity buckets:
// 0 → D (too small), 1–2 → B (moderate), ≥3 → A (clear).
export function categorize(a: ProzessCheckAnswers): Category {
  if (a.versucht === "laeuft") return "C";
  const s = severity(a);
  if (s === 0) return "D";
  if (s >= 3) return "A";
  return "B";
}
```

Then byte-verify + repair German quotes in `src/lib/prozessCheck.ts` (see Brand invariants).

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/lib/prozessCheck.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/prozessCheck.ts src/lib/prozessCheck.test.ts
git commit -m "feat(prozess-check): core types, STEPS and categorization

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Pure core — result copy + copy-guard

**Files:**
- Modify: `src/lib/prozessCheck.ts` (append result copy)
- Modify: `src/lib/prozessCheck.test.ts` (append copy-guard + interpolation tests)

- [ ] **Step 1: Write the failing result-copy tests**

Append to `src/lib/prozessCheck.test.ts`:

```ts
import { resultCopy, RESULT_UI, type Aufgabe, type Konsequenz } from "./prozessCheck";

// Collect every German string the feature can render: STEPS, the static UI copy,
// and resultCopy over a matrix covering all nouns × consequences × categories.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const AUFGABEN: Aufgabe[] = ["anfragen", "termine", "angebote", "nachfassen", "daten", "nachrichten"];
const KONSEQUENZEN: Konsequenz[] = ["liegen", "termine", "warten", "nichts"];
// One answer set per category (severity: A≥3, B 1–2, C laeuft, D 0).
const CATEGORY_SAMPLES: ProzessCheckAnswers[] = [
  { aufgabe: "anfragen", zeit: "ueber5", konsequenz: "liegen", abende: "staendig", versucht: "garnicht" }, // A
  { aufgabe: "anfragen", zeit: "1bis3", konsequenz: "nichts", abende: "nein", versucht: "garnicht" }, // B
  { aufgabe: "anfragen", zeit: "1bis3", konsequenz: "liegen", abende: "abundzu", versucht: "laeuft" }, // C
  { aufgabe: "anfragen", zeit: "unter1", konsequenz: "nichts", abende: "nein", versucht: "garnicht" }, // D
];

const corpus: string[] = [];
strings(STEPS, corpus);
strings(RESULT_UI, corpus);
for (const aufgabe of AUFGABEN)
  for (const konsequenz of KONSEQUENZEN)
    for (const s of CATEGORY_SAMPLES)
      strings(resultCopy({ ...s, aufgabe, konsequenz }), corpus);

const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("prozessCheck copy", () => {
  it("uses German quotes, never ASCII double quotes", () => {
    expect(corpus.filter((s) => s.includes('"'))).toEqual([]);
  });
  it("uses the en-dash, never the em-dash", () => {
    expect(corpus.filter((s) => s.includes("—"))).toEqual([]);
  });
  it("pairs every opening German quote with a closing one", () => {
    for (const s of corpus) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });

  it("never names a price", () => {
    // resultCopy + RESULT_UI only (STEPS legitimately say '1 bis 3 Stunden').
    const resultStrings: string[] = [];
    strings(RESULT_UI, resultStrings);
    for (const s of CATEGORY_SAMPLES) strings(resultCopy(s), resultStrings);
    expect(resultStrings.filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("emits no number in the result headline/body/verdict", () => {
    for (const s of CATEGORY_SAMPLES) {
      const r = resultCopy(s);
      expect(/\d/.test(r.headline + r.body + r.verdict)).toBe(false);
    }
  });

  it("mirrors the visitor's task and consequence in A", () => {
    const r = resultCopy({ aufgabe: "termine", zeit: "ueber5", konsequenz: "warten", abende: "staendig", versucht: "garnicht" });
    expect(r.category).toBe("A");
    expect(r.body).toContain("Termine ausmachen");
    expect(r.body).toContain("Kunden warten");
  });

  it("marks A/B/C as fitting (scheduler) and D as not", () => {
    expect(resultCopy(CATEGORY_SAMPLES[0]).fits).toBe(true); // A
    expect(resultCopy(CATEGORY_SAMPLES[1]).fits).toBe(true); // B
    expect(resultCopy(CATEGORY_SAMPLES[2]).fits).toBe(true); // C
    expect(resultCopy(CATEGORY_SAMPLES[3]).fits).toBe(false); // D
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npx vitest run src/lib/prozessCheck.test.ts`
Expected: FAIL — `resultCopy`/`RESULT_UI` not exported.

- [ ] **Step 3: Implement result copy**

Append to `src/lib/prozessCheck.ts`:

```ts
export type ResultCopy = {
  category: Category;
  headline: string;
  body: string;
  verdict: string;
  /** A/B/C embed the scheduler; D shows the soft exit. */
  fits: boolean;
};

// Task noun (for the A/B mirror) and consequence clause (each carries its own
// leading connector so it appends cleanly after the noun / after "spürbar Zeit").
const AUFGABE_NOUN: Record<Aufgabe, string> = {
  anfragen: "Anfragen beantworten",
  termine: "Termine ausmachen",
  angebote: "Angebote und Rechnungen",
  nachfassen: "Nachfassen",
  daten: "Daten von A nach B tippen",
  nachrichten: "immer die gleichen Nachrichten",
};

const KONSEQUENZ_CLAUSE: Record<Konsequenz, string> = {
  liegen: " und Anfragen bleiben dabei liegen",
  termine: " und Termine verrutschen dir",
  warten: " und Kunden warten länger, als dir lieb ist",
  nichts: " auch wenn dabei nichts verloren geht",
};

export function resultCopy(a: ProzessCheckAnswers): ResultCopy {
  const category = categorize(a);
  const noun = AUFGABE_NOUN[a.aufgabe];
  const clause = KONSEQUENZ_CLAUSE[a.konsequenz];

  switch (category) {
    case "A":
      return {
        category,
        headline: "Eine klare Quelle.",
        body: `Du steckst Woche für Woche einen guten Teil deiner Zeit in ${noun}${clause}. Genau dafür ist der Prozess-Audit da: eine klare Quelle, die sich rechnen lässt.`,
        verdict: "Ein Erstgespräch lohnt sich für dich.",
        fits: true,
      };
    case "B":
      return {
        category,
        headline: "Da steckt etwas drin.",
        body: `Diese eine Aufgabe – ${noun} – kostet dich spürbar Zeit${clause}. Ob sich das Automatisieren für dich schon rechnet, zeigt dir der Audit schwarz auf weiß.`,
        verdict: "Ein Erstgespräch bringt dir Klarheit.",
        fits: true,
      };
    case "C":
      return {
        category,
        headline: "Bei dir läuft schon einiges.",
        body: "Du automatisierst schon – dann geht es bei dir weniger ums Anfangen als ums Rundmachen. Ein kurzes Gespräch klärt, ob ein Audit dir noch etwas bringt oder ob du gut aufgestellt bist.",
        verdict: "Ein kurzes Gespräch sagt dir, ob sich ein Audit lohnt.",
        fits: true,
      };
    case "D":
      return {
        category,
        headline: "Noch zu klein.",
        body: "Ehrlich? So wie es klingt, kostet dich das Ganze eher Nerven als echte Stunden – und es geht nichts verloren. Dann lohnt sich ein Audit für dich vermutlich noch nicht. Komm wieder, wenn eine Aufgabe dir wirklich den Tag frisst.",
        verdict: "Ein Gespräch ist gerade noch nicht nötig.",
        fits: false,
      };
  }
}

// Static UI copy the Result component renders (components hold no German).
export const RESULT_UI = {
  resultLabel: "Dein Ergebnis",
  schedulerPrompt: "Im kostenlosen Erstgespräch schauen wir gemeinsam drauf – unverbindlich.",
  schedulerFallbackHint: "Schreib mir so lange einfach über das Kontaktformular.",
  exitLead: "Schau dich in Ruhe um. Wenn dich eine Aufgabe doch täglich ausbremst, bin ich da.",
  exitNewsletterPrefix: "Bis dahin: ",
  exitNewsletterLabel: "„Die Quelle“",
  exitNewsletterSuffix: ", mein Newsletter mit einem kleinen Tipp pro Woche, oder stöber im ",
  exitRatgeberLabel: "Ratgeber",
  exitSuffix: ".",
} as const;
```

Then byte-verify + repair German quotes in `src/lib/prozessCheck.ts`.

**Copy note:** the A/B mirror concatenates `noun + clause`. For `aufgabe: "anfragen"` + `konsequenz:
"liegen"` this reads „…in Anfragen beantworten und Anfragen bleiben dabei liegen“ — grammatical, mild
repetition, acceptable. A stop-slop pass in Task 6 smooths anything jarring; do not add per-combo
special-casing unless the pass flags it.

- [ ] **Step 4: Run tests → PASS**

Run: `npx vitest run src/lib/prozessCheck.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/prozessCheck.ts src/lib/prozessCheck.test.ts
git commit -m "feat(prozess-check): mirrored result copy + copy-guard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Wizard components (Question, ProzessCheck, Result)

**Files:**
- Create: `src/components/prozess-check/Question.tsx`
- Create: `src/components/prozess-check/Result.tsx`
- Create: `src/components/prozess-check/ProzessCheck.tsx`
- Test: `src/components/prozess-check/ProzessCheck.test.tsx`

- [ ] **Step 1: Write the failing component test**

Create `src/components/prozess-check/ProzessCheck.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProzessCheck } from "./ProzessCheck";
import { STEPS } from "@/lib/prozessCheck";

// Click the option with the given visible label, advancing one step.
async function pick(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("button", { name: label }));
}

// Answer all five questions with the labels that produce category A (strong).
async function answerStrong(user: ReturnType<typeof userEvent.setup>) {
  await pick(user, "Anfragen beantworten und qualifizieren");
  await pick(user, "mehr als 5 Stunden");
  await pick(user, "Anfragen bleiben liegen oder springen ab");
  await pick(user, "Ja, ständig");
  await pick(user, "Noch nicht, ich weiß nicht, wo ich anfangen soll");
}

// Labels that produce category D (too small).
async function answerSmall(user: ReturnType<typeof userEvent.setup>) {
  await pick(user, "Anfragen beantworten und qualifizieren");
  await pick(user, "unter 1 Stunde");
  await pick(user, "Nichts geht verloren, es kostet mich nur Zeit");
  await pick(user, "Nein, das lasse ich im Betrieb");
  await pick(user, "Noch nicht, ich weiß nicht, wo ich anfangen soll");
}

describe("ProzessCheck", () => {
  it("shows the first question and a progress counter", () => {
    render(<ProzessCheck calLink="team/vrelo/kennenlernen" />);
    expect(screen.getByText(`Frage 1 von ${STEPS.length}`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: STEPS[0].label })).toBeInTheDocument();
  });

  it("A: reaches a fitting result with the scheduler (Termin anzeigen)", async () => {
    const user = userEvent.setup();
    render(<ProzessCheck calLink="team/vrelo/kennenlernen" />);
    await answerStrong(user);
    expect(screen.getByText(/Eine klare Quelle/)).toBeInTheDocument();
    expect(screen.getByText(/Ein Erstgespräch lohnt sich für dich/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Termin anzeigen" })).toBeInTheDocument();
  });

  it("D: honest not-yet result, no scheduler, soft newsletter link", async () => {
    const user = userEvent.setup();
    render(<ProzessCheck calLink="team/vrelo/kennenlernen" />);
    await answerSmall(user);
    expect(screen.getByText(/Noch zu klein/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Termin anzeigen" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Die Quelle/ })).toHaveAttribute("href", "/newsletter");
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npx vitest run src/components/prozess-check/ProzessCheck.test.tsx`
Expected: FAIL — components do not exist.

- [ ] **Step 3: Implement `Question.tsx`** (choice-only, accessible — adapted from lead-check)

Create `src/components/prozess-check/Question.tsx`:

```tsx
// src/components/prozess-check/Question.tsx
"use client";

import { useEffect, useRef } from "react";
import type { Step } from "@/lib/prozessCheck";

// Interactive boundaries clear WCAG 1.4.11 (3:1) on the bg-papier card: the
// border carries the affordance at 3.77:1 (vrelo-petrol/70 over papier), the
// gletscher/40 fill is a nicety — same tokens as the lead-check option button.
const optionClass =
  "w-full rounded-lg border border-vrelo-petrol/70 bg-gletscher/40 px-4 py-3 text-left text-tinte transition-colors hover:border-vrelo-petrol hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier";

export function Question({
  step,
  onAnswer,
  onBack,
  showBack,
}: {
  step: Step;
  onAnswer: (value: string) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const headingId = `pc-frage-${step.id}`;

  // Advancing unmounts whatever held focus, dropping it to <body>; move focus to
  // the new question so a keyboard user doesn't re-tab from the top each time.
  // Skipped on first mount so landing on the page doesn't yank the viewport down.
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step.id]);

  return (
    <div>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="text-balance text-2xl font-semibold text-tiefes-wasser outline-none md:text-3xl"
      >
        {step.label}
      </h2>

      {/* role=group + aria-labelledby ties the options to the question. */}
      <ul role="group" aria-labelledby={headingId} className="mt-6 space-y-3">
        {step.options.map((o) => (
          <li key={o.value}>
            <button type="button" className={optionClass} onClick={() => onAnswer(o.value)}>
              {o.label}
            </button>
          </li>
        ))}
      </ul>

      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-stumm underline-offset-4 hover:text-tiefes-wasser hover:underline"
        >
          {"← Zurück"}
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Implement `Result.tsx`**

Create `src/components/prozess-check/Result.tsx`:

```tsx
// src/components/prozess-check/Result.tsx
"use client";

import Link from "next/link";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { RESULT_UI, type ResultCopy } from "@/lib/prozessCheck";

export function Result({ copy, calLink }: { copy: ResultCopy; calLink: string | undefined }) {
  return (
    <div className="space-y-8">
      <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stumm">{RESULT_UI.resultLabel}</h2>
        <p className="mt-3 text-balance font-serif text-2xl text-tiefes-wasser md:text-3xl">{copy.headline}</p>
        <p className="mt-4 text-pretty text-tinte">{copy.body}</p>
        <p className="mt-6 font-medium text-tiefes-wasser">{copy.verdict}</p>
      </div>

      {copy.fits ? (
        <div className="rounded-2xl bg-vrelo-petrol p-8 md:p-10">
          <p className="text-balance font-serif text-xl text-papier md:text-2xl">{RESULT_UI.schedulerPrompt}</p>
          <div className="mt-6">
            <SchedulerEmbed
              calLink={calLink}
              prompt=""
              fallbackHint={RESULT_UI.schedulerFallbackHint}
              fallbackHref="/kontakt"
            />
          </div>
        </div>
      ) : (
        <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
          <p className="text-pretty text-tinte">{RESULT_UI.exitLead}</p>
          <p className="mt-4 text-pretty text-tinte">
            {RESULT_UI.exitNewsletterPrefix}
            <Link
              href="/newsletter"
              className="text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser"
            >
              {RESULT_UI.exitNewsletterLabel}
            </Link>
            {RESULT_UI.exitNewsletterSuffix}
            <Link
              href="/ratgeber"
              className="text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser"
            >
              {RESULT_UI.exitRatgeberLabel}
            </Link>
            {RESULT_UI.exitSuffix}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Implement `ProzessCheck.tsx`** (wizard)

Create `src/components/prozess-check/ProzessCheck.tsx`:

```tsx
// src/components/prozess-check/ProzessCheck.tsx
"use client";

import { useState } from "react";
import { STEPS, resultCopy, type ProzessCheckAnswers } from "@/lib/prozessCheck";
import { Question } from "./Question";
import { Result } from "./Result";

export function ProzessCheck({ calLink }: { calLink: string | undefined }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<ProzessCheckAnswers>>({});

  if (index >= STEPS.length) {
    // Every step is required and advances on click, so answers are complete here.
    // Defaults exist only for type-safety.
    const final: ProzessCheckAnswers = {
      aufgabe: answers.aufgabe ?? "anfragen",
      zeit: answers.zeit ?? "1bis3",
      konsequenz: answers.konsequenz ?? "liegen",
      abende: answers.abende ?? "abundzu",
      versucht: answers.versucht ?? "garnicht",
    };
    return <Result copy={resultCopy(final)} calLink={calLink} />;
  }

  const step = STEPS[index];

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    setIndex((i) => i + 1);
  };

  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <p role="status" aria-live="polite" className="text-sm text-stumm">
        Frage {index + 1} von {STEPS.length}
      </p>
      <div className="mt-4">
        <Question
          step={step}
          onAnswer={handleAnswer}
          onBack={() => setIndex((i) => Math.max(0, i - 1))}
          showBack={index > 0}
        />
      </div>
    </div>
  );
}
```

Byte-verify + repair German quotes in all three `.tsx` files (the „Die Quelle“ label + `Result` copy
come from the module, but re-check anyway).

- [ ] **Step 6: Run the component test → PASS**

Run: `npx vitest run src/components/prozess-check/ProzessCheck.test.tsx` → PASS.
If `userEvent`/`@testing-library/user-event` is absent, use `fireEvent.click` from
`@testing-library/react` instead (check an existing interactive test first, e.g. a `/demo` test).

- [ ] **Step 7: Commit**

```bash
git add src/components/prozess-check/
git commit -m "feat(prozess-check): wizard, question and result components

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Route page + focus-route registration

**Files:**
- Create: `src/app/prozess-check/page.tsx`
- Modify: `src/lib/nav.ts`

- [ ] **Step 1: Register the focus route**

Edit `src/lib/nav.ts`:

Add `/prozess-check` to `focusRoutes`:

```ts
export const focusRoutes: string[] = ["/makler", "/lead-check", "/prozess-check"];
```

Add its chrome config (small Erstgespräch CTA → `/kontakt`, mirroring `/makler`):

```ts
export const focusChrome: Record<string, { cta?: FocusCta }> = {
  "/makler": {
    cta: { href: "#termin", label: "Erstgespräch vereinbaren", short: "Erstgespräch" },
  },
  "/lead-check": {},
  "/prozess-check": {
    cta: { href: "/kontakt", label: "Erstgespräch vereinbaren", short: "Erstgespräch" },
  },
};
```

Byte-verify German quotes in `src/lib/nav.ts` (the label „Erstgespräch…“ has no German quote chars, but
re-check umlaut bytes are intact).

- [ ] **Step 2: Create the page**

Create `src/app/prozess-check/page.tsx` (mirrors `/lead-check`, `noindex`, reuses the banner):

```tsx
// src/app/prozess-check/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProzessCheck } from "@/components/prozess-check/ProzessCheck";
import { calLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Prozess-Check",
  description:
    "In 60 Sekunden findest du heraus, welche Aufgabe dich am meisten kostet – und ob sich ein Prozess-Audit für dich lohnt. Fünf Fragen, kein Login.",
  robots: { index: false, follow: false },
};

export default function ProzessCheckPage() {
  return (
    <>
      <PageHero
        title="Lohnt sich das für deinen Betrieb?"
        src="/images/lead-check-banner.webp"
        lead="Fünf kurze Fragen, und du weißt, welche Aufgabe dich am meisten kostet – und ob ein Prozess-Audit für dich der richtige nächste Schritt ist. Kein Login, dein Ergebnis sofort."
      />
      {/* Same faint cool band as /lead-check so the warm paper card lifts off. */}
      <div className="-mt-10 bg-gletscher/30 md:-mt-12">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-4 md:pb-32 md:pt-6">
          <ProzessCheck calLink={calLink()} />
        </div>
      </div>
    </>
  );
}
```

Byte-verify + repair German quotes in `src/app/prozess-check/page.tsx` (the `lead`/`title`/`description`
have umlauts + en-dashes; no „…“ pairs, but confirm the en-dash is U+2013 not U+2014).

- [ ] **Step 3: Verify the route + focus chrome**

Run: `npx tsc --noEmit` → clean.
Run: `npm run build` → `/prozess-check` compiles; confirm it is **not** in the sitemap (sitemap.ts uses
an explicit allow-list that omits it — no change needed).

- [ ] **Step 4: Commit**

```bash
git add src/app/prozess-check/page.tsx src/lib/nav.ts
git commit -m "feat(prozess-check): noindex focus-route page + chrome

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Entry link on the /leistungen ProzessAudit block

**Files:**
- Modify: `src/lib/prozess-audit.ts`
- Modify: `src/lib/prozess-audit.test.ts`
- Modify: `src/components/leistungen/ProzessAudit.tsx`
- Modify: `src/components/leistungen/ProzessAudit.test.tsx`

- [ ] **Step 1: Write the failing copy + component assertions**

In `src/lib/prozess-audit.test.ts`, add inside `describe("prozess-audit copy", …)`:

```ts
  it("offers the Prozess-Check as a secondary on-ramp to /prozess-check", () => {
    expect(prozessAudit.check.href).toBe("/prozess-check");
    expect(prozessAudit.check.label.length).toBeGreaterThan(0);
  });
```

In `src/components/leistungen/ProzessAudit.test.tsx`, add:

```ts
  it("links the secondary Prozess-Check on-ramp to /prozess-check", () => {
    render(<ProzessAudit />);
    const link = screen.getByRole("link", { name: prozessAudit.check.label });
    expect(link).toHaveAttribute("href", "/prozess-check");
  });
```

- [ ] **Step 2: Run to confirm both fail**

Run: `npx vitest run src/lib/prozess-audit.test.ts src/components/leistungen/ProzessAudit.test.tsx`
Expected: FAIL — `check` does not exist.

- [ ] **Step 3: Add the `check` field to the copy module**

Edit `src/lib/prozess-audit.ts`:

Add to the `ProzessAudit` type (after `cta`):

```ts
  check: { label: string; href: string };
```

Add to the `prozessAudit` object (after `cta`):

```ts
  check: { label: "Unsicher, ob sich das lohnt? Mach den 60-Sekunden-Check.", href: "/prozess-check" },
```

Byte-verify + repair German quotes in `src/lib/prozess-audit.ts`.

- [ ] **Step 4: Render the secondary link**

Edit `src/components/leistungen/ProzessAudit.tsx` — replace the CTA block:

```tsx
      <div className="mt-8">
        <CTAButton href={o.cta.href} tone="dark">
          {o.cta.label}
        </CTAButton>
      </div>
```

with:

```tsx
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <CTAButton href={o.cta.href} tone="dark">
          {o.cta.label}
        </CTAButton>
        <Link
          href={o.check.href}
          className="text-sm font-medium text-gletscher underline underline-offset-4 hover:text-papier"
        >
          {o.check.label}
        </Link>
      </div>
```

Add the import at the top of the file:

```tsx
import Link from "next/link";
```

- [ ] **Step 5: Run tests → PASS**

Run: `npx vitest run src/lib/prozess-audit.test.ts src/components/leistungen/ProzessAudit.test.tsx`
→ PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/prozess-audit.ts src/lib/prozess-audit.test.ts src/components/leistungen/ProzessAudit.tsx src/components/leistungen/ProzessAudit.test.tsx
git commit -m "feat(prozess-check): secondary on-ramp from the /leistungen block

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Full verification, browser smoke, stop-slop pass

**Files:** none new — verification + copy polish only.

- [ ] **Step 1: Full test suite + type-check + lint + build**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

All green. Fix any regression before proceeding.

- [ ] **Step 2: Browser smoke (manual)**

Run `npm start`. Then:
- `/prozess-check` renders the hero + first question; the focus header shows the Erstgespräch CTA.
- Walk to an **A** result → the petrol scheduler card with „Termin anzeigen“ appears.
- Walk to a **D** result → no scheduler; the „Die Quelle“/Ratgeber soft links show.
- `/leistungen` ProzessAudit block shows the secondary „60-Sekunden-Check“ link → navigates to
  `/prozess-check`.
- Confirm no horizontal scroll at 390px; the „← Zurück“ control works.

- [ ] **Step 3: stop-slop pass on the German result copy**

Read the four `resultCopy` bodies + `RESULT_UI` as a block and run the `stop-slop` skill's checks
(Brand.md wins on conflict — keep the spaced en-dash „ – “). Target the A/B mirror seam and any
formulaic „nicht X, sondern Y“ or throat-clearing. Apply edits in `src/lib/prozessCheck.ts`, re-run
byte-verify + `npx vitest run src/lib/prozessCheck.test.ts`, and commit if anything changed:

```bash
git add src/lib/prozessCheck.ts
git commit -m "copy(prozess-check): stop-slop pass on the result bodies

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 4: Finish the branch**

Use superpowers:finishing-a-development-branch (verify tests pass → merge `feat/prozess-check-quiz` to
`main`, which auto-deploys to production). Do **not** stage the unrelated dirty newsletter files.

---

## Self-review checklist (done while writing)

- **Spec coverage:** five questions (T1), categorization A/B/C/D (T1), mirrored result + no-number/price
  guards (T2), scheduler on A/B/C + soft exit on D (T3), noindex focus route + header CTA (T4), reuse
  banner (T4), entry link (T5), stop-slop + brand bytes (T6). ✅
- **Type consistency:** `Category`, `ProzessCheckAnswers`, `Step`, `ResultCopy`, `RESULT_UI` names match
  across tasks; `resultCopy`/`categorize`/`severity` signatures stable. ✅
- **No placeholders:** every code step carries full code; German copy is final (subject to the T6
  stop-slop polish). ✅
