# /leistungen — Trim Services + Invert Tone Ribbon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or
> superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Trim the `/leistungen` service menu from seven cards to four, and invert the page's tone
ribbon so it opens dark (the Prozess-Audit gets a petrol background under its warm card) and alternates
petrol/paper down the page.

**Architecture:** Delete three entries from the shared `leistungen` data (numbering is index-derived, so
the remaining four auto-renumber 01–04). Flip the service tone parity and the audit section tone in the
`/leistungen` page. Keep the warm Prozess-Audit card but seat it on a petrol band and give its edge a
light treatment so it reads on the dark. Fix one homepage highlight that points at a deleted service.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind v4 `@theme` tokens, Vitest.

**Branch:** continue on **`feat/leistungen-audit-prominence`** (already carries the moved-up audit + warm
card, unmerged). This plan revises that card onto a petrol band and adds the trim + inversion. Ignore the
unrelated dirty newsletter files — never stage them.

**Design decisions (settled):**
- Flagship (Termin-Quelle) stays a deep-petrol panel on paper — unchanged (locked identity; also helps
  fill the top).
- Prozess-Audit: **warm sonnenlicht card kept**, section tone **paper → petrol** (dark background, card
  pops harder; stays distinct from the dark „Und vieles mehr“ card).
- „Und vieles mehr“ stays petrol (inverting it would clash with Dateneingabe/paper above it).
- Homepage `WasIchBaue` 4th chip „Bewertungen einsammeln“ → „Dateneingabe“ (Bewertungen is being deleted
  from `/leistungen`; keep the homepage highlight honest).

**Target tone ribbon (top → bottom):**
```
Flagship          paper · dark panel
Prozess-Audit     PETROL band · warm card
„Die einzelnen …“ paper
  01 Anfragen     petrol
  02 Termine      paper
  03 Angebote     petrol
  04 Dateneingabe paper
Und vieles mehr   petrol · dark card
Referenzen        paper
```

**Brand invariant:** German „…“ quotes (U+201E/U+201C), en-dash „ – “ (U+2013). Byte-verify after any
write touching German (Write/Edit downgrade the closing quote). The copy-guard tests enforce it in the
copy modules; the data file has no smart quotes to worry about, only umlauts.

---

## Task 1: Trim the service menu to four

**Files:**
- Modify: `src/lib/leistungen.ts`
- Modify: `src/lib/leistungen.test.ts`

- [ ] **Step 1: Update the test expectation to the four kept services (fails first)**

In `src/lib/leistungen.test.ts`, replace the expected title array:

```ts
    expect(leistungen.map((l) => l.title)).toEqual([
      "Anfragen & Leads",
      "Termine & Bestätigungen",
      "Angebote & Rechnungen",
      "Dateneingabe",
    ]);
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/leistungen.test.ts`
Expected: FAIL — data still has the seven-title list.

- [ ] **Step 3: Delete the three service entries from the data**

In `src/lib/leistungen.ts`, remove the three objects with `slug: "nachfass-mails"`,
`slug: "kommunikation"`, and `slug: "bewertungen"`. The array keeps exactly four, in this order:
`anfragen-leads`, `termine`, `angebote-rechnungen`, `dateneingabe`. Do not renumber anything by hand —
`LeistungDetail` derives `01`–`04` from the array index.

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/lib/leistungen.test.ts`
Expected: PASS (all four `describe` blocks — order, per-service shape, unique slugs, durability cue).

- [ ] **Step 5: Commit**

```bash
git add src/lib/leistungen.ts src/lib/leistungen.test.ts
git commit -m "content(leistungen): trim service menu to four (drop Nachfass, Kommunikation, Bewertungen)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Keep the homepage highlight honest

**Files:**
- Modify: `src/components/home/WasIchBaue.tsx`

The homepage curates four highlight chips (its own local list, not the shared data). The 4th,
„Bewertungen einsammeln“, now points at a service `/leistungen` no longer details. Swap it for a kept
one. `WasIchBaue.test.tsx` asserts only the band tone and link, so it stays green.

- [ ] **Step 1: Swap the chip**

In `src/components/home/WasIchBaue.tsx`, in the local `leistungen` array change the fourth entry:

```ts
const leistungen = [
  "Anfragen & Leads",
  "Termine & Bestätigungen",
  "Angebote & Rechnungen",
  "Dateneingabe",
];
```

- [ ] **Step 2: Byte-verify + tests**

```bash
perl -CSD -0777 -ne '$d=0;$d++ while /\x{201E}[^\x{201E}\x{201C}]*\x{201D}/gs; END{print "dirty $d\n"}' src/components/home/WasIchBaue.tsx
npx vitest run src/components/home/WasIchBaue.test.tsx
```
Expected: `dirty 0`, test PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/WasIchBaue.tsx
git commit -m "content(home): swap the Bewertungen highlight chip for Dateneingabe

Bewertungen is no longer detailed on /leistungen; keep the homepage
highlight pointing at a service the page actually carries.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Invert the tone ribbon on /leistungen

**Files:**
- Modify: `src/app/leistungen/page.tsx`

Two changes: the audit section goes petrol, and the service alternation flips so the first card is
petrol.

- [ ] **Step 1: Flip the audit section to petrol**

In `src/app/leistungen/page.tsx`, the Prozess-Audit section (currently `tone="paper"`, sitting right
after the flagship) becomes `tone="petrol"`:

```tsx
      {/* Paid-audit on-ramp, right beneath the flagship: the "not sure where to
          start?" entry. A warm card on a petrol band — the dark background fills
          the top and the light card pops; stays distinct from the dark
          MehrMoeglich card at the end. */}
      <Section tone="petrol" className="-mt-24 md:-mt-32">
        <Reveal>
          <ProzessAudit />
        </Reveal>
      </Section>
```

- [ ] **Step 2: Invert the service tone parity**

In the `leistungen.map(...)` block, flip the `onDark` parity so the first service is petrol:

```tsx
        // Inverted parity (was index % 2 === 1): the menu now opens on a petrol
        // band and alternates paper/petrol from there, matching the dark-forward
        // ribbon (petrol audit → paper intro → petrol 01 → paper 02 → …).
        const onDark = index % 2 === 0;
```

Leave the `-mt-24` on the first service (`index === 0`) and the `MehrMoeglich` (petrol) and `Referenzen`
(paper) as they are — the ribbon stays clash-free (dateneingabe/paper → MehrMoeglich/petrol →
Referenzen/paper).

- [ ] **Step 3: Type-check + build**

```bash
npx tsc --noEmit
npm run build   # /leistungen compiles
```

- [ ] **Step 4: Commit**

```bash
git add src/app/leistungen/page.tsx
git commit -m "design(leistungen): invert the tone ribbon (petrol audit, flipped service parity)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Seat the warm audit card on the petrol band

**Files:**
- Modify: `src/components/leistungen/ProzessAudit.tsx`

The warm card keeps its on-light internals (verified AA on sonnenlicht). Only the **edge** needs
attention: the `ring-amber/50` reads on paper but can vanish against petrol. Give it a crisp light edge +
lift so it sits cleanly on the dark band.

- [ ] **Step 1: Swap the ring/lift for the dark band**

In `src/components/leistungen/ProzessAudit.tsx`, change the card wrapper from:

```tsx
    <div className="card-depth mx-auto max-w-3xl rounded-2xl bg-sonnenlicht p-8 ring-1 ring-amber/50 md:p-10">
```

to (crisp light edge + deep shadow so the warm card lifts off the petrol):

```tsx
    <div className="shadow-deepwater mx-auto max-w-3xl rounded-2xl bg-sonnenlicht p-8 ring-1 ring-papier/25 md:p-10">
```

Update the leading component comment to say the card now sits on a **petrol band** (dark background,
warm card), not paper.

- [ ] **Step 2: Byte-verify + component test**

```bash
perl -CSD -0777 -ne '$d=0;$d++ while /\x{201E}[^\x{201E}\x{201C}]*\x{201D}/gs; END{print "dirty $d\n"}' src/components/leistungen/ProzessAudit.tsx
npx vitest run src/components/leistungen/ProzessAudit.test.tsx
```
Expected: `dirty 0`, test PASS (copy/links unchanged).

- [ ] **Step 3: Browser-tune the edge (the real check)**

Start `npm start`, open `/leistungen`, scroll to the audit. Confirm the warm card reads crisply on the
petrol band (edge visible, good lift, no muddy halo). If `ring-papier/25` is too faint or too strong,
adjust the alpha (try `/15`…`/30`) or drop the ring and rely on `shadow-deepwater` alone. Re-commit if
changed.

- [ ] **Step 4: Commit**

```bash
git add src/components/leistungen/ProzessAudit.tsx
git commit -m "design(leistungen): warm audit card edge/lift for the petrol band

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Full verification, browser smoke, finish

**Files:** none new — verification only.

- [ ] **Step 1: Full suite + type-check + lint + build**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```
All green.

- [ ] **Step 2: Browser smoke (desktop 1440 + mobile 390)**

Run `npm start`, open `/leistungen`:
- Ribbon reads dark-forward and alternates: flagship (dark panel) → **petrol audit with the warm card** →
  paper „Die einzelnen Bausteine“ → **01 petrol** → 02 paper → 03 petrol → 04 paper → „Und vieles mehr“
  petrol → Referenzen paper.
- Exactly **four** service cards, numbered **01–04**, titles Anfragen / Termine / Angebote / Dateneingabe.
- The warm audit card is crisp on the petrol band; the amber flagship above and the audit don't blur.
- No horizontal scroll at 390px; the audit CTA + „60-Sekunden-Check“ link stack on mobile.
- Homepage `/` „Was ich baue“ shows Dateneingabe as the 4th chip (not Bewertungen).

- [ ] **Step 3: Finish the branch**

Use superpowers:finishing-a-development-branch. Since `main` auto-deploys, present the merge decision to
the founder before pushing (this is a live-site visual change). Do not stage the unrelated newsletter
files.

---

## Self-review checklist (done while writing)

- **Spec coverage:** trim to four (T1), homepage consistency (T2), petrol audit + flipped parity (T3),
  warm card on petrol (T4), verify + finish (T5). ✅
- **Numbering:** index-derived, auto-renumbers 01–04 on deletion — no manual edits. ✅
- **Tests touched:** only `leistungen.test.ts` (title list). `WasIchBaue.test.tsx` and
  `ProzessAudit.test.tsx` assert tone/links/copy, all unchanged. No `/leistungen` page test exists. ✅
- **Ribbon clash check:** dateneingabe/paper → MehrMoeglich/petrol → Referenzen/paper — no adjacent
  same-tone sections. ✅
