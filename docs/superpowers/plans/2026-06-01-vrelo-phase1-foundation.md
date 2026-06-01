# Vrelo Website — Phase 1: Foundation & Design System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployable Next.js shell whose design system encodes the Vrelo brand (palette tokens, fonts, the `BrandWord` italic rule) and renders a global Header + Footer around a placeholder Home page.

**Architecture:** Next.js App Router (TypeScript, `src/` dir, `@/*` alias) with Tailwind CSS v4. Brand colours are defined once as `@theme` tokens in `globals.css` so the whole codebase uses `bg-papier`, `text-tiefes-wasser`, etc. Fonts are self-hosted via `next/font`. A small set of presentational components (`BrandWord`, `CTAButton`, `Header`, `Footer`) compose the layout. Logic-bearing units get Vitest unit tests; purely presentational rendering is verified by build + smoke test.

**Tech Stack:** Next.js (latest), TypeScript, Tailwind CSS v4, `next/font` (Plus Jakarta Sans + Fraunces), Vitest + React Testing Library, deployed on Vercel.

**Spec:** [docs/superpowers/specs/2026-06-01-vrelo-website-design.md](../specs/2026-06-01-vrelo-website-design.md)

---

## File structure (created in this phase)

```
package.json, tsconfig.json, next.config.ts, postcss.config.mjs   (scaffolded)
vitest.config.ts                          test runner config
vitest.setup.ts                           jest-dom matchers
src/app/layout.tsx                        root layout: fonts + Header + Footer + base metadata
src/app/page.tsx                          placeholder Home
src/app/globals.css                       Tailwind import + @theme brand tokens + fonts
src/lib/fonts.ts                          next/font definitions
src/lib/nav.ts                            nav link data (single source for Header/Footer)
src/components/BrandWord.tsx              renders „Vrelo"/„Merak" in Fraunces italic
src/components/BrandWord.test.tsx
src/components/CTAButton.tsx              amber primary CTA
src/components/Header.tsx                 logo + nav + CTA
src/components/Footer.tsx                 cool footer + tagline + newsletter slot (placeholder)
public/logo/*.svg                         7 brand SVGs copied from Brand Project
```

---

## Task 1: Scaffold Next.js without clobbering existing files

**Files:**
- Create: project scaffold (package.json, tsconfig.json, next.config.ts, src/app/*, etc.)
- Note: `CLAUDE.md`, `Videos/`, `docs/` already exist and must survive.

`create-next-app` refuses to run in a directory containing non-allowlisted files. `docs/`, `.git`, `.gitignore` are allowlisted; **`CLAUDE.md` and `Videos/` are not** — move them aside, scaffold, move back.

- [ ] **Step 1: Move conflicting files aside**

Run (Bash tool, from project root):
```bash
mkdir -p .scaffold-hold && mv CLAUDE.md Videos .scaffold-hold/
ls -A   # expect: .git .gitignore .scaffold-hold docs
```

- [ ] **Step 2: Scaffold Next.js non-interactively**

Run:
```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --use-npm --yes --turbopack
```
Expected: completes with "Success! Created" and installs dependencies. If it prompts about a non-empty dir, the move in Step 1 was incomplete — re-check `ls -A`.

- [ ] **Step 3: Restore the held files and clean up**

Run:
```bash
mv .scaffold-hold/CLAUDE.md .scaffold-hold/Videos . && rmdir .scaffold-hold
ls -A   # CLAUDE.md and Videos are back
```

- [ ] **Step 4: Re-add our ignore rules (create-next-app overwrote .gitignore)**

Append to `.gitignore` (use Edit/Write; do not duplicate lines create-next-app already added):
```gitignore

# Brainstorming visual companion (local only)
.superpowers/
```

- [ ] **Step 5: Verify dev build boots**

Run:
```bash
npm run build
```
Expected: build succeeds (the default starter compiles).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app (TS, Tailwind v4, App Router)"
```

---

## Task 2: Install and configure the test runner (Vitest + RTL)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
Expected: installs without error.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add the test script to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify the runner starts (no tests yet)**

Run:
```bash
npm test
```
Expected: Vitest runs and reports "No test files found" (exit 0) — this confirms config loads.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add Vitest + React Testing Library setup"
```

---

## Task 3: Brand tokens + base theme in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace `globals.css` with brand theme**

Replace the entire file contents with:
```css
@import "tailwindcss";

@theme {
  /* Vrelo — cool (~70%) */
  --color-tiefes-wasser: #0a2538;
  --color-vrelo-petrol: #1b5063;
  --color-stein: #a8b5ba;
  --color-gletscher: #dce7eb;

  /* Merak — warm (~20%) */
  --color-ember: #8b5e2c;
  --color-amber: #d4a24c;
  --color-honig: #e8b86b;
  --color-sonnenlicht: #f4e4c1;

  /* Neutral (~10%) */
  --color-tinte: #14181b;
  --color-papier: #f4efe6;
  --color-faden: #d4ccbc;
  --color-stumm: #7a7468;

  /* Fonts (CSS vars provided by next/font in Task 4) */
  --font-sans: var(--font-jakarta), system-ui, sans-serif;
  --font-serif: var(--font-fraunces), Georgia, serif;
}

