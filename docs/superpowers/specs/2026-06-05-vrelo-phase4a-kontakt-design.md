# Vrelo Phase 4a — Kontakt (Contact form + Scheduler + Legal drafts) · Design Spec

> Date: 2026-06-05 · Branch: `feat/phase4a-kontakt`
> Builds on: [main design spec](2026-06-01-vrelo-website-design.md) · [Brand.md](../../../Brand.md) · [CLAUDE.md](../../../CLAUDE.md)
> Client-facing copy is **German**; code/comments **English**. German quotes: „…“ = U+201E + U+201C.

## 1. Goal

Make `/kontakt` live and wire the **primary conversion path**: a consent-gated Cal.com scheduler (primary) + a contact form (fallback) that emails the founder via Resend. Ship the minimal **legal pages** (Impressum + Datenschutzerklärung drafts) that make collecting personal data lawful, so `/kontakt` is actually launchable.

Phase 4 was split: **4a = Kontakt (this spec)**, **4b = Newsletter** (separate later cycle: signup + Resend Audience + GDPR double opt-in + email templates). The newsletter is out of scope here; the Datenschutzerklärung leaves a clearly-marked spot for the newsletter section that 4b will fill.

## 2. Decisions (locked in brainstorming)

| # | Decision |
|---|---|
| D1 | **Split Phase 4** → 4a Kontakt now, 4b Newsletter later. |
| D2 | **Pull minimal Impressum + Datenschutzerklärung drafts into 4a** (legal prerequisite for collecting PII). Drafts-to-verify by founder/lawyer; `[Platzhalter]` for personal details. |
| D3 | **Config-driven, graceful when unconfigured.** Everything reads env vars; with keys absent the form shows a `mailto:` fallback and the scheduler shows a calm placeholder. Goes live the moment keys are set in Vercel. |
| D4 | **Contact form = Next.js Server Action** with progressive enhancement (`<form action>` + `useActionState`). No `/api` route. |
| D5 | **Spam: honeypot + time-trap** (min-fill-time). No external store, no cookies. |
| D6 | **Scheduler = consent-gated click-to-load Cal.com** (`@calcom/embed-react`); no third-party script/cookie until the user clicks „Termin anzeigen“. |
| D7 | **Manual lightweight validation** in the action — no `zod` dependency. |
| D8 | New deps: `resend`, `@calcom/embed-react`. New env documented in a committed `.env.example`. |

## 3. Routes

| Route | File | Purpose |
|---|---|---|
| `/kontakt` | `src/app/kontakt/page.tsx` | Conversion hub: PageIntro → Scheduler (primary) → Contact form (fallback). Server component; checks `isContactConfigured()` to choose form vs `mailto` fallback. |
| `/impressum` | `src/app/impressum/page.tsx` | German Impressum draft (§5 DDG). |
| `/datenschutz` | `src/app/datenschutz/page.tsx` | German Datenschutzerklärung draft. |

Making `/kontakt` live also fixes every existing `ClosingCta` (they already default `ctaHref="/kontakt"`). All three pages emit a `BreadcrumbList` JSON-LD (consistent with Phase 3) and per-page metadata (title + description + canonical).

## 4. Contact form

### 4.1 Fields
- **Name** (required, text)
- **E-Mail** (required, format-validated)
- **„Was frisst gerade deine Zeit?“** (required, textarea)
- **Betrieb** (optional, text)
- **Datenschutz-Einwilligung** (required checkbox) — label links to `/datenschutz`
- **Honeypot** (hidden field, e.g. `name="website"`, visually hidden + `aria-hidden` + `tabindex="-1"`)
- **Render timestamp** (hidden field set on mount/render) — time-trap

