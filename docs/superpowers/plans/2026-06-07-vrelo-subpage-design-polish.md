# Vrelo Subpage Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the homepage design-skill "hand" (card-depth, type discipline, eyebrow restraint, `Reveal` scroll-motion, AA contrast) to the three content subpages — Leistungen, Über mich, FAQ — redesign-preserve.

**Architecture:** Per-page sequencing on one branch `feat/subpage-design-polish`. Each page gets (1) a deterministic component-changes task (TDD where there is a structural/behavioral contract) and (2) a page-integration + design-skill-pass + browser/AA verification task that ends in a commit. Shared components (`PageIntro`, `ClosingCta`) get type discipline once, up front, because all three pages use them.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind v4 `@theme` tokens, Vitest + React Testing Library (jsdom), Playwright MCP for browser verification. The polish vocabulary already exists in `src/app/globals.css` (`.card-depth`, `.shadow-deepwater`, `.cta-fx`) and `src/components/Reveal.tsx`.

**Spec:** `docs/superpowers/specs/2026-06-07-vrelo-subpage-design-polish-design.md`

---

## Locked constraints (apply in every task)

- **Tokens only** — no hand-rolled hex. Use `@theme` utilities (`text-tiefes-wasser`, `bg-papier`, `text-vrelo-petrol`, `bg-gletscher/40`, `text-tinte`, `text-stumm`, `border-faden`, `text-ember`, `bg-amber`, …). `BrandWord`/`withBrandWords` for „Vrelo“/„Merak“. Ember token stays `#7e5527`.
- **German typography** — quotes „…“ = U+201E + U+201C, never ASCII `"`; en-dash „ – “ (U+2013), never em-dash. **Do not edit any German copy strings** — this is a visual pass. After any edit to a file containing German copy (`src/lib/ueber-mich.ts`), run the quote-balance check shown in that task.
- **Motion** — only `Reveal` (already reduced-motion-safe, CLS-safe, no-JS-safe via the `.reveal-ready` gate). Never gate content visibility any other way.
- **Reduced motion / no-JS** — never regress: content must render visible without JS.
- **Manual/browser checks** use the production build (`npm run build` then `npm start`), not `npm run dev` (dev Fast-Refresh races screenshots).
- **Calm-over-loud**, generic-masculine voice (no copy changes here anyway).

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/components/PageIntro.tsx` | page h1 + lead; shared by all subpages | 1 |
| `src/components/ClosingCta.tsx` | closing heading + lead + CTA; shared | 1 |
| `src/components/leistungen/LeistungDetail.tsx` | one service block → card-depth panel | 2 |
| `src/components/leistungen/LeistungDetail.test.tsx` | LeistungDetail contract | 2 |
| `src/components/leistungen/Referenzen.tsx` | placeholder trust section heading | 2 |
| `src/app/leistungen/page.tsx` | wraps services in `Reveal` | 3 |
| `src/lib/ueber-mich.ts` | story-beat data + type (drop `eyebrow`) | 4 |
| `src/components/ueber-mich/StoryBeat.tsx` | beat layout (no eyebrow, depth, type) | 4 |
| `src/components/ueber-mich/StoryBeat.test.tsx` | StoryBeat contract (no eyebrow) | 4 |
| `src/app/ueber-mich/page.tsx` | wraps beats in `Reveal` | 5 |
| `src/components/faq/FaqItem.tsx` | one Q/A details element | 6 |
| `src/components/faq/FaqAccordion.tsx` | groups → `Reveal`-staggered | 6 |
| `src/app/faq/page.tsx` | (verify only; no change expected) | 7 |

---

### Task 1: Branch + shared type discipline (PageIntro, ClosingCta)

**Files:**
- Modify: `src/components/PageIntro.tsx`
- Modify: `src/components/ClosingCta.tsx`

- [ ] **Step 1: Create the branch**

Run:
```bash
git checkout main && git pull && git checkout -b feat/subpage-design-polish
```
Expected: `Switched to a new branch 'feat/subpage-design-polish'`.

- [ ] **Step 2: Confirm the homepage does not use these shared components (regression-safety)**

Run:
```bash
grep -rn "PageIntro\|ClosingCta" src/app/page.tsx src/components/home/
```
Expected: **no matches** (the homepage uses `Hero`/`MerakClose`, not these). If there are matches, stop and re-scope — these edits would touch the homepage.

- [ ] **Step 3: Add type discipline to `PageIntro`**

In `src/components/PageIntro.tsx`, change the `<h1>` and lead `<p>` class lists:

```tsx
      <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold text-tiefes-wasser md:text-5xl">
        {title}
      </h1>
      {lead ? <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">{withBrandWords(lead)}</p> : null}
```

(Only `text-balance` added to the h1 and `text-pretty` added to the lead — nothing else changes.)

- [ ] **Step 4: Add type discipline to `ClosingCta`**

In `src/components/ClosingCta.tsx`, change the heading and lead class lists:

```tsx
      <h2 className="max-w-2xl text-balance text-3xl font-semibold text-ember md:text-4xl">{heading}</h2>
      <p className="mt-5 max-w-xl text-pretty text-lg text-tinte">{lead}</p>
```

- [ ] **Step 5: Type-check + lint + existing tests**

Run:
```bash
npx tsc --noEmit && npm run lint && npm test
```
Expected: all pass (className-only changes; no test references these classes).

- [ ] **Step 6: Commit**

```bash
git add src/components/PageIntro.tsx src/components/ClosingCta.tsx
git commit -m "$(printf 'feat(design): type discipline on shared PageIntro + ClosingCta\n\ntext-balance on headings, text-pretty on body. Shared by the subpages;\nhomepage uses neither.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 2: Leistungen components — card-depth panel + type discipline

**Files:**
- Modify: `src/components/leistungen/LeistungDetail.tsx`
- Modify: `src/components/leistungen/LeistungDetail.test.tsx:14-38`
- Modify: `src/components/leistungen/Referenzen.tsx`

- [ ] **Step 1: Write the failing test for the card-depth panel**

In `src/components/leistungen/LeistungDetail.test.tsx`, add this test inside the `describe` block (after the existing tests):

```tsx
  it("wraps the service in a card-depth panel", () => {
    const { container } = render(<LeistungDetail leistung={sample} index={0} />);
    expect(container.firstElementChild).toHaveClass("card-depth");
  });
```

- [ ] **Step 2: Run it to confirm it fails**

Run:
```bash
npm test -- src/components/leistungen/LeistungDetail.test.tsx
```
Expected: FAIL — the current root `<div>` has no `card-depth` class.

- [ ] **Step 3: Rewrite `LeistungDetail` with the panel + type discipline**

Replace the whole body of `src/components/leistungen/LeistungDetail.tsx` with:

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
    <div className="card-depth rounded-2xl bg-papier/80 p-6 ring-1 ring-faden md:p-8">
      <div className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-serif text-xl italic text-vrelo-petrol">
          {number}
        </span>
        <h2
          id={labelId}
          className="text-balance text-2xl font-semibold tracking-tight text-tiefes-wasser md:text-3xl"
        >
          {leistung.title}
        </h2>
      </div>
      <p className="mt-2 text-lg font-medium text-vrelo-petrol">{leistung.punchline}</p>
      <p className="mt-4 max-w-2xl text-pretty text-tinte">{leistung.body}</p>
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

(Changes vs. current: root is a `card-depth` panel; the serif number is now an inline `<span>` baseline-aligned with the title; `text-balance tracking-tight` on the h2; `text-pretty` on the body. The h2 `id`/`aria-labelledby` wiring is unchanged.)

- [ ] **Step 4: Run the LeistungDetail tests**

Run:
```bash
npm test -- src/components/leistungen/LeistungDetail.test.tsx
```
Expected: PASS — all four tests (h2/punchline/body, outcomes, aria-labelledby, card-depth panel).

- [ ] **Step 5: Type discipline on the Referenzen heading**

In `src/components/leistungen/Referenzen.tsx`, change the heading and body `<p>`:

```tsx
      <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        Bald: Stimmen aus echten Betrieben.
      </h2>
      <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
        Hier stehen in Kürze konkrete Beispiele und Referenzen aus kleinen Betrieben, für die
        ich gebaut habe.
      </p>
```

(Keep the placeholder copy and the `TODO` comment — do not invent testimonials.)

- [ ] **Step 6: Commit**

```bash
git add src/components/leistungen/LeistungDetail.tsx src/components/leistungen/LeistungDetail.test.tsx src/components/leistungen/Referenzen.tsx
git commit -m "$(printf 'feat(leistungen): card-depth service panels + type discipline\n\nEach service sits on a card-depth panel; serif number inline with a\ntracking-tight title; text-pretty body. Referenzen heading matched.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 3: Leistungen page — Reveal motion + design-skill pass + verify

**Files:**
- Modify: `src/app/leistungen/page.tsx`

- [ ] **Step 1: Wrap each service in `Reveal`**

In `src/app/leistungen/page.tsx`, add the import and wrap the `LeistungDetail` inside each mapped `Section`. Add to the imports at the top:

```tsx
import { Reveal } from "@/components/Reveal";
```

Replace the `{leistungen.map(...)}` block with:

```tsx
      {leistungen.map((leistung, index) => (
        <Section
          key={leistung.slug}
          tone="paper"
          tint={index % 2 === 1}
          className="border-t border-faden"
        >
          <Reveal>
            <LeistungDetail leistung={leistung} index={index} />
          </Reveal>
        </Section>
      ))}
```

(`Reveal` is a client component rendered by the server page with the server-rendered `LeistungDetail` passed as children — valid RSC pattern. Default `delayMs={0}`; each service reveals as it enters the viewport.)

- [ ] **Step 2: Type-check, lint, build**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: all pass; build completes (Leistungen is statically generated).

- [ ] **Step 3: Start the production server**

Run (background):
```bash
npm start
```
Expected: `Ready` on http://localhost:3000. (If port 3000 is busy, free it first.)

- [ ] **Step 4: Browser-verify at 1440 and 390 (Playwright MCP)**

Load the Playwright MCP tools (`ToolSearch` query `select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_resize,mcp__plugin_playwright_playwright__browser_take_screenshot`), then:
1. `browser_resize` to 1440×900 → `browser_navigate` to `http://localhost:3000/leistungen` → `browser_take_screenshot` (full page).
2. `browser_resize` to 390×844 → reload → `browser_take_screenshot` (full page).

- [ ] **Step 5: Apply the design-skill lens and refine**

Run the three skills as the review lens over the screenshots (design-taste-frontend, then high-end-visual-design, then impeccable), redesign-preserve. Check specifically:
- The `card-depth` panels read as raised on **both** the plain paper and the `tint` (`bg-gletscher/30`) sections. If the panel disappears on the tinted rows, adjust the panel surface (e.g. `bg-papier` instead of `bg-papier/80`, or strengthen `ring-faden`) — tokens only.
- Spacing rhythm between panels feels calm, not cramped (the `Section` `py-24 md:py-32` already provides it).
- Number/title baseline alignment is correct; headings don't overflow at 390 (`text-balance` + the copy are short enough — confirm).
- Outcome pills wrap cleanly at 390.
Apply only token/utility tweaks. If you change anything, re-run Step 2 (build) and re-screenshot.

- [ ] **Step 6: AA contrast spot-check**

Verify against WCAG AA (4.5:1 body / 3:1 large), using the rendered colors:
- `text-tinte` body on `bg-papier/80` panel — body, needs ≥4.5:1.
- `text-tiefes-wasser` outcome text on `bg-gletscher/40` pill — small, needs ≥4.5:1.
- `text-vrelo-petrol` punchline on the panel — large/medium.
- `text-stumm` PageIntro eyebrow on `bg-papier` — small uppercase, needs ≥4.5:1.
If any pairing fails, darken toward the ink end using an existing token (e.g. eyebrow `text-stumm`→`text-tiefes-wasser`/`text-vrelo-petrol`), matching the homepage approach. **If you change `text-stumm` here, note it** — it is also the `PageIntro`/`StoryBeat`/`FaqAccordion` label color and the fix may belong in those too (decide consistently).

- [ ] **Step 7: Stop the server and commit**

Stop `npm start`. Then:
```bash
git add src/app/leistungen/page.tsx
git commit -m "$(printf 'feat(leistungen): scroll-reveal motion + design pass\n\nReveal-on-scroll per service; verified at 1440/390, AA-checked.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```
(If Step 6 changed a shared label color, include that file in the commit and the message.)

---

### Task 4: Über-mich — remove per-beat eyebrows + depth + type discipline

**Files:**
- Modify: `src/lib/ueber-mich.ts:1-7` (type) and the four data entries (remove `eyebrow`)
- Modify: `src/components/ueber-mich/StoryBeat.tsx`
- Modify: `src/components/ueber-mich/StoryBeat.test.tsx:6-22`

- [ ] **Step 1: Update the test fixture + assertion first (drives the removal)**

In `src/components/ueber-mich/StoryBeat.test.tsx`:
- Remove `eyebrow: "Quelle",` from the `beat` fixture (lines 6-12).
- Replace the first test (`"renders the eyebrow, heading, body, and numeral"`) with:

```tsx
  it("renders the numeral, heading, and body, without an eyebrow line", () => {
    const { container } = render(<StoryBeat beat={beat} index={0} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Woher ich komme"
    );
    expect(screen.getByText("[Platzhalter] Test-Text.")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(container.querySelector(".uppercase")).toBeNull();
  });
```

(The other three tests — video sources, paragraph splitting, BrandWord italic — keep their `...beat` spreads, which no longer carry `eyebrow`; that is fine.)

- [ ] **Step 2: Run it to confirm it fails**

Run:
```bash
npm test -- src/components/ueber-mich/StoryBeat.test.tsx
```
Expected: FAIL — either a TypeScript error on the fixture (`eyebrow` still required by the type) or the `.uppercase` assertion fails (the eyebrow `<p class="… uppercase …">` still renders).

- [ ] **Step 3: Drop `eyebrow` from the type and the four data entries**

In `src/lib/ueber-mich.ts`, change the type to:

```tsx
export type StoryBeat = {
  slug: string; // matches the clip slug: quelle | ripples | fluss | merak
  heading: string;
  body: string; // plain text; blank lines separate paragraphs, Vrelo/Merak get BrandWord
  side: "left" | "right";
};
```

Then **delete the `eyebrow: "…",` line from each of the four `storyBeats` entries** (`"Quelle"`, `"Wellen"`, `"Fluss"`, `"Merak"`). Do not touch any other line — the `body` strings contain German typographic quotes that must stay byte-for-byte intact.

- [ ] **Step 4: Verify the German quotes in the data file are still balanced**

Run:
```bash
node -e "const s=require('fs').readFileSync('src/lib/ueber-mich.ts','utf8');const o=(s.match(/„/g)||[]).length,c=(s.match(/“/g)||[]).length;console.log('open',o,'close',c);process.exit(o===c?0:1)"
```
Expected: `open` equals `close` (exit 0). If they differ, an edit downgraded a closing quote — restore it before continuing.

- [ ] **Step 5: Rewrite `StoryBeat` — no eyebrow, inline number, depth, type discipline**

Replace the component body in `src/components/ueber-mich/StoryBeat.tsx` (keep the imports and `renderBody`; update `renderBody`'s paragraph class and the returned JSX):

```tsx
// A story-beat body is plain text; blank lines separate paragraphs.
function renderBody(body: string) {
  return body.split(/\n{2,}/).map((para, i) => (
    <p key={i} className={`${i === 0 ? "mt-4" : "mt-3"} max-w-xl text-pretty text-tinte`}>
      {withBrandWords(para)}
    </p>
  ));
}

export function StoryBeat({
  beat,
  index,
}: {
  beat: StoryBeatType;
  index: number;
}) {
  const number = String(index + 1).padStart(2, "0");
  const headingId = `beat-${beat.slug}`;
  // DOM order is always video-then-text (mobile-consistent); `side` flips
  // the column order on desktop only.
  const videoFirst = beat.side === "left";

  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div className={videoFirst ? "md:order-1" : "md:order-2"}>
        <LazyVideo
          mp4={`/video/${beat.slug}.mp4`}
          webm={`/video/${beat.slug}.webm`}
          poster={`/video/${beat.slug}-poster.jpg`}
          aspect="aspect-video"
          className="w-full rounded-2xl object-cover shadow-deepwater"
        />
      </div>
      <div className={videoFirst ? "md:order-2" : "md:order-1"}>
        <div className="flex items-baseline gap-3">
          <span aria-hidden="true" className="font-serif text-xl italic text-vrelo-petrol">
            {number}
          </span>
          <h2
            id={headingId}
            className="text-balance text-2xl font-semibold tracking-tight text-tiefes-wasser md:text-3xl"
          >
            {beat.heading}
          </h2>
        </div>
        {renderBody(beat.body)}
      </div>
    </div>
  );
}
```

(Changes: the eyebrow `<p>` is gone; the number is an inline `<span>` baseline-aligned with the heading, matching `LeistungDetail`; `text-balance tracking-tight` on the h2; `shadow-deepwater` on the video; `text-pretty` on body paragraphs.)

- [ ] **Step 6: Confirm no stray `eyebrow` references remain**

Run:
```bash
grep -rn "eyebrow" src/lib/ueber-mich.ts src/components/ueber-mich/
```
Expected: **no matches**.

- [ ] **Step 7: Run the StoryBeat tests + type-check**

Run:
```bash
npm test -- src/components/ueber-mich/StoryBeat.test.tsx && npx tsc --noEmit
```
Expected: PASS — all four tests, and no type errors (the `eyebrow` field is gone everywhere).

- [ ] **Step 8: Commit**

```bash
git add src/lib/ueber-mich.ts src/components/ueber-mich/StoryBeat.tsx src/components/ueber-mich/StoryBeat.test.tsx
git commit -m "$(printf 'feat(ueber-mich): drop per-beat eyebrows; depth + type discipline\n\nEyebrow restraint (heading carries it); inline serif number to match\nLeistungen; shadow-deepwater on the clips; text-balance/text-pretty.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 5: Über-mich page — Reveal motion + design-skill pass + verify

**Files:**
- Modify: `src/app/ueber-mich/page.tsx`

- [ ] **Step 1: Wrap each beat in `Reveal`**

In `src/app/ueber-mich/page.tsx`, add the import:

```tsx
import { Reveal } from "@/components/Reveal";
```

Replace the `{storyBeats.map(...)}` block with:

```tsx
      {storyBeats.map((beat, index) => (
        <Section
          key={beat.slug}
          tone="paper"
          tint={index % 2 === 1}
          className="border-t border-faden"
        >
          <Reveal>
            <StoryBeat beat={beat} index={index} />
          </Reveal>
        </Section>
      ))}
```

- [ ] **Step 2: Type-check, lint, build**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: all pass.

- [ ] **Step 3: Start the production server**

Run (background): `npm start` → expect `Ready` on http://localhost:3000.

- [ ] **Step 4: Browser-verify at 1440 and 390**

Using the Playwright MCP tools: at 1440×900 and 390×844, navigate to `http://localhost:3000/ueber-mich` and screenshot full page at each width.

- [ ] **Step 5: Apply the design-skill lens and refine**

Run design-taste-frontend → high-end-visual-design → impeccable as the lens, redesign-preserve. Check:
- No per-beat eyebrow remains; the heading + inline number read as the section opener.
- The alternating `LazyVideo` panels carry `shadow-deepwater` depth and align with their text column on desktop; on mobile the video sits above the text (DOM order) for every beat.
- `BrandWord` italics for „Vrelo“/„Merak“ appear in the body.
- Headings don't overflow at 390; paragraphs are comfortable (`max-w-xl`, `text-pretty`).
Token/utility tweaks only; rebuild + re-screenshot if changed.

- [ ] **Step 6: AA contrast spot-check**

Verify: `text-tinte` body on `bg-papier` and on `bg-gletscher/30` (tinted rows); `text-tiefes-wasser` heading; `text-stumm` PageIntro eyebrow. Fix failures by darkening toward ink with existing tokens (stay consistent with any `text-stumm` decision from Task 3).

- [ ] **Step 7: Stop the server and commit**

```bash
git add src/app/ueber-mich/page.tsx
git commit -m "$(printf 'feat(ueber-mich): scroll-reveal motion + design pass\n\nReveal-on-scroll per beat; verified at 1440/390, AA-checked.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 6: FAQ components — accordion polish + Reveal motion

**Files:**
- Modify: `src/components/faq/FaqItem.tsx`
- Modify: `src/components/faq/FaqAccordion.tsx`

- [ ] **Step 1: Polish `FaqItem` (hover, smoother indicator, body type)**

Replace the body of `src/components/faq/FaqItem.tsx` with:

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
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-tiefes-wasser transition-colors hover:text-vrelo-petrol [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol">
        <span>{question}</span>
        <span
          aria-hidden="true"
          className="shrink-0 text-xl leading-none text-vrelo-petrol transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-tinte">{answer}</p>
    </details>
  );
}
```

(Changes: `hover:text-vrelo-petrol` + `transition-colors` on the summary; the question wrapped in a `<span>` and the `+` given `shrink-0` so a long question never squashes the indicator; the indicator gets a calm `duration-300` brand easing; the answer gets `text-pretty leading-relaxed`. The `+`→`group-open:rotate-45` behavior and focus ring are unchanged.)

- [ ] **Step 2: Run the FaqItem test**

Run:
```bash
npm test -- src/components/faq/FaqItem.test.tsx
```
Expected: PASS — `details`/`summary` present, summary contains the question, answer text present (wrapping the question in a `<span>` keeps `summary` text content the same).

- [ ] **Step 3: Add `Reveal` stagger + heading type discipline to `FaqAccordion`**

Replace the body of `src/components/faq/FaqAccordion.tsx` with:

```tsx
import type { FaqGroup } from "@/lib/faq";
import { FaqItem } from "@/components/faq/FaqItem";
import { Reveal } from "@/components/Reveal";

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="space-y-12">
      {groups.map((group, i) => (
        <Reveal key={group.theme} delayMs={i * 80}>
          <h2 className="text-sm font-medium uppercase tracking-wider text-stumm">
            {group.theme}
          </h2>
          <div className="mt-4 border-t border-faden">
            {group.entries.map((entry) => (
              <FaqItem key={entry.question} question={entry.question} answer={entry.answer} />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
```

(`Reveal` defaults to a `<div>`, so each group reveals as its own block with an 80 ms stagger. The 3 theme labels stay as group headers. `IntersectionObserver` is stubbed inert in `vitest.setup.ts`, so the children stay in the DOM under test.)

- [ ] **Step 4: Run the FaqAccordion test + type-check**

Run:
```bash
npm test -- src/components/faq/FaqAccordion.test.tsx && npx tsc --noEmit
```
Expected: PASS — each theme heading renders, all three questions render as `details` (Reveal renders its children).

- [ ] **Step 5: Commit**

```bash
git add src/components/faq/FaqItem.tsx src/components/faq/FaqAccordion.tsx
git commit -m "$(printf 'feat(faq): accordion hover/indicator polish + reveal stagger\n\nSummary hover, calmer +/x indicator easing, text-pretty answers,\nper-group Reveal stagger.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 7: FAQ page — design-skill pass + verify

**Files:**
- Modify (only if the design pass calls for it): `src/app/faq/page.tsx`, `src/components/faq/FaqAccordion.tsx`

- [ ] **Step 1: Build + start the production server**

Run:
```bash
npm run build && npm start
```
Expected: `Ready` on http://localhost:3000.

- [ ] **Step 2: Browser-verify at 1440 and 390**

Using the Playwright MCP tools: at 1440×900 and 390×844, navigate to `http://localhost:3000/faq`, screenshot full page; also click a question (`browser_click`) to capture an open state at 1440.

- [ ] **Step 3: Apply the design-skill lens and refine**

Run design-taste-frontend → high-end-visual-design → impeccable, redesign-preserve. Check:
- The open/close affordance feels calm; the `+`→`×` rotate is smooth; hover is legible.
- Group rhythm reads cleanly (the `space-y-12` + theme labels). If groups feel flat against the long page, the high-end pass may set each group on a subtle `.card-depth` panel — **only if it stays calm and AA-safe**; if it adds noise, leave the divider rhythm as-is (YAGNI).
- The trailing `PageImage` and `ClosingCta` already read well; confirm the new shared type discipline (Task 1) looks right here.
Token/utility tweaks only; rebuild + re-screenshot if changed.

- [ ] **Step 4: AA contrast spot-check**

Verify: `text-tiefes-wasser` summary on `bg-papier`; `text-tinte` answer on `bg-papier`; `text-stumm` theme labels + PageIntro eyebrow on `bg-papier` (small uppercase — the most likely AA risk). Fix failures with existing darker tokens, consistent with Tasks 3/5.

- [ ] **Step 5: Stop the server and commit (only if anything changed)**

```bash
git add -A
git commit -m "$(printf 'feat(faq): design pass + verification\n\nVerified at 1440/390 incl. open state, AA-checked.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```
If the design pass made no changes, skip the commit and note "FAQ verified, no changes needed."

---

### Task 8: Final gate + homepage regression + finish branch

**Files:** none (verification + merge)

- [ ] **Step 1: Full gate**

Run:
```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```
Expected: all green (whole suite, type-check, lint, production build).

- [ ] **Step 2: Homepage regression check**

With `npm start` running, browser-verify `http://localhost:3000/` at 1440 — confirm the homepage is visually unchanged after the shared `PageIntro`/`ClosingCta` edits (it uses neither, so expect zero change). Screenshot to confirm.

- [ ] **Step 3: Cross-page consistency glance**

At 1440, screenshot `/leistungen`, `/ueber-mich`, `/faq` side by side in your review: confirm the three pages now share the same depth, number treatment, type rhythm, and reveal-on-scroll — one hand.

- [ ] **Step 4: Finish the branch**

Invoke `superpowers:finishing-a-development-branch` and present the merge options. On merge to `main`, the push auto-deploys to production (Vercel). Update `CLAUDE.md` (the "Next session" item 4 — design-skill pass on subpages — is now partially done: Leistungen, Über mich, FAQ complete; Ratgeber/Kontakt/Newsletter/legal remain) as part of the finish.

---

## Self-Review

**1. Spec coverage:**
- Shared "one hand" → depth (Tasks 2/4/6), type discipline (Tasks 1/2/4/6), eyebrow restraint (Task 4), motion/`Reveal` (Tasks 3/5/6), AA audit (Tasks 3/5/7). ✓
- Leistungen Treatment A → Task 2 (panel) + Task 3 (reveal/verify). ✓
- Über-mich eyebrow drop + video depth → Task 4; reveal/verify → Task 5. ✓
- FAQ FaqItem/FaqAccordion polish + reveal → Task 6; verify → Task 7. ✓
- Shared `PageIntro`/`ClosingCta` type discipline → Task 1. ✓
- Per-page sequencing, one branch, commit per page → Tasks 1-7 structure. ✓
- Verification (1440/390 + AA + gate + homepage regression) → Tasks 3/5/7/8. ✓
- Constraints (tokens, German typography, reduced-motion, no-CLS, `npm start`) → "Locked constraints" + per-task steps. ✓

**2. Placeholder scan:** No "TBD"/"TODO" in plan steps. (The retained `TODO` comment in `Referenzen.tsx` is existing product copy intentionally preserved, not a plan placeholder.) The design-skill steps give concrete checklists, not "add polish." ✓

**3. Type consistency:** `Leistung`/`StoryBeat`/`FaqGroup` types match the existing `src/lib` definitions; `StoryBeat` loses `eyebrow` consistently across type + 4 data entries + component + test (Task 4). `Reveal` props (`as?`, `delayMs?`, `className?`, children) match `src/components/Reveal.tsx`. Class names (`card-depth`, `shadow-deepwater`) match `globals.css`. ✓
