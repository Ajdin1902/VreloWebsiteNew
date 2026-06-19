# Kontakt Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/kontakt` into a focused, form-only page where the form sits in a calm dark deep-water card on the bright paper, with a redesigned confirmation state.

**Architecture:** Presentation-only change. The contact-form logic (`src/lib/contact.ts`, `src/app/kontakt/actions.ts`) is untouched. We restyle `ContactForm` for an on-dark surface, extract the success view into a testable `ContactSuccess` component, restructure `page.tsx` to drop the scheduler and wrap the form in a dark card, and add one new on-dark error-color token.

**Tech Stack:** Next.js 16 (App Router), React 19 (`useActionState`), Tailwind CSS v4 (`@theme` tokens in `globals.css`), Vitest + React Testing Library.

**Branch:** `feat/kontakt-redesign` (already checked out).

**Spec:** `docs/superpowers/specs/2026-06-19-kontakt-redesign-design.md`

---

## File Structure

- **Modify** `src/app/globals.css` — add `--color-signal` token (on-dark error text) + `.success-ring` glow utility.
- **Create** `src/components/kontakt/ContactSuccess.tsx` — the confirmation view (drop+ripple ring mark, headline, body, two next-step links). Extracted so it is testable in isolation.
- **Create** `src/components/kontakt/ContactSuccess.test.tsx` — its test.
- **Modify** `src/components/kontakt/ContactForm.tsx` — on-dark field styling, message-label copy change, on-dark error/link colors, render `<ContactSuccess/>` on success.
- **Modify** `src/components/kontakt/ContactForm.test.tsx` — update the message-label assertion.
- **Modify** `src/app/kontakt/page.tsx` — remove scheduler render + `calLink`/`SchedulerEmbed` imports; wrap form (and mailto fallback) in the dark card; replace „Oder schreib mir." with „Schreib mir." + a reassurance line; keep the banner.
- **Modify** `CLAUDE.md` — record the `--color-signal` gotcha; mark the Kontakt design pass done; note the scheduler re-add follow-up.

