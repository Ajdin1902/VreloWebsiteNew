# Vrelo Phase 4a — Kontakt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/kontakt` live — a consent-gated Cal.com scheduler (primary) + a contact form (Server Action → Resend, fallback) — plus minimal German Impressum + Datenschutzerklärung drafts so collecting personal data is lawful.

**Architecture:** Pure, fully-tested core in `src/lib/contact.ts` (validation, spam checks, email building, a pure `evaluateSubmission` decision function) with a thin Server Action (`src/app/kontakt/actions.ts`) that performs the Resend send. Everything is config-driven via env vars and degrades gracefully when unset (form → `mailto`, scheduler → placeholder). The Cal.com embed is click-to-load (no third-party script/cookie until the user clicks). Legal copy lives in small content modules rendered by thin pages.

**Tech Stack:** Next.js 16 (App Router, RSC, Server Actions) · TypeScript · Tailwind v4 (`@theme` tokens) · `resend` v6 · `@calcom/embed-react` v1 · Vitest + React Testing Library.

**Spec:** [docs/superpowers/specs/2026-06-05-vrelo-phase4a-kontakt-design.md](../specs/2026-06-05-vrelo-phase4a-kontakt-design.md)

**Branch:** `feat/phase4a-kontakt` (already checked out). Commit after every task; messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## Conventions (read once)

- **Commands:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`. Single file: `npx vitest run <path>`.
- **Brand:** colors only via Tailwind `@theme` tokens ([src/app/globals.css](../../../src/app/globals.css)) — `bg-papier`, `text-tiefes-wasser`, `border-faden`, `bg-amber`, `text-stumm`, etc. „Vrelo“/„Merak“ only via `<BrandWord>`. Background `papier`, never white.
- **German quotes:** `„…“` = U+201E (open) + U+201C (close), never ASCII `"`. After any edit touching German copy, verify bytes (Task 13 shows the check).
- **Path alias:** `@/` → `src/`.
- **Next 16:** route `params`/`searchParams` are Promises; `useActionState` is from `react`.
- **Env in tests:** use `vi.stubEnv("NAME","value")` + `vi.unstubAllEnvs()` in `afterEach`. All env getters in `contact.ts` MUST read `process.env` *inside the function* (not cached at module load) so stubbing works.
- **Secrets:** only `.env.example` (empty placeholders) is committed. Real values live in Vercel.

## File overview

**Create — lib / actions**
- `src/lib/contact.ts` — constants (`MIN_FILL_MS`), types, env getters, `isContactConfigured`, `validateContact`, `isHoneypotTripped`, `isTooFast`, `buildContactEmail`, `evaluateSubmission`.
- `src/app/kontakt/actions.ts` — `sendContactMessage` Server Action (thin; uses `contact.ts` + Resend).
- `src/lib/legal/impressum.ts`, `src/lib/legal/datenschutz.ts` — German draft content (typed section arrays).

**Create — components**
- `src/components/kontakt/ContactForm.tsx` (client) — form + `useActionState`.
- `src/components/kontakt/SchedulerEmbed.tsx` (client) — consent-gated Cal embed.
- `src/components/legal/LegalPage.tsx` — shared renderer for the two legal pages (PageIntro + sections).

**Create — routes**
- `src/app/kontakt/page.tsx`, `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`

**Create — config**
- `.env.example` (committed, placeholders only).

**Modify**
- `src/app/sitemap.ts` — add `/kontakt`, `/impressum`, `/datenschutz`.
- `CLAUDE.md` — status/roadmap (final task).

**NOT modified:** `src/components/Footer.tsx` already links `/impressum` + `/datenschutz` (verified) — those links light up once the pages exist. No Footer change.

---

## Task 1: Install deps + .env.example

**Files:** `package.json`, `package-lock.json`, `.env.example`

- [ ] **Step 1: Install**

Run: `npm install resend @calcom/embed-react`

- [ ] **Step 2: Create `.env.example`**

```bash
# Vrelo — environment variables. Copy to .env.local for local dev; set real
# values in the Vercel project settings. NEVER commit real secrets.

# Resend (contact form email)
RESEND_API_KEY=
# Verified sender address, e.g. "Vrelo <kontakt@vrelo-ki.de>"
CONTACT_FROM=
# Inbox that receives contact-form submissions
CONTACT_TO=
# Cal.com booking link (public), e.g. "vrelo/kennenlernen"
NEXT_PUBLIC_CAL_LINK=
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsc --noEmit` → PASS. `npm ls resend @calcom/embed-react` → both present.
```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add resend + @calcom/embed-react, document env in .env.example"
```