### 4.2 Server Action — `src/app/kontakt/actions.ts`
`sendContactMessage(prevState, formData)`:
1. **Spam checks first:** if honeypot non-empty → return `{ ok: true }` *without sending* (silently drop). If `now - renderedAt < MIN_FILL_MS` (~3000ms) → return a generic error.
2. **Validate** (pure helper from `contact.ts`): name non-empty, email matches a basic RFC-ish regex, message non-empty, consent checked. Return `{ errors: Record<field,string> }` (German messages) on failure.
3. **Config guard:** if `!isContactConfigured()` → return a `fallback` result (the page already renders the `mailto` path, but the action stays safe if reached).
4. **Send** via Resend: `from = CONTACT_FROM`, `to = CONTACT_TO`, `replyTo = <submitter email>`, subject „Neue Anfrage über vrelo-website“ + a plain-text body with the fields. On Resend error → `{ error: "<calm German message>" }`.
5. On success → `{ ok: true }`.

Return type is a typed discriminated union consumed by `useActionState`.

### 4.3 Component — `src/components/kontakt/ContactForm.tsx` (client)
- `useActionState(sendContactMessage, initialState)`; renders fields with per-field error text, a submit button („Nachricht senden“), and a hidden timestamp initialized on mount.
- **Success state:** replaces the form with „Danke — ich melde mich. Kein Stress.“
- **Error state:** calm inline German error; fields preserved.
- Accessible: labels tied to inputs, `aria-invalid`/`aria-describedby` on errored fields, honeypot hidden from AT.

### 4.4 Unconfigured fallback
`/kontakt` (server) calls `isContactConfigured()`. If false, render a calm block instead of the form: „Schreib mir direkt:“ + `mailto:` to `CONTACT_TO` (or the documented founder address). No dead form, no fake submit.

## 5. Scheduler (consent-gated Cal.com)

### 5.1 Component — `src/components/kontakt/SchedulerEmbed.tsx` (client)
- Initial render: a calm placeholder card („Lieber direkt sprechen?“ + „Termin anzeigen“ button). **No Cal.com script, iframe, or cookie loads at this point.**
- On click → mount `@calcom/embed-react` `<Cal calLink={…} />` for `NEXT_PUBLIC_CAL_LINK`. This is the consent gate that keeps the no-cookie-banner posture; `/datenschutz` documents the click-to-load embed.
- **If `NEXT_PUBLIC_CAL_LINK` is unset:** placeholder reads „Online-Terminbuchung folgt in Kürze“ and points to the form below — never a broken embed.

### 5.2 Layout on `/kontakt`
PageIntro → **Scheduler block (primary)** → **Contact form block (fallback)**, per the main spec's „scheduler primary, form fallback“.

## 6. Legal pages (drafts-to-verify)

Both are **German drafts the founder/lawyer must verify before go-live** — marked as such at the top, with `[Platzhalter]` for all personal/company specifics. Long-form copy lives in small content modules (`src/lib/legal/impressum.ts`, `src/lib/legal/datenschutz.ts`) rendered by thin page components using `PageIntro` + `Section` + prose styling.

### 6.1 Impressum (§5 DDG)
Anbieter / Vertretungsberechtigter, Anschrift, Kontakt (E-Mail/Telefon), USt-IdNr (`[Platzhalter]`); Verantwortlich für den Inhalt; Hinweis EU-Streitschlichtung (OS-Plattform) + Verbraucherschlichtung; Haftung für Inhalte; Haftung für Links; Urheberrecht.

### 6.2 Datenschutzerklärung (GDPR)
- **Verantwortlicher** (`[Platzhalter]`).
- **Hosting:** Vercel — Server-Logs/IP, US-Datentransfer-Hinweis.
- **Kontaktformular:** erhobene Daten (Name, E-Mail, Nachricht, optional Betrieb), Zweck, Rechtsgrundlage Art. 6 (1) (b)/(f), **Resend als Auftragsverarbeiter** (E-Mail-Versand), Speicherdauer.
- **Terminbuchung Cal.com:** Embed lädt **erst nach Klick**; bei Nutzung Datenübertragung an Cal.com Inc.; Rechtsgrundlage Einwilligung/Art. 6 (1) (b).
- **Cookies:** keine Tracking-Cookies beim Laden.
- **Newsletter:** kurzer Platzhalter-Absatz „[wird mit dem Newsletter ergänzt]“ (4b füllt das).
- **Betroffenenrechte:** Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Datenübertragbarkeit, Beschwerde bei einer Aufsichtsbehörde.
- **SSL/TLS** Hinweis.

