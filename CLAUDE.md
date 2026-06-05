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
- **Phase 4a (Kontakt) — DONE, merged + deployed live** (merge `067b271`). Consent-gated Cal.com scheduler (`@calcom/embed-react`, click-to-load) + contact form (Server Action → Resend) with honeypot + time-trap spam guards; pure tested core in `src/lib/contact.ts` (`evaluateSubmission` decision). Config-driven: form → `mailto` and scheduler → placeholder when env unset (safe until the four Vercel env vars are set). Minimal German **Impressum + Datenschutzerklärung** drafts (`src/lib/legal/`, with `[Platzhalter]`) so collecting PII is lawful. Final review fixes applied (Resend `{error}` handling, form-value preservation, consent a11y).
- **Phase 4b (Newsletter) — DONE, merged + deployed live** (merge `969647b`). GDPR double opt-in via a **stateless HMAC-signed token** (no DB — the token is the pending state); `/newsletter` page + compact Footer form (Server Action → Resend confirm email) → `/newsletter/bestaetigt` verifies the token and adds the contact to a **Resend Audience** (`contacts.create`). Pure tested core in `src/lib/newsletter.ts` (`signToken`/`verifyToken`/`evaluateSignup`); branded confirm email in `src/lib/email/newsletter-confirm.ts`. Config-driven graceful degradation (form + Footer fall back to „bald verfügbar“ when env unset). Datenschutz „Newsletter“ section filled. Final review fixes applied (Footer config-guard, optional PageIntro lead, checkbox a11y id). Full gate green: 133 tests · tsc · lint · build.
- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew (GitHub↔Vercel connected → push to `main` auto-deploys to production).
- **Deploy verified (post-4b):** latest prod deployment ● Ready; all routes 200 live — `/` `/kontakt` `/impressum` `/datenschutz` `/newsletter` `/newsletter/bestaetigt`. The whole target IA now resolves in prod. (`<Link>` prefetch may still log harmless console 404s.)

## Resume here (Phase 4 complete → next: Phase 5 Legal & polish)
Phases 1–4 are merged + deployed. **Next development phase: Phase 5 — Legal & polish + custom domain** via the usual brainstorm → spec → plan → subagent-driven build cycle.

**Next steps (do in order — continue here):**
1. **Phase 5 — Legal & polish:** founder/lawyer finalize Impressum + Datenschutz (replace `[Platzhalter]`, make the EU OS-Plattform URL clickable); perf/SEO pass; connect custom domain **vrelo-ki.de** (swap `siteUrl` in `src/lib/site.ts`). Brainstorm → spec → plan first.
2. **End-stage (after Phase 5):** run the frontend design-skills polish pass — see [Ideas.md](Ideas.md) #6 (`frontend_design_kowalski` + `design-taste-frontend` + `impeccable`).

See the owner go-live todos below (Vercel env for Kontakt + Newsletter; Resend Audience + Broadcasts) — those flip the conversion features from safe-fallback to fully live.

**Phase 4a go-live follow-ups — TODO (not code — owner action, non-blocking):**
- [ ] **Set the four env vars in Vercel** (then redeploy) to flip form/scheduler from graceful-fallback to live: `RESEND_API_KEY`, `CONTACT_FROM` (verified Resend domain), `CONTACT_TO`, `NEXT_PUBLIC_CAL_LINK`. Without them `/kontakt` is safe but shows `mailto` + scheduler placeholder.
- [ ] **Verify a Resend sending domain** (SPF/DKIM) for `CONTACT_FROM` — until then the form is configured-but-won't-send; the `mailto` fallback covers the gap. Ties to **vrelo-ki.de** (Phase 5).
- [ ] **Provide the Cal.com link** (`NEXT_PUBLIC_CAL_LINK`, e.g. `vrelo/kennenlernen`) — until set the scheduler shows the „folgt in Kürze“ placeholder.
- [ ] **Founder/lawyer:** verify the Impressum + Datenschutz **drafts** (replace every `[Platzhalter]`) before relying on them.
- [ ] **At legal go-live:** make the EU OS-Plattform URL in `src/lib/legal/impressum.ts` a real clickable link (the `LegalPage` renderer currently emits plain `<p>` text only — needs a richer body type for inline links).

**Phase 4b go-live / Resend setup — TODO (owner action; the newsletter signup pipeline is code, but Resend itself is configured + operated by you):**
- [ ] **Create a Resend Audience** in the Resend dashboard → copy its id into the `NEWSLETTER_AUDIENCE_ID` env var in Vercel. This Audience *is* the stored subscriber list (no DB on our side; we only `contacts.create` confirmed emails into it).
- [ ] **Set `NEWSLETTER_SECRET`** in Vercel (a long random string; signs the double-opt-in token). Rotating it invalidates outstanding unconfirmed links.
- [ ] **Verify the Resend sending domain** for `CONTACT_FROM` (reused as the newsletter sender) so the confirmation email actually delivers — same SPF/DKIM step as 4a; ties to **vrelo-ki.de**.
- [ ] **Sending newsletters is NOT built in 4b** — 4b only collects + confirms subscribers into the Audience. To send an issue, compose a **Resend Broadcast** (Resend dashboard or Broadcasts API) targeting the Audience; Resend adds the managed unsubscribe link automatically (flips the contact's `unsubscribed` flag). A future phase can automate Broadcasts if wanted.

- **Phase 4a plan/spec (reference):** [docs/superpowers/plans/2026-06-05-vrelo-phase4a-kontakt.md](docs/superpowers/plans/2026-06-05-vrelo-phase4a-kontakt.md) · [docs/superpowers/specs/2026-06-05-vrelo-phase4a-kontakt-design.md](docs/superpowers/specs/2026-06-05-vrelo-phase4a-kontakt-design.md)
- **Phase 4b plan/spec (reference, shipped):** [docs/superpowers/plans/2026-06-05-vrelo-phase4b-newsletter.md](docs/superpowers/plans/2026-06-05-vrelo-phase4b-newsletter.md) · [docs/superpowers/specs/2026-06-05-vrelo-phase4b-newsletter-design.md](docs/superpowers/specs/2026-06-05-vrelo-phase4b-newsletter-design.md)
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
4. ✅ **Conversion** — 4a Kontakt (contact form + Cal.com scheduler + minimal Impressum/Datenschutz drafts) · 4b Newsletter (stateless double opt-in + Resend Audience). *(both merged + deployed live)*
5. 🔨 **Legal & polish** — finalize Impressum/Datenschutz (founder/lawyer sign-off), perf/SEO pass, custom domain (vrelo-ki.de). *(next)*

## Key decisions (locked)
- German only; personal brand („Ich“); multi-page content/SEO site.
- German typographic quotes: „…“ = U+201E (open) + U+201C (close) — never English “". Gotcha: the Edit tool can silently downgrade these to ASCII; verify bytes (or write via `fs`) when inserting them.
- Sitemap target IA: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz`. Referenzen folded into Home + Leistungen.
- Ratgeber: MDX content collection at `content/ratgeber/*.mdx`; drafts are dev-only (404 + excluded from index/sitemap in prod). Future custom domain: **vrelo-ki.de** (centralized in `src/lib/site.ts`).
- Hero = Direction B (immersive deep-water); rest of site = calm Papier sections; page ends on the *Merak*-Effekt.
- Videos: full 4-clip sequence on **Über mich**; sunset (`End.mp4`) at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
