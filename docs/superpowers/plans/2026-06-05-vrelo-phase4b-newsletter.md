# Vrelo Phase 4b — Newsletter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a GDPR double-opt-in newsletter signup — `/newsletter` page + Footer form → branded confirmation email (stateless HMAC token) → `/newsletter/bestaetigt` confirms and adds the contact to a Resend Audience.

**Architecture:** Pure, fully-tested core in `src/lib/newsletter.ts` (env getters, validation, HMAC token sign/verify, an `evaluateSignup` decision) plus a tiny email-template module, with thin IO at the edges: a Server Action that sends the confirm email and a `confirmSubscription` function that calls Resend's Audiences API. Everything is config-driven and degrades gracefully when env is unset (mirrors Phase 4a). No database — the signed token *is* the pending state; the email only enters the Resend Audience after a verified confirmation click.

**Tech Stack:** Next.js 16 (App Router, RSC, Server Actions) · TypeScript · Tailwind v4 (`@theme` tokens) · `resend` v6 (already installed) · Node `crypto` (built-in HMAC) · Vitest + React Testing Library.

**Spec:** [docs/superpowers/specs/2026-06-05-vrelo-phase4b-newsletter-design.md](../specs/2026-06-05-vrelo-phase4b-newsletter-design.md)

**Branch:** `feat/phase4b-newsletter` (already checked out). Commit after every task; messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## Conventions (read once)

- **Commands:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`. Single file: `npx vitest run <path>`.
- **Brand:** colors only via Tailwind `@theme` tokens ([src/app/globals.css](../../../src/app/globals.css)) — `bg-papier`, `text-tiefes-wasser`, `border-faden`, `bg-amber`, `text-stumm`, `text-ember`, etc. „Vrelo“/„Merak“ only via `<BrandWord>`. Background `papier`, never white. The **email HTML** can't use Tailwind — use inline styles with the brand hexes given in Task 5.
- **German quotes:** `„…“` = U+201E (open) + U+201C (close), never ASCII `"`. After any edit touching German copy, verify bytes (Task 15 shows the check).
- **Path alias:** `@/` → `src/`.
- **Next 16:** route `params`/`searchParams` are Promises; `useActionState` is from `react`.
- **Env in tests:** use `vi.stubEnv("NAME","value")` + `vi.unstubAllEnvs()` in `afterEach`. All env getters in `newsletter.ts` MUST read `process.env` *inside the function* so stubbing works.
- **Resend mock (Vitest v4 gotcha):** `vi.mock("resend")` MUST use a constructable `function`/`class` (an arrow implementation is not a constructor and `new Resend()` throws). Copy the pattern from `src/app/kontakt/actions.test.ts`.
- **DRY:** reuse `isHoneypotTripped`, `isTooFast`, `MIN_FILL_MS` from `src/lib/contact.ts`.
- **Secrets:** only `.env.example` (empty placeholders) is committed. Real values live in Vercel.

## File overview

**Create — lib / email**
- `src/lib/newsletter.ts` — env getters (`newsletterSecret`, `newsletterAudienceId`), `isNewsletterConfigured`, `isValidNewsletterEmail`, `validateNewsletterSignup`, `signToken`, `verifyToken`, `TOKEN_TTL_MS`, `evaluateSignup`, and the `NewsletterFields`/`NewsletterErrors`/`SignupDecision`/`VerifyResult` types.
- `src/lib/email/newsletter-confirm.ts` — `buildConfirmEmail({ confirmUrl })` → `{ subject, html, text }`.

**Create — actions / server**
- `src/app/newsletter/actions.ts` — `subscribeToNewsletter` Server Action + `NewsletterState`/`NewsletterValues` types.
- `src/app/newsletter/confirm.ts` — `confirmSubscription(token)` (Resend Audiences) + `ConfirmResultData` type.

**Create — components / routes**
- `src/components/newsletter/NewsletterForm.tsx` (client) — email + consent + honeypot, `compact` prop.
- `src/components/newsletter/ConfirmResult.tsx` — presentational success/error block.
- `src/app/newsletter/page.tsx`, `src/app/newsletter/bestaetigt/page.tsx`.

**Modify**
- `src/components/Footer.tsx` — replace the Newsletter placeholder slot with `<NewsletterForm compact />`.
- `src/lib/legal/datenschutz.ts` — fill the „Newsletter“ section.
- `src/app/sitemap.ts` — add `/newsletter`.
- `.env.example` — add `NEWSLETTER_SECRET`, `NEWSLETTER_AUDIENCE_ID`.
- `CLAUDE.md` — status/roadmap (final task).

