# Vrelo Website — Phase 2b: Leistungen + FAQ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `/leistungen` and `/faq` pages — turning two dead nav links into real, on-brand German content pages — plus the reusable `PageIntro` + `ClosingCta` primitives the rest of the site will use.

**Architecture:** Typed content lives in `src/lib/` (separated from markup, testable). Two shared inner-page components (`PageIntro`, `ClosingCta`) join the existing `Section`/`CTAButton`/`BrandWord` primitives. Page-specific presentational components live under `src/components/leistungen/` and `src/components/faq/`, composed by the route files. Inner pages are calm Papier/Editorial (deep-water stays Hero-only); the FAQ accordion uses native `<details>` (zero client JS). The `Section` primitive gains a small `tint` prop for the Leistungen tonal alternation.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4 (brand `@theme` tokens), Vitest + React Testing Library (jsdom). No new dependencies.

**Spec:** [docs/superpowers/specs/2026-06-02-vrelo-phase2b-leistungen-faq-design.md](../specs/2026-06-02-vrelo-phase2b-leistungen-faq-design.md) · **Brand brief:** [Brand.md](../../../Brand.md)

**Brand guardrails for every task:** Papier (`#F4EFE6`) background, never white. „Vrelo"/„Merak" ALWAYS via `<BrandWord>` (none appear in 2b copy, so not needed here). Fraunces (`font-serif`) only for the service-number labels (matching the homepage Steps numbers) — nowhere else on these pages. 70/20/10 palette — Amber is the CTA accent only. Calm, German, first-person „du"/„ich", no hype. **Deep-water (cool/dark) is Hero-only — these pages never use `tone="cool"`.** Use only brand `@theme` tokens for color (no hand-rolled hex). German text uses real UTF-8 umlauts/ß and em-dashes (—); if any „…" typographic quotes are introduced, they are U+201E (open) + U+201C (close) — verify bytes (the Edit tool can downgrade them to ASCII). **Every commit message ends with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.**

**Branch:** all work on `feat/phase2b-leistungen-faq` (created before Task 1 by the execution workflow). Do not commit on `main`.

---

## File structure (this plan)

```
src/app/layout.tsx                          MODIFY: add title.template ("%s — Vrelo"), default unchanged
src/components/Section.tsx                  MODIFY: add `tint?: boolean` (paper → bg-gletscher/30)  (+ Section.test.tsx)
src/lib/leistungen.ts                       typed service data (4 entries)  (+ leistungen.test.ts)
src/lib/faq.ts                              typed grouped Q&A data (3 groups)  (+ faq.test.ts)
src/components/PageIntro.tsx                shared inner-page header: eyebrow? + h1 + lead  (+ PageIntro.test.tsx)
src/components/ClosingCta.tsx               shared warm CTA section: h2 + lead + CTAButton  (+ ClosingCta.test.tsx)
src/components/leistungen/LeistungDetail.tsx   one service block (number, h2, punchline, body, chips)  (+ test)
src/components/leistungen/Referenzen.tsx       folded-in proof placeholder
src/components/faq/FaqItem.tsx              one native <details>/<summary> Q&A  (+ FaqItem.test.tsx)
src/components/faq/FaqAccordion.tsx         maps groups → theme heading + FaqItems  (+ FaqAccordion.test.tsx)
src/app/leistungen/page.tsx                composes the Leistungen page + metadata
src/app/faq/page.tsx                       composes the FAQ page + metadata
```

Existing `Section`, `CTAButton`, brand tokens, fonts, Header/Footer (via layout) are reused.

---

## Task 1: Branded page titles (layout metadata)

Add a title template so inner pages render „<Page> — Vrelo" while the homepage title stays exactly as-is (it uses the `default`).

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace the `metadata` export**

In `src/app/layout.tsx`, replace the existing `export const metadata` block with:

```tsx
export const metadata: Metadata = {
  title: {
    default: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
    template: "%s — Vrelo",
  },
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
};
```

