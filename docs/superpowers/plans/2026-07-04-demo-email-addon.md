# /demo E-Mail Add-on Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The `/demo` booking bot captures a (simulated) client e-mail alongside the name; the reveal shows it in the Terminnotiz and renders a simulated „Bestätigungsmail" preview — nothing is actually sent or stored.

**Architecture:** Four small, isolated changes in the existing demo code. (1) The `Terminnotiz` type + `parseNotes` gain an `email` field. (2) The seeded system prompt's closing step asks for name **and** e-mail. (3) `Protokoll.tsx` renders an E-Mail row + a client-side, deterministic mail-preview card. No route/API change — `/demo/summary` passes `parseNotes` through untouched, so the new field rides along. It is a simulation: no sending, no validation, no persistence.

**Tech Stack:** Next.js 16, TypeScript, Vitest + React Testing Library (jsdom).

**Branch:** `feat/demo-email-addon` (already created; design doc committed there).

**Design doc:** `docs/superpowers/specs/2026-07-04-demo-email-addon-design.md`

---

## File Structure

- `src/lib/demo/summary.ts` — **modify.** Add `email` to `Terminnotiz`, `EMPTY_NOTIZ`, the JSON schema in `buildSummarySystem`, and `parseNotes`.
- `src/lib/demo/summary.test.ts` — **modify.** Update the existing `toEqual` shape; add email parse/cap/empty tests.
- `src/lib/demo/prompt.ts` — **modify.** Extend closing step 6 to ask for name + e-mail.
- `src/lib/demo/prompt.test.ts` — **modify.** Assert the prompt mentions the e-mail ask.
- `src/components/demo/Protokoll.tsx` — **modify.** E-Mail row in the `<dl>`; `isEmptyNotiz` includes email; new `MailVorschau` preview block (same file, small local component).
- `src/components/demo/Protokoll.test.tsx` — **modify.** Email row renders; preview appears only with an e-mail.

---

## Task 1: Add `email` to the Terminnotiz shape and parser

**Files:**
- Modify: `src/lib/demo/summary.ts`
- Test: `src/lib/demo/summary.test.ts`

- [ ] **Step 1: Update the existing parse test to the new shape, then add email tests**

In `src/lib/demo/summary.test.ts`, the first `parseNotes` test currently asserts an object without `email`; adding the field changes the returned shape, so update it and add coverage.

Replace the first test (lines 9–12) with:

```ts
  it("extracts fields from a clean JSON string", () => {
    const n = parseNotes('{"name":"Alen","anliegen":"Baufi","termin":"Mo 10:00","offenePunkte":["Unterlagen"],"email":"a@b.de"}');
    expect(n).toEqual({ name: "Alen", anliegen: "Baufi", termin: "Mo 10:00", offenePunkte: ["Unterlagen"], email: "a@b.de" });
  });

  it("defaults email to empty when absent", () => {
    const n = parseNotes('{"name":"Alen","anliegen":"","termin":"","offenePunkte":[]}');
    expect(n.email).toBe("");
  });

  it("trims and caps email to 160 chars", () => {
    const long = "x".repeat(400) + "@b.de";
    const n = parseNotes(JSON.stringify({ name: "", anliegen: "", termin: "", offenePunkte: [], email: "  " + long + "  " }));
    expect(n.email.length).toBe(160);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Website && npx vitest run src/lib/demo/summary.test.ts`
Expected: FAIL — the `toEqual` mismatch (`email` missing from the returned object) and `n.email` undefined.

- [ ] **Step 3: Add the `email` field across the four spots in `summary.ts`**

In `src/lib/demo/summary.ts`:

Update the type + empty constant (lines 4–5):

```ts
export type Terminnotiz = { name: string; anliegen: string; termin: string; offenePunkte: string[]; email: string };
export const EMPTY_NOTIZ: Terminnotiz = { name: "", anliegen: "", termin: "", offenePunkte: [], email: "" };
```

In `buildSummarySystem`, extend the JSON schema line and its field key (lines 12–14) so the model emits `email`:

```ts
    `{"name":"","anliegen":"","termin":"","offenePunkte":[],"email":""}`,
    `name = Name des Kunden; anliegen = worum es geht; termin = der bestätigte Termin;`,
    `email = E-Mail-Adresse des Kunden für die Terminbestätigung;`,
```

In `parseNotes`, add `email` to the returned object (inside the `return { … }`, after `offenePunkte`):

```ts
      email: String(o?.email ?? "").trim().slice(0, 160),
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Website && npx vitest run src/lib/demo/summary.test.ts`
Expected: PASS (all `parseNotes`, `transcriptToText`, `buildSummarySystem` tests green).

- [ ] **Step 5: Verify German bytes**