**No new npm dependency** — `resend` is installed; HMAC uses Node's built-in `crypto`.

---

## Task 1: .env.example — add newsletter vars

**Files:** Modify `.env.example`

- [ ] **Step 1: Append to `.env.example`**

Add these lines at the end:
```bash

# Newsletter (Phase 4b) — double opt-in
# Long random string used to sign the confirmation token (server-only)
NEWSLETTER_SECRET=
# Resend Audience id that confirmed subscribers are added to (server-only)
NEWSLETTER_AUDIENCE_ID=
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: document newsletter env vars (NEWSLETTER_SECRET, NEWSLETTER_AUDIENCE_ID)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: newsletter.ts — env getters + validation

**Files:** Create `src/lib/newsletter.ts`; Test `src/lib/newsletter.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/newsletter.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  newsletterSecret,
  newsletterAudienceId,
  isNewsletterConfigured,
  isValidNewsletterEmail,
  validateNewsletterSignup,
} from "./newsletter";

afterEach(() => vi.unstubAllEnvs());

describe("newsletter env", () => {
  it("reads process.env at call time", () => {
    vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
    vi.stubEnv("NEWSLETTER_AUDIENCE_ID", "aud_1");
    expect(newsletterSecret()).toBe("s3cret");
    expect(newsletterAudienceId()).toBe("aud_1");
  });

  it("isNewsletterConfigured needs key+from+secret+audience", () => {
    expect(isNewsletterConfigured()).toBe(false);
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
    vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
    expect(isNewsletterConfigured()).toBe(false);
    vi.stubEnv("NEWSLETTER_AUDIENCE_ID", "aud_1");
    expect(isNewsletterConfigured()).toBe(true);
  });
});

