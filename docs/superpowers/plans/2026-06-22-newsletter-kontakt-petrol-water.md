# Newsletter + Kontakt petrol water sections — Implementation Plan

> Steps use checkbox (`- [ ]`). TDD: failing test → minimal impl → green → commit.

**Goal:** Replace the bland papier surround on the /newsletter and /kontakt form sections with a petrol flowing-water section, the dark card floating on it.

**Architecture:** Extract the homepage `Steps` backdrop into a reusable `WaterSection`; use it on both pages; give the dark cards a gletscher edge-ring; switch the newsletter success state and the kontakt figcaption to on-dark text.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Vitest + RTL.

---

### Task 1: WaterSection component

**Files:**
- Create: `src/components/WaterSection.tsx`, `src/components/WaterSection.test.tsx`

- [ ] **Step 1: Failing test** — `WaterSection.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WaterSection } from "./WaterSection";

describe("WaterSection", () => {
  it("renders a petrol section with the flowing-water backdrop and its children", () => {
    const { container } = render(
      <WaterSection>
        <p>Inhalt</p>
      </WaterSection>
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-vrelo-petrol");
    const img = container.querySelector('img[aria-hidden="true"]');
    expect(img?.getAttribute("src")).toContain("fliessen");
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("forwards className to the section", () => {
    const { container } = render(<WaterSection className="-mt-24"><span>x</span></WaterSection>);
    expect(container.querySelector("section")).toHaveClass("-mt-24");
  });
});
```

- [ ] **Step 2: Run, verify fail** — `npm test -- WaterSection` → FAIL (module missing).

- [ ] **Step 3: Implement** — `WaterSection.tsx`:

```tsx
import type { ReactNode } from "react";
import { Section } from "@/components/Section";

// A petrol Section with a faint flowing-water backdrop (the homepage `Steps`
// treatment): the fliessen texture under a petrol/70 overlay keeps content
// legible. Children render above the backdrop.
export function WaterSection({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Section tone="petrol" className={`relative isolate overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/fliessen.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-vrelo-petrol/70" />
      {children}
    </Section>
  );
}
```

- [ ] **Step 4: Run, verify green** — `npm test -- WaterSection` → PASS.

- [ ] **Step 5: Commit** — `feat(ui): add reusable WaterSection (petrol + flowing-water backdrop)`.

---

### Task 2: Newsletter — petrol water section

**Files:**
- Modify: `src/components/newsletter/NewsletterSuccess.tsx`, `src/components/newsletter/NewsletterSuccess.test.tsx`, `src/components/newsletter/NewsletterForm.tsx`, `src/app/newsletter/page.tsx`

- [ ] **Step 1: Failing test** — add to `NewsletterSuccess.test.tsx`:

```tsx
  it("renders the thank-you heading on-dark (petrol section)", () => {
    render(<NewsletterSuccess />);
    expect(screen.getByText("Fast geschafft.")).toHaveClass("text-papier");
  });
```

- [ ] **Step 2: Run, verify fail** — `npm test -- NewsletterSuccess` → FAIL.

- [ ] **Step 3: Implement NewsletterSuccess** — heading `text-tiefes-wasser` → `text-papier`;
  body paragraph `text-stumm` → `text-gletscher`. Leave the success-ring and PageImage.

- [ ] **Step 4: Run, verify green** — `npm test -- NewsletterSuccess` → PASS.

- [ ] **Step 5: NewsletterForm** — the full-variant return card
  `<div className="mx-auto max-w-xl rounded-2xl bg-tiefes-wasser p-8 shadow-deepwater md:p-10">`
  → add `ring-1 ring-gletscher/15` (after `shadow-deepwater`). Compact variant untouched.

- [ ] **Step 6: page.tsx** — import `WaterSection`; replace
  `<Section tone="paper" className="-mt-24 md:-mt-32"> … </Section>` with
  `<WaterSection className="-mt-24 md:-mt-32"> … </WaterSection>`. In the placeholder card,
  add `ring-1 ring-gletscher/15` to its `bg-tiefes-wasser` div. Remove the now-unused
  `Section` import if nothing else uses it.

- [ ] **Step 7: Commit** — `feat(newsletter): petrol water form section; on-dark success state`.

---

### Task 3: Kontakt — one petrol water room

**Files:**
- Modify: `src/app/kontakt/page.tsx`

- [ ] **Step 1: Implement** — import `WaterSection`; replace the two stacked
  `<Section tone="paper" …>` blocks with a single:

```tsx
<WaterSection className="-mt-24 md:-mt-32">
  <div className="mx-auto max-w-xl rounded-2xl bg-tiefes-wasser p-8 shadow-deepwater ring-1 ring-gletscher/15 md:p-10">
    {configured ? <ContactForm /> : (/* unchanged placeholder block */)}
  </div>
  <figure className="mt-16 md:mt-20">
    <figcaption className="mb-5 text-center font-serif text-xl italic text-papier md:text-2xl">
      Der erste Tropfen genügt.
    </figcaption>
    <RippleImage
      src="/images/kontakt-banner.webp"
      alt="Eine ruhige Wasseroberfläche im warmen Morgenlicht; ein erster sanfter Ring breitet sich aus."
      className="aspect-[21/9] w-full rounded-2xl shadow-deepwater ring-1 ring-gletscher/10"
      seedXFraction={0.5}
      seedYFraction={0.46}
    />
  </figure>
</WaterSection>
```

  Keep the placeholder block (CardHeading + mailto / fallback) exactly as it was. Remove
  the now-unused `Section` import if nothing else uses it.

- [ ] **Step 2: Verify the figcaption byte** — „Der erste Tropfen genügt." keeps the
  German „…" and any en-dash intact (class-only edit, but confirm after the write).

- [ ] **Step 3: Commit** — `feat(kontakt): one petrol water room for form + ripple banner`.

---

### Task 4: Gate + browser-verify

- [ ] **Step 1: Full gate** — `npx tsc --noEmit` · `npm run lint` · `npm test` (all green) · `npm run build`.
- [ ] **Step 2: Browser** (server on :3001, rebuild + restart) — `/newsletter` and `/kontakt` at 1440 and 390:
  - Card pops on the textured petrol; field labels/inputs/consent/button all legible (gletscher labels, papier inputs, amber button).
  - Newsletter: trigger/inspect the success state — „Fast geschafft." papier + gletscher body legible on petrol, banner reads.
  - Kontakt: form card + ripple banner share one petrol room; figcaption papier; ripple still animates.
  - 0 console errors.
- [ ] **Step 3:** No extra commit unless the browser pass surfaces a tweak.

---

## Verification
- German typography untouched (class-only edits).
- Existing newsletter/kontakt action + confirm tests stay green.
- Not pushed — stacks with the other unpushed commits for one push on the founder's OK.
