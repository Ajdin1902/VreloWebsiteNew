# Kontakt page redesign — design spec

**Date:** 2026-06-19
**Scope:** Visual + structural redesign of `/kontakt`. Presentation only — the contact-form logic (validation, honeypot, time-trap, Resend send) is untouched.
**Status:** Approved in brainstorming (visual companion). Ready for an implementation plan.

## Why

The Kontakt form went live on 2026-06-19. Two problems remain:
1. The form sits on the bright `papier` surface — too light/glary to write in comfortably.
2. The success state is abrupt: the whole form is replaced by a single line of `ember` serif text on the same bright surface.
3. The page still leads with a scheduler placeholder („Online-Terminbuchung folgt in Kürze“) even though Cal.com is not set up and the form is now the working conversion path.

## Decisions (locked)

- **Form-only page.** Remove the scheduler section. Keep the `SchedulerEmbed` component in the codebase (unrendered) so Cal.com can be re-added later as a one-liner — tracked as a follow-up todo.
- **Dark card on paper (treatment B).** The form lives in a deep-water (`tiefes-wasser` #0a2538) rounded card with a soft deep-water shadow, centred (~`max-w-xl`) on the `papier` page. This is the darker, calmer writing surface the founder asked for; the page stays rooted in brand paper.
- **Drop the „Oder schreib mir.“ framing.** With no scheduler, there is no „oder“. The form is the page. Replace with a short serif heading „Schreib mir.“ + one calm reassurance line.
- **Keep the water banner** image below the card as a calm closer.
- **Confirmation = treatment B** (calm close + gentle next step): amber water-ring mark → serif „Danke — ich melde mich.“ → „Deine Nachricht ist bei mir. Ich antworte persönlich, meist innerhalb von ein, zwei Werktagen.“ → two quiet links: „Meine Arbeit ansehen“ (`/leistungen`) and „Ratgeber lesen“ (`/ratgeber`).
- **Message field label** → „Was raubt dir gerade deine Zeit?“ (echoes the Hero verb „rauben“).

## Page structure (after)

`src/app/kontakt/page.tsx`:
1. `PageIntro` — eyebrow „Kontakt“, title „Lass uns deine Quelle bauen.“, current lead. On `papier` (unchanged).
2. **Form card section** — one `Section tone="paper"`; inside it, the dark card (`mx-auto max-w-xl`) holding the heading + reassurance + `ContactForm` (or the mailto fallback when unconfigured).
3. **Banner** — existing `PageImage` water banner (`aspect-[21/9]`), unchanged.
4. `JsonLd` breadcrumb (unchanged).

Removed: the `SchedulerEmbed` import/render and the `calLink` usage on this page. The `configured ? <ContactForm/> : mailto-fallback` branch stays (safe degradation); both branches render **inside the dark card** so the surface is consistent.

## The form card

- **Card:** `bg-tiefes-wasser`, `rounded-2xl`, deep-water shadow (`shadow-deepwater` / `.card-depth`), generous padding (~`p-8 md:p-10`).
- **Heading:** serif „Schreib mir.“ in `papier`; one reassurance line in `gletscher` (e.g. „Ein, zwei Sätze genügen. Ich antworte persönlich.“).
- **Fields** (Name, E-Mail, message, Betrieb optional, consent):
  - Labels: `text-gletscher`, small medium weight.
  - Inputs/textarea: translucent light panel (`bg-gletscher/8` or similar), border `border-gletscher/25`, text `text-papier`/`gletscher`, placeholder a light AA-safe grey, **amber** focus-visible ring (existing pattern), `focus-visible:ring-offset` over the dark card.
  - Submit: existing **amber** button (`bg-amber text-tiefes-wasser`) — already AA on dark.
  - Message label text → „Was raubt dir gerade deine Zeit?“.

## New on-dark tokens (accessibility — load-bearing)

Three colors used by the form are dark-on-light and **fail on the dark card**. Add light, AA-verified (`≥4.5:1` on `tiefes-wasser` #0a2538) replacements as `@theme` tokens, applied only on the dark card:
- **Error text** — replaces `ember` on dark. Pick a light warm signal color, contrast-verified. (`ember` stays the token for light surfaces.)
- **Inline link on dark** — for the Datenschutz consent link and the confirmation links. A light underlined treatment (`gletscher`/`honig`), contrast-verified.

Exact hex values chosen at build time and verified with the project's contrast check; record them as Gotchas in `CLAUDE.md` like `stumm`/`ember`.

## Confirmation state

Rendered by `ContactForm` when `state.status === "ok"`, inside the same dark card:
- Amber water-ring mark (decorative, `aria-hidden`); any glow is static or `motion-safe`-gated.
- Serif „Danke — ich melde mich.“ in `papier` (text unchanged → keeps the existing test assertion valid).
- Body line in `gletscher`: „Deine Nachricht ist bei mir. Ich antworte persönlich, meist innerhalb von ein, zwei Werktagen.“
- Two quiet links (light on-dark link token): „Meine Arbeit ansehen“ → `/leistungen`, „Ratgeber lesen“ → `/ratgeber`.

## Out of scope / follow-ups

- **Re-add the Cal.com scheduler** once `NEXT_PUBLIC_CAL_LINK` is set — its own task; component is preserved.
- Newsletter + legal page design passes (separate Next-session items).
- No change to the server action, `src/lib/contact.ts`, the email payload, or env handling.

## Verification

- `npx tsc --noEmit` · `npm run lint` · `npm test` · `npm run build` all green. Update `ContactForm.test.tsx` for the new markup + the two confirmation links; the „Danke — ich melde mich.“ assertion stays.
- Browser-verify at **1440** and **390** via impeccable `live`: card layout, field comfort, the confirmation state, focus-visible rings.
- **AA-contrast every on-dark text**: labels, placeholder, body, links, error text — all `≥4.5:1` on `tiefes-wasser`.
- `prefers-reduced-motion`: ring-mark glow static.
- German typography byte-verified in changed files: quotes „…“ (U+201E/U+201C), spaced en-dash „ – “ (U+2013).
