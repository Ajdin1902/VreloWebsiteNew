# Prozess-Audit Leistungen block — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a price-free „Der Prozess-Audit“ on-ramp block to `/leistungen` that sells the paid process audit by outcome and routes to the free Erstgespräch.

**Architecture:** Follows the site's established offer-block pattern: a typed, price-free copy module (`src/lib/prozess-audit.ts`) is the single source of German copy; a presentational Server Component (`src/components/leistungen/ProzessAudit.tsx`) renders it; the page composes it inside a `Section`. A copy-guard test enforces the brand/compliance rules (no price, no mechanism, German typography); a component test locks the render + the CTA target.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind v4 (`@theme` tokens), Vitest + React Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-08-11-prozess-audit-design.md` (build scope = §5, the website block only).

---

## File Structure

- **Create** `src/lib/prozess-audit.ts` — typed, price-free copy object. One responsibility: hold the German copy for the block.
- **Create** `src/lib/prozess-audit.test.ts` — copy-guard: no price, no mechanism term, German quotes, en-dash, CTA target.
- **Create** `src/components/leistungen/ProzessAudit.tsx` — presentational on-dark card. No German strings of its own.
- **Create** `src/components/leistungen/ProzessAudit.test.tsx` — render + CTA-href assertions.
- **Modify** `src/app/leistungen/page.tsx` — import and render the block after `<MehrMoeglich />`, before `<Referenzen />`.

