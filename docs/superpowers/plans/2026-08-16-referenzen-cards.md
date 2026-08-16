# Referenzen-Karten Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two anonymized reference cards (Velp + MDZ builds) — full on `/leistungen`, compact on the homepage `Proof` section — from one shared data module, replacing both "references coming soon" placeholders.

**Architecture:** One typed data module (`src/lib/referenzen.ts`) holds the two projects as German content; a copy-guard test enforces the brand punctuation + no-price rules; one `ReferenzCard` component renders a `full` or `compact` variant; `/leistungen`'s `Referenzen.tsx` renders two `full` cards and the homepage `Proof.tsx` renders two `compact` cards.

**Tech Stack:** Next.js 16 (App Router, RSC) · TypeScript · Tailwind v4 (`@theme` tokens) · Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-16-referenzen-cards-design.md`

**Branch:** `feat/referenzen-cards` (already checked out; the spec is already committed on it).

---

## Conventions the engineer must know (read before Task 1)

- **German punctuation is byte-fragile.** The Write/Edit tools silently downgrade the closing German quote (U+201C `"`) to ASCII `"` and can corrupt code-escapes. The card content strings in this plan use **no inner German quotes**, so this mostly won't bite — but the **en-dash** „ – " (U+2013) inside sentences must stay U+2013, never a hyphen or em-dash. After writing any German file, run the verify command shown in that task and fix before committing.
- **`@/` is the path alias** for `src/` (e.g. `@/components/Section`).
- **Tokens only, no hand-rolled colors.** Card uses `card-depth`, `bg-papier`, `text-tinte`, `text-tiefes-wasser`, `text-stumm`, `text-vrelo-petrol`, `border-tinte/10` — all defined in `src/app/globals.css`.
- **Commands** (run inside `Website/`): `npm test` (Vitest, single run) · `npx tsc --noEmit` · `npm run lint` · `npm run build`. Run a single test file with `npm test -- src/lib/referenzen.test.ts`.
- The card content strings contain **no currency and no prices** (site rule) — the copy-guard test enforces it.

---

## File Structure

- **Create** `src/lib/referenzen.ts` — the two projects as typed data (`Referenz[]`). Single source of truth.
- **Create** `src/lib/referenzen.test.ts` — copy-guard (brand punctuation, no gendered forms, no currency).
- **Create** `src/components/referenzen/ReferenzCard.tsx` — one card, `variant: "full" | "compact"`.
- **Create** `src/components/referenzen/ReferenzCard.test.tsx` — variant rendering.
- **Rewrite** `src/components/leistungen/Referenzen.tsx` — heading + intro + two `full` cards.
- **Create** `src/components/leistungen/Referenzen.test.tsx` — both cards render on the section.
- **Modify** `src/components/home/Proof.tsx` — replace the trailing "Erste Kundenreferenzen folgen…" paragraph with two `compact` cards.
- **Modify** `src/components/home/Proof.test.tsx` — swap the "coming soon" assertion for the two compact card titles.

---

## Task 1: Data module `referenzen.ts`

**Files:**
- Create: `src/lib/referenzen.ts`
- Test: `src/lib/referenzen.test.ts`

- [ ] **Step 1: Write the failing copy-guard test**

Create `src/lib/referenzen.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { referenzen } from "./referenzen";

// Walk the copy object and collect every string, so the guards below cover
// every field of every card without listing them by hand. (Same pattern as
// makler.test.ts.)
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(referenzen);

