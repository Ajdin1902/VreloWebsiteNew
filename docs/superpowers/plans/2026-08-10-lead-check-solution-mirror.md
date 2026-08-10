# Lead-Check Solution-Mirror Block — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a calm paper block to the `/lead-check` result view that mirrors the three self-serve tips back as things the Termin-Quelle does on its own, closing the hook→solution gap.

**Architecture:** One JSX block inserted into `Result.tsx` between the „Drei Dinge" tips list and the petrol CTA box. Copy stays inline (matching the file's existing pattern); styling reuses the neighbouring tips block's classes. Score-agnostic — renders for both `langsam`/`solide` and `schnell` results.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind v4 tokens, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-10-lead-check-solution-mirror-design.md`

---

### Task 1: Solution-mirror block in the result view

**Files:**
- Modify: `src/components/lead-check/Result.tsx` (insert between the „Drei Dinge" `<div>` and the petrol `<div className="rounded-2xl bg-vrelo-petrol …">`)
- Test: `src/components/lead-check/Result.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append these three tests inside the existing `describe("Result", () => { … })` block in `src/components/lead-check/Result.test.tsx` (before its closing `});`). The `langsam`, `schnell`, `computeResult`, `render`, `screen` symbols are already imported at the top of the file.

```tsx
  it("mirrors the tips as things the Termin-Quelle does (slow profile)", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    expect(screen.getByText(/Genau das übernimmt die Termin-Quelle/)).toBeInTheDocument();
    expect(screen.getByText(/in unter fünf Minuten/)).toBeInTheDocument();
    expect(screen.getByText(/schlägt einen Termin vor/)).toBeInTheDocument();
    expect(screen.getByText(/fasst sie von selbst nach/)).toBeInTheDocument();
  });

  it("shows the solution mirror for an already-fast profile too", () => {
    render(<Result answers={schnell} result={computeResult(schnell)} calLink={undefined} />);
    expect(screen.getByText(/Genau das übernimmt die Termin-Quelle/)).toBeInTheDocument();
  });

  it("uses German typography in the mirror block (en-dash, no em-dash, no ASCII quote)", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    const heading = screen.getByText(/Genau das übernimmt die Termin-Quelle/);
    const text = heading.closest("div")?.textContent ?? "";
    expect(text).toContain("–"); // spaced en-dash present
    expect(text).not.toContain("—"); // no em-dash
    expect(text).not.toContain('"'); // no ASCII double-quote
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/lead-check/Result.test.tsx`
Expected: the three new tests FAIL (`Unable to find an element with the text: /Genau das übernimmt die Termin-Quelle/`). The three pre-existing tests still PASS.

- [ ] **Step 3: Insert the mirror block**

In `src/components/lead-check/Result.tsx`, find the end of the „Drei Dinge, die du sofort tun kannst" block — the `</div>` that closes it, immediately before this line:

```tsx
      <div className="rounded-2xl bg-vrelo-petrol p-8 md:p-10">
```

Insert this block between them (after the tips `</div>`, before the petrol `<div>`). Note the `{"–"}` string-literal en-dash — this file's existing convention (see the `{"–"}` uses already in the component); it sidesteps the Write/Edit en-dash downgrade:

```tsx
      <div>
        <h3 className="text-lg font-semibold text-tiefes-wasser">Genau das übernimmt die Termin-Quelle</h3>
        <p className="mt-3 text-tinte">
          Die drei Dinge von oben sind einfach. Schwer ist nur, sie durchzuhalten {"–"} bei jeder Anfrage. Ein
          System tut genau das:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-tinte">
          <li>
            Die Termin-Quelle antwortet auf jede neue Anfrage in unter fünf Minuten {"–"} auch abends, auch am
            Wochenende.
          </li>
          <li>Sie stellt die richtigen Fragen und schlägt einen Termin vor.</li>
          <li>Meldet sich jemand nicht, fasst sie von selbst nach {"–"} ohne dass du daran denken musst.</li>
        </ul>
      </div>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/lead-check/Result.test.tsx`
Expected: all six tests PASS.

- [ ] **Step 5: Verify German punctuation bytes in the source**

Run: `perl -CSD -ne 'print "EMDASH line $.\n" if /\x{2014}/; END{print "no-emdash-ok\n"}' src/components/lead-check/Result.tsx`
Expected: `no-emdash-ok` with no EMDASH lines. (The whole file should be em-dash-free; the new copy uses U+2013.)

- [ ] **Step 6: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/lead-check/Result.tsx src/components/lead-check/Result.test.tsx
git commit -m "$(cat <<'EOF'
feat(lead-check): mirror tips as Termin-Quelle solution in result view

Adds a calm paper block between the self-serve tips and the petrol CTA that
reflects the three tips back as things the system does on its own, closing
the hook→solution gap without pitching. Score-agnostic; German en-dash
convention; guarded by tests for both profiles + typography.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- Placement (paper block between tips and petrol box) → Task 1 Step 3. ✓
- Final copy verbatim → Task 1 Step 3. ✓
- Renders for both score branches → tests in Step 1 (slow + fast). ✓
- No „KI" / no price → copy contains neither (verify on read). ✓
- German en-dash, no em-dash, no ASCII quote → Step 1 typography test + Step 5 byte check. ✓
- Copy stays inline in `Result.tsx`, no refactor to `leadCheck.ts` → Step 3 edits only the JSX. ✓
- Out of scope (no `/makler` link, no email/model/CTA-box change) → plan touches only the two files. ✓

**Placeholder scan:** none — every step has exact code, paths, and commands.

**Type consistency:** no new types; reuses existing `Result` props, `LeadCheckAnswers`, `computeResult`, and the `langsam`/`schnell` fixtures already in the test file.