The added prompt line contains „bestätigte"/„E-Mail". Confirm no mojibake:
Run: `cd Website && grep -n "E-Mail-Adresse des Kunden" src/lib/demo/summary.ts`
Expected: one line, „E-Mail" intact.

- [ ] **Step 6: Commit**

```bash
cd Website
git add src/lib/demo/summary.ts src/lib/demo/summary.test.ts
git commit -m "feat(demo): add email field to Terminnotiz shape and parser

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Ask for the e-mail in the closing step of the bot prompt

**Files:**
- Modify: `src/lib/demo/prompt.ts:32`
- Test: `src/lib/demo/prompt.test.ts`

- [ ] **Step 1: Add a failing assertion for the e-mail ask**

In `src/lib/demo/prompt.test.ts`, inside the existing test „instructs the bot to ask the client name, reconfirm, ask for anything else, and end with [ENDE]" (lines 24–31), add one assertion before the closing `});`:

```ts
    expect(p).toContain("E-Mail");         // ask for the client's email at the close
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd Website && npx vitest run src/lib/demo/prompt.test.ts`
Expected: FAIL — the current prompt has no „E-Mail".

- [ ] **Step 3: Extend step 6 to ask for name + e-mail**

In `src/lib/demo/prompt.ts`, replace line 32 (the step-6 string):

```ts
    `6. Erst wenn der Termin steht, frage zum Schluss nach dem Namen und der E-Mail-Adresse für den Termin (z. B. „Auf welchen Namen darf ich den Termin notieren – und an welche E-Mail-Adresse darf ich die Bestätigung schicken?").`,
```

Also extend step 7 (line 33) so the `[ENDE]` gate waits for the e-mail too — replace the „Sobald …" clause:

```ts
    `7. Verabschiede dich freundlich mit dem Namen. Sobald der Termin bestätigt, die Rückfrage beantwortet und Name samt E-Mail-Adresse genannt sind, beende deine letzte Nachricht mit dem Wort [ENDE].`,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd Website && npx vitest run src/lib/demo/prompt.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify German bytes**

The new copy uses German quotes „…" (U+201E open / U+201C close) and a spaced en-dash „ – " (U+2013). Verify they were not downgraded to ASCII by the editor:
Run: `cd Website && grep -nP "notieren \x{2013} und an welche" src/lib/demo/prompt.ts`
Expected: one match (the spaced en-dash is present).
If it fails, repair with: `perl -CSD -i -pe 's/\x{201E}([^\x{201E}"]*)"/\x{201E}$1\x{201C}/g; s/ - / \x{2013} /g' src/lib/demo/prompt.ts` and re-verify, then re-run Step 4.

- [ ] **Step 6: Commit**

```bash
cd Website
git add src/lib/demo/prompt.ts src/lib/demo/prompt.test.ts
git commit -m "feat(demo): ask for client email at the close of the booking flow

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Show the e-mail and a simulated confirmation-mail preview in the reveal

**Files:**
- Modify: `src/components/demo/Protokoll.tsx`
- Test: `src/components/demo/Protokoll.test.tsx`

- [ ] **Step 1: Write the failing tests**

In `src/components/demo/Protokoll.test.tsx`, add two tests inside the `describe("Protokoll", …)` block (after the existing first test):

```ts
  it("renders the email row and a simulated confirmation-mail preview when an email is present", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "Baufinanzierung", termin: "Mo 6.7. 10:00", offenePunkte: [], email: "alen@example.de" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("alen@example.de")).toBeTruthy();
    // preview card present
    expect(screen.getByText(/Bestätigungsmail/i)).toBeTruthy();
    expect(screen.getByText(/automatisch versendet/i)).toBeTruthy();
  });

  it("hides the mail preview when no email was captured", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "Baufinanzierung", termin: "Mo 6.7. 10:00", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Alen")).toBeTruthy();
    expect(screen.queryByText(/Bestätigungsmail/i)).toBeNull();
  });
```

Also update the existing first test's mock body (line 22–23) and the empty-summary test (line 57) to include the new field so their `Terminnotiz` shape is complete — add `, email: "" ` to each `jsonResponse({…})` object. (Optional but keeps the mocks honest; the component tolerates its absence.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Website && npx vitest run src/components/demo/Protokoll.test.tsx`
Expected: FAIL — no „alen@example.de" row, no „Bestätigungsmail" text.

- [ ] **Step 3: Implement the email row, the preview block, and update `isEmptyNotiz`**

In `src/components/demo/Protokoll.tsx`:

Update `isEmptyNotiz` (lines 8–10) so an email-only note still shows:

```ts
function isEmptyNotiz(n: Terminnotiz): boolean {
  return !n.name && !n.anliegen && !n.termin && n.offenePunkte.length === 0 && !n.email;
}
```

Add a small deterministic preview component above the `Protokoll` export (after `isEmptyNotiz`):

