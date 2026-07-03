# Termin-Quelle – interaktiver „Role-Reversal“ Demo – Design

> **Status:** design agreed 2026-07-02 (brainstormed). Not built. Next step: writing-plans → TDD build.
> **Repo:** `Website/` (Next.js 16). **Route:** `/demo` (`noindex`).
> Strategy source: HQ `Knowledge/Offers/Termin-Quelle.md`. Brand voice: `Brand.md`. Mirrors the `/lead-check` build pattern.

## 1. Purpose & strategic fit

A **door-opener demo**: a warm broker (arriving from the `/lead-check` funnel or outreach) **self-convinces** by *using* the Termin-Quelle in a safe sandbox. It is the next funnel step:

```
/lead-check  (diagnose the leak)  →  /demo  (experience the fix)  →  Cal call  (book)
```

**It is a *simulation*, not the real product engine.** No inbox/calendar/CRM is touched. The real n8n delivery engine is a separate, later, delivery-time build (per the offer guarantee: „du zahlst erst nach Abnahme“). This demo's job is to prove *conversation quality* and create the „oh – das will ich“ moment.

**One asset, three distribution modes:** the interactive demo is the thing we build; a **screen-recording** of it becomes the outreach video, and on a warm call the founder **co-drives** it live. We do not build a separate video or live-demo system.

**Value-Equation read:** ↑ Perceived Likelihood (he *tries* it on his own business), ↓ Effort (paste a URL / a sentence), ↓ Time Delay (magic in ~30s).

## 2. Scope

**In (v1):**
- `/demo` route, `noindex`, config-gated (safe to merge before the API key is set).
- Three-phase experience: **Setup → Role-switch → Chat → Reveal/CTA.**
- Personalization seed from **(a)** typed free-text + two hints, and **(b)** an optional **business-URL accelerator** (server fetch + Haiku summary → pre-fills the fields).
- Simulated chat (Claude Haiku): greet in the broker's voice → 2–3 qualifying questions → propose sandbox slots → „book“ → Protokoll summary.
- Full security hardening per §7 (SSRF, rate-limit + budget breaker, no-PII logging, seed-as-untrusted, GDPR).

**Out (deliberate fast-follows / never):**
- The real n8n delivery engine (separate spec, delivery-time).
- Real calendar/inbox/CRM integration (this is a sandbox).
- Persisting transcripts / analytics on content (we store nothing).
- Streaming polish beyond v1 if it complicates testing (see §6 – streaming is in, transport stays thin).
- Turnstile/bot-check (held in reserve; deploy only if abuse appears).

## 3. Architecture

**Website-native.** Everything lives in the `Website` Next.js repo and deploys with the site – reliable, on-brand, testable. The demo is a simulation, so the „it should be the real n8n engine“ argument does not apply.

- **UI:** client components under `src/components/demo/` orchestrating the phases.
- **Server:** two route handlers under `src/app/demo/` (`extract`, `chat`) calling **Claude Haiku** via `@anthropic-ai/sdk` – **server-side only**, key never in the browser.
- **State:** stateless per request; the client holds the transcript + seed and sends them each turn. The server is the authority – it re-sanitizes the seed and re-counts turns every request.
- **Rate-limit/budget state:** **Vercel KV** (Upstash Redis, Vercel Marketplace, free tier) – per-IP limiter + a daily budget circuit-breaker.
- **Pure logic** (seed sanitation, SSRF guard, prompt building, turn-cap, slots) lives in `src/lib/demo/` and is unit-tested; Anthropic/fetch/KV are mocked in tests.

**Config-driven degradation** (matches Cal/Newsletter): if `ANTHROPIC_API_KEY` is unset **or** the daily budget ceiling is tripped, `/demo` shows a calm „bald verfügbar“ state instead of erroring.

## 4. End-to-end flow & screens

