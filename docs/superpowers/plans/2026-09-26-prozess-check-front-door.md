# Prozess-Check Front Door Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the free Prozess-Check the primary call to action on every page of vrelo-ki.de, with a per-placement `?src=` slug, a new homepage section that replaces Steps, and the Erstgespräch kept as a quiet secondary link.

**Architecture:** One lib module (`src/lib/prozessCheckCta.ts`) owns every slug, the `checkHref()` helper and all new German copy (components hold no German). One small `SecondaryLink` component renders the quiet second path in dark and light tones. `ClosingCta` gains a `src` prop and a `primary` switch; every caller passes its slug. The homepage example card is rendered from the real `resultCopy()` with fixed sample answers, so it cannot drift from the live result screen.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-26-prozess-check-front-door-design.md` — read it first; this plan implements §1–§3 and the one code item of §4 (the `/empfehlung/:partner` redirect).

## Global Constraints

- Every primary CTA links to `/prozess-check?src=<slug>`; slugs exactly as in spec §1 (`header`, `home-hero`, `home-check`, `home-close`, `leistungen-audit`, `leistungen-einwand`, `leistungen-close`, `ratgeber`, `ueber-mich`, `faq`, `kontakt`, `footer`, `karte`); `home-steps` does not exist.
- Every slug must pass `normalizeSource()` from `src/lib/source.ts` unchanged.
- The one exception: `/faq` keeps `/kontakt` as its primary button; the check is its secondary link.
- German copy: du-Form, generic masculine, „…“ quotes (U+201E / U+201C), never ASCII `"` inside German, **no Gedankenstrich** (neither U+2013 nor U+2014), no € amount, no „€500-Wert“, no vendor or mechanism names (n8n, Claude).
- Components hold no new German strings; new copy lives in `src/lib/prozessCheckCta.ts` (page-level ClosingCta headings/leads stay inline in the page files, as today).
- `CTAButton`'s default label „Zeit zurückgewinnen“ stays unchanged (asserted in `CTAButton.test.tsx`); check buttons pass their label explicitly.
- `/prozess-check` is a focus route and must never appear in `navLinks` (asserted in `nav.test.ts`); the footer gets its own link.
- Work on branch `feat/prozess-check-front-door`. **Never push to `main` without Ajdin's explicit OK** — a push to `main` auto-deploys production.
- Commits end with a `Co-Authored-By:` line naming the model that actually wrote them.
- The Edit/Write tools can silently downgrade „“ to ASCII — byte-check every changed file (Task 9).

## Review Focus

1. **The quiz changes its step count** → the teaser still says „Sechs kurze Fragen“ and becomes an untrue claim (UWG §5). Expected: a test fails. Pinned in Task 1 (`STEPS` has length 6).
2. **A partner name that fails `normalizeSource`** (umlaut, uppercase is fine, more than two hyphens, longer than 24 chars) → `/empfehlung/<name>` still loads the check but the booking silently says „Website“. Expected: known naming rule, documented and pinned. Pinned in Task 8.
3. **The example card read as a real result or a promise** → must always show the visible „Beispiel“ label and the note. Pinned in Task 5.
4. **`/prozess-check` showing a header CTA pointing at itself** → the focus route must keep its logo-only chrome. Pinned in Task 4.
5. **Mobile header at 360 px** → the compact „Prozess-Check“ button (one character longer than „Erstgespräch“) plus the burger must not overflow. Manual check in Task 9, step 4.

---

### Task 1: CTA module — slugs, href helper, copy, sample answers

**Files:**
- Create: `src/lib/prozessCheckCta.ts`
- Create: `src/lib/prozessCheckCta.test.ts`
- Modify: `src/lib/prozessCheck.ts` (export `hoursLabel`)
- Modify: `src/components/prozess-check/Result.tsx` (import `hoursLabel` instead of the local copy)
- Modify: `src/lib/prozessCheck.test.ts` (one test for `hoursLabel`)

**Interfaces:**
- Produces: `CHECK_SRC` (const object of slugs), `type CheckSrc`, `checkHref(src: CheckSrc): string`, `CHECK_CTA` (labels/microcopy/secondary-link copy/kontakt hint), `CHECK_TEASER` (homepage section copy), `SAMPLE_ANSWERS: ProzessCheckAnswers`; from `prozessCheck.ts`: `hoursLabel(n: number): string`.

- [ ] **Step 0: Create the branch**

```bash
cd Website
git checkout -b feat/prozess-check-front-door
```

- [ ] **Step 1: Write the failing test**

Create `src/lib/prozessCheckCta.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CHECK_SRC, CHECK_CTA, CHECK_TEASER, SAMPLE_ANSWERS, checkHref } from "./prozessCheckCta";
import { normalizeSource } from "./source";
import { STEPS, resultCopy } from "./prozessCheck";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const copy = [...strings(CHECK_CTA), ...strings(CHECK_TEASER)];

describe("CHECK_SRC", () => {
  it("uses slugs that survive normalizeSource unchanged", () => {
    for (const slug of Object.values(CHECK_SRC)) {
      expect(normalizeSource(slug), slug).toBe(slug);
    }
  });

  it("has no duplicate slugs and no retired home-steps slug", () => {
    const slugs = Object.values(CHECK_SRC);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).not.toContain("home-steps");
  });

  it("builds the check href with the slug", () => {
    expect(checkHref(CHECK_SRC.homeHero)).toBe("/prozess-check?src=home-hero");
  });
});

describe("check copy", () => {
  it("uses German quotes, never ASCII double quotes", () => {
    expect(copy.filter((s) => s.includes('"'))).toEqual([]);
  });

  it("uses no dash at all (Gedankenstrich retired site-wide)", () => {
    expect(copy.filter((s) => s.includes("—") || s.includes("–"))).toEqual([]);
  });

  it("names no price anywhere", () => {
    expect(copy.filter((s) => /€|\bEUR\b|\d\s*(Euro|netto)\b|\b500\b/i.test(s))).toEqual([]);
  });

  it("never names the mechanism", () => {
    expect(copy.filter((s) => /\bn8n\b|claude/i.test(s))).toEqual([]);
  });

  // Review Focus 1: the teaser promises „Sechs kurze Fragen“. If the quiz
  // gains or loses a step, this claim must be rewritten before shipping.
  it("promises exactly as many questions as the quiz has", () => {
    expect(CHECK_TEASER.steps[0].title).toBe("Sechs kurze Fragen");
    expect(STEPS).toHaveLength(6);
  });

  it("has three teaser steps, the last one carrying the build path", () => {
    expect(CHECK_TEASER.steps).toHaveLength(3);
    expect(CHECK_TEASER.steps[2].text).toContain("läuft von selbst");
  });
});

describe("SAMPLE_ANSWERS", () => {
  it("produce a nine-hour example led by Rechnungen", () => {
    const r = resultCopy(SAMPLE_ANSWERS);
    expect(r.fits).toBe(true);
    expect(r.headline).toBe("Rund 9 Stunden pro Woche");
    expect(r.topAreas.map((a) => a.id)).toEqual(["rechnungen", "anfragen", "daten"]);
  });
});
```