---

## Task 2: contact.ts — env getters + isContactConfigured

**Files:** Create `src/lib/contact.ts`; Test `src/lib/contact.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/contact.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import { contactTo, contactFrom, resendKey, calLink, isContactConfigured } from "./contact";

afterEach(() => vi.unstubAllEnvs());

describe("contact env getters", () => {
  it("read process.env at call time", () => {
    vi.stubEnv("CONTACT_TO", "hallo@example.de");
    vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("NEXT_PUBLIC_CAL_LINK", "vrelo/kennenlernen");
    expect(contactTo()).toBe("hallo@example.de");
    expect(contactFrom()).toBe("Vrelo <kontakt@example.de>");
    expect(resendKey()).toBe("re_test");
    expect(calLink()).toBe("vrelo/kennenlernen");
  });

  it("isContactConfigured is true only when key+from+to are all set", () => {
    expect(isContactConfigured()).toBe(false);
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM", "x@y.de");
    expect(isContactConfigured()).toBe(false);
    vi.stubEnv("CONTACT_TO", "z@y.de");
    expect(isContactConfigured()).toBe(true);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/contact.test.ts` → FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
// src/lib/contact.ts

export function resendKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}
export function contactFrom(): string | undefined {
  return process.env.CONTACT_FROM;
}
export function contactTo(): string | undefined {
  return process.env.CONTACT_TO;
}
export function calLink(): string | undefined {
  return process.env.NEXT_PUBLIC_CAL_LINK;
}

