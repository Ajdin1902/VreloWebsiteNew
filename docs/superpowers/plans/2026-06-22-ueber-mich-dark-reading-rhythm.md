# Über-mich dark reading rhythm — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. TDD: failing test → minimal impl → green → commit.

**Goal:** Give the Über-mich page a light/dark reading rhythm by turning the two already-alternating story beats (Ripples, Merak) into petrol-dark sections.

**Architecture:** `StoryBeat` gains an `onDark` prop that swaps its text/edge classes for the site's on-petrol vocabulary; the page renders beats 1 & 3 as `tone="petrol"` + `onDark`.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Vitest + React Testing Library.

---

### Task 1: StoryBeat on-dark variant

**Files:**
- Modify: `src/components/ueber-mich/StoryBeat.tsx`
- Test: `src/components/ueber-mich/StoryBeat.test.tsx`

- [ ] **Step 1: Write the failing test** — append to `StoryBeat.test.tsx`:

```tsx
  it("uses on-dark text classes when onDark is set", () => {
    const { container } = render(<StoryBeat beat={beat} onDark />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-papier");
    expect(container.querySelector("p")).toHaveClass("text-gletscher");
  });

  it("uses dark-ink text classes by default (light beat)", () => {
    const { container } = render(<StoryBeat beat={beat} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-tiefes-wasser");
    expect(container.querySelector("p")).toHaveClass("text-tinte");
  });
```

- [ ] **Step 2: Run it, verify it fails** — `npm test -- StoryBeat` → FAIL (onDark prop not accepted / classes absent).

- [ ] **Step 3: Implement** in `StoryBeat.tsx`:
  - Add `onDark = false` to the component signature: `export function StoryBeat({ beat, onDark = false }: { beat: StoryBeatType; onDark?: boolean })`.
  - `renderBody` takes `onDark`: body `<p>` class uses `onDark ? "text-gletscher" : "text-tinte"` in place of the hardcoded `text-tinte`.
  - Heading class uses `onDark ? "text-papier" : "text-tiefes-wasser"` in place of `text-tiefes-wasser`.
  - Video `className` appends `onDark ? "ring-1 ring-gletscher/15" : ""` alongside `shadow-deepwater`.

- [ ] **Step 4: Run it, verify green** — `npm test -- StoryBeat` → PASS (all cases).

- [ ] **Step 5: Commit** — `git add` the two files; `feat(ueber-mich): add on-dark variant to StoryBeat`.

---

### Task 2: Page renders Ripples + Merak as petrol-dark

**Files:**
- Modify: `src/app/ueber-mich/page.tsx`

- [ ] **Step 1: Implement** — in the `storyBeats.map`, derive `const onDark = index % 2 === 1;` and:
  - `tone={onDark ? "petrol" : "paper"}`
  - remove the `tint={...}` prop
  - pass `onDark` to `<StoryBeat beat={beat} onDark={onDark} />`
  - keep the `className={index === 0 ? "-mt-24 md:-mt-32" : ""}` exactly as is.

- [ ] **Step 2: Type-check + full gate** — `npx tsc --noEmit` · `npm run lint` · `npm test` (expect all green, ~219) · `npm run build`.

- [ ] **Step 3: Browser-verify** — `npm start`, view `/ueber-mich` at 1440 and 390: confirm Ripples + Merak read as petrol-dark with legible papier heading + gletscher body, *Merak* italic legible, videos sit cleanly with the light ring; light beats and warm CTA unchanged.

- [ ] **Step 4: Commit** — `feat(ueber-mich): petrol-dark reading rhythm on Ripples + Merak beats`.

---

## Verification
- German typography untouched (this change is class-only; no copy edits).
- Existing `ueber-mich.test.ts` (lib) and other StoryBeat cases stay green.
- Not pushed — stacks with the other unpushed homepage commits for one push when the founder approves.