Append to `src/lib/prozessCheck.test.ts` (inside the file, as a new `describe`; add `hoursLabel` to the existing import from `./prozessCheck`):

```ts
describe("hoursLabel", () => {
  it("uses the singular for one hour", () => {
    expect(hoursLabel(1)).toBe("1 Stunde");
    expect(hoursLabel(4)).toBe("4 Stunden");
    expect(hoursLabel(0)).toBe("0 Stunden");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/prozessCheckCta.test.ts src/lib/prozessCheck.test.ts`
Expected: FAIL — cannot resolve `./prozessCheckCta`; `hoursLabel` is not exported.

- [ ] **Step 3: Implement**

Create `src/lib/prozessCheckCta.ts`:

```ts
// src/lib/prozessCheckCta.ts
//
// The Prozess-Check is the site's front door (spec 2026-09-26,
// docs/superpowers/specs/2026-09-26-prozess-check-front-door-design.md).
// Every primary CTA links to /prozess-check with its own ?src= slug, which the
// page writes into the Cal booking notes and the result e-mail, so each booked
// call shows the button it came from. Components hold no German.
import type { ProzessCheckAnswers } from "@/lib/prozessCheck";

export const CHECK_SRC = {
  header: "header",
  homeHero: "home-hero",
  homeCheck: "home-check",
  homeClose: "home-close",
  leistungenAudit: "leistungen-audit",
  leistungenEinwand: "leistungen-einwand",
  leistungenClose: "leistungen-close",
  ratgeber: "ratgeber",
  ueberMich: "ueber-mich",
  faq: "faq",
  kontakt: "kontakt",
  footer: "footer",
  karte: "karte",
} as const;

export type CheckSrc = (typeof CHECK_SRC)[keyof typeof CHECK_SRC];

export function checkHref(src: CheckSrc): string {
  return `/prozess-check?src=${src}`;
}

export const CHECK_CTA = {
  label: "Prozess-Check starten",
  short: "Prozess-Check",
  microcopy: "Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.",
  // The quiet second path under a check button (warm visitors).
  directPrefix: "Lieber direkt reden?",
  directLabel: "Erstgespräch buchen",
  directHref: "/kontakt",
  // The quiet second path under a /kontakt button (the FAQ exception).
  checkPrefix: "Noch unsicher?",
  checkLabel: "Erst den Prozess-Check machen",
  // One line above the scheduler on /kontakt.
  kontaktHintPrefix: "Noch unsicher, ob sich ein Gespräch lohnt?",
  kontaktHintLink: "Der Prozess-Check",
  kontaktHintSuffix: "zeigt es dir in drei Minuten.",
} as const;

export const CHECK_TEASER = {
  eyebrow: "Der Prozess-Check",
  heading: "Wie viele Stunden sind es bei dir?",
  steps: [
    {
      title: "Sechs kurze Fragen",
      text: "Kein Login, nichts vorzubereiten. Du schätzt, ich rechne.",
    },
    {
      title: "Dein Ergebnis sofort",
      text: "Deine Stunden pro Woche und die Aufgabe, die dich am meisten kostet. Direkt auf dem Bildschirm, ohne E-Mail-Adresse.",
    },
    {
      title: "Wenn du willst: 30 Minuten mit mir",
      text: "Wir klären, welche Aufgabe ein System übernehmen kann. Lohnt sich etwas, bekommst du in ein bis zwei Tagen einen Fahrplan. Kostenlos, und er gehört dir. Auf Wunsch baue ich ihn dir, und die Arbeit läuft von selbst.",
    },
  ],
  exampleLabel: "Beispiel",
  exampleNote: "So sieht dein Ergebnis aus, gerechnet aus deinen eigenen Angaben.",
} as const;

// Fixed answers behind the homepage example card. Run through the real
// resultCopy(), so the preview always matches the live result screen.
export const SAMPLE_ANSWERS: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "2bis5",
  stunden: { anfragen: 3, auftraege: 0, rechnungen: 4, daten: 2, erinnern: 0, orga: 0 },
  nervt: "rechnungen",
  abende: "abundzu",
  versucht: "nichts",
};
```

In `src/lib/prozessCheck.ts`, add directly above `export type ResultCopy`:

```ts
/** „1 Stunde“ / „4 Stunden“: shared by the result screen and the homepage example. */
export function hoursLabel(n: number): string {
  return n === 1 ? "1 Stunde" : `${n} Stunden`;
}
```

In `src/components/prozess-check/Result.tsx`, delete the local `function hoursLabel(...) {...}` block and change the import to:

```ts
import { RESULT_UI, hoursLabel, type ResultCopy, type ProzessCheckAnswers } from "@/lib/prozessCheck";
```

- [ ] **Step 4: Copy pass with stop-slop**

Invoke the `stop-slop` skill on every German string in `CHECK_CTA` and `CHECK_TEASER`. Apply a change only if it keeps the approved meaning and Brand.md (Brand.md wins on conflict; no dash). Keep „Sechs kurze Fragen“, „Prozess-Check starten“ and „Erstgespräch buchen“ verbatim (tests and later tasks depend on them). List any wording change in the commit message.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/prozessCheckCta.test.ts src/lib/prozessCheck.test.ts src/components/prozess-check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/prozessCheckCta.ts src/lib/prozessCheckCta.test.ts src/lib/prozessCheck.ts src/lib/prozessCheck.test.ts src/components/prozess-check/Result.tsx
git commit -m "feat(check): CTA module with per-placement src slugs and teaser copy

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 2: SecondaryLink component

**Files:**
- Create: `src/components/SecondaryLink.tsx`
- Create: `src/components/SecondaryLink.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `SecondaryLink({ prefix: string; label: string; href: string; tone: "dark" | "light" })` — renders `<p>{prefix} <Link>{label}</Link></p>`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SecondaryLink } from "./SecondaryLink";

describe("SecondaryLink", () => {
  it("renders the prefix as text and only the label as the link", () => {
    render(<SecondaryLink tone="dark" prefix="Lieber direkt reden?" label="Erstgespräch buchen" href="/kontakt" />);
    expect(screen.getByText(/Lieber direkt reden\?/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Erstgespräch buchen" });
    expect(link).toHaveAttribute("href", "/kontakt");
  });

  it("uses light-on-dark colours for the dark tone", () => {
    render(<SecondaryLink tone="dark" prefix="p" label="l" href="/x" />);
    expect(screen.getByRole("link", { name: "l" })).toHaveClass("text-honig");
  });

  it("uses the deep ember that clears AA on warm bands for the light tone", () => {
    render(<SecondaryLink tone="light" prefix="p" label="l" href="/x" />);
    expect(screen.getByRole("link", { name: "l" })).toHaveClass("text-[#6f4a20]");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/SecondaryLink.test.tsx`
Expected: FAIL — cannot resolve `./SecondaryLink`.

- [ ] **Step 3: Implement**

