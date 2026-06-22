# Leistungen + FAQ dark reading rhythm — Implementation Plan

> Steps use checkbox (`- [ ]`) syntax. TDD: failing test → minimal impl → green → commit.

**Goal:** Give Leistungen and FAQ the same light/dark reading rhythm as Über-mich, using `index % 2 === 1`.

**Architecture:** Leistungen detail cards float on alternating petrol/paper bands (card opacity bumped on dark). FAQ accordion splits into per-group sections; the middle group goes petrol, with `FaqItem` gaining an on-dark variant.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Vitest + RTL.

---

### Task 1: Leistungen — detail cards on petrol bands

**Files:**
- Modify: `src/components/leistungen/LeistungDetail.tsx`, `src/app/leistungen/page.tsx`
- Test: `src/components/leistungen/LeistungDetail.test.tsx`

- [ ] **Step 1: Failing test** — add to `LeistungDetail.test.tsx` (create if missing; mirror the render setup of the existing file if present):

```tsx
  it("uses a fully opaque card on dark bands", () => {
    const { container } = render(<LeistungDetail leistung={leistung} index={1} onDark />);
    expect(container.querySelector(".card-depth")).toHaveClass("bg-papier");
  });

  it("uses a translucent card on light bands by default", () => {
    const { container } = render(<LeistungDetail leistung={leistung} index={0} />);
    expect(container.querySelector(".card-depth")).toHaveClass("bg-papier/80");
  });
```

- [ ] **Step 2: Run, verify fail** — `npm test -- LeistungDetail` → FAIL (onDark not accepted / class absent).

- [ ] **Step 3: Implement** — `LeistungDetail`: add `onDark = false` to props; card className becomes
  `` `card-depth rounded-2xl ${onDark ? "bg-papier" : "bg-papier/80"} p-6 ring-1 ring-faden md:p-8` ``.

- [ ] **Step 4: Wire the page** — `leistungen/page.tsx` map: `const onDark = index % 2 === 1;`
  `tone={onDark ? "petrol" : "paper"}` (remove `tint`), `<LeistungDetail leistung={leistung} index={index} onDark={onDark} />`, keep `className={index === 0 ? "-mt-24 md:-mt-32" : ""}`.

- [ ] **Step 5: Run, verify green** — `npm test -- LeistungDetail` → PASS.

- [ ] **Step 6: Commit** — `feat(leistungen): petrol-dark reading rhythm on alternating detail bands`.

---

### Task 2: FaqItem — on-dark variant

**Files:**
- Modify: `src/components/faq/FaqItem.tsx`
- Test: `src/components/faq/FaqItem.test.tsx`

- [ ] **Step 1: Failing test** — add:

```tsx
  it("uses on-dark classes when onDark is set", () => {
    const { container } = render(
      <FaqItem question="Frage?" answer="Antwort." onDark />
    );
    expect(container.querySelector("summary")).toHaveClass("text-papier");
    expect(container.querySelector("p")).toHaveClass("text-gletscher");
  });

  it("uses light-page classes by default", () => {
    const { container } = render(<FaqItem question="Frage?" answer="Antwort." />);
    expect(container.querySelector("summary")).toHaveClass("text-tiefes-wasser");
    expect(container.querySelector("p")).toHaveClass("text-tinte");
  });
```

- [ ] **Step 2: Run, verify fail** — `npm test -- FaqItem` → FAIL.

- [ ] **Step 3: Implement** — add `onDark = false`; derive per the spec:
  - `summaryColor = onDark ? "text-papier" : "text-tiefes-wasser"`
  - `hover = onDark ? "hover:text-honig" : "hover:text-vrelo-petrol"`
  - `ringOffset = onDark ? "focus-visible:ring-offset-vrelo-petrol" : "focus-visible:ring-offset-papier"`
  - `ring = onDark ? "focus-visible:ring-honig" : "focus-visible:ring-vrelo-petrol"`
  - `marker = onDark ? "text-honig" : "text-vrelo-petrol"`
  - `answerColor = onDark ? "text-gletscher" : "text-tinte"`
  - `border = onDark ? "border-gletscher/20" : "border-faden"`
  Compose them into the existing `details`/`summary`/`span`/`p` classNames (keep all other utilities verbatim).

