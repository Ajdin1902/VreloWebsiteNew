# Vrelo Website — Phase 2a: Homepage & Visual System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Home with the real homepage — an immersive deep-water Hero (Direction B) followed by the approved cool→warm section flow that lands on the *Merak*-Effekt — and establish the reusable `Section` primitive the rest of the site builds on.

**Architecture:** A `Section` layout primitive encodes the brand's tonal rhythm via a `tone` prop (`paper` | `cool` | `warm`) → background/text classes + consistent container. Presentational section components live in `src/components/home/` and are composed by `src/app/page.tsx`. The Hero is a server component using a CSS-only animated glow (no client JS), gated by `motion-safe`. Visual components ship with a complete, buildable baseline; the **frontend-design skill** is then applied for craft, verified with responsive screenshots.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4 (brand `@theme` tokens), Vitest + RTL. No new dependencies.

**Brand brief:** [Brand.md](../../../Brand.md) · **Spec:** [docs/superpowers/specs/2026-06-01-vrelo-website-design.md](../specs/2026-06-01-vrelo-website-design.md)

**Brand guardrails for every task:** Papier (`#F4EFE6`) background, never white. „Vrelo"/„Merak" ALWAYS via `<BrandWord>` (Fraunces italic). Fraunces otherwise only for pull-quotes/manifest lines. 70/20/10 palette — Amber is the accent/CTA, never co-equal with Petrol. Calm, German, first-person „du"/„ich", no hype. Copy must land on the *Merak*-Effekt by the end.

---

## File structure (this plan)

```
src/app/globals.css                 + drop-glow keyframe & --animate token (Hero glow)
src/components/Section.tsx           reusable tonal section wrapper  (+ Section.test.tsx)
src/components/Hero.tsx              Direction B deep-water hero
src/components/home/Problem.tsx          section 2 — the pain
src/components/home/WasIchBaue.tsx       section 3 — the offer overview → /leistungen
src/components/home/GeschichteTeaser.tsx section 4 — Quelle→Merak teaser → /ueber-mich (warm)
src/components/home/Steps.tsx            section 5 — 3 steps
src/components/home/Proof.tsx            section 6 — referenzen placeholder
src/components/home/MerakClose.tsx       section 7 — warm close + CTA (video slot for Phase 2c)
src/app/page.tsx                     composes Hero + all sections (replaces placeholder)
```

Footer already provides the closing band (Phase 1). Existing `BrandWord`, `CTAButton`, brand tokens, and fonts are reused.

---

## Task 1: Hero glow keyframe (globals.css)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the keyframe and animation token**

Append to the END of `src/app/globals.css` (after the existing `body` rule). Also add ONE line inside the existing `@theme { ... }` block:

Inside the existing `@theme { ... }` block, add this line (next to the font vars):
```css
  --animate-drop-glow: drop-glow 6s ease-in-out infinite;
```

At the end of the file, add:
```css
@keyframes drop-glow {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds. (`animate-drop-glow` utility now exists; used by the Hero in Task 3.)

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add drop-glow keyframe for hero amber drop"
```

---

## Task 2: Section primitive (TDD)

A reusable wrapper that encodes the brand's tonal rhythm and a consistent container. This is logic-bearing (tone→classes), so it's test-driven.

**Files:**
- Create: `src/components/Section.tsx`
- Test: `src/components/Section.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/Section.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "./Section";

describe("Section", () => {
  it("renders children", () => {
    render(<Section>Inhalt</Section>);
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("defaults to the paper tone (Papier background, not white)", () => {
    const { container } = render(<Section>x</Section>);
    expect(container.querySelector("section")).toHaveClass("bg-papier");
  });

  it("applies the cool tone classes", () => {
    const { container } = render(<Section tone="cool">x</Section>);
    expect(container.querySelector("section")).toHaveClass("bg-tiefes-wasser");
  });

  it("applies the warm tone classes", () => {
    const { container } = render(<Section tone="warm">x</Section>);
    expect(container.querySelector("section")).toHaveClass("bg-sonnenlicht");
  });

  it("merges className and sets id", () => {
    const { container } = render(
      <Section className="border-t" id="proof">x</Section>
    );
    const el = container.querySelector("section");
    expect(el).toHaveClass("border-t");
    expect(el).toHaveAttribute("id", "proof");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Section.test.tsx`
