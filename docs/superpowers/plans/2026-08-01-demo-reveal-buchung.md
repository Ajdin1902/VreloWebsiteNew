# Demo-Reveal: Direktbuchung + sichtbare Zusammenfassung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** End the `/demo` role-play on a booking the visitor can complete without leaving the page, with the summary actually visible when it appears.

**Architecture:** All changes live in one component, `src/components/demo/Protokoll.tsx` (the reveal card), plus its test file. Three independent behaviours: (1) the card scrolls itself into view and focuses its heading on mount, (2) the CTA moves above the transcript and the transcript collapses into a native `<details>`, (3) the `/kontakt` link is replaced by a petrol band hosting the existing `SchedulerEmbed`. `SchedulerEmbed` and `Demo.tsx` are not modified.

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (`@theme` tokens) · Vitest + React Testing Library (jsdom) · `@calcom/embed-react`

**Spec:** [`docs/superpowers/specs/2026-08-01-demo-reveal-buchung-design.md`](../specs/2026-08-01-demo-reveal-buchung-design.md)

## Global Constraints

- **Branch:** work on `feat/demo-reveal-buchung` (already created; the spec commit is on it). Do not commit to `main`.
- **The working tree has unrelated uncommitted changes** (`CLAUDE.md`, `src/lib/makler.ts`, `src/lib/makler.test.ts`, `src/app/makler/page.test.tsx`, `src/components/makler/sections.test.tsx`, `content/ratgeber/was-kostet-anfragen-automatisieren.mdx`) from earlier work. **Never `git add -A` or `git add .`** – every commit in this plan lists its files explicitly.
- **Client-facing copy is German; code and comments are English.**
- **German typography:** quotes are „…“ (U+201E open / U+201C close), never ASCII `"`. The Gedankenstrich is the **spaced en-dash** „ – “ (U+2013), never the em-dash (U+2014). The Write/Edit tools silently downgrade the closing quote and can mangle dashes – after any write that touches German copy, verify the bytes (Task 4 does this once at the end; do it earlier too if you retype a German string).
- **Generic masculine** in German copy („Kunden“, not „Kund:innen“).
- **Do not modify** `src/components/kontakt/SchedulerEmbed.tsx` – it is live on `/kontakt` and `/makler`.
- **Do not modify** the demo engine: `src/app/demo/{chat,extract,summary}/route.ts`, `src/lib/demo/*`, or `src/components/demo/{Demo,Setup,RoleSwitch,Chat}.tsx`.
- **No prices anywhere on the site.** No new data storage – the Terminnotiz and the mail preview stay display-only.
- **Verification commands** (run from `Website/`): `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`. For manual browser checks use `npm start`, **not** `npm run dev`.

## Facts you need that are not obvious

Established by probing this repo – do not re-derive:

- **jsdom has no `Element.prototype.scrollIntoView`** (it is `undefined`). Hence the optional call `?.()` in the implementation, and hence tests must install the API themselves before asserting on it.
- **`window.matchMedia` *is* polyfilled** in `vitest.setup.ts` and returns `matches: false` (= no reduced-motion preference). So the default test path yields `behavior: "smooth"`, and a reduced-motion test can `vi.spyOn(window, "matchMedia")`.
- **`@testing-library/jest-dom/vitest` is loaded globally**, so `toBeInTheDocument()` is available alongside plain `toBeTruthy()`.
- **Vitest v4 mock hoisting:** a top-level `const` referenced directly inside a `vi.mock()` factory throws „Cannot access before initialization“. Wrap shared state in `vi.hoisted(...)` – see `src/components/kontakt/SchedulerEmbed.test.tsx` for the working pattern.
- **`SchedulerEmbed` renders a `<button>Termin anzeigen</button>`** before the click and mounts the Cal iframe only after. With `calLink === undefined` it renders „Online-Terminbuchung folgt in Kürze.“ instead and no button.
- **Existing `<details>` precedent:** `src/components/lead-check/Result.tsx:59-60`.

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/components/demo/Protokoll.tsx` | The reveal card: summary fetch, Terminnotiz, mail preview, close CTA, transcript | **Modify** – all three behaviours |
| `src/components/demo/Protokoll.test.tsx` | Behaviour tests for the reveal card | **Modify** – 3 assertions updated, 8 cases added |
| `src/components/kontakt/SchedulerEmbed.tsx` | Click-to-load Cal embed (cal.eu origin pinned) | **Reuse unchanged** |
| `src/components/demo/Demo.tsx` | Phase machine | **Unchanged** |

`Protokoll.tsx` ends at ~175 lines. Both new blocks (`AbschlussCta`, the scroll effect) stay local to it, next to the existing `MailVorschau` – this is the file's established shape and one small extra component is no reason to split.

---

### Task 1: Scroll the reveal into view and announce it

The reveal replaces the chat card in place, so the browser keeps the scroll position from the bottom of a long conversation and the summary renders above the viewport. This task makes the card pull itself into view and hand focus to its heading.

**Files:**
- Modify: `src/components/demo/Protokoll.tsx`
- Test: `src/components/demo/Protokoll.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the outer card `<div>` carries `ref={cardRef}` and the class `scroll-mt-24`; the `<h2>` carries `ref={headingRef}` and `tabIndex={-1}`. Tasks 2 and 3 edit the same render tree and must preserve both.

