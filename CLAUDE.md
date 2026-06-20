# CLAUDE.md — Vrelo Website

Project memory for the **Vrelo** marketing website. Read this first; it links out to the brand brief, the spec, and the per-phase plans.

- **Brand brief (voice, palette, type, logo, compliance):** [Brand.md](Brand.md) — the source for every design/copy decision.
- **Design spec:** [docs/superpowers/specs/2026-06-01-vrelo-website-design.md](docs/superpowers/specs/2026-06-01-vrelo-website-design.md)
- **Specs & plans:** [docs/superpowers/specs/](docs/superpowers/specs/) · [docs/superpowers/plans/](docs/superpowers/plans/)

> Client-facing copy is **German**; code & comments are **English**.

---

## What this is
A content/SEO marketing site for Vrelo, an AI-automation studio for DACH small businesses. Framed as a **personal brand** (first-person „Ich“). Primary goal: convert visitors to a booked call (scheduler) or contact form; secondary: organic search via a German Ratgeber (blog) + a newsletter.

## Status — built, merged & live; refining post-launch
All six roadmap phases plus the post-Phase-6 polish are merged and deployed. Since launch the work has been **copy + design refinement** (see *Changelog* below) — all live. The main blocker to go-live is **owner cutover** (domain, env vars, legal sign-off, Resend) — see the TODO blocks below. **Domain `vrelo-ki.de` is now registered** at **united-domains** (= registrar + DNS + mailbox host); cutover is underway.

- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew — GitHub↔Vercel connected, so **push to `main` auto-deploys to production**.
- All target-IA routes resolve 200 in prod: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz` `/sitemap.xml` `/robots.txt`.

### What each phase shipped
1. **Foundation & design system** — Next.js shell, brand `@theme` tokens, fonts, `BrandWord`, Header/Footer.
2. **Core pages** — homepage, `/leistungen`, `/faq`, `/ueber-mich` + video system (`LazyVideo`).
3. **Ratgeber/MDX + SEO** — `next-mdx-remote` + `gray-matter`, auto-wrap BrandWord remark plugin; metadata, site-wide JSON-LD, sitemap, branded OG images. Drafts are dev-only (404 + excluded from index/sitemap in prod).
4. **Conversion** — **4a Kontakt:** consent-gated Cal.com scheduler (`@calcom/embed-react`, click-to-load) + contact form (Server Action → Resend, honeypot + time-trap); pure core in `src/lib/contact.ts`. **4b Newsletter:** GDPR double opt-in via a **stateless HMAC token** (no DB — the token *is* the pending state) → `/newsletter/bestaetigt` adds the contact to a **Resend Audience**; pure core in `src/lib/newsletter.ts`. Both are **config-driven**: form → `mailto`, scheduler → placeholder, newsletter → „bald verfügbar“ when env is unset (safe until Vercel env is set).
5. **Legal & polish** — legal pages render clickable inline links (`parseInlineLinks` → `LegalPage`, Markdown `[label](url)`); **env-driven `siteUrl`** (`NEXT_PUBLIC_SITE_URL` + `normalizeBase` fallback + `canonical()`); Twitter `summary_large_image` cards + per-page canonicals.
6. **End-stage design pass** — the `RippleImage` WebGL water panel (degrades to a still on reduced-motion / no-WebGL; **now used on the Kontakt banner**); **`BrandLockup`** logo in Header + Footer; full-screen **`MobileNav`** drawer; petrol palette rhythm (`WasIchBaue` + `Steps` are `tone="petrol"`; *tiefes-wasser* reserved for Hero + Footer); favicon `src/app/icon.svg`.

### Post-Phase-6 design system (durable patterns)
All `@theme`-token-based, reduced-motion-safe, CLS-safe, browser-verified 1440/390. Granular live-tuning knobs live under *Open todos → Live nudges*; reusable warnings under *Gotchas*.
- **Hero:** **full-bleed flowing-water backdrop** (`/images/hero-flow.webp`, `next/image fill priority` = LCP) with **centered overlay text** over a petrol `.hero-overlay-scrim`; gentle CSS life — slow ambient zoom (`.hero-scene-img` / `hero-pan`) + 5 drifting light motes (`.hero-dust` / `dust-float`); decorative `alt=""`, motion-safe-gated; H1 reveal transform-only so LCP paints immediately. *(Current render is modest-res ~1376w — fine for abstract dark water; regenerate larger if it softens on big displays.)*
- **Centered spine (homepage):** every section centers its heading + intro on one axis (`mx-auto max-w-[44rem] text-center`); content blocks keep their stronger form — Problem's task list is a centered block with **left-aligned text**, Steps keeps its 3-card grid. One calm axis down the page; body/lists are never centered (it hurts scanning). Built section-by-section via impeccable `live`.
- **Scroll-motion:** shared **`Reveal`** primitive (two-way fade-up; hidden state gated behind `html.reveal-ready` so **no-JS renders everything visible**).
- **Depth/craft utilities:** `.card-depth` (deep-water shadow + inset edge-light), `.shadow-deepwater`, `.cta-fx` (CTA sheen+lift via `filter: drop-shadow`, primary only), button-in-button CTA; `text-balance` on headings, `text-pretty` on body; eyebrow restraint.
- **Imagery:** shared **`PageImage`** (`next/image fill`, rounded deepwater panel); `PageIntro` optional `image` prop drives page banners; cohesive Nano Banana water photography below the fold (Hero stays LCP, German alt) — source in [image_prompt.md](image_prompt.md) → optimized WebP in `public/images/`. Decorative section backdrops (`Steps`/`Proof`/`MerakClose`) **require `isolate`** (see Gotchas).
- **Homepage order:** Hero → Problem → Was ich baue → Steps → Proof → Merak (petrol `WasIchBaue`+`Steps` block; warm `MerakClose` finale). `Was ich baue` is now **image-free** (the service chips carry it); `GeschichteTeaser` was **removed** — the story lives on `/ueber-mich`.

## Next session — planned work (resume here)
> Homepage is **live** on a centered spine with a full-bleed flowing-water hero (`hero-flow.webp`, Direction C), 2026-06-16. No open homepage layout items.
1. **Legal copy** — replace every `[Platzhalter]` in `src/lib/legal/{impressum,datenschutz}.ts` with real, verified copy (founder/lawyer); also sweep its em-dashes → en-dashes (deferred from the route-page sweep).
2. **Design-skill pass on the remaining subpages** — Leistungen/Über-mich/FAQ + **Kontakt** are **done**; remaining: **Ratgeber (revisit — founder wants a dedicated pass, esp. the article reading experience), Newsletter, legal** (taste → high-end-visual-design → impeccable, redesign-preserve; browser-verify 1440/390 + AA).
3. **Re-add the Cal.com scheduler to `/kontakt`** — the redesign dropped it (form-only); the `SchedulerEmbed` component + `calLink()` are preserved, just unrendered. Re-render it once `NEXT_PUBLIC_CAL_LINK` is set.
4. **Cleanup (optional):** the centered-spine pass orphaned `/images/was-ich-baue.webp` and `/video/hero-quelle.jpg` — unused. Remove or keep-for-reuse — decide later. (`RippleImage` is no longer orphaned — reused on the Kontakt banner.)

> **To write a new Ratgeber article, use the project skill `.claude/skills/ratgeber-article/`** — interactive intake → full first draft in brand voice → frontmatter (incl. required `cover`/`coverAlt`, `draft: true`) → cover prompt from `image_prompt.md` §9 + a generation checklist. The covers test (`ratgeber.covers.test.ts`) requires the cover WebP to actually exist, so `npm test` fails until you drop it in.

> **Changelog (newest first; deployed unless noted — git has the detail):**
> - **2026-06-20 (visual) — Kontakt ripple + Über-mich image**: `RippleImage` (the retired hero's WebGL ripple) now lives on the Kontakt water banner — seeded at the existing ring, pointer-ripples, reduced-motion/no-WebGL fallback. Über-mich banner swapped to the Geschichte spring photo at `aspect-[3/2]` (orphaned `geschichte-quelle.webp` removed).
> - **2026-06-20 — Über-mich copy pass + eyebrow cleanup**: intro rewritten to the founder one-liner (…en-dash „und Kaffeeliebhaber“); de-duplicated „Stress“ (kept only in the ripples + fluss beats — quelle → „Hektik“, merak → „Reibung“); `ClosingCta` breaks the double-„auch …?“ cadence and ends on the first-step wedge; „Kleinkram“ kept once (ripples); fixed the Merak reification (a felt result, never a thing to „erreichen“). Also removed the decorative nav-repeat eyebrows above headlines — kept „Rechtliches“, „Vertrauen“, FAQ category headings, article meta/tags, OG labels.
> - **2026-06-19 — Kontakt redesign (shipped)**: form-only page; contact form in a dark `tiefes-wasser` card on papier + redesigned `ContactSuccess` confirmation (drop-ripple ring, `role="status"`); on-dark `signal` error token; scheduler dropped (component kept — re-add when `NEXT_PUBLIC_CAL_LINK` set); message label → „Was raubt dir gerade deine Zeit?“; water image caption. Spec/plan: `docs/superpowers/{specs,plans}/2026-06-19-kontakt-redesign*`.
> - **2026-06-16 — centered-spine layout (impeccable `live`)**: homepage re-laid on a centered spine; Hero → full-bleed flowing-water photo + centered overlay (`hero-flow.webp`); `Was ich baue` image dropped; `GeschichteTeaser` removed. Details in *Key decisions* + *design system*.
> - **2026-06-15/16 — landing-page polish + hero headline**: Hormozi-filtered copy/image pass (`Knowledge/marketing/{LANDING_PAGE,HOOKS}.md`); pain/hours H1 + sub, CTA → „Zeit zurückgewinnen“.
> - **Earlier (2026-06-07/08)** — Ratgeber live (slug `durcheinander-oder-saubere-quelle`, reading surface `lesepapier`); real copy across Über-mich / Leistungen (7 services) / FAQ; `stumm` darkened for AA.

## Gotchas
- **German quotes** „…“ = U+201E (open) + U+201C (close) — never ASCII `"`. The Edit tool can silently downgrade them; verify bytes (or write via `fs`/Write) when inserting them.
- **papier token = `#f4efe6`** (site-wide base — homepage + all marketing pages). The **Ratgeber article pages only** use a deeper reading surface **`lesepapier = #ece3d2`** (L 0.774) via **`Section tone="reading"`** (`bg-lesepapier`), to cut full-page glare on long-form text — a deliberate scoped exception, not site-wide (the marketing pages keep the brighter, more energetic papier). Every text token clears AA on lesepapier (stumm 4.67, ember 5.13, tinte 14.0); going darker (sepia `#e7ddc9`) would drop stumm below 4.5. Article body is also `text-lg` (18px) for reading comfort (`Prose.tsx`).
- **stumm token = `#696359`** (darkened from Brand.md's `#7a7468`) so small uppercase eyebrow/label text clears WCAG AA — **5.19:1 on papier, 4.67:1 on the darker lesepapier**. Accessibility override like ember — confirm hue with the founder before reverting.
- **Grey-on-dark text:** on dark sections the body grey is **`gletscher` `#dce7eb`** (7:1 on petrol, 12:1 on deep water — AA-clean); light-grey-on-dark is the intended look (pure white would glare). The mid-grey **`stein` `#a8b5ba`** is only safe on the darkest **`tiefes-wasser` `#0a2538`** (Footer, 7.5:1) — it **fails AA on `vrelo-petrol`** (4.2:1), so **never `text-stein` on a petrol section**. Hero text over the *photo* depends on `.hero-overlay-scrim`, not just the token — re-check contrast over the brightest water if you lighten the scrim.
- **German dash** the Gedankenstrich is the **en-dash with spaces** „ – “ (U+2013), not the em-dash „—“ (U+2014). Use `–` in client copy.
- **ember token = `#7e5527`** (darkened from Brand.md's `#8b5e2c`) so small ember text on sonnenlicht clears WCAG AA. Accessibility override — confirm with the founder before reverting to the exact brand hex.
- **signal token = `#f0a79a`** — the **on-dark** form-error color (light warm coral). `ember` is dark-on-light and fails on the dark Kontakt card; `signal` is its light counterpart, **8.02:1 on `tiefes-wasser`**. Founder-confirm hue like `ember`/`stumm`. Used by `ContactForm` error text on the dark card only. (On-dark inline links reuse `gletscher` underlined — see `onDarkLink.ts`.)
- **OG images:** `ImageResponse`/satori needs a **static** TTF (variable fonts crash it) — `src/app/_og/Fraunces-SemiBold-static.ttf`.
- **Resend mock (tests):** under Vitest v4 a `vi.mock("resend")` must use a constructable `function`/`class` (an arrow impl is not a constructor) — see `src/app/kontakt/actions.test.ts`.
- **RSC boundary:** you cannot pass a component **as a prop** (`as={Link}`) from a Server Component into a Client Component — wrap it as a child instead.
- **`backdrop-filter` containing block:** any element with `backdrop-filter`/`backdrop-blur` becomes the containing block for `fixed` descendants — portal full-screen overlays out to `document.body` (see `MobileNav`).
- **Section backdrop = `isolate`:** a `-z-…` decorative image inside a `Section` paints *behind the section's own opaque background* unless the section is a stacking context. `position: relative` alone is **not** one (no `z-index`). Add **`isolate`** (`isolation: isolate`) to the `Section` className so negative-z layers sit above the bg, below content (see `Steps`/`Proof`/`MerakClose`).
- **Manual/Playwright checks:** use `npm start` (not `npm run dev`) in this environment.
- **Images:** optimized **WebP derivatives live in `public/images/`** (committed; converted from PNG via `sharp`, quality 80 — ~10MB of source → ~283KB). The **`Images/` source drop folder is gitignored, root-anchored (`/Images/`)** — an unanchored `Images/` also matches `public/images/` because Git is case-insensitive on Windows. Prompt catalog for regenerating: [image_prompt.md](image_prompt.md).
- **`LazyVideo`** (`src/components/LazyVideo.tsx`) is the reusable video primitive — hydration-safe reduced-motion (poster `<img>` via `useSyncExternalStore`), IntersectionObserver play/pause, `preload="none"`; parents own layout. All clips are 1920×1080 16:9 → `aspect-video`. `StoryBeat` accepts `video: false` to render a beat text-only (no clip).
- **Video re-cut workflow:** sources in `Videos/` map to derivative slugs in `scripts/optimize-videos.mjs` — **Beginning→quelle, Second_Part→ripples, Thrid_Part→fluss, End→merak** (the Über-mich beats; `merak` sunset also backs `MerakClose`). The page plays the **derivatives** in `public/video/`, not the source — so after re-cutting a source you must re-run `npm run optimize:videos` (bundled `ffmpeg-static`/`ffprobe-static`, no system ffmpeg) to regenerate `public/video/<slug>.{mp4,webm}` + `<slug>-poster.jpg`, then commit source + derivatives together. To regenerate a single clip, copy that clip's per-slug block from the script (the poster `image2` warning is non-fatal). Derivatives in `public/video/` are committed.

## Owner cutover — TODO (not code; owner/founder action)

**Domain + base URL + legal:** (domain `vrelo-ki.de` registered at **united-domains** — registrar + DNS + mail host; all DNS records below go in the united-domains panel.)
- [ ] Add `vrelo-ki.de` (+ `www`) to the Vercel project → set the DNS records at united-domains → wait for SSL.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de` in Vercel → redeploy. Canonicals/OG/sitemap/robots follow automatically (no code change).
- [ ] Optionally 308-redirect the old `*.vercel.app` URL to the apex.
- [ ] **Founder/lawyer:** replace every `[Platzhalter]` in `src/lib/legal/{impressum,datenschutz}.ts` with real, verified copy (add links with `[label](https://…)` syntax).
- [ ] Post-cutover: resubmit `https://vrelo-ki.de/sitemap.xml` in Google Search Console.

**Kontakt — ✅ LIVE (2026-06-19).** Resend domain `vrelo-ki.de` verified; `RESEND_API_KEY` + `CONTACT_FROM` (`Vrelo <kontakt@vrelo-ki.de>`) + `CONTACT_TO` set in Vercel (Production), redeployed, tested end-to-end (mail received). The form flips live once all three are set (`isContactConfigured()`); the send sets `replyTo` = visitor. **⚠️ `CONTACT_TO` is currently the test inbox `ajdin@vrelo-ki.de` — switch to `kontakt@vrelo-ki.de` (or Yahoo) at launch.** Key fact for the record: this go-live needs the domain *verified in Resend*, **not** pointed at Vercel — it shipped independently of the domain cutover. Still open: `NEXT_PUBLIC_CAL_LINK` (Cal.com scheduler) is unset — separate from the form; the page shows „Online-Terminbuchung folgt in Kürze“ until set.

**Newsletter — Resend setup:**
- [ ] Create a Resend **Audience** → put its id in `NEWSLETTER_AUDIENCE_ID` (this Audience *is* the subscriber list; no DB on our side — we only `contacts.create` confirmed emails into it).
- [ ] Set `NEWSLETTER_SECRET` (a long random string; signs the double-opt-in token — rotating it invalidates outstanding unconfirmed links).
- [ ] Reuses the same verified `CONTACT_FROM` sending domain.
- [ ] **Sending newsletters is not built** — 4b only collects + confirms subscribers. To send an issue, compose a Resend **Broadcast** targeting the Audience (Resend adds the managed unsubscribe link). A future phase could automate Broadcasts.

## Open todos (non-blocking, carry forward)
- **Copywriting skills:** `/ogilvy` `/copywriting` `/copy-editing` `/stop-slop` are installed globally (from `github.com/boraoztunc/skills`, 2026-06-07) — use them for any client-copy work (drafted the Über-mich refinement this way).
- **Live nudges:** Steps `Fließen` tint `bg-vrelo-petrol/70` (↑/↓ for more/less water); MerakClose sunset tint `opacity-80` (lower for a stronger sunset, now that it's visible); hero-bloom `blur` 2.5–4px; homepage petrol divider `/15`↔`/20`; `MobileNav` is not a full Tab focus-trap (acceptable v1).
- **Polish backlog:** see [Ideas.md](Ideas.md).

## Tech stack
- **Next.js 16** (App Router, Turbopack) · **TypeScript**
- **Tailwind CSS v4** — brand palette as `@theme` tokens in `src/app/globals.css` (utilities like `bg-papier`, `text-tiefes-wasser`, `bg-amber`).
- **Fonts:** self-hosted via `next/font` (`src/lib/fonts.ts`) — Plus Jakarta Sans + Fraunces.
- **Tests:** Vitest + React Testing Library (jsdom).
- **Conversion:** `resend` (email) · `@calcom/embed-react` (scheduler). Env documented in `.env.example` (real values in Vercel).
- **Deploy:** Vercel (project `ajdin42-7733s-projects/vrelo-website`). Push to `main` auto-deploys. If the Vercel CLI is installed: `vercel ls vrelo-website --scope ajdin42-7733s-projects`, `vercel logs <url>`, manual `vercel deploy --prod --scope ajdin42-7733s-projects`.

## Project structure
```
src/app/            layout.tsx, page.tsx (homepage), globals.css (brand tokens), per-route pages
src/components/      BrandWord, BrandLockup, CTAButton, Header, MobileNav, Footer, Section, Hero,
                     RippleImage, Reveal, LazyVideo, PageIntro · home/ · leistungen/ · faq/ · ueber-mich/
src/lib/            fonts.ts, nav.ts, site.ts, contact.ts, newsletter.ts, ratgeber.ts, legal/, email/, content data
content/ratgeber/   the Ratgeber MDX articles (frontmatter + body)
public/video/       optimized clips + posters (derivatives, committed)
public/images/      optimized WebP imagery for home + page banners + ratgeber covers (derivatives, committed)
public/logo/        brand assets (see Brand.md §4)
.claude/skills/     project skills — ratgeber-article (scaffold a new Ratgeber article; see Next session)
Videos/             4 source clips: Beginning→Second_Part→Thrid_Part→End (drop→ripple→delta→sunset)
Images/             source image drop folder (gitignored; optimize → public/images/)
docs/superpowers/   specs/ and plans/
Brand.md            brand brief
image_prompt.md     image-generation prompt catalog (home, pages, Ratgeber motifs)
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

## How we work
Greenfield workflow via the superpowers skills, one feature/phase at a time, each on its own `feat/*` (or `fix/*`) branch:
1. **brainstorm** → design decisions (visual choices resolved via live demos)
2. **writing-plans** → bite-sized, TDD, per-task-commit plan in `docs/superpowers/plans/`
3. **build** → verified on test/tsc/lint/build, then code review
4. **finishing-a-development-branch** → merge to `main`

Frequent commits; commit messages end with `Co-Authored-By: Claude Opus 4.8`.

## Key decisions (locked)
- German only; personal brand („Ich“); multi-page content/SEO site; calm-over-loud per Brand.md.
- **Generic masculine** in client copy (e.g. „Kunden“, „Kollegen“) — **not** `:innen`/gendered forms. The founder's voice; applied site-wide (2026-06-07). Follow it in all new copy.
- **Founder name = `Ajdin Dzafic`** (ASCII, no diacritics) across the website incl. JSON-LD (`FOUNDER` in `src/lib/jsonld.ts`). Deliberate — don't realign it to the company-docs form `Ajdin Džafić` (2026-06-16).
- Future prod domain: **vrelo-ki.de** (base URL centralized + env-driven in `src/lib/site.ts`).
- Hero = **full-bleed flowing-water backdrop** (Direction C — cool petrol, abstract; centered overlay text over a petrol scrim; slow CSS zoom + light motes). Chosen 2026-06-16, **replacing** the warm *Merak* "work done" desk scene — the founder preferred the calm "system runs itself" flow as a quiet background over the literal payoff. Still **no people** (brand rule holds). Image prompt = `image_prompt.md` §0 C.
- **Centered spine** (2026-06-16): homepage sections center heading + intro on one axis; lists/cards/grids keep their form and body text stays left-aligned. Why: one calm focus down the page that fits the brand, without the scannability cost of centering body copy. Removed `GeschichteTeaser` in the same pass (redundant with `/ueber-mich`).
- **Hero copy = short pain H1 + substance in the sub** (2026-06-16): H1 „Manuelle Aufgaben rauben dir die Zeit.“ (one line, „manuelle“ implies *automatable*); sub names service + tasks and ends on „So gewinnst du jede Woche Stunden zurück.“ Why: an impeccable critique caught the prior two-sentence H1 running to 6 lines — too heavy. The relief + the *hours* moved to the sub; the *Vrelo*/*Merak* duality lives in `MerakClose`, not the H1. Use honest quantities („Stunden“) — no invented precise figures.
- **Primary CTA = „Zeit zurückgewinnen“** (2026-06-16) — the `CTAButton` *default*, so it's site-wide (Header/MobileNav/`ClosingCta`/Hero/`MerakClose`; asserted in `CTAButton.test.tsx`). Why: benefit-led, echoes the time/hours hero; works everywhere because the nav also has a plain „Kontakt“ link. Kept calm — no exclamation/hype. (Superseded „Ruhe gewinnen“ → off-message once the hero led on time; earlier: „Unverbindlich kennenlernen“, „Quelle erkunden“.)
- **Hormozi skills are framework/output only** — keep the Vrelo voice (calm-over-hype) on top; their artifacts live in `Knowledge/marketing/`, never shipped verbatim.
- Videos: full 4-clip sequence on **Über mich**; sunset at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