**Design tokens (verified ≥4.5:1 on `tiefes-wasser` #0a2538):** error text `--color-signal #f0a79a` (8.02:1); reused — labels/body/links `gletscher` (12.49:1), placeholder/secondary `stein` (7.48:1), CTA + ring `amber` (6.80:1). Fields use visible labels (no placeholders), so no placeholder-contrast work is needed.

---

## Task 1: Add the on-dark error token + ring-glow utility

**Files:**
- Modify: `src/app/globals.css:32` (inside `@theme`, after `--color-stumm`) and `:72` (after `.shadow-deepwater`)

- [ ] **Step 1: Add the `--color-signal` token**

In `src/app/globals.css`, inside the `@theme {…}` block, immediately after the `--color-stumm: #696359;` line (and its comment), add:

```css
  /* On-dark form error text. The `ember` error color is dark-on-light and fails
     on the dark contact card; signal is its light counterpart — a soft warm coral
     (not alarm-red, to stay calm), 8.02:1 on tiefes-wasser. Founder-confirm hue
     like stumm/ember. */
  --color-signal: #f0a79a;
```

- [ ] **Step 2: Add the `.success-ring` glow utility**

In `src/app/globals.css`, immediately after the `.shadow-deepwater { … }` rule (around line 72), add:

```css
/* Concentric amber glow for the Kontakt confirmation mark — a drop's ripple.
   Palette values kept here (not in markup) per the no-inline-hex convention. */
.success-ring {
  box-shadow:
    0 0 0 8px rgba(212, 162, 76, 0.10),
    0 0 0 18px rgba(212, 162, 76, 0.05);
}
```

- [ ] **Step 3: Verify the token compiles and is usable**

Run: `npm run build`
Expected: build succeeds (Tailwind v4 picks up the new `@theme` token, enabling `text-signal`).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(kontakt): add on-dark error token + ring-glow utility

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: ContactSuccess confirmation component (TDD)

**Files:**
- Create: `src/components/kontakt/ContactSuccess.tsx`
- Test: `src/components/kontakt/ContactSuccess.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/kontakt/ContactSuccess.test.tsx`:

```tsx
// src/components/kontakt/ContactSuccess.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactSuccess } from "./ContactSuccess";

describe("ContactSuccess", () => {
  it("shows the thank-you headline and two next-step links", () => {
    render(<ContactSuccess />);
    expect(screen.getByText(/ich melde mich/i)).toBeInTheDocument();
    const arbeit = screen.getByRole("link", { name: /Meine Arbeit ansehen/i });
    expect(arbeit).toHaveAttribute("href", "/leistungen");
    const ratgeber = screen.getByRole("link", { name: /Ratgeber lesen/i });
    expect(ratgeber).toHaveAttribute("href", "/ratgeber");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ContactSuccess`
Expected: FAIL — cannot resolve `./ContactSuccess` (module does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/components/kontakt/ContactSuccess.tsx` (note the spaced **en-dash** „ – ", U+2013, in the headline per brand):

```tsx
// src/components/kontakt/ContactSuccess.tsx
import Link from "next/link";

const linkClass =
  "text-gletscher underline underline-offset-2 hover:text-papier transition-colors";

export function ContactSuccess() {
  return (
    <div className="text-center">
      <div
        aria-hidden="true"
        className="success-ring mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber/60"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-amber" />
      </div>
      <p className="font-serif text-2xl text-papier">Danke – ich melde mich.</p>
      <p className="mx-auto mt-3 max-w-[34ch] text-sm leading-relaxed text-gletscher">
        Deine Nachricht ist bei mir. Ich antworte persönlich, meist innerhalb von ein, zwei Werktagen.
      </p>
      <div className="mt-6 flex justify-center gap-5 text-sm">
        <Link href="/leistungen" className={linkClass}>Meine Arbeit ansehen</Link>
        <Link href="/ratgeber" className={linkClass}>Ratgeber lesen</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ContactSuccess`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/kontakt/ContactSuccess.tsx src/components/kontakt/ContactSuccess.test.tsx
git commit -m "feat(kontakt): add ContactSuccess confirmation view

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Restyle ContactForm for the dark card + new label

**Files:**
- Modify: `src/components/kontakt/ContactForm.tsx`
- Modify: `src/components/kontakt/ContactForm.test.tsx:11`

- [ ] **Step 1: Update the message-label assertion (red first)**

In `src/components/kontakt/ContactForm.test.tsx`, change line 11 from:

```tsx
    expect(screen.getByLabelText(/Was frisst gerade deine Zeit/i)).toBeInTheDocument();
```

to:

```tsx
    expect(screen.getByLabelText(/Was raubt dir gerade deine Zeit/i)).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ContactForm`
Expected: FAIL — `getByLabelText(/Was raubt dir gerade deine Zeit/i)` finds nothing (label still says „Was frisst…").

- [ ] **Step 3: Rewrite ContactForm for the on-dark surface**

Replace the entire contents of `src/components/kontakt/ContactForm.tsx` with:

```tsx
// src/components/kontakt/ContactForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { sendContactMessage, type ContactState } from "@/app/kontakt/actions";
import { ContactSuccess } from "./ContactSuccess";

const initial: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initial);
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "ok") {
    return <ContactSuccess />;
  }

  const errors = state.status === "invalid" ? state.errors : {};
  // Repopulate fields after an error (React 19 resets the form on submit).
  const values =
    state.status === "invalid" || state.status === "error" ? state.values : undefined;
  const fieldClass =
    "mt-1 w-full rounded-md border border-gletscher/25 bg-gletscher/10 px-3 py-2 text-papier focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      {/* honeypot — hidden from humans and assistive tech */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="cf-name" className="text-sm font-medium text-gletscher">Name</label>
        <input id="cf-name" name="name" type="text" className={fieldClass} defaultValue={values?.name}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "cf-name-err" : undefined} />
        {errors.name && <p id="cf-name-err" className="mt-1 text-sm text-signal">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="cf-email" className="text-sm font-medium text-gletscher">E-Mail</label>
        <input id="cf-email" name="email" type="email" className={fieldClass} defaultValue={values?.email}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "cf-email-err" : undefined} />
        {errors.email && <p id="cf-email-err" className="mt-1 text-sm text-signal">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="cf-message" className="text-sm font-medium text-gletscher">Was raubt dir gerade deine Zeit?</label>
        <textarea id="cf-message" name="message" rows={5} className={fieldClass} defaultValue={values?.message}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "cf-message-err" : undefined} />
        {errors.message && <p id="cf-message-err" className="mt-1 text-sm text-signal">{errors.message}</p>}
      </div>

      <div>
        <label htmlFor="cf-company" className="text-sm font-medium text-gletscher">Betrieb <span className="text-stein">(optional)</span></label>
        <input id="cf-company" name="company" type="text" className={fieldClass} defaultValue={values?.company} />
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-gletscher">
          <input type="checkbox" name="consent" className="mt-1"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "cf-consent-err" : undefined} />
          <span>
            Ich habe die <Link href="/datenschutz" className="text-gletscher underline underline-offset-2 hover:text-papier">Datenschutzerklärung</Link> gelesen und bin einverstanden.
          </span>
        </label>
        {errors.consent && <p id="cf-consent-err" className="mt-1 text-sm text-signal">{errors.consent}</p>}
      </div>

      {state.status === "error" && <p className="text-sm text-signal">{state.message}</p>}

      <button type="submit" disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-amber">
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
```

Key changes from the original: labels `text-tiefes-wasser`→`text-gletscher`; field bg `bg-papier`+`border-faden`→`bg-gletscher/10`+`border-gletscher/25`, text `text-tinte`→`text-papier`, focus ring-offset `papier`→`tiefes-wasser`; error text `text-ember`→`text-signal`; `(optional)` `text-stumm`→`text-stein`; Datenschutz link `text-vrelo-petrol`→on-dark light link; success branch now `<ContactSuccess />`; message label copy changed; outer form drops `max-w-xl` (the card owns width now).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- ContactForm`
Expected: PASS (both tests — fields incl. the new label, and the honeypot).

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/kontakt/ContactForm.tsx src/components/kontakt/ContactForm.test.tsx
git commit -m "feat(kontakt): restyle form for dark card; relabel message field; success view

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Restructure the page — form-only, dark card, drop scheduler