Expected: FAIL — cannot resolve `./Section`.

- [ ] **Step 3: Write the implementation**

`src/components/Section.tsx`:
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
  className = "",
  id,
  children,
}: {
  tone?: Tone;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={[toneClasses[tone], className].filter(Boolean).join(" ")}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Section.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Section.tsx src/components/Section.test.tsx
git commit -m "feat: add Section primitive with paper/cool/warm tones"
```

---

## Task 3: Hero — Direction B "Deep Water Immersive"

The signature moment: deep-water radial background with a glowing amber drop (the *Merak* promise), tagline, subheadline, CTA.

**Files:**
- Create: `src/components/Hero.tsx`

- [ ] **Step 1: Create the baseline Hero**

`src/components/Hero.tsx`:
```tsx
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_70%_10%,#1b5063_0%,#0a2538_55%,#071c2b_100%)]">
      {/* Glowing amber drop = the Merak-Effekt. Decorative; subtle shimmer disabled under reduced motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-14 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_50%_35%,#f4e4c1,#d4a24c_60%,rgba(212,162,76,0)_72%)] shadow-[0_0_60px_16px_rgba(212,162,76,0.45)] motion-safe:animate-drop-glow md:right-24 md:top-24 md:h-32 md:w-32"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.15] text-papier md:text-6xl">
          <BrandWord>Vrelo</BrandWord> errichtet die Quelle.{" "}
          <br className="hidden sm:block" />
          Du erlebst den <BrandWord>Merak</BrandWord>-Effekt.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-stein md:text-xl">
          Maßgeschneiderte Automatisierungen für kleine Betriebe. Sie übernehmen den
          wiederkehrenden Kleinkram — du gewinnst Zeit, Ruhe und einen freien Kopf zurück.
        </p>
        <div className="mt-9">
          <CTAButton href="/kontakt" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Apply frontend-design craft**

Invoke the **frontend-design skill** and refine THIS hero within the brand guardrails (do not change the copy, the palette tokens, or break the `motion-safe` gating). Acceptable refinements: drop placement/scale, gradient stops, type scale/tracking, optional subtle water-surface line at the bottom edge, spacing rhythm. Keep it calm and uncluttered — one confident focal point (the drop), not effects soup.

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat: add Direction B deep-water hero with glowing Merak drop"
```

---

## Task 4: Homepage sections — Problem + WasIchBaue

**Files:**
- Create: `src/components/home/Problem.tsx`, `src/components/home/WasIchBaue.tsx`

- [ ] **Step 1: Create `src/components/home/Problem.tsx`**

```tsx
import { Section } from "@/components/Section";

export function Problem() {
  return (
    <Section tone="paper">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Das Problem</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Der Kleinkram frisst deinen Tag.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-tinte">
        Termine bestätigen, nachfassen, Daten von A nach B tippen. Stunden, die für die
        Arbeit fehlen, die du eigentlich liebst.
      </p>
    </Section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/WasIchBaue.tsx`**

```tsx
import Link from "next/link";
import { Section } from "@/components/Section";

const leistungen = [
  "Termine & Bestätigungen",
  "Nachfass-Mails",
  "Dateneingabe",
  "Wiederkehrende Kommunikation",
];

export function WasIchBaue() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Was ich baue</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Eine saubere Quelle — kein Flickenteppich.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-tinte">
        Ich baue maßgeschneiderte Automatisierungen, die den wiederkehrenden Kleinkram
        still im Hintergrund übernehmen.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {leistungen.map((l) => (
          <li
            key={l}
            className="rounded-xl border border-faden bg-gletscher/40 px-4 py-3 text-tiefes-wasser"
          >
            {l}
          </li>
        ))}
      </ul>
      <Link
        href="/leistungen"
        className="mt-8 inline-block rounded-sm font-medium text-vrelo-petrol underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
      >
        Alle Leistungen ansehen →
      </Link>
    </Section>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Problem.tsx src/components/home/WasIchBaue.tsx
git commit -m "feat: add homepage Problem and WasIchBaue sections"
```

---

## Task 5: Homepage sections — GeschichteTeaser + Steps

**Files:**
- Create: `src/components/home/GeschichteTeaser.tsx`, `src/components/home/Steps.tsx`

- [ ] **Step 1: Create `src/components/home/GeschichteTeaser.tsx`** (warm; the blockquote is a permitted Fraunces pull-quote)

```tsx
import Link from "next/link";
import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";

export function GeschichteTeaser() {
  return (
    <Section tone="warm">
      <p className="text-sm font-medium uppercase tracking-wider text-ember">Die Geschichte</p>
      <blockquote className="mt-4 max-w-3xl font-serif text-2xl italic leading-snug text-ember md:text-3xl">
        „In Bosnien sind Quellen heilig — wo das Wasser entspringt, beginnt der Fluss."
      </blockquote>
      <p className="mt-6 max-w-2xl text-lg text-tinte">
        <BrandWord>Vrelo</BrandWord> heißt Quelle. Warum dieser Name — und was er mit
        deinem Betrieb zu tun hat.
      </p>
      <Link
        href="/ueber-mich"
        className="mt-8 inline-block rounded-sm font-medium text-ember underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sonnenlicht focus-visible:ring-ember"
      >
        Die ganze Geschichte →
      </Link>
    </Section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/Steps.tsx`**

```tsx
import { Section } from "@/components/Section";

const steps = [
  { n: "1", t: "Hinschauen", d: "Wir finden gemeinsam die Aufgaben, die dich täglich Zeit kosten." },
  { n: "2", t: "Bauen", d: "Ich baue daraus eine saubere, dokumentierte Quelle." },
  { n: "3", t: "Fließen", d: "Die Arbeit läuft von selbst — still im Hintergrund." },
];

export function Steps() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">So läuft&apos;s ab</p>
      <h2 className="mt-3 text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        In drei ruhigen Schritten.
      </h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="rounded-2xl border border-faden bg-papier p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vrelo-petrol font-serif text-lg italic text-papier">
              {s.n}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-tiefes-wasser">{s.t}</h3>
            <p className="mt-2 text-tinte">{s.d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/GeschichteTeaser.tsx src/components/home/Steps.tsx
git commit -m "feat: add homepage GeschichteTeaser and Steps sections"
```

---

## Task 6: Homepage sections — Proof + MerakClose

**Files:**
- Create: `src/components/home/Proof.tsx`, `src/components/home/MerakClose.tsx`

- [ ] **Step 1: Create `src/components/home/Proof.tsx`** (Referenzen folded in here per spec; placeholder until real testimonials)

```tsx
import { Section } from "@/components/Section";

export function Proof() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Vertrauen</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Ruhig gebaut. Verlässlich im Betrieb.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-tinte">
        Hier stehen bald echte Referenzen und Stimmen aus kleinen Betrieben.
      </p>
      {/* TODO: replace with real Referenzen/testimonials when available */}
    </Section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/MerakClose.tsx`** (warm close; the sunset video — End.mp4 — gets wired into the marked slot in Phase 2c)

```tsx
import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export function MerakClose() {
  return (
    <Section tone="warm" className="relative overflow-hidden">
      {/* Video slot (Phase 2c): the sunset clip mounts here behind the text. Warm gradient stands in for now. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_120%,#f4e4c1,#e8b86b_55%,#f4e4c1_100%)] opacity-60"
      />
      <h2 className="max-w-2xl font-serif text-3xl italic leading-snug text-ember md:text-4xl">
        Stell dir den Montagmorgen vor, an dem schon zwei Stunden Arbeit erledigt sind.
      </h2>
      <p className="mt-6 max-w-xl text-lg text-tinte">
        Das ist der <BrandWord>Merak</BrandWord>-Effekt. Kein Druck — schau dir
        unverbindlich an, was möglich ist.
      </p>
      <div className="mt-8">
        <CTAButton href="/kontakt" />
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Proof.tsx src/components/home/MerakClose.tsx
git commit -m "feat: add homepage Proof and MerakClose sections"
```

---

## Task 7: Compose the homepage (replace placeholder)

**Files:**
- Modify: `src/app/page.tsx` (replace entire contents)

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/home/Problem";
import { WasIchBaue } from "@/components/home/WasIchBaue";
import { GeschichteTeaser } from "@/components/home/GeschichteTeaser";
import { Steps } from "@/components/home/Steps";
import { Proof } from "@/components/home/Proof";
import { MerakClose } from "@/components/home/MerakClose";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <WasIchBaue />
      <GeschichteTeaser />
      <Steps />
      <Proof />
      <MerakClose />
    </>
  );
}
```

- [ ] **Step 2: Full gate**

Run: `npm test && npm run build && npm run lint && npx tsc --noEmit`
Expected: tests pass (BrandWord 3 + Section 5 = 8), build succeeds, lint clean, tsc clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: compose homepage from Hero + section flow"
```

---

## Task 8: Responsive visual review + polish

**Files:** none required (polish edits to the section/Hero files as needed).

- [ ] **Step 1: Screenshot desktop + mobile**

Start the dev server (`npm run dev`), then capture the homepage at desktop (1280px) and mobile (390px) widths (Playwright). Verify against the brand guardrails:
- Cool→warm rhythm reads correctly; Hero is the only deep-water block; page ends warm on the Merak close.
- „Vrelo"/„Merak" are Fraunces italic everywhere; no other stray Fraunces except the two pull-quote/manifest lines.
- Amber appears only as drop + CTAs (not co-equal with Petrol); background is Papier.
- Generous spacing, nothing cramped on mobile; tap targets and links reachable.

- [ ] **Step 2: Apply frontend-design polish**

Invoke the **frontend-design skill** for any spacing/scale/contrast refinements surfaced by the screenshots. Stay within brand tokens and copy. Re-screenshot to confirm.

- [ ] **Step 3: Final gate + commit (if changes made)**

Run: `npm test && npm run build && npm run lint`
Expected: all clean.
```bash
git add -A
git commit -m "polish: homepage responsive spacing and visual rhythm"
```
Stop the dev server when done.

---

## Self-Review

**Spec coverage (Phase 2a portion):**
- Hero = Direction B immersive deep-water + glowing drop → Tasks 1, 3 ✓
- Homepage section flow (Problem → Was ich baue → Geschichte → Steps → Proof → Merak-close), cool→warm, lands on Merak → Tasks 4–7 ✓
- Referenzen folded into Home → Task 6 (Proof) ✓
- Reusable Section primitive (tonal system) → Task 2 ✓
- Brand rules (Papier bg, BrandWord italic, 70/20/10, calm German) → guardrails enforced per task + Task 8 review ✓
- Correctly deferred: sunset video at Merak-close + full Über-mich narrative → Phase 2c (slot marked in MerakClose); Leistungen/FAQ pages → Phase 2b; JSON-LD/SEO metadata → Phase 3; mobile hamburger → still Phase 2/footer-served.

**Placeholder scan:** The Proof copy and the MerakClose video slot are intentional, labelled placeholders resolved in later phases — not plan gaps. No "TBD/handle edge cases" steps. Visual tasks include complete baseline code (frontend-design refines, doesn't start from nothing). ✓

**Type/interface consistency:** `Section({ tone, className, id, children })` with `tone: "paper"|"cool"|"warm"` is defined in Task 2 and consumed identically in Tasks 4–6. `Hero`, `Problem`, `WasIchBaue`, `GeschichteTeaser`, `Steps`, `Proof`, `MerakClose` are all named exports imported by the exact same names in Task 7. `--animate-drop-glow` (Task 1) matches `animate-drop-glow` used in the Hero (Task 3). ✓

No issues found.