- [ ] **Step 4: Run, verify green** — `npm test -- FaqItem` → PASS.

- [ ] **Step 5: Commit** — `feat(faq): add on-dark variant to FaqItem`.

---

### Task 3: FaqAccordion — per-group sections, middle band petrol

**Files:**
- Modify: `src/components/faq/FaqAccordion.tsx`, `src/app/faq/page.tsx`
- Test: `src/components/faq/FaqAccordion.test.tsx`

- [ ] **Step 1: Failing test** — add a 3-group case asserting the middle band is petrol:

```tsx
  it("renders the middle group on a petrol section, the others on paper", () => {
    const three: FaqGroup[] = [
      { theme: "Eins", entries: [{ question: "F1?", answer: "A1." }] },
      { theme: "Zwei", entries: [{ question: "F2?", answer: "A2." }] },
      { theme: "Drei", entries: [{ question: "F3?", answer: "A3." }] },
    ];
    const { container } = render(<FaqAccordion groups={three} />);
    const sections = container.querySelectorAll("section");
    expect(sections).toHaveLength(3);
    expect(sections[0]).toHaveClass("bg-papier");
    expect(sections[1]).toHaveClass("bg-vrelo-petrol");
    expect(sections[2]).toHaveClass("bg-papier");
  });
```

- [ ] **Step 2: Run, verify fail** — `npm test -- FaqAccordion` → FAIL (no `section` elements yet).

- [ ] **Step 3: Implement FaqAccordion** — render each group in its own Section:

```tsx
import { Section } from "@/components/Section";
import type { FaqGroup } from "@/lib/faq";
import { FaqItem } from "@/components/faq/FaqItem";
import { Reveal } from "@/components/Reveal";

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <>
      {groups.map((group, i) => {
        // Every other theme group is a petrol-dark band (for 3 groups: the
        // middle), giving the FAQ a light/dark reading rhythm. First group is
        // pulled up under the paper intro.
        const onDark = i % 2 === 1;
        const labelColor = onDark ? "text-gletscher" : "text-stumm";
        const borderColor = onDark ? "border-gletscher/20" : "border-faden";
        return (
          <Section
            key={group.theme}
            tone={onDark ? "petrol" : "paper"}
            className={i === 0 ? "-mt-24 md:-mt-32" : ""}
          >
            <Reveal>
              <h2 className={`text-sm font-medium uppercase tracking-wider ${labelColor}`}>
                {group.theme}
              </h2>
              <div className={`mt-4 border-t ${borderColor}`}>
                {group.entries.map((entry) => (
                  <FaqItem
                    key={entry.question}
                    question={entry.question}
                    answer={entry.answer}
                    onDark={onDark}
                  />
                ))}
              </div>
            </Reveal>
          </Section>
        );
      })}
    </>
  );
}
```

- [ ] **Step 4: Update the page** — `faq/page.tsx`: remove the wrapping
  `<Section tone="paper" className="-mt-24 md:-mt-32">…</Section>` and render
  `<FaqAccordion groups={faqGroups} />` directly (the accordion now owns its sections).

- [ ] **Step 5: Run, verify green** — `npm test -- FaqAccordion` → PASS (new + existing).

- [ ] **Step 6: Commit** — `feat(faq): central petrol band via per-group sections`.

---

### Task 4: Gate + browser-verify

- [ ] **Step 1: Full gate** — `npx tsc --noEmit` · `npm run lint` · `npm test` (all green) · `npm run build`.
- [ ] **Step 2: Browser** — server on :3001; check `/leistungen` and `/faq` at 1440 and 390:
  - Leistungen: detail cards read crisply on petrol bands (no muddy bleed), chips/punchline/numerals legible; no two petrols adjacent; MehrMöglich still reads as the capstone.
  - FAQ: middle group is a clean petrol band — papier questions, gletscher answers, honig `+`, focus ring visible; expand/collapse works; light groups unchanged.
- [ ] **Step 3:** No extra commit unless the browser pass surfaces a tweak.

---

## Verification
- No copy changed; German typography untouched.
- Existing Leistungen/FAQ tests stay green.
- Not pushed — stacks with the other unpushed commits for one push on the founder's OK.
