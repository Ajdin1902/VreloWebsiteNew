# CLAUDE.md — Vrelo Website

Project memory for the **Vrelo** marketing website. Read this first; it links out to the brand brief, the spec, and the per-phase plans.

- **Brand brief (voice, palette, type, logo, compliance):** [Brand.md](Brand.md) — the source for every design/copy decision.
- **Design spec:** [docs/superpowers/specs/2026-06-01-vrelo-website-design.md](docs/superpowers/specs/2026-06-01-vrelo-website-design.md)
- **Implementation plans:** [docs/superpowers/plans/](docs/superpowers/plans/)

> Client-facing copy is **German**; code & comments are **English**.

---

## What this is
A content/SEO marketing site for Vrelo, an AI-automation studio for DACH small businesses. Framed as a **personal brand** (first-person „Ich“). Primary goal: convert visitors to a booked call (scheduler) or contact form; secondary: organic search via a German Ratgeber (blog) + a newsletter.

## Status
- **Phases 1–3 — DONE**, merged + deployed live. Homepage, `/leistungen`, `/faq`, `/ueber-mich`, `/ratgeber` (empty until a seed article is published), `sitemap.xml` + `robots.txt`, site-wide JSON-LD, branded OG images all resolve in prod. Video system (`LazyVideo` + `public/video/`) shipped; sunset wired into `MerakClose`. Phase 3 (MDX Ratgeber via `next-mdx-remote` + `gray-matter`, auto-wrap BrandWord remark plugin) merged via `e254b37`.
- **Phase 4a (Kontakt) — BUILT + gate-green on branch `feat/phase4a-kontakt`, not yet merged/deployed.** Consent-gated Cal.com scheduler (`@calcom/embed-react`, click-to-load) + contact form (Server Action → Resend) with honeypot + time-trap spam guards; pure tested core in `src/lib/contact.ts` (`evaluateSubmission` decision). Config-driven: form → `mailto` and scheduler → placeholder when env unset. Minimal German **Impressum + Datenschutzerklärung** drafts (`src/lib/legal/`) so collecting PII is lawful. Full gate green: 100 tests · tsc · lint · build (12 routes static). Pending final review → merge to `main`.
- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew (GitHub↔Vercel connected → push to `main` auto-deploys to production).
- **Known dead links in prod:** `/kontakt` `/impressum` `/datenschutz` 404 until Phase 4a merges (built on `feat/phase4a-kontakt`; resolve once merged). Nav `<Link>` prefetch logs harmless console 404s.

## Resume here (Phase 4a built → review, merge, then Phase 4b)
Phase 4a is implemented and gate-green on `feat/phase4a-kontakt` (all 13 plan tasks done, per-task commits). **Next: final code review → finishing-a-development-branch → merge to `main`** (auto-deploys). Then start **Phase 4b — Newsletter** (signup + Resend Audience + GDPR double opt-in + email templates).
- **Plan:** [docs/superpowers/plans/2026-06-05-vrelo-phase4a-kontakt.md](docs/superpowers/plans/2026-06-05-vrelo-phase4a-kontakt.md) · **Spec:** [docs/superpowers/specs/2026-06-05-vrelo-phase4a-kontakt-design.md](docs/superpowers/specs/2026-06-05-vrelo-phase4a-kontakt-design.md)
- **Before go-live (founder/lawyer):** the Impressum + Datenschutz are **drafts with `[Platzhalter]`** — verify before relying on them. Set the four env vars in Vercel to switch form/scheduler from graceful-fallback to live: `RESEND_API_KEY`, `CONTACT_FROM` (verified Resend domain), `CONTACT_TO`, `NEXT_PUBLIC_CAL_LINK`.
- **OG fonts gotcha:** `ImageResponse`/satori needs a **static** TTF (variable fonts crash it) — the static Fraunces lives at `src/app/_og/Fraunces-SemiBold-static.ttf`.
- **Resend mock gotcha (tests):** under Vitest v4 a `vi.mock("resend")` must use a constructable `function`/`class` (an arrow implementation is not a constructor and `new Resend()` throws) — see `src/app/kontakt/actions.test.ts`.

**Open todos (non-blocking, carry forward):**
- **Founder copy (draft-to-verify):** write the real Über-mich story — replace the 4 `[Platzhalter]` bodies + the lead in `src/lib/ueber-mich.ts` / `src/app/ueber-mich/page.tsx`. Verify the 2b German drafts in `src/lib/{leistungen,faq}.ts` (DSGVO-konform, pricing stance, „innerhalb weniger Wochen / in Tagen“ timeline). Phase 3 adds 3 Ratgeber seed-article drafts to verify before publishing.
- **Custom domain:** future prod domain is **vrelo-ki.de** — swap `siteUrl` in `src/lib/site.ts` when it's connected (Phase 5).
- **MerakClose tuning:** the sunset sits behind an `opacity-80` warm tint, so it reads very subtle — lower the overlay (~60–70) if the founder wants it more visible. Design-polish, not a bug.
- **Video assets:** re-run `npm run optimize:videos` if source clips change; derivatives live in `public/video/` (committed). All clips are 1920×1080 16:9 → `aspect-video`.
- **Polish backlog:** see [Ideas.md](Ideas.md) (logo everywhere, hero ripple, „KI“ wording, darker palette, implicit long-term-partner framing) — schedule as an end-stage design pass. Plus: `GeschichteTeaser` heading, card-radius unification, `CTAButton` ring-offset tone prop.