export function isContactConfigured(): boolean {
  return Boolean(resendKey() && contactFrom() && contactTo());
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/contact.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/contact.ts src/lib/contact.test.ts
git commit -m "feat: add contact env getters + isContactConfigured"
```

---

## Task 3: contact.ts — validation + spam helpers

**Files:** Modify `src/lib/contact.ts`; Test `src/lib/contact.validate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/contact.validate.test.ts
import { describe, it, expect } from "vitest";
import { validateContact, isHoneypotTripped, isTooFast, MIN_FILL_MS } from "./contact";

describe("validateContact", () => {
  const ok = { name: "Aydin", email: "a@b.de", message: "Hallo", consent: true };

  it("passes a complete valid submission (no errors)", () => {
    expect(validateContact(ok)).toEqual({});
  });
  it("flags missing name, bad email, empty message, missing consent", () => {
    const e = validateContact({ name: "  ", email: "nope", message: "", consent: false });
    expect(e.name).toBeTruthy();
    expect(e.email).toBeTruthy();
    expect(e.message).toBeTruthy();
    expect(e.consent).toBeTruthy();
  });
});

describe("spam helpers", () => {
  it("isHoneypotTripped true only when the hidden field has content", () => {
    expect(isHoneypotTripped("")).toBe(false);
    expect(isHoneypotTripped("   ")).toBe(false);
    expect(isHoneypotTripped("http://spam")).toBe(true);
  });
  it("isTooFast true below MIN_FILL_MS, false at/after", () => {
    const t = 1_000_000;
    expect(isTooFast(t, t + MIN_FILL_MS - 1)).toBe(true);
    expect(isTooFast(t, t + MIN_FILL_MS)).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/contact.validate.test.ts` → FAIL.

- [ ] **Step 3: Implement (append to `src/lib/contact.ts`, above the env getters)**

```ts
export const MIN_FILL_MS = 3000;

export type ContactErrors = Partial<
  Record<"name" | "email" | "message" | "consent", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(f: {
  name: string;
  email: string;
  message: string;
  consent: boolean;
}): ContactErrors {
  const errors: ContactErrors = {};
  if (!f.name.trim()) errors.name = "Bitte gib deinen Namen an.";
  if (!EMAIL_RE.test(f.email.trim())) errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  if (!f.message.trim()) errors.message = "Bitte schreib kurz, worum es geht.";
  if (!f.consent) errors.consent = "Bitte stimme der Datenschutzerklärung zu.";
  return errors;
}

export function isHoneypotTripped(honeypot: string): boolean {
  return honeypot.trim().length > 0;
}

export function isTooFast(renderedAt: number, now: number): boolean {
  return now - renderedAt < MIN_FILL_MS;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/contact.validate.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/contact.ts src/lib/contact.validate.test.ts
git commit -m "feat: add contact validation + spam helpers"
```

---

## Task 4: contact.ts — email builder + evaluateSubmission decision

**Files:** Modify `src/lib/contact.ts`; Test `src/lib/contact.evaluate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/contact.evaluate.test.ts
import { describe, it, expect } from "vitest";
import { buildContactEmail, evaluateSubmission, MIN_FILL_MS, type ContactFields } from "./contact";

const base: ContactFields = {
  name: "Aydin", email: "a@b.de", message: "Worum es geht.",
  company: "", consent: true, honeypot: "", renderedAt: 0,
};

describe("buildContactEmail", () => {
  it("builds subject, plain-text body and replyTo; omits empty Betrieb", () => {
    const e = buildContactEmail({ name: "Aydin", email: "a@b.de", message: "Hi", company: "" });
    expect(e.replyTo).toBe("a@b.de");
    expect(e.subject).toMatch(/Anfrage/);
    expect(e.text).toContain("Aydin");
    expect(e.text).toContain("Hi");
    expect(e.text).not.toContain("Betrieb:");
  });
  it("includes Betrieb when provided", () => {
    expect(buildContactEmail({ name: "A", email: "a@b.de", message: "Hi", company: "Bäckerei" }).text)
      .toContain("Betrieb: Bäckerei");
  });
});

describe("evaluateSubmission", () => {
  const now = 1_000_000 + MIN_FILL_MS + 1; // far enough past renderedAt:0

  it("drops when honeypot is filled", () => {
    expect(evaluateSubmission({ ...base, honeypot: "x" }, now)).toEqual({ action: "drop" });
  });
  it("rejects when submitted too fast", () => {
    const r = evaluateSubmission({ ...base, renderedAt: now }, now + 10);
    expect(r.action).toBe("reject");
  });
  it("returns invalid with errors for bad input", () => {
    const r = evaluateSubmission({ ...base, email: "nope" }, now);
    expect(r.action).toBe("invalid");
    if (r.action === "invalid") expect(r.errors.email).toBeTruthy();
  });
  it("returns send with the built email for a clean submission", () => {
    const r = evaluateSubmission(base, now);
    expect(r.action).toBe("send");
    if (r.action === "send") expect(r.email.replyTo).toBe("a@b.de");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/contact.evaluate.test.ts` → FAIL.

- [ ] **Step 3: Implement (append to `src/lib/contact.ts`)**

```ts
export type ContactFields = {
  name: string;
  email: string;
  message: string;
  company: string;
  consent: boolean;
  honeypot: string;
  renderedAt: number;
};

export type ContactEmail = { subject: string; text: string; replyTo: string };

export function buildContactEmail(f: {
  name: string;
  email: string;
  message: string;
  company: string;
}): ContactEmail {
  const lines = [
    `Name: ${f.name}`,
    `E-Mail: ${f.email}`,
    f.company.trim() ? `Betrieb: ${f.company}` : null,
    "",
    "Nachricht:",
    f.message,
  ].filter((l): l is string => l !== null);
  return { subject: "Neue Anfrage über vrelo-website", text: lines.join("\n"), replyTo: f.email.trim() };
}

export type Decision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; errors: ContactErrors }
  | { action: "send"; email: ContactEmail };

export function evaluateSubmission(f: ContactFields, now: number): Decision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const errors = validateContact(f);
  if (Object.keys(errors).length > 0) return { action: "invalid", errors };
  return { action: "send", email: buildContactEmail(f) };
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/contact.evaluate.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/contact.ts src/lib/contact.evaluate.test.ts
git commit -m "feat: add contact email builder + evaluateSubmission decision"
```

---

## Task 5: Server Action (sendContactMessage)

**Files:** Create `src/app/kontakt/actions.ts`; Test `src/app/kontakt/actions.test.ts`

- [ ] **Step 1: Write the failing test (mocks Resend; stubs env)**

```ts
// src/app/kontakt/actions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send } })),
}));

import { sendContactMessage, type ContactState } from "./actions";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const initial: ContactState = { status: "idle" };

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("CONTACT_TO", "hallo@example.de");
});
afterEach(() => vi.unstubAllEnvs());

describe("sendContactMessage", () => {
  const good = { name: "Aydin", email: "a@b.de", message: "Hallo", company: "", consent: "on", website: "", renderedAt: "0" };

  it("sends via Resend on a clean submission and returns ok", async () => {
    const r = await sendContactMessage(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("hallo@example.de");
    expect(arg.from).toBe("Vrelo <kontakt@example.de>");
    expect(arg.replyTo).toBe("a@b.de");
  });

  it("silently succeeds without sending when honeypot is filled", async () => {
    const r = await sendContactMessage(initial, fd({ ...good, website: "spam" }));
    expect(r.status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns invalid with field errors and does not send", async () => {
    const r = await sendContactMessage(initial, fd({ ...good, email: "nope" }));
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(r.errors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when Resend throws", async () => {
    send.mockRejectedValueOnce(new Error("boom"));
    const r = await sendContactMessage(initial, fd(good));
    expect(r.status).toBe("error");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/app/kontakt/actions.test.ts` → FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
// src/app/kontakt/actions.ts
"use server";

import { Resend } from "resend";
import {
  evaluateSubmission,
  isContactConfigured,
  contactFrom,
  contactTo,
  resendKey,
  type ContactErrors,
  type ContactFields,
} from "@/lib/contact";

export type ContactState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; errors: ContactErrors };

function parse(formData: FormData): ContactFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    name: get("name"),
    email: get("email"),
    message: get("message"),
    company: get("company"),
    consent: formData.get("consent") != null,
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
  };
}

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const decision = evaluateSubmission(parse(formData), Date.now());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", errors: decision.errors };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
    await resend.emails.send({
      from: contactFrom()!,
      to: contactTo()!,
      replyTo: decision.email.replyTo,
      subject: decision.email.subject,
      text: decision.email.text,
    });
    return { status: "ok" };
  } catch {
    return { status: "error", message: "Da ist etwas schiefgelaufen. Schreib mir gern direkt." };
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/app/kontakt/actions.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/kontakt/actions.ts src/app/kontakt/actions.test.ts
git commit -m "feat: add contact Server Action (Resend send, spam/validation branches)"
```

---

## Task 6: ContactForm component

**Files:** Create `src/components/kontakt/ContactForm.tsx`; Test `src/components/kontakt/ContactForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/kontakt/ContactForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  it("renders all fields, a consent link to /datenschutz, and a submit button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Was frisst gerade deine Zeit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Betrieb/i)).toBeInTheDocument();
    const consentLink = screen.getByRole("link", { name: /Datenschutz/i });
    expect(consentLink).toHaveAttribute("href", "/datenschutz");
    expect(screen.getByRole("button", { name: /senden/i })).toBeInTheDocument();
  });

  it("includes a visually-hidden honeypot field not exposed to assistive tech", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/components/kontakt/ContactForm.test.tsx` → FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/components/kontakt/ContactForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { sendContactMessage, type ContactState } from "@/app/kontakt/actions";

const initial: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initial);
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "ok") {
    return (
      <p className="font-serif text-xl text-ember">Danke — ich melde mich. Kein Stress.</p>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const fieldClass =
    "mt-1 w-full rounded-md border border-faden bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber";

  return (
    <form action={formAction} className="max-w-xl space-y-5" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      {/* honeypot — hidden from humans and assistive tech */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="cf-name" className="text-sm font-medium text-tiefes-wasser">Name</label>
        <input id="cf-name" name="name" type="text" className={fieldClass}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "cf-name-err" : undefined} />
        {errors.name && <p id="cf-name-err" className="mt-1 text-sm text-ember">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="cf-email" className="text-sm font-medium text-tiefes-wasser">E-Mail</label>
        <input id="cf-email" name="email" type="email" className={fieldClass}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "cf-email-err" : undefined} />
        {errors.email && <p id="cf-email-err" className="mt-1 text-sm text-ember">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="cf-message" className="text-sm font-medium text-tiefes-wasser">Was frisst gerade deine Zeit?</label>
        <textarea id="cf-message" name="message" rows={5} className={fieldClass}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "cf-message-err" : undefined} />
        {errors.message && <p id="cf-message-err" className="mt-1 text-sm text-ember">{errors.message}</p>}
      </div>

      <div>
        <label htmlFor="cf-company" className="text-sm font-medium text-tiefes-wasser">Betrieb <span className="text-stumm">(optional)</span></label>
        <input id="cf-company" name="company" type="text" className={fieldClass} />
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-tinte">
          <input type="checkbox" name="consent" className="mt-1" aria-invalid={!!errors.consent} />
          <span>
            Ich habe die <Link href="/datenschutz" className="text-vrelo-petrol underline underline-offset-2">Datenschutzerklärung</Link> gelesen und bin einverstanden.
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-sm text-ember">{errors.consent}</p>}
      </div>

      {state.status === "error" && <p className="text-sm text-ember">{state.message}</p>}

      <button type="submit" disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-amber">
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/components/kontakt/ContactForm.test.tsx` → PASS. Then `npx tsc --noEmit && npm run lint` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/kontakt/ContactForm.tsx src/components/kontakt/ContactForm.test.tsx
git commit -m "feat: add ContactForm (Server Action, honeypot, a11y states)"
```

---

## Task 7: SchedulerEmbed component (consent-gated)

**Files:** Create `src/components/kontakt/SchedulerEmbed.tsx`; Test `src/components/kontakt/SchedulerEmbed.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/kontakt/SchedulerEmbed.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SchedulerEmbed } from "./SchedulerEmbed";

// Stub the Cal embed so the test asserts our gating, not Cal internals
vi.mock("@calcom/embed-react", () => ({
  default: () => <div data-testid="cal-embed" />,
}));

describe("SchedulerEmbed", () => {
  it("shows the consent placeholder and does NOT mount Cal before click", () => {
    render(<SchedulerEmbed calLink="vrelo/kennenlernen" />);
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    expect(screen.queryByTestId("cal-embed")).toBeNull();
  });

  it("mounts the Cal embed only after the user clicks", async () => {
    render(<SchedulerEmbed calLink="vrelo/kennenlernen" />);
    await userEvent.click(screen.getByRole("button", { name: /Termin anzeigen/i }));
    expect(screen.getByTestId("cal-embed")).toBeInTheDocument();
  });

  it("shows a calm placeholder (no button) when calLink is missing", () => {
    render(<SchedulerEmbed calLink={undefined} />);
    expect(screen.getByText(/folgt in Kürze/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Termin anzeigen/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/components/kontakt/SchedulerEmbed.test.tsx` → FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/components/kontakt/SchedulerEmbed.tsx
"use client";

import { useState } from "react";
import Cal from "@calcom/embed-react";

export function SchedulerEmbed({ calLink }: { calLink: string | undefined }) {
  const [open, setOpen] = useState(false);

  if (!calLink) {
    return (
      <div className="rounded-lg border border-faden bg-gletscher/30 p-8 text-center">
        <p className="font-serif text-xl text-tiefes-wasser">Online-Terminbuchung folgt in Kürze.</p>
        <p className="mt-2 text-stumm">Schreib mir so lange einfach über das Formular unten.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="rounded-lg border border-faden bg-gletscher/30 p-8 text-center">
        <p className="font-serif text-xl text-tiefes-wasser">Lieber direkt sprechen?</p>
        <p className="mt-2 text-stumm">Buch dir ein unverbindliches Kennenlern-Gespräch.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-amber"
        >
          Termin anzeigen
        </button>
        <p className="mt-3 text-xs text-stumm">
          Beim Klick wird der Kalender von Cal.com geladen.
        </p>
      </div>
    );
  }

  return <Cal calLink={calLink} style={{ width: "100%", height: "100%", overflow: "scroll" }} />;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/components/kontakt/SchedulerEmbed.test.tsx` → PASS. Then `npx tsc --noEmit && npm run lint` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/kontakt/SchedulerEmbed.tsx src/components/kontakt/SchedulerEmbed.test.tsx
git commit -m "feat: add consent-gated Cal.com SchedulerEmbed"
```

---

## Task 8: Legal content modules (Impressum + Datenschutz)

**Files:** Create `src/lib/legal/impressum.ts`, `src/lib/legal/datenschutz.ts`; Test `src/lib/legal/legal.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/legal/legal.test.ts
import { describe, it, expect } from "vitest";
import { impressum } from "./impressum";
import { datenschutz } from "./datenschutz";

describe("legal content", () => {
  it("impressum has section headings and a Platzhalter for personal details", () => {
    const headings = impressum.sections.map((s) => s.heading);
    expect(headings.join(" ")).toMatch(/Haftung für Links/i);
    const body = impressum.sections.map((s) => s.body).join("\n");
    expect(body).toContain("[Platzhalter]");
  });

  it("datenschutz covers the contact form, Resend, Cal.com, rights, and a newsletter placeholder", () => {
    const all = datenschutz.sections.map((s) => `${s.heading}\n${s.body}`).join("\n");
    expect(all).toMatch(/Verantwortlich/i);
    expect(all).toMatch(/Resend/);
    expect(all).toMatch(/Cal\.com/);
    expect(all).toMatch(/Betroffenenrechte|Rechte/i);
    expect(all).toContain("[Platzhalter]");
    expect(all).toMatch(/Newsletter/i);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/legal/legal.test.ts` → FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/legal/impressum.ts`:
```ts
export type LegalSection = { heading: string; body: string };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

export const impressum: LegalDoc = {
  title: "Impressum",
  intro:
    "Entwurf — bitte vor Veröffentlichung rechtlich prüfen lassen. Angaben gemäß § 5 DDG.",
  sections: [
    {
      heading: "Anbieter",
      body: "[Platzhalter: Vor- und Nachname]\n[Platzhalter: Straße und Hausnummer]\n[Platzhalter: PLZ und Ort]\nDeutschland",
    },
    {
      heading: "Kontakt",
      body: "E-Mail: [Platzhalter: E-Mail-Adresse]\nTelefon: [Platzhalter: optional]",
    },
    {
      heading: "Umsatzsteuer-ID",
      body: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [Platzhalter: falls vorhanden]",
    },
    {
      heading: "Verantwortlich für den Inhalt",
      body: "[Platzhalter: Name], Anschrift wie oben.",
    },
    {
      heading: "EU-Streitschlichtung",
      body: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    },
    {
      heading: "Haftung für Inhalte",
      body: "Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann ich jedoch keine Gewähr übernehmen.",
    },
    {
      heading: "Haftung für Links",
      body: "Diese Seite enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte ist stets der jeweilige Anbieter verantwortlich.",
    },
    {
      heading: "Urheberrecht",
      body: "Die durch den Seitenbetreiber erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht.",
    },
  ],
};
```

Create `src/lib/legal/datenschutz.ts`:
```ts
import type { LegalDoc } from "./impressum";

export const datenschutz: LegalDoc = {
  title: "Datenschutzerklärung",
  intro:
    "Entwurf — bitte vor Veröffentlichung rechtlich prüfen lassen. Diese Erklärung informiert über die Verarbeitung personenbezogener Daten auf dieser Website.",
  sections: [
    {
      heading: "Verantwortlicher",
      body: "Verantwortlich im Sinne der DSGVO:\n[Platzhalter: Name, Anschrift, E-Mail] (siehe Impressum).",
    },
    {
      heading: "Hosting",
      body: "Diese Website wird bei Vercel gehostet. Beim Aufruf werden technisch notwendige Server-Logs (u. a. IP-Adresse, Zeitpunkt, abgerufene Seite) verarbeitet. Dabei können Daten in die USA übertragen werden. Rechtsgrundlage ist das berechtigte Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
    },
    {
      heading: "Kontaktformular",
      body: "Wenn du das Kontaktformular nutzt, verarbeite ich die von dir angegebenen Daten (Name, E-Mail-Adresse, Nachricht und optional dein Betrieb), um deine Anfrage zu beantworten. Der Versand der E-Mail erfolgt über den Dienstleister Resend (Auftragsverarbeiter). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und lit. f DSGVO. Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht mehr erforderlich sind.",
    },
    {
      heading: "Terminbuchung (Cal.com)",
      body: "Die Online-Terminbuchung wird über Cal.com eingebunden und erst geladen, wenn du aktiv auf „Termin anzeigen“ klickst. Vorher werden keine Daten an Cal.com übertragen. Mit dem Klick willigst du in das Laden ein; dabei können Daten an die Cal.com, Inc. übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a und lit. b DSGVO.",
    },
    {
      heading: "Cookies",
      body: "Beim Laden der Seite werden keine Tracking-Cookies gesetzt. Externe Einbindungen (z. B. Cal.com) werden erst nach deiner aktiven Zustimmung geladen.",
    },
    {
      heading: "Newsletter",
      body: "[Platzhalter: wird mit dem Newsletter ergänzt.]",
    },
    {
      heading: "Deine Rechte (Betroffenenrechte)",
      body: "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.",
    },
    {
      heading: "SSL-/TLS-Verschlüsselung",
      body: "Diese Seite nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung.",
    },
  ],
};
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/legal/legal.test.ts` → PASS.

> German-quote note: the Cal.com section body contains „Termin anzeigen“ — ensure it uses U+201E + U+201C. Since you're creating the file fresh, type the correct characters; the byte check in Task 13 will confirm.

- [ ] **Step 5: Commit**

```bash
git add src/lib/legal/impressum.ts src/lib/legal/datenschutz.ts src/lib/legal/legal.test.ts
git commit -m "content: add Impressum + Datenschutz draft modules"
```

---

## Task 9: LegalPage renderer + /impressum + /datenschutz pages

**Files:** Create `src/components/legal/LegalPage.tsx`, `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`

- [ ] **Step 1: Write the failing test (renderer)**

```tsx
// src/components/legal/LegalPage.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegalPage } from "./LegalPage";

describe("LegalPage", () => {
  it("renders the title and each section heading", () => {
    render(
      <LegalPage
        doc={{
          title: "Test-Titel",
          intro: "Intro-Text",
          sections: [{ heading: "Abschnitt A", body: "Inhalt A" }],
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Test-Titel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Abschnitt A" })).toBeInTheDocument();
    expect(screen.getByText("Inhalt A")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/components/legal/LegalPage.test.tsx` → FAIL.

- [ ] **Step 3: Implement renderer + pages**

`src/components/legal/LegalPage.tsx`:
```tsx
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import type { LegalDoc } from "@/lib/legal/impressum";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageIntro eyebrow="Rechtliches" title={doc.title} lead={doc.intro} />
      <Section tone="paper">
        <div className="mx-auto max-w-2xl space-y-8">
          {doc.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-serif text-xl font-medium text-tiefes-wasser">{s.heading}</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-tinte/90">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
```

`src/app/impressum/page.tsx`:
```tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import { impressum } from "@/lib/legal/impressum";
import { breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von Vrelo.",
};

export default function ImpressumPage() {
  return (
    <>
      <LegalPage doc={impressum} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Impressum", path: "/impressum" }])} />
    </>
  );
}
```

`src/app/datenschutz/page.tsx`:
```tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import { datenschutz } from "@/lib/legal/datenschutz";
import { breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von Vrelo — wie deine Daten verarbeitet werden.",
};

export default function DatenschutzPage() {
  return (
    <>
      <LegalPage doc={datenschutz} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Datenschutz", path: "/datenschutz" }])} />
    </>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npx vitest run src/components/legal/LegalPage.test.tsx` → PASS. `npx tsc --noEmit && npm run lint` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/legal/LegalPage.tsx src/components/legal/LegalPage.test.tsx src/app/impressum/page.tsx src/app/datenschutz/page.tsx
git commit -m "feat: add Impressum + Datenschutz pages (LegalPage renderer + breadcrumb JSON-LD)"
```

---

## Task 10: /kontakt page

**Files:** Create `src/app/kontakt/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/app/kontakt/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { ContactForm } from "@/components/kontakt/ContactForm";
import { calLink, isContactConfigured, contactTo } from "@/lib/contact";
import { breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Buch ein unverbindliches Kennenlern-Gespräch oder schreib mir, was dich täglich Zeit kostet.",
};

export default function KontaktPage() {
  const configured = isContactConfigured();
  const to = contactTo();
  return (
    <>
      <PageIntro
        eyebrow="Kontakt"
        title="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich melde mich und sage dir ehrlich, ob und wie ich helfen kann."
      />

      <Section tone="paper">
        <div className="mx-auto max-w-2xl">
          <SchedulerEmbed calLink={calLink()} />
        </div>
      </Section>

      <Section tone="paper" tint className="border-t border-faden">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-2xl font-medium text-tiefes-wasser">Oder schreib mir.</h2>
          <div className="mt-6">
            {configured ? (
              <ContactForm />
            ) : (
              <p className="text-tinte">
                Schreib mir direkt:{" "}
                <a
                  href={`mailto:${to ?? ""}`}
                  className="text-vrelo-petrol underline underline-offset-2"
                >
                  {to ?? "per E-Mail"}
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </Section>

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
```

> Note: when `CONTACT_TO` is also unset, the mailto falls back to a generic label — acceptable for the pre-config state. Once env is set in Vercel, the form renders.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build` → PASS. Confirm `/kontakt` appears in the build route list.

- [ ] **Step 3: Manual smoke (dev)**

Run `npm run dev`, open `/kontakt`. Expect: scheduler placeholder (with „Termin anzeigen“ if `NEXT_PUBLIC_CAL_LINK` is set locally, else „folgt in Kürze“); below it the contact form (if Resend env set locally) or the `mailto` fallback. Consent link → `/datenschutz`. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/app/kontakt/page.tsx
git commit -m "feat: add /kontakt page (scheduler + form/mailto fallback)"
```

---

## Task 11: sitemap — add the three new routes

**Files:** Modify `src/app/sitemap.ts`; `src/app/sitemap.test.ts`

- [ ] **Step 1: Extend the failing test**

Add these cases inside the existing `describe("sitemap", …)` in `src/app/sitemap.test.ts`:
```ts
  it("includes the new Kontakt + legal routes", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}/kontakt`);
    expect(urls).toContain(`${siteUrl}/impressum`);
    expect(urls).toContain(`${siteUrl}/datenschutz`);
  });
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/app/sitemap.test.ts` → FAIL (new routes missing).

- [ ] **Step 3: Implement**

In `src/app/sitemap.ts`, update the `staticRoutes` array:
```ts
  const staticRoutes = [
    "",
    "/leistungen",
    "/ueber-mich",
    "/faq",
    "/ratgeber",
    "/kontakt",
    "/impressum",
    "/datenschutz",
  ].map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
  }));
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/app/sitemap.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat: add Kontakt + legal routes to sitemap"
```

---

## Task 12: Full regression gate

**Files:** none (verification only)

- [ ] **Step 1: Whole suite**

Run: `npm test` → all prior + new tests pass.

- [ ] **Step 2: Types + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build` → PASS. Build statically renders `/kontakt`, `/impressum`, `/datenschutz` (plus existing routes); `sitemap.xml` includes the new routes.

- [ ] **Step 3: Verify Footer links resolve**

Confirm `src/components/Footer.tsx` already links `/impressum` + `/datenschutz` (no change needed) and those pages now exist — so the footer links no longer 404.

- [ ] **Step 4: Commit (if anything adjusted)**

```bash
git commit -am "test: Phase 4a full gate green" --allow-empty
```

---

## Task 13: Docs — update CLAUDE.md + verify German quotes

**Files:** Modify `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

- Status: add a Phase 4a line (Kontakt: contact form + scheduler + legal drafts — built on `feat/phase4a-kontakt`).
- Known dead links: remove `/kontakt` (now resolves). Note Impressum/Datenschutz are live drafts pending founder/lawyer review.
- Resume: point at **Phase 4b — Newsletter** (signup + Resend Audience + double opt-in).
- Roadmap: mark Phase 4 in progress (4a done / 4b next).
- Open todos: add "set Vercel env: `RESEND_API_KEY`, `CONTACT_FROM` (verified domain), `CONTACT_TO`, `NEXT_PUBLIC_CAL_LINK`; founder/lawyer verify Impressum + Datenschutz before relying on them."

- [ ] **Step 2: Verify German typographic quotes balance**

Run:
```bash
python -c "import io;t=io.open('CLAUDE.md',encoding='utf-8').read();print('201E',t.count(chr(0x201e)),'201C',t.count(chr(0x201c)))"
```
Expected: the two counts equal. If not, fix ASCII closings to U+201C.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 4a (Kontakt) built; resume at 4b newsletter"
```

---

## Done

After Task 13, use **superpowers:finishing-a-development-branch** to merge `feat/phase4a-kontakt` into `main` (auto-deploys). Then: set the four env vars in Vercel (real Resend domain + Cal link) to switch the form/scheduler from graceful-fallback to fully live, and have the founder/lawyer verify the legal drafts. Next development phase: **4b — Newsletter**.