- [ ] **Step 2: Verify build + types**

Run: `npm run build && npx tsc --noEmit`
Expected: both clean. Homepage `<title>` is unchanged (uses `default`).

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add metadata title template for inner pages"
```

---

## Task 2: `Section` gains a `tint` prop (TDD)

The Leistungen page alternates plain Papier and a subtle `bg-gletscher/30` band. Passing `className="bg-gletscher/30"` would collide with `bg-papier` (Tailwind can't guarantee which wins). So `Section` emits exactly one background: add a `tint` prop that, for the paper tone, swaps `bg-papier` → `bg-gletscher/30`.

**Files:**
- Modify: `src/components/Section.tsx`
- Modify: `src/components/Section.test.tsx`

- [ ] **Step 1: Add the failing test**

Append these two tests inside the existing `describe("Section", …)` block in `src/components/Section.test.tsx`:

```tsx
  it("renders the gletscher tint instead of papier when tint is set", () => {
    const { container } = render(<Section tint>x</Section>);
    const el = container.querySelector("section");
    expect(el).toHaveClass("bg-gletscher/30");
    expect(el).not.toHaveClass("bg-papier");
  });

  it("keeps the readable text color when tinted", () => {
    const { container } = render(<Section tint>x</Section>);
    expect(container.querySelector("section")).toHaveClass("text-tinte");
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/Section.test.tsx`
Expected: FAIL — the `tint` versions still render `bg-papier` (and TypeScript: `tint` not a prop).

- [ ] **Step 3: Implement `tint`**

Replace the contents of `src/components/Section.tsx` with:

```tsx
import type { ReactNode } from "react";

type Tone = "paper" | "cool" | "warm";

const toneClasses: Record<Tone, string> = {
  paper: "bg-papier text-tinte",
  cool: "bg-tiefes-wasser text-gletscher",
  warm: "bg-sonnenlicht text-tinte",
};

export function Section({
  tone = "paper",
  tint = false,
  className = "",
  id,
  children,
}: {
  tone?: Tone;
  tint?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  // `tint` is a subtle alternation for stacked paper sections (Leistungen).
  // It replaces the paper background so only one bg utility is emitted.
  const base = tint ? "bg-gletscher/30 text-tinte" : toneClasses[tone];
  return (
    <section id={id} className={[base, className].filter(Boolean).join(" ")}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/Section.test.tsx`
Expected: PASS (7 tests: the original 5 + 2 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/Section.tsx src/components/Section.test.tsx
git commit -m "feat: add tint option to Section for tonal alternation"
```

---

## Task 3: Content data — `leistungen.ts` + `faq.ts` (TDD)

Typed content, separated from presentation. Sanity tests guard shape and order.

**Files:**
- Create: `src/lib/leistungen.ts`, `src/lib/leistungen.test.ts`
- Create: `src/lib/faq.ts`, `src/lib/faq.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/leistungen.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { leistungen } from "./leistungen";

describe("leistungen data", () => {
  it("lists the four homepage service categories in order", () => {
    expect(leistungen.map((l) => l.title)).toEqual([
      "Termine & Bestätigungen",
      "Nachfass-Mails",
      "Dateneingabe",
      "Wiederkehrende Kommunikation",
    ]);
  });

  it("gives each service a slug, punchline, body and 2–3 outcomes", () => {
    for (const l of leistungen) {
      expect(l.slug).toMatch(/\S/);
      expect(l.punchline).toMatch(/\S/);
      expect(l.body).toMatch(/\S/);
      expect(l.outcomes.length).toBeGreaterThanOrEqual(2);
      expect(l.outcomes.length).toBeLessThanOrEqual(3);
    }
  });

  it("has unique slugs", () => {
    const slugs = leistungen.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

`src/lib/faq.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { faqGroups } from "./faq";

describe("faq data", () => {
  it("has three themed groups in order", () => {
    expect(faqGroups.map((g) => g.theme)).toEqual([
      "Zusammenarbeit",
      "Technik & Sicherheit",
      "Kosten & Ablauf",
    ]);
  });

  it("gives every group at least one entry with question and answer", () => {
    for (const g of faqGroups) {
      expect(g.entries.length).toBeGreaterThanOrEqual(1);
      for (const e of g.entries) {
        expect(e.question).toMatch(/\S/);
        expect(e.answer).toMatch(/\S/);
      }
    }
  });

  it("has unique questions across all groups", () => {
    const questions = faqGroups.flatMap((g) => g.entries.map((e) => e.question));
    expect(new Set(questions).size).toBe(questions.length);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/leistungen.test.ts src/lib/faq.test.ts`
Expected: FAIL — cannot resolve `./leistungen` / `./faq`.

- [ ] **Step 3: Write `src/lib/leistungen.ts`**

```ts
export type Leistung = {
  slug: string;
  title: string;
  punchline: string;
  body: string;
  outcomes: string[];
};

export const leistungen: Leistung[] = [
  {
    slug: "termine",
    title: "Termine & Bestätigungen",
    punchline: "Schluss mit Hinterhertelefonieren.",
    body: "Termine werden automatisch bestätigt, erinnert und nachgehalten. Deine Kund:innen bekommen rechtzeitig Bescheid — und du musst nicht mehr daran denken.",
    outcomes: ["weniger No-Shows", "automatische Erinnerungen", "kein Nachtelefonieren"],
  },
  {
    slug: "nachfass-mails",
    title: "Nachfass-Mails",
    punchline: "Nichts fällt mehr durchs Raster.",
    body: "Angebote und offene Anfragen werden automatisch nachgefasst — freundlich, pünktlich und in deinem Ton. Kein Auftrag geht mehr verloren, weil eine Mail liegen geblieben ist.",
    outcomes: ["pünktliche Follow-ups", "mehr abgeschlossene Angebote", "in deinem Ton"],
  },
  {
    slug: "dateneingabe",
    title: "Dateneingabe",
    punchline: "Daten landen dort, wo sie hingehören.",
    body: "Informationen aus Formularen, Mails oder PDFs werden automatisch erfasst und in deine Systeme übertragen — ohne Abtippen, ohne Copy-Paste, ohne Zahlendreher.",
    outcomes: ["kein Abtippen", "weniger Fehler", "saubere Daten"],
  },
  {
    slug: "kommunikation",
    title: "Wiederkehrende Kommunikation",
    punchline: "Routine-Nachrichten schreiben sich von selbst.",
    body: "Wiederkehrende E-Mails und Benachrichtigungen — Bestätigungen, Status-Updates, Rückmeldungen — laufen automatisch. Persönlich genug, dass niemand den Unterschied merkt.",
    outcomes: ["immer rechtzeitig", "persönlich & automatisch", "mehr Zeit für echte Gespräche"],
  },
];
```

- [ ] **Step 4: Write `src/lib/faq.ts`**

```ts
export type FaqEntry = { question: string; answer: string };
export type FaqGroup = { theme: string; entries: FaqEntry[] };

export const faqGroups: FaqGroup[] = [
  {
    theme: "Zusammenarbeit",
    entries: [
      {
        question: "Wie läuft ein Projekt mit dir ab?",
        answer:
          "In drei ruhigen Schritten: Wir schauen gemeinsam hin, wo dir Zeit verloren geht. Ich baue daraus eine saubere, dokumentierte Lösung. Danach läuft sie von selbst — für Anpassungen bleibe ich erreichbar.",
      },
      {
        question: "Für welche Betriebe baust du?",
        answer:
          "Für kleine Betriebe und Selbstständige im DACH-Raum — Handwerk, Praxen, Agenturen, lokale Dienstleister. Wenn sich bei dir täglich derselbe Kleinkram wiederholt, lohnt es sich.",
      },
      {
        question: "Arbeitest du auch remote?",
        answer:
          "Ja, komplett remote. Die Zusammenarbeit läuft über kurze Calls und klare Absprachen — egal, wo dein Betrieb sitzt.",
      },
    ],
  },
  {
    theme: "Technik & Sicherheit",
    entries: [
      {
        question: "Muss ich meine bestehenden Tools wechseln?",
        answer:
          "Nein. Ich baue auf dem auf, was du schon nutzt, und verbinde deine Tools miteinander — statt dir ein neues System aufzuzwingen.",
      },
      {
        question: "Was passiert mit meinen Daten?",
        answer:
          "Deine Daten bleiben deine. Ich arbeite DSGVO-konform, nutze nur die nötigen Zugänge und dokumentiere, was wohin fließt.",
      },
      {
        question: "Was, wenn etwas nicht mehr funktioniert?",
        answer:
          "Jede Automatisierung wird dokumentiert und überwacht. Ändert sich etwas, passe ich sie an — du stehst nie mit einem kaputten Ablauf allein da.",
      },
    ],
  },
  {
    theme: "Kosten & Ablauf",
    entries: [
      {
        question: "Was kostet eine Automatisierung?",
        answer:
          "Das hängt vom Umfang ab — jede Lösung ist maßgeschneidert. Nach einem kurzen Gespräch bekommst du ein klares, unverbindliches Angebot ohne versteckte Kosten.",
      },
      {
        question: "Wie lange dauert die Umsetzung?",
        answer:
          "Die meisten ersten Automatisierungen stehen innerhalb weniger Wochen, kleinere Abläufe oft schon in Tagen.",
      },
      {
        question: "Wie fange ich an?",
        answer:
          "Mit einem unverbindlichen Gespräch. Du erzählst mir, was dich Zeit kostet — ich sage dir ehrlich, ob und wie ich helfen kann.",
      },
    ],
  },
];
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/leistungen.test.ts src/lib/faq.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/leistungen.ts src/lib/leistungen.test.ts src/lib/faq.ts src/lib/faq.test.ts
git commit -m "feat: add typed Leistungen and FAQ content data"
```

---

## Task 4: Shared components — `PageIntro` + `ClosingCta` (TDD)

Reusable inner-page header and warm closing CTA. Used by both 2b pages (and future pages).

**Files:**
- Create: `src/components/PageIntro.tsx`, `src/components/PageIntro.test.tsx`
- Create: `src/components/ClosingCta.tsx`, `src/components/ClosingCta.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/components/PageIntro.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageIntro } from "./PageIntro";

describe("PageIntro", () => {
  it("renders the title as an h1 and the lead", () => {
    render(<PageIntro title="Leistungen" lead="Lead-Text." />);
    expect(screen.getByRole("heading", { level: 1, name: "Leistungen" })).toBeInTheDocument();
    expect(screen.getByText("Lead-Text.")).toBeInTheDocument();
  });

  it("renders the eyebrow when provided", () => {
    render(<PageIntro eyebrow="Was ich baue" title="Leistungen" lead="x" />);
    expect(screen.getByText("Was ich baue")).toBeInTheDocument();
  });

  it("omits the eyebrow when not provided (only the lead paragraph remains)", () => {
    const { container } = render(<PageIntro title="Leistungen" lead="x" />);
    expect(screen.queryByText("Was ich baue")).not.toBeInTheDocument();
    expect(container.querySelectorAll("p").length).toBe(1);
  });
});
```

`src/components/ClosingCta.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClosingCta } from "./ClosingCta";

describe("ClosingCta", () => {
  it("renders the heading (h2) and lead", () => {
    render(<ClosingCta heading="Los geht es." lead="Schreib mir." />);
    expect(screen.getByRole("heading", { level: 2, name: "Los geht es." })).toBeInTheDocument();
    expect(screen.getByText("Schreib mir.")).toBeInTheDocument();
  });

  it("links the CTA to /kontakt by default", () => {
    render(<ClosingCta heading="h" lead="l" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/kontakt");
  });

  it("respects a custom ctaHref", () => {
    render(<ClosingCta heading="h" lead="l" ctaHref="/newsletter" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/newsletter");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/PageIntro.test.tsx src/components/ClosingCta.test.tsx`
Expected: FAIL — cannot resolve `./PageIntro` / `./ClosingCta`.

- [ ] **Step 3: Write `src/components/PageIntro.tsx`**

```tsx
import { Section } from "@/components/Section";

export function PageIntro({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
}) {
  return (
    <Section tone="paper">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wider text-stumm">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-tiefes-wasser md:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-tinte">{lead}</p>
    </Section>
  );
}
```

- [ ] **Step 4: Write `src/components/ClosingCta.tsx`**

```tsx
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";

export function ClosingCta({
  heading,
  lead,
  ctaHref = "/kontakt",
}: {
  heading: string;
  lead: string;
  ctaHref?: string;
}) {
  return (
    <Section tone="warm">
      <h2 className="max-w-2xl text-3xl font-semibold text-ember md:text-4xl">{heading}</h2>
      <p className="mt-5 max-w-xl text-lg text-tinte">{lead}</p>
      <div className="mt-8">
        <CTAButton href={ctaHref} />
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/PageIntro.test.tsx src/components/ClosingCta.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/PageIntro.tsx src/components/PageIntro.test.tsx src/components/ClosingCta.tsx src/components/ClosingCta.test.tsx
git commit -m "feat: add shared PageIntro and ClosingCta components"
```

---

## Task 5: Leistungen components — `LeistungDetail` + `Referenzen`

`LeistungDetail` is background-agnostic (the page wraps it in a `Section` and controls the tint). `Referenzen` is a static, labelled proof placeholder.

**Files:**
- Create: `src/components/leistungen/LeistungDetail.tsx`, `src/components/leistungen/LeistungDetail.test.tsx`
- Create: `src/components/leistungen/Referenzen.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/leistungen/LeistungDetail.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeistungDetail } from "./LeistungDetail";
import type { Leistung } from "@/lib/leistungen";

const sample: Leistung = {
  slug: "termine",
  title: "Termine & Bestätigungen",
  punchline: "Schluss mit Hinterhertelefonieren.",
  body: "Kurzer Beschreibungstext.",
  outcomes: ["weniger No-Shows", "automatische Erinnerungen"],
};

describe("LeistungDetail", () => {
  it("renders the title as an h2, the punchline and the body", () => {
    render(<LeistungDetail leistung={sample} index={0} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Termine & Bestätigungen" })
    ).toBeInTheDocument();
    expect(screen.getByText("Schluss mit Hinterhertelefonieren.")).toBeInTheDocument();
    expect(screen.getByText("Kurzer Beschreibungstext.")).toBeInTheDocument();
  });

  it("renders every outcome chip", () => {
    render(<LeistungDetail leistung={sample} index={0} />);
    for (const outcome of sample.outcomes) {
      expect(screen.getByText(outcome)).toBeInTheDocument();
    }
  });

  it("labels the outcome list by the heading id", () => {
    const { container } = render(<LeistungDetail leistung={sample} index={0} />);
    const ul = container.querySelector("ul");
    const h2 = container.querySelector("h2");
    expect(h2?.id).toMatch(/\S/);
    expect(ul?.getAttribute("aria-labelledby")).toBe(h2?.id);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/leistungen/LeistungDetail.test.tsx`
Expected: FAIL — cannot resolve `./LeistungDetail`.

- [ ] **Step 3: Write `src/components/leistungen/LeistungDetail.tsx`**

```tsx
import type { Leistung } from "@/lib/leistungen";

export function LeistungDetail({
  leistung,
  index,
}: {
  leistung: Leistung;
  index: number;
}) {
  const labelId = `leistung-${leistung.slug}`;
  const number = String(index + 1).padStart(2, "0");
  return (
    <div>
      <p aria-hidden="true" className="font-serif text-lg italic text-vrelo-petrol">
        {number}
      </p>
      <h2
        id={labelId}
        className="mt-2 text-2xl font-semibold text-tiefes-wasser md:text-3xl"
      >
        {leistung.title}
      </h2>
      <p className="mt-2 text-lg font-medium text-vrelo-petrol">{leistung.punchline}</p>
      <p className="mt-4 max-w-2xl text-tinte">{leistung.body}</p>
      <ul aria-labelledby={labelId} className="mt-6 flex flex-wrap gap-2">
        {leistung.outcomes.map((outcome) => (
          <li
            key={outcome}
            className="rounded-full border border-faden bg-gletscher/40 px-3 py-1 text-sm text-tiefes-wasser"
          >
            {outcome}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/leistungen/LeistungDetail.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/leistungen/Referenzen.tsx`**

```tsx
import { Section } from "@/components/Section";

export function Referenzen() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Vertrauen</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Bald: Stimmen aus echten Betrieben.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-tinte">
        Hier stehen in Kürze konkrete Beispiele und Referenzen aus kleinen Betrieben, für die
        ich gebaut habe.
      </p>
      {/* TODO: replace with real Referenzen/testimonials when available */}
    </Section>
  );
}
```

- [ ] **Step 6: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/leistungen/LeistungDetail.tsx src/components/leistungen/LeistungDetail.test.tsx src/components/leistungen/Referenzen.tsx
git commit -m "feat: add LeistungDetail and Referenzen components"
```

---

## Task 6: FAQ components — `FaqItem` + `FaqAccordion` (TDD)

Native `<details>`/`<summary>` disclosure (no client JS), grouped by theme.

**Files:**
- Create: `src/components/faq/FaqItem.tsx`, `src/components/faq/FaqItem.test.tsx`
- Create: `src/components/faq/FaqAccordion.tsx`, `src/components/faq/FaqAccordion.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/components/faq/FaqItem.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqItem } from "./FaqItem";

describe("FaqItem", () => {
  it("renders a native details/summary with the question and answer", () => {
    const { container } = render(
      <FaqItem question="Arbeitest du remote?" answer="Ja, komplett remote." />
    );
    expect(container.querySelector("details")).toBeInTheDocument();
    expect(container.querySelector("summary")).toHaveTextContent("Arbeitest du remote?");
    expect(screen.getByText("Ja, komplett remote.")).toBeInTheDocument();
  });
});
```

`src/components/faq/FaqAccordion.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqAccordion } from "./FaqAccordion";
import type { FaqGroup } from "@/lib/faq";

const groups: FaqGroup[] = [
  {
    theme: "Zusammenarbeit",
    entries: [
      { question: "Frage A?", answer: "Antwort A." },
      { question: "Frage B?", answer: "Antwort B." },
    ],
  },
  {
    theme: "Kosten",
    entries: [{ question: "Frage C?", answer: "Antwort C." }],
  },
];

describe("FaqAccordion", () => {
  it("renders each theme heading", () => {
    render(<FaqAccordion groups={groups} />);
    expect(screen.getByRole("heading", { name: "Zusammenarbeit" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kosten" })).toBeInTheDocument();
  });

  it("renders every question across all groups as a details element", () => {
    const { container } = render(<FaqAccordion groups={groups} />);
    expect(container.querySelectorAll("details").length).toBe(3);
    expect(screen.getByText("Frage A?")).toBeInTheDocument();
    expect(screen.getByText("Frage C?")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/faq/FaqItem.test.tsx src/components/faq/FaqAccordion.test.tsx`
Expected: FAIL — cannot resolve `./FaqItem` / `./FaqAccordion`.

- [ ] **Step 3: Write `src/components/faq/FaqItem.tsx`**

```tsx
export function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-faden py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-tiefes-wasser [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol">
        {question}
        <span
          aria-hidden="true"
          className="text-xl leading-none text-vrelo-petrol transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="mt-3 max-w-2xl text-tinte">{answer}</p>
    </details>
  );
}
```

- [ ] **Step 4: Write `src/components/faq/FaqAccordion.tsx`**

```tsx
import type { FaqGroup } from "@/lib/faq";
import { FaqItem } from "@/components/faq/FaqItem";

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <div key={group.theme}>
          <h2 className="text-sm font-medium uppercase tracking-wider text-stumm">
            {group.theme}
          </h2>
          <div className="mt-4 border-t border-faden">
            {group.entries.map((entry) => (
              <FaqItem key={entry.question} question={entry.question} answer={entry.answer} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/faq/FaqItem.test.tsx src/components/faq/FaqAccordion.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/faq/FaqItem.tsx src/components/faq/FaqItem.test.tsx src/components/faq/FaqAccordion.tsx src/components/faq/FaqAccordion.test.tsx
git commit -m "feat: add native-details FAQ accordion components"
```

---

## Task 7: Compose `/leistungen` page + metadata

**Files:**
- Create: `src/app/leistungen/page.tsx`

- [ ] **Step 1: Write `src/app/leistungen/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { LeistungDetail } from "@/components/leistungen/LeistungDetail";
import { Referenzen } from "@/components/leistungen/Referenzen";
import { leistungen } from "@/lib/leistungen";

export const metadata: Metadata = {
  title: "Leistungen",
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe: Termine & Bestätigungen, Nachfass-Mails, Dateneingabe und wiederkehrende Kommunikation.",
};

export default function LeistungenPage() {
  return (
    <>
      <PageIntro
        eyebrow="Was ich baue"
        title="Leistungen"
        lead="Ich baue dir eine saubere Quelle für die Aufgaben, die sich jeden Tag wiederholen — maßgeschneidert für deinen Betrieb, nicht von der Stange. Kein Flickenteppich aus zehn Tools, sondern eine ruhige Lösung, die still im Hintergrund läuft."
      />
      {leistungen.map((leistung, index) => (
        <Section
          key={leistung.slug}
          tone="paper"
          tint={index % 2 === 1}
          className="border-t border-faden"
        >
          <LeistungDetail leistung={leistung} index={index} />
        </Section>
      ))}
      <Referenzen />
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich zeige dir unverbindlich, was sich automatisieren lässt."
      />
    </>
  );
}
```

- [ ] **Step 2: Full gate**

Run: `npm test && npm run build && npm run lint && npx tsc --noEmit`
Expected: all tests pass, `/leistungen` is prerendered as a static route, lint + tsc clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/leistungen/page.tsx
git commit -m "feat: add Leistungen page"
```

---

## Task 8: Compose `/faq` page + metadata

**Files:**
- Create: `src/app/faq/page.tsx`

- [ ] **Step 1: Write `src/app/faq/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { faqGroups } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Häufige Fragen",
  description:
    "Antworten auf die häufigsten Fragen zu Zusammenarbeit, Technik, Sicherheit und Kosten — für kleine Betriebe, die wiederkehrende Aufgaben automatisieren wollen.",
};

export default function FaqPage() {
  return (
    <>
      <PageIntro
        eyebrow="FAQ"
        title="Häufige Fragen"
        lead="Was kleine Betriebe vor der Zusammenarbeit am häufigsten fragen. Deine Frage ist nicht dabei? Schreib mir einfach."
      />
      <Section tone="paper" className="border-t border-faden">
        <FaqAccordion groups={faqGroups} />
      </Section>
      <ClosingCta
        heading="Offene Frage?"
        lead="Schreib mir kurz, was du wissen willst — ich melde mich persönlich."
      />
    </>
  );
}
```

- [ ] **Step 2: Full gate**

Run: `npm test && npm run build && npm run lint && npx tsc --noEmit`
Expected: all tests pass, `/faq` is prerendered as a static route, lint + tsc clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/faq/page.tsx
git commit -m "feat: add FAQ page"
```

---

## Task 9: Responsive visual review + polish

**Files:** none required (polish edits to 2b components/pages as needed).

- [ ] **Step 1: Screenshot both pages, desktop + mobile**

Start the dev server (`npm run dev`), then capture `/leistungen` and `/faq` at desktop (1280px) and mobile (390px) widths (Playwright). Verify against the brand guardrails:
- Both pages are calm Papier/Editorial — **no deep-water (cool/dark) block anywhere**; each ends warm on the `ClosingCta`.
- Leistungen: the four service blocks alternate plain Papier / subtle `bg-gletscher/30` with hairline `border-faden` separators; numbers read as quiet Fraunces labels; outcome chips wrap cleanly on mobile.
- FAQ: clicking a `<summary>` opens/closes its `<details>`; the `+` rotates; keyboard (Tab + Enter/Space) toggles items; theme headings group the questions.
- One `<h1>` per page; Amber appears only on the CTA buttons; backgrounds are Papier, never white; generous spacing, nothing cramped on mobile.

- [ ] **Step 2: Apply frontend-design polish**

Invoke the **frontend-design skill** for any spacing/scale/contrast refinements the screenshots surface (e.g. service-block vertical rhythm, chip spacing, summary tap-target size). Stay within brand tokens and the approved copy. Re-screenshot to confirm.

- [ ] **Step 3: Final gate + commit (if changes made)**

Run: `npm test && npm run build && npm run lint && npx tsc --noEmit`
Expected: all clean.
```bash
git add -A
git commit -m "polish: Leistungen and FAQ responsive spacing and rhythm"
```
Stop the dev server when done.

---

## Self-Review

**Spec coverage:**
- `/leistungen` = PageIntro → 4 alternating-tint service blocks → folded-in Referenzen → warm ClosingCta → Tasks 4, 5, 7 ✓
- `/faq` = PageIntro → native `<details>` accordion (3 themes) → warm ClosingCta → Tasks 4, 6, 8 ✓
- Shared `PageIntro` + `ClosingCta` → Task 4 ✓
- Typed content in `src/lib/leistungen.ts` + `src/lib/faq.ts` → Task 3 ✓
- Sections under `src/components/leistungen/` + `src/components/faq/` → Tasks 5, 6 ✓
- Subtle gletscher tonal alternation without bg conflict → Task 2 (`Section.tint`) + Task 7 ✓
- CTAs → `/kontakt`; minimal per-page title/description; branded titles via template → Tasks 1, 4, 7, 8 ✓
- Accessibility (one h1/page via PageIntro; service h2 + aria-labelledby chip list; native-details FAQ; aria-hidden number; focus rings) → Tasks 4, 5, 6 ✓
- Correctly deferred: JSON-LD/OG/sitemap (Phase 3), real testimonials (Referenzen placeholder), `/kontakt` page (Phase 4), nav/header changes, new deps — none added. Deep-water stays Hero-only. ✓

**Placeholder scan:** The only placeholder is the intentional, labelled `Referenzen` proof block (resolved in a later phase). No "TBD/handle edge cases" steps; every code step shows complete code. ✓

**Type/interface consistency:** `Leistung { slug, title, punchline, body, outcomes }` defined in Task 3, consumed identically in Tasks 5 & 7. `FaqGroup { theme, entries }` / `FaqEntry { question, answer }` defined in Task 3, consumed in Tasks 6 & 8. `PageIntro({ eyebrow?, title, lead })`, `ClosingCta({ heading, lead, ctaHref? })`, `LeistungDetail({ leistung, index })`, `FaqAccordion({ groups })`, `FaqItem({ question, answer })` defined and consumed under the same names. `Section`'s new `tint?: boolean` (Task 2) is used in Task 7. All imports use the `@/` alias matching the existing codebase. ✓

No issues found.