```tsx
import Link from "next/link";

// The quiet second path under a primary button: „Lieber direkt reden?
// Erstgespräch buchen“ under a check button, or the check under a /kontakt
// button. Only the label is the link, so the prefix reads as a calm question.
// Light tone uses the deep ember #6f4a20: token ember only reaches ~3.9:1 on
// the warm water bands, #6f4a20 clears 4.7:1 (measured for home Referenzen).
export function SecondaryLink({
  prefix,
  label,
  href,
  tone,
}: {
  prefix: string;
  label: string;
  href: string;
  tone: "dark" | "light";
}) {
  const text = tone === "dark" ? "text-gletscher" : "text-tinte";
  const link =
    tone === "dark"
      ? "text-honig hover:text-papier focus-visible:ring-offset-tiefes-wasser"
      : "text-[#6f4a20] decoration-[#6f4a20]/40 hover:text-[#4d3216] focus-visible:ring-offset-papier";
  return (
    <p className={`mt-3 text-sm ${text}`}>
      {prefix}{" "}
      <Link
        href={href}
        className={`rounded-sm font-medium underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber ${link}`}
      >
        {label}
      </Link>
    </p>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/SecondaryLink.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SecondaryLink.tsx src/components/SecondaryLink.test.tsx
git commit -m "feat(ui): SecondaryLink for the quiet second path under a CTA

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 3: ClosingCta routes to the check, all five callers pass a slug

**Files:**
- Modify: `src/components/ClosingCta.tsx`
- Modify: `src/components/ClosingCta.test.tsx`
- Modify: `src/app/faq/page.tsx:28-31`
- Modify: `src/app/leistungen/page.tsx:63-66`
- Modify: `src/app/ratgeber/page.tsx:33-36`
- Modify: `src/app/ratgeber/[slug]/page.tsx:76-79`
- Modify: `src/app/ueber-mich/page.tsx:61-64`
- Modify: `src/app/ueber-mich/page.test.tsx` (one new test)

**Interfaces:**
- Consumes: `CHECK_SRC`, `CheckSrc`, `checkHref`, `CHECK_CTA` (Task 1); `SecondaryLink` (Task 2).
- Produces: `ClosingCta({ heading: string; lead: string; src: CheckSrc; primary?: "check" | "kontakt" })` — `ctaHref` prop is removed.

- [ ] **Step 1: Write the failing test**

Replace the body of `src/components/ClosingCta.test.tsx` with:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClosingCta } from "./ClosingCta";

describe("ClosingCta", () => {
  it("renders the heading (h2) and lead", () => {
    render(<ClosingCta heading="Los geht es." lead="Schreib mir." src="ratgeber" />);
    expect(screen.getByRole("heading", { level: 2, name: "Los geht es." })).toBeInTheDocument();
    expect(screen.getByText("Schreib mir.")).toBeInTheDocument();
  });

  it("sends the primary button to the check with the caller's slug", () => {
    render(<ClosingCta heading="h" lead="l" src="leistungen-close" />);
    const cta = screen.getByRole("link", { name: "Prozess-Check starten" });
    expect(cta).toHaveAttribute("href", "/prozess-check?src=leistungen-close");
  });

  it("keeps the Erstgespräch as the quiet secondary link", () => {
    render(<ClosingCta heading="h" lead="l" src="ratgeber" />);
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });

  it("flips to /kontakt primary with the check as secondary (FAQ exception)", () => {
    render(<ClosingCta heading="h" lead="l" src="faq" primary="kontakt" />);
    expect(screen.getByRole("link", { name: "Zeit zurückgewinnen" })).toHaveAttribute("href", "/kontakt");
    expect(screen.getByRole("link", { name: "Erst den Prozess-Check machen" })).toHaveAttribute(
      "href",
      "/prozess-check?src=faq",
    );
  });

  it("keeps the ember heading and the navy (inverse) button on the warm band", () => {
    render(<ClosingCta heading="Los." lead="l" src="ratgeber" />);
    expect(screen.getByRole("heading", { level: 2, name: "Los." })).toHaveClass("text-ember");
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveClass("bg-tiefes-wasser");
  });
});
```

Append to `src/app/ueber-mich/page.test.tsx` (inside the existing `describe`):

```tsx
  it("closes on the Prozess-Check with the ueber-mich slug", () => {
    render(<UeberMichPage />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=ueber-mich",
    );
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/ClosingCta.test.tsx src/app/ueber-mich/page.test.tsx`
Expected: FAIL — no link named „Prozess-Check starten“.

- [ ] **Step 3: Implement ClosingCta**

Replace `src/components/ClosingCta.tsx` with:

```tsx
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { CTAButton } from "@/components/CTAButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { withBrandWords } from "@/components/BrandWord";
import { CHECK_CTA, checkHref, type CheckSrc } from "@/lib/prozessCheckCta";

// The site-wide close: every subpage ends on the same sunlit water surface —
// the subpage twin of the homepage's Proof→Merak "surface break". Dark bands
// above it carry deep water; this is where the page comes up for air. The
// image is very bright, so the sonnenlicht tint (0.7) mostly evens out its
// hot spots; the ember heading and tinte body were measured against the
// darkest (blue) patch and the brightest highlight — both clear AA.
//
// Front door (spec 2026-09-26): the button goes to the Prozess-Check with the
// caller's ?src= slug and the Erstgespräch sits under it as the quiet second
// path. primary="kontakt" flips the two (only /faq, where the visitor has a
// question and wants to write).
export function ClosingCta({
  heading,
  lead,
  src,
  primary = "check",
}: {
  heading: string;
  lead: string;
  src: CheckSrc;
  primary?: "check" | "kontakt";
}) {
  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-oberflaeche.webp" tintRgb="244 228 193" tintOpacity={0.7} />
      {/* The closing heading keeps its warm ember; only the button goes navy
          (inverse) — amber blended on the warm band, navy gives it contrast. */}
      <h2 className="max-w-2xl text-balance text-3xl font-semibold text-ember md:text-4xl">{heading}</h2>
      <p className="mt-5 max-w-xl text-pretty text-lg text-tinte">{withBrandWords(lead)}</p>
      <div className="mt-8">
        {primary === "check" ? (
          <>
            <CTAButton href={checkHref(src)} variant="inverse">
              {CHECK_CTA.label}
            </CTAButton>
            <SecondaryLink
              tone="light"
              prefix={CHECK_CTA.directPrefix}
              label={CHECK_CTA.directLabel}
              href={CHECK_CTA.directHref}
            />
          </>
        ) : (
          <>
            <CTAButton href="/kontakt" variant="inverse" />
            <SecondaryLink tone="light" prefix={CHECK_CTA.checkPrefix} label={CHECK_CTA.checkLabel} href={checkHref(src)} />
          </>
        )}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Update the five callers**

Each file adds `import { CHECK_SRC } from "@/lib/prozessCheckCta";` next to its other imports.

`src/app/faq/page.tsx`:

```tsx
      <ClosingCta
        heading="Offene Frage?"
        lead="Schreib mir kurz, was du wissen willst. Ich melde mich persönlich."
        src={CHECK_SRC.faq}
        primary="kontakt"
      />
```

`src/app/leistungen/page.tsx`:

```tsx
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Fang mit drei Minuten an: Der Prozess-Check zeigt dir, welche Aufgabe dich am meisten kostet. Danach reden wir, wenn du willst."
        src={CHECK_SRC.leistungenClose}
      />
