# CLAUDE.md — Vrelo Website

Project memory for the **Vrelo** marketing website. Read this first; it links out to the brand brief, the spec, and the per-phase plans.

- **Brand brief (voice, palette, type, logo, compliance):** [Brand.md](Brand.md) — the source for every design/copy decision.
- **Design spec:** [docs/superpowers/specs/2026-06-01-vrelo-website-design.md](docs/superpowers/specs/2026-06-01-vrelo-website-design.md)
- **Specs & plans:** [docs/superpowers/specs/](docs/superpowers/specs/) · [docs/superpowers/plans/](docs/superpowers/plans/)

> Client-facing copy is **German**; code & comments are **English**.

---

## What this is
A content/SEO marketing site for Vrelo, an AI-automation studio for DACH small businesses. Framed as a **personal brand** (first-person „Ich“). Primary goal: convert visitors to a booked call (scheduler) or contact form; secondary: organic search via a German Ratgeber (blog) + a newsletter.

## Status — everything built, merged & live; only owner cutover remains
All six roadmap phases plus the post-Phase-6 polish are merged and deployed. **No code phase is queued.** The only remaining work is **owner cutover** (domain, env vars, legal sign-off, Resend) — see the TODO blocks below.

- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew — GitHub↔Vercel connected, so **push to `main` auto-deploys to production**.
- All target-IA routes resolve 200 in prod: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz` `/sitemap.xml` `/robots.txt`.

### What each phase shipped
1. **Foundation & design system** — Next.js shell, brand `@theme` tokens, fonts, `BrandWord`, Header/Footer.
2. **Core pages** — homepage, `/leistungen`, `/faq`, `/ueber-mich` + video system (`LazyVideo`).
3. **Ratgeber/MDX + SEO** — `next-mdx-remote` + `gray-matter`, auto-wrap BrandWord remark plugin; metadata, site-wide JSON-LD, sitemap, branded OG images. Drafts are dev-only (404 + excluded from index/sitemap in prod).
4. **Conversion** — **4a Kontakt:** consent-gated Cal.com scheduler (`@calcom/embed-react`, click-to-load) + contact form (Server Action → Resend, honeypot + time-trap); pure core in `src/lib/contact.ts`. **4b Newsletter:** GDPR double opt-in via a **stateless HMAC token** (no DB — the token *is* the pending state) → `/newsletter/bestaetigt` adds the contact to a **Resend Audience**; pure core in `src/lib/newsletter.ts`. Both are **config-driven**: form → `mailto`, scheduler → placeholder, newsletter → „bald verfügbar“ when env is unset (safe until Vercel env is set).
5. **Legal & polish** — legal pages render clickable inline links (`parseInlineLinks` → `LegalPage`, Markdown `[label](url)`); **env-driven `siteUrl`** (`NEXT_PUBLIC_SITE_URL` + `normalizeBase` fallback + `canonical()`); Twitter `summary_large_image` cards + per-page canonicals.
6. **End-stage design pass** — interactive **WebGL water Hero** (`RippleImage`: static `<img>` is the LCP, deferred WebGL canvas ripples under the pointer, amber drop seeds a ripple; degrades to the still image on reduced-motion / no-WebGL / shader-link-failure); **`BrandLockup`** logo in Header + Footer; full-screen **`MobileNav`** drawer; petrol palette rhythm (`WasIchBaue` + `Steps` are `tone="petrol"`; *tiefes-wasser* reserved for Hero + Footer); partner-framing copy (draft-to-verify); favicon `src/app/icon.svg`.

### Post-Phase-6 follow-ups (all `@theme`-token-based, reduced-motion-safe, CLS-safe)
- **Hero refinement** — right panel = `public/video/hero-quelle.jpg` (a frame from `Videos/Beginning.mp4`); `.hero-drop` is a centered seamless warm bloom; `RippleImage` gained `seedYFraction` so the Hero seeds the ripple from panel center `(0.5, 0.5)`.
- **Motion polish** — CTA sheen+lift (`.cta-fx`; uses `filter: drop-shadow` so the focus-visible ring is never clobbered; primary variant only). Hero text reveal-on-load (`.hero-reveal-*`; **H1 transform-only** so LCP paints immediately). Two-way homepage scroll-reveal (shared **`Reveal`** primitive; hidden state gated behind `html.reveal-ready` so **no-JS renders everything visible**).
- **Homepage narrative reorder** — Hero → Problem → Was ich baue → So läuft's ab → Proof → Geschichte → Merak. `WasIchBaue` + `Steps` form one continuous petrol block (hairline `border-t border-gletscher/15` seam); the warm **Geschichte → Merak** pair is the emotional finale.
- **Mobile-nav fix** — the drawer is portaled to `document.body`. The Header's `backdrop-blur` was making it the containing block for `fixed` descendants, so `fixed inset-0` sized to the header bar (~64px) and links overflowed with no background (the "transparent drawer" bug).
- **Hero ripple cadence** — the Hero seeds the water ripple every **3s** (`seedIntervalMs={3000}`); `RippleImage` default stays 5s.
- **Homepage design-polish trio** — three design skills run over the homepage, redesign-preserve (keep the locked brand, calm-over-loud), browser-verified at 1440 + 390:
  - **taste (`design-taste-frontend`)** — eyebrow restraint (5 section eyebrows → 2: only „Was ich baue“ + „Die Geschichte“; the headline carries the rest); tightened hero subtext; em-dash → German **en-dash** (Halbgeviertstrich „ – “) across the copy.
  - **high-end craft (`high-end-visual-design`)** — spatial rhythm (`Section` `py-24 md:py-32`); haptic card depth (`.card-depth`: soft deep-water-tinted shadow + inset top edge-light) on the petrol cards; hero panel shadow retinted black → deep-water (`.shadow-deepwater`); button-in-button CTA (nested trailing-arrow circle, hover-shift) + text-link arrow hover; `tracking-tight` on the sans section headings.
  - **impeccable (`impeccable`, `polish`)** — WCAG **AA contrast** fixes: „Was ich baue“ eyebrow `text-stein`→`text-gletscher` (4.20→7.02 on petrol); **ember token darkened `#8b5e2c`→`#7e5527`** so small ember text on sonnenlicht clears AA (4.47→5.20; large headings unaffected). Type refinement: `text-balance` on headings, `text-pretty` on body.