## 7. Config, components, files, deps, env

**New components**
- `src/components/kontakt/ContactForm.tsx` (client)
- `src/components/kontakt/SchedulerEmbed.tsx` (client)

**New lib / actions**
- `src/lib/contact.ts` — env getters (`contactTo`, `calLink`, …), `isContactConfigured()`, pure validators (`validateContact`), spam helpers (`isHoneypotTripped`, `isTooFast`), constants (`MIN_FILL_MS`).
- `src/app/kontakt/actions.ts` — `sendContactMessage` Server Action (uses `contact.ts` + Resend).
- `src/lib/legal/impressum.ts`, `src/lib/legal/datenschutz.ts` — German draft content.

**New routes**
- `src/app/kontakt/page.tsx`, `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`

**Modified**
- `src/components/Footer.tsx` — add Impressum + Datenschutz links.
- `src/app/sitemap.ts` — add `/kontakt`, `/impressum`, `/datenschutz` (now live).

**Dependencies**
- `resend` (server email), `@calcom/embed-react` (scheduler embed).

**Environment (documented in committed `.env.example`; real values set in Vercel, never in repo)**
- `RESEND_API_KEY` — Resend secret (server-only).
- `CONTACT_FROM` — verified sender, e.g. `Vrelo <kontakt@vrelo-ki.de>`.
- `CONTACT_TO` — founder destination inbox.
- `NEXT_PUBLIC_CAL_LINK` — Cal.com link, e.g. `vrelo/kennenlernen` (public; used by the embed).

## 8. Testing & verification

Follows the existing TDD + per-task-commit workflow; full gate green at the end of each task.

- **Unit (pure, `contact.ts`):** `validateContact` (missing name/email/message/consent, bad email format, happy path), `isHoneypotTripped`, `isTooFast` (boundary around `MIN_FILL_MS`), `isContactConfigured` (env present/absent).
- **Server Action:** honeypot → silent `{ ok }` no send; too-fast → error; invalid → field errors; valid+configured → calls Resend with correct `to`/`replyTo`/body (Resend client mocked); Resend throw → calm error.
- **Components:** `ContactForm` (renders all fields, consent label links `/datenschutz`, shows success copy on `ok` state); `SchedulerEmbed` (**placeholder pre-click, no Cal iframe/script in the DOM before click**; unset `calLink` → „folgt in Kürze“).
- **Legal + sitemap:** render tests (key German section headings + `[Platzhalter]` markers present); `sitemap` includes the 3 new routes.
- **Gate:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build` — all routes static/prerendered (the `/kontakt` shell is static with client islands; legal pages static).
- **Manual smoke (dev):** `/kontakt` shows scheduler placeholder + form (or mailto fallback when env unset); consent link resolves to `/datenschutz`; Impressum/Datenschutz render; Footer links work.

## 9. Risks & notes

- **Legal text is a draft, not legal advice** — must be reviewed by the founder/lawyer before relying on it; that's why it ships behind `[Platzhalter]` + an explicit draft notice. This unblocks launch mechanically but the founder owns final sign-off.
- **Real email sending needs a verified Resend domain** for `CONTACT_FROM` (SPF/DKIM). Until then the form is configured-but-won't-send; the `mailto` fallback covers the gap. The sending domain ties to **vrelo-ki.de** (Phase 5) — interim a Resend-verified domain or the vercel domain may be used.
- **Cal.com link** is founder-provided; until set, the scheduler shows the placeholder. No fake booking.
- **No new cookies on load** — the Cal embed is the only third-party load and it's click-gated, so the no-consent-banner stance holds. Documented in `/datenschutz`.
- **Secrets never in the repo** — only `.env.example` (placeholders) is committed; real values live in Vercel project env.
- **Brand discipline:** `@theme` tokens only, „Vrelo“/„Merak“ via `<BrandWord>`, German typographic quotes (U+201E/U+201C) in all client-facing copy (verify bytes — the Edit-tool downgrade gotcha).
- **No scope creep:** no newsletter (4b), no KV rate-limiting, no zod, no full Phase-5 polish. Impressum/Datenschutz are the minimal drafts needed to launch the form.
