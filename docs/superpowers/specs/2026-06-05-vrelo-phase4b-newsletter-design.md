# Vrelo Phase 4b — Newsletter (signup + double opt-in) · Design Spec

> Date: 2026-06-05 · Branch: `feat/phase4b-newsletter`
> Builds on: [Phase 4a Kontakt spec](2026-06-05-vrelo-phase4a-kontakt-design.md) · [main design spec](2026-06-01-vrelo-website-design.md) · [Brand.md](../../../Brand.md) · [CLAUDE.md](../../../CLAUDE.md)
> Client-facing copy is **German**; code/comments **English**. German quotes: „…“ = U+201E + U+201C.

## 1. Goal

Ship the **secondary conversion path**: a GDPR-compliant newsletter signup with **double opt-in**, building on the Phase 4a Resend foundation. A visitor enters their email on `/newsletter` (or the Footer), receives a confirmation email, and only becomes a stored subscriber after they click the confirmation link. Fill the Datenschutzerklärung „Newsletter“ placeholder section so the flow is lawful.

Phase 4b builds the **collection pipeline only** (signup → double opt-in → contact lands in a Resend Audience). Composing and sending newsletter issues is done later via **Resend Broadcasts** (dashboard/API) and is explicitly out of scope here (see §8).

## 2. Decisions (locked in brainstorming)

| # | Decision |
|---|---|
| D1 | **Stateless HMAC-signed token double opt-in.** No database/KV. The token *is* the pending state; nothing is stored before confirmation. The email enters the Resend Audience only after a verified confirmation click. |
| D2 | **Dedicated `/newsletter` page + compact Footer form**, both posting to the same Server Action. |
| D3 | **Branded HTML + plain-text confirmation email** built as a typed template module. |
| D4 | **No welcome email** (YAGNI). The `/newsletter/bestaetigt` success page is the confirmation. |
| D5 | **Config-driven, graceful when unconfigured** (mirrors 4a): env absent → form shows a calm „bald verfügbar“ note, no fake submit; the action also guards. |
| D6 | **Spam: honeypot + time-trap**, reusing `isHoneypotTripped`/`isTooFast` from `src/lib/contact.ts`. No external store, no cookies. |
| D7 | **Privacy:** the post-signup message is always identical („schau in dein Postfach“) — never reveal whether an address is already subscribed. |
| D8 | New env: `NEWSLETTER_SECRET` (HMAC secret), `NEWSLETTER_AUDIENCE_ID` (Resend Audience id). Reuses `RESEND_API_KEY` + `CONTACT_FROM` from 4a. Documented in `.env.example`. |

## 3. Where the emails are stored & how subscribers receive the newsletter

This is the part that lives **outside our codebase** — documented here so it's clear for later.

| Stage | Where the email lives |
|---|---|
| After signup, **before** confirmation | **Nowhere on our side.** The email exists only inside the signed token embedded in the confirmation link — i.e. in the subscriber's own inbox. The server stores nothing (no DB, no file, no KV). If they never click, it is never recorded anywhere. |
| After they click & **confirm** | The email is written into a **Resend Audience** via `contacts.create({ audienceId: NEWSLETTER_AUDIENCE_ID, email, unsubscribed: false })`. |

**The Resend Audience is the stored subscriber list** — fully hosted by Resend, managed in the Resend dashboard under *Audiences*. Our code's only job is to add confirmed contacts to it.