```

`src/app/ratgeber/page.tsx` and `src/app/ratgeber/[slug]/page.tsx` (identical block):

```tsx
      <ClosingCta
        heading="Wie viel Zeit kostet dich das?"
        lead="Der Prozess-Check zeigt dir in drei Minuten, wie viele Stunden pro Woche bei dir in solchen Aufgaben stecken."
        src={CHECK_SRC.ratgeber}
      />
```

`src/app/ueber-mich/page.tsx`:

```tsx
      <ClosingCta
        heading="Fang klein an."
        lead="Der Prozess-Check zeigt dir in drei Minuten, wo deine Zeit hingeht. Wenn du danach reden willst, bin ich da."
        src={CHECK_SRC.ueberMich}
      />
```

- [ ] **Step 5: Run tests and type-check**

Run: `npx vitest run src/components/ClosingCta.test.tsx src/app/ueber-mich && npx tsc --noEmit`
Expected: PASS, and tsc reports no error (a caller without `src` would fail here).

- [ ] **Step 6: Commit**

```bash
git add src/components/ClosingCta.tsx src/components/ClosingCta.test.tsx src/app/faq/page.tsx src/app/leistungen/page.tsx src/app/ratgeber/page.tsx "src/app/ratgeber/[slug]/page.tsx" src/app/ueber-mich/page.tsx src/app/ueber-mich/page.test.tsx
git commit -m "feat(close): subpage closes route to the Prozess-Check (FAQ keeps /kontakt)

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 4: Header, mobile menu and footer

**Files:**
- Modify: `src/components/Header.tsx:45-53`
- Modify: `src/components/Header.test.tsx`
- Modify: `src/components/MobileNav.tsx:98-100`
- Modify: `src/components/MobileNav.test.tsx` (one new test)
- Modify: `src/components/Footer.tsx` (one `<li>` after the `navLinks` map)
- Modify: `src/components/Footer.test.tsx` (one new test)
- Modify: `src/lib/nav.test.ts` (one regression test)

**Interfaces:**
- Consumes: `CHECK_SRC`, `checkHref`, `CHECK_CTA` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests**

In `src/components/Header.test.tsx`, replace the test „keeps a compact CTA reachable on mobile“ with:

```tsx
  it("sends the desktop CTA to the Prozess-Check", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=header",
    );
  });

  it("keeps a compact Prozess-Check CTA reachable on mobile (one tap, outside the drawer)", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Prozess-Check" })).toHaveAttribute("href", "/prozess-check?src=header");
  });

  it("keeps Kontakt in the nav as the path to a call", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute("href", "/kontakt");
  });
```

Append to `src/components/MobileNav.test.tsx` (inside its `describe`; add `fireEvent` to the Testing Library import if missing, and keep any `next/navigation` mock the file already has):

```tsx
  it("puts the Prozess-Check CTA at the bottom of the open drawer", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=header",
    );
  });
```

Append to `src/components/Footer.test.tsx` (add `screen` to the import):

```tsx
  it("links the Prozess-Check outside navLinks (it is a focus route)", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Prozess-Check" })).toHaveAttribute("href", "/prozess-check?src=footer");
  });
```

Append to `src/lib/nav.test.ts` inside `describe("focus routes")` (Review Focus 4; this is a regression pin and is expected to pass already):

```ts
  it("keeps /prozess-check logo-only: no header CTA pointing at itself", () => {
    expect(isFocusRoute("/prozess-check")).toBe(true);
    expect(focusChrome["/prozess-check"].cta).toBeUndefined();
    expect(navLinks.map((l) => l.href)).not.toContain("/prozess-check");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/Header.test.tsx src/components/MobileNav.test.tsx src/components/Footer.test.tsx src/lib/nav.test.ts`
Expected: FAIL on the Header, MobileNav and Footer tests (no such links); the nav test PASSES.

- [ ] **Step 3: Implement**

`src/components/Header.tsx` — add `import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";` and replace the two CTA blocks:

```tsx
        <div className="hidden md:block">
          <CTAButton href={checkHref(CHECK_SRC.header)}>{CHECK_CTA.label}</CTAButton>
        </div>

        {/* Mobile: keep conversion one tap away — a compact CTA beside the burger
            (the full-label CTA above is desktop-only, the drawer costs two taps).
            Front door since 2026-09-26: the check, not the call; „Kontakt“ in
            the nav stays the path to a call. */}
        <div className="flex items-center gap-1 md:hidden">
          <CTAButton href={checkHref(CHECK_SRC.header)}>{CHECK_CTA.short}</CTAButton>
          <MobileNav />
        </div>
```

`src/components/MobileNav.tsx` — add the same import and replace the drawer CTA:

```tsx
          <div className="mt-auto pt-8">
            <CTAButton href={checkHref(CHECK_SRC.header)} tone="dark">
              {CHECK_CTA.label}
            </CTAButton>
          </div>
```

`src/components/Footer.tsx` — add the same import; inside `<ul className="space-y-2 text-sm">`, after the `navLinks.map(...)` block, add:

```tsx
            {/* Not in navLinks: /prozess-check is a focus route (nav.test.ts). */}
            <li>
              <Link
                href={checkHref(CHECK_SRC.footer)}
                className="rounded-sm text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
              >
                {CHECK_CTA.short}
              </Link>
            </li>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/Header.test.tsx src/components/MobileNav.test.tsx src/components/Footer.test.tsx src/lib/nav.test.ts src/components/CTAButton.test.tsx`
Expected: PASS (CTAButton's default-label test stays green).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/Header.test.tsx src/components/MobileNav.tsx src/components/MobileNav.test.tsx src/components/Footer.tsx src/components/Footer.test.tsx src/lib/nav.test.ts
git commit -m "feat(chrome): header, mobile menu and footer lead to the Prozess-Check

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 5: Homepage ProzessCheckSection with the example card

**Files:**
- Create: `src/components/home/ProzessCheckSection.tsx`
- Create: `src/components/home/ProzessCheckSection.test.tsx`

**Interfaces:**
- Consumes: `CHECK_CTA`, `CHECK_SRC`, `CHECK_TEASER`, `SAMPLE_ANSWERS`, `checkHref` (Task 1); `RESULT_UI`, `resultCopy`, `hoursLabel` from `@/lib/prozessCheck`.
- Produces: `ProzessCheckSection()` (no props).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProzessCheckSection } from "./ProzessCheckSection";
import { CHECK_TEASER, SAMPLE_ANSWERS } from "@/lib/prozessCheckCta";
import { resultCopy } from "@/lib/prozessCheck";