**Files:**
- Modify: `src/app/kontakt/page.tsx`

- [ ] **Step 1: Replace the page contents**

Replace the entire contents of `src/app/kontakt/page.tsx` with (removes `SchedulerEmbed` + `calLink`; wraps the form and the mailto fallback in the dark card; „Oder schreib mir." → „Schreib mir." + reassurance; banner unchanged):

```tsx
// src/app/kontakt/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { PageImage } from "@/components/PageImage";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { ContactForm } from "@/components/kontakt/ContactForm";
import { isContactConfigured, contactTo } from "@/lib/contact";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/kontakt") },
  title: "Kontakt",
  description:
    "Schreib mir, was dich täglich Zeit kostet – ich melde mich und sage dir ehrlich, ob und wie ich helfen kann.",
};

export default function KontaktPage() {
  const configured = isContactConfigured();
  const to = contactTo();
  return (
    <>
      <PageIntro
        eyebrow="Kontakt"
        title="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet – ich melde mich und sage dir ehrlich, ob und wie ich helfen kann."
      />

      <Section tone="paper">
        <div className="mx-auto max-w-xl rounded-2xl bg-tiefes-wasser p-8 shadow-deepwater card-depth md:p-10">
          <h2 className="font-serif text-2xl font-medium text-papier">Schreib mir.</h2>
          <p className="mt-2 text-sm text-gletscher">Ein, zwei Sätze genügen. Ich antworte persönlich.</p>
          <div className="mt-6">
            {configured ? (
              <ContactForm />
            ) : to ? (
              <p className="text-gletscher">
                Schreib mir direkt:{" "}
                <a
                  href={`mailto:${to}`}
                  className="text-gletscher underline underline-offset-2 hover:text-papier"
                >
                  {to}
                </a>
                .
              </p>
            ) : (
              <p className="text-gletscher">
                Ruf mich an oder schreib mir – das Formular schalte ich in Kürze frei.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section tone="paper" className="border-t border-faden">
        <PageImage
          src="/images/kontakt-banner.webp"
          alt="Eine ruhige Wasseroberfläche im warmen Morgenlicht; ein erster sanfter Ring breitet sich aus."
          ratio="aspect-[21/9]"
        />
      </Section>

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
```

- [ ] **Step 2: Type-check + lint + full test + build**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: all green. (No remaining import of `SchedulerEmbed`/`calLink` in this file; `SchedulerEmbed.tsx` and its test remain in the repo, unused by the page.)

- [ ] **Step 3: Commit**

