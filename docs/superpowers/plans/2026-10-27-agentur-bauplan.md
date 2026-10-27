# Agentur-Bauplan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An unlisted page `/bauplan/<secret>` on vrelo-ki.de that shows the neutral agency blueprint and, on request, e-mails a branded PDF guide automatically.

**Architecture:** One data module holds all page copy (so the copy guards sweep it and tests can assert on it); a dynamic route renders it and 404s on any slug other than `BAUPLAN_CODE`. The e-mail flow copies the `/prozess-check` pattern: a pure `evaluate*` function in `src/lib`, a thin server action, Resend. The PDF is rendered offline with the `Clients/_kit/brand-pdf` renderer from an HTML template in `content/bauplan/` and committed under `public/bauplan/`.

**Tech Stack:** Next.js 16 App Router, React 19 (`useActionState`), Tailwind v4 tokens, Vitest + Testing Library (jsdom), Resend SDK 6.12, puppeteer via the kit renderer (local only).

**Spec:** `docs/superpowers/specs/2026-10-27-agentur-bauplan-design.md`

## Global Constraints

- German client copy, „du“, generic masculine; *Vrelo*/*Merak* via `<BrandWord>` (Fraunces italic).
- **No Gedankenstrich** (no U+2013 en-dash, no U+2014 em-dash) in any German copy; ranges with „bis“; clauses joined with comma, period or colon.
- **No comma before „und“** (`src/lib/kommaUnd.test.ts` sweeps every non-test `.ts/.tsx` under `src/`).
- German quotes „…“ (U+201E/U+201C), never ASCII `"` in copy.
- No Vrelo price, no package name, no competitor name, no tool names (ClickUp/HubSpot/sevDesk) on the page or in the PDF.
- Velp only by shape: „eine Videoagentur in Regensburg“; never a Velp phase name, template or number.
- No call CTA on the page (no „Erstgespräch“, „Prozess-Check“, „buchen“, „Termin vereinbaren“); the only form is the PDF request.
- Page is `robots: { index: false, follow: false }`, absent from `sitemap.ts`, linked from nowhere.
- All copy runs through the `stop-slop` skill before the commit that ships it (Tasks 2 and 7).
- The Edit/Write tools can downgrade „…“ and silently decode `\uXXXX`; verify bytes after writing copy (`grep -c` for `—` and ` – ` must be 0).
- Commits end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. A visitor opens `/bauplan/<wrong-or-stale-code>` → plain 404, no hint that a code exists (Task 4 test).
2. `BAUPLAN_CODE` unset in an environment → the route must 404 for every slug, never render (Task 4 test).
3. A reader submits twice or a bot posts the form → honeypot and minimum-fill guards drop/reject exactly like Prozess-Check; a second legitimate request simply sends again (Task 5 tests).
4. Resend returns an error on the reader mail → the user sees the generic error, no internal mail is sent, nothing throws (Task 5 test).
5. The page is visited on a phone (390 px): the five station cards stack, no horizontal scroll, the form fits (Task 8 manual check).

---

### Task 1: Secret code helper and env plumbing

**Files:**
- Create: `src/lib/bauplan.ts`
- Test: `src/lib/bauplan.test.ts`
- Modify: `.env.example` (append `BAUPLAN_CODE=`)

**Interfaces:**
- Produces: `export function bauplanCode(): string | undefined` (reads `process.env.BAUPLAN_CODE`, trimmed, `undefined` when empty) · `export function isBauplanCode(slug: string): boolean` (true only when a code is configured and `slug === code`) · `export const BAUPLAN_BASE = "/bauplan"`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/bauplan.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { bauplanCode, isBauplanCode } from "./bauplan";

const orig = process.env.BAUPLAN_CODE;
afterEach(() => { process.env.BAUPLAN_CODE = orig; });

describe("bauplan code", () => {
  it("is undefined when unset or blank", () => {
    process.env.BAUPLAN_CODE = "  ";
    expect(bauplanCode()).toBeUndefined();
    expect(isBauplanCode("anything")).toBe(false);
  });
  it("matches only the exact configured slug", () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    expect(isBauplanCode("agentur-7k3m")).toBe(true);
    expect(isBauplanCode("agentur-7k3M")).toBe(false);
    expect(isBauplanCode("")).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/bauplan.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/lib/bauplan.ts`** with the three exports above. Read the env at call time (not module load) so tests and Vercel both work.

- [ ] **Step 4: Append to `.env.example`**

```
# Unlisted blueprint page for agencies: /bauplan/<BAUPLAN_CODE>. Any other slug
# is a 404. Change the value to retire a leaked link. Server-only.
BAUPLAN_CODE=
```

- [ ] **Step 5: Run tests, then commit**

Run: `npx vitest run src/lib/bauplan.test.ts`
Expected: PASS (2 tests).

```bash
git add src/lib/bauplan.ts src/lib/bauplan.test.ts .env.example
git commit -m "feat(bauplan): secret code helper + env"
```

---

### Task 2: Page copy module (guarded)

**Files:**
- Create: `src/lib/bauplanPage.ts`
- Test: `src/lib/bauplanPage.test.ts`

**Interfaces:**
- Produces:
```ts
export type Station = { name: string; beispiele: string; heute: string; imBauplan: string; bleibtBeiDir: string };
export const bauplanPage: {
  kicker: string; title: string; lead: string; herkunft: string;
  fundament: { heading: string; body: string };
  stationen: { heading: string; items: Station[]; tools: string };
  merak: { heading: string; punkte: string[] };
  pdf: { heading: string; text: string; label: string; button: string; hinweis: string; success: string };
};
```
- Spec §4 is the copy source. Wording below is the draft from the spec; the implementer runs it through `stop-slop` before Step 5 and keeps the structure.

- [ ] **Step 1: Write the failing tests** (pattern: `src/lib/claudeGehirnPage.test.ts`)

```ts
// src/lib/bauplanPage.test.ts
import { describe, it, expect } from "vitest";
import { bauplanPage } from "./bauplanPage";
import { findCopyIssues } from "./ratgeberCopy";

function strings(v: unknown, out: string[] = []): string[] { /* same helper as claudeGehirnPage.test.ts */ }
const all = strings(bauplanPage);