```tsx
function MailVorschau({ notiz }: { notiz: Terminnotiz }) {
  const anrede = notiz.name ? `Guten Tag ${notiz.name},` : "Guten Tag,";
  const terminSatz = notiz.termin
    ? `Ihr Termin am ${notiz.termin} ist bestätigt.`
    : "Ihr Termin ist bestätigt.";
  return (
    <div className="mt-4 rounded-xl border border-faden bg-papier p-5 text-left">
      <p className="text-xs uppercase tracking-wide text-stumm">Bestätigungsmail (Vorschau)</p>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-stumm">An:</dt>
          <dd className="text-tinte">{notiz.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-stumm">Betreff:</dt>
          <dd className="text-tinte">Ihr Termin – Bestätigung</dd>
        </div>
      </dl>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-tinte">
        {`${anrede}\n${terminSatz} Wir freuen uns auf das Gespräch.`}
      </p>
      <p className="mt-3 text-xs text-stumm">In der Live-Version wird diese Bestätigung automatisch versendet.</p>
    </div>
  );
}
```

Add the E-Mail row inside the Terminnotiz `<dl>` — place it after the `termin` block and before the `offenePunkte` block (around line 74):

```tsx
            {notiz.email ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-stumm">E-Mail</dt>
                <dd className="text-tinte">{notiz.email}</dd>
              </div>
            ) : null}
```

Render the preview right after the Terminnotiz card. The Terminnotiz `<div className="mt-6 rounded-xl …">…</div>` closes just before the transcript block; insert immediately after that closing `</div>` (still inside the `notiz ? ( … ) :` branch, so wrap the two in a fragment):

Change the opening of the truthy branch from:

```tsx
      ) : notiz ? (
        <div className="mt-6 rounded-xl border border-faden bg-papier p-5 text-left">
```

to:

```tsx
      ) : notiz ? (
        <>
        <div className="mt-6 rounded-xl border border-faden bg-papier p-5 text-left">
```

and, at the end of that same branch, after the Terminnotiz card's closing `</div>`, add the preview and close the fragment:

```tsx
        </div>
        {notiz.email ? <MailVorschau notiz={notiz} /> : null}
        </>
      ) : (
```

(The `) : (` here is the start of the existing empty-notiz fallback — do not duplicate it; only the `<>…</>` wrapper and the `MailVorschau` line are new.)

- [ ] **Step 4: Run the component tests to verify they pass**

Run: `cd Website && npx vitest run src/components/demo/Protokoll.test.tsx`
Expected: PASS (all five tests green).

- [ ] **Step 5: Verify German bytes**

The preview uses the spaced en-dash in „Ihr Termin – Bestätigung":
Run: `cd Website && grep -nP "Termin \x{2013} Best" src/components/demo/Protokoll.tsx`
Expected: one match. If it fails, replace the ` - ` with ` – ` (U+2013) and re-run Step 4.

- [ ] **Step 6: Commit**

```bash
cd Website
git add src/components/demo/Protokoll.tsx src/components/demo/Protokoll.test.tsx
git commit -m "feat(demo): show email row + simulated confirmation-mail preview in the reveal

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `cd Website && npm test`
Expected: PASS — all suites green (demo suites + the rest).

- [ ] **Step 2: Type-check**

Run: `cd Website && npx tsc --noEmit`
Expected: no errors (the widened `Terminnotiz` type is used consistently).

- [ ] **Step 3: Lint**

Run: `cd Website && npm run lint`
Expected: no new errors/warnings.

- [ ] **Step 4: Production build**

Run: `cd Website && npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manual smoke check (optional, needs `ANTHROPIC_API_KEY` in `.env.local`)**

Run: `cd Website && npm start`, open `/demo`, run one booking to the close providing a name and an e-mail, and confirm the reveal shows the E-Mail row + the „Bestätigungsmail (Vorschau)" card with the „automatisch versendet" footnote. (Without the key the demo shows the „bald verfügbar" card — that path is unchanged.)

---

## Self-Review notes

- **Spec coverage:** Task 1 ⇒ summary shape/parser; Task 2 ⇒ prompt ask + `[ENDE]` gate; Task 3 ⇒ E-Mail row + simulated preview + graceful hide; out-of-scope items (no send/validation/storage, no route change) are respected — no task touches `/demo/summary/route.ts` or adds validation.
- **Type consistency:** `Terminnotiz.email: string`, `EMPTY_NOTIZ.email: ""`, `parseNotes` `.slice(0, 160)`, and `MailVorschau({ notiz }: { notiz: Terminnotiz })` all agree.
- **Existing-test breakage handled:** Task 1 Step 1 updates the first `parseNotes` `toEqual`; Task 3 Step 1 tops up the component mocks — both are the shape changes that would otherwise fail silently.
- **Brand:** German copy, generic masculine, calm voice; byte-verification steps guard the „…"/en-dash gotcha.
