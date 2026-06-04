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
- **Phase 1 (foundation) — DONE**, merged + deployed live.
- **Phase 2a (homepage) — DONE**, merged + pushed to `main`, **deployed live** at https://vrelo-website.vercel.app.
- **Phase 2b (Leistungen + FAQ) — DONE**, merged + pushed to `main`, **deployed live** (`/leistungen` + `/faq` resolve in prod).
- **Phase 2c (video system + Über mich) — DONE**, merged + pushed to `main`, **deployed live** (`/ueber-mich` resolves in prod). Shipped: `LazyVideo`, optimized video assets in `public/video/`, `/ueber-mich` 4-beat page, sunset wired into `MerakClose`. Full gate green (36 tests · tsc · lint · build all 5 routes static).
- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew (GitHub↔Vercel connected → push to `main` auto-deploys to production).
- **Known dead links in prod:** `/ratgeber` `/kontakt` still 404 (built in later phases); nav `<Link>` prefetch logs harmless console 404s.

## Resume here (Phase 3 — Ratgeber/MDX + SEO)
Phases 1–2 are done and deployed live. Next: **Phase 3 — Ratgeber/MDX + SEO** (brainstorm → writing-plans → new branch `feat/phase3-…`): MDX article system, ~3 seed articles, per-article metadata + JSON-LD, sitemap. Folds Ratgeber into the nav (`/ratgeber` is currently a dead link).

**Open todos (non-blocking, carry forward):**
- **Founder copy:** write the real Über-mich story — replace the 4 `[Platzhalter]` bodies + the lead in `src/lib/ueber-mich.ts` / `src/app/ueber-mich/page.tsx`. Same for the 2b German drafts in `src/lib/{leistungen,faq}.ts`; verify the 3 *draft-to-verify* claims (DSGVO-konform, pricing stance, „innerhalb weniger Wochen / in Tagen" timeline).
- **MerakClose tuning:** the sunset sits behind an `opacity-80` warm tint, so it reads as a very subtle presence — if the founder wants the sunset more visible, lower the overlay opacity (~60–70). Design-polish, not a bug.
- **Video assets:** re-run `npm run optimize:videos` if source clips change; derivatives live in `public/video/` (committed). All clips are 1920×1080 16:9 → `aspect-video`.
- **Polish backlog:** see [Ideas.md](Ideas.md) (logo everywhere, hero ripple, „KI" wording, darker palette) — schedule as an end-stage design pass. Plus earlier: `GeschichteTeaser` heading, card-radius unification, `CTAButton` ring-offset tone prop.

**Phase 2c reference:** [plan](docs/superpowers/plans/2026-06-04-vrelo-phase2c-video-ueber-mich.md) · [spec](docs/superpowers/specs/2026-06-04-vrelo-phase2c-video-ueber-mich-design.md). `LazyVideo` (`src/components/LazyVideo.tsx`) is the reusable video primitive: `useSyncExternalStore` for hydration-safe reduced-motion (poster `<img>`), IntersectionObserver play/pause, `preload="none"`; layout owned by parents (`StoryBeat`, `MerakClose`). Use `npm start` (not `npm run dev`) for any manual/Playwright check in this environment.

**Phase 2 plans:** ✅ 2a homepage · ✅ 2b Leistungen + FAQ · ✅ 2c video system + Über mich (deployed live).

## Tech stack
- **Next.js 16** (App Router, Turbopack) · **TypeScript**
- **Tailwind CSS v4** — brand palette as `@theme` tokens in `src/app/globals.css` (utilities like `bg-papier`, `text-tiefes-wasser`, `bg-amber`)
- **Fonts:** self-hosted via `next/font` (`src/lib/fonts.ts`) — Plus Jakarta Sans + Fraunces
- **Tests:** Vitest + React Testing Library (jsdom)
- **Deploy:** Vercel (project `ajdin42-7733s-projects/vrelo-website`)
- **Planned (later phases):** MDX for Ratgeber articles · Resend (contact form + newsletter) · Cal.com (scheduler embed)

## Project structure
```
src/app/            layout.tsx, page.tsx (homepage), globals.css (brand tokens)
src/components/      BrandWord, CTAButton, Header, Footer, Section, Hero · home/ (6 homepage sections)
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
2. ✅ **Core pages** — **2a** homepage *(✅ done, deployed live)*, **2b** Leistungen + FAQ *(✅ done, deployed live)*, **2c** video system + Über mich (4-clip narrative) *(✅ done, deployed live)*. *Uses the `frontend-design` skill.*
3. ⬜ **Ratgeber/MDX + SEO** — article system, 3 seed articles, metadata, JSON-LD, sitemap.
4. ⬜ **Conversion** — contact form, Cal.com scheduler, newsletter (Resend, GDPR double opt-in).
5. ⬜ **Legal & polish** — Impressum/Datenschutz, video optimization, perf/SEO pass, custom domain (vrelo.de).

## Key decisions (locked)
- German only; personal brand („Ich"); multi-page content/SEO site.
- German typographic quotes: „…" = U+201E (open) + U+201C (close) — never English "". Gotcha: the Edit tool can silently downgrade these to ASCII; verify bytes (or write via `fs`) when inserting them.
- Sitemap: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz`. Referenzen folded into Home + Leistungen.
- Hero = Direction B (immersive deep-water); rest of site = calm Papier sections; page ends on the *Merak*-Effekt.
- Videos: full 4-clip sequence on **Über mich**; sunset (`End.mp4`) at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
