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
All six roadmap phases plus the post-Phase-6 polish are merged and deployed. Since launch the work has been **copy + design refinement** (see *Changelog* below) — all live. **Kontakt and Newsletter are live** (both send from `@vrelo-ki.de`; the site itself still runs on the `vercel.app` domain). Remaining go-live blockers: the **domain cutover** and **legal copy** — see the TODO blocks below. **Domain `vrelo-ki.de` is registered** at **united-domains** (registrar + DNS + mailbox host); cutover is underway.

- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew — GitHub↔Vercel connected, so **push to `main` auto-deploys to production**.
- All target-IA routes resolve 200 in prod: `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz` `/sitemap.xml` `/robots.txt`. Plus **`/lead-check`** — a **`noindex`** outreach lead-magnet (deliberately *not* in nav or sitemap; reached by direct link in broker outreach).

### What each phase shipped
1. **Foundation & design system** — Next.js shell, brand `@theme` tokens, fonts, `BrandWord`, Header/Footer.
2. **Core pages** — homepage, `/leistungen`, `/faq`, `/ueber-mich` + video system (`LazyVideo`).
3. **Ratgeber/MDX + SEO** — `next-mdx-remote` + `gray-matter`, auto-wrap BrandWord remark plugin; metadata, site-wide JSON-LD, sitemap, branded OG images. Drafts are dev-only (404 + excluded from index/sitemap in prod).
4. **Conversion** — **4a Kontakt:** consent-gated Cal.com scheduler (`@calcom/embed-react`, click-to-load) + contact form (Server Action → Resend, honeypot + time-trap); pure core in `src/lib/contact.ts`. **4b Newsletter:** GDPR double opt-in via a **stateless HMAC token** (no DB — the token *is* the pending state) → `/newsletter/bestaetigt` adds the contact to a **Resend Segment**; pure core in `src/lib/newsletter.ts`. Both are **config-driven**: form → `mailto`, scheduler → placeholder, newsletter → „bald verfügbar“ when env is unset (safe until Vercel env is set).
5. **Legal & polish** — legal pages render clickable inline links (`parseInlineLinks` → `LegalPage`, Markdown `[label](url)`); **env-driven `siteUrl`** (`NEXT_PUBLIC_SITE_URL` + `normalizeBase` fallback + `canonical()`); Twitter `summary_large_image` cards + per-page canonicals.
6. **End-stage design pass** — the `RippleImage` WebGL water panel (degrades to a still on reduced-motion / no-WebGL; **used on the Kontakt banner + the newsletter confirmation `/bestaetigt` payoff**); **`BrandLockup`** logo in Header + Footer; full-screen **`MobileNav`** drawer; petrol palette rhythm (`WasIchBaue` + `Steps` are `tone="petrol"`; *tiefes-wasser* reserved for Hero + Footer); favicon `src/app/icon.svg`.

