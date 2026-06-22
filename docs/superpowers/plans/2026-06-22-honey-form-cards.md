# Honey (Merak) form cards — Implementation Plan

> Steps use checkbox (`- [ ]`). TDD where testable; browser-verify the visual.

**Goal:** Recolour the Newsletter + Kontakt form cards from dark navy to honig honey on the petrol water, inverting the text/controls to an on-light-warm scheme.

**Tech Stack:** Next.js 16, TS, Tailwind v4, Vitest + RTL.

---

### Task 1: Token + light link helper

- [ ] **globals.css** — add under the neutral/error tokens:
  `--color-signal-tief: #8f3526;` with an AA-justification comment (on-light error,
  pairs with `signal`).
- [ ] **onDarkLink.ts** — add
  `export const lightLinkClass = "text-vrelo-petrol underline underline-offset-2 hover:text-tiefes-wasser transition-colors";`
- [ ] **Test (onDarkLink.test.ts, create)** — assert `lightLinkClass` contains
  `text-vrelo-petrol`. Run `npm test -- onDarkLink` → PASS.
- [ ] **Commit** — `feat(ui): add on-light error token + lightLinkClass`.

---

### Task 2: Newsletter honey card

- [ ] **NewsletterForm.tsx** (full branch only): card `bg-tiefes-wasser …ring-gletscher/15`
  → `bg-honig … shadow-deepwater` (no ring); `text-papier` h2 → `text-tiefes-wasser`;
  subtext `text-gletscher` → `text-tiefes-wasser/80`. Full-variant strings:
  - `inputClass` (full) → `mt-1 w-full rounded-md border border-tiefes-wasser/20 bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-honig`
  - `labelClass` (full) → `text-sm font-medium text-tiefes-wasser`
  - `consentClass` (full) → `text-sm text-tinte`
  - `errorClass` (full) → `text-sm text-signal-tief`
  - `consentLinkClass` (full) → `lightLinkClass`
  - button: add a `buttonClass` branch — full →
    `bg-tiefes-wasser text-papier hover:bg-vrelo-petrol focus-visible:ring-tiefes-wasser focus-visible:ring-offset-honig`; compact keeps the amber button. Replace the inline button class with the branch (keep the shared layout utilities `inline-flex … rounded-lg px-5 py-2.5 text-sm font-semibold … disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`).
  Import `lightLinkClass`; keep `darkLinkClass` import only if still used (compact uses `underline` not darkLinkClass — so drop darkLinkClass import).
- [ ] **Test (NewsletterForm.test.tsx, create)** — render `<NewsletterForm />` (full);
  assert the card container has `bg-honig`. Run → PASS.
- [ ] **app/newsletter/page.tsx** — placeholder card `bg-tiefes-wasser …` → `bg-honig …`
  (drop ring); `text-gletscher` → `text-tinte`.
- [ ] **Commit** — `feat(newsletter): honey form card with on-light text`.

---

### Task 3: Kontakt honey card

- [ ] **CardHeading.tsx** — h2 `text-papier` → `text-tiefes-wasser`; subtext
  `text-gletscher` → `text-tiefes-wasser/80`.
- [ ] **Test (CardHeading.test.tsx, create)** — heading has `text-tiefes-wasser`. PASS.
- [ ] **ContactForm.tsx** — `fieldClass` → the same light input string as NewsletterForm
  full; labels `text-gletscher` → `text-tiefes-wasser`; all `text-signal` → `text-signal-tief`;
  button → navy (same as NewsletterForm full button); consent `darkLinkClass` →
  `lightLinkClass` (swap import).
- [ ] **ContactSuccess.tsx** — heading `text-papier` → `text-tiefes-wasser`; body
  `text-gletscher` → `text-tinte`; links `darkLinkClass` → `lightLinkClass`; ring
  `border-amber/60` → `border-tiefes-wasser/40`, dot `bg-amber` → `bg-tiefes-wasser`.
- [ ] **Test (ContactSuccess.test.tsx, create)** — heading has `text-tiefes-wasser`. PASS.
- [ ] **app/kontakt/page.tsx** — form card `bg-tiefes-wasser …ring-gletscher/15` →
  `bg-honig … shadow-deepwater` (no ring); placeholder `text-gletscher` → `text-tinte`;
  mailto `darkLinkClass` → `lightLinkClass`.
- [ ] **Commit** — `feat(kontakt): honey form card with on-light text`.

---

### Task 4: Gate, verify, ship

- [ ] **Gate** — `npx tsc --noEmit` · `npm run lint` · `npm test` (all green) · `npm run build`.
- [ ] **Browser** (rebuild with dummy env so forms render; :3001) — `/newsletter` +
  `/kontakt` (form, placeholder, success) at 1440 + 390: honey card on petrol; dark
  headings/body legible; papier inputs read; navy button pops; petrol links; error text
  (`signal-tief`) legible; focus rings visible; 0 console errors. Tweak only if needed.
- [ ] **Push** — push all stacked commits to `origin main` (Vercel auto-deploys prod).
- [ ] **Consolidate** — update Website CLAUDE.md with the full dark-rhythm + honey-card pass.

---

## Verification
- German typography untouched (class-only edits).
- Existing newsletter/kontakt action + confirm + component tests stay green.