**How subscribers later receive the newsletter:** via **Resend Broadcasts** (Resend's campaign sender). You compose a newsletter once, target the Audience, and send — from the Resend dashboard or the Broadcasts API. Every Broadcast automatically includes a **managed unsubscribe link**; clicking it flips that contact's `unsubscribed` flag in the Audience, dropping them from future sends with no code on our side.

End-to-end:
```
/newsletter form → confirm email (signed token) → click → Resend Audience (stored)
                                                              │
                                      you compose a Resend Broadcast → sent to the Audience
                                                              │
                                              managed unsubscribe link → flips unsubscribed flag
```

## 4. Routes

| Route | File | Purpose |
|---|---|---|
| `/newsletter` | `src/app/newsletter/page.tsx` | Signup hub: PageIntro → NewsletterForm (or „bald verfügbar“ when unconfigured). Emits breadcrumb JSON-LD + metadata. Static shell with a client island. |
| `/newsletter/bestaetigt` | `src/app/newsletter/bestaetigt/page.tsx` | Confirmation handler: reads `?token`, verifies, adds to the Audience, renders success/error. **Dynamic** (reads `searchParams`). |

## 5. The token (stateless double opt-in)

- **Format:** `base64url(payload).signature`, where `payload = JSON.stringify({ email, iat })` (`iat` = issued-at ms) and `signature = base64url(HMAC-SHA256(payloadB64, NEWSLETTER_SECRET))`.
- **`signToken(email, now)`** → token string.
- **`verifyToken(token, now)`** → `{ ok: true; email } | { ok: false; reason: "invalid" | "expired" }`. Recomputes the HMAC (constant-time compare), rejects tampered signatures, rejects when `now - iat > TOKEN_TTL_MS`.
- **`TOKEN_TTL_MS = 24h`.**
- Uses Node's built-in `crypto` (`createHmac`, `timingSafeEqual`) — no new dependency. Server-only module.

## 6. Components, lib, files

**Create — lib (pure, tested)**
- `src/lib/newsletter.ts` — env getters (`newsletterSecret`, `newsletterAudienceId`), `isNewsletterConfigured()` (= `resendKey() && contactFrom() && newsletterSecret() && newsletterAudienceId()`), `validateNewsletterEmail`, `signToken`/`verifyToken`, `TOKEN_TTL_MS`, `evaluateSignup(fields, now)` → `drop | reject | invalid | send` (reuses `isHoneypotTripped`/`isTooFast` from `contact.ts`).
- `src/lib/email/newsletter-confirm.ts` — `buildConfirmEmail({ confirmUrl })` → `{ subject, html, text }`. Branded but minimal: Papier background, Fraunces heading, amber confirm button, the raw URL as fallback, and a line that the email can be ignored if they didn't sign up. Plain-text alternative for deliverability.

**Create — actions / server**
- `src/app/newsletter/actions.ts` — `subscribeToNewsletter(prev, formData)` Server Action: parse → `evaluateSignup` → on `send` build token + absolute confirm URL (`${siteUrl}/newsletter/bestaetigt?token=…`) → Resend `emails.send`. Same `{ data, error }` handling + input-echo discipline as 4a. Config guard.
- `src/app/newsletter/confirm.ts` — `confirmSubscription(token)`: `verifyToken` → on ok, Resend `contacts.create({ audienceId, email, unsubscribed: false })` (idempotent). Returns a typed result (`ok | invalid | error`).

**Create — components / routes**
- `src/components/newsletter/NewsletterForm.tsx` (client) — email + required consent checkbox (label links `/datenschutz`) + honeypot + hidden `renderedAt`; `useActionState`; `compact?: boolean` prop (Footer vs full page); success state „Fast geschafft — schau in dein Postfach …“.
- `src/app/newsletter/page.tsx`, `src/app/newsletter/bestaetigt/page.tsx`.

**Modify**
- `src/components/Footer.tsx` — replace the Newsletter placeholder slot with `<NewsletterForm compact />`.
- `src/lib/legal/datenschutz.ts` — fill the „Newsletter“ section (replace the `[Platzhalter]`).
- `src/app/sitemap.ts` — add `/newsletter` (not `/bestaetigt` — transactional/parameterized).
- `.env.example` — add `NEWSLETTER_SECRET`, `NEWSLETTER_AUDIENCE_ID`.

**NOT in main nav:** newsletter stays a Footer + dedicated-page entry; `src/lib/nav.ts` unchanged.

## 7. Copy (German drafts-to-verify) & legal

- **`/newsletter`:** calm intro (a Ratgeber-newsletter; practical automation tips; no hype/urgency), one email field, required consent checkbox („Ich möchte den Newsletter erhalten und habe die [Datenschutzerklärung] gelesen.“), button „Anmelden“. Success: „Fast geschafft — schau in dein Postfach und bestätige deine Anmeldung.“
- **Footer compact:** label „Newsletter“ + email field + „Anmelden“, same action.
- **`/newsletter/bestaetigt`:** success „Bestätigt — danke! Du bist dabei.“; error „Dieser Link ist ungültig oder abgelaufen.“ + link back to `/newsletter`.
- **Confirmation email:** subject „Bitte bestätige deine Newsletter-Anmeldung“, short body + confirm button + raw URL fallback + „Wenn du dich nicht angemeldet hast, ignorier diese E-Mail einfach.“
- **Datenschutz „Newsletter“ section** (replaces `[Platzhalter]`): double-opt-in described; data collected (email only); purpose; legal basis Art. 6 (1) (a) (Einwilligung); Resend als Auftragsverarbeiter; right to withdraw anytime via the unsubscribe link in every newsletter; that no data is stored before confirmation.

## 8. Graceful degradation & out of scope

- **Degradation:** `isNewsletterConfigured()` false → form renders „Der Newsletter ist bald verfügbar.“ (no fake submit). The Server Action also returns a safe error if reached while unconfigured. Goes live the moment the env vars are set in Vercel.
- **Out of scope (4b):** composing/sending newsletter issues (done via Resend Broadcasts — see §3), an in-app unsubscribe UI (Resend's managed unsubscribe covers it), the welcome email (D4), and any admin/list-management UI.

## 9. Testing & verification

Follows the 4a TDD + per-task-commit workflow; full gate green at each task.

- **Pure (`newsletter.ts`):** `validateNewsletterEmail` (good/bad); `signToken`/`verifyToken` (valid round-trip → email recovered; tampered signature → invalid; expired (`now > iat + TTL`) → expired; wrong secret → invalid); `evaluateSignup` (drop on honeypot, reject when too fast, invalid on bad email/missing consent, send on clean).
- **Email builder:** `buildConfirmEmail` includes the `confirmUrl` in both `html` and `text`, and a German subject.
- **Server Action (`subscribeToNewsletter`):** honeypot → silent `ok`, no send; too-fast → error; invalid → field error, no send; valid+configured → Resend `emails.send` called once and the sent link contains a token that `verifyToken` accepts; Resend `{ error }` → error. (Resend mocked with a constructable `function`/`class` per the Vitest-v4 gotcha; env stubbed.)
- **`confirmSubscription`:** valid token → `contacts.create` called with `{ audienceId, email, unsubscribed: false }`; invalid/expired token → error, no create; Resend error → error.
- **Components:** `NewsletterForm` renders email + consent (links `/datenschutz`) + honeypot, shows success copy on `ok`; `compact` variant renders; `bestaetigt` page renders success and error (mock `confirmSubscription`).
- **Legal + sitemap:** Datenschutz „Newsletter“ section present and mentions double opt-in / Resend / Widerruf, and no longer contains the newsletter `[Platzhalter]`; `sitemap` includes `/newsletter`.
- **Gate:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build` — all routes prerendered except `/newsletter/bestaetigt` (dynamic; reads `searchParams`).

## 10. Risks & notes

- **Token secret rotation:** rotating `NEWSLETTER_SECRET` invalidates outstanding (unconfirmed) links — acceptable; they simply re-subscribe.
- **Side-effect on GET:** confirmation runs on `/newsletter/bestaetigt` GET. Email links aren't Next-prefetched and `contacts.create` is idempotent, so link scanners cannot cause harm beyond an already-consented confirm. Standard for double-opt-in.
- **Sender domain:** the confirm email's `from` (`CONTACT_FROM`) needs a Resend-verified domain (SPF/DKIM) to actually deliver — same constraint as 4a; ties to **vrelo-ki.de** (Phase 5). Until configured, the form shows the „bald verfügbar“ state.
- **Resend Audience must exist:** `NEWSLETTER_AUDIENCE_ID` points to an Audience the founder creates in the Resend dashboard. Owner setup step (see CLAUDE.md todos).
- **Secrets never in the repo** — only `.env.example` placeholders committed; real values in Vercel.
- **Brand discipline:** `@theme` tokens only, „Vrelo“/„Merak“ via `<BrandWord>`, German typographic quotes (U+201E/U+201C) in all client-facing copy (verify bytes — the Edit-tool downgrade gotcha).
