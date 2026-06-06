# Vrelo Phase 6 — End-stage Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved end-stage design polish — interactive WebGL water Hero, brand mark on every surface (header lockup + mobile drawer + footer + favicon), Option-C petrol palette rhythm, draft-to-verify partner-framing copy, and a token/a11y/motion hardening layer.

**Architecture:** Incremental, low-risk-first. Build the shared primitives (Section petrol tone, CTAButton tone prop, BrandLockup) before the components that consume them; then the navigation/logo surfaces; then the riskiest piece (the deferred-WebGL Hero); then copy; then final polish. Each task is TDD with its own commit.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4 `@theme` tokens, Vitest + React Testing Library (jsdom), raw WebGL (no new dependency).

**Spec:** [docs/superpowers/specs/2026-06-06-vrelo-phase6-design-polish-design.md](../specs/2026-06-06-vrelo-phase6-design-polish-design.md)

**Branch:** `feat/design-polish` (already checked out).

---

## Conventions for every task

- Run the **full gate** before each commit unless the task says otherwise:
  `npm test` · `npx tsc --noEmit` · `npm run lint`. Run `npm run build` at the milestones noted.
- German client-facing copy uses U+201E „ + U+201C " quotes. After writing copy with German
  quotes, verify the bytes (`git diff` shows `„`/`“`, not ASCII `"`). The Edit tool can
  silently downgrade them — if it does, rewrite that string via the Write tool.
- Commit message footer line: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Test files mirror the existing style: `import { describe, it, expect } from "vitest";` and
  `render`/`screen` from `@testing-library/react`. The setup (`vitest.setup.ts`) already
  polyfills `matchMedia` (defaults `matches:false`) and `IntersectionObserver`.

---

## File Structure

**Create:**
- `src/components/BrandLockup.tsx` — symbol SVG + bottom-aligned `<BrandWord>Vrelo</BrandWord>`, `variant: "navy" | "paper"`.
- `src/components/BrandLockup.test.tsx`
- `src/components/MobileNav.tsx` — client; full-screen deep-water drawer with a11y.
- `src/components/MobileNav.test.tsx`
- `src/components/RippleImage.tsx` — client; static `<img>` LCP + deferred WebGL ripple overlay.
- `src/components/RippleImage.test.tsx`
- `src/app/icon.svg` — favicon from the V-symbol.

**Modify:**
- `src/components/Section.tsx` (+ test) — add `petrol` tone.
- `src/components/CTAButton.tsx` (+ new test) — add `tone` prop for ring-offset on dark.
- `src/components/Header.tsx` — use `BrandLockup`, active route, mount `MobileNav`, drop TODO.
- `src/components/Footer.tsx` — use `BrandLockup` (paper).
- `src/components/Hero.tsx` — two-column, mount `RippleImage`, reposition drop, token-harden bg.
- `src/components/home/WasIchBaue.tsx` (+ new test) — petrol tone + on-dark restyle.
- `src/components/home/Steps.tsx` (+ new test) — petrol tone + on-dark restyle.
- `src/components/home/MerakClose.tsx` — continuity cue.
- `src/components/home/GeschichteTeaser.tsx` — eyebrow `h2`→`p` (heading consistency).
- `src/lib/faq.ts` (+ test update) — „Was passiert nach dem Projekt?".
- `src/lib/leistungen.ts` (+ test update) — durability outcome.
- `src/lib/og.tsx` — strengthen the OG mark to the V-funnel + drop.
- `src/app/globals.css` — `.hero-deepwater` + `.hero-drop` utility classes (token-harden Hero).

---

## Task 1: Section — add the `petrol` cool tone

**Files:**
- Modify: `src/components/Section.tsx`
- Test: `src/components/Section.test.tsx`

- [ ] **Step 1: Add the failing test**

In `src/components/Section.test.tsx`, after the existing "applies the cool tone classes" test, add:

```tsx
  it("applies the petrol tone classes", () => {
    const { container } = render(<Section tone="petrol">x</Section>);
    const el = container.querySelector("section");
    expect(el).toHaveClass("bg-vrelo-petrol");
    expect(el).toHaveClass("text-gletscher");
  });
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/Section.test.tsx`
Expected: FAIL — TypeScript/`tone="petrol"` not assignable / class not present.

- [ ] **Step 3: Implement**

In `src/components/Section.tsx` change the `Tone` type and the `toneClasses` map:

```tsx
type Tone = "paper" | "cool" | "warm" | "petrol";

const toneClasses: Record<Tone, string> = {
  paper: "bg-papier text-tinte",
  cool: "bg-tiefes-wasser text-gletscher",
  warm: "bg-sonnenlicht text-tinte",
  petrol: "bg-vrelo-petrol text-gletscher",
};
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/Section.test.tsx`
Expected: PASS (all Section tests green).

- [ ] **Step 5: Commit**

```bash
git add src/components/Section.tsx src/components/Section.test.tsx
git commit -m "feat(section): add token-based petrol cool tone

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: CTAButton — `tone` prop for focus-ring offset on dark surfaces

The CTA appears on Papier (header), on the deep-water Hero, on the warm Merak-Close, and inside
the deep-water mobile drawer. The focus ring offset is hard-coded `focus-visible:ring-offset-papier`,
which is wrong on dark. Add a `tone` prop.

**Files:**
- Modify: `src/components/CTAButton.tsx`
- Test: `src/components/CTAButton.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/components/CTAButton.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTAButton } from "./CTAButton";

