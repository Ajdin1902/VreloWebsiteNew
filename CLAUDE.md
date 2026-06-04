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
- **Phase 2c (video system + Über mich) — IN PROGRESS** on branch `feat/phase2c-video-ueber-mich`: brainstorm done, **spec + plan written and committed, NOT yet executed** (see Resume below).
- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew (GitHub↔Vercel connected → push to `main` auto-deploys to production).
- **Unpushed on `main`:** one doc-only commit (`ffb1ff0`, "mark Phase 2b deployed") — push was deferred; will fold into the next deploy.
- **Known dead links in prod:** `/ueber-mich` `/ratgeber` `/kontakt` still 404 (2c not deployed yet); nav `<Link>` prefetch logs harmless console 404s.

## Resume here (Phase 2c — EXECUTE the plan)
On branch `feat/phase2c-video-ueber-mich`. Brainstorm + spec + plan are **done and committed**; next step is to **execute the 8-task plan** via subagent-driven-development (fresh subagent per task, two-stage review), then finishing-a-development-branch.
- **Plan:** [docs/superpowers/plans/2026-06-04-vrelo-phase2c-video-ueber-mich.md](docs/superpowers/plans/2026-06-04-vrelo-phase2c-video-ueber-mich.md)
- **Spec:** [docs/superpowers/specs/2026-06-04-vrelo-phase2c-video-ueber-mich-design.md](docs/superpowers/specs/2026-06-04-vrelo-phase2c-video-ueber-mich-design.md)

**What the plan builds:** one reusable `LazyVideo` (Approach A — dumb component, layout owned by parents; `prefers-reduced-motion` → poster `<img>`, IntersectionObserver play/pause, `preload="none"`); an `/ueber-mich` 4-beat narrative (data-driven `src/lib/ueber-mich.ts` → `StoryBeat` → page; story bodies are German `[Platzhalter]` prompts — founder writes the real copy); and wiring the sunset clip into `MerakClose`.

**Locked decisions / gotchas for execution:**
- **No ffmpeg on this box** → Task 1 installs `ffmpeg-static`+`ffprobe-static` (npm, no admin) and runs `scripts/optimize-videos.mjs` to produce `public/video/{quelle,ripples,fluss,merak}.{mp4,webm}` + `-poster.jpg`. **Task 1 is the heaviest step** (transcodes 4 clips, ~minutes, resource-flaky) — watch it. Clip→slug map: Beginning→`quelle`, Second_Part→`ripples`, Thrid_Part→`fluss`, End→`merak`.
- Aspect ratio of clips is unknown until Task 1 probes it; `StoryBeat` defaults to `aspect-video` — swap if the probe shows otherwise (Task 5 note).
- jsdom lacks `matchMedia`/`IntersectionObserver`/media playback → Task 2 adds global stubs to `vitest.setup.ts`; `LazyVideo.test.tsx` overrides them per-case.
- Use `npm start` (not `npm run dev`) to drive any manual/Playwright check — dev's per-request compile hangs navigation in this environment.

**Open todos (non-blocking, carry into a later session):**
- **Founder copy review:** the 2b German is Claude-drafted — refine wording in `src/lib/{leistungen,faq}.ts`; verify the 3 *draft-to-verify* claims before relying on them publicly: DSGVO-konform, pricing stance, the „innerhalb weniger Wochen / in Tagen" timeline.
- **Polish (accumulated):** `GeschichteTeaser` h2 is the eyebrow (dominant line is a blockquote) — reconsider; unify card radius (`rounded-xl` vs `rounded-2xl`); `CTAButton` hardcodes `focus-visible:ring-offset-papier` (slightly off on warm/`ClosingCta` sections — add a tone/ringOffset prop).

**Phase 2b shipped:** `/leistungen` (PageIntro → 4 tonal service blocks → Referenzen placeholder → warm ClosingCta) + `/faq` (native `<details>` accordion, 3 themes) + shared `PageIntro`/`ClosingCta`, `Section.tint`, typed `src/lib/{leistungen,faq}.ts`. German draft copy lives in those data files + the [2b spec](docs/superpowers/specs/2026-06-02-vrelo-phase2b-leistungen-faq-design.md) (founder to refine; 3 *draft-to-verify* claims flagged: DSGVO, pricing, timeline).

**Phase 2 plans:** ✅ 2a homepage · ✅ 2b Leistungen + FAQ · 🔄 2c video system + Über mich (spec + plan committed; executing the 8-task plan next).

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
2. 🔄 **Core pages** — **2a** homepage *(✅ done, deployed live)*, **2b** Leistungen + FAQ *(✅ done, deployed live)*, **2c** video system + Über mich (4-clip narrative) *(next)*. *Uses the `frontend-design` skill.*
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
