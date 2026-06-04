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
- **Phases 1–2c — DONE**, merged + deployed live. Homepage, `/leistungen`, `/faq`, `/ueber-mich` all resolve in prod. Video system (`LazyVideo` + `public/video/`) shipped; sunset wired into `MerakClose`. Full gate green at 2c (36 tests · tsc · lint · build, 5 routes static).
- **Phase 3 (Ratgeber/MDX + SEO) — PLANNED, not built yet.** Brainstorm done; spec + a 23-task TDD plan written and committed on branch `feat/phase3-ratgeber-seo`. Implementation pending.
- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew (GitHub↔Vercel connected → push to `main` auto-deploys to production).
- **Known dead links in prod:** `/ratgeber` and `/kontakt` 404 until their phases ship (`/ratgeber` resolves once Phase 3 deploys). Nav `<Link>` prefetch logs harmless console 404s.

## Resume here (execute Phase 3)
Spec + plan for **Phase 3 — Ratgeber/MDX + SEO** are done. **Next: execute the plan** task-by-task (subagent-driven-development), then finishing-a-development-branch → merge `feat/phase3-ratgeber-seo` to `main`.
- **Plan:** [docs/superpowers/plans/2026-06-04-vrelo-phase3-ratgeber-seo.md](docs/superpowers/plans/2026-06-04-vrelo-phase3-ratgeber-seo.md) — 23 TDD tasks.
- **Spec:** [docs/superpowers/specs/2026-06-04-vrelo-phase3-ratgeber-seo-design.md](docs/superpowers/specs/2026-06-04-vrelo-phase3-ratgeber-seo-design.md)
- **Scope:** `content/ratgeber/*.mdx` rendered via `next-mdx-remote`; 3 draft seed articles (dev-only preview — prod ships an empty Ratgeber until the founder sets `draft: false`); auto-wrap remark plugin for „Vrelo“/„Merak“; site-wide JSON-LD; `sitemap.xml` + `robots.txt`; branded OG images. `/ratgeber` is already in `nav.ts` — it goes live when the index page lands.

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
- **Planned:** MDX via `next-mdx-remote` + `gray-matter` for Ratgeber (Phase 3) · Resend (contact form + newsletter, Phase 4) · Cal.com scheduler (Phase 4)

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
3. ⬜ **Ratgeber/MDX + SEO** — article system, 3 seed articles, metadata, JSON-LD, sitemap, OG images. *(spec + plan done; build pending)*
4. ⬜ **Conversion** — contact form, Cal.com scheduler, newsletter (Resend, GDPR double opt-in).
5. ⬜ **Legal & polish** — Impressum/Datenschutz, perf/SEO pass, custom domain (vrelo-ki.de).

## Key decisions (locked)
- German only; personal brand („Ich“); multi-page content/SEO site.
- German typographic quotes: „…“ = U+201E (open) + U+201C (close) — never English "". Gotcha: the Edit tool can silently downgrade these to ASCII; verify bytes (or write via `fs`) when inserting them.
- Sitemap target IA: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz`. Referenzen folded into Home + Leistungen.
- Ratgeber: MDX content collection at `content/ratgeber/*.mdx`; drafts are dev-only (404 + excluded from index/sitemap in prod). Future custom domain: **vrelo-ki.de** (centralized in `src/lib/site.ts`).
- Hero = Direction B (immersive deep-water); rest of site = calm Papier sections; page ends on the *Merak*-Effekt.
- Videos: full 4-clip sequence on **Über mich**; sunset (`End.mp4`) at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