- [ ] **Step 1: Replace the test file's `beforeEach` so `scrollIntoView` exists**

jsdom does not implement `scrollIntoView`, so there is nothing for `vi.spyOn` to spy on – assign the mock onto the prototype instead. In `src/components/demo/Protokoll.test.tsx`, replace this line:

```tsx
beforeEach(() => vi.restoreAllMocks());
```

with:

```tsx
// jsdom does not implement scrollIntoView, so there is no property to spy on –
// install the mock on the prototype instead. Kept per-test so assertions never
// see calls from a previous render.
let scrollSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.restoreAllMocks();
  scrollSpy = vi.fn();
  Element.prototype.scrollIntoView = scrollSpy;
});
```

- [ ] **Step 2: Write the three failing tests**

Append these to the `describe("Protokoll", …)` block in `src/components/demo/Protokoll.test.tsx`:

```tsx
  it("scrolls itself into view and focuses its heading on mount", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    const heading = await screen.findByRole("heading", { name: /Das hat dein Kunde gerade erlebt/i });
    expect(document.activeElement).toBe(heading);
  });

  it("scrolls without animation when the visitor prefers reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    await screen.findByText("Alen");
  });

  it("does not throw in a browser without scrollIntoView", async () => {
    // The real jsdom baseline: the API is absent. Guards the optional call.
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );

    expect(() =>
      render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />),
    ).not.toThrow();
    await screen.findByText("Alen");
  });
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/components/demo/Protokoll.test.tsx`
Expected: the first two FAIL (`scrollSpy` never called – nothing scrolls yet, and `document.activeElement` is `<body>`). The third passes trivially for now; it becomes meaningful once Step 4 lands.

- [ ] **Step 4: Implement the scroll and focus**

In `src/components/demo/Protokoll.tsx`:

Change the React import (line 3) from `useEffect, useState` to include `useRef`:

```tsx
import { useEffect, useRef, useState } from "react";
```

Inside `export function Protokoll(...)`, directly after the `const [state, setState] = useState<State>({ status: "loading" });` line, add the refs and the effect:

```tsx
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The reveal replaces the chat card in place, so the browser keeps the scroll
  // position from the bottom of a long conversation – the summary would render
  // above the viewport and go unseen. Pull the card into view and hand focus to
  // its heading so the phase change is announced rather than merely visual.
  // Both APIs are optional-called: jsdom has no scrollIntoView, and matchMedia
  // is absent in some non-browser renderers.
  // Runs once: the reveal is a terminal phase, it never re-mounts.
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    cardRef.current?.scrollIntoView?.({ behavior: reduced ? "auto" : "smooth", block: "start" });
    // preventScroll: focusing an element scrolls it into view by default, which
    // would cut the smooth scroll short.
    headingRef.current?.focus({ preventScroll: true });
  }, []);
```

Then wire the refs into the JSX. Change these three lines:

```tsx
  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <h2 className="font-serif text-2xl text-tinte">Das hat dein Kunde gerade erlebt.</h2>
```

to exactly this (the comment sits above `return`, not inside the JSX – a `//` comment between JSX tags is rendered as text):

```tsx
  // scroll-mt-24 must sit on the element the browser actually scrolls to.
  // /demo keeps the site chrome and its header is `sticky top-0`, so a
  // scroll-margin on an ancestor would do nothing.
  return (
    <div ref={cardRef} className="card-depth scroll-mt-24 rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl text-tinte focus:outline-none">
        Das hat dein Kunde gerade erlebt.
      </h2>
```

`focus:outline-none` is deliberate: the heading is a script-only focus target (`tabIndex={-1}`, not keyboard-reachable), so a focus ring appearing on it would read as a glitch rather than as guidance.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/demo/Protokoll.test.tsx`
Expected: PASS – all cases, including the seven pre-existing ones.

- [ ] **Step 6: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. If ESLint complains about the empty dependency array, keep the array empty and do **not** add `cardRef`/`headingRef` – refs are stable and the effect is deliberately mount-only.

- [ ] **Step 7: Commit**

```bash
git add src/components/demo/Protokoll.tsx src/components/demo/Protokoll.test.tsx
git commit -m "feat(demo): scroll the reveal into view and focus its heading

The reveal replaced the chat card in place, so after a long conversation
the summary rendered above the viewport and went unseen. Scroll the card
into view on mount (honouring prefers-reduced-motion) and move focus to
the heading so the phase change is announced.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: CTA above the transcript, transcript into a `<details>`

Even scrolled to the top of the card, the CTA sat behind the entire replayed chat. This task fixes the order and collapses the transcript, which the visitor has just lived through, into an expandable block.

**Files:**
- Modify: `src/components/demo/Protokoll.tsx`
- Test: `src/components/demo/Protokoll.test.tsx`

**Interfaces:**
- Consumes: the card/heading refs and `scroll-mt-24` from Task 1 – preserve them.
- Produces: a `<details>` containing the transcript, with the exact summary label `Gespräch nachlesen`. Task 3 replaces the CTA that this task positions above it, and relies on that CTA already being the last element before the `<details>`.

- [ ] **Step 1: Write the failing tests**

Append to the `describe("Protokoll", …)` block:

```tsx
  it("puts the closing CTA above the transcript", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    const cta = screen.getByRole("link", { name: /reden|kontakt/i });
    const verlauf = screen.getByText("Gespräch nachlesen").closest("details");
    expect(verlauf).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING = the transcript comes after the CTA.
    expect(cta.compareDocumentPosition(verlauf!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps the transcript inside a collapsed details block", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    const details = screen.getByText("Hallo").closest("details");
    expect(details).not.toBeNull();
    expect(details!.open).toBe(false);
  });

  it("renders no transcript block at all when the transcript is empty", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={[]} />);
    await screen.findByText("Alen");

    expect(screen.queryByText("Gespräch nachlesen")).toBeNull();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/demo/Protokoll.test.tsx -t "transcript"`
Expected: FAIL – „Unable to find an element with the text: Gespräch nachlesen“ (no `<details>` exists yet), and the ordering test fails because the CTA is currently last.

- [ ] **Step 3: Swap the order and wrap the transcript**

In `src/components/demo/Protokoll.tsx`, the render currently ends with the transcript block followed by the CTA anchor. Replace **both** – everything from `{transcript.length > 0 ? (` through the closing `)}` of the `calLink` line, i.e. the whole tail of the component before `</div>` – with the CTA first, then the `<details>`:

```tsx
      <a href="/kontakt" className="cta-fx mt-8 inline-block rounded-lg bg-tiefes-wasser px-6 py-3 text-papier">
        Genau das f&uuml;r deinen Betrieb &ndash; lass uns reden
      </a>

      {transcript.length > 0 ? (
        <details className="mt-6 rounded-xl border border-faden bg-papier p-4 text-left">
          <summary className="cursor-pointer text-sm font-medium text-tiefes-wasser">
            Gespr&auml;ch nachlesen
          </summary>
          <div className="mt-3 flex flex-col gap-2">
            {transcript.map((m, i) => (
              <div key={i} className="rounded-xl bg-gletscher/30 px-4 py-2">
                <span className="block text-xs uppercase tracking-wide text-stumm">
                  {m.role === "user" ? "Kunde" : "Assistent"}
                </span>
                <span className="whitespace-pre-line leading-relaxed text-tinte">{m.content}</span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
```

**Two things to get right here:**

1. The `&uuml;` / `&ndash;` / `&auml;` entities above are written that way **only so this plan file cannot corrupt them**. In the actual `.tsx`, type the real characters: `für`, `–` (U+2013 en-dash, spaced), `Gespräch`. Do **not** ship HTML entities into the JSX.
2. The old `{calLink ? <p …>15 Minuten, unverbindlich.</p> : null}` line is **deleted** – Task 3 replaces this whole CTA with the booking band, which carries its own „unverbindlich“ wording. The `calLink` prop stays on the component signature; it is used again in Task 3.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/demo/Protokoll.test.tsx`
Expected: PASS, all cases. The three pre-existing tests that call `screen.getByText("Hallo")` still pass – a closed `<details>` keeps its children in the DOM, and RTL's default query does not filter on visibility.

- [ ] **Step 5: Verify the German characters survived the write**

Run:

```bash
perl -CSD -ne 'print "$.: $_" if /\x{2014}|Gespr\?ch|f\?r/' src/components/demo/Protokoll.tsx
grep -n "&uuml;\|&ndash;\|&auml;" src/components/demo/Protokoll.tsx
```

Expected: no output from either. Any hit means an em-dash slipped in or an entity was pasted literally – fix it before committing.

- [ ] **Step 6: Commit**

```bash
git add src/components/demo/Protokoll.tsx src/components/demo/Protokoll.test.tsx
git commit -m "feat(demo): move the reveal CTA above the transcript

The CTA sat behind the entire replayed conversation, so even a visitor
scrolled to the top of the card had to page past it to act. Put the ask
directly under the summary and collapse the transcript into a native
details block, where it stays available as proof without pushing the CTA
off the screen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Replace the `/kontakt` link with an inline booking band

The visitor has just watched a bot book an appointment in seconds. Asking him to switch pages and fill a form is the wrong close. This task drops the existing `SchedulerEmbed` into the reveal so he books in place.

**Files:**
- Modify: `src/components/demo/Protokoll.tsx`
- Test: `src/components/demo/Protokoll.test.tsx`

**Interfaces:**
- Consumes: the CTA position established in Task 2 (directly above the `<details>`).
- Produces: a local component `function AbschlussCta({ calLink }: { calLink: string | undefined })`. With a `calLink` it renders a petrol band containing `<SchedulerEmbed calLink={calLink} prompt="" />` plus a demoted `/kontakt` text link; without one it renders the original `/kontakt` button unchanged.

- [ ] **Step 1: Stub the Cal embed in the test file**

`SchedulerEmbed` imports `@calcom/embed-react` at module scope. Stub it so these tests assert our gating, not Cal internals. Add to the **top** of `src/components/demo/Protokoll.test.tsx`, after the existing imports:

```tsx
// Stub the Cal embed – these tests assert our gating and layout, not Cal
// internals. vi.hoisted is required under Vitest v4: a plain top-level const
// referenced inside the factory throws "Cannot access before initialization".
const calMock = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));
vi.mock("@calcom/embed-react", () => ({
  default: (props: Record<string, unknown>) => {
    calMock.props = props;
    return <div data-testid="cal-embed" />;
  },
}));
```

The file must be `.tsx` (it already is) for that JSX to compile.

- [ ] **Step 2: Update the three pre-existing CTA assertions**

Three tests currently assert the `/kontakt` link is the primary CTA. The link survives as a demoted escape hatch, so the query still matches – but each should now also prove the booking button is there. In each of these three tests:

- `"renders the Terminnotiz and the transcript on a successful summary fetch"`
- `"degrades gracefully to transcript-only when the summary fetch rejects"`
- `"degrades gracefully to transcript-only on a non-200 summary response"`