// No Vrelo price ever appears on the site, and these anonymized cards name no
// figure with a currency at all.
const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("referenzen copy", () => {
  it("ships exactly two anonymized cards with unique slugs", () => {
    expect(referenzen).toHaveLength(2);
    const slugs = referenzen.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(2);
  });

  it("gives every card all content fields", () => {
    for (const r of referenzen) {
      for (const field of ["label", "titel", "problem", "gebaut", "laeuft", "ergebnis", "kennzahl", "kennzahlLabel"] as const) {
        expect(r[field].length).toBeGreaterThan(0);
      }
    }
  });

  it("uses German quotes, never ASCII double quotes", () => {
    expect(all.filter((s) => s.includes('"'))).toEqual([]);
  });

  it("uses the en-dash, never the em-dash", () => {
    expect(all.filter((s) => s.includes("—"))).toEqual([]);
  });

  it("pairs every opening German quote with a closing one", () => {
    for (const s of all) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });

  it("names no price or currency (site rule)", () => {
    expect(all.filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("uses generic masculine, no :innen gendered forms", () => {
    expect(all.filter((s) => /:innen\b/i.test(s))).toEqual([]);
  });

  it("keeps the client anonymous — no client names", () => {
    const forbidden = /velp|purisic|mdz|halilovic/i;
    expect(all.filter((s) => forbidden.test(s))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/referenzen.test.ts`
Expected: FAIL — `Failed to resolve import "./referenzen"` (module not created yet).

- [ ] **Step 3: Write the data module**

Create `src/lib/referenzen.ts`. **Type the en-dash as U+2013** (` – ` and `1–2`). No inner German quotes appear in these strings, so the string delimiters stay ASCII `"`.

```ts
export type Referenz = {
  slug: string;
  label: string; // anonymized "branch · region"
  titel: string; // one-line headline
  problem: string; // Das Problem
  gebaut: string; // Gebaut
  laeuft: string; // Läuft
  ergebnis: string; // the freier-Kopf close (also the compact result line)
  kennzahl: string; // the one honest number
  kennzahlLabel: string; // caption under the number
};

export const referenzen: Referenz[] = [
  {
    slug: "agentur",
    label: "Marketingagentur · Region Regensburg",
    titel: "Die Kundenübersicht steuert sich selbst.",
    problem:
      "Jeder neue Kunde durchlief dieselben Phasen – von Hand weitergeklickt, Aufgaben jedes Mal neu angelegt, Fristen manuell gesetzt. Das kostete täglich Zeit und ging leicht unter.",
    gebaut:
      "Ein System, das jede Kundenkarte automatisch weiterschaltet, sobald ihre Aufgaben erledigt sind – mit den passenden Aufgaben und Werktags-Fristen für die nächste Phase.",
    laeuft:
      "Seit Monaten still im Hintergrund, quer durch fünf Übersichten – ohne dass jemand eine Karte von Hand bewegt.",
    ergebnis:
      "Am Ende: ein freier Kopf. Ordnung und Struktur statt täglichem Nachhalten – ein verlässlicher Prozess, der den Betrieb im Hintergrund trägt.",
    kennzahl: "5 Übersichten",
    kennzahlLabel: "laufen von selbst",
  },
  {
    slug: "hausmeister",
    label: "Hausmeisterservice · Oberpfalz",
    titel: "Das Büro läuft per Sprachnachricht.",
    problem:
      "Der Inhaber ist den ganzen Tag auf seinen Objekten, selten am Schreibtisch. E-Mails, Termine, Aufgaben und Rechnungsdaten stapelten sich – und wurden abends nachgeholt.",
    gebaut:
      "Ein Assistent per Telegram: Er spricht unterwegs kurz hinein, der Rest passiert von selbst – E-Mail geschrieben und verschickt, Termin eingetragen, Aufgabe an einen Mitarbeiter, Notiz abgelegt, Rechnungsdaten erfasst.",
    laeuft:
      "Aus ein bis zwei Stunden Büroarbeit am Abend wird eine kurze Sprachnachricht zwischendurch.",
    ergebnis:
      "Am Ende: ein freier Kopf. Der Ablauf ist geordnet und läuft verlässlich – der Inhaber muss nicht mehr daran denken.",
    kennzahl: "1–2 Std./Tag",
    kennzahlLabel: "zurückgewonnen",
  },
];
```

- [ ] **Step 4: Verify German bytes are intact**

Run:
```bash
perl -CSD -ne 'print "$. : em-dash\n" while /\x{2014}/g' src/lib/referenzen.ts
grep -n 'pipeline' -i src/lib/referenzen.ts
```
Expected: both print **nothing** (no em-dash; no leftover "pipeline"). If an em-dash is found, replace that one line's `—` with ` – ` (U+2013) by hand.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/lib/referenzen.test.ts`
Expected: PASS (all cases green).

- [ ] **Step 6: Commit**

```bash
git add src/lib/referenzen.ts src/lib/referenzen.test.ts
git commit -m "feat: referenzen data module + copy-guard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `ReferenzCard` component

**Files:**
- Create: `src/components/referenzen/ReferenzCard.tsx`
- Test: `src/components/referenzen/ReferenzCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/referenzen/ReferenzCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReferenzCard } from "./ReferenzCard";
import { referenzen } from "@/lib/referenzen";

const agentur = referenzen[0];

describe("ReferenzCard", () => {
  it("full variant shows label, title, all three beats, the ergebnis and the number", () => {
    render(<ReferenzCard referenz={agentur} variant="full" />);
    expect(screen.getByText(agentur.label)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: agentur.titel })).toBeInTheDocument();
    for (const beat of ["Das Problem", "Gebaut", "Läuft"]) {
      expect(screen.getByText(beat)).toBeInTheDocument();
    }
    expect(screen.getByText(agentur.problem)).toBeInTheDocument();
    expect(screen.getByText(agentur.ergebnis)).toBeInTheDocument();
    expect(screen.getByText(agentur.kennzahl)).toBeInTheDocument();
    expect(screen.getByText(agentur.kennzahlLabel)).toBeInTheDocument();
  });

  it("compact variant shows title, ergebnis and number but omits the beats", () => {
    render(<ReferenzCard referenz={agentur} variant="compact" />);
    expect(screen.getByRole("heading", { name: agentur.titel })).toBeInTheDocument();
    expect(screen.getByText(agentur.ergebnis)).toBeInTheDocument();
    expect(screen.getByText(agentur.kennzahl)).toBeInTheDocument();
    expect(screen.queryByText("Das Problem")).toBeNull();
    expect(screen.queryByText(agentur.problem)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/referenzen/ReferenzCard.test.tsx`
Expected: FAIL — `Failed to resolve import "./ReferenzCard"`.

- [ ] **Step 3: Write the component**

Create `src/components/referenzen/ReferenzCard.tsx`. Server component (no `"use client"`). Default surface is opaque `bg-papier`; a caller on a warm/frosted section can override via `className`.

```tsx
import type { Referenz } from "@/lib/referenzen";

type Props = {
  referenz: Referenz;
  variant: "full" | "compact";
  /** Surface override — defaults to opaque papier. Proof passes a frosted glass bg. */
  className?: string;
};

export function ReferenzCard({ referenz, variant, className }: Props) {
  const beats: Array<{ term: string; body: string }> =
    variant === "full"
      ? [
          { term: "Das Problem", body: referenz.problem },
          { term: "Gebaut", body: referenz.gebaut },
          { term: "Läuft", body: referenz.laeuft },
        ]
      : [];

  return (
    <article
      className={`card-depth flex h-full flex-col rounded-2xl border border-tinte/10 p-7 ${
        className ?? "bg-papier"
      }`}
    >
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">{referenz.label}</p>
      <h3 className="mt-3 text-balance text-xl font-semibold text-tiefes-wasser">{referenz.titel}</h3>

      {beats.length > 0 ? (
        <div className="mt-5 space-y-4">
          {beats.map((b) => (
            <div key={b.term}>
              <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{b.term}</p>
              <p className="mt-1 text-pretty text-tinte">{b.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-5 text-pretty font-medium text-tinte">{referenz.ergebnis}</p>

      {/* The one honest number, set off by a hairline. mt-auto pushes it to the
          card foot so cards in a grid line their numbers up regardless of body length. */}
      <div className="mt-auto flex items-baseline gap-2 border-t border-tinte/10 pt-5">
        <span className="text-2xl font-semibold text-vrelo-petrol">{referenz.kennzahl}</span>
        <span className="text-sm text-stumm">{referenz.kennzahlLabel}</span>
      </div>
    </article>
  );
}
```

Note: `h-full` makes the article fill its grid cell, and `mt-auto` on the number block pins it to the card foot so the numbers line up across cards of unequal body length. The `pt-5` above the hairline keeps a gap when a body nearly fills the card. (Do **not** also add a fixed `margin-top` here — it would conflict with `mt-auto`.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/referenzen/ReferenzCard.test.tsx`
Expected: PASS (both variants).

- [ ] **Step 5: Commit**

```bash
git add src/components/referenzen/ReferenzCard.tsx src/components/referenzen/ReferenzCard.test.tsx
git commit -m "feat: ReferenzCard component (full + compact variants)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `/leistungen` — two full cards

**Files:**
- Rewrite: `src/components/leistungen/Referenzen.tsx`
- Test: `src/components/leistungen/Referenzen.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/leistungen/Referenzen.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Referenzen } from "./Referenzen";
import { referenzen } from "@/lib/referenzen";

describe("Referenzen (leistungen)", () => {
  it("renders a section heading and both full reference cards", () => {
    render(<Referenzen />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    for (const r of referenzen) {
      expect(screen.getByRole("heading", { name: r.titel })).toBeInTheDocument();
      expect(screen.getByText(r.problem)).toBeInTheDocument();
    }
  });

  it("drops the old 'coming soon' placeholder", () => {
    render(<Referenzen />);
    expect(screen.queryByText(/Bald: Stimmen aus echten Betrieben/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/leistungen/Referenzen.test.tsx`
Expected: FAIL — the old `Referenzen` renders the placeholder, so `getByRole("heading", { name: r.titel })` throws "unable to find".

- [ ] **Step 3: Rewrite the component**

Replace the entire contents of `src/components/leistungen/Referenzen.tsx` with:

```tsx
import { Section } from "@/components/Section";
import { ReferenzCard } from "@/components/referenzen/ReferenzCard";
import { referenzen } from "@/lib/referenzen";

export function Referenzen() {
  return (
    <Section tone="paper">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Aus echten Betrieben</p>
      <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        Zwei Betriebe, zwei Aufgaben weniger.
      </h2>
      <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
        Zwei Beispiele aus laufenden Systemen – anonym, aber echt. So sieht es aus, wenn eine
        wiederkehrende Aufgabe vom Tisch ist.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {referenzen.map((r) => (
          <li key={r.slug}>
            <ReferenzCard referenz={r} variant="full" />
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

- [ ] **Step 4: Verify German bytes are intact**

Run:
```bash
perl -CSD -ne 'print "$. : ascii-quote\n" while /"/g' src/components/leistungen/Referenzen.tsx
perl -CSD -ne 'print "$. : em-dash\n" while /\x{2014}/g' src/components/leistungen/Referenzen.tsx
```
Expected: **nothing** for em-dash. The ascii-quote check will list the JSX/className `"` lines — that is fine; just confirm the German prose (heading + intro) contains no ASCII `"` and uses ` – ` (U+2013) for the dash.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/leistungen/Referenzen.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/leistungen/Referenzen.tsx src/components/leistungen/Referenzen.test.tsx
git commit -m "feat: two full reference cards on /leistungen

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Homepage `Proof` — two compact cards

**Files:**
- Modify: `src/components/home/Proof.tsx`
- Modify: `src/components/home/Proof.test.tsx`

- [ ] **Step 1: Update the test first (it will fail against the current component)**

In `src/components/home/Proof.test.tsx`, replace the whole file with:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Proof } from "./Proof";
import { referenzen } from "@/lib/referenzen";

describe("Proof", () => {
  it("renders the heading and four value cards", () => {
    render(<Proof />);
    expect(
      screen.getByRole("heading", { name: /Sorgfältig gebaut\. Verlässlich im Betrieb\./i }),
    ).toBeInTheDocument();
    for (const title of [
      "Ein Ansprechpartner.",
      "Praxiserprobt.",
      "Maßgeschneidert statt von der Stange.",
      "Du wartest nichts.",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("renders the two compact reference cards instead of the coming-soon line", () => {
    render(<Proof />);
    for (const r of referenzen) {
      expect(screen.getByRole("heading", { name: r.titel })).toBeInTheDocument();
      expect(screen.getByText(r.kennzahl)).toBeInTheDocument();
    }
    expect(screen.queryByText(/Erste Kundenreferenzen folgen/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/home/Proof.test.tsx`
Expected: FAIL — the current `Proof` still renders "Erste Kundenreferenzen folgen" and no card titles.

- [ ] **Step 3: Edit the component**

In `src/components/home/Proof.tsx`:

(a) Add imports at the top, after the existing `Reveal` import:

```tsx
import { ReferenzCard } from "@/components/referenzen/ReferenzCard";
import { referenzen } from "@/lib/referenzen";
```

(b) Replace the trailing footnote paragraph — the block:

```tsx
      <Reveal as="p" delayMs={240} className="mx-auto mt-8 max-w-xl text-center text-sm text-tinte">
        Erste Kundenreferenzen folgen, sobald die laufenden Projekte abgeschlossen sind.
      </Reveal>
```

with the two compact cards (frosted papier to match the section's value tiles):

```tsx
      <Reveal as="ul" delayMs={240} className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
        {referenzen.map((r) => (
          <li key={r.slug}>
            <ReferenzCard referenz={r} variant="compact" className="bg-papier/85 backdrop-blur-sm" />
          </li>
        ))}
      </Reveal>
```

Leave the heading, intro and the four value tiles above exactly as they are.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/home/Proof.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/Proof.tsx src/components/home/Proof.test.tsx
git commit -m "feat: two compact reference cards in homepage Proof

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Full gate + browser check

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: PASS (all files, including the four new/updated ones). If an unrelated pre-existing test fails, note it but do not fix it in this branch.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Browser check at 1440 + 390**

Run: `npm start` (per the CLAUDE.md gotcha — use `npm start`, not `npm run dev`, for manual checks). Open `/` and `/leistungen`.
Verify:
- Two cards sit **side by side** on desktop (`sm:grid-cols-2`) and **stack** at 390px.
- On `/leistungen` the full cards show Das Problem / Gebaut / Läuft, the ergebnis line, and the number lines up at the card foot on both cards.
- On the homepage `Proof` section the compact cards read cleanly on the warm Fließen backdrop (frosted papier, text legible — this is the one on-image spot to eyeball for contrast).
- No horizontal scroll; no layout shift.

- [ ] **Step 6: Final commit (only if the browser check prompted any tweak)**

```bash
git add -A
git commit -m "chore: browser-check tweaks for reference cards

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Done criteria

- `src/lib/referenzen.ts` is the single source; both pages import it.
- `/leistungen` shows two full cards; homepage `Proof` shows two compact cards; both placeholders gone.
- `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build` all green.
- German punctuation verified (no em-dash, no ASCII quotes in German prose, en-dash intact).
- Merge via `superpowers:finishing-a-development-branch` (push to `main` auto-deploys — the reference cards go live on deploy).

## Notes for the merge step

- This branch was cut from `main` while the working tree carried **unrelated** uncommitted changes (impeccable skill, newsletter tweaks, CLAUDE.md). Only the files listed in this plan belong to this branch — do not stage the others.
- HQ follow-ups once live (not part of this branch): tell HQ `CLAUDE.md` §7 the Referenz-Sektion skeleton is filled (Velp + MDZ, anonymous); and when Alen / the MDZ owner OK being named, revisit the labels.