### Design decisions locked here
- **On-dark card in a petrol `Section`**, pulled up with `-mt-24 md:-mt-32` so it butts `MehrMoeglich` (both petrol → one region), giving a clean petrol→paper divider into the paper `Referenzen` below. AA on petrol: heading `papier`, body/labels `gletscher` (7:1), label badge navy-on-amber, CTA `tone="dark"` (per HQ AA notes — never `stumm`/`stein` on petrol).
- **Secondary to the flagship:** heading is `2xl`/`3xl` (not the flagship's `3xl`/`4xl`), no giant serif promise line; a faint `ring-amber/25` marks it as actionable without turning it into a second flagship.
- **CTA → `/kontakt`** (the free Erstgespräch; `/kontakt` carries the scheduler), label „Kostenloses Erstgespräch“.

---

## Task 1: Copy module + copy-guard test

**Files:**
- Create: `src/lib/prozess-audit.ts`
- Test: `src/lib/prozess-audit.test.ts`

- [ ] **Step 1: Write the failing copy-guard test**

Create `src/lib/prozess-audit.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { prozessAudit } from "./prozess-audit";

// Walk the copy object and collect every string so the guards cover the
// deliverables array and nested cta without listing them by hand.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(prozessAudit);

// The Prozess-Audit block names NO price at all (stricter than /makler, which
// permits the one server-cost figure). The €499 lives only in the sales call.
const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("prozess-audit copy", () => {
  it("collects a body of copy", () => {
    expect(all.length).toBeGreaterThan(8);
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

  it("names no price anywhere", () => {
    expect(all.filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("never names the mechanism", () => {
    expect(all.filter((s) => /\bn8n\b|claude/i.test(s))).toEqual([]);
  });

  it("routes the CTA to the free Erstgespräch at /kontakt", () => {
    expect(prozessAudit.cta.href).toBe("/kontakt");
  });

  it("lists the five handbook inclusions", () => {
    expect(prozessAudit.deliverables).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/prozess-audit.test.ts`
Expected: FAIL — cannot resolve `./prozess-audit` (module does not exist yet).

- [ ] **Step 3: Write the copy module**

Create `src/lib/prozess-audit.ts`. **Type the German quotes as „ … “ (U+201E/U+201C) and the Gedankenstrich as a spaced en-dash „ – “ (U+2013).** The Write tool silently downgrades the closing quote — Step 4 (the guard) will catch it if it happened.

```ts
// Public, price-free copy for the "Der Prozess-Audit" on-ramp block on
// /leistungen. The paid audit (€499, fully credited) and the handbook structure
// live in HQ: docs/superpowers/specs/2026-08-11-prozess-audit-design.md. This
// block sells the outcome and routes to the free Erstgespräch; the price is
// named only in that call. No mechanism (Claude/n8n) — that is how Vrelo builds.
export type ProzessAudit = {
  label: string;
  heading: string;
  body: string;
  deliverableLabel: string;
  deliverables: string[];
  guarantee: string;
  cta: { label: string; href: string };
};

export const prozessAudit: ProzessAudit = {
  label: "Nicht sicher, wo du anfangen sollst?",
  heading: "Der Prozess-Audit – ich finde die eine Aufgabe, die dich am meisten kostet.",
  body: "Du merkst, dass Zeit und Anfragen durchrutschen – aber nicht, wo genau. Im Prozess-Audit schaue ich mir deine Abläufe an und du bekommst ein fertiges Handbuch: schwarz auf weiß, wo du am meisten verlierst und wie dein Tag ohne diese Aufgabe aussieht. Wenn du danach baust, ist der Audit für dich kostenlos.",
  deliverableLabel: "Das bekommst du",
  deliverables: [
    "Deine Abläufe, sauber kartiert",
    "Die Aufgabe, die dich am meisten kostet – mit Zahlen",
    "Ein Bild, wie dein Tag danach aussieht",
    "Ein klarer Fahrplan: was zuerst, was danach",
    "Was es kostet und wie lange es dauert",
  ],
  guarantee: "Zeigt dir der Fahrplan keine konkrete, lohnende Automatisierung, bekommst du dein Geld zurück.",
  cta: { label: "Kostenloses Erstgespräch", href: "/kontakt" },
};
```

> The plain `"` in the code above are the literal ASCII quotes that DELIMIT each TypeScript string — correct. Inside them, wrap the German phrases in „ … “ where the draft copy shows them (label, heading, body, etc. carry no inner quotes here, so none are needed). The en-dashes shown as ` – ` must be U+2013.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/lib/prozess-audit.test.ts`
Expected: PASS (8 assertions). If the quote-pairing or ASCII-quote guard fails, a Write downgrade slipped in — repair with codepoint escapes and re-run:
`perl -CSD -i -pe 's/\x{201E}([^\x{201E}"]*)"/\x{201E}$1\x{201C}/g; s/\x{2014}/\x{2013}/g' src/lib/prozess-audit.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/prozess-audit.ts src/lib/prozess-audit.test.ts
git commit -m "feat: add price-free Prozess-Audit copy module + copy-guard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: ProzessAudit component + render test

**Files:**
- Create: `src/components/leistungen/ProzessAudit.tsx`
- Test: `src/components/leistungen/ProzessAudit.test.tsx`

- [ ] **Step 1: Write the failing render test**

Create `src/components/leistungen/ProzessAudit.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProzessAudit } from "./ProzessAudit";
import { prozessAudit } from "@/lib/prozess-audit";

describe("ProzessAudit", () => {
  it("renders the heading", () => {
    render(<ProzessAudit />);
    expect(screen.getByRole("heading", { name: prozessAudit.heading })).toBeInTheDocument();
  });

  it("renders all five handbook inclusions", () => {
    render(<ProzessAudit />);
    for (const item of prozessAudit.deliverables) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("shows the guarantee", () => {
    render(<ProzessAudit />);
    expect(screen.getByText(prozessAudit.guarantee)).toBeInTheDocument();
  });

  it("links the CTA to the free Erstgespräch", () => {
    render(<ProzessAudit />);
    const cta = screen.getByRole("link", { name: prozessAudit.cta.label });
    expect(cta).toHaveAttribute("href", "/kontakt");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/leistungen/ProzessAudit.test.tsx`
Expected: FAIL — cannot resolve `./ProzessAudit`.

- [ ] **Step 3: Write the component**

Create `src/components/leistungen/ProzessAudit.tsx`. On-dark tokens per HQ AA notes (heading `papier`, body/labels `gletscher`, label badge navy-on-amber, CTA `tone="dark"`):

```tsx
import { CTAButton } from "@/components/CTAButton";
import { prozessAudit } from "@/lib/prozess-audit";

// The paid-audit on-ramp on /leistungen, placed right after the MehrMoeglich
// capstone: for the visitor unsure where to start, a structured Prozess-Audit
// that ends in a process handbook. Price-free (site convention); routes to the
// free Erstgespräch where the fee is named. A dark card that is quieter than the
// flagship Termin-Quelle block (smaller heading, no serif promise) so it reads
// as a secondary on-ramp, not a second flagship.
export function ProzessAudit() {
  const o = prozessAudit;
  return (
    <div className="card-depth mx-auto max-w-3xl rounded-2xl bg-tiefes-wasser/40 p-8 ring-1 ring-amber/25 md:p-10">
      <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-semibold uppercase tracking-wide text-tiefes-wasser">
        {o.label}
      </span>
      <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-papier md:text-3xl">
        {o.heading}
      </h2>
      <p className="mt-4 max-w-2xl text-pretty text-gletscher">{o.body}</p>

      <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-gletscher">
        {o.deliverableLabel}
      </p>
      <ul className="mt-4 grid gap-3">
        {o.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-3 text-gletscher">
            <span aria-hidden="true" className="mt-1 text-amber">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 max-w-2xl text-pretty text-sm italic text-gletscher">{o.guarantee}</p>

      <div className="mt-8">
        <CTAButton href={o.cta.href} tone="dark">
          {o.cta.label}
        </CTAButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/leistungen/ProzessAudit.test.tsx`
Expected: PASS (4 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/components/leistungen/ProzessAudit.tsx src/components/leistungen/ProzessAudit.test.tsx
git commit -m "feat: add ProzessAudit on-dark on-ramp card

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Integrate into the Leistungen page

**Files:**
- Modify: `src/app/leistungen/page.tsx`

`Section` and `Reveal` are already imported in this file; only the new component import and the render block are added.

- [ ] **Step 1: Add the component import**

In `src/app/leistungen/page.tsx`, add this import next to the other `@/components/leistungen/*` imports (after the `MehrMoeglich` import line):

```tsx
import { ProzessAudit } from "@/components/leistungen/ProzessAudit";
```

- [ ] **Step 2: Render the block after MehrMoeglich**

Replace this block:

```tsx
      <MehrMoeglich />
      <Referenzen />
```

with:

```tsx
      <MehrMoeglich />
      {/* Paid-audit on-ramp: pulled up so it butts the petrol MehrMoeglich as one
          region, then the paper Referenzen below gives the clean tone divider. */}
      <Section tone="petrol" className="-mt-24 md:-mt-32">
        <Reveal>
          <ProzessAudit />
        </Reveal>
      </Section>
      <Referenzen />
```

- [ ] **Step 3: Type-check, lint, and build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass, `/leistungen` builds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/leistungen/page.tsx
git commit -m "feat: place Prozess-Audit block on /leistungen after MehrMoeglich

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Full verification + live visual check

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all pass, including the two new files.

- [ ] **Step 2: Live visual check**

Run: `npm start` (per the Website gotcha — use `npm start`, not `npm run dev`, for manual/Playwright checks). Open `http://localhost:3000/leistungen` and confirm, at 1440 and 390 widths:
- the Prozess-Audit card sits directly under „Und vieles mehr…“ with normal spacing (no doubled gap, no overlap),
- the petrol→paper transition into „Bald: Stimmen aus echten Betrieben.“ reads as a clean band divider,
- the CTA „Kostenloses Erstgespräch“ leads to `/kontakt`,
- no price and no „n8n“/„Claude“ appears anywhere in the block,
- text contrast is comfortable (heading papier, body gletscher on the dark card).

If the spacing or tone needs a nudge, the live-tuning knobs are the `-mt-*` on the `Section` and the card's `bg-tiefes-wasser/40` / `ring-amber/25` — adjust, re-check, and fold any change into a follow-up commit. (The spec permits final visual placement to be confirmed live.)

- [ ] **Step 3: Final branch state**

The work is on `feat/prozess-audit` (already created; the spec commit is its first commit). Confirm a clean tree:

Run: `git status --short`
Expected: no uncommitted changes related to this feature.

---

## Self-Review (completed by plan author)

**Spec coverage (§5 build scope):**
- Price-free block on `/leistungen` → Tasks 1–3.
- New `ProzessAudit` component + `prozess-audit.ts` copy module + copy-guard test → Tasks 1–2.
- Placed after `MehrMoeglich` → Task 3.
- No price / no mechanism / German typography / CTA to free call → guarded in Task 1's test; CTA target asserted in Tasks 1 and 2.
- Guarantee + „what you get“ stacking + sharpened, non-vague messaging + DIY-safe wording (no „build it yourself“) → encoded in the Task 1 copy.
- Out of scope (handbook PDF template, checkout, `/makler` changes, dedicated route) → not in any task, as intended.

**Placeholder scan:** none — every step has concrete code or an exact command.

**Type consistency:** `prozessAudit` shape (`label`, `heading`, `body`, `deliverableLabel`, `deliverables`, `guarantee`, `cta.{label,href}`) is identical across the module (Task 1), its guard (Task 1), the component (Task 2), and the render test (Task 2). CTA href `/kontakt` is asserted in both tests.