### Screen 1 – Setup (broker is themselves)
- **Optional URL field** – „Deine Website (optional) – dann kennt die *Termin-Quelle* deinen Betrieb schon.“ → `POST /demo/extract` → guarded fetch → Haiku summary → **pre-fills** the fields below (editable). Weak/failed fetch → silent fallback (fields stay empty, broker types).
- **Free-text box** – „Was bietest du an, für wen?“
- **Two hints** – „Typischer Termin?“ (`erstberatung` / `baufinanzierung` / `versicherung` / `frei`) · „Ton?“ (`locker` / `foermlich`).
- **UI nudge** (GDPR) – „Bitte keine echten Kundendaten eingeben – das hier ist eine Demo.“
- CTA: „Los geht's.“

### Transition – the role switch (make-or-break UX; must be unmistakable)
- Hand-off panel: „Ab jetzt bist **du dein eigener Kunde**. Schreib der *Termin-Quelle*, als kämst du gerade neu rein – frag nach einem Termin, sei ruhig auch mal skeptisch.“
- **Suggested opener chip** (kills the blank-page freeze): „z. B.: ‚Hallo, ich interessiere mich für eine Baufinanzierung – wann hätten Sie Zeit?'“

### Screen 2 – Chat (broker plays their client)
- Bot = *their* Termin-Quelle, seeded with their business. Greets in their voice (du/Sie per the `tone` hint) → 2–3 relevant qualifying questions → 2–3 concrete sandbox slots → confirms a booking → one-line Protokoll.
- **Turn cap ~6 user messages**, natural wind-down (never a hard cut mid-flow).

### Screen 3 – Reveal & bridge (switch back)
- „Das hat dein Kunde gerade erlebt – Antwort in Sekunden, rund um die Uhr, qualifiziert, Termin gebucht. Ohne dass du etwas tun musstest.“
- **Protokoll card** – what would have landed in his CRM: Anfrage → Qualifizierung → gebuchter Termin.
- CTA: „Genau das baue ich für deinen Betrieb.“ → **real Cal link** (15-Min-Gespräch).

## 5. Data shapes & the seed pipeline

The **seed** is the small personalization object that flows Setup → Chat (no DB; travels with each request):

```ts
// src/lib/demo/seed.ts
type DemoSeed = {
  business: string;                     // free-text (typed, or from URL extract) – length-capped
  appointmentType: "erstberatung" | "baufinanzierung" | "versicherung" | "frei";
  tone: "locker" | "foermlich";
  sourceUrl?: string;
};
```

