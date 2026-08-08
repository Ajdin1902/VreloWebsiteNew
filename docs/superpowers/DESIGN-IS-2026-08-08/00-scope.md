# 00 — Scope

**Audit:** Dieter Rams ten-principle design audit
**Date:** 2026-08-08
**Auditor:** Claude (orchestrator) + 3 evidence subagents

## What was audited

Two surfaces of the Vrelo marketing site (Next.js 16, App Router):

| Surface | Route | Source |
|---|---|---|
| Makler landing page | `/makler` | `src/app/makler/page.tsx` + `src/components/makler/*` + copy in `src/lib/makler.ts` |
| Lead-Reaktions-Check | `/lead-check` | `src/app/lead-check/page.tsx` + `src/components/lead-check/*` + `src/lib/leadCheck.ts`, `src/lib/leadCheckEmail.ts` |

Shared primitives in scope where these two pages use them: `PageHero`, `Section`, `CTAButton`, `Reveal`, `SchedulerEmbed`, `Header`/`Footer`/`MobileNav` (on `/lead-check` only), `FaqItem`, `ChromeGate`.

**Out of scope:** `/demo`, the 12 Ratgeber articles, homepage, `/leistungen`, `/kontakt`, legal pages. `/demo` is referenced because `/makler` links to it, but was not audited.

## Why these two

These are the surfaces the Tier-A outreach lands on. All 21 Welle-1 messages across 7 firms point at one of them, and both are gated on the domain cutover (HQ `CLAUDE.md` §7). `/makler` is the direct-link landing page; `/lead-check` is the free door-opener referenced in the outreach sequences.

## Primary user and primary task

**User:** an independent German Makler or Finanz-/Versicherungsmakler, solo or very small, non-technical, in a ~130-firm word-of-mouth market. Arrives cold from a LinkedIn message. Sceptical of agencies; per the HQ quote bank his standing objection is „Das würde meinen Gewinn schmälern und neue Objekte gibt es mehr als genug."

**Primary task, `/makler`:** understand the two offers well enough to decide whether a 30-minute call is worth it — and book it.
**Primary task, `/lead-check`:** answer six questions and get an honest read on what a slow lead reaction costs him.

## Constraints

- **Brand:** `Website/Brand.md` is binding — German copy, generic masculine, calm-over-hype, Papier `#F4EFE6` never pure white, German punctuation („…" U+201E/U+201C, spaced en-dash U+2013), *Vrelo*/*Merak* in Fraunces italic.
- **Commercial:** no Vrelo price may appear; no competitor may be named; the client's server cost must read „rund 30 €" identically site-wide (HQ §4).
- **Stage:** solo founder, validating. Both products on `/makler` are **specced but never delivered once**. Zero paying clients in the niche.
- **Legal:** Art. 50 KI-VO applicable since 2026-08-02; UWG §5 is the sharper risk in this market.
- **Deadline:** cutover is gated on the Steuernummer arriving by post. Everything fixable before that should be fixed now, so the cutover day is a sending day, not a writing day.

## Evidence mode

Production build (`npm run build` + `next start`), measured in Chrome — **not** the dev server.

One correction made mid-audit: the first build had `NEXT_PUBLIC_CAL_LINK` unset, so `/makler`'s close rendered its unconfigured fallback („Online-Terminbuchung folgt in Kürze"). That is a local-env artifact, not the production design. The site was rebuilt with the scheduler configured and re-measured on `:3100`. All scores below reflect the configured shape.

## Measurement contaminant (excluded)

Three `apps.rokt.com` iframes appeared in the resource timeline. `grep -c rokt` against the served HTML returns **0** — they are injected by a browser extension in the operator's Chrome profile, not by the site. Excluded from all request and byte counts.

## Known gaps

- **Responsive not measured.** A window resize to 390px did not change the reported viewport width, so the mobile layout was not verified in this pass. `Website/CLAUDE.md` records the design system as browser-verified at 1440/390; that claim was not re-tested here and no principle was scored down for it.
- **Cal.com event duration** is not represented in the repo, so the 30-vs-15-minute contradiction (see 01, M1) could not be resolved against the actual booking configuration.
- **`/demo`** not audited, though `/makler` sends the sceptic there.
- **Source claims not researched.** Whether the HBR/InsideSales figure and the €4.000 commission average are *accurate* was not investigated — only whether the page cites anything.