### Post-Phase-6 design system (durable patterns)
All `@theme`-token-based, reduced-motion-safe, CLS-safe, browser-verified 1440/390. Granular live-tuning knobs live under *Open todos → Live nudges*; reusable warnings under *Gotchas*.
- **Hero:** **full-bleed flowing-water backdrop** (`/images/hero-flow.webp`, `next/image fill priority` = LCP) with **centered overlay text** over a petrol `.hero-overlay-scrim`; gentle CSS life — slow ambient zoom (`.hero-scene-img` / `hero-pan`) + 5 drifting light motes (`.hero-dust` / `dust-float`); decorative `alt=""`, motion-safe-gated; H1 reveal transform-only so LCP paints immediately. *(Current render is modest-res ~1376w — fine for abstract dark water; regenerate larger if it softens on big displays.)*
- **Centered spine (homepage):** every section centers its heading + intro on one axis (`mx-auto max-w-[44rem] text-center`); content blocks keep their stronger form (e.g. Steps' 3-card grid, Problem's panel — line below) with **left-aligned** body text. One calm axis down the page; body/lists are never centered (it hurts scanning). Built section-by-section via impeccable `live`.
- **Scroll-motion:** shared **`Reveal`** primitive (two-way fade-up; hidden state gated behind `html.reveal-ready` so **no-JS renders everything visible**).
- **Depth/craft utilities:** `.card-depth` (deep-water shadow + inset edge-light), `.shadow-deepwater`, `.cta-fx` (CTA sheen+lift via `filter: drop-shadow`, filled variants: primary + **`inverse`** = navy fill `bg-tiefes-wasser`/papier for warm/light surfaces where amber blends, e.g. the `ClosingCta` band), button-in-button CTA; `text-balance` on headings, `text-pretty` on body; eyebrow restraint.
- **Imagery:** shared **`PageImage`** (`next/image fill`, rounded deepwater panel); `PageIntro` optional `image` prop drives page banners; cohesive Nano Banana water photography below the fold (Hero stays LCP, German alt) — source in [image_prompt.md](image_prompt.md) → optimized WebP in `public/images/`. Decorative section backdrops (`Steps`/`Proof`/`MerakClose`) **require `isolate`** (see Gotchas).
- **Homepage order:** Hero → Problem → Was ich baue → Steps → Proof → Merak (petrol `WasIchBaue`+`Steps` block; warm `MerakClose` finale). `Was ich baue` is now **image-free** (the service chips carry it); `GeschichteTeaser` was **removed** — the story lives on `/ueber-mich`. Problem's task list sits in a centered `card-depth` panel; **Proof** is 4 value cards + an honest references footnote on a **soft brand-teal band** (`color-mix` 30 % petrol→paper + faint water texture) so the warm `papier` cards lift off it and the page runs **cool→warm** into `MerakClose` (its footnote is `text-tinte`, not `stumm`, to clear AA on the deeper surface).
- **Subpage reading rhythm (2026-06-22):** Über-mich / Leistungen / FAQ alternate **petrol-dark** and papier sections via `index % 2 === 1` — each got an `onDark` variant (`StoryBeat`, `LeistungDetail` [card goes opaque `bg-papier` on dark so petrol doesn't bleed], `FaqItem`); `FaqAccordion` now emits **one `Section` per theme group**. **Newsletter + Kontakt** forms sit in **`WaterSection`** (reusable petrol + `fliessen` water backdrop, the `Steps` treatment) with **`bg-amber` gold cards** (on-light text — see *Form-error tokens* gotcha). `NewsletterSuccess` renders on the petrol section (not a card) → stays **on-dark** (papier/gletscher).
- **Full-bleed page heroes (`PageHero`, 2026-06-23):** Über-mich/Leistungen/FAQ/Ratgeber open with a full-bleed image, the page title overlaid on `.hero-overlay-scrim` (soft `text-shadow` for legibility across image brightness), and the lead on paper below — the home-Hero treatment generalized into one component (`src/components/PageHero.tsx`). The lead is a **Fraunces serif standfirst** (responsive ~1.25→1.6rem) with a **petrol drop-cap** initial (`first-letter:`, sized in `em` so it scales with the text; echoes the article drop-cap). **Kontakt + Newsletter keep `PageIntro` (no hero)** — the petrol `WaterSection` form is their anchor, and a cool hero stacked on the cool form read as water-on-water. Hi-res images regenerated for **FAQ + Ratgeber** only (`image_prompt.md` → *Full-bleed page heroes*); **Leistungen + Über-mich keep their current images**. Heroes render at `quality={65}` (the petrol scrim hides it; ~19% lighter — see the *image optimizer* gotcha).
- **Featured offer block (`TerminQuelleAngebot`, 2026-06-24):** the flagship „Die Termin-Quelle“ opens `/leistungen` as a **deep-petrol panel** (`bg-vrelo-petrol` card on the paper `Section`), lifting the packaged speed-to-lead offer above the generic menu (reframed „Die einzelnen Bausteine“). **Price-free** (site convention) + a calm founding-promise note. On-dark AA trap: **amber on petrol is only 3.8:1**, so amber carries only the *large* serif promise (kept ≥24px = large-text AA); the small label is a **navy-on-amber gold badge** (6.8:1), body/chips are `gletscher` (7:1), heading/outcome `papier`. Copy in `src/lib/termin-quelle.ts`; offer source of truth: HQ `Knowledge/Offers/Termin-Quelle.md`.
- **Lead-Reaktions-Check (`/lead-check`, 2026-06-27):** interactive 6-question lead-magnet for brokers — a **`noindex`** outreach door-opener (not in nav/sitemap). Gain-led result: the € upside of sub-5-minute lead response, then a petrol bridge to the Cal `SchedulerEmbed` + an **optional** email capture. **Pure-core split** (mirrors the contact/newsletter pattern): scoring model + question data in `src/lib/leadCheck.ts` (`computeResult` — loss tiers/modifiers, 10 % floor, **20 % close-rate**: the locked numbers); email payload in `src/lib/leadCheckEmail.ts` (reuses `contact.ts` honeypot/time-trap + the now-shared `EMAIL_RE`). The optional-email Server Action `src/app/lead-check/actions.ts` **recomputes server-side** (never trusts client math) and sanitises enum inputs via `pick()`. Client wizard in `src/components/lead-check/` (`LeadCheck`/`Question`/`Result`/`ResultEmailForm`); `Question` resets its input on step change via **render-time state adjust**, not a setState-in-effect. **Visual:** shared `PageHero` (image hero like the other subpages) — H1 over `lead-check-banner.webp` (cinematic petrol water, ripple + one warm-gold glint); the wizard then sits in a `card-depth` paper panel on a faint cool `gletscher/30` band (the petrol/papier two-tone in a soft key) pulled tight under the paper lead; the result's „Wie wir rechnen“ box is `bg-papier` so it stays defined on the band. **On-site entry point:** a calm secondary CTA from the `TerminQuelleAngebot` block on `/leistungen` (`termin-quelle.ts` → `leadCheck`). Spec/plan: `docs/superpowers/{specs,plans}/2026-06-27-lead-reaktions-check*`; strategy source: HQ `Knowledge/marketing/lead-magnet-reaktions-check.md`.

### Newsletter (send) — built & verified (test-send rendered in a real inbox, 2026-06-27)
Author issues as `.md` in `content/newsletter/` (frontmatter `subject`/`previewText`/`date`/`draft`; body = the 4 fixed sections). **Editorial rules + the full runbook live in the `sending-newsletter` skill** + `Knowledge/marketing/newsletter.md`. Ship: `npm run newsletter -- --preview <slug>` / `--test you@x.de <slug>` / `--send <slug>` (`--at <iso>` schedules). First issue seeded (draft) with a meme in `public/images/newsletter/`.
- **Logic is `.mjs` under `scripts/newsletter/`** — bare `node` can't import TS or the `@/` alias; tested via Vitest's `*.test.mjs`. The email builder (`email.mjs`) renders a branded shell: gletscher **logo-header band** + amber rule + a warm sonnenlicht **„Der Tipp der Woche“** callout.
- **Broadcasts** target `NEWSLETTER_SEGMENT_ID` (`broadcasts.create({segmentId,…})` → `broadcasts.send(id)`). `--send` refuses a `draft: true` issue **and** a slug already sent/scheduled (checks `broadcasts.list()`) — no double-email. **Sender = `NEWSLETTER_FROM`** (falls back to `CONTACT_FROM` if unset; reply-to = from), so the newsletter sends from `newsletter@vrelo-ki.de` — replies *and* bounces land there (issues invite replies; monitoring that mailbox is an owner action, in *Newsletter* under Owner cutover).
- Unsubscribe = the `{{{RESEND_UNSUBSCRIBE_URL}}}` merge tag — Resend fills it per-recipient **only on `--send`**; preview/test swap it for a real `/newsletter` link so the footer renders clean (the broadcast path keeps the literal tag — **don't hardcode a URL there**, Resend needs the tag for one-click unsubscribe). Email images are **remote absolute URLs** — recipients with images off see alt text until they enable remote images.
- **Local CLI** needs Node ≥ 22.9 + `Website/.env.local` with `RESEND_API_KEY` + `NEWSLETTER_FROM` (or `CONTACT_FROM` as fallback) + `NEWSLETTER_SEGMENT_ID` + `NEXT_PUBLIC_SITE_URL` (Vercel env doesn't reach the local script; loaded via `--env-file-if-exists`). `NEWSLETTER_SECRET` is **not** needed locally (signup-only).

## Next session — planned work (resume here)
> Homepage is **live** on a centered spine with a full-bleed flowing-water hero (`hero-flow.webp`, Direction C).
1. **Legal copy** — replace every `[Platzhalter]` in `src/lib/legal/{impressum,datenschutz}.ts` with real, verified copy (founder/lawyer); also sweep its em-dashes → en-dashes (deferred from the route-page sweep).
2. **Design-skill pass on the remaining subpages** — all content subpages are **done** (now on the petrol reading rhythm, see *design system*); remaining: **legal** (taste → high-end-visual-design → impeccable; browser-verify 1440/390 + AA).
3. **Cleanup (optional):** orphaned (unused) assets — `/images/was-ich-baue.webp` and `/video/hero-quelle.jpg`. Remove or keep-for-reuse — decide later. *(`faq-banner.webp` + `ratgeber-banner.webp` are no longer orphaned — now the FAQ/Ratgeber hero images.)*
4. **Folder rename pending** — rename this project folder `Vrelo Website New` → `Website` **in the VSCode Explorer** (a terminal rename is blocked by VSCode's file lock). Then update references: HQ `../CLAUDE.md` (~8, incl. `%20`-encoded links), `../Clients/CLAUDE.md`, the `delivering-vrelo-projects` skill, the two `../Clients/docs/...` files, and the `cd "Vrelo Website New"` line in `docs/superpowers/plans/2026-06-20-ratgeber-editorial.md`. Leave `VreloWebsiteNew` (the GitHub remote) untouched.

> **To write a new Ratgeber article, use the project skill `.claude/skills/ratgeber-article/`** — interactive intake → full first draft in brand voice → frontmatter (incl. required `cover`/`coverAlt`, `draft: true`) → cover prompt from `image_prompt.md` §9 + a generation checklist. The covers test (`ratgeber.covers.test.ts`) requires the cover WebP to actually exist, so `npm test` fails until you drop it in.

> **Changelog (newest first; deployed unless noted — git has the detail):**
> - **2026-06-27 — Newsletter sending built & live** (detail in *Newsletter (send)* above): `npm run newsletter` preview/test/broadcast via Resend segment; branded email (logo header + warm Tipp callout) + seeded first issue + `sending-newsletter` skill; signup copy hints the 4 sections.
> - **2026-06-27 — homepage/Über-mich polish** (deployed): Proof on a soft brand-teal band; every page closes **flush to the footer** (Footer `mt` dropped); Über-mich `fluss` clip re-cut to a realistic glacial delta (prompt recorded in `image_prompt.md`) + „ins Fließen“ heading. Design-system notes above.
> - **2026-06-27 — Lead-Reaktions-Check (`/lead-check`)** (merged & live): interactive `noindex` lead-magnet — pure `leadCheck.ts` model + wizard + optional-email Server Action; linked from the Termin-Quelle block. Full detail in *design system* above.
> - **2026-06-24 — Termin-Quelle flagship + CTA/hero polish** (deployed): `TerminQuelleAngebot` petrol featured block on /leistungen (copy `src/lib/termin-quelle.ts`); `ClosingCta` navy `CTAButton variant="inverse"`; `PageHero` `quality={65}` + `next.config qualities=[65,75]`. Design-system + AA notes above.
> - **2026-06-23 — full-bleed page heroes + Cal.com LIVE** (deployed): new **`PageHero`** opens Über-mich/Leistungen/FAQ/Ratgeber (full-bleed image + Fraunces serif standfirst + petrol drop-cap); Kontakt/Newsletter keep `PageIntro`; hi-res FAQ+Ratgeber images. Cal.com scheduler live above the Kontakt form (EU `cal.eu` — see *Gotchas*). Full detail in *design system* / git.
> - **2026-06-22 — dark reading-rhythm + gold form cards**: petrol/papier rhythm on subpages; homepage Problem `card-depth` panel + Proof value cards; Newsletter/Kontakt forms in reusable **`WaterSection`** with **`bg-amber` gold** cards (added `signal-tief`/`lightLinkClass`, `onDark` variants). Git has the detail.
> - **2026-06-20 — Ratgeber editorial + homepage/Über-mich copy**: article redesign (CSS **drop-cap** needs the `.article-body` wrapper); `WasIchBaue` accountable-person differentiator sub; Über-mich „Stress“ de-dup + nav-repeat eyebrows dropped. Git has the detail.
> - **2026-06-15/16 — landing-page + centered-spine** (full detail in *Key decisions* + *design system*).
> - **Earlier (2026-06-07/08)** — Ratgeber live (slug `durcheinander-oder-saubere-quelle`, reading surface `lesepapier`); real copy across Über-mich / Leistungen (7 services) / FAQ; `stumm` darkened for AA.

## Gotchas
- **German quotes** „…“ = U+201E (open) + U+201C (close) — never ASCII `"`. The Edit tool can silently downgrade them; verify bytes (or write via `fs`/Write) when inserting them.
- **papier token = `#f4efe6`** (site-wide base — homepage + all marketing pages). The **Ratgeber article pages only** use a deeper reading surface **`lesepapier = #ece3d2`** (L 0.774) via **`Section tone="reading"`** (`bg-lesepapier`), to cut full-page glare on long-form text — a deliberate scoped exception, not site-wide (the marketing pages keep the brighter, more energetic papier). Every text token clears AA on lesepapier (stumm 4.67, ember 5.13, tinte 14.0); going darker (sepia `#e7ddc9`) would drop stumm below 4.5. Article body is also `text-lg` (18px) for reading comfort (`Prose.tsx`).
- **stumm token = `#696359`** (darkened from Brand.md's `#7a7468`) so small uppercase eyebrow/label text clears WCAG AA — **5.19:1 on papier, 4.67:1 on the darker lesepapier**. Accessibility override like ember — confirm hue with the founder before reverting.
- **Grey-on-dark text:** on dark sections the body grey is **`gletscher` `#dce7eb`** (7:1 on petrol, 12:1 on deep water — AA-clean); light-grey-on-dark is the intended look (pure white would glare). The mid-grey **`stein` `#a8b5ba`** is only safe on the darkest **`tiefes-wasser` `#0a2538`** (Footer, 7.5:1) — it **fails AA on `vrelo-petrol`** (4.2:1), so **never `text-stein` on a petrol section**. Hero text over the *photo* depends on `.hero-overlay-scrim`, not just the token — re-check contrast over the brightest water if you lighten the scrim.
- **German dash** the Gedankenstrich is the **en-dash with spaces** „ – “ (U+2013), not the em-dash „—“ (U+2014). Use `–` in client copy.
- **ember token = `#7e5527`** (darkened from Brand.md's `#8b5e2c`) so small ember text on sonnenlicht clears WCAG AA. Accessibility override — confirm with the founder before reverting to the exact brand hex.
- **`bg-amber` gold form cards (Newsletter + Kontakt):** the cards are the saturated **`amber` `#d4a24c`** — dark enough that the mid-tone on-light accents fail AA, so on these cards **links are navy** (`lightLinkClass` = `text-tiefes-wasser`, hover petrol; **plain `text-vrelo-petrol` is only 3.8:1 on amber**) and **errors use `signal-tief` `#6b1f14`** (deep red, 4.95:1 on amber — the lighter `#8f3526` failed). Heading/label/body stay navy/`tinte` (6.8:1+), inputs are `bg-papier` wells, the button is navy (`bg-tiefes-wasser`). The **on-dark** error token **`signal` `#f0a79a`** + **`darkLinkClass`** (gletscher) are unchanged (used on the dark footer / on-dark surfaces); the **`compact` footer `NewsletterForm`** keeps its amber button + `ember` error. Founder-confirm the red hues like `ember`/`stumm`.
- **Cal.com embed = EU region:** Vrelo's Cal account is on **`cal.eu`** (EU data residency), so `SchedulerEmbed` pins **`calOrigin="https://cal.eu"`** — the embed's default `cal.com` origin 404s the booking iframe. The default `app.cal.com` embed **script** still mounts an EU iframe fine (no `embedJsUrl` needed, browser-verified); the iframe loads only on click, so no third-party request on page load.
- **OG images:** `ImageResponse`/satori needs a **static** TTF (variable fonts crash it) — `src/app/_og/Fraunces-SemiBold-static.ttf`.
- **Resend mock (tests):** under Vitest v4 a `vi.mock("resend")` must use a constructable `function`/`class` (an arrow impl is not a constructor) — see `src/app/kontakt/actions.test.ts`.
- **Resend = Segments + full-access key:** Resend renamed **Audiences → Segments**; add contacts with `contacts.create({ segments:[{ id }] })` (the deprecated `audienceId` is gone for migrated accounts — env is `NEWSLETTER_SEGMENT_ID`). The **`RESEND_API_KEY` must have Full access**: a sending-only key 401s `restricted_api_key` on contacts.create (the original Kontakt key was sending-only; upgraded 2026-06-21). `confirmSubscription` logs the Resend error to Vercel, so check the runtime logs first if confirm fails.
- **RSC boundary:** you cannot pass a component **as a prop** (`as={Link}`) from a Server Component into a Client Component — wrap it as a child instead.
- **`backdrop-filter` containing block:** any element with `backdrop-filter`/`backdrop-blur` becomes the containing block for `fixed` descendants — portal full-screen overlays out to `document.body` (see `MobileNav`).
- **Section backdrop = `isolate`:** a `-z-…` decorative image inside a `Section` paints *behind the section's own opaque background* unless the section is a stacking context. `position: relative` alone is **not** one (no `z-index`). Add **`isolate`** (`isolation: isolate`) to the `Section` className so negative-z layers sit above the bg, below content (see `Steps`/`Proof`/`MerakClose`).
- **Stacked `Section`s double their padding** — `PageIntro` is itself a `Section` (`py-24 md:py-32`), so a `Section` directly after it renders a ~16rem (md) intro→content gap. Pull the next section up with **`-mt-24 md:-mt-32`** (Ratgeber/Kontakt/FAQ/Über-mich/Leistungen). Those subpages also **separate sections by `tone`/`tint`, not `border-faden` divider lines** (removed 2026-06-21; the `LeistungDetail` chip outline is kept — it's a pill, not a divider). The **Footer has no top margin** (2026-06-27) — the last section butts it directly, so **don't re-add `mt-*` to the Footer**; `MerakClose`/`ClosingCta` keep their own bottom `py`, and `kontakt`'s closing banner uses symmetric `pt/pb`.
- **Manual/Playwright checks:** use `npm start` (not `npm run dev`) in this environment.
- **Images:** optimized **WebP derivatives live in `public/images/`** (committed; converted from PNG via `sharp`, quality 80 — ~10MB of source → ~283KB). The **`Images/` source drop folder is gitignored, root-anchored (`/Images/`)** — an unanchored `Images/` also matches `public/images/` because Git is case-insensitive on Windows. Prompt catalog for regenerating: [image_prompt.md](image_prompt.md).
- **Image optimizer (Next 16):** `images.qualities` is an allow-list now — a `quality` value not listed returns **HTTP 400** (`next.config.ts` = `[65, 75]`; 75 = site-wide default, 65 = `PageHero` heroes). A *sometimes-slow* hero is the **Vercel optimizer cold-cache**, not resolution: first request per image+width is `X-Vercel-Cache: MISS` (~0.7–0.9s), then `HIT` (~0.16s). Size-independent (even a 40 KB image MISSes), self-warms with traffic, resets each deploy.
- **`LazyVideo`** (`src/components/LazyVideo.tsx`) is the reusable video primitive — hydration-safe reduced-motion (poster `<img>` via `useSyncExternalStore`), IntersectionObserver play/pause, `preload="none"`; parents own layout. All clips are 1920×1080 16:9 → `aspect-video`. `StoryBeat` accepts `video: false` to render a beat text-only (no clip).
- **Video re-cut workflow:** sources in `Videos/` map to derivative slugs in `scripts/optimize-videos.mjs` — **Beginning→quelle, Second_Part→ripples, Thrid_Part→fluss, End→merak** (the Über-mich beats; `merak` sunset also backs `MerakClose`). The page plays the **derivatives** in `public/video/`, not the source — so after re-cutting a source you must re-run `npm run optimize:videos` (bundled `ffmpeg-static`/`ffprobe-static`, no system ffmpeg) to regenerate `public/video/<slug>.{mp4,webm}` + `<slug>-poster.jpg`, then commit source + derivatives together. To regenerate a single clip, copy that clip's per-slug block from the script (the poster `image2` warning is non-fatal). Derivatives in `public/video/` are committed.

## Owner cutover — TODO (not code; owner/founder action)

**Domain + base URL + legal:** (domain `vrelo-ki.de` registered at **united-domains** — registrar + DNS + mail host; all DNS records below go in the united-domains panel.)
- [ ] Add `vrelo-ki.de` (+ `www`) to the Vercel project → set the DNS records at united-domains → wait for SSL.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de` in Vercel → redeploy. Canonicals/OG/sitemap/robots follow automatically (no code change).
- [ ] Optionally 308-redirect the old `*.vercel.app` URL to the apex.
- [ ] **Founder/lawyer:** replace every `[Platzhalter]` in `src/lib/legal/{impressum,datenschutz}.ts` with real, verified copy (add links with `[label](https://…)` syntax).
- [ ] Post-cutover: resubmit `https://vrelo-ki.de/sitemap.xml` in Google Search Console.

**Kontakt — ✅ LIVE.** Resend domain `vrelo-ki.de` verified; `RESEND_API_KEY` + `CONTACT_FROM` (`Vrelo <kontakt@vrelo-ki.de>`) + `CONTACT_TO` (now `kontakt@vrelo-ki.de`, switched off the test inbox + verified end-to-end 2026-06-23) set in Vercel (Production). The form flips live once all three are set (`isContactConfigured()`); the send sets `replyTo` = visitor. Key fact for the record: this go-live needs the domain *verified in Resend*, **not** pointed at Vercel — it shipped independently of the domain cutover.

**Cal.com scheduler — ✅ LIVE (2026-06-23).** Re-added above the form, pinned to the **EU region `cal.eu`** (`NEXT_PUBLIC_CAL_LINK = ajdin19/vrelo-kennenlernen` in Vercel **Production + Development**; **Preview** unset — CLI prompt blocked it, add via dashboard for branch previews). Booking iframe loads only on click (no third-party request on page load). EU-origin trap is in *Gotchas*.

**Newsletter — ✅ LIVE (2026-06-21)** on the current `vercel.app` domain. `NEWSLETTER_SECRET` + `NEWSLETTER_SEGMENT_ID` set in Vercel (Production); double opt-in confirmed end-to-end (contact lands in the Resend **Segment**). Runbook: [docs/newsletter-golive-runbook.md](docs/newsletter-golive-runbook.md). **At the `vrelo-ki.de` cutover:** set `NEXT_PUBLIC_SITE_URL` and **keep the same `NEWSLETTER_SECRET`** (subscribers + pending opt-in links carry over). **Sending issues:** built & verified; **sends from `newsletter@vrelo-ki.de`** (`NEWSLETTER_FROM` in Vercel + `.env.local`, verified 2026-06-29) — replies *and* bounces route there, so the `newsletter@` mailbox at united-domains **must exist + be monitored**. Detail: *Newsletter (send)* above.

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
content/newsletter/ newsletter issue .md files (draft until shipped)
scripts/            send-newsletter.mjs + newsletter/*.mjs (send pipeline) · optimize-videos.mjs
public/video/       optimized clips + posters (derivatives, committed)
public/images/      optimized WebP imagery for home + page banners + ratgeber covers (derivatives, committed)
public/logo/        brand assets (see Brand.md §4)
.claude/skills/     project skills — ratgeber-article (new Ratgeber article) · sending-newsletter (author + send a newsletter issue)
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
- **Hormozi skills are framework/output only** — keep the Vrelo voice (calm-over-hype) on top; their artifacts live in `Knowledge/marketing/`, never shipped verbatim. **Review lens:** score every customer-facing change against the **Hormozi Value Equation** — defined centrally in HQ [CLAUDE.md](../CLAUDE.md) §8 (used to pick the `WasIchBaue` sub: it lifts Perceived Likelihood *and* cuts Effort & Sacrifice).
- Videos: full 4-clip sequence on **Über mich**; sunset at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).