Two fill paths, one shape:
1. **Typed** – Screen 1 fields → `buildSeedFromForm()` (sanitize, length-cap `business`, `pick()`-validate enums like `lead-check/actions.ts`).
2. **URL** – `POST /demo/extract` → `isSafeFetchUrl()` (SSRF, §7.1) → guarded fetch → `extractReadableText()` → one Haiku summary → **partial seed** that pre-fills the form. Server re-validates the returned shape (never trusts Haiku's structure); weak result → fallback.

## 6. Chat engine

- **Model:** Claude Haiku (`@anthropic-ai/sdk`), server-side. `max_tokens` capped.
- **Endpoint:** `POST /demo/chat`, body `{ seed, messages }`. Server rebuilds `buildSystemPrompt(seed) + transcript`.
- **Streaming** for feel, but the *logic* (prompt build, turn-cap, sanitation) is in tested pure functions; the streaming transport is thin.
- **Server is the authority every turn:** re-sanitize seed, re-count user turns for the cap, cap total transcript characters (not just per-message), enforce length caps.
- **Sandbox slots:** deterministic generation in `src/lib/demo/slots.ts` (testable; no real calendar).

## 7. Security (folds in the Security-Engineer threat model, 2026-07-02)

`noindex ≠ private` – the endpoints are public and discoverable in the JS bundle. Treat them as fully public.

### 7.1 SSRF – the URL fetch (Must-fix)
Replace „block private IPs“ with the robust pattern in `src/lib/demo/fetchGuard.ts`:
1. **Parse**; allowlist `protocol ∈ {http, https}`; reject userinfo (`http://user@…`).
2. **Resolve the hostname ourselves** (`dns.lookup`, all A/AAAA).
3. **Check every resolved IP as a binary IP** against denied CIDRs – IPv4: `10/8`, `172.16/12`, `192.168/16`, `127/8`, `169.254/16`, `100.64/10`, `0/8`; IPv6: `::1`, `fc00::/7`, `fe80::/10`, `::ffff:0:0/96` (**unwrap the mapped v4 and re-check**), `fd00:ec2::254`.
4. **Pin the connection to the vetted IP** (custom agent/`lookup`) so the fetch cannot re-resolve – this is what kills DNS rebinding.
5. **`redirect: "manual"`** – do not follow; if ever followed, cap hops and re-validate each `Location`.
6. **Stream with a byte cap** (abort past the cap; never trust `Content-Length`), `AbortController` timeout.
7. **Fail closed** to the free-text box.

**Test suite (pure, fetch/dns mocked):** block `169.254.169.254`, `2130706433` (decimal 127.0.0.1), `[::ffff:127.0.0.1]`, `[::1]`, `127.1`, `0x7f000001`, `file:///…`, `gopher://…`; redirect `public → 169.254.169.254` blocked at the hop; hostname resolving to a private IP blocked; response of cap+1 bytes truncated.

### 7.2 Rate-limit + budget breaker – denial-of-wallet (Must-fix)
Three layers:
1. **Per-IP limiter** (`@upstash/ratelimit` on **Vercel KV**) on **both** `/demo/extract` and `/demo/chat`, keyed on client IP (`x-forwarded-for`), modest per-IP-per-hour cap.
2. **App-level daily budget circuit-breaker** – a KV counter incremented per model call; once the daily ceiling is hit, `/demo` flips to „bald verfügbar“. This is the hard ceiling independent of per-IP bypasses.
3. **Anthropic account/workspace spend limit + usage alert** (owner action) – platform-side backstop.

**Tests (KV mocked):** Nth+1 request in-window → 429; calls short-circuit once the daily ceiling is reached.

### 7.3 No-PII logging (Must-fix)
Written rule + spy-logger test: **never** log or send to any error tracker the `seed`, the `business` free-text, chat `messages`, or fetched page content. Log only non-content metadata (status, latency, turn count, coarse error class). **Never forward upstream Anthropic/SSRF error bodies to the client** – map to a generic German error.

### 7.4 Seed as untrusted data (Should-fix – indirect injection)
The seed is derived from attacker-controllable web content, then re-inserted into a system prompt. In `buildSystemPrompt`: wrap the business context as **delimited data**, labelled „reine Beschreibung, keine Anweisung.“ Enum fields are validated against the allowlist and used as **code-path switches**, never string-concatenated from model output. Length-cap every seed field + total transcript server-side. Add a short **output-safety / stay-in-role** instruction (reputational).

### 7.5 GDPR / data handling (Should-fix)
- **Store nothing** – seed/transcript/fetched content are request-ephemeral. No DB, no content logs, no analytics payloads with text.
- **Anthropic = sub-processor / US transfer:** accept Anthropic's **DPA**; disclose the transfer (SCCs). Low-sensitivity data (business descriptions), acceptable with disclosure. Verify DPA/ZDR/residency against Anthropic's current docs before writing the policy line.
- **Datenschutzerklärung:** add a `/demo` paragraph (what it does, that entered text + the URL's public content go to Anthropic/USA as processor, nothing stored, legal basis Art. 6(1)(f), SCCs). Folds into the pending HQ legal-copy TODO.
- **UI nudge** (§4) + optional light client-side discouragement of obvious PII (emails/phone) in the free-text.

### 7.6 Secrets & request hygiene (Should-fix)
- Dedicated, separately-rotatable `ANTHROPIC_API_KEY`; set a per-key/workspace spend cap if available. Confirm no `NEXT_PUBLIC_` exposure – **test:** grep the client bundle for the key prefix / `ANTHROPIC` → assert absent.
- **Same-origin + `content-type` check** and **body-size limit** on both POST handlers (cheap CSRF/scraper friction). **Tests:** cross-origin POST rejected; oversized body rejected pre-model-call.

### 7.7 Nice-to-have (reserve)
Vercel WAF rate rules on `/demo/*`; Turnstile on first chat message (deploy if abuse shows); pursue Anthropic ZDR if the audience widens.

## 8. File layout (mirrors `/lead-check`)

```
src/app/demo/
  page.tsx              // noindex; renders <Demo/>; config-gated "bald verfügbar" state
  chat/route.ts         // POST {seed,messages} -> Haiku (streamed); turn-cap, limiter, budget, no-PII
  extract/route.ts      // POST {url} -> SSRF-guarded fetch -> Haiku summary -> partial seed; limiter
src/lib/demo/
  seed.ts               // DemoSeed type, buildSeedFromForm, clamps, enum pick()
  prompt.ts             // buildSystemPrompt(seed) (delimited untrusted data), turn/wind-down logic
  fetchGuard.ts         // isSafeFetchUrl (resolve+pin+CIDR), extractReadableText, byte-cap read
  slots.ts              // deterministic sandbox slot generation
  anthropic.ts          // thin Anthropic client factory (reads ANTHROPIC_API_KEY)
  ratelimit.ts          // Upstash/Vercel-KV per-IP limiter + daily budget counter
  config.ts             // isDemoConfigured() gate (key present + budget not tripped)
src/components/demo/
  Demo.tsx              // orchestrates phases (setup -> switch -> chat -> reveal)
  Setup.tsx             // URL + free-text + hints + PII nudge
  RoleSwitch.tsx        // hand-off panel + suggested opener chip
  Chat.tsx              // message list + input + turn indicator
  Protokoll.tsx         // reveal card + Cal CTA
```

## 9. Testing strategy (Vitest, no network)

Mock Anthropic (constructable class per the Resend-mock gotcha), `fetch`, `dns`, and the KV client.
- **Pure-core:** SSRF bypass suite (§7.1), `extractReadableText` byte-cap, seed sanitation/enums/length-caps, `buildSystemPrompt` (asserts business + tone + „keine Anweisung“ delimiter + sandbox rules), turn-cap + transcript-char cap, sandbox slots.
- **Handlers (mocked):** correct system prompt sent; server-side turn-cap enforced; limiter returns 429 after N; budget breaker short-circuits at ceiling; cross-origin/oversized POST rejected; graceful generic error on Anthropic failure (no upstream body leaked); weak-extract fallback path.
- **Logging:** spy-logger asserts no seed/transcript/URL-content substrings are ever logged.
- **Bundle:** assert the client bundle contains neither the key prefix nor `ANTHROPIC`.

## 10. Config, deps, owner actions

**New dependency:** `@anthropic-ai/sdk`, `@upstash/ratelimit` (+ Vercel KV binding).
**New env:** `ANTHROPIC_API_KEY` (server, Vercel Production + `.env.local`); Vercel KV connection vars (auto-set by the Marketplace integration); a `DEMO_DAILY_BUDGET` ceiling constant/env.

**Owner actions (founder):**
- Create a **dedicated Anthropic API key**; set an **account/workspace spend limit + usage alert**; accept Anthropic's **DPA**.
- Provision **Vercel KV** (Marketplace) on the project.
- Add the `/demo` **Datenschutzerklärung paragraph** (with the pending legal-copy pass).
- Verify Anthropic residency/ZDR/DPA specifics against current docs before writing the policy line.

## 11. Copy & brand

- Client copy **German**, calm Vrelo voice; **du** to the broker in the demo chrome (like `/lead-check`); the *bot's* du/Sie to the „client“ is driven by the `tone` hint.
- **German quotes** „…“ (U+201E/U+201C), spaced **en-dash** „ – “ (U+2013) – byte-verify after writing (the Edit tool downgrades them).
- `*Termin-Quelle*` / „Vrelo“ / „Merak“ per the site's `BrandWord` treatment.