html {
  background-color: var(--color-papier);
  color: var(--color-tinte);
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Verify the theme compiles**

Run:
```bash
npm run build
```
Expected: build succeeds. (Token utilities like `bg-papier` now exist; we use them in later tasks.)

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add Vrelo brand color tokens and base theme"
```

---

## Task 4: Self-hosted fonts via next/font

**Files:**
- Create: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/lib/fonts.ts`**

```ts
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["italic", "normal"],
  variable: "--font-fraunces",
  display: "swap",
});
```

- [ ] **Step 2: Wire the font variables onto `<html>` in `src/app/layout.tsx`**

Replace the file with (Header/Footer added in Task 8 — keep this minimal for now):
```tsx
import type { Metadata } from "next";
import { jakarta, fraunces } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build (fonts fetched at build time)**

Run:
```bash
npm run build
```
Expected: build succeeds and shows the route compiled. If font fetch fails offline, re-run once online.

- [ ] **Step 4: Commit**

```bash
git add src/lib/fonts.ts src/app/layout.tsx
git commit -m "feat: self-host Plus Jakarta Sans + Fraunces via next/font"
```

---

## Task 5: BrandWord component (TDD)

The single most pervasive brand rule: „Vrelo" and „Merak" are **always** Fraunces italic. `BrandWord` encodes it.

**Files:**
- Create: `src/components/BrandWord.tsx`
- Test: `src/components/BrandWord.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/BrandWord.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { BrandWord } from "./BrandWord";

describe("BrandWord", () => {
  it("renders its text content", () => {
    render(<BrandWord>Vrelo</BrandWord>);
    expect(screen.getByText("Vrelo")).toBeInTheDocument();
  });

  it("applies the Fraunces serif + italic classes", () => {
    render(<BrandWord>Merak</BrandWord>);
    const el = screen.getByText("Merak");
    expect(el).toHaveClass("font-serif");
    expect(el).toHaveClass("italic");
  });

  it("merges caller-provided className", () => {
    render(<BrandWord className="text-amber">Vrelo</BrandWord>);
    expect(screen.getByText("Vrelo")).toHaveClass("text-amber");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/components/BrandWord.test.tsx
```
Expected: FAIL — cannot resolve `./BrandWord`.

- [ ] **Step 3: Write minimal implementation**

`src/components/BrandWord.tsx`:
```tsx
import type { ReactNode } from "react";

export function BrandWord({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`font-serif italic ${className}`.trim()}>{children}</span>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/components/BrandWord.test.tsx
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/BrandWord.tsx src/components/BrandWord.test.tsx
git commit -m "feat: add BrandWord component (Fraunces italic for Vrelo/Merak)"
```

---

## Task 6: CTAButton component

**Files:**
- Create: `src/components/CTAButton.tsx`

- [ ] **Step 1: Create `src/components/CTAButton.tsx`**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

export function CTAButton({
  href,
  children = "Quelle erkunden",
  variant = "primary",
}: {
  href: string;
  children?: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-amber text-tiefes-wasser hover:bg-honig"
      : "border border-stein text-tiefes-wasser hover:bg-gletscher";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Verify it compiles via build**

Run:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/CTAButton.tsx
git commit -m "feat: add CTAButton (amber primary)"
```

---

## Task 7: Nav data + Header component

**Files:**
- Create: `src/lib/nav.ts`, `src/components/Header.tsx`

- [ ] **Step 1: Create `src/lib/nav.ts` (single source of nav links)**

```ts
export type NavLink = { href: string; label: string };

export const navLinks: NavLink[] = [
  { href: "/leistungen", label: "Leistungen" },
  { href: "/ueber-mich", label: "Über mich" },
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];
```

- [ ] **Step 2: Create `src/components/Header.tsx`**

```tsx
import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-faden bg-papier/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl text-tiefes-wasser">
          <BrandWord>Vrelo</BrandWord>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-tinte transition-colors hover:text-vrelo-petrol"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <CTAButton href="/kontakt" />
        </div>
      </nav>
    </header>
  );
}
```

> Note: a mobile hamburger menu is deferred to Phase 2 (needs client-side state); the desktop nav + CTA is sufficient for the deployable shell. Mobile users still reach pages via the footer.

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/nav.ts src/components/Header.tsx
git commit -m "feat: add Header with nav and CTA"
```

---

## Task 8: Footer component

**Files:**
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Create `src/components/Footer.tsx`**

```tsx
import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandWord } from "@/components/BrandWord";

export function Footer() {
  return (
    <footer className="mt-24 bg-tiefes-wasser text-gletscher">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="text-2xl">
            <BrandWord>Vrelo</BrandWord>
          </div>
          <p className="mt-2 text-sm text-stein">
            Durchdachte Automatisierung für kleine Betriebe.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-gletscher hover:text-honig">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Newsletter signup is added in Phase 4; placeholder slot for now */}
        <div className="text-sm text-stein">
          <p className="mb-2 text-gletscher">Newsletter</p>
          <p>Automatisierungs-Ideen mit KI — ruhig erklärt. (bald verfügbar)</p>
        </div>
      </div>
      <div className="border-t border-vrelo-petrol">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-stein md:flex-row md:items-center md:justify-between">
          <p className="text-base">
            <BrandWord>Vrelo</BrandWord> errichtet die Quelle. Du erlebst den{" "}
            <BrandWord>Merak</BrandWord>-Effekt.
          </p>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:text-honig">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-honig">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: add Footer with tagline and newsletter placeholder"
```

---

## Task 9: Wire Header/Footer into layout + placeholder Home

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Add Header + Footer to the layout**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import { jakarta, fraunces } from "@/lib/fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `src/app/page.tsx` with a placeholder Home**

```tsx
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-tiefes-wasser md:text-5xl">
        <BrandWord>Vrelo</BrandWord> errichtet die Quelle. Du erlebst den{" "}
        <BrandWord>Merak</BrandWord>-Effekt.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-tinte">
        Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit,
        Ruhe und einen freien Kopf zurück.
      </p>
      <div className="mt-8">
        <CTAButton href="/kontakt" />
      </div>
      <p className="mt-16 text-sm text-stumm">
        Platzhalter-Startseite — das vollständige Hero &amp; die Sektionen folgen in Phase 2.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Smoke-test in the browser**

Run:
```bash
npm run dev
```
Open http://localhost:3000 — expect: Papier background, „Vrelo"/„Merak" in serif italic, amber CTA, cool footer with tagline. Stop the dev server (Ctrl+C) when confirmed.

- [ ] **Step 4: Run the full test + build gate**

Run:
```bash
npm test && npm run build && npx next lint
```
Expected: tests pass, build succeeds, lint clean.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: wire Header/Footer into layout with placeholder Home"
```

---

## Task 10: Copy brand logo SVGs into public/

**Files:**
- Create: `public/logo/*.svg` (7 files)

- [ ] **Step 1: Copy the SVGs**

Run (Bash tool):
```bash
mkdir -p public/logo
cp "/c/Users/ajdin/OneDrive/AJ19/ADZ/Brand/Vrelo Brand Project/assets/"*.svg public/logo/
ls public/logo/
```
Expected: 7 files listed (vrelo-symbol-navy-amber.svg, …-petrol-amber.svg, …-paper-amber.svg, three mono variants, merak-submark-amber.svg).

> If the OneDrive path is not reachable from the Bash tool, copy them manually into `public/logo/` and verify with `ls public/logo/`.

- [ ] **Step 2: Commit**

```bash
git add public/logo
git commit -m "chore: add brand logo SVG assets"
```

---

## Task 11: Deploy the shell to Vercel (optional but recommended)

**Files:** none (platform step).

- [ ] **Step 1: Confirm Vercel CLI**

Run:
```bash
vercel --version || npm i -g vercel
```

- [ ] **Step 2: Link & deploy a preview**

Run:
```bash
vercel link --yes
vercel deploy
```
Expected: a preview URL. Open it — the shell renders as it did locally.

> Production promotion and a custom domain (vrelo.de) are deferred to Phase 5. This step only proves the build deploys cleanly.

---

## Self-Review

**Spec coverage (Phase 1 portion of the spec):**
- Tech stack (Next.js App Router, TS, Tailwind, Vercel) → Tasks 1, 11 ✓
- Brand tokens / 70-20-10 palette as utilities → Task 3 ✓
- Fonts (Plus Jakarta Sans + Fraunces self-hosted) → Task 4 ✓
- `BrandWord` enforcement component → Task 5 ✓
- Header (nav + „Quelle erkunden" CTA) → Tasks 6, 7 ✓
- Footer (tagline, legal links, newsletter slot) → Task 8 ✓
- Papier-not-white background → Task 3 ✓
- Logo assets → Task 10 ✓
- Deferred to later phases (correctly out of Phase 1 scope): full hero B, videos, MDX/Ratgeber, FAQ content, forms/scheduler/newsletter logic, JSON-LD, legal page bodies, mobile hamburger.

**Placeholder scan:** No "TBD/TODO/handle edge cases" steps. The placeholder Home and footer newsletter slot are intentional, labelled, and replaced in later phases. ✓

**Type consistency:** `BrandWord({children, className})`, `CTAButton({href, children, variant})`, `navLinks: NavLink[]` are defined once and consumed consistently in Header/Footer/layout/page. Font CSS vars `--font-jakarta`/`--font-fraunces` (fonts.ts) match `--font-sans`/`--font-serif` references (globals.css). ✓

No issues found.
