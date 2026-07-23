# `/makler` Copy-Cut Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut roughly 60 % of the prose on `/makler`, move the CTA out of the hero into a mid-page band after the Termin-Quelle block, and add a short strip stating that the server is the client's own (under 10 € a month) and that maintenance is optional.

**Architecture:** Almost everything is data: `src/lib/makler.ts` loses fields and gains three. Components lose the paragraphs that rendered the deleted fields; two new section components are added and one (`Bridge`) is deleted. No shared component outside `src/components/makler/` is modified, so the five existing pages cannot regress.

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (`@theme` tokens) · Vitest + React Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-07-23-makler-copy-cut-design.md`

## Global Constraints

- **German punctuation.** Quotes are `„` (U+201E) / `“` (U+201C) — never the ASCII straight quote. The Gedankenstrich is the spaced en-dash ` – ` (U+2013) — never the em-dash (U+2014). `src/lib/makler.ts` currently contains **zero** em-dashes; it must still contain zero afterwards.
- **Verify bytes after every write to `src/lib/makler.ts`.** Write/Edit silently downgrade the closing German quote. Audit, then repair:
  ```bash
  perl -CSD -ne 'while(/(["\x{2014}])/g){$c{$1}++} END{for(sort keys %c){printf "U+%04X %s\n", ord($_), $c{$_}}}' src/lib/makler.ts
  ```
  ⚠ The usual repair one-liner `s/\x{201E}([^\x{201E}"]*)"/…/g` is **greedy across a line** and will also eat a legitimate ASCII `"` further along. Repair single lines, then re-audit.
- **Exactly one currency figure on the whole page:** `unter 10 €`, in the server item. No Vrelo price — no setup fee, no monthly rate, no `netto`. Enforced by tests in Tasks 1 and 4.
- **German copy lives only in `src/lib/makler.ts`.** Components hold no German strings.
- **Never claim Vrelo provides the server.** The copy says the client owns it and Vrelo sets it up. This is a licence constraint (n8n is fair-code: Vrelo may not host or resell it) and it is what makes the Document-Concierge trust paragraph true. See spec §2.1.
- **Tailwind `@theme` tokens only.** On petrol, body copy is `gletscher`; `text-stein` never on petrol; amber may only carry text ≥24px.
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Branch: `feat/makler-landingpage` (already checked out).

## File Structure

| File | Change |
|---|---|
| `src/lib/makler.ts` | Types + data: hoist `cta`, shorten `hero.lead`, delete four prose fields, `solves`/`points` become `string[]`, drop `bridge`, add `midCta` + `voraussetzungen`, objections 6 → 4. |
| `src/lib/makler.test.ts` | Price guard narrowed to permit exactly one currency string; shape assertions updated. |
| `src/components/makler/TerminQuelleBlock.tsx` | Drop body paragraph; `solves` renders as a headline-only list. |
| `src/components/makler/DocumentConciergeBlock.tsx` | Drop body paragraph. |
| `src/components/makler/WarumIch.tsx` | Points render as a headline-only list; section tone paper (was tint). |
| `src/components/makler/TerminSection.tsx` | Drop body paragraph. |
| `src/components/makler/MaklerHeader.tsx` | Read `makler.cta` instead of `makler.hero.cta`. |
| `src/components/makler/MidCta.tsx` | **New** — the mid-page CTA band. |
| `src/components/makler/Voraussetzungen.tsx` | **New** — server + optional maintenance. |
| `src/components/makler/Bridge.tsx` | **Deleted.** |
| `src/components/makler/sections.test.tsx` | Bridge cases removed; WarumIch, Einwaende, TerminSection updated; MidCta + Voraussetzungen added. |
| `src/components/makler/MaklerHeader.test.tsx` | Reads `makler.cta`. |
| `src/components/makler/TerminQuelleBlock.test.tsx` | Asserts headline-only benefits. |
| `src/components/makler/DocumentConciergeBlock.test.tsx` | Asserts no product body paragraph. |
| `src/app/makler/page.tsx` | Hero without `actions`; new section order; `Bridge` out, `MidCta` + `Voraussetzungen` in. |
| `src/app/makler/page.test.tsx` | Order, no hero CTA, single currency figure. |

---

### Task 1: Copy module — cut, hoist, add

**Files:**
- Modify: `src/lib/makler.ts`
- Modify: `src/lib/makler.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: from `@/lib/makler` — `makler.cta` (`{ label, short, href, note }`), `makler.hero` (`{ title, lead }`), `makler.midCta` (`{ line }`), `makler.voraussetzungen` (`{ title, items: MaklerBullet[] }`). `MaklerProduct.body` is now optional; `MaklerProduct.solves` and `warumIch.points` are `string[]`. `makler.bridge` and `makler.close.body` no longer exist.

- [ ] **Step 1: Rewrite the type block**

In `src/lib/makler.ts`, replace the whole `export type MaklerPage = { … };` block with:

```ts
export type MaklerPage = {
  /** The single CTA definition, shared by the header and the mid-page band. */
  cta: { label: string; short: string; href: string; note: string };
  hero: { title: string; lead: string };
  problem: { title: string; intro: string; leaks: MaklerBullet[]; close: string };
  terminQuelle: MaklerProduct;
  midCta: { line: string };
  documentConcierge: MaklerProduct;
  voraussetzungen: { title: string; items: MaklerBullet[] };
  warumIch: { title: string; intro: string; points: string[] };
  garantie: {
    title: string;
    intro: string;
    promises: MaklerBullet[];
    close: string;
    founding: { title: string; body: string };
  };
  einwaende: { title: string; items: { question: string; answer: string }[] };
  close: {
    title: string;
    fallbackHint: string;
    fallback: { prompt: string; label: string; href: string };
  };
};
```

Then in the `MaklerProduct` type above it, change two members:

```ts
  /** Deleted on /makler — the page shows, it does not explain. */
  body?: string;
  /** Benefit headlines only; the explanatory bodies were cut. */
  solves?: string[];
```

- [ ] **Step 2: Replace the `cta` + `hero` data**

Replace the existing `hero: { … },` block at the top of `export const makler` with:

```ts
  cta: {
    label: "Erstgespräch vereinbaren",
    short: "Erstgespräch",
    href: "#termin",
    note: "Kostenloses Erstgespräch – 30 Minuten, unverbindlich.",
  },

  hero: {
    title: "Jede Anfrage, die wartet, ist ein Termin weniger.",
    lead: "Zwei Systeme: eines macht aus jeder Anfrage einen Termin, eines sammelt die Unterlagen ein. Beide baue ich dir, beide laufen ohne dich.",
  },
```

- [ ] **Step 3: Slim the Termin-Quelle product**

In `terminQuelle`, **delete the `body:` line entirely** and replace the whole `solves: [ … ],` array with:

```ts
    solves: [
      "Antwortet, wenn du schläfst",
      "Fragt nach, bevor du Zeit investierst",
      "Beendet das Termin-Pingpong",
      "Bleibt dran, ohne zu nerven",
    ],
```

Leave `eyebrow`, `name`, `promise`, `chips`, `outcome`, `proof` and `demoVideo` untouched.

- [ ] **Step 4: Replace `bridge` with `midCta`**

Replace the whole `bridge: { … },` block with:

```ts
  midCta: {
    line: "Klingt das nach deiner Woche?",
  },
```

- [ ] **Step 5: Slim the Document Concierge**

In `documentConcierge`, **delete the `body:` line entirely**. Leave `eyebrow`, `name`, `promise`, `flow`, `outcome`, `trust`, `note` and `demoVideo` untouched.

- [ ] **Step 6: Add the `voraussetzungen` block**

Insert directly after the `documentConcierge: { … },` block and before `warumIch`:

```ts
  voraussetzungen: {
    title: "Was du dazu brauchst: fast nichts",
    items: [
      {
        title: "Deinen eigenen Server",
        body: "Ich richte ihn ein und baue alles darauf. Er läuft auf deinem eigenen Konto – unter 10 € im Monat, und er gehört dir. Deshalb liegen deine Daten auch bei dir und nicht bei mir.",
      },
      {
        title: "Wartung nur, wenn du willst",
        body: "Monatlich kündbar. Kündigst du, läuft alles weiter – du verlierst nur meine Aufmerksamkeit und die laufenden Verbesserungen, nie die Sicherheit.",
      },
    ],
  },
```

- [ ] **Step 7: Flatten `warumIch.points`**

Replace the whole `points: [ … ],` array inside `warumIch` with:

```ts
    points: [
      "Ein Ansprechpartner",
      "Maßgeschneidert, nicht von der Stange",
      "Klartext statt Technik-Deutsch",
      "Du lernst und wartest nichts",
    ],
```

Leave `warumIch.title` and `warumIch.intro` untouched.

- [ ] **Step 8: Cut two objections and the closing paragraph**

In `einwaende.items`, delete the two entries whose `question` values are:
- `"Klingt das nicht wie ein Roboter?"`
- `"Wird das ein großes, riskantes Projekt?"`

Four entries remain. Then in `close`, **delete the `body:` line entirely**, leaving `title`, `fallbackHint` and `fallback`.

- [ ] **Step 9: Audit and repair the punctuation bytes**

```bash
cd Website
perl -CSD -ne 'while(/(["\x{2014}])/g){$c{$1}++} END{for(sort keys %c){printf "U+%04X %s\n", ord($_), $c{$_}}}' src/lib/makler.ts
```
Expected: `U+2014` absent. Every `U+0022` must be a TypeScript delimiter — never inside German prose. If a closing `“` was downgraded, repair that single line and re-audit.

- [ ] **Step 10: Update the guard test**

In `src/lib/makler.test.ts`, replace the single `it("never names a price", …)` case with these three, and update the two shape assertions at the bottom of the file:

```ts
  const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

  it("names no price outside the server note", () => {
    const { voraussetzungen: _skip, ...rest } = makler;
    expect(strings(rest).filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("allows exactly one currency figure – the client's own server cost", () => {
    const hits = strings(makler.voraussetzungen).filter((s) => s.includes("€"));
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain("unter 10 €");
  });

  it("never claims Vrelo provides the server", () => {
    // n8n is fair-code: the client running it on his OWN server is permitted,
    // Vrelo hosting or reselling it is not. It is also what makes the Document
    // Concierge trust paragraph true. See the design spec §2.1.
    const server = makler.voraussetzungen.items[0].body;
    expect(server).toContain("deinem eigenen Konto");
    expect(server).toContain("er gehört dir");
  });
```

Replace the existing `it("points the demo invitation at /demo and the CTA at the booking anchor", …)` with:

```ts
  it("points the demo invitation at /demo and the CTA at the booking anchor", () => {
    expect(makler.terminQuelle.proof?.href).toBe("/demo");
    expect(makler.cta.href).toBe("#termin");
    expect(makler.cta.short.length).toBeLessThan(makler.cta.label.length);
  });

  it("keeps the hero free of CTA copy and drops the bridge", () => {
    expect(makler.hero).not.toHaveProperty("cta");
    expect(makler).not.toHaveProperty("bridge");
    expect(makler.close).not.toHaveProperty("body");
  });

  it("trims the objections to four", () => {
    expect(makler.einwaende.items).toHaveLength(4);
  });
```

- [ ] **Step 11: Run the guard test**

Run: `npx vitest run src/lib/makler.test.ts`
Expected: PASS. TypeScript errors in the components are expected at this point — they are fixed in Task 2.

- [ ] **Step 12: Commit**

```bash
git add src/lib/makler.ts src/lib/makler.test.ts
git commit -m "feat(makler): cut copy, hoist the CTA, add the server and maintenance facts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Slim the existing components

**Files:**
- Modify: `src/components/makler/TerminQuelleBlock.tsx`
- Modify: `src/components/makler/DocumentConciergeBlock.tsx`
- Modify: `src/components/makler/WarumIch.tsx`
- Modify: `src/components/makler/TerminSection.tsx`
- Modify: `src/components/makler/MaklerHeader.tsx`
- Modify: `src/components/makler/TerminQuelleBlock.test.tsx`
- Modify: `src/components/makler/DocumentConciergeBlock.test.tsx`
- Modify: `src/components/makler/MaklerHeader.test.tsx`

**Interfaces:**
- Consumes: `makler.cta`, `makler.terminQuelle.solves: string[]`, `makler.warumIch.points: string[]` (Task 1).
- Produces: the same component exports, unchanged signatures.

- [ ] **Step 1: Update the Termin-Quelle tests first**

In `src/components/makler/TerminQuelleBlock.test.tsx`, replace the whole `describe` body with:

```tsx
describe("TerminQuelleBlock", () => {
  it("names the product as a section heading", () => {
    render(<TerminQuelleBlock />);
    expect(screen.getByRole("heading", { level: 2, name: /Termin-Quelle/ })).toBeInTheDocument();
  });

  it("shows the mechanism as an ordered list of steps", () => {
    render(<TerminQuelleBlock />);
    const list = screen.getByRole("list", { name: "Ablauf" });
    expect(list.querySelectorAll("li")).toHaveLength(makler.terminQuelle.chips!.length);
  });

  it("lists the benefits as headlines only – no explanatory bodies", () => {
    render(<TerminQuelleBlock />);
    const list = screen.getByRole("list", { name: "Was es dir abnimmt" });
    const items = [...list.querySelectorAll("li")].map((li) => li.textContent?.trim());
    expect(items).toEqual(makler.terminQuelle.solves);
  });

  it("invites the visitor into the live demo", () => {
    render(<TerminQuelleBlock />);
    const demo = screen.getByRole("link", { name: makler.terminQuelle.proof!.label });
    expect(demo).toHaveAttribute("href", "/demo");
  });

  it("never shows a price", () => {
    const { container } = render(<TerminQuelleBlock />);
    expect(container.textContent).not.toMatch(/€/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/makler/TerminQuelleBlock.test.tsx`
Expected: FAIL — no list named „Was es dir abnimmt“, and the component still reads `p.body`.

- [ ] **Step 3: Slim `TerminQuelleBlock.tsx`**

Delete this line:

```tsx
        <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-gletscher">{p.body}</p>
```

Replace the whole `<dl className="mt-10 …"> … </dl>` block with:

```tsx
        <ul aria-label="Was es dir abnimmt" className="mt-10 grid gap-3 sm:grid-cols-2">
          {p.solves!.map((s) => (
            <li key={s} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 text-amber">
                →
              </span>
              <span className="font-medium text-papier">{s}</span>
            </li>
          ))}
        </ul>
```

The amber arrow is `aria-hidden` decoration, so its 3.8:1 ratio on petrol is not a text-contrast concern; the label itself is `papier`.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/makler/TerminQuelleBlock.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Update the Document Concierge test**

In `src/components/makler/DocumentConciergeBlock.test.tsx`, add this case inside the existing `describe`:

```tsx
  it("shows no explanatory body paragraph – the flow cards carry it", () => {
    const { container } = render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    expect(makler.documentConcierge.body).toBeUndefined();
    // A phrase that existed only in the deleted body — a real regression guard.
    expect(container.textContent).not.toContain("20-Sekunden-Formular");
  });
```

- [ ] **Step 6: Slim `DocumentConciergeBlock.tsx`**

Delete this line:

```tsx
          <p className="mt-6 text-pretty leading-relaxed text-tinte">{p.body}</p>
```

- [ ] **Step 7: Run it to verify it passes**

Run: `npx vitest run src/components/makler/DocumentConciergeBlock.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 8: Slim `WarumIch.tsx`**

Replace the whole file body's `<Section tint>` opening tag with `<Section tone="paper">` — the new `Voraussetzungen` section directly above it is the cool tint, and two cool bands in a row would flatten the rhythm. Then replace the whole `<ul className="mx-auto mt-12 …"> … </ul>` block with:

```tsx
      <ul aria-label="Was das für dich bedeutet" className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
        {w.points.map((p, i) => (
          <Reveal as="li" key={p} delayMs={i * 60} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5 text-vrelo-petrol">
              →
            </span>
            <span className="font-medium text-tiefes-wasser">{p}</span>
          </Reveal>
        ))}
      </ul>
```

- [ ] **Step 9: Slim `TerminSection.tsx`**

Delete this line:

```tsx
        <p className="mt-4 text-pretty text-lg text-gletscher">{c.body}</p>
```

Leave the `id="termin"` / `scroll-mt-24` element, the heading, the `SchedulerEmbed` and the fallback line exactly as they are.

- [ ] **Step 10: Point `MaklerHeader` at the hoisted CTA**

In `src/components/makler/MaklerHeader.tsx`, replace the three `makler.hero.*` reads:

```tsx
        <div className="hidden sm:block">
          <CTAButton href={makler.cta.href}>{makler.cta.label}</CTAButton>
        </div>
        <div className="sm:hidden">
          <CTAButton href={makler.cta.href}>{makler.cta.short}</CTAButton>
        </div>
```

And in `src/components/makler/MaklerHeader.test.tsx`, replace every `makler.hero.cta.label` with `makler.cta.label` and every `makler.hero.ctaShort` with `makler.cta.short`.

- [ ] **Step 11: Type-check and run the component tests**

Run: `npx tsc --noEmit`
Expected: errors **only** in `src/components/makler/Bridge.tsx`, `src/components/makler/sections.test.tsx` and `src/app/makler/page.tsx` — all three still reference the `bridge` field deleted in Task 1, and all three are resolved in Tasks 3 and 4. Any error in a file this task touched is a real defect: fix it before committing.

Run: `npx vitest run src/components/makler/TerminQuelleBlock.test.tsx src/components/makler/DocumentConciergeBlock.test.tsx src/components/makler/MaklerHeader.test.tsx`
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add src/components/makler
git commit -m "refactor(makler): drop the explanatory paragraphs from the product and closing blocks

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: The two new sections

**Files:**
- Create: `src/components/makler/MidCta.tsx`
- Create: `src/components/makler/Voraussetzungen.tsx`
- Delete: `src/components/makler/Bridge.tsx`
- Modify: `src/components/makler/sections.test.tsx`

**Interfaces:**
- Consumes: `makler.cta`, `makler.midCta`, `makler.voraussetzungen` (Task 1); `Section`, `Reveal`, `CTAButton`.
- Produces: `<MidCta />` and `<Voraussetzungen />`, both prop-less.

- [ ] **Step 1: Rewrite the sections test**

In `src/components/makler/sections.test.tsx`: delete the `import { Bridge } from "./Bridge";` line and the whole `describe("Bridge", …)` block. Add these imports beside the others:

```tsx
import { MidCta } from "./MidCta";
import { Voraussetzungen } from "./Voraussetzungen";
```

Replace the whole `describe("WarumIch", …)` block with:

```tsx
describe("WarumIch", () => {
  it("lists the differentiators as headlines only", () => {
    render(<WarumIch />);
    const list = screen.getByRole("list", { name: "Was das für dich bedeutet" });
    const items = [...list.querySelectorAll("li")].map((li) => li.textContent?.trim());
    expect(items).toEqual(makler.warumIch.points);
  });
});
```

Replace the whole `describe("Einwaende", …)` block with:

```tsx
describe("Einwaende", () => {
  it("renders exactly four objections as disclosures", () => {
    const { container } = render(<Einwaende />);
    expect(container.querySelectorAll("details")).toHaveLength(4);
    expect(makler.einwaende.items).toHaveLength(4);
  });
});
```

In `describe("TerminSection", …)`, replace the first case with:

```tsx
  it("carries the anchor the header CTA points at, with its own scroll offset", () => {
    const { container } = render(<TerminSection calLink={undefined} />);
    const anchor = container.querySelector("#termin");
    expect(anchor).not.toBeNull();
    // scroll-margin-top only applies to the anchor target itself, never an
    // ancestor — so the class must sit on this very element.
    expect(anchor?.className).toMatch(/\bscroll-mt-/);
  });

  it("shows no explanatory paragraph above the scheduler", () => {
    render(<TerminSection calLink={undefined} />);
    expect(makler.close).not.toHaveProperty("body");
  });
```

Append these two new blocks at the end of the file:

```tsx
describe("MidCta", () => {
  it("asks for the call once, pointing at the booking anchor", () => {
    render(<MidCta />);
    const cta = screen.getByRole("link", { name: makler.cta.label });
    expect(cta).toHaveAttribute("href", "#termin");
  });

  it("carries the friction-reducing note", () => {
    render(<MidCta />);
    expect(screen.getByText(makler.cta.note)).toBeInTheDocument();
  });
});

describe("Voraussetzungen", () => {
  it("states both requirements", () => {
    render(<Voraussetzungen />);
    for (const item of makler.voraussetzungen.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.body)).toBeInTheDocument();
    }
  });

  it("names the server cost and says the server is his", () => {
    const { container } = render(<Voraussetzungen />);
    expect(container.textContent).toContain("unter 10 €");
    expect(container.textContent).toContain("deinem eigenen Konto");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/makler/sections.test.tsx`
Expected: FAIL — cannot resolve `./MidCta`.

- [ ] **Step 3: Create `src/components/makler/MidCta.tsx`**

```tsx
import { CTAButton } from "@/components/CTAButton";
import { makler } from "@/lib/makler";

// The only CTA before the closing booking section. It sits directly under the
// Termin-Quelle block — the earliest point the ask is earned, because that is
// the product he can grasp and try. The hero deliberately has none; the sticky
// header keeps one reachable above the fold.
//
// Plain markup rather than `Section`: a CTA band wants to sit tight against the
// product it follows, and `Section`'s inner wrapper hard-codes py-24/32, which
// an arbitrary child variant cannot reliably override. The negative top margin
// cancels the preceding section's bottom padding (the site-wide pattern).
export function MidCta() {
  return (
    <section className="-mt-24 bg-gletscher/30 text-tinte md:-mt-32">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[44rem] text-center">
          <p className="text-balance font-serif text-2xl italic text-vrelo-petrol md:text-3xl">
            {makler.midCta.line}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <CTAButton href={makler.cta.href}>{makler.cta.label}</CTAButton>
            <p className="text-sm text-stumm">{makler.cta.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/components/makler/Voraussetzungen.tsx`**

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// Clears the two silent objections — "do I need to buy technology?" and "am I
// locked in?" — before the visitor weighs the person behind the offer.
//
// The server wording is load-bearing, not marketing: the client opens and owns
// the account. n8n is fair-code (Vrelo may not host or resell it), and the
// Document Concierge's "no file ever reaches me" claim is only true because the
// server is his. Never rewrite this to say Vrelo provides it.
export function Voraussetzungen() {
  const v = makler.voraussetzungen;
  return (
    <Section tint>
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {v.title}
        </h2>
      </div>
      <dl className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {v.items.map((item, i) => (
          <Reveal
            key={item.title}
            delayMs={i * 80}
            className="card-depth rounded-2xl bg-papier p-6"
          >
            <dt className="font-semibold text-tiefes-wasser">{item.title}</dt>
            <dd className="mt-2 text-pretty leading-relaxed text-tinte">{item.body}</dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
```

`dt`/`dd` here hold plain text, not headings — a heading inside `<dt>` is invalid HTML (recorded gotcha).

- [ ] **Step 5: Delete the Bridge component**

```bash
git rm src/components/makler/Bridge.tsx
```

- [ ] **Step 6: Run the sections test**

Run: `npx vitest run src/components/makler/sections.test.tsx`
Expected: PASS (9 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/makler
git commit -m "feat(makler): mid-page CTA band and the server/maintenance strip, drop the bridge

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Recompose the page

**Files:**
- Modify: `src/app/makler/page.tsx`
- Modify: `src/app/makler/page.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1-3.
- Produces: the final `/makler` route.

- [ ] **Step 1: Rewrite the page test**

Replace the whole `describe("/makler", …)` block in `src/app/makler/page.test.tsx` with:

```tsx
describe("/makler", () => {
  it("is excluded from search engines", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("leads with the pain headline as the only H1", () => {
    render(<MaklerPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(makler.hero.title);
  });

  it("asks for nothing in the hero – the CTA comes after the first product", () => {
    const { container } = render(<MaklerPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    const firstCta = [...container.querySelectorAll('a[href="#termin"]')].find(
      (a) => !a.closest("header"),
    );
    const problemHeading = screen.getByRole("heading", { level: 2, name: makler.problem.title });
    expect(firstCta).toBeTruthy();
    // The first in-page CTA must appear after the pain section, not beside the H1.
    expect(problemHeading.compareDocumentPosition(firstCta!) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(h1.parentElement?.querySelector('a[href="#termin"]')).toBeNull();
  });

  it("runs the sections in the agreed order", () => {
    render(<MaklerPage />);
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent?.trim());
    expect(headings).toEqual([
      makler.problem.title,
      makler.terminQuelle.name,
      makler.documentConcierge.name,
      makler.voraussetzungen.title,
      makler.warumIch.title,
      makler.garantie.title,
      makler.einwaende.title,
      makler.close.title,
    ]);
  });

  it("carries both products and the demo link", () => {
    render(<MaklerPage />);
    expect(screen.getByRole("link", { name: makler.terminQuelle.proof!.label })).toHaveAttribute(
      "href",
      "/demo",
    );
  });

  it("brings its own minimal chrome and no site navigation", () => {
    render(<MaklerPage />);
    expect(screen.getByRole("link", { name: "Impressum" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ratgeber" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Newsletter" })).not.toBeInTheDocument();
  });

  it("shows the server cost once and no Vrelo price", () => {
    const { container } = render(<MaklerPage />);
    const text = container.textContent ?? "";
    expect(text.match(/€/g) ?? []).toHaveLength(1);
    expect(text).toContain("unter 10 €");
    expect(text).not.toMatch(/netto|\/\s*Monat|pro Monat/i);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/app/makler/page.test.tsx`
Expected: FAIL — the heading order still contains the bridge and lacks „Was du dazu brauchst“.

- [ ] **Step 3: Rewrite the page body**

In `src/app/makler/page.tsx`, replace the `Bridge` import with the two new ones and drop the now-unused `CTAButton` import:

```tsx
import { MidCta } from "@/components/makler/MidCta";
import { Voraussetzungen } from "@/components/makler/Voraussetzungen";
```

Then replace the whole `return ( … )` body with:

```tsx
    <>
      <MaklerHeader />
      <PageHero
        title={makler.hero.title}
        lead={makler.hero.lead}
        src="/images/lead-check-banner.webp"
      />
      <ProblemSection />
      <TerminQuelleBlock />
      <MidCta />
      <DocumentConciergeBlock product={makler.documentConcierge} />
      <Voraussetzungen />
      <WarumIch />
      <Garantie />
      <Einwaende />
      <TerminSection calLink={calLink()} />
      <MaklerFooter />
    </>
```

The hero no longer passes `actions`, so no CTA renders above the pain section. `PageHero` itself is unchanged.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/app/makler/page.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/makler
git commit -m "feat(makler): recompose the page – CTA after the first product, new server strip

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Gate and browser verification

**Files:** none created; fixes land where the defect lives.

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: PASS, no skipped suites.

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit` — expected no output.
Run: `npm run lint` — expected no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: success, `/makler` listed as a static route.

- [ ] **Step 4: Punctuation audit**

```bash
perl -CSD -ne 'while(/(["\x{2014}])/g){$c{$1}++} END{for(sort keys %c){printf "U+%04X %s\n", ord($_), $c{$_}}}' src/lib/makler.ts src/components/makler/*.tsx
```
Expected: `U+2014` absent from `src/lib/makler.ts`. Em-dashes in English code comments are permitted.

- [ ] **Step 5: Serve the fresh build**

Free the port first — a stale `next start` will keep serving the previous build and silently invalidate the whole browser pass:

```bash
netstat -ano | grep ":3000" | grep LISTEN     # note the PID, if any
```
Kill it (PowerShell: `Stop-Process -Id <PID> -Force`), then run `npm start` in the background and confirm the fresh build is live:

```bash
curl -s http://localhost:3000/makler | grep -c "Was du dazu brauchst"   # expect 1
```

- [ ] **Step 6: Browser pass**

Playwright MCP tools are available but not loaded by default — load them with `ToolSearch` (query `+browser navigate evaluate resize`).

⚠ **This sandbox scales `browser_resize`.** Always read back `window.innerWidth` and compensate until it reports the intended width; a previous pass reported „verified at 390px“ while actually measuring 520px and missed a real defect.

Verify at **true** 1440 and **true** 390:
- No CTA anywhere above the „An zwei Stellen läuft dir die Zeit weg“ heading, other than the sticky header's.
- The mid-page CTA sits directly under the Termin-Quelle panel; measure the gap and report it.
- Section order matches the plan; no doubled-padding gap larger than ~200px between any two sections.
- `/makler#termin` leaves the closing heading clear of the sticky header.
- No horizontal overflow at 390.
- `€` appears exactly once on the rendered page.
- `/`, `/lead-check` and `/demo` still render the full site chrome (fetch their HTML and count `header nav a`).

Shut the server down afterwards and confirm port 3000 is free.

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: browser-verification fixes for the /makler copy cut

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Follow-ups (not this plan)

- Update `Website/CLAUDE.md`'s `/makler` in-flight block once this lands, including the fact that the page now carries one deliberate currency figure.
- The „Bridge spacing" observation recorded in `CLAUDE.md` is resolved by this plan: the `Bridge` section no longer exists.