```bash
git add src/app/kontakt/page.tsx
git commit -m "feat(kontakt): form-only page in a dark card; drop scheduler render

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Browser verification (impeccable live) at 1440 / 390

**Files:** none (verification + any small style fixes)

- [ ] **Step 1: Start the app**

Run: `npm start` (per repo convention, not `npm run dev`, for Playwright/manual checks). If a production build is required first, run `npm run build` then `npm start`.

- [ ] **Step 2: Verify the form state at 1440 and 390**

Navigate to `http://localhost:3000/kontakt`. Confirm:
- The form sits in a dark deep-water card on papier, centred, with the soft deep-water shadow.
- „Schreib mir." + reassurance read clearly; labels/inputs are comfortable (light text on the translucent fields).
- Amber „Nachricht senden" button; amber focus-visible ring is visible when tabbing fields (offset over the dark card).
- The water banner sits calmly below the card.
- At 390 the card has comfortable padding and nothing overflows.

- [ ] **Step 3: Verify the confirmation + error states**

- Submit a valid message (wait >3 s — time-trap) → the card swaps to the `ContactSuccess` view: drop+ripple ring mark, „Danke – ich melde mich.", the response line, and the two links („Meine Arbeit ansehen" → /leistungen, „Ratgeber lesen" → /ratgeber). Click each link to confirm the targets.
- Submit empty / bad email → inline errors render in the light `signal` coral and are legible on the dark card.

- [ ] **Step 4: AA + reduced-motion spot-check**

- Confirm on-dark text is legible: labels/body/links (`gletscher`, 12.49:1), `(optional)` (`stein`, 7.48:1), errors (`signal`, 8.02:1), button (`amber`, 6.80:1) — all clear AA.
- The ring mark is a static box-shadow (no animation), so `prefers-reduced-motion` needs no extra handling — confirm nothing animates.

- [ ] **Step 5: Fix + commit any visual adjustments**

If any spacing/contrast tweak is needed, make it, re-verify, then:

```bash
git add -A
git commit -m "style(kontakt): browser-verified spacing/contrast tweaks

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

If no changes were needed, skip the commit.

---

## Task 6: Typography byte-check + docs + final gate

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: German typography byte-check on changed files**

Run:

```bash
python - <<'PY'
import re, pathlib
files = ["src/components/kontakt/ContactSuccess.tsx",
         "src/app/kontakt/page.tsx",
         "src/components/kontakt/ContactForm.tsx"]
for f in files:
    s = pathlib.Path(f).read_text(encoding="utf-8")
    o, c = s.count("„"), s.count("“")
    em = s.count("—")  # em-dash should NOT appear in client copy
    print(f"{f}: open„={o} close“={c} em—={em}")
PY
```

Expected: in any file that uses German quotes, `open„` equals `close“`; `em—` is `0` in all three (the confirmation headline uses the spaced en-dash „ – "). If a closing quote was downgraded to ASCII or an em-dash slipped in, fix the byte and re-run.

- [ ] **Step 2: Record the new token gotcha + status in CLAUDE.md**

In `CLAUDE.md`, under `## Gotchas`, add after the `ember token` line:

```markdown
- **signal token = `#f0a79a`** — the **on-dark** form-error color (light warm coral). `ember` is dark-on-light and fails on the dark Kontakt card; `signal` is its light counterpart, **8.02:1 on `tiefes-wasser`**. Founder-confirm hue like `ember`/`stumm`. Used by `ContactForm` error text on the dark card only.
```

Then in `## Next session — planned work`, update item 2 to record that **Kontakt is done** (leaving Newsletter + legal as the remaining design-pass pages), and add a one-line follow-up that the **Cal.com scheduler still needs re-adding** to `/kontakt` once `NEXT_PUBLIC_CAL_LINK` is set (the `SchedulerEmbed` component is preserved, just unrendered).

- [ ] **Step 3: Verify the CLAUDE.md edit kept its smart quotes**

Run:

```bash
python - <<'PY'
import pathlib
s = pathlib.Path("CLAUDE.md").read_text(encoding="utf-8")
print("signal token line present:", "signal token = `#f0a79a`" in s)
PY
```

Expected: `True`. Spot-check that any „…" you added closes with `“` (U+201C), not ASCII.

- [ ] **Step 4: Final full gate**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(kontakt): record signal token gotcha; mark design pass done

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Done criteria

- `/kontakt` is form-only: no scheduler block; the form lives in a dark deep-water card on papier; the water banner closes the page.
- Message field reads „Was raubt dir gerade deine Zeit?".
- Submitting shows the redesigned `ContactSuccess` view (drop+ripple ring, „Danke – ich melde mich.", response line, two links).
- All on-dark text clears WCAG AA; the new `--color-signal` token is the only palette addition.
- `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` all pass; German typography byte-verified.
- The merge to `main` is handled separately via the finishing-a-development-branch skill (not part of this plan).
