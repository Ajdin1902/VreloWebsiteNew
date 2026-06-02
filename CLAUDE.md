# CLAUDE.md — Vrelo Website

Project memory for the **Vrelo** marketing website. Read this first; it links out to the brand brief, the spec, and the per-phase plans.

- **Brand brief (voice, palette, type, logo, compliance):** [Brand.md](Brand.md) — the source for every design/copy decision.
- **Design spec:** [docs/superpowers/specs/2026-06-01-vrelo-website-design.md](docs/superpowers/specs/2026-06-01-vrelo-website-design.md)
- **Implementation plans:** [docs/superpowers/plans/](docs/superpowers/plans/)

> Client-facing copy is **German**; code & comments are **English**.

---

## What this is
A content/SEO marketing site for Vrelo, an AI-automation studio for DACH small businesses. Framed as a **personal brand** (first-person „Ich"). Primary goal: convert visitors to a booked call (scheduler) or contact form; secondary: organic search via a German Ratgeber (blog) + a newsletter.

## Status
- **Phase 1 (foundation) — DONE**, merged to `main`, deployed live.
- **Phase 2a (homepage) — DONE**, merged to `main` **locally only** (branch `feat/phase2a-homepage` deleted locally; `origin/feat/phase2a-homepage` still exists). ⚠️ **Local `main` is ahead of `origin/main` and NOT yet pushed → the new homepage is NOT yet deployed.** Push `main` when ready to ship to production.
- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew (GitHub↔Vercel connected → push to `main` auto-deploys to production).

## Resume here (Phase 2b — Leistungen + FAQ)
Next phase: **2b** (Leistungen page + FAQ). No plan written yet — start with brainstorm → writing-plans → new branch `feat/phase2b-...`. The reusable `Section` primitive (paper/cool/warm) and the `src/components/home/` section pattern from 2a are the templates to follow.

**Carry-over polish notes from the 2a final review (non-blocking, optional):**
- `GeschichteTeaser` uses its small eyebrow as the section `<h2>` (the dominant line is a `<blockquote>`); reconsider promoting the quote or rewording the heading.
- Card border-radius differs: `WasIchBaue` chips `rounded-xl` vs `Steps` cards `rounded-2xl` — pick one site-wide.
- `CTAButton` hardcodes `focus-visible:ring-offset-papier`; on warm (`bg-sonnenlicht`) sections the offset color is slightly off — add a tone/ringOffset prop when convenient.

**Phase 2a delivered:** `Section` primitive (+test), Hero (Direction B deep-water + glowing Merak drop), and the six homepage sections (`Problem`, `WasIchBaue`, `GeschichteTeaser`, `Steps`, `Proof`, `MerakClose`) composed in `src/app/page.tsx`. Responsive review passed (desktop 1280 / mobile 390).

**Phase 2 is split into 3 plans:** ✅ 2a homepage (done) · 2b Leistungen + FAQ (next) · 2c video system + Über mich (build `LazyVideo` once, wire into Über mich + the homepage Merak-close).

## Tech stack
- **Next.js 16** (App Router, Turbopack) · **TypeScript**
- **Tailwind CSS v4** — brand palette as `@theme` tokens in `src/app/globals.css` (utilities like `bg-papier`, `text-tiefes-wasser`, `bg-amber`)
- **Fonts:** self-hosted via `next/font` (`src/lib/fonts.ts`) — Plus Jakarta Sans + Fraunces
- **Tests:** Vitest + React Testing Library (jsdom)
- **Deploy:** Vercel (project `ajdin42-7733s-projects/vrelo-website`)
- **Planned (later phases):** MDX for Ratgeber articles · Resend (contact form + newsletter) · Cal.com (scheduler embed)

## Project structure
```
src/app/            layout.tsx, page.tsx (placeholder Home), globals.css (brand tokens)
src/components/     BrandWord (+test), CTAButton, Header, Footer
src/lib/            fonts.ts, nav.ts (single source of nav links)
public/logo/        7 brand SVGs
Videos/             4 source clips: Beginning→Second_Part→Thrid_Part→End (drop→ripple→delta→sunset = Quelle→Merak)
docs/superpowers/   specs/ and plans/
Brand.md            brand brief
```
Brand enforcement lives in two places: the **`<BrandWord>`** component (forces Fraunces italic for „Vrelo"/„Merak") and the **Tailwind `@theme` tokens** (palette discipline). Use them; don't hand-roll colors or italics.

## Commands
```bash
npm run dev      # local dev (http://localhost:3000)
npm test         # Vitest
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check
vercel deploy --prod --scope ajdin42-7733s-projects   # manual deploy (or just push to main)
```

## How we work
Greenfield workflow via the superpowers skills, one phase at a time:
1. **brainstorm** → design decisions
2. **writing-plans** → bite-sized, TDD, per-task-commit plan in `docs/superpowers/plans/`
3. **subagent-driven build** → fresh subagent per task, verified on build/test/lint, then code review
4. **finishing-a-development-branch** → merge to `main`

Each phase gets its own branch (`feat/phaseN-...`). Frequent commits; commit messages end with `Co-Authored-By: Claude Opus 4.8`.

## Roadmap
1. ✅ **Foundation & design system** — Next.js shell, brand tokens, fonts, BrandWord, Header/Footer, placeholder Home.
2. 🔄 **Core pages** — split into **2a** homepage (Hero + section flow) *(✅ done, merged locally)*, **2b** Leistungen + FAQ *(next)*, **2c** video system + Über mich (4-clip narrative). *Uses the `frontend-design` skill.*
3. ⬜ **Ratgeber/MDX + SEO** — article system, 3 seed articles, metadata, JSON-LD, sitemap.
4. ⬜ **Conversion** — contact form, Cal.com scheduler, newsletter (Resend, GDPR double opt-in).
5. ⬜ **Legal & polish** — Impressum/Datenschutz, video optimization, perf/SEO pass, custom domain (vrelo.de).

## Key decisions (locked)
- German only; personal brand („Ich"); multi-page content/SEO site.
- Sitemap: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz`. Referenzen folded into Home + Leistungen.
- Hero = Direction B (immersive deep-water); rest of site = calm Papier sections; page ends on the *Merak*-Effekt.
- Videos: full 4-clip sequence on **Über mich**; sunset (`End.mp4`) at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