describe("ProzessCheckSection", () => {
  it("asks the visitor's own question as the h2", () => {
    render(<ProzessCheckSection />);
    expect(screen.getByRole("heading", { level: 2, name: CHECK_TEASER.heading })).toBeInTheDocument();
  });

  it("walks the three steps in order", () => {
    const { container } = render(<ProzessCheckSection />);
    const steps = container.querySelectorAll("ol > li");
    expect(steps).toHaveLength(3);
    CHECK_TEASER.steps.forEach((s, i) => expect(steps[i]).toHaveTextContent(s.title));
  });

  // Review Focus 3: the card must never read as a real result or a promise.
  it("labels the example card visibly as an example", () => {
    render(<ProzessCheckSection />);
    expect(screen.getByText(CHECK_TEASER.exampleLabel)).toBeVisible();
    expect(screen.getByText(CHECK_TEASER.exampleNote)).toBeInTheDocument();
  });

  it("renders the example from the real result logic", () => {
    render(<ProzessCheckSection />);
    const sample = resultCopy(SAMPLE_ANSWERS);
    expect(screen.getByText(sample.headline)).toBeInTheDocument();
    for (const a of sample.topAreas) expect(screen.getByText(a.label)).toBeInTheDocument();
    expect(screen.getByText(sample.topAreas[0].sentence)).toBeInTheDocument();
  });

  it("sends its button to the check with the home-check slug", () => {
    render(<ProzessCheckSection />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=home-check",
    );
    expect(screen.getByText("Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.")).toBeInTheDocument();
  });

  it("sits on the petrol band", () => {
    const { container } = render(<ProzessCheckSection />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/home/ProzessCheckSection.test.tsx`
Expected: FAIL — cannot resolve `./ProzessCheckSection`.

- [ ] **Step 3: Implement**

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { CHECK_CTA, CHECK_SRC, CHECK_TEASER, SAMPLE_ANSWERS, checkHref } from "@/lib/prozessCheckCta";
import { RESULT_UI, hoursLabel, resultCopy } from "@/lib/prozessCheck";

// The front door on the homepage (spec 2026-09-26): right after the Problem
// beat asks „how much time?“ in general, this section asks „how many hours for
// you?“ and shows the way in. It replaced Steps: its three steps are how
// starting with me works, and the last one carries the build path.
//
// The example card is the Perceived-Likelihood lever: the owner sees what he
// gets before he clicks. It is rendered from the real resultCopy() with fixed
// sample answers, so it can never drift from the live result screen, and it is
// always visibly labelled „Beispiel“ so it never reads as a claim (UWG §5).
//
// Plain petrol band, no backdrop image: it breaks the run of image sections on
// purpose, so the one action on the page reads as different. Papier heading and
// gletscher body on vrelo-petrol, the lesepapier card lifts off it (same tokens
// as the live result card).
const sample = resultCopy(SAMPLE_ANSWERS);
const maxHours = Math.max(...sample.topAreas.map((a) => a.hours));

export function ProzessCheckSection() {
  return (
    <Section id="prozess-check" tone="petrol" className="scroll-mt-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <div>
          <Reveal as="p" delayMs={0} className="text-sm font-semibold uppercase tracking-wider text-honig">
            {CHECK_TEASER.eyebrow}
          </Reveal>
          <Reveal as="h2" delayMs={80} className="mt-3 text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
            {CHECK_TEASER.heading}
          </Reveal>
          <Reveal as="ol" delayMs={160} className="mt-8 flex flex-col gap-6">
            {CHECK_TEASER.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber font-serif text-lg italic text-tiefes-wasser"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-papier">{s.title}</h3>
                  <p className="mt-1 text-pretty text-gletscher">{s.text}</p>
                </div>
              </li>
            ))}
          </Reveal>
          <Reveal delayMs={240} className="mt-8">
            <CTAButton href={checkHref(CHECK_SRC.homeCheck)} tone="petrol">
              {CHECK_CTA.label}
            </CTAButton>
            <p className="mt-3 text-sm text-gletscher">{CHECK_CTA.microcopy}</p>
          </Reveal>
        </div>

        <Reveal delayMs={200}>
          <figure className="card-depth rounded-2xl border border-faden bg-lesepapier p-6 md:p-8">
            <figcaption className="inline-block rounded-full bg-tiefes-wasser/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-tiefes-wasser">
              {CHECK_TEASER.exampleLabel}
            </figcaption>
            <p className="mt-4 text-balance font-serif text-3xl text-tiefes-wasser">{sample.headline}</p>
            <p className="mt-1 text-pretty font-serif text-lg text-tiefes-wasser">{sample.sub}</p>
            <p className="mt-6 text-sm font-medium uppercase tracking-wider text-stumm">{RESULT_UI.profileLabel}</p>
            <ul className="mt-3 space-y-3">
              {sample.topAreas.map((a) => (
                <li key={a.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-tiefes-wasser">{a.label}</span>
                    <span className="shrink-0 text-stumm">{hoursLabel(a.hours)}/Woche</span>
                  </div>
                  <div aria-hidden className="mt-1.5 h-2 rounded-full bg-faden">
                    <div className="h-2 rounded-full bg-amber" style={{ width: `${(a.hours / maxHours) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-pretty text-sm text-tinte">{sample.topAreas[0].sentence}</p>
            <p className="mt-4 text-xs text-stumm">{CHECK_TEASER.exampleNote}</p>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/home/ProzessCheckSection.test.tsx`
Expected: PASS. If `Section` does not forward `id`, check `src/components/Section.tsx` (home `Referenzen` passes `id`, so it should).

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ProzessCheckSection.tsx src/components/home/ProzessCheckSection.test.tsx
git commit -m "feat(home): Prozess-Check section with a labelled example result

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 6: Homepage wiring — Hero, Problem, Referenzen, MerakClose, order, Steps removed

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/page.test.tsx`
- Modify: `src/components/Hero.tsx:32-43`, `src/components/Hero.test.tsx`
- Modify: `src/components/home/Problem.tsx:48-60`, `src/components/home/Problem.test.tsx`
- Modify: `src/components/home/Referenzen.tsx:48-70`, `src/components/home/Referenzen.test.tsx`
- Modify: `src/components/home/MerakClose.tsx:30-38`, `src/components/home/MerakClose.test.tsx`
- Delete: `src/components/home/Steps.tsx`, `src/components/home/Steps.test.tsx`

**Interfaces:**
- Consumes: `ProzessCheckSection` (Task 5); `SecondaryLink` (Task 2); `CHECK_CTA`, `CHECK_SRC`, `checkHref` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests**

Create `src/app/page.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Home from "./page";

describe("homepage", () => {
  it("renders eight sections in front-door order, with no Steps section", () => {
    const { container } = render(<Home />);
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual([
      "Der Kleinkram frisst deinen Tag.",
      "Wie viele Stunden sind es bei dir?",
      "Ich nehme dir die immer gleichen Aufgaben ab.",
      "Läuft mit den Werkzeugen, die du schon nutzt.",
      "Sorgfältig gebaut. Verlässlich im Betrieb.",
      "So läuft es in echten Betrieben.",
      "Stell dir den Montagmorgen vor, an dem schon zwei Stunden Arbeit erledigt sind.",
    ]);
    expect(container.textContent).not.toContain("In drei klaren Schritten");
  });
});
```

(Seven h2s plus the hero's h1 = eight sections.)

In `src/components/Hero.test.tsx`, replace the tests „keeps a single primary CTA“, „names the concrete next step…“ and „applies the staggered reveal classes…“ with:

```tsx
  it("sends the one primary CTA to the Prozess-Check", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=home-hero",
    );
  });

  it("names the friction reducers under the CTA", () => {
    render(<Hero />);
    expect(screen.getByText("Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.")).toBeInTheDocument();
  });

  it("keeps the Erstgespräch as a quiet secondary link", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });

  it("applies the staggered reveal classes (H1 rise-only, sub + CTA fade-up)", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("hero-reveal-h1");
    expect(screen.getByText(/Wo du anfängst, zeigt dir der Prozess-Check/)).toHaveClass("hero-reveal-sub");
    const ctaWrapper = screen.getByRole("link", { name: "Prozess-Check starten" }).parentElement as HTMLElement;
    expect(ctaWrapper).toHaveClass("hero-reveal-cta");
  });
```

In `src/components/home/Problem.test.tsx`, replace „bridges to the Prozess-Check with exactly one link“ with:

```tsx
  it("ends on the pain with no link (the Prozess-Check section right after answers it)", () => {
    render(<Problem />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
```

In `src/components/home/Referenzen.test.tsx`, replace „bridges to the free Prozess-Check funnel“ with:

```tsx
  it("carries only the detail link (the check bridge moved to its own section)", () => {
    render(<Referenzen />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByText("Dein erster Schritt")).not.toBeInTheDocument();
  });
```

In `src/components/home/MerakClose.test.tsx`, replace „adds a quiet note of continuity…“ with:

```tsx
  it("names the three-minute first step and sends it to the check", () => {
    const { container } = render(<MerakClose />);
    expect(container.textContent).toMatch(/Der erste Schritt dauert drei Minuten/);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=home-close",
    );
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/page.test.tsx src/components/Hero.test.tsx src/components/home`
Expected: FAIL on the new/changed tests (old copy and links still present). `Steps.test.tsx` still passes until deleted.

- [ ] **Step 3: Implement Hero**

`src/components/Hero.tsx` — add imports `import { SecondaryLink } from "@/components/SecondaryLink";` and `import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";`; replace the subline paragraph's text and the CTA block:

```tsx
      <p className="hero-reveal-sub mt-6 max-w-xl text-pretty text-[1.05rem] leading-relaxed tracking-[-0.005em] text-gletscher md:text-xl md:leading-relaxed">
        Ich baue maßgeschneiderte Automatisierungen für deinen Betrieb. Wo du anfängst, zeigt dir der
        Prozess-Check: drei Minuten, und du siehst, wie viele Stunden pro Woche im Kleinkram stecken.
      </p>
      <div className="hero-reveal-cta mt-9">
        <CTAButton href={checkHref(CHECK_SRC.homeHero)} tone="dark">
          {CHECK_CTA.label}
        </CTAButton>
        {/* Friction reducer: name what the click costs (nothing) and returns (a result now). */}
        <p className="mt-3 text-sm text-gletscher">{CHECK_CTA.microcopy}</p>
        <SecondaryLink tone="dark" prefix={CHECK_CTA.directPrefix} label={CHECK_CTA.directLabel} href={CHECK_CTA.directHref} />
      </div>
```

- [ ] **Step 4: Implement Problem, Referenzen, MerakClose**

`src/components/home/Problem.tsx` — delete the final `<Reveal as="p" delayMs={320} ...>…</Reveal>` block (the „Wenn du nicht weißt, wo du anfangen sollst“ sentence and its comment) and the now-unused `import Link from "next/link";`.

`src/components/home/Referenzen.tsx` — delete the final `<Reveal as="div" delayMs={300} ...>…</Reveal>` block (the „Dein erster Schritt“ card and its comment). `Link` stays imported (the detail link uses it).

`src/components/home/MerakClose.tsx` — add imports `import { SecondaryLink } from "@/components/SecondaryLink";` and `import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";`; replace the lead and CTA:

```tsx
        <Reveal as="p" delayMs={80} className="mx-auto mt-6 max-w-xl text-pretty text-lg text-tinte">
          Das ist der <BrandWord>Merak</BrandWord>-Effekt. Der erste Schritt dauert drei Minuten: Der
          Prozess-Check zeigt dir, wo deine Stunden hingehen. Kein Verkaufsgespräch.
        </Reveal>
        <Reveal delayMs={160} className="mt-8">
          <CTAButton href={checkHref(CHECK_SRC.homeClose)}>{CHECK_CTA.label}</CTAButton>
          <SecondaryLink tone="light" prefix={CHECK_CTA.directPrefix} label={CHECK_CTA.directLabel} href={CHECK_CTA.directHref} />
        </Reveal>
```

- [ ] **Step 5: Rewire the page and delete Steps**

`src/app/page.tsx` — replace `import { Steps } from "@/components/home/Steps";` with `import { ProzessCheckSection } from "@/components/home/ProzessCheckSection";` and set the body to:

```tsx
      <Hero />
      <Problem />
      <ProzessCheckSection />
      <WasIchBaue />
      <Werkzeuge />
      <Proof />
      <Referenzen />
      <MerakClose />
```

Then:

```bash
git rm src/components/home/Steps.tsx src/components/home/Steps.test.tsx
```

Leave `public/images/bg-steps.webp` in place (spec §2).

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/app/page.test.tsx src/components/Hero.test.tsx src/components/home && npx tsc --noEmit`
Expected: PASS; no reference to `Steps` left (`grep -rn "home/Steps" src` prints nothing).

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx src/components/Hero.tsx src/components/Hero.test.tsx src/components/home
git commit -m "feat(home): the Prozess-Check replaces Steps and leads every homepage CTA

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 7: /leistungen audit card and objection row, FAQ entries

**Files:**
- Modify: `src/lib/prozess-audit.ts`, `src/lib/prozess-audit.test.ts`
- Modify: `src/components/leistungen/ProzessAudit.tsx:39-50`, `src/components/leistungen/ProzessAudit.test.tsx`
- Modify: `src/lib/leistungen-weg.ts:80`, `src/lib/leistungen-weg.test.ts:69`, `src/components/leistungen/WoranEsScheitert.test.tsx:19`
- Modify: `src/lib/faq.ts:79-82`, `src/lib/faq.test.ts`

**Interfaces:**
- Consumes: `CHECK_CTA`, `CHECK_SRC`, `checkHref` (Task 1).
- Produces: `ProzessAudit` type now has `secondary: { prefix: string; label: string; href: string }` instead of `check: { label; href }`.

- [ ] **Step 1: Write the failing tests**

`src/lib/prozess-audit.test.ts` — replace „routes the primary CTA to the booking page“ and „offers the Prozess-Check as a secondary on-ramp…“ with:

```ts
  it("routes the primary CTA to the Prozess-Check (front door, 2026-09-26)", () => {
    expect(prozessAudit.cta.href).toBe("/prozess-check?src=leistungen-audit");
    expect(prozessAudit.cta.label).toBe("Prozess-Check starten");
  });

  it("keeps the Erstgespräch as the quiet secondary path", () => {
    expect(prozessAudit.secondary.href).toBe("/kontakt");
    expect(prozessAudit.secondary.label).toBe("Erstgespräch buchen");
  });
```

`src/components/leistungen/ProzessAudit.test.tsx` — replace the two link tests with:

```tsx
  it("links the primary CTA to the Prozess-Check", () => {
    render(<ProzessAudit />);
    expect(screen.getByRole("link", { name: prozessAudit.cta.label })).toHaveAttribute(
      "href",
      "/prozess-check?src=leistungen-audit",
    );
  });

  it("links the quiet secondary path to the booking page", () => {
    render(<ProzessAudit />);
    expect(screen.getByRole("link", { name: prozessAudit.secondary.label })).toHaveAttribute("href", "/kontakt");
  });
```

`src/lib/leistungen-weg.test.ts:69` and `src/components/leistungen/WoranEsScheitert.test.tsx:19` — change the expected href `"/prozess-check"` to `"/prozess-check?src=leistungen-einwand"`.

`src/lib/faq.test.ts` — append inside the `describe`:

```ts
  it("starts people with the Prozess-Check", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const start = all.find((e) => e.question === "Wie fange ich an?");
    expect(start!.answer).toMatch(/^Mit dem Prozess-Check/);
  });

  it("answers whether the Prozess-Check is really free", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const free = all.find((e) => e.question === "Ist der Prozess-Check wirklich kostenlos?");
    expect(free).toBeDefined();
    expect(free!.answer).toMatch(/^Ja\./);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/prozess-audit.test.ts src/components/leistungen src/lib/leistungen-weg.test.ts src/lib/faq.test.ts`
Expected: FAIL on every changed/new test.

- [ ] **Step 3: Implement**

`src/lib/prozess-audit.ts` — add `import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";`; in the type replace `check: { label: string; href: string };` with `secondary: { prefix: string; label: string; href: string };`; replace the two fields at the end of the object and their comment:

```ts
  // Front door since 2026-09-26: primary = the Prozess-Check (answers travel
  // into the booking), secondary = the Erstgespräch for warm visitors.
  cta: { label: CHECK_CTA.label, href: checkHref(CHECK_SRC.leistungenAudit) },
  secondary: { prefix: CHECK_CTA.directPrefix, label: CHECK_CTA.directLabel, href: CHECK_CTA.directHref },
```

`src/components/leistungen/ProzessAudit.tsx` — replace the `<Link href={o.check.href} …>{o.check.label}</Link>` element with:

```tsx
        <p className="text-sm text-tinte">
          {o.secondary.prefix}{" "}
          <Link
            href={o.secondary.href}
            className="font-medium text-tiefes-wasser underline decoration-amber/60 underline-offset-4 transition-colors hover:decoration-amber"
          >
            {o.secondary.label}
          </Link>
        </p>
```

`src/lib/leistungen-weg.ts` — add `import { CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";` and change row 0's link to:

```ts
      link: { href: checkHref(CHECK_SRC.leistungenEinwand), label: "Zum Prozess-Check" },
```

`src/lib/faq.ts` — replace the „Wie fange ich an?“ entry with these two entries:

```ts
      {
        question: "Wie fange ich an?",
        answer:
          "Mit dem Prozess-Check: sechs kurze Fragen, drei Minuten, dein Ergebnis sofort. Wenn du danach reden willst, buchst du dir direkt 30 Minuten mit mir.",
      },
      {
        question: "Ist der Prozess-Check wirklich kostenlos?",
        answer:
          "Ja. Du bekommst Klarheit über deine Zeit, ich lerne deinen Betrieb kennen. Ob wir danach zusammenarbeiten, entscheidest du.",
      },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/prozess-audit.test.ts src/components/leistungen src/lib/leistungen-weg.test.ts src/lib/faq.test.ts src/lib/jsonld.test.ts`
Expected: PASS (the copy guards in `prozess-audit.test.ts` and `leistungen-weg.test.ts` now also walk the new strings).

- [ ] **Step 5: Commit**

```bash
git add src/lib/prozess-audit.ts src/lib/prozess-audit.test.ts src/components/leistungen src/lib/leistungen-weg.ts src/lib/leistungen-weg.test.ts src/lib/faq.ts src/lib/faq.test.ts
git commit -m "feat(leistungen,faq): audit card leads to the check; FAQ answers how to start

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 8: /kontakt hint, /karte button, /empfehlung/:partner redirect

**Files:**
- Create: `src/components/kontakt/CheckHint.tsx`, `src/components/kontakt/CheckHint.test.tsx`
- Modify: `src/app/kontakt/page.tsx` (render `<CheckHint />` first inside `WaterSection`)
- Modify: `src/app/karte/page.tsx` (button after „Kontakt speichern“), `src/app/karte/page.test.tsx`
- Modify: `next.config.ts` (one redirect), `src/lib/printRedirects.test.ts`

**Interfaces:**
- Consumes: `CHECK_CTA`, `CHECK_SRC`, `checkHref` (Task 1); `normalizeSource` (`src/lib/source.ts`).
- Produces: `CheckHint()` (no props); redirect `/empfehlung/:partner` → `/prozess-check?src=partner-:partner`.

- [ ] **Step 1: Write the failing tests**

`src/components/kontakt/CheckHint.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckHint } from "./CheckHint";

describe("CheckHint", () => {
  it("offers the undecided the Prozess-Check with the kontakt slug", () => {
    const { container } = render(<CheckHint />);
    expect(container.textContent).toBe(
      "Noch unsicher, ob sich ein Gespräch lohnt? Der Prozess-Check zeigt es dir in drei Minuten.",
    );
    expect(screen.getByRole("link", { name: "Der Prozess-Check" })).toHaveAttribute(
      "href",
      "/prozess-check?src=kontakt",
    );
  });
});
```

`src/app/karte/page.test.tsx` — append inside the `describe`:

```tsx
  it("offers the Prozess-Check under the save button", () => {
    render(<KartePage />);
    expect(screen.getByRole("link", { name: "Prozess-Check" }).getAttribute("href")).toBe("/prozess-check?src=karte");
  });
```

`src/lib/printRedirects.test.ts` — append a second `describe`:

```ts
// Referral partners get vrelo-ki.de/empfehlung/<name>; the booking notes then
// show who sent the lead (Tippgeber proof). Review Focus 2: a name that fails
// normalizeSource still loads the check, but attribution silently falls back
// to „Website“. Naming rule: lowercase a–z/0–9, at most two hyphens inside the
// name, at most 24 characters.
describe("partner referral links", () => {
  it("redirect /empfehlung/:partner to the check with a partner- slug", async () => {
    const redirects = await nextConfig.redirects!();
    const r = redirects.find((x) => x.source === "/empfehlung/:partner");
    expect(r).toBeDefined();
    expect(r!.destination).toBe("/prozess-check?src=partner-:partner");
    expect(r!.permanent).toBe(false);
  });

  it("keeps names inside the naming rule attributable", () => {
    expect(normalizeSource("partner-velp")).toBe("partner-velp");
    expect(normalizeSource("partner-muster-agentur")).toBe("partner-muster-agentur");
    expect(normalizeSource("partner-Velp")).toBe("partner-velp");
  });

  it("drops names outside the rule (documented, not silent)", () => {
    expect(normalizeSource("partner-a-b-c-d")).toBeUndefined();
    expect(normalizeSource("partner-müller")).toBeUndefined();
    expect(normalizeSource("partner-" + "a".repeat(25))).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/kontakt/CheckHint.test.tsx src/app/karte src/lib/printRedirects.test.ts`
Expected: FAIL on CheckHint (missing module), the karte link, and the redirect lookup; the two `normalizeSource` tests PASS.

- [ ] **Step 3: Implement**

`src/components/kontakt/CheckHint.tsx`:

```tsx
import Link from "next/link";
import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";

// /kontakt visitors are warm, so the scheduler stays first; this one line only
// catches the undecided. Sits on the dark WaterSection: gletscher text, honig
// link (the same on-dark pair as the homepage Problem link had).
export function CheckHint() {
  return (
    <p className="mx-auto mb-10 max-w-xl text-pretty text-center text-gletscher">
      {CHECK_CTA.kontaktHintPrefix}{" "}
      <Link
        href={checkHref(CHECK_SRC.kontakt)}
        className="rounded-sm font-medium text-honig underline underline-offset-4 hover:text-papier focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honig"
      >
        {CHECK_CTA.kontaktHintLink}
      </Link>{" "}
      {CHECK_CTA.kontaktHintSuffix}
    </p>
  );
}
```

`src/app/kontakt/page.tsx` — add `import { CheckHint } from "@/components/kontakt/CheckHint";` and render it as the first child of `WaterSection`, directly above `<SchedulerEmbed calLink={calLink()} />`:

```tsx
        <CheckHint />
        <SchedulerEmbed calLink={calLink()} />
```

`src/app/karte/page.tsx` — add `import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";` and directly after the „Kontakt speichern“ `<a>` add:

```tsx
        <Link
          href={checkHref(CHECK_SRC.karte)}
          className="mt-3 inline-block w-full rounded-xl border border-vrelo-petrol px-6 py-3 font-semibold text-vrelo-petrol"
        >
          {CHECK_CTA.short}
        </Link>
```

`next.config.ts` — directly after the `/flyer` redirect add:

```ts
      // Referral partners (agencies, Alen, MDZ owner): vrelo-ki.de/empfehlung/<name>.
      // Naming rule + attribution fallback pinned in printRedirects.test.ts.
      { source: "/empfehlung/:partner", destination: "/prozess-check?src=partner-:partner", permanent: false },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/kontakt src/app/karte src/lib/printRedirects.test.ts src/lib/parkedRoutes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/kontakt/CheckHint.tsx src/components/kontakt/CheckHint.test.tsx src/app/kontakt/page.tsx src/app/karte/page.tsx src/app/karte/page.test.tsx next.config.ts src/lib/printRedirects.test.ts
git commit -m "feat(check): kontakt hint, karte button, /empfehlung partner links

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

---

### Task 9: Verify end to end, byte-check copy, update Website CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (Website repo: Key decisions bullet „Primary CTA“, one changelog line, partner naming rule)

- [ ] **Step 1: Full suite, lint, types, build**

Run: `npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: all green; build lists `/empfehlung/:partner` among redirects implicitly (no error).

- [ ] **Step 2: Byte-check German punctuation in every changed file**

```bash
git diff --name-only main... | grep -E '\.(ts|tsx)$' | while read f; do
  perl -CSD -ne 'print "$ARGV:$.: dash\n" if /[\x{2013}\x{2014}]/ && !m{^\s*(//|\*|/\*)}; print "$ARGV:$.: right-dq\n" if /\x{201D}/' "$f"
done
```

Expected: no output. (Every non-ASCII char in the perl program is a `\x{…}` escape on purpose; a literal „ or ” would never match.) Comments may keep the em-dash; German strings may not.

- [ ] **Step 3: Grep for leftovers**

Run: `grep -rn 'href="/kontakt"' src/components src/app --include=*.tsx | grep -v test`
Expected: only `src/components/focus/FocusFooter.tsx` and `src/components/demo/Protokoll.tsx` (parked `/demo`) remain; every homepage/subpage primary CTA is gone from this list.

- [ ] **Step 4: Manual pass in the real app**

Run `npm start` (after the build) and open `http://localhost:3000` at 360 px, 768 px and 1280 px wide (Playwright MCP or a browser):
- Homepage: section order Hero → Problem → Prozess-Check → Was ich baue → Werkzeuge → Proof → Referenzen → MerakClose; the example card stacks under the steps on mobile; „Beispiel“ visible.
- **Review Focus 5:** at 360 px the header shows logo + „Prozess-Check“ button + burger on one line, no horizontal scroll.
- Click the hero button → `/prozess-check?src=home-hero`, logo-only chrome (no header CTA).
- `/leistungen`, `/ratgeber/<any slug>`, `/ueber-mich`, `/faq`, `/kontakt`, `/karte`: each button/link lands on the check with its slug; `/faq` close keeps „Zeit zurückgewinnen“ → `/kontakt`.
- `http://localhost:3000/empfehlung/velp` → `/prozess-check?src=partner-velp`.
- Contrast by eye on the secondary links (hero dark, MerakClose/ClosingCta warm, `/kontakt` hint on water); if one looks weak, measure it before shipping.

- [ ] **Step 5: Update Website CLAUDE.md**

In „Key decisions (locked)“, replace the bullet that starts with `**Primary CTA = „Zeit zurückgewinnen“**` with:

```markdown
- **Primary CTA = the Prozess-Check (front door, 2026-09-26).** Every primary button links to `/prozess-check?src=<slug>` via `checkHref()` in `src/lib/prozessCheckCta.ts` (slugs + copy live there, copy-guarded); the Erstgespräch sits under it as `SecondaryLink` („Lieber direkt reden? Erstgespräch buchen“). **One exception: `/faq`** keeps `/kontakt` primary (`ClosingCta primary="kontakt"`). `CTAButton`'s default „Zeit zurückgewinnen“ stays for `/kontakt` buttons. Partner links: `vrelo-ki.de/empfehlung/<name>` → `?src=partner-<name>`; **name rule:** lowercase a–z/0–9, max two hyphens, max 24 chars, or the booking silently says „Website“. Spec → `docs/superpowers/specs/2026-09-26-prozess-check-front-door-design.md`.
```

At the top of the changelog add:

```markdown
> - **2026-09-26** – **Prozess-Check als Haustür** (Branch `feat/prozess-check-front-door`): alle Haupt-Buttons → `/prozess-check?src=…`, Erstgespräch als stiller Zweitlink, neue Homepage-Sektion mit Beispiel-Ergebnis ersetzt Steps (8 Sektionen), FAQ-Ausnahme, `/kontakt`-Hinweis, `/karte`-Button, `/empfehlung/:partner`. Review der `src`-Zahlen am 2026-10-10.
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): record the Prozess-Check front door

Co-Authored-By: <model that wrote this> <noreply@anthropic.com>"
```

- [ ] **Step 7: Stop — ask before shipping**

Do **not** push. Report to Ajdin: test/build results, the manual-pass screenshots at 360 px and 1280 px, and any stop-slop wording changes from Task 1. Merge to `main` and push (auto-deploy) only after his explicit OK.