describe("newsletter validation", () => {
  it("isValidNewsletterEmail accepts good, rejects bad", () => {
    expect(isValidNewsletterEmail("a@b.de")).toBe(true);
    expect(isValidNewsletterEmail("nope")).toBe(false);
    expect(isValidNewsletterEmail("  ")).toBe(false);
  });

  it("validateNewsletterSignup flags bad email and missing consent", () => {
    expect(validateNewsletterSignup({ email: "a@b.de", consent: true })).toEqual({});
    const e = validateNewsletterSignup({ email: "nope", consent: false });
    expect(e.email).toBeTruthy();
    expect(e.consent).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/newsletter.test.ts` → FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
// src/lib/newsletter.ts
import { resendKey, contactFrom } from "./contact";

export function newsletterSecret(): string | undefined {
  return process.env.NEWSLETTER_SECRET;
}
export function newsletterAudienceId(): string | undefined {
  return process.env.NEWSLETTER_AUDIENCE_ID;
}

export function isNewsletterConfigured(): boolean {
  return Boolean(resendKey() && contactFrom() && newsletterSecret() && newsletterAudienceId());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidNewsletterEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export type NewsletterErrors = Partial<Record<"email" | "consent", string>>;

export function validateNewsletterSignup(f: { email: string; consent: boolean }): NewsletterErrors {
  const errors: NewsletterErrors = {};
  if (!isValidNewsletterEmail(f.email)) errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  if (!f.consent) errors.consent = "Bitte stimme der Datenschutzerklärung zu.";
  return errors;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/newsletter.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/newsletter.ts src/lib/newsletter.test.ts
git commit -m "feat: add newsletter env getters + validation" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: newsletter.ts — HMAC token sign/verify

**Files:** Modify `src/lib/newsletter.ts`; Test `src/lib/newsletter.token.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/newsletter.token.test.ts
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { signToken, verifyToken, TOKEN_TTL_MS } from "./newsletter";

beforeEach(() => vi.stubEnv("NEWSLETTER_SECRET", "s3cret"));
afterEach(() => vi.unstubAllEnvs());

describe("token sign/verify", () => {
  const now = 1_000_000;

  it("round-trips: a freshly signed token verifies and yields the email", () => {
    const t = signToken("a@b.de", now);
    const r = verifyToken(t, now + 1000);
    expect(r).toEqual({ ok: true, email: "a@b.de" });
  });

  it("rejects a tampered signature", () => {
    const t = signToken("a@b.de", now);
    const tampered = t.slice(0, -1) + (t.endsWith("A") ? "B" : "A");
    expect(verifyToken(tampered, now).ok).toBe(false);
  });

  it("rejects a tampered payload (different email, same signature)", () => {
    const t = signToken("a@b.de", now);
    const sig = t.split(".")[1];
    const forgedPayload = Buffer.from(JSON.stringify({ email: "evil@x.de", iat: now })).toString("base64url");
    const r = verifyToken(`${forgedPayload}.${sig}`, now);
    expect(r.ok).toBe(false);
  });

  it("rejects an expired token", () => {
    const t = signToken("a@b.de", now);
    const r = verifyToken(t, now + TOKEN_TTL_MS + 1);
    expect(r).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects when signed with a different secret", () => {
    const t = signToken("a@b.de", now);
    vi.stubEnv("NEWSLETTER_SECRET", "different");
    expect(verifyToken(t, now).ok).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(verifyToken("garbage", now).ok).toBe(false);
    expect(verifyToken("a.b.c", now).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/newsletter.token.test.ts` → FAIL.

- [ ] **Step 3: Implement (append to `src/lib/newsletter.ts`)**

```ts
import { createHmac, timingSafeEqual } from "crypto";

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" };

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function signToken(email: string, now: number): string {
  const payloadB64 = Buffer.from(JSON.stringify({ email, iat: now })).toString("base64url");
  return `${payloadB64}.${sign(payloadB64, newsletterSecret()!)}`;
}

export function verifyToken(token: string, now: number): VerifyResult {
  const secret = newsletterSecret();
  if (!secret) return { ok: false, reason: "invalid" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid" };
  const [payloadB64, sig] = parts;
  const expected = sign(payloadB64, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, reason: "invalid" };
  }
  let payload: { email?: unknown; iat?: unknown };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (typeof payload.email !== "string" || typeof payload.iat !== "number") {
    return { ok: false, reason: "invalid" };
  }
  if (now - payload.iat > TOKEN_TTL_MS) return { ok: false, reason: "expired" };
  return { ok: true, email: payload.email };
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/newsletter.token.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/newsletter.ts src/lib/newsletter.token.test.ts
git commit -m "feat: add HMAC-signed double-opt-in token sign/verify" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: newsletter.ts — evaluateSignup decision

**Files:** Modify `src/lib/newsletter.ts`; Test `src/lib/newsletter.evaluate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/newsletter.evaluate.test.ts
import { describe, it, expect } from "vitest";
import { evaluateSignup, type NewsletterFields } from "./newsletter";
import { MIN_FILL_MS } from "./contact";

const base: NewsletterFields = { email: "a@b.de", consent: true, honeypot: "", renderedAt: 0 };

describe("evaluateSignup", () => {
  const now = 1_000_000 + MIN_FILL_MS + 1;

  it("drops when honeypot filled", () => {
    expect(evaluateSignup({ ...base, honeypot: "x" }, now)).toEqual({ action: "drop" });
  });
  it("rejects when too fast", () => {
    expect(evaluateSignup({ ...base, renderedAt: now }, now + 10).action).toBe("reject");
  });
  it("invalid for bad email / missing consent", () => {
    const r = evaluateSignup({ ...base, email: "nope", consent: false }, now);
    expect(r.action).toBe("invalid");
    if (r.action === "invalid") {
      expect(r.errors.email).toBeTruthy();
      expect(r.errors.consent).toBeTruthy();
    }
  });
  it("send with the trimmed email for a clean signup", () => {
    const r = evaluateSignup({ ...base, email: " a@b.de " }, now);
    expect(r).toEqual({ action: "send", email: "a@b.de" });
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/newsletter.evaluate.test.ts` → FAIL.

- [ ] **Step 3: Implement (append to `src/lib/newsletter.ts`)**

```ts
import { isHoneypotTripped, isTooFast } from "./contact";

export type NewsletterFields = {
  email: string;
  consent: boolean;
  honeypot: string;
  renderedAt: number;
};

export type SignupDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; errors: NewsletterErrors }
  | { action: "send"; email: string };

export function evaluateSignup(f: NewsletterFields, now: number): SignupDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const errors = validateNewsletterSignup(f);
  if (Object.keys(errors).length > 0) return { action: "invalid", errors };
  return { action: "send", email: f.email.trim() };
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/newsletter.evaluate.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/newsletter.ts src/lib/newsletter.evaluate.test.ts
git commit -m "feat: add evaluateSignup decision (spam + validation)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: email/newsletter-confirm.ts — buildConfirmEmail

**Files:** Create `src/lib/email/newsletter-confirm.ts`; Test `src/lib/email/newsletter-confirm.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/email/newsletter-confirm.test.ts
import { describe, it, expect } from "vitest";
import { buildConfirmEmail } from "./newsletter-confirm";

describe("buildConfirmEmail", () => {
  const url = "https://vrelo-website.vercel.app/newsletter/bestaetigt?token=abc.def";

  it("has a German subject and includes the confirm URL in both html and text", () => {
    const e = buildConfirmEmail({ confirmUrl: url });
    expect(e.subject).toMatch(/bestätige/i);
    expect(e.text).toContain(url);
    expect(e.html).toContain(`href="${url}"`);
    expect(e.text).toMatch(/ignorier/i); // "ignore if you didn't sign up"
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/email/newsletter-confirm.test.ts` → FAIL.

- [ ] **Step 3: Implement**

> Email clients can't use Tailwind — inline styles only. Brand hexes: papier `#f4efe6`, tinte `#14181b`, tiefes-wasser `#0a2538`, amber `#d4a24c`, vrelo-petrol `#1b5063`, stumm `#7a7468`.

```ts
// src/lib/email/newsletter-confirm.ts
export type ConfirmEmail = { subject: string; html: string; text: string };

export function buildConfirmEmail({ confirmUrl }: { confirmUrl: string }): ConfirmEmail {
  const subject = "Bitte bestätige deine Newsletter-Anmeldung";

  const text = [
    "Fast geschafft!",
    "",
    "Bitte bestätige deine Anmeldung zum Vrelo-Newsletter:",
    confirmUrl,
    "",
    "Wenn du dich nicht angemeldet hast, ignorier diese E-Mail einfach.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b">
    <div style="max-width:480px;margin:0 auto">
      <h1 style="font-family:Georgia,'Times New Roman',serif;color:#0a2538;font-size:22px;margin:0 0 12px">Fast geschafft</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px">Bitte bestätige deine Anmeldung zum Vrelo-Newsletter.</p>
      <a href="${confirmUrl}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:8px">Anmeldung bestätigen</a>
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:20px 0 0">Oder kopier diesen Link in deinen Browser:<br><a href="${confirmUrl}" style="color:#1b5063">${confirmUrl}</a></p>
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:16px 0 0">Wenn du dich nicht angemeldet hast, ignorier diese E-Mail einfach.</p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/email/newsletter-confirm.test.ts` → PASS.

> German-quote note: this module has no „…“ quotes (the apostrophe-free copy is intentional). If you add any German typographic quotes later, verify bytes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/email/newsletter-confirm.ts src/lib/email/newsletter-confirm.test.ts
git commit -m "feat: add branded double-opt-in confirmation email template" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Server Action — subscribeToNewsletter

**Files:** Create `src/app/newsletter/actions.ts`; Test `src/app/newsletter/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/app/newsletter/actions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  // constructable function — arrow impls are not constructors under Vitest v4
  Resend: vi.fn(function (this: { emails: { send: typeof send } }) {
    this.emails = { send };
  }),
}));

import { subscribeToNewsletter, type NewsletterState } from "./actions";
import { verifyToken } from "@/lib/newsletter";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const initial: NewsletterState = { status: "idle" };
const good = { email: "a@b.de", consent: "on", website: "", renderedAt: "0" };

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
  vi.stubEnv("NEWSLETTER_AUDIENCE_ID", "aud_1");
});
afterEach(() => vi.unstubAllEnvs());

describe("subscribeToNewsletter", () => {
  it("sends a confirm email to the subscriber with a verifiable token", async () => {
    const r = await subscribeToNewsletter(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("a@b.de");
    expect(arg.from).toBe("Vrelo <kontakt@example.de>");
    const m = String(arg.text).match(/token=([^\s]+)/);
    expect(m).not.toBeNull();
    const token = decodeURIComponent(m![1]);
    const v = verifyToken(token, Date.now());
    expect(v).toEqual({ ok: true, email: "a@b.de" });
  });

  it("silently succeeds without sending when honeypot filled", async () => {
    const r = await subscribeToNewsletter(initial, fd({ ...good, website: "spam" }));
    expect(r.status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns invalid with field errors and does not send", async () => {
    const r = await subscribeToNewsletter(initial, fd({ ...good, email: "nope" }));
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(r.errors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when Resend resolves with an error object", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "x", message: "bad" } });
    const r = await subscribeToNewsletter(initial, fd(good));
    expect(r.status).toBe("error");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/app/newsletter/actions.test.ts` → FAIL.

- [ ] **Step 3: Implement**

```ts
// src/app/newsletter/actions.ts
"use server";

import { Resend } from "resend";
import { siteUrl } from "@/lib/site";
import {
  evaluateSignup,
  isNewsletterConfigured,
  signToken,
  type NewsletterErrors,
  type NewsletterFields,
} from "@/lib/newsletter";
import { contactFrom, resendKey } from "@/lib/contact";
import { buildConfirmEmail } from "@/lib/email/newsletter-confirm";

export type NewsletterValues = { email: string };

export type NewsletterState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; values?: NewsletterValues }
  | { status: "invalid"; errors: NewsletterErrors; values: NewsletterValues };

function parse(formData: FormData): NewsletterFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    email: get("email"),
    consent: formData.get("consent") != null,
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
  };
}

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Versuch es bitte später noch einmal.";

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const fields = parse(formData);
  const values: NewsletterValues = { email: fields.email };
  const decision = evaluateSignup(fields, Date.now());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message, values };
  if (decision.action === "invalid") return { status: "invalid", errors: decision.errors, values };

  if (!isNewsletterConfigured()) {
    return { status: "error", message: "Der Newsletter ist gerade nicht verfügbar.", values };
  }

  const token = signToken(decision.email, Date.now());
  const confirmUrl = `${siteUrl}/newsletter/bestaetigt?token=${encodeURIComponent(token)}`;
  const mail = buildConfirmEmail({ confirmUrl });

  try {
    const resend = new Resend(resendKey());
    const { error } = await resend.emails.send({
      from: contactFrom()!,
      to: decision.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    if (error) return { status: "error", message: GENERIC_ERROR, values };
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR, values };
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/app/newsletter/actions.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/newsletter/actions.ts src/app/newsletter/actions.test.ts
git commit -m "feat: add subscribeToNewsletter Server Action (signed token + confirm email)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: confirm.ts — confirmSubscription (Resend Audiences)

**Files:** Create `src/app/newsletter/confirm.ts`; Test `src/app/newsletter/confirm.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/app/newsletter/confirm.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const create = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(function (this: { contacts: { create: typeof create } }) {
    this.contacts = { create };
  }),
}));

import { confirmSubscription } from "./confirm";
import { signToken } from "@/lib/newsletter";

beforeEach(() => {
  create.mockReset().mockResolvedValue({ data: { id: "c1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
  vi.stubEnv("NEWSLETTER_AUDIENCE_ID", "aud_1");
});
afterEach(() => vi.unstubAllEnvs());

describe("confirmSubscription", () => {
  it("adds the contact to the Resend audience for a valid token", async () => {
    const token = signToken("a@b.de", Date.now());
    const r = await confirmSubscription(token);
    expect(r.status).toBe("ok");
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toEqual({
      audienceId: "aud_1",
      email: "a@b.de",
      unsubscribed: false,
    });
  });

  it("returns invalid for a bad/expired token and does not call Resend", async () => {
    const r = await confirmSubscription("garbage");
    expect(r.status).toBe("invalid");
    expect(create).not.toHaveBeenCalled();
  });

  it("returns error when Resend resolves with an error object", async () => {
    create.mockResolvedValueOnce({ data: null, error: { name: "x", message: "bad" } });
    const token = signToken("a@b.de", Date.now());
    const r = await confirmSubscription(token);
    expect(r.status).toBe("error");
  });

  it("returns error when not configured", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEWSLETTER_SECRET", "s3cret"); // token verifies, but audience/key missing
    const token = signToken("a@b.de", Date.now());
    const r = await confirmSubscription(token);
    expect(r.status).toBe("error");
    expect(create).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/app/newsletter/confirm.test.ts` → FAIL.

- [ ] **Step 3: Implement**

```ts
// src/app/newsletter/confirm.ts
import { Resend } from "resend";
import {
  isNewsletterConfigured,
  newsletterAudienceId,
  verifyToken,
} from "@/lib/newsletter";
import { resendKey } from "@/lib/contact";

export type ConfirmResultData =
  | { status: "ok" }
  | { status: "invalid" }
  | { status: "error" };

export async function confirmSubscription(token: string): Promise<ConfirmResultData> {
  const verified = verifyToken(token, Date.now());
  if (!verified.ok) return { status: "invalid" };
  if (!isNewsletterConfigured()) return { status: "error" };

  try {
    const resend = new Resend(resendKey());
    const { error } = await resend.contacts.create({
      audienceId: newsletterAudienceId()!,
      email: verified.email,
      unsubscribed: false,
    });
    if (error) return { status: "error" };
    return { status: "ok" };
  } catch {
    return { status: "error" };
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/app/newsletter/confirm.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/newsletter/confirm.ts src/app/newsletter/confirm.test.ts
git commit -m "feat: add confirmSubscription (verify token + Resend Audience add)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: NewsletterForm component

**Files:** Create `src/components/newsletter/NewsletterForm.tsx`; Test `src/components/newsletter/NewsletterForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/newsletter/NewsletterForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsletterForm } from "./NewsletterForm";

describe("NewsletterForm", () => {
  it("renders an email field, a consent link to /datenschutz, and a submit button", () => {
    render(<NewsletterForm />);
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Datenschutz/i });
    expect(link).toHaveAttribute("href", "/datenschutz");
    expect(screen.getByRole("button", { name: /Anmelden/i })).toBeInTheDocument();
  });

  it("has a visually-hidden honeypot hidden from assistive tech", () => {
    const { container } = render(<NewsletterForm />);
    const hp = container.querySelector('input[name="website"]');
    expect(hp).not.toBeNull();
    expect(hp).toHaveAttribute("tabindex", "-1");
    expect(hp).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a compact variant", () => {
    const { container } = render(<NewsletterForm compact />);
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/components/newsletter/NewsletterForm.test.tsx` → FAIL.

- [ ] **Step 3: Implement**

> `compact` is used in the dark Footer; default is the light `/newsletter` page. Both post to the same action. Keep colors as tokens.

```tsx
// src/components/newsletter/NewsletterForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/newsletter/actions";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initial);
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "ok") {
    return (
      <p className={compact ? "text-sm text-gletscher" : "font-serif text-xl text-ember"}>
        Fast geschafft — schau in dein Postfach und bestätige deine Anmeldung.
      </p>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "invalid" || state.status === "error" ? state.values : undefined;
  const labelClass = compact ? "text-sm text-gletscher" : "text-sm font-medium text-tiefes-wasser";
  const consentClass = compact ? "text-xs text-stein" : "text-sm text-tinte";
  const inputClass =
    "mt-1 w-full rounded-md border border-faden bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber";

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="nl-email" className={labelClass}>E-Mail</label>
        <input id="nl-email" name="email" type="email" className={inputClass} defaultValue={values?.email}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "nl-email-err" : undefined} />
        {errors.email && <p id="nl-email-err" className="mt-1 text-sm text-ember">{errors.email}</p>}
      </div>

      <label className={`flex items-start gap-2 ${consentClass}`}>
        <input type="checkbox" name="consent" className="mt-1"
          aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "nl-consent-err" : undefined} />
        <span>
          Ich möchte den Newsletter erhalten und habe die{" "}
          <Link href="/datenschutz" className="underline underline-offset-2">Datenschutzerklärung</Link> gelesen.
        </span>
      </label>
      {errors.consent && <p id="nl-consent-err" className="text-sm text-ember">{errors.consent}</p>}

      {state.status === "error" && <p className="text-sm text-ember">{state.message}</p>}

      <button type="submit" disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-amber">
        {pending ? "Wird gesendet …" : "Anmelden"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/components/newsletter/NewsletterForm.test.tsx` → PASS. Then `npx tsc --noEmit && npm run lint` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/newsletter/NewsletterForm.tsx src/components/newsletter/NewsletterForm.test.tsx
git commit -m "feat: add NewsletterForm (email + consent + honeypot, compact variant)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: ConfirmResult component

**Files:** Create `src/components/newsletter/ConfirmResult.tsx`; Test `src/components/newsletter/ConfirmResult.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/newsletter/ConfirmResult.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmResult } from "./ConfirmResult";

describe("ConfirmResult", () => {
  it("shows a success message for ok", () => {
    render(<ConfirmResult status="ok" />);
    expect(screen.getByText(/Bestätigt/i)).toBeInTheDocument();
  });
  it("shows a calm error + link back for invalid", () => {
    render(<ConfirmResult status="invalid" />);
    expect(screen.getByText(/ungültig oder abgelaufen/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Newsletter/i })).toHaveAttribute("href", "/newsletter");
  });
  it("shows a generic error for error", () => {
    render(<ConfirmResult status="error" />);
    expect(screen.getByText(/schiefgelaufen/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/components/newsletter/ConfirmResult.test.tsx` → FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/components/newsletter/ConfirmResult.tsx
import Link from "next/link";
import type { ConfirmResultData } from "@/app/newsletter/confirm";

export function ConfirmResult({ status }: { status: ConfirmResultData["status"] }) {
  if (status === "ok") {
    return (
      <p className="font-serif text-2xl text-ember">Bestätigt — danke! Du bist dabei.</p>
    );
  }
  if (status === "invalid") {
    return (
      <div className="space-y-3">
        <p className="text-tinte">Dieser Link ist ungültig oder abgelaufen.</p>
        <Link href="/newsletter" className="text-vrelo-petrol underline underline-offset-2">
          Zur Newsletter-Anmeldung
        </Link>
      </div>
    );
  }
  return (
    <p className="text-tinte">Da ist etwas schiefgelaufen. Versuch es bitte später noch einmal.</p>
  );
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/components/newsletter/ConfirmResult.test.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/newsletter/ConfirmResult.tsx src/components/newsletter/ConfirmResult.test.tsx
git commit -m "feat: add ConfirmResult presentational component" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: /newsletter page

**Files:** Create `src/app/newsletter/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/app/newsletter/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { isNewsletterConfigured } from "@/lib/newsletter";
import { breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Praktische Automatisierungs-Ideen mit KI — ruhig erklärt. Melde dich für den Vrelo-Newsletter an.",
};

export default function NewsletterPage() {
  const configured = isNewsletterConfigured();
  return (
    <>
      <PageIntro
        eyebrow="Newsletter"
        title="Automatisierungs-Ideen, ruhig erklärt."
        lead="Ab und zu eine praktische Idee, wie du mit KI Zeit zurückgewinnst — ohne Hype, ohne Spam. Jederzeit abbestellbar."
      />
      <Section tone="paper">
        <div className="mx-auto max-w-xl">
          {configured ? (
            <NewsletterForm />
          ) : (
            <p className="text-tinte">Der Newsletter ist bald verfügbar.</p>
          )}
        </div>
      </Section>
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Newsletter", path: "/newsletter" }])} />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint` → PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/newsletter/page.tsx
git commit -m "feat: add /newsletter signup page (form or graceful fallback)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: /newsletter/bestaetigt page

**Files:** Create `src/app/newsletter/bestaetigt/page.tsx`

- [ ] **Step 1: Implement**

> Server component. `searchParams` is a Promise in Next 16. Runs `confirmSubscription` (a side-effecting GET — fine for double-opt-in links; see spec §10) and renders `ConfirmResult`.

```tsx
// src/app/newsletter/bestaetigt/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ConfirmResult } from "@/components/newsletter/ConfirmResult";
import { confirmSubscription } from "@/app/newsletter/confirm";

export const metadata: Metadata = {
  title: "Newsletter bestätigen",
  description: "Bestätigung deiner Newsletter-Anmeldung.",
  robots: { index: false },
};

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await confirmSubscription(token) : { status: "invalid" as const };
  return (
    <>
      <PageIntro eyebrow="Newsletter" title="Anmeldung bestätigen" lead="" />
      <Section tone="paper">
        <div className="mx-auto max-w-xl">
          <ConfirmResult status={result.status} />
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build` → PASS. In the build route list `/newsletter/bestaetigt` is **dynamic** (`ƒ`) because it reads `searchParams`; `/newsletter` is static (`○`).

- [ ] **Step 3: Commit**

```bash
git add src/app/newsletter/bestaetigt/page.tsx
git commit -m "feat: add /newsletter/bestaetigt confirmation page" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: Footer — replace placeholder with the compact form

**Files:** Modify `src/components/Footer.tsx`

- [ ] **Step 1: Replace the placeholder slot**

In `src/components/Footer.tsx`, add the import at the top (after the existing imports):
```tsx
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
```

Replace this block:
```tsx
        {/* Newsletter signup is added in Phase 4; placeholder slot for now */}
        <div className="text-sm text-stein">
          <p className="mb-2 text-gletscher">Newsletter</p>
          <p>Automatisierungs-Ideen mit KI — ruhig erklärt. (bald verfügbar)</p>
        </div>
```
with:
```tsx
        <div className="text-sm text-stein">
          <p className="mb-2 text-gletscher">Newsletter</p>
          <p className="mb-3">Automatisierungs-Ideen mit KI — ruhig erklärt.</p>
          <NewsletterForm compact />
        </div>
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint && npx vitest run src/components/ClosingCta.test.tsx` → PASS (Footer has no test of its own; ClosingCta test referenced "newsletter" — confirm it still passes).

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: wire the compact NewsletterForm into the Footer" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Datenschutz — fill the Newsletter section

**Files:** Modify `src/lib/legal/datenschutz.ts`; Modify `src/lib/legal/legal.test.ts`

- [ ] **Step 1: Extend the failing test**

Add a new case inside the existing `describe("legal content", …)` in `src/lib/legal/legal.test.ts`:
```ts
  it("datenschutz Newsletter section describes double opt-in, Resend and Widerruf (no placeholder)", () => {
    const nl = datenschutz.sections.find((s) => /Newsletter/i.test(s.heading));
    expect(nl).toBeDefined();
    expect(nl!.body).not.toContain("[Platzhalter");
    expect(nl!.body).toMatch(/Double-Opt-In|Bestätigung/i);
    expect(nl!.body).toMatch(/Resend/);
    expect(nl!.body).toMatch(/Widerruf|abbestellen|Abmeldelink/i);
  });
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/legal/legal.test.ts` → FAIL (body still the placeholder).

- [ ] **Step 3: Implement**

In `src/lib/legal/datenschutz.ts`, replace the Newsletter section body:
```ts
    {
      heading: "Newsletter",
      body: "[Platzhalter: wird mit dem Newsletter ergänzt.]",
    },
```
with:
```ts
    {
      heading: "Newsletter",
      body: "Du kannst dich für meinen Newsletter anmelden. Dabei verarbeite ich deine E-Mail-Adresse, um dir die Inhalte zuzusenden. Die Anmeldung erfolgt im Double-Opt-In-Verfahren: Nach der Eingabe erhältst du eine E-Mail mit einem Bestätigungslink; erst nach deiner Bestätigung wird deine Adresse in die Empfängerliste aufgenommen. Vorher wird nichts gespeichert. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Der Versand und die Verwaltung der Empfängerliste erfolgen über den Dienstleister Resend (Auftragsverarbeiter). Du kannst deine Einwilligung jederzeit widerrufen — über den Abmeldelink in jeder Newsletter-E-Mail. Danach wird deine Adresse aus der Empfängerliste entfernt.",
    },
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/legal/legal.test.ts` → PASS.

> German-quote note: this body uses no „…“ quotes (the em dash „—“ is U+2014 and fine). Verify bytes in Task 15.

- [ ] **Step 5: Commit**

```bash
git add src/lib/legal/datenschutz.ts src/lib/legal/legal.test.ts
git commit -m "content: fill the Datenschutz Newsletter section (double opt-in)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: sitemap — add /newsletter

**Files:** Modify `src/app/sitemap.ts`; Modify `src/app/sitemap.test.ts`

- [ ] **Step 1: Extend the failing test**

Add a case inside the existing `describe("sitemap", …)` in `src/app/sitemap.test.ts`:
```ts
  it("includes /newsletter but not the transactional confirm route", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}/newsletter`);
    expect(urls).not.toContain(`${siteUrl}/newsletter/bestaetigt`);
  });
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/app/sitemap.test.ts` → FAIL.

- [ ] **Step 3: Implement**

In `src/app/sitemap.ts`, add `"/newsletter"` to the `staticRoutes` array (after `"/datenschutz"`):
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
    "/newsletter",
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
git commit -m "feat: add /newsletter to sitemap" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 15: Full gate + docs

**Files:** Modify `CLAUDE.md`

- [ ] **Step 1: Whole suite + types + lint + build**

Run: `npm test` → all pass. `npx tsc --noEmit && npm run lint && npm run build` → PASS. Build shows `/newsletter` static (`○`) and `/newsletter/bestaetigt` dynamic (`ƒ`).

- [ ] **Step 2: Update CLAUDE.md**

- Status: mark Phase 4b built (newsletter signup + double opt-in + Resend Audience) on `feat/phase4b-newsletter`.
- Resume: point at finishing-a-development-branch → merge, then Phase 5.
- Roadmap: mark Phase 4 done (4a + 4b), Phase 5 next.
- Keep the existing Phase 4b go-live / Resend setup owner todos.

- [ ] **Step 3: Verify German typographic quotes balance**

Run:
```bash
python -c "import io;t=io.open('CLAUDE.md',encoding='utf-8').read();print('201E',t.count(chr(0x201e)),'201C',t.count(chr(0x201c)))"
```
The two counts should be equal except for the single intentional counter-example on the „German typographic quotes“ key-decisions line (i.e. 201C is exactly one greater). If any *other* imbalance appears, fix ASCII closings to U+201C.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 4b (newsletter) built; resume at merge then Phase 5" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Done

After Task 15, use **superpowers:finishing-a-development-branch** to merge `feat/phase4b-newsletter` into `main` (auto-deploys). Then the owner sets `NEWSLETTER_SECRET` + `NEWSLETTER_AUDIENCE_ID` (and verifies the Resend sending domain) in Vercel to flip the newsletter from graceful-fallback to live, creates the Resend Audience, and composes issues via Resend Broadcasts (see CLAUDE.md todos). Next development phase: **Phase 5 — Legal & polish + custom domain**.