replace this pair of lines:

```tsx
    const cta = screen.getByRole("link", { name: /reden|kontakt/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
```

with:

```tsx
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /kontaktformular/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
```

Also update the ordering test from Task 2, whose `getByRole("link", { name: /reden|kontakt/i })` should now anchor on the booking button instead:

```tsx
    const cta = screen.getByRole("button", { name: /Termin anzeigen/i });
```

- [ ] **Step 3: Write the failing tests for the new band**

Append to the `describe("Protokoll", …)` block:

```tsx
  it("offers direct booking without mounting the Cal iframe before the click", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    // No third-party request on render – the /demo Datenschutz section says so.
    expect(screen.queryByTestId("cal-embed")).toBeNull();
  });

  it("shows the booking CTA while the summary is still loading", () => {
    // A promise that never settles: no state update, so no act() warning, and
    // the component stays pinned in its loading state for the assertion.
    vi.spyOn(global, "fetch").mockReturnValue(new Promise<Response>(() => {}));
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(screen.getByText(/Einen Moment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
  });

  it("keeps the booking CTA when the summary fetch fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("boom"));
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);
    await screen.findByText(/Termin gebucht/i);

    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
  });

  it("falls back to the Kontakt CTA when no scheduler is configured", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink={undefined} seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    expect(screen.queryByRole("button", { name: /Termin anzeigen/i })).toBeNull();
    const cta = screen.getByRole("link", { name: /reden/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npx vitest run src/components/demo/Protokoll.test.tsx`
Expected: FAIL – „Unable to find an accessible element with the role \"button\" and name /Termin anzeigen/i“ across the new and updated cases.

- [ ] **Step 5: Add the `AbschlussCta` component**

In `src/components/demo/Protokoll.tsx`, add the import next to the existing ones:

```tsx
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
```

and add this component directly **below** `MailVorschau` (before the `type State = …` line):

```tsx
// The close of the demo. He has just watched a booking happen in seconds, so
// the ask is a booking – not a trip to /kontakt and a form. SchedulerEmbed is
// reused untouched: it pins the cal.eu origin (the default cal.com origin 404s
// Vrelo's EU account) and mounts the iframe only on click, which keeps the
// /demo Datenschutz section true. It is styled on-dark, hence the petrol band.
//
// Without a calLink the band would only apologise while pointing twice at the
// same form, so that case keeps the original Kontakt button. This is the live
// path on Vercel Preview, where NEXT_PUBLIC_CAL_LINK is unset.
function AbschlussCta({ calLink }: { calLink: string | undefined }) {
  if (!calLink) {
    return (
      <a href="/kontakt" className="cta-fx mt-8 inline-block rounded-lg bg-tiefes-wasser px-6 py-3 text-papier">
        Genau das f&uuml;r deinen Betrieb &ndash; lass uns reden
      </a>
    );
  }

  return (
    <div className="mt-8">
      <div className="rounded-xl bg-vrelo-petrol px-5 py-8 text-center md:px-6">
        <p className="text-balance font-serif text-xl italic text-papier md:text-2xl">
          Genau das f&uuml;r deinen Betrieb.
        </p>
        <div className="mt-5">
          <SchedulerEmbed calLink={calLink} prompt="" />
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-stumm">
        Lieber schreiben?{" "}
        <a href="/kontakt" className="text-vrelo-petrol underline underline-offset-2">
          Zum Kontaktformular
        </a>
        .
      </p>
    </div>
  );
}
```

Again: `&uuml;` and `&ndash;` are **plan-file armour only**. Type `für` and the real spaced en-dash `–` in the `.tsx`.

- [ ] **Step 6: Use it in place of the anchor**

In the `Protokoll` render, replace the `<a href="/kontakt" …>…</a>` block that Task 2 positioned above the `<details>` with:

```tsx
      <AbschlussCta calLink={calLink} />
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/components/demo/Protokoll.test.tsx`
Expected: PASS – all cases.

- [ ] **Step 8: Verify the German characters survived the write**

Run:

```bash
perl -CSD -ne 'print "$.: $_" if /\x{2014}/' src/components/demo/Protokoll.tsx
grep -n "&uuml;\|&ndash;\|&auml;" src/components/demo/Protokoll.tsx
```

Expected: no output from either.

- [ ] **Step 9: Commit**

```bash
git add src/components/demo/Protokoll.tsx src/components/demo/Protokoll.test.tsx
git commit -m "feat(demo): close the reveal on an inline booking, not a page change

The visitor has just watched a bot turn an enquiry into an appointment;
sending him to /kontakt to fill a form is the wrong ask. Drop the live
SchedulerEmbed into a petrol band in the reveal so he books in place,
and demote /kontakt to an escape hatch below it. Without a configured
scheduler the original Kontakt button renders unchanged.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Full verification and browser check

Everything is unit-tested, but nothing has been seen. This task is the merge gate.

**Files:**
- Modify: none expected. Fix anything the checks surface.

**Interfaces:**
- Consumes: Tasks 1–3 complete and committed.
- Produces: a verified branch ready for `superpowers:finishing-a-development-branch`.

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: PASS. If a `/makler` or Ratgeber test fails, check whether it also fails on `main` – the working tree carries unrelated in-progress changes to those files (see Global Constraints). Pre-existing failures there are not yours to fix; report them rather than repairing them silently.

- [ ] **Step 2: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all clean.

- [ ] **Step 3: Audit German typography across the changed file**

Run:

```bash
perl -CSD -e 'local $/; $_=<>; my $o=()=/\x{201E}/g; my $c=()=/\x{201C}/g; my $bad=()=/\x{201D}/g; my $em=()=/\x{2014}/g; print "open=$o close=$c wrongclose=$bad emdash=$em\n"' src/components/demo/Protokoll.tsx
```

Expected: `open=0 close=0 wrongclose=0 emdash=0` – the new copy uses no quotation marks, and the only dash is the en-dash in the fallback CTA. Any non-zero `wrongclose` or `emdash` must be repaired with codepoint escapes:

```bash
perl -CSD -i -pe 's/\x{2014}/\x{2013}/g' src/components/demo/Protokoll.tsx
```

- [ ] **Step 4: Play the demo in a real browser**

Run `npm start`, open `http://localhost:3000/demo`, and walk the whole flow: describe a business, play the customer, let the bot reach a booking.

Confirm, in order:
1. When the reveal appears, the page **scrolls to it by itself** – the heading „Das hat dein Kunde gerade erlebt.“ is visible and **not** hidden behind the sticky header.
2. „Einen Moment – ich fasse das Gespräch zusammen …“ shows first, then the Terminnotiz fills in **without the card jumping**.
3. The petrol band sits directly under the summary; „Termin anzeigen“ opens the Cal calendar **in place**, and the calendar is usable at the demo's `max-w-2xl` container width (this is narrower than `/kontakt`, so check it rather than assuming).
4. „Gespräch nachlesen“ opens and closes and contains the full conversation.
5. Tab order after the reveal is sane, and the heading does not show a stray focus ring.

Also check at 390 px width (mobile): the band must not overflow and the Cal iframe must not force a horizontal scrollbar.

- [ ] **Step 5: Report and hand off**

Report what you saw at each of the five checkpoints – including anything that looked off. Do not claim completion without having run steps 1–4 and seen the output.

Then use `superpowers:finishing-a-development-branch` to decide how `feat/demo-reveal-buchung` gets integrated.

---

## After the merge

Two documentation updates, owned by whoever merges:

- **`Website/CLAUDE.md`** – the `/demo` bullet under *Design system* currently ends „ends on a reveal + `/kontakt` CTA“. That becomes: reveal closes on an inline `SchedulerEmbed` booking band, transcript in a `<details>`, card scrolls itself into view; `/kontakt` demoted, and it is the whole CTA when `NEXT_PUBLIC_CAL_LINK` is unset. Add a changelog line.
- **HQ `CLAUDE.md` §8 Vault-sync rule** – this is a conversion change to a live outreach asset, so it qualifies for a light Vault sync.