**Video reference:** `LazyVideo` (`src/components/LazyVideo.tsx`) is the reusable primitive — hydration-safe reduced-motion (poster `<img>` via `useSyncExternalStore`), IntersectionObserver play/pause, `preload="none"`; parents (`StoryBeat`, `MerakClose`) own layout. In this environment use `npm start` (not `npm run dev`) for any manual/Playwright check.

## Tech stack
- **Next.js 16** (App Router, Turbopack) · **TypeScript**
- **Tailwind CSS v4** — brand palette as `@theme` tokens in `src/app/globals.css` (utilities like `bg-papier`, `text-tiefes-wasser`, `bg-amber`)
- **Fonts:** self-hosted via `next/font` (`src/lib/fonts.ts`) — Plus Jakarta Sans + Fraunces
- **Tests:** Vitest + React Testing Library (jsdom)
- **Deploy:** Vercel (project `ajdin42-7733s-projects/vrelo-website`)
- **Conversion (Phase 4a):** `resend` (contact-form email) · `@calcom/embed-react` (consent-gated scheduler). Env documented in `.env.example` (real values in Vercel). Newsletter (Resend Audience + double opt-in) is Phase 4b.

## Project structure
```
src/app/            layout.tsx, page.tsx (homepage), globals.css (brand tokens), per-route pages (leistungen, faq, ueber-mich)
src/components/      BrandWord, CTAButton, Header, Footer, Section, Hero, PageIntro, ClosingCta, LazyVideo · home/ · leistungen/ · faq/ · ueber-mich/
src/lib/            fonts.ts, nav.ts (single source of nav links), content data (leistungen, faq, ueber-mich)
public/logo/        brand assets — symbol SVGs + lockup PNGs (see Brand.md §4)
public/video/       optimized clips + posters (derivatives, committed)
Videos/             4 source clips: Beginning→Second_Part→Thrid_Part→End (drop→ripple→delta→sunset = Quelle→Merak)
docs/superpowers/   specs/ and plans/
Brand.md            brand brief
```
Brand enforcement lives in two places: the **`<BrandWord>`** component (forces Fraunces italic for „Vrelo“/„Merak“) and the **Tailwind `@theme` tokens** (palette discipline). Use them; don't hand-roll colors or italics.

## Commands
```bash
npm run dev      # local dev (http://localhost:3000)
npm test         # Vitest
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check
git push         # deploy: push to main → Vercel auto-deploys to production
```
Vercel CLI is installed (auth: `ajdin42-7733`). Inspect deploys with `vercel ls vrelo-website --scope ajdin42-7733s-projects` / `vercel logs <url>`; manual deploy `vercel deploy --prod --scope ajdin42-7733s-projects`.

## How we work
Greenfield workflow via the superpowers skills, one phase at a time:
1. **brainstorm** → design decisions
2. **writing-plans** → bite-sized, TDD, per-task-commit plan in `docs/superpowers/plans/`
3. **subagent-driven build** → fresh subagent per task, verified on build/test/lint, then code review
4. **finishing-a-development-branch** → merge to `main`

Each phase gets its own branch (`feat/phaseN-...`). Frequent commits; commit messages end with `Co-Authored-By: Claude Opus 4.8`.

## Roadmap
1. ✅ **Foundation & design system** — Next.js shell, brand tokens, fonts, BrandWord, Header/Footer, placeholder Home.
2. ✅ **Core pages** — 2a homepage · 2b Leistungen + FAQ · 2c video system + Über mich. *(all done, deployed live)*
3. ✅ **Ratgeber/MDX + SEO** — article system, 3 seed articles, metadata, JSON-LD, sitemap, OG images. *(merged + deployed live)*
4. 🔨 **Conversion** — 4a Kontakt (contact form + Cal.com scheduler + minimal Impressum/Datenschutz drafts) *(built + gate-green on branch; pending review + merge)* · 4b Newsletter (Resend Audience, GDPR double opt-in) *(next)*.
5. ⬜ **Legal & polish** — finalize Impressum/Datenschutz (founder/lawyer sign-off), perf/SEO pass, custom domain (vrelo-ki.de).

## Key decisions (locked)
- German only; personal brand („Ich“); multi-page content/SEO site.
- German typographic quotes: „…“ = U+201E (open) + U+201C (close) — never English “". Gotcha: the Edit tool can silently downgrade these to ASCII; verify bytes (or write via `fs`) when inserting them.
- Sitemap target IA: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz`. Referenzen folded into Home + Leistungen.
- Ratgeber: MDX content collection at `content/ratgeber/*.mdx`; drafts are dev-only (404 + excluded from index/sitemap in prod). Future custom domain: **vrelo-ki.de** (centralized in `src/lib/site.ts`).
- Hero = Direction B (immersive deep-water); rest of site = calm Papier sections; page ends on the *Merak*-Effekt.
- Videos: full 4-clip sequence on **Über mich**; sunset (`End.mp4`) at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