describe("/bauplan copy", () => {
  it("has five stations in the spec order", () => {
    expect(bauplanPage.stationen.items.map((s) => s.name)).toEqual(["Angebot", "Onboarding", "Skripte", "Texte", "Projektdoku"]);
  });
  it("ends on six Merak points", () => {
    expect(bauplanPage.merak.punkte).toHaveLength(6);
  });
  it("follows the house typography in every string", () => {
    expect(all.flatMap((s) => findCopyIssues(s).map((i) => `${i.kind}: ${s}`))).toEqual([]);
  });
  it("names no price, tool or client", () => {
    expect(all.filter((s) => /€|\bEUR\b|ClickUp|HubSpot|sevDesk|Velp|Alen/i.test(s))).toEqual([]);
  });
  it("asks for nothing but the PDF", () => {
    expect(all.filter((s) => /Erstgespräch|Prozess-Check|buchen|Termin vereinbaren|Gespräch/i.test(s))).toEqual([]);
  });
  it("names the origin agency only by shape", () => {
    expect(bauplanPage.herkunft).toMatch(/Videoagentur in Regensburg/);
    expect(bauplanPage.herkunft).toMatch(/konzipiert/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/bauplanPage.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `src/lib/bauplanPage.ts`** with the exact strings from spec §4 (kicker „Bauplan für Agenturen“; H1 „Deine Agentur lebt von der Beziehung zu deinen Kunden. Dieser Bauplan nimmt dir das Drumherum ab.“; lead; `herkunft` = „Entstanden ist dieser Bauplan bei meiner Arbeit mit einer Videoagentur in Regensburg. Ich habe ihn so konzipiert, dass er für jede Agentur passt.“; the five-row station table verbatim; `tools` = „Läuft in den Programmen, die du schon hast.“; the six Merak points verbatim; `pdf` strings: heading „Den Bauplan als PDF“, text „Mit den Prinzipien, wie du ihn in deiner Agentur umsetzt, und Platz für deine eigenen Phasen. Ich schicke ihn dir per Mail.“, label „Deine E-Mail-Adresse“, button „PDF zuschicken“, hinweis „Du bekommst nur diese eine Mail.“, success „Ist unterwegs. Schau auch im Spam-Ordner nach.“).

- [ ] **Step 4: Run the `stop-slop` skill over the module's German strings**; apply edits; re-check bytes: `grep -c "—" src/lib/bauplanPage.ts` → 0 and `grep -c " – " src/lib/bauplanPage.ts` → 0.

- [ ] **Step 5: Run tests, then commit**

Run: `npx vitest run src/lib/bauplanPage.test.ts src/lib/kommaUnd.test.ts`
Expected: PASS.

```bash
git add src/lib/bauplanPage.ts src/lib/bauplanPage.test.ts
git commit -m "feat(bauplan): page copy module with copy guards"
```

---

### Task 3: Focus chrome for the dynamic route

**Files:**
- Modify: `src/lib/nav.ts` (add prefix-matched focus route) and `src/lib/nav.test.ts`
- Modify: `src/components/ChromeGate.tsx` (look up chrome config by prefix) and `src/components/ChromeGate.test.tsx`

**Interfaces:**
- Consumes: `BAUPLAN_BASE` from Task 1.
- Produces: `isFocusRoute("/bauplan/anything") === true`; `focusChromeFor(pathname: string): { cta?: FocusCta }` exported from `nav.ts` (exact-key lookup, else prefix lookup for `BAUPLAN_BASE`, else `{}`). ChromeGate uses `focusChromeFor` instead of `focusChrome[pathname!]`.

- [ ] **Step 1: Write the failing tests**

```ts
// append to src/lib/nav.test.ts
it("treats every /bauplan/<code> path as a logo-only focus route", () => {
  expect(isFocusRoute("/bauplan/agentur-7k3m")).toBe(true);
  expect(isFocusRoute("/bauplan")).toBe(false);
  expect(focusChromeFor("/bauplan/agentur-7k3m")).toEqual({});
  expect(focusChromeFor("/makler").cta?.href).toBe("#termin");
});
```

```tsx
// append to src/components/ChromeGate.test.tsx
it("renders the focus chrome (no CTA, no newsletter) on a /bauplan page", () => {
  pathname.current = "/bauplan/agentur-7k3m";
  render(<ChromeGate slot="footer"><p>Normaler Footer</p></ChromeGate>);
  expect(screen.queryByText("Normaler Footer")).toBeNull();
  expect(screen.getByRole("link", { name: "Datenschutz" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/nav.test.ts src/components/ChromeGate.test.tsx`
Expected: FAIL (`focusChromeFor` undefined; `/bauplan/...` not a focus route).

- [ ] **Step 3: Implement** in `nav.ts`: `export const focusPrefixes: string[] = [BAUPLAN_BASE + "/"]`; `isFocusRoute` returns true for exact `focusRoutes` **or** any `focusPrefixes` prefix; add `focusChromeFor`. Update the comment block (why `/bauplan` is a focus route: the gift page must carry no ask, and the normal footer carries the newsletter form). In `ChromeGate.tsx` replace the map lookup with `focusChromeFor(pathname!)`.

- [ ] **Step 4: Run the full nav/chrome tests**

Run: `npx vitest run src/lib/nav.test.ts src/components/ChromeGate.test.tsx src/components/Header.test.tsx src/components/Footer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav.ts src/lib/nav.test.ts src/components/ChromeGate.tsx src/components/ChromeGate.test.tsx
git commit -m "feat(bauplan): prefix-matched focus chrome for /bauplan/<code>"
```

---

### Task 4: The page route (noindex, 404 on wrong code, not in sitemap)

**Files:**
- Create: `src/app/bauplan/[code]/page.tsx`
- Create: `src/components/bauplan/BauplanPage.tsx` (pure presentational, props = `bauplanPage` data; the form component arrives in Task 6, so render a placeholder slot prop `form?: ReactNode` for now)
- Test: `src/app/bauplan/[code]/page.test.tsx`, `src/components/bauplan/BauplanPage.test.tsx`
- Modify: `src/app/sitemap.test.ts` (assert absence)

**Interfaces:**
- Consumes: `isBauplanCode` (Task 1), `bauplanPage` (Task 2).
- Produces: `export const metadata: Metadata` with `robots: { index: false, follow: false }`, `title: "Bauplan für Agenturen"`; `export default async function Page({ params }: { params: Promise<{ code: string }> })` calling `notFound()` unless `isBauplanCode(code)`; `export const dynamic = "force-dynamic"` (the env is read per request so rotation needs no rebuild). `BauplanPage({ data, form })` renders sections 1 to 5 of spec §4 in order with ids `fundament`, `stationen`, `merak`, `pdf`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/app/bauplan/[code]/page.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { metadata } from "./page";
const notFound = vi.hoisted(() => vi.fn(() => { throw new Error("NOT_FOUND"); }));
vi.mock("next/navigation", () => ({ notFound }));
import Page from "./page";

const orig = process.env.BAUPLAN_CODE;
afterEach(() => { process.env.BAUPLAN_CODE = orig; notFound.mockClear(); });

describe("/bauplan/[code]", () => {
  it("is noindex", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
  it("404s on a wrong code", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    await expect(Page({ params: Promise.resolve({ code: "other" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("404s on every code when none is configured", async () => {
    delete process.env.BAUPLAN_CODE;
    await expect(Page({ params: Promise.resolve({ code: "agentur-7k3m" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("renders on the right code", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    const el = await Page({ params: Promise.resolve({ code: "agentur-7k3m" }) });
    expect(el).toBeTruthy();
    expect(notFound).not.toHaveBeenCalled();
  });
});
```

```tsx
// src/components/bauplan/BauplanPage.test.tsx
import { render, screen } from "@testing-library/react";
import { BauplanPage } from "./BauplanPage";
import { bauplanPage } from "@/lib/bauplanPage";

it("renders the headline, the five stations and the six Merak points in order", () => {
  render(<BauplanPage data={bauplanPage} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Beziehung zu deinen Kunden/);
  const names = screen.getAllByTestId("station-name").map((n) => n.textContent);
  expect(names).toEqual(["Angebot", "Onboarding", "Skripte", "Texte", "Projektdoku"]);
  expect(screen.getAllByTestId("merak-punkt")).toHaveLength(6);
  expect(screen.queryByRole("link", { name: /Prozess-Check|Erstgespräch/ })).toBeNull();
});
```

```ts
// append to src/app/sitemap.test.ts
it("never lists the unlisted /bauplan page", () => {
  expect(sitemap().map((e) => e.url).some((u) => u.includes("/bauplan"))).toBe(false);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/app/bauplan src/components/bauplan src/app/sitemap.test.ts`
Expected: FAIL (modules missing); the sitemap assertion passes already (keep it as a guard).

- [ ] **Step 3: Implement `BauplanPage.tsx`**: Papier background section stack, max-w-2xl text column; section 2 and 4 on `bg-sonnenlicht` cards; the station strip as stacked cards on mobile and a 5-column grid from `md:`; each card shows `name` (`data-testid="station-name"`), `beispiele` (stumm), then three labelled lines „Heute“, „Im Bauplan“, „Bleibt bei dir“; Merak points as `<li data-testid="merak-punkt">`; `<BrandWord>Merak</BrandWord>` in the Merak heading; the `form` prop rendered inside the bordered `#pdf` card, with `data.pdf.heading` and `data.pdf.text` above it.

- [ ] **Step 4: Implement `page.tsx`** as specified in Interfaces; render `<BauplanPage data={bauplanPage} />` (no form yet).

- [ ] **Step 5: Run tests, then commit**

Run: `npx vitest run src/app/bauplan src/components/bauplan src/app/sitemap.test.ts src/lib/kommaUnd.test.ts`
Expected: PASS.

```bash
git add src/app/bauplan src/components/bauplan src/app/sitemap.test.ts
git commit -m "feat(bauplan): unlisted page route with focus chrome"
```

---

### Task 5: E-mail decision logic (pure) and server action

**Files:**
- Create: `src/lib/bauplanEmail.ts`, `src/lib/bauplanEmail.test.ts`
- Create: `src/app/bauplan/actions.ts`, `src/app/bauplan/actions.test.ts`

**Interfaces:**
- Consumes: `EMAIL_RE`, `isHoneypotTripped`, `isTooFast`, `contactFrom`, `contactTo`, `resendKey`, `isContactConfigured` from `src/lib/contact.ts`; `normalizeSource`, `sourceLabel` from `src/lib/source.ts`; `siteUrl` from `src/lib/site.ts`.
- Produces (`bauplanEmail.ts`):
```ts
export const BAUPLAN_PDF_PATH = "/bauplan/agentur-bauplan.pdf"; // final hashed name set in Task 7
export type BauplanFields = { email: string; honeypot: string; renderedAt: number; source?: string };
export type BauplanDecision =
  | { action: "drop" } | { action: "reject"; message: string } | { action: "invalid"; error: string }
  | { action: "send"; readerEmail: { to: string; subject: string; html: string; text: string; pdfUrl: string };
      internalEmail: { subject: string; text: string; html: string; replyTo: string } };
export function evaluateBauplanRequest(f: BauplanFields, now: number, pdfUrl: string): BauplanDecision;
```
  Reader subject: „Dein Bauplan für Agenturen“. Internal subject: `Bauplan angefordert: ${email}`; internal text includes `Quelle: ${sourceLabel(source)}` and an ISO timestamp. Reader body (du, 3 to 5 sentences, Ajdin's voice, no ask), with the PDF link.
- Produces (`actions.ts`): `export type BauplanEmailState = { status: "idle" } | { status: "ok" } | { status: "error"; message: string } | { status: "invalid"; error: string }` and `export async function submitBauplanRequest(_prev: BauplanEmailState, formData: FormData): Promise<BauplanEmailState>`; form fields `email`, `website` (honeypot), `renderedAt`, `src`. On `send`: reader mail with `attachments: [{ filename: "Vrelo-Bauplan-Agenturen.pdf", path: pdfUrl }]` (Resend fetches the public URL), then the internal mail; a Resend error on the reader mail returns `{ status: "error", message: GENERIC_ERROR }` and skips the internal mail; an internal-mail error is swallowed (the reader already has the PDF).

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/bauplanEmail.test.ts
import { describe, it, expect } from "vitest";
import { evaluateBauplanRequest } from "./bauplanEmail";
import { findCopyIssues } from "./ratgeberCopy";
const base = { email: "a@b.de", honeypot: "", renderedAt: 0 };
const PDF = "https://vrelo-ki.de/bauplan/x.pdf";

describe("evaluateBauplanRequest", () => {
  it("drops honeypot", () => { expect(evaluateBauplanRequest({ ...base, honeypot: "x" }, 10_000, PDF).action).toBe("drop"); });
  it("rejects too fast", () => { expect(evaluateBauplanRequest({ ...base, renderedAt: 9_000 }, 10_000, PDF).action).toBe("reject"); });
  it("invalidates a bad address", () => { expect(evaluateBauplanRequest({ ...base, email: "nope" }, 10_000, PDF).action).toBe("invalid"); });
  it("builds both mails with the PDF link and the source", () => {
    const d = evaluateBauplanRequest({ ...base, source: "ag01" }, 10_000, PDF);
    if (d.action !== "send") throw new Error(d.action);
    expect(d.readerEmail.to).toBe("a@b.de");
    expect(d.readerEmail.subject).toBe("Dein Bauplan für Agenturen");
    expect(d.readerEmail.text).toContain(PDF);
    expect(d.readerEmail.pdfUrl).toBe(PDF);
    expect(d.internalEmail.subject).toBe("Bauplan angefordert: a@b.de");
    expect(d.internalEmail.replyTo).toBe("a@b.de");
    expect(d.internalEmail.text).toContain("Quelle: ag01");
  });
  it("keeps the reader mail free of asks and dashes", () => {
    const d = evaluateBauplanRequest(base, 10_000, PDF);
    if (d.action !== "send") throw new Error(d.action);
    expect(findCopyIssues(d.readerEmail.text)).toEqual([]);
    expect(d.readerEmail.text).not.toMatch(/Erstgespräch|Prozess-Check|buchen/i);
  });
});
```

```ts
// src/app/bauplan/actions.test.ts  (pattern: prozess-check/actions.test.ts)
import { describe, it, expect, vi, beforeEach } from "vitest";
const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
import { submitBauplanRequest, type BauplanEmailState } from "./actions";
function fd(e: Record<string, string>) { const f = new FormData(); for (const [k, v] of Object.entries(e)) f.set(k, v); return f; }
const idle: BauplanEmailState = { status: "idle" };

beforeEach(() => {
  send.mockReset();
  process.env.RESEND_API_KEY = "k"; process.env.CONTACT_FROM = "Vrelo <a@vrelo-ki.de>"; process.env.CONTACT_TO = "me@vrelo-ki.de";
});

describe("submitBauplanRequest", () => {
  it("drops a honeypot hit as a silent ok", async () => {
    expect((await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", website: "bot" }))).status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });
  it("invalidates a bad email", async () => {
    expect((await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "nope" }))).status).toBe("invalid");
  });
  it("sends reader mail with the PDF attached, then the internal mail", async () => {
    send.mockResolvedValue({ error: null });
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", src: "ag01" }));
    expect(s.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].attachments[0].filename).toBe("Vrelo-Bauplan-Agenturen.pdf");
    expect(send.mock.calls[1][0].subject).toBe("Bauplan angefordert: a@b.de");
  });
  it("returns an error and skips the internal mail when the reader mail fails", async () => {
    send.mockResolvedValueOnce({ error: { message: "boom" } });
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de" }));
    expect(s.status).toBe("error");
    expect(send).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/bauplanEmail.test.ts src/app/bauplan/actions.test.ts`
Expected: FAIL, modules missing.

- [ ] **Step 3: Implement `bauplanEmail.ts`** (reuse `BODY_STYLE`-style inline HTML as in `prozessCheckEmail.ts`; plain-text alternative; no CTA). Run `stop-slop` over the reader-mail German copy.

- [ ] **Step 4: Implement `actions.ts`** per Interfaces; `pdfUrl = \`${siteUrl}${BAUPLAN_PDF_PATH}\``.

- [ ] **Step 5: Run tests, then commit**

Run: `npx vitest run src/lib/bauplanEmail.test.ts src/app/bauplan/actions.test.ts src/lib/kommaUnd.test.ts`
Expected: PASS.

```bash
git add src/lib/bauplanEmail.ts src/lib/bauplanEmail.test.ts src/app/bauplan/actions.ts src/app/bauplan/actions.test.ts
git commit -m "feat(bauplan): PDF request mail flow (reader + internal) via Resend"
```

---

### Task 6: The request form on the page

**Files:**
- Create: `src/components/bauplan/BauplanPdfForm.tsx`, `src/components/bauplan/BauplanPdfForm.test.tsx`
- Modify: `src/app/bauplan/[code]/page.tsx` (pass `form={<BauplanPdfForm source={…} />}`); read `?src=` with the `ProzessCheckFromUrl` pattern (client `useSearchParams` inside `<Suspense>`), or, since the route is already `force-dynamic`, read `searchParams` server-side and pass `source` down (implementer's choice; server-side is simpler here).

**Interfaces:**
- Consumes: `submitBauplanRequest`, `BauplanEmailState` (Task 5); `bauplanPage.pdf` strings (Task 2).
- Produces: `BauplanPdfForm({ source }: { source?: string })`: `useActionState(submitBauplanRequest, { status: "idle" })`; hidden `renderedAt` (`useState(() => Date.now())`), hidden `src`, honeypot `website` (same markup as `ResultEmailForm`), labelled e-mail input, submit button with `bauplanPage.pdf.button`, `hinweis` line + `<Link href="/datenschutz">Datenschutz</Link>` under it; on `ok` replace the form with `<p role="status">{success}</p>`; on `invalid`/`error` show the message in an `aria-describedby` element.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
vi.mock("@/app/bauplan/actions", () => ({ submitBauplanRequest: vi.fn(async () => ({ status: "ok" })) }));
import { BauplanPdfForm } from "./BauplanPdfForm";

it("renders the mail field, the hinweis and the Datenschutz link, and shows the success line after submit", async () => {
  render(<BauplanPdfForm source="ag01" />);
  expect(screen.getByLabelText("Deine E-Mail-Adresse")).toBeInTheDocument();
  expect(screen.getByText(/nur diese eine Mail/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz");
  expect(document.querySelector('input[name="src"]')).toHaveAttribute("value", "ag01");
  fireEvent.submit(screen.getByRole("button", { name: "PDF zuschicken" }).closest("form")!);
  expect(await screen.findByRole("status")).toHaveTextContent(/unterwegs/);
});
```

- [ ] **Step 2: Run to verify it fails** · `npx vitest run src/components/bauplan/BauplanPdfForm.test.tsx` → FAIL.

- [ ] **Step 3: Implement the component and wire it into `page.tsx`.** Extend `BauplanPage.test.tsx` with one assertion that the form slot renders inside `#pdf`.

- [ ] **Step 4: Run tests, then commit**

Run: `npx vitest run src/components/bauplan src/app/bauplan`
Expected: PASS.

```bash
git add src/components/bauplan src/app/bauplan
git commit -m "feat(bauplan): PDF request form on the page"
```

---

### Task 7: The PDF guide (template, render script, committed file)

**Files:**
- Create: `content/bauplan/agentur-bauplan.html` (template with `{{{BRAND_CSS}}}` and `{{{LOGO_SVG}}}` placeholders, like `Clients/_kit/prozess-einseiter/vrelo-prozess-einseiter.html`)
- Create: `scripts/build-bauplan-pdf.mjs` (resolves the kit renderer at `../Clients/_kit/brand-pdf/render-doc.mjs` relative to the repo root, spawns `node render-doc.mjs <template> <out>` from the kit dir, then renames the output to `public/bauplan/agentur-bauplan-<8-hex-of-sha256>.pdf`, deletes any older `agentur-bauplan-*.pdf` and prints the new path)
- Modify: `package.json` scripts: `"bauplan:pdf": "node scripts/build-bauplan-pdf.mjs"`
- Modify: `src/lib/bauplanEmail.ts` `BAUPLAN_PDF_PATH` to the final hashed name; test in `src/lib/bauplanEmail.test.ts` that `existsSync(join(process.cwd(), "public", BAUPLAN_PDF_PATH))` is true.
- Test: `src/lib/bauplanTemplate.test.ts` (copy guards on the template)

**Interfaces:**
- Consumes: spec §5 structure (8 parts) and §4 copy.
- Produces: the committed PDF under `public/bauplan/` and the matching `BAUPLAN_PDF_PATH`.

- [ ] **Step 1: Write the failing template test**

```ts
// src/lib/bauplanTemplate.test.ts
import { readFileSync } from "node:fs";
import { findCopyIssues } from "./ratgeberCopy";
const html = readFileSync("content/bauplan/agentur-bauplan.html", "utf8");
const text = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ")
  .replace(/&#8222;/g, "„").replace(/&#8220;/g, "“").replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü").replace(/&szlig;/g, "ß");

it("carries the eight parts in order", () => {
  const order = ["Das Fundament", "Prinzip 1", "Prinzip 2", "Prinzip 3", "Prinzip 4", "Der ganze Weg"];
  const idx = order.map((h) => text.indexOf(h));
  expect(idx.every((i) => i >= 0)).toBe(true);
  expect([...idx].sort((a, b) => a - b)).toEqual(idx);
});
it("has blank worksheets", () => { expect((html.match(/class="blank"/g) ?? []).length).toBeGreaterThanOrEqual(4); });
it("follows the house typography and names no tool or client", () => {
  expect(findCopyIssues(text)).toEqual([]);
  expect(text).not.toMatch(/ClickUp|HubSpot|sevDesk|Velp|Alen|€/);
});
```

- [ ] **Step 2: Run to verify it fails** · `npx vitest run src/lib/bauplanTemplate.test.ts` → FAIL (file missing).

- [ ] **Step 3: Write the template** per spec §5: cover + one paragraph + the one rule („Fang mit einer Station an, nicht mit allen auf einmal.“); Fundament; Prinzip 1 (profile fields Input · Output · Wer · Was · Start/Ende, worked example Dreh → Schnitt, then two blank profiles with `class="blank"` boxes); Prinzip 2 (output = next input; tool table Programm · wofür · kann schon · anbinden? · braucht; the two principles „Erst prüfen, was dein Programm schon kann“ and „Ein Programm hält die Kundendaten“; worked example website relaunch; blank tool table); Prinzip 3 (review: Wer prüft · worauf; „Nichts geht an den Kunden ohne den Klick eines Menschen“; worked example campaign; blank lines); Prinzip 4 (Nachschärfen, half page, blank „Was fehlt noch“ box); Der ganze Weg (one filled overview page, one blank); back page (first-person paragraph, contact line `ajdin@vrelo-ki.de`, Datenschutz reference, the sentence „Wenn du magst, leg ich den Bauplan mit dir neben deinen Ablauf.“). All non-ASCII as HTML entities; `page-break-before: always` between principles; keep under 1 MB (vector logo only).

- [ ] **Step 4: Run `stop-slop` over the template's German copy**, then re-run the template test → PASS.

- [ ] **Step 5: Write `scripts/build-bauplan-pdf.mjs` and the npm script; render**

Run: `npm run bauplan:pdf`
Expected: prints `public/bauplan/agentur-bauplan-<hash>.pdf`; file < 1 MB; open it and check 6 to 8 pages, no orphan headings.

- [ ] **Step 6: Set `BAUPLAN_PDF_PATH` to the printed name; add the existence test; run**

Run: `npx vitest run src/lib/bauplanEmail.test.ts src/lib/bauplanTemplate.test.ts`
Expected: PASS.

- [ ] **Step 7: STOP for Ajdin's review of the rendered PDF (spec §7a).** Hand him the file path; apply his edits; re-render (new hash) and update `BAUPLAN_PDF_PATH` if the hash changed.

- [ ] **Step 8: Commit**

```bash
git add content/bauplan scripts/build-bauplan-pdf.mjs package.json public/bauplan src/lib/bauplanEmail.ts src/lib/bauplanEmail.test.ts src/lib/bauplanTemplate.test.ts
git commit -m "feat(bauplan): PDF guide template, render script and committed PDF"
```

---

### Task 8: Datenschutz sections, docs, manual check

**Files:**
- Modify: `src/lib/legal/datenschutz.ts` (add two sections after „Kontaktformular“) and its test if one asserts section headings
- Modify: `CLAUDE.md` (Website): a „Bauplan für Agenturen“ paragraph (route, env, render command, rotation rule, PDF review gate)
- Modify: HQ `C:\Users\ajdin\Vrelo\CLAUDE.md` §2.2 (one index line) and §7 (the agency row: link = `/bauplan/<code>?src=ag<nn>`)

**Interfaces:** none new.

- [ ] **Step 1: Add the two Datenschutz sections** (du, same register as „Kontaktformular“):
  - „Prozess-Check“: the questionnaire runs in the browser; on request the result is e-mailed to the address given and a copy goes to Ajdin; Resend as processor; lit. b; deleted when no longer needed.
  - „Bauplan-PDF anfordern“: on the unlisted blueprint page the address is used once to send the PDF and to notify Ajdin; no newsletter, no profiling; Resend as processor; lit. b; the address is kept with the other inbound mail (see „E-Mail-Kontakt“).
  Run `stop-slop`; run `npx vitest run src/lib/kommaUnd.test.ts src/app/datenschutz` → PASS.

- [ ] **Step 2: Full test run and type check**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: all green.

- [ ] **Step 3: Manual check (Review Focus 5)**: set `BAUPLAN_CODE=agentur-7k3m` in `.env.local`, `npm run build && npm start`, open `http://localhost:3000/bauplan/agentur-7k3m?src=ag01` at 390 px width: stacked cards, no horizontal scroll, logo-only header, footer without newsletter; request the PDF with a real address and confirm both mails arrive, the attachment opens, the internal mail says `Quelle: ag01`; open `/bauplan/wrong` → 404.

- [ ] **Step 4: Docs** as listed in Files (Website `CLAUDE.md` gets the rotation rule: change `BAUPLAN_CODE` in Vercel → old link 404s, no deploy needed; PDF outlives rotation by design).

- [ ] **Step 5: Commit; then ask Ajdin before any push** (memory rule). Vercel env `BAUPLAN_CODE` must be set in Production before the push to `main`.

```bash
git add src/lib/legal/datenschutz.ts CLAUDE.md
git commit -m "docs(bauplan): Datenschutz sections for Prozess-Check + Bauplan, repo guide"
```