describe("CTAButton", () => {
  it("links to the given href with the default label", () => {
    render(<CTAButton href="/kontakt" />);
    const link = screen.getByRole("link", { name: "Quelle erkunden" });
    expect(link).toHaveAttribute("href", "/kontakt");
  });

  it("offsets the focus ring against papier by default", () => {
    render(<CTAButton href="/x" />);
    expect(screen.getByRole("link")).toHaveClass("focus-visible:ring-offset-papier");
  });

  it("offsets the focus ring against the dark surface when tone='dark'", () => {
    render(<CTAButton href="/x" tone="dark" />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("focus-visible:ring-offset-tiefes-wasser");
    expect(link).not.toHaveClass("focus-visible:ring-offset-papier");
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/CTAButton.test.tsx`
Expected: FAIL — `tone` prop does not exist.

- [ ] **Step 3: Implement**

Replace `src/components/CTAButton.tsx` with:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

export function CTAButton({
  href,
  children = "Quelle erkunden",
  variant = "primary",
  tone = "papier",
}: {
  href: string;
  children?: ReactNode;
  variant?: "primary" | "ghost";
  tone?: "papier" | "dark";
}) {
  const offset =
    tone === "dark"
      ? "focus-visible:ring-offset-tiefes-wasser"
      : "focus-visible:ring-offset-papier";
  const base = `inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${offset} focus-visible:ring-amber`;
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

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/CTAButton.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CTAButton.tsx src/components/CTAButton.test.tsx
git commit -m "feat(cta): tone prop for focus-ring offset on dark surfaces

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: BrandLockup — shared symbol + bottom-aligned wordmark

Per Brand.md: symbol = SVG, „Vrelo" = live Fraunces-italic text (`<BrandWord>`), drop points up.
Bottom-aligned (the user's chosen option 2). Two variants for light vs dark surfaces.

**Files:**
- Create: `src/components/BrandLockup.tsx`
- Test: `src/components/BrandLockup.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/BrandLockup.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandLockup } from "./BrandLockup";

describe("BrandLockup", () => {
  it("renders the live-text wordmark Vrelo", () => {
    render(<BrandLockup />);
    expect(screen.getByText("Vrelo")).toBeInTheDocument();
  });

  it("renders a decorative symbol (aria-hidden, no double announcement)", () => {
    const { container } = render(<BrandLockup />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("bottom-aligns the wordmark with the symbol", () => {
    const { container } = render(<BrandLockup />);
    expect(container.firstChild).toHaveClass("items-end");
  });

  it("uses the navy funnel by default and the paper funnel on dark", () => {
    const { container, rerender } = render(<BrandLockup variant="navy" />);
    expect(container.querySelector('path[fill="#0a2538"]')).not.toBeNull();
    rerender(<BrandLockup variant="paper" />);
    expect(container.querySelector('path[fill="#f4efe6"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/BrandLockup.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/components/BrandLockup.tsx` (the SVG paths are the real `vrelo-symbol-*` geometry,
viewBox cropped to the content; funnel color swaps by variant; drop stays amber):

```tsx
import { BrandWord } from "@/components/BrandWord";

// The Wellspring-V symbol, inlined so the funnel color can follow the surface.
// Geometry matches public/logo/vrelo-symbol-{navy,paper}-amber.svg; viewBox cropped
// to the drawn content. Decorative — the adjacent live "Vrelo" text is the name.
export function BrandLockup({
  variant = "navy",
  className = "",
}: {
  variant?: "navy" | "paper";
  className?: string;
}) {
  const funnel = variant === "navy" ? "#0a2538" : "#f4efe6";
  const wordmark = variant === "navy" ? "text-tiefes-wasser" : "text-papier";
  return (
    <span className={`inline-flex items-end gap-2.5 ${className}`}>
      <svg
        viewBox="8 4 94 100"
        aria-hidden="true"
        className="block h-[30px] w-auto shrink-0"
      >
        <line x1="12" y1="92" x2="98" y2="92" stroke={funnel} strokeWidth="1" opacity="0.4" />
        <path d="M 14 36 L 55 98 L 96 36 L 82 36 L 55 77 L 28 36 Z" fill={funnel} />
        <path
          d="M 55 8 C 60 8, 65 14, 65 18 C 65 24, 60.5 27.5, 55 27.5 C 49.5 27.5, 45 24, 45 18 C 45 14, 50 8, 55 8 Z"
          fill="#d4a24c"
        />
        <ellipse cx="52" cy="15.5" rx="2.2" ry="3.2" fill="rgba(255,255,255,0.3)" />
      </svg>
      <span className={`text-xl leading-none ${wordmark}`}>
        <BrandWord>Vrelo</BrandWord>
      </span>
    </span>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/BrandLockup.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/BrandLockup.tsx src/components/BrandLockup.test.tsx
git commit -m "feat(brand): BrandLockup — symbol + bottom-aligned Vrelo wordmark

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: MobileNav — full-screen deep-water drawer (a11y)

**Files:**
- Create: `src/components/MobileNav.tsx`
- Test: `src/components/MobileNav.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/MobileNav.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MobileNav } from "./MobileNav";

afterEach(cleanup);

describe("MobileNav", () => {
  it("is closed initially: trigger shows aria-expanded=false and no dialog", () => {
    render(<MobileNav />);
    expect(screen.getByRole("button", { name: /menü öffnen/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on trigger click and shows the nav links", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leistungen" })).toBeInTheDocument();
  });

  it("closes on Escape and restores aria-expanded", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: /menü öffnen/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("closes when a nav link is activated", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    fireEvent.click(screen.getByRole("link", { name: "FAQ" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/MobileNav.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/components/MobileNav.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandLockup } from "@/components/BrandLockup";
import { CTAButton } from "@/components/CTAButton";

// Mobile-only navigation: a burger that opens a full-screen tiefes-wasser drawer.
// Hidden at md+ (the desktop nav in Header takes over). a11y: aria-expanded,
// role=dialog + aria-modal, Esc to close, focus moves in and returns to the
// trigger, body scroll locked while open. The open transition is motion-safe.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Return focus to the trigger after closing.
  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Menü öffnen"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen(true)}
        className="flex flex-col gap-[5px] rounded-sm p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
      >
        <span className="block h-0.5 w-6 bg-tiefes-wasser" />
        <span className="block h-0.5 w-6 bg-tiefes-wasser" />
        <span className="block h-0.5 w-6 bg-tiefes-wasser" />
      </button>

      {open ? (
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Hauptnavigation"
          tabIndex={-1}
          className="fixed inset-0 z-[60] flex flex-col bg-tiefes-wasser px-6 py-5 text-gletscher motion-safe:animate-[fade-in_180ms_ease-out] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <BrandLockup variant="paper" />
            <button
              type="button"
              aria-label="Menü schließen"
              onClick={() => setOpen(false)}
              className="rounded-sm p-2 text-2xl leading-none text-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
            >
              ✕
            </button>
          </div>

          <ul className="mt-10 flex flex-col gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm py-3 text-lg text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            <CTAButton href="/kontakt" tone="dark" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

Add the `fade-in` keyframe in `src/app/globals.css` (after `drop-glow`):

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/MobileNav.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/MobileNav.tsx src/components/MobileNav.test.tsx src/app/globals.css
git commit -m "feat(nav): full-screen deep-water mobile drawer (a11y)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Header — lockup, active route, mount MobileNav

**Files:**
- Modify: `src/components/Header.tsx`
- Test: `src/components/Header.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/components/Header.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/leistungen" }));

describe("Header", () => {
  it("renders the brand lockup wordmark", () => {
    render(<Header />);
    // Wordmark appears in the desktop lockup (and inside the mobile drawer when open).
    expect(screen.getAllByText("Vrelo").length).toBeGreaterThanOrEqual(1);
  });

  it("marks the current route as active (aria-current)", () => {
    render(<Header />);
    const active = screen.getByRole("link", { name: "Leistungen" });
    expect(active).toHaveAttribute("aria-current", "page");
  });

  it("includes the mobile menu trigger", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /menü öffnen/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/Header.test.tsx`
Expected: FAIL — no `aria-current`, no menu trigger, `usePathname` not used.

- [ ] **Step 3: Implement**

Replace `src/components/Header.tsx` with (now a client component so it can read the path for the
active link):

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav";
import { BrandLockup } from "@/components/BrandLockup";
import { CTAButton } from "@/components/CTAButton";
import { MobileNav } from "@/components/MobileNav";

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-faden bg-papier/90 backdrop-blur">
      <nav
        aria-label="Hauptnavigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link
          href="/"
          aria-label="Vrelo — Startseite"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
        >
          <BrandLockup variant="navy" />
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-sm text-sm transition-colors hover:text-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol ${
                    active ? "font-semibold text-vrelo-petrol" : "text-tinte"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <CTAButton href="/kontakt" />
        </div>

        <MobileNav />
      </nav>
    </header>
  );
}
```

Note: this removes the stale Phase-2 TODO comment.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/Header.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/Header.test.tsx
git commit -m "feat(header): brand lockup, active-route state, mobile drawer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Footer — brand lockup on the deep-water surface

**Files:**
- Modify: `src/components/Footer.tsx`
- Test: `src/components/Footer.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/components/Footer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, container as _c } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the paper-variant brand lockup symbol", () => {
    const { container } = render(<Footer />);
    // paper funnel fill present → lockup variant="paper" is used
    expect(container.querySelector('svg path[fill="#f4efe6"]')).not.toBeNull();
  });
});
```

(Remove the unused `container as _c` import line if your linter flags it — keep only
`render`.)

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/Footer.test.tsx`
Expected: FAIL — no inline symbol svg yet.

- [ ] **Step 3: Implement**

In `src/components/Footer.tsx`, replace the bare wordmark block:

```tsx
        <div>
          <div className="text-2xl">
            <BrandWord>Vrelo</BrandWord>
          </div>
          <p className="mt-2 text-sm text-stein">
            Durchdachte Automatisierung für kleine Betriebe.
          </p>
        </div>
```

with:

```tsx
        <div>
          <BrandLockup variant="paper" />
          <p className="mt-3 text-sm text-stein">
            Durchdachte Automatisierung für kleine Betriebe.
          </p>
        </div>
```

Update the imports at the top of the file: remove the now-unused `BrandWord` import **only if**
it is no longer referenced elsewhere in the file — note the bottom bar still uses
`<BrandWord>Vrelo</BrandWord>` and `<BrandWord>Merak</BrandWord>`, so **keep** the `BrandWord`
import and **add**:

```tsx
import { BrandLockup } from "@/components/BrandLockup";
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/Footer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.tsx src/components/Footer.test.tsx
git commit -m "feat(footer): brand lockup on the deep-water footer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Favicon + stronger OG mark

**Files:**
- Create: `src/app/icon.svg`
- Modify: `src/lib/og.tsx`

- [ ] **Step 1: Create the favicon**

Create `src/app/icon.svg` (transparent ground; the V-funnel in tiefes-wasser + amber drop).
Next serves an `app/icon.svg` as the site favicon automatically:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 4 94 100" width="64" height="64">
  <line x1="12" y1="92" x2="98" y2="92" stroke="#0a2538" stroke-width="1" opacity="0.4"/>
  <path d="M 14 36 L 55 98 L 96 36 L 82 36 L 55 77 L 28 36 Z" fill="#0a2538"/>
  <path d="M 55 8 C 60 8, 65 14, 65 18 C 65 24, 60.5 27.5, 55 27.5 C 49.5 27.5, 45 24, 45 18 C 45 14, 50 8, 55 8 Z" fill="#d4a24c"/>
</svg>
```

- [ ] **Step 2: Strengthen the OG mark**

In `src/lib/og.tsx`, replace the eyebrow drop `<div>` (the small amber rounded div) with the
full V-funnel + drop so the share image carries the real mark. Replace this block:

```tsx
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 26, height: 34, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", backgroundColor: "#D4A24C" }} />
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#7A7468" }}>
            {opts.eyebrow}
          </div>
        </div>
```

with (satori supports inline `<svg>`):

```tsx
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <svg width="44" height="48" viewBox="8 4 94 100">
            <path d="M 14 36 L 55 98 L 96 36 L 82 36 L 55 77 L 28 36 Z" fill="#0A2538" />
            <path d="M 55 8 C 60 8, 65 14, 65 18 C 65 24, 60.5 27.5, 55 27.5 C 49.5 27.5, 45 24, 45 18 C 45 14, 50 8, 55 8 Z" fill="#D4A24C" />
          </svg>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#7A7468" }}>
            {opts.eyebrow}
          </div>
        </div>
```

- [ ] **Step 3: Verify the OG route still builds/renders**

Run: `npx tsc --noEmit` (no type errors). The OG image is exercised at build; run
`npm run build` and confirm it completes without errors in the `opengraph-image` route.
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add src/app/icon.svg src/lib/og.tsx
git commit -m "feat(brand): V-symbol favicon + stronger OG mark

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Palette rhythm — „Was ich baue" → petrol

**Files:**
- Modify: `src/components/home/WasIchBaue.tsx`
- Test: `src/components/home/WasIchBaue.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/components/home/WasIchBaue.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WasIchBaue } from "./WasIchBaue";

describe("WasIchBaue", () => {
  it("renders on a petrol cool band", () => {
    const { container } = render(<WasIchBaue />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });

  it("uses an amber accent for the link (legible on petrol)", () => {
    render(<WasIchBaue />);
    expect(screen.getByRole("link", { name: /Alle Leistungen ansehen/i })).toHaveClass(
      "text-honig",
    );
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/home/WasIchBaue.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Replace `src/components/home/WasIchBaue.tsx` with (tone petrol; text/cards/link recolored for
contrast on petrol; amber accent for the link/cards):

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
    <Section tone="petrol">
      <p id="was-ich-baue-label" className="text-sm font-medium uppercase tracking-wider text-stein">Was ich baue</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-papier md:text-4xl">
        Eine saubere Quelle — kein Flickenteppich.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-gletscher">
        Ich baue maßgeschneiderte Automatisierungen, die den wiederkehrenden Kleinkram
        still im Hintergrund übernehmen.
      </p>
      <ul aria-labelledby="was-ich-baue-label" className="mt-8 grid gap-3 sm:grid-cols-2">
        {leistungen.map((leistung) => (
          <li
            key={leistung}
            className="rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 px-4 py-3 text-gletscher"
          >
            {leistung}
          </li>
        ))}
      </ul>
      <Link
        href="/leistungen"
        className="mt-8 inline-block rounded-sm font-medium text-honig underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-honig"
      >
        Alle Leistungen ansehen <span aria-hidden="true">→</span>
      </Link>
    </Section>
  );
}
```

(Card radius is now `rounded-2xl`, unified with Steps — addresses the card-radius backlog item.)

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/home/WasIchBaue.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/WasIchBaue.tsx src/components/home/WasIchBaue.test.tsx
git commit -m "feat(home): Was-ich-baue as a petrol cool band

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Palette rhythm — „Wie ich arbeite" (Steps) → petrol

**Files:**
- Modify: `src/components/home/Steps.tsx`
- Test: `src/components/home/Steps.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/components/home/Steps.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Steps } from "./Steps";

describe("Steps", () => {
  it("renders on a petrol cool band", () => {
    const { container } = render(<Steps />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });

  it("keeps all three steps", () => {
    render(<Steps />);
    expect(screen.getByText("Hinschauen")).toBeInTheDocument();
    expect(screen.getByText("Bauen")).toBeInTheDocument();
    expect(screen.getByText("Fließen")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/home/Steps.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Replace `src/components/home/Steps.tsx` with (petrol band; cards become darker tiles on petrol;
the number badge becomes amber for accent contrast):

```tsx
import { Section } from "@/components/Section";

const steps = [
  { num: "1", title: "Hinschauen", desc: "Wir finden gemeinsam die Aufgaben, die dich täglich Zeit kosten." },
  { num: "2", title: "Bauen", desc: "Ich baue daraus eine saubere, dokumentierte Quelle." },
  { num: "3", title: "Fließen", desc: "Die Arbeit läuft von selbst — still im Hintergrund." },
];

export function Steps() {
  return (
    <Section tone="petrol">
      <p className="text-sm font-medium uppercase tracking-wider text-stein">So läuft&apos;s ab</p>
      <h2 className="mt-3 text-3xl font-semibold text-papier md:text-4xl">
        In drei ruhigen Schritten.
      </h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.num} className="rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber font-serif text-lg italic text-tiefes-wasser">
              {s.num}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-papier">{s.title}</h3>
            <p className="mt-2 text-gletscher">{s.desc}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/home/Steps.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit + milestone gate**

```bash
git add src/components/home/Steps.tsx src/components/home/Steps.test.tsx
git commit -m "feat(home): Steps as a petrol cool band

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Then run the full gate (palette + nav milestone):
`npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build` — all green before continuing.

---

## Task 10: RippleImage — static-LCP image + deferred WebGL ripple

The Hero's centerpiece. A static `<img>` is the LCP element; the WebGL ripple mounts after idle
on top. Reduced-motion or no-WebGL → image only. Tuned params from the brainstorm:
`strength 0.010`, `freq 22`, `decay 2.0`, `speed 0.55`. The amber drop "seeds" a ripple at
`seedXFraction` every `seedIntervalMs`.

**Files:**
- Create: `src/components/RippleImage.tsx`
- Test: `src/components/RippleImage.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/RippleImage.test.tsx` (jsdom has no WebGL → `getContext` returns null →
component must render only the static image and never throw):

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RippleImage } from "./RippleImage";

afterEach(cleanup);

describe("RippleImage", () => {
  it("always renders the static image as the LCP element", () => {
    render(<RippleImage src="/video/ripples-poster.jpg" alt="" />);
    const img = screen.getByTestId("ripple-img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/video/ripples-poster.jpg");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("degrades gracefully when WebGL is unavailable (jsdom): no throw, image present", () => {
    expect(() =>
      render(<RippleImage src="/video/ripples-poster.jpg" alt="Wasser" />),
    ).not.toThrow();
    expect(screen.getByAltText("Wasser")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/RippleImage.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/components/RippleImage.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const MAXR = 24;

type Props = {
  src: string;
  alt: string;
  className?: string;
  seedXFraction?: number; // where the drop sits, 0..1 across the panel
  seedIntervalMs?: number;
};

// Static <img> is the LCP element; a WebGL canvas mounts over it after idle and
// ripples the image under the pointer. Falls back to the still image under
// prefers-reduced-motion or when WebGL is unavailable — never throws.
export function RippleImage({
  src,
  alt,
  className = "",
  seedXFraction = 0.7,
  seedIntervalMs = 5000,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia(REDUCED).matches) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }
    if (!gl) return; // no WebGL → keep the static image only

    const glc = gl;
    let raf = 0;
    let seedTimer: number | undefined;
    let disposed = false;

    const vsrc =
      "attribute vec2 p; varying vec2 vUv; void main(){ vUv=p*0.5+0.5; gl_Position=vec4(p,0.0,1.0); }";
    const fsrc = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform float uTime, uCanvasAspect, uImgAspect, uStrength, uFreq, uDecay, uSpeed;
      uniform vec3 uR[${MAXR}];
      void main(){
        vec2 disp = vec2(0.0);
        for(int i=0;i<${MAXR};i++){
          vec3 r = uR[i];
          if(r.z < -0.5) continue;
          float t = uTime - r.z;
          if(t < 0.0 || t > 3.0) continue;
          vec2 d = (vUv - r.xy) * vec2(uCanvasAspect, 1.0);
          float dist = length(d);
          float band = exp(-pow(dist - t*uSpeed, 2.0) * 90.0);
          float amp = exp(-t*uDecay) * band;
          float ring = sin(dist*uFreq - t*uFreq*uSpeed) * amp;
          disp += normalize(d + 1e-5) * ring * uStrength;
        }
        vec2 ca = uCanvasAspect > uImgAspect
          ? vec2(1.0, uImgAspect/uCanvasAspect)
          : vec2(uCanvasAspect/uImgAspect, 1.0);
        vec2 uv = (vUv - 0.5) * ca + 0.5;
        vec3 col = texture2D(uTex, uv + disp).rgb;
        col += clamp(length(disp)*22.0, 0.0, 0.6) * vec3(0.83,0.78,0.65);
        gl_FragColor = vec4(col, 1.0);
      }`;

    const sh = (type: number, source: string) => {
      const s = glc.createShader(type)!;
      glc.shaderSource(s, source);
      glc.compileShader(s);
      return s;
    };
    const prog = glc.createProgram()!;
    glc.attachShader(prog, sh(glc.VERTEX_SHADER, vsrc));
    glc.attachShader(prog, sh(glc.FRAGMENT_SHADER, fsrc));
    glc.linkProgram(prog);
    glc.useProgram(prog);

    const buf = glc.createBuffer();
    glc.bindBuffer(glc.ARRAY_BUFFER, buf);
    glc.bufferData(glc.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), glc.STATIC_DRAW);
    const ploc = glc.getAttribLocation(prog, "p");
    glc.enableVertexAttribArray(ploc);
    glc.vertexAttribPointer(ploc, 2, glc.FLOAT, false, 0, 0);

    const u = (n: string) => glc.getUniformLocation(prog, n);
    const U = {
      time: u("uTime"), ca: u("uCanvasAspect"), ia: u("uImgAspect"),
      strength: u("uStrength"), freq: u("uFreq"), decay: u("uDecay"), speed: u("uSpeed"),
      tex: u("uTex"),
    };
    const Ur: (WebGLUniformLocation | null)[] = [];
    for (let i = 0; i < MAXR; i++) Ur.push(u(`uR[${i}]`));

    const tex = glc.createTexture();
    let imgAspect = 0.8;
    const tImg = new Image();
    tImg.crossOrigin = "anonymous";
    tImg.onload = () => {
      imgAspect = tImg.width / tImg.height;
      glc.bindTexture(glc.TEXTURE_2D, tex);
      glc.pixelStorei(glc.UNPACK_FLIP_Y_WEBGL, true);
      glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGB, glc.RGB, glc.UNSIGNED_BYTE, tImg);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
    };
    tImg.src = src;

    const ripples = new Float32Array(MAXR * 3);
    for (let i = 0; i < MAXR; i++) ripples[i * 3 + 2] = -1;
    let head = 0;
    const last = { x: 0, y: 0, t: 0, has: false };
    const add = (x: number, y: number, now: number) => {
      ripples[head * 3] = x; ripples[head * 3 + 1] = y; ripples[head * 3 + 2] = now;
      head = (head + 1) % MAXR;
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = 1 - (e.clientY - rect.top) / rect.height;
      const now = performance.now() / 1000;
      if (!last.has) { last.x = cx; last.y = cy; last.t = now; last.has = true; add(cx, cy, now); return; }
      const dd = Math.hypot(cx - last.x, cy - last.y);
      if (dd > 0.035 || now - last.t > 0.05) { add(cx, cy, now); last.x = cx; last.y = cy; last.t = now; }
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);

    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      glc.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // The amber drop seeds a ripple at its x-position on a slow interval.
    seedTimer = window.setInterval(() => {
      add(seedXFraction, 0.96, performance.now() / 1000);
    }, seedIntervalMs);

    const frame = () => {
      if (disposed) return;
      const now = performance.now() / 1000;
      glc.useProgram(prog);
      glc.uniform1f(U.time, now);
      glc.uniform1f(U.ca, canvas.width / canvas.height);
      glc.uniform1f(U.ia, imgAspect);
      glc.uniform1f(U.strength, 0.01);
      glc.uniform1f(U.freq, 22);
      glc.uniform1f(U.decay, 2.0);
      glc.uniform1f(U.speed, 0.55);
      glc.uniform1i(U.tex, 0);
      glc.activeTexture(glc.TEXTURE0);
      glc.bindTexture(glc.TEXTURE_2D, tex);
      for (let i = 0; i < MAXR; i++) glc.uniform3f(Ur[i], ripples[i * 3], ripples[i * 3 + 1], ripples[i * 3 + 2]);
      glc.drawArrays(glc.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (seedTimer) clearInterval(seedTimer);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, [src, seedXFraction, seedIntervalMs]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="ripple-img"
        src={src}
        alt={alt}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
```

Note: `fetchPriority` is the React 19 camelCase prop; it renders to the `fetchpriority`
attribute the test checks.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/RippleImage.test.tsx`
Expected: PASS (jsdom returns null from `getContext`, so the effect early-returns and only the
image renders).

- [ ] **Step 5: Commit**

```bash
git add src/components/RippleImage.tsx src/components/RippleImage.test.tsx
git commit -m "feat(hero): RippleImage — static-LCP image + deferred WebGL ripple

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Hero — two-column layout, ripple panel, drop, token-hardened bg

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/app/globals.css` (add `.hero-deepwater` + `.hero-drop`)
- Test: `src/components/Hero.test.tsx` (create)

- [ ] **Step 1: Add the hardened background classes to globals.css**

In `src/app/globals.css`, after the `@keyframes drop-glow` block, add:

```css
/* Hero surfaces — kept here so the palette stays in one place (no inline hex). */
.hero-deepwater {
  background: radial-gradient(ellipse 140% 110% at 80% 0%, #1b5063 0%, #0d3147 30%, #0a2538 58%, #071c2b 100%);
}
.hero-drop {
  background: radial-gradient(circle at 50% 38%, #f9f0de, #f4e4c1 22%, #d4a24c 58%, rgba(212,162,76,0) 74%);
  box-shadow: 0 0 80px 22px rgba(212,162,76,0.38), 0 0 20px 6px rgba(244,228,193,0.22);
}
```

- [ ] **Step 2: Write the failing test**

Create `src/components/Hero.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("keeps the H1 with the Vrelo and Merak brand words", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Vrelo errichtet die Quelle/);
    expect(h1).toHaveTextContent(/Merak-Effekt/);
  });

  it("renders the ripple water panel image", () => {
    render(<Hero />);
    const img = screen.getByTestId("ripple-img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/video/ripples-poster.jpg");
  });

  it("uses the token-hardened deep-water background (no inline gradient)", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("hero-deepwater");
    expect(section?.getAttribute("style")).toBeFalsy();
  });

  it("keeps a single primary CTA", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Quelle erkunden" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `npx vitest run src/components/Hero.test.tsx`
Expected: FAIL — no ripple panel, inline style still present.

- [ ] **Step 4: Implement**

Replace `src/components/Hero.tsx` with:

```tsx
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";
import { RippleImage } from "@/components/RippleImage";

export function Hero() {
  return (
    <section className="hero-deepwater relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32 lg:py-40">
        {/* Left: the message */}
        <div>
          <h1 className="max-w-2xl text-[2.25rem] font-semibold leading-[1.13] tracking-[-0.02em] text-papier md:text-[3.25rem] md:leading-[1.1] lg:text-[3.75rem]">
            <BrandWord>Vrelo</BrandWord> errichtet die Quelle.{" "}
            <br className="hidden sm:block" />
            Du erlebst den <BrandWord>Merak</BrandWord>-Effekt.
          </h1>
          <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed tracking-[-0.005em] text-stein md:text-xl md:leading-relaxed">
            Maßgeschneiderte Automatisierungen für kleine Betriebe. Sie übernehmen den
            wiederkehrenden Kleinkram — du gewinnst Zeit, Ruhe und einen freien Kopf zurück.
          </p>
          <div className="mt-10">
            <CTAButton href="/kontakt" tone="dark" />
          </div>
        </div>

        {/* Right: the rippling water panel with the drop that seeds it */}
        <div className="relative">
          {/* The amber drop — single warm focal point, above the panel, seeds the ripple. */}
          <div
            aria-hidden
            className="hero-drop pointer-events-none absolute -top-6 right-10 z-10 h-16 w-16 rounded-full motion-safe:animate-drop-glow md:right-16 md:h-20 md:w-20"
          />
          <RippleImage
            src="/video/ripples-poster.jpg"
            alt=""
            seedXFraction={0.72}
            className="aspect-[16/10] w-full rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] ring-1 ring-gletscher/10 md:aspect-[4/5]"
          />
        </div>
      </div>
    </section>
  );
}
```

Notes: the drop's x (`right-10/right-16`) aligns with `seedXFraction={0.72}`; the panel image is
decorative (`alt=""`) — the narrative lives in the H1. The hairline water-surface accent is
dropped (the panel now carries the water); the LCP element is the static `<img>` inside
`RippleImage`.

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/components/Hero.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit + milestone gate**

```bash
git add src/components/Hero.tsx src/app/globals.css src/components/Hero.test.tsx
git commit -m "feat(hero): interactive water panel + drop-seeded ripple, token-hardened bg

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Run the full gate: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
Then manually verify with `npm start`: Hero ripple follows the cursor, the drop seeds a ripple,
and toggling OS reduced-motion shows the still image with no animation.

---

## Task 12: FAQ — „Was passiert nach dem Projekt?" (draft-to-verify)

**Files:**
- Modify: `src/lib/faq.ts`
- Test: `src/lib/faq.test.ts`

- [ ] **Step 1: Update the test**

In `src/lib/faq.test.ts`, add a new test inside `describe("faq data", ...)`:

```tsx
  it("answers what happens after the project (the long-term-partner cue)", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const after = all.find((e) => /Was passiert nach dem Projekt/i.test(e.question));
    expect(after).toBeDefined();
    expect(after!.answer).toMatch(/erreichbar|anpass/i);
  });
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/faq.test.ts`
Expected: FAIL — no such question yet.

- [ ] **Step 3: Implement**

In `src/lib/faq.ts`, add a fourth entry to the **"Zusammenarbeit"** group's `entries` array
(after "Arbeitest du auch remote?"). Use German typographic quotes — verify bytes after saving:

```ts
      {
        question: "Was passiert nach dem Projekt?",
        answer:
          "Du bist nicht allein: Ich bleibe erreichbar, und weil alles sauber dokumentiert ist, lässt sich dein System anpassen, wenn sich etwas in deinem Betrieb ändert.",
      },
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/faq.test.ts`
Expected: PASS (including the existing "unique questions" test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/faq.ts src/lib/faq.test.ts
git commit -m "feat(faq): 'Was passiert nach dem Projekt?' partner cue (draft-to-verify)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Leistungen — durability outcome (draft-to-verify)

**Files:**
- Modify: `src/lib/leistungen.ts`
- Test: `src/lib/leistungen.test.ts`

- [ ] **Step 1: Update the test**

In `src/lib/leistungen.test.ts`, add inside `describe("leistungen data", ...)`:

```tsx
  it("frames durability somewhere (the 'it still runs in a year' cue)", () => {
    const text = leistungen.map((l) => `${l.body} ${l.outcomes.join(" ")}`).join(" ");
    expect(text).toMatch(/dokumentiert|in einem Jahr|läuft/i);
  });
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/leistungen.test.ts`
Expected: It may already pass if "dokumentiert" appears — confirm by running. If it passes
already, still add the explicit durability clause in Step 3 so the cue is intentional and verify
the test stays green. If it fails, Step 3 makes it pass.

Note: the existing test asserts each service has **2–3** outcomes. Do **not** add a 4th outcome
(that would break it). Add the durability cue to a **body** string instead.

- [ ] **Step 3: Implement**

In `src/lib/leistungen.ts`, extend the `kommunikation` service's `body` with a durability clause
(German quotes not needed here — plain sentence). Replace its `body` value with:

```ts
    body: "Wiederkehrende E-Mails und Benachrichtigungen — Bestätigungen, Status-Updates, Rückmeldungen — laufen automatisch. Persönlich genug, dass niemand den Unterschied merkt. Sauber dokumentiert, damit es auch in einem Jahr noch läuft.",
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/leistungen.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/leistungen.ts src/lib/leistungen.test.ts
git commit -m "feat(leistungen): durability cue ('in einem Jahr noch') (draft-to-verify)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: Merak-Close — faint continuity note (draft-to-verify)

**Files:**
- Modify: `src/components/home/MerakClose.tsx`
- Test: `src/components/home/MerakClose.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/components/home/MerakClose.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MerakClose } from "./MerakClose";

describe("MerakClose", () => {
  it("keeps the Merak-Effekt close", () => {
    render(<MerakClose />);
    expect(screen.getByText(/Merak/)).toBeInTheDocument();
  });

  it("adds a quiet note of continuity (the beginning of a working relationship)", () => {
    const { container } = render(<MerakClose />);
    expect(container.textContent).toMatch(/Anfang|Zusammenarbeit|in Ruhe/i);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/home/MerakClose.test.tsx`
Expected: FAIL on the continuity assertion.

- [ ] **Step 3: Implement**

In `src/components/home/MerakClose.tsx`, replace the closing paragraph:

```tsx
      <p className="mt-6 max-w-xl text-lg text-tinte">
        Das ist der <BrandWord>Merak</BrandWord>-Effekt. Kein Druck — schau dir
        unverbindlich an, was möglich ist.
      </p>
```

with (adds one quiet continuity line — German quotes not used here; first person, no hype):

```tsx
      <p className="mt-6 max-w-xl text-lg text-tinte">
        Das ist der <BrandWord>Merak</BrandWord>-Effekt. Kein Druck — schau dir
        unverbindlich an, was möglich ist. Der Anfang einer ruhigen Zusammenarbeit, kein
        Verkaufsgespräch.
      </p>
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/home/MerakClose.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/MerakClose.tsx src/components/home/MerakClose.test.tsx
git commit -m "feat(home): faint continuity note in the Merak-close (draft-to-verify)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 15: GeschichteTeaser — eyebrow heading consistency

Every other home section uses a `<p>` eyebrow + `<h2>` heading. GeschichteTeaser makes the
eyebrow the `<h2>` and has no other heading. Align it: the eyebrow becomes a `<p>`, and the
blockquote remains the focal text. (Resolves the GeschichteTeaser-heading backlog item.)

**Files:**
- Modify: `src/components/home/GeschichteTeaser.tsx`
- Test: `src/components/home/GeschichteTeaser.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/components/home/GeschichteTeaser.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GeschichteTeaser } from "./GeschichteTeaser";

describe("GeschichteTeaser", () => {
  it("does not use a heading element for the small eyebrow label", () => {
    render(<GeschichteTeaser />);
    // 'Die Geschichte' is an eyebrow label, not a section heading.
    expect(screen.queryByRole("heading", { name: "Die Geschichte" })).toBeNull();
    expect(screen.getByText("Die Geschichte")).toBeInTheDocument();
  });

  it("keeps the Bosnian source quote", () => {
    render(<GeschichteTeaser />);
    expect(screen.getByText(/Quellen heilig/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/components/home/GeschichteTeaser.test.tsx`
Expected: FAIL — "Die Geschichte" is currently an `<h2>` (matched as a heading).

- [ ] **Step 3: Implement**

In `src/components/home/GeschichteTeaser.tsx`, change the eyebrow from `<h2>` to `<p>`:

```tsx
      <p className="text-sm font-medium uppercase tracking-wider text-ember">Die Geschichte</p>
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/components/home/GeschichteTeaser.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/GeschichteTeaser.tsx src/components/home/GeschichteTeaser.test.tsx
git commit -m "fix(home): demote GeschichteTeaser eyebrow from h2 to p (heading consistency)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 16: Final gate + manual verification

**No code change — verification only.**

- [ ] **Step 1: Full automated gate**

Run all and confirm green:
```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all pass; build completes (incl. `opengraph-image` + `icon` routes).

- [ ] **Step 2: Manual checks with `npm start`**

- Hero: ripple follows the cursor; the amber drop seeds a ripple on the interval; the static
  image is visible immediately (LCP).
- OS reduced-motion ON: Hero shows the still image, no ripple/seed; mobile drawer opens with no
  transition; drop glow does not animate.
- Mobile (narrow viewport): burger opens the full-screen deep-water drawer; Esc + ✕ + link tap
  all close it; focus returns to the burger; background does not scroll while open.
- Desktop: header shows the V-symbol lockup with „Vrelo" bottom-aligned; the current route link
  is petrol/active; footer shows the paper lockup.
- Homepage: „Was ich baue" and „Wie ich arbeite" render as petrol bands with legible text;
  the Hero remains the dominant deep-water moment.
- Favicon: the V-symbol shows in the browser tab.

- [ ] **Step 3: No commit** (verification task). If any check fails, fix in a follow-up commit
  referencing the relevant task.

---

## Self-Review (plan vs. spec)

**Spec coverage:**
- §1 Hero interactive water → Tasks 10 (RippleImage) + 11 (Hero layout, drop-seed, token-harden). ✓
- §2 Logo everywhere → Task 3 (BrandLockup), 5 (Header), 6 (Footer), 7 (favicon + OG), drawer in 4. ✓
- §3 Palette rhythm Option C → Task 1 (petrol tone), 8 (WasIchBaue), 9 (Steps). ✓
- §4 Partner framing (FAQ/Leistungen/Merak-Close) → Tasks 12, 13, 14. ✓
- §5 Impeccable polish → CTAButton tone (2), token-harden (11), card-radius unification (8/9),
  GeschichteTeaser heading (15), focus states (built into each component), final a11y/motion
  verification (16). ✓

**Type/name consistency:** `tone="petrol"` (Section) used in 8/9; `CTAButton tone="dark"` used in
4/11; `BrandLockup variant` "navy"/"paper" used in 5/6/4; `RippleImage` props `src/alt/className/
seedXFraction/seedIntervalMs` consistent between 10 and 11; `.hero-deepwater`/`.hero-drop` defined
in 11 and referenced only there. ✓

**Placeholder scan:** no TBD/"handle edge cases"/vague steps; every code step shows full code. ✓

**Watch-items carried from spec:** LCP (static img + deferred GL, verified in 16); dark dominance
(petrol not tiefes-wasser, contrast colors in 8/9); new copy is draft-to-verify (noted in 12/13/14);
German quotes byte-check (Task 12 + conventions).