- **Water imagery (home + pages)** — cohesive Nano Banana water photography (brand water world, cool-dominant), below the fold (Hero stays LCP), German alt text, browser-verified. Prompts in [image_prompt.md](image_prompt.md); optimized WebP in `public/images/`.
  - **Foreground (`next/image`):** shared **`PageImage`** component (rounded `.shadow-deepwater` panel, `next/image fill`). Home `GeschichteTeaser` 2-col with the Bosnian karst spring; `WasIchBaue` 2-col with a portrait drop panel. `PageIntro` has an **optional `image` prop** (`{ src, alt, ratio }`, renders `PageImage`) driving **top banners** on `/leistungen` (21:9), `/ueber-mich` (16:9), `/ratgeber` (16:9), `/newsletter` (16:9). On **`/kontakt` (21:9) + `/faq` (16:9) the image sits at the page bottom** (content-first: scheduler/questions lead, image closes) via `PageImage` in a trailing `Section`.
  - **Section backdrops (decorative `<img>` + tint):** `Steps` has a faint **Fließen** backdrop (`bg-vrelo-petrol/70` tint), `Proof` a faint texture (`bg-papier/88`). Pattern mirrors `MerakClose` — **requires `isolate` on the `Section`** (see Gotchas) or the `-z` image hides behind the section bg. Fixing that also un-hid the **MerakClose sunset**, which had been invisible since launch.
  - **Footer:** the „Newsletter“ heading + its fallback now link to `/newsletter` (the page isn't in the top nav, so the footer is its entry point).
  - **Shipped (2026-06-07):** the Ratgeber **per-article covers** — banner above the article title + 16:9 index thumbnail; `cover`/`coverAlt` are required frontmatter; 3 seed covers in `public/images/ratgeber-{termine,zeit,system}.webp`. One spare cover + an index-header variant remain in `Images/`. (See the „Done 2026-06-07“ note under *Next session*.)

## Next session — planned work (resume here)
1. **Real copy + subpage review** — go page by page and replace placeholders / verify drafts: Über-mich (4 `[Platzhalter]` + lead in `src/lib/ueber-mich.ts`), the Leistungen + FAQ German drafts (`src/lib/{leistungen,faq}.ts`), the 3 Ratgeber seed articles, and the legal `[Platzhalter]` (`src/lib/legal/*`). (Supersedes the "Founder copy" item in Open todos.)
2. **Ratgeber authoring skill** — build a custom skill that scaffolds a new Ratgeber MDX article end-to-end: frontmatter (title/description/date/**required `cover` + `coverAlt`**/draft), BrandWord-aware body in the brand voice, and the matching cover-image prompt from `image_prompt.md`. Goal: produce a consistent, on-brand article on demand. (The cover system it must feed is now built — see below.)
3. **Kontakt form** — finalize the contact form: set the Resend env + Cal link (see Owner cutover), then verify `ContactForm` end-to-end (Server Action → Resend), spam guards, and the success/error states live.
4. **Design-skill pass on all subpages** — run the trio (taste → high-end-visual-design → impeccable) over every subpage (Leistungen, Über-mich, FAQ, Ratgeber + article, Kontakt, Newsletter, legal), same as the homepage pass; browser-verify + AA contrast.

> **Done 2026-06-07 — Ratgeber per-article cover system** (was the old item 2). `cover` + `coverAlt` are now **required** MDX frontmatter — `parseArticle` throws if either is missing (`src/lib/ratgeber.ts`); enforced by `src/lib/ratgeber.covers.test.ts` (asserts each cover exists in `public/`). The cover renders as a **banner above the article title** (`src/app/ratgeber/[slug]/page.tsx`, `max-w-4xl` `PageImage`) and as a **16:9 thumbnail** in the index list (`ArticleCard`, stacks on mobile via `flex-col`→`sm:flex-row`). **`PageImage` gained an optional `sizes` prop** (default = banner hint; thumbnail passes a small one). Branded OG card unchanged. 3 seed covers shipped as WebP: `public/images/ratgeber-{termine,zeit,system}.webp` (German alt is draft-to-verify). Spare art for the next article: `Images/Ratgeber_article_.png` (calm twilight) + `Images/Ratgeber_Index_Header.png`. **Merged to `main` locally — NOT yet pushed/deployed.** Spec/plan: `docs/superpowers/{specs,plans}/2026-06-07-vrelo-ratgeber-covers*`.

## Gotchas
- **German quotes** „…“ = U+201E (open) + U+201C (close) — never ASCII `"`. The Edit tool can silently downgrade them; verify bytes (or write via `fs`/Write) when inserting them.
- **German dash** the Gedankenstrich is the **en-dash with spaces** „ – “ (U+2013), not the em-dash „—“ (U+2014). Use `–` in client copy.
- **ember token = `#7e5527`** (darkened from Brand.md's `#8b5e2c`) so small ember text on sonnenlicht clears WCAG AA. Accessibility override — confirm with the founder before reverting to the exact brand hex.
- **OG images:** `ImageResponse`/satori needs a **static** TTF (variable fonts crash it) — `src/app/_og/Fraunces-SemiBold-static.ttf`.
- **Resend mock (tests):** under Vitest v4 a `vi.mock("resend")` must use a constructable `function`/`class` (an arrow impl is not a constructor) — see `src/app/kontakt/actions.test.ts`.
- **RSC boundary:** you cannot pass a component **as a prop** (`as={Link}`) from a Server Component into a Client Component — wrap it as a child instead.
- **`backdrop-filter` containing block:** any element with `backdrop-filter`/`backdrop-blur` becomes the containing block for `fixed` descendants — portal full-screen overlays out to `document.body` (see `MobileNav`).
- **Section backdrop = `isolate`:** a `-z-…` decorative image inside a `Section` paints *behind the section's own opaque background* unless the section is a stacking context. `position: relative` alone is **not** one (no `z-index`). Add **`isolate`** (`isolation: isolate`) to the `Section` className so negative-z layers sit above the bg, below content (see `Steps`/`Proof`/`MerakClose`).
- **Manual/Playwright checks:** use `npm start` (not `npm run dev`) in this environment.
- **Images:** optimized **WebP derivatives live in `public/images/`** (committed; converted from PNG via `sharp`, quality 80 — ~10MB of source → ~283KB). The **`Images/` source drop folder is gitignored, root-anchored (`/Images/`)** — an unanchored `Images/` also matches `public/images/` because Git is case-insensitive on Windows. Prompt catalog for regenerating: [image_prompt.md](image_prompt.md).
- **`LazyVideo`** (`src/components/LazyVideo.tsx`) is the reusable video primitive — hydration-safe reduced-motion (poster `<img>` via `useSyncExternalStore`), IntersectionObserver play/pause, `preload="none"`; parents own layout. All clips are 1920×1080 16:9 → `aspect-video`. Re-run `npm run optimize:videos` if source clips change (derivatives in `public/video/`, committed).

## Owner cutover — TODO (not code; owner/founder action)

**Domain + base URL + legal:**
- [ ] Add `vrelo-ki.de` (+ `www`) to the Vercel project → set the DNS records at the registrar → wait for SSL.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de` in Vercel → redeploy. Canonicals/OG/sitemap/robots follow automatically (no code change).
- [ ] Optionally 308-redirect the old `*.vercel.app` URL to the apex.
- [ ] **Founder/lawyer:** replace every `[Platzhalter]` in `src/lib/legal/{impressum,datenschutz}.ts` with real, verified copy (add links with `[label](https://…)` syntax).
- [ ] Post-cutover: resubmit `https://vrelo-ki.de/sitemap.xml` in Google Search Console.

**Kontakt — flip from safe-fallback to live (set in Vercel, then redeploy):**
- [ ] `RESEND_API_KEY`, `CONTACT_FROM` (verified Resend domain), `CONTACT_TO`, `NEXT_PUBLIC_CAL_LINK` (e.g. `vrelo/kennenlernen`).
- [ ] Verify a Resend sending domain (SPF/DKIM) for `CONTACT_FROM`. Until then the form is configured-but-won't-send; the `mailto` fallback covers the gap.

**Newsletter — Resend setup:**
- [ ] Create a Resend **Audience** → put its id in `NEWSLETTER_AUDIENCE_ID` (this Audience *is* the subscriber list; no DB on our side — we only `contacts.create` confirmed emails into it).
- [ ] Set `NEWSLETTER_SECRET` (a long random string; signs the double-opt-in token — rotating it invalidates outstanding unconfirmed links).
- [ ] Reuses the same verified `CONTACT_FROM` sending domain.
- [ ] **Sending newsletters is not built** — 4b only collects + confirms subscribers. To send an issue, compose a Resend **Broadcast** targeting the Audience (Resend adds the managed unsubscribe link). A future phase could automate Broadcasts.

## Open todos (non-blocking, carry forward)
- **Founder copy (draft-to-verify):** write the real Über-mich story — replace the 4 `[Platzhalter]` bodies + lead in `src/lib/ueber-mich.ts` / `src/app/ueber-mich/page.tsx`. Verify the German drafts in `src/lib/{leistungen,faq}.ts` (DSGVO stance, pricing, timeline). Verify the 3 Ratgeber seed-article drafts before publishing.
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
src/lib/            fonts.ts, nav.ts, site.ts, contact.ts, newsletter.ts, legal/, email/, content data
public/video/       optimized clips + posters (derivatives, committed)
public/images/      optimized WebP imagery for home + page banners (derivatives, committed)
public/logo/        brand assets (see Brand.md §4)
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
- Future prod domain: **vrelo-ki.de** (base URL centralized + env-driven in `src/lib/site.ts`).
- Hero = Direction B (immersive deep-water); rest of site = calm Papier/petrol sections; page ends on the *Merak*-Effekt.
- Videos: full 4-clip sequence on **Über mich**; sunset at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
