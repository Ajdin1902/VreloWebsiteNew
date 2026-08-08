# CLAUDE.md — Vrelo Website

Project memory for the **Vrelo** marketing website. Read this first; it links out to the brand brief, the spec, and the per-phase plans.

- **Brand brief (voice, palette, type, logo, compliance):** [Brand.md](Brand.md) — the source for every design/copy decision.
- **Design spec:** [docs/superpowers/specs/2026-06-01-vrelo-website-design.md](docs/superpowers/specs/2026-06-01-vrelo-website-design.md)
- **Specs & plans:** [docs/superpowers/specs/](docs/superpowers/specs/) · [docs/superpowers/plans/](docs/superpowers/plans/)

> Client-facing copy is **German**; code & comments are **English**.

---

## What this is
A content/SEO marketing site for Vrelo, an AI-automation studio for DACH small businesses. Framed as a **personal brand** (first-person „Ich“). Primary goal: convert visitors to a booked call (scheduler) or contact form; secondary: organic search via a German Ratgeber (blog) + a newsletter.

## Status
Built, merged and live; work since launch is copy + design refinement. **Kontakt, Cal.com scheduler, Newsletter (signup + sending) and the `/demo` sandbox are all LIVE.** Remaining go-live blockers are owner actions, not code — see *Owner cutover* below.

**Ratgeber = 12 Artikel** (3 aus Mai + der Makler-Cluster vom 2026-07-29, rückdatiert 06-04 … 07-30). Marktspannen dürfen vorkommen, ein Vrelo-Preis nie (HQ §4); die einzige Zahl ist der Server „rund 30 €“ und sie muss auf `/makler` und im Ratgeber **gleich** lauten.

**KI-Kennzeichnung (Art. 50 KI-VO, anwendbar seit 2026-08-02).** Ratgeber und Newsletter brauchen **kein** KI-Label — aus zwei unabhängigen Gründen: es sind keine „Angelegenheiten von öffentlichem Interesse“ (der Begriff zielt auf Journalismus/öffentliche Debatte, nicht auf „Was kostet …“), **und** Art. 50 Abs. 4 b nimmt Texte aus, die ein Mensch geprüft hat und für die eine **benannte** Person die redaktionelle Verantwortung trägt. Der zweite Grund ist der, den wir selbst in der Hand haben → **beim Impressum-Cutover V.i.S.d.P. namentlich setzen**; die Ausnahme verlangt die Benennung **vor** Veröffentlichung, ein nachträglicher Footer-Disclaimer erfüllt sie nicht. `/demo` (deterministische Simulation) und `/lead-check` (deterministischer Selbstcheck) enthalten gar keine KI → keine Pflicht. Grundlagen + Belege: [KI-Transparenzpflichten](../Knowledge/Compliance/KI-Transparenzpflichten.md).

**Bildwelt = KI-generiert** (geprüft 2026-08-06). ⚠️ **Alle** Bilder und Videos der Seite sind generiert — Standbilder mit Nano Banana/Gemini, die vier Über-mich-Clips mit Seedance/Veo ([image_prompt.md](image_prompt.md)). **Kein Label im Bild nötig**: Art. 50 Abs. 4a greift erst bei erkennbar **realem** Bezug, nicht bei „Werbung ja/nein“ (Herleitung: [KI-Transparenzpflichten §4a](../Knowledge/Compliance/KI-Transparenzpflichten.md)). Die maschinenlesbare Markierung schuldet Google, nicht wir — ⚠️ unsere `sharp`/ffmpeg-Konvertierung strippt Metadaten, also **nie behaupten**, sie sei intakt.
- **Zwei Hinweissätze, beide test-guarded:** `bildhinweis` unter dem ersten Story-Beat auf `/ueber-mich` (`src/lib/ueber-mich.ts`) — dort, weil die generierte Karstquelle neben Ajdins Ich-Erzählung als echtes Foto *seiner* Quelle liest (**UWG §5**, nicht KI-VO) — plus `Bildnachweis` im Impressum als seitenweiter Auffang. ⚠️ Das Impressum **nennt die Werkzeuge**: neuer Generator → Satz mitziehen.
- **Locked:** der Hinweis wandert **nicht** ans Seitenende (stünde vor `ClosingCta` und käme nach dem Eindruck, den er ausräumt; 2026-08-06 geprüft und verworfen). Ein Label **im Bild** (Ecke, nie Bildunterschrift) wird erst fällig, wenn ein KI-Asset reale Personen/Orte/Ereignisse zeigt — gilt für künftige Ad-Creatives. Kein Founder-Porträt auf der Seite; kommt eins, wird es fotografiert.

- **Live:** https://vrelo-website.vercel.app · **Repo:** https://github.com/Ajdin1902/VreloWebsiteNew — push to `main` auto-deploys to production.
- **Routes (all 200 in prod):** `/` `/leistungen` `/ueber-mich` `/ratgeber(+[slug])` `/faq` `/kontakt` `/newsletter(+/bestaetigt)` `/impressum` `/datenschutz` `/sitemap.xml` `/robots.txt`. Plus three **`noindex`, direct-link-only** pages, deliberately absent from nav and sitemap: **`/lead-check`**, **`/demo`**, **`/makler`**.

### `/makler` — merged & live (2026-07-23)
A focus-mode outreach landing page for independent Makler / Finanz- und Versicherungsmakler, sent by direct link: sells Die Termin-Quelle (lead, links to `/demo`) then the Document Concierge (second step), closing on the embedded Cal scheduler. `noindex`, not in nav/sitemap. Renders **without the site chrome** via `ChromeGate` (see *Design system*), brings its own minimal `MaklerHeader`/`MaklerFooter`. All copy in `src/lib/makler.ts` (single source; components hold no German); offer truth stays in HQ (`Knowledge/Offers/Termin-Quelle.md`, `Knowledge/Strategy/Document_Concierge.md`). Spec+plan: `docs/superpowers/{specs,plans}/2026-07-23-makler-landingpage*` (build) + `…-makler-copy-cut*` (the cut).
- **Page shape** (order in `src/lib/makler.ts`): `MidCta` is the **only** in-page CTA before the close; lists are headline-only — the page shows, it does not explain.
- **Price-free except one deliberate figure:** „rund 30 €“ for the client's **own** server cost — HQ §2.2 wants the infra cost said out loud as proof the retainer is pure Vrelo-Leistung. Guarded: `makler.test.ts` allows exactly one currency string and pins it to the server note. **Never** say Vrelo *provides* the server — the client owns it (n8n fair-code: Vrelo may not host/resell; and it is what makes the DC „bei mir liegt keine einzige Datei“ true).
- **Founder decision (final, do not re-open):** the Document-Concierge „built to order, not clickable software“ note stays small/italic/muted at the end of its block, despite a review flagging it as easy to skim past.
- ☐ **Open (owner):** point the Pond-1/Pond-2 Tier-A outreach sequences at `vrelo-ki.de/makler` once the domain cutover completes (HQ `CLAUDE.md` §7).

## Design system (durable patterns)
All `@theme`-token-based, reduced-motion-safe, CLS-safe, browser-verified 1440/390. Live-tuning knobs under *Open todos*; reusable warnings under *Gotchas*.
- **Hero:** full-bleed flowing-water backdrop (`/images/hero-flow.webp`, `next/image fill priority` = LCP) with centered overlay text over a petrol `.hero-overlay-scrim`; slow ambient zoom + 5 drifting light motes, motion-safe-gated; decorative `alt=""`; H1 reveal is transform-only so LCP paints immediately.
- **Centered spine (homepage):** each section centers heading + intro (`mx-auto max-w-[44rem] text-center`); content blocks keep their stronger form and **body text stays left-aligned** (centered body hurts scanning).
- **Scroll-motion:** shared **`Reveal`** primitive (fade-up, one-way; hidden state gated behind `html.reveal-ready` so **no-JS renders everything visible**).
- **Depth/craft utilities:** `.card-depth`, `.shadow-deepwater`, `.cta-fx` (CTA sheen+lift; filled variants `primary` + **`inverse`** = navy fill for warm/light surfaces where amber blends); `text-balance` on headings, `text-pretty` on body; eyebrow restraint.
- **Imagery:** shared **`PageImage`**; `PageIntro`'s optional `image` prop drives page banners; cohesive water photography below the fold (Hero stays LCP, German alt). Prompts in [image_prompt.md](image_prompt.md) → optimized WebP in `public/images/`.
- **Homepage order:** Hero → Problem → Was ich baue → Steps → Proof → Merak. Runs **cool→warm**: petrol `WasIchBaue`+`Steps`, Proof on a soft brand-teal band, warm `MerakClose` finale. `Was ich baue` is image-free (service chips carry it).
- **Subpage reading rhythm:** Über-mich / Leistungen / FAQ alternate petrol-dark and papier via `index % 2 === 1`; each has an `onDark` variant (`StoryBeat`, `LeistungDetail`, `FaqItem`). **Newsletter + Kontakt** forms sit in **`WaterSection`** (petrol + water backdrop) with **`bg-amber` gold cards** (on-light text — see *Form-error tokens* gotcha).
- **Full-bleed page heroes (`PageHero`):** Über-mich/Leistungen/FAQ/Ratgeber/lead-check/demo/makler open with a full-bleed image, title on `.hero-overlay-scrim`, lead on paper below as a Fraunces serif standfirst with a petrol drop-cap. Optional **`actions`** slot renders a CTA row under the lead (used by `/makler`). Heroes render at `quality={65}`. **Kontakt + Newsletter keep `PageIntro` (no hero)** — a cool hero stacked on the cool form read as water-on-water.
- **Featured offer block (`TerminQuelleAngebot`):** „Die Termin-Quelle“ opens `/leistungen` as a deep-petrol panel. Price-free (site convention). On-dark AA trap: **amber on petrol is only 3.8:1**, so amber carries only the *large* serif promise (≥24px = large-text AA); the small label is a navy-on-amber badge (6.8:1), body/chips `gletscher` (7:1). Copy in `src/lib/termin-quelle.ts`.
- **Focus routes (`ChromeGate`):** routes listed in `focusRoutes` (`src/lib/nav.ts`) render **without the site Header/Footer** and bring their own minimal chrome — for single-purpose outreach pages where every nav link is an exit before the CTA. `Header`/`Footer` live in the root layout, so a nested layout cannot remove them; `ChromeGate` is a client component reading `usePathname()` that returns `null` on those routes. Chosen over route groups to avoid moving twelve route folders for zero functional gain. **`Header`/`Footer` must be passed as children, never as a prop** (RSC boundary). Currently only `/makler`; `/lead-check` and `/demo` deliberately keep full chrome.
- **Lead-Reaktions-Check (`/lead-check`):** 6-question broker lead-magnet; gain-led result (€ upside of sub-5-minute response) → petrol bridge to the Cal `SchedulerEmbed` + optional email capture. **Pure-core split:** scoring model in `src/lib/leadCheck.ts` (`computeResult` — loss tiers, 10 % floor, **20 % close-rate**: the locked numbers), email payload in `src/lib/leadCheckEmail.ts`. The Server Action **recomputes server-side** (never trusts client math) and sanitises enums via `pick()`. Entry point: a secondary CTA from `TerminQuelleAngebot`. **Result emails (2026-08-08):** the capture sends **two branded HTML mails** — the lead's German summary first (hero = Abschlüsse + € central; `schnell`-Score bewusst ohne €-Zahl, same honesty rule as the page; only link = the Cal URL via `calBookingUrl()`, never a site link pre-cutover; no `calLink` → reply-line fallback), then the internal notification (KPI tiles + answer table, subject carries lead · score · €). Internal-send failure never breaks the user-facing „ok“. Spec: `docs/superpowers/specs/2026-08-08-lead-check-result-emails-design.md`.
- **Interaktive Termin-Quelle-Demo (`/demo`):** role-reversal sandbox – the broker describes his business (optionally via an SSRF-guarded URL fetch + Haiku summary), then plays his own client against a **Claude-Haiku** booking bot; ends on a reveal that **closes on an inline booking** (2026-08-01). **A simulation, not the real n8n engine.** Pure-core in `src/lib/demo/` + three `nodejs`-runtime routes; **config-gated** (no `ANTHROPIC_API_KEY` → calm „bald verfügbar“ card). The bot closes on a literal **`[ENDE]` sentinel**; `MAX_TURNS` (8) is the server-authoritative backstop. The reveal POSTs the transcript to the **fail-safe** `/demo/summary` route → Terminnotiz + simulierte Mailvorschau, **display-only, nothing stored or sent** (matches the Datenschutz stance); any error → `EMPTY_NOTIZ` 200, never 5xx. Reveal-Reihenfolge und Selbst-Scroll (`scroll-mt-24`, sonst verdeckt der sticky Header die Überschrift) stehen im Code. ⚠️ `/kontakt` ist der **ganze** CTA, wenn `NEXT_PUBLIC_CAL_LINK` fehlt — der Vercel-**Preview**-Pfad, dort ist das Buchungsband nie zu sehen. ⚠️ Der Verlauf klappt **automatisch auf, wenn keine Terminnotiz zustande kam** — im Fail-safe-Zustand ist er der einzige verbliebene Beleg über dem Ask; wer das `open`-Attribut entfernt, nimmt dem schwächsten Zustand seinen Beweis. Spec/Plan: `docs/superpowers/{specs,plans}/2026-08-01-demo-reveal-buchung*`. Security posture (SSRF resolve-then-pin, denial-of-wallet breaker, no-PII logging, prompt-injection containment) is documented in `docs/superpowers/specs/2026-07-02-termin-quelle-interaktiv-demo-design.md` and guarded by `logging.test.ts`.
- **Landing-page copy modules:** page copy lives in one typed module per page (`src/lib/termin-quelle.ts`, `src/lib/makler.ts`) — components hold no German strings. `src/lib/makler.test.ts` is the reusable **copy-guard** pattern: walks the exported object and fails on ASCII quotes, em-dashes, unbalanced „…“, or a price token. The same pattern now guards **prose**: `src/lib/ratgeberCopy.ts` (pure) + `ratgeber.corpus.test.ts` walk every Ratgeber body for the same rules plus gendered forms. Judgement rules (one water-metaphor *concept*, Merak landing, no CTA close) stay human — a hard threshold there fails legitimate copy.

## Newsletter (send) — built & live
Author issues as `.md` in `content/newsletter/` (frontmatter `subject`/`previewText`/`date`/`draft`; body = the 4 fixed sections). **Editorial rules + runbook live in the `sending-newsletter` skill** + `Knowledge/marketing/newsletter.md`. Ship: `npm run newsletter -- --preview <slug>` / `--test you@x.de <slug>` / `--send <slug>` (`--at <iso>` schedules).
- **Logic is `.mjs` under `scripts/newsletter/`** — bare `node` can't import TS or the `@/` alias; tested via Vitest `*.test.mjs`.
- **Broadcasts** target `NEWSLETTER_SEGMENT_ID`. `--send` refuses a `draft: true` issue **and** a slug already sent/scheduled — no double-email. Sender = `NEWSLETTER_FROM` (falls back to `CONTACT_FROM`), so issues send from `newsletter@vrelo-ki.de`; replies *and* bounces land there.
- Unsubscribe = the `{{{RESEND_UNSUBSCRIBE_URL}}}` merge tag — Resend fills it per-recipient **only on `--send`**; preview/test swap it for a real `/newsletter` link. **Don't hardcode a URL on the broadcast path** — Resend needs the literal tag for one-click unsubscribe. Email images are remote absolute URLs.
- **Local CLI** needs Node ≥ 22.9 + `Website/.env.local` with `RESEND_API_KEY` + `NEWSLETTER_FROM` (or `CONTACT_FROM`) + `NEWSLETTER_SEGMENT_ID` + `NEXT_PUBLIC_SITE_URL` (Vercel env doesn't reach the local script). `NEWSLETTER_SECRET` is **not** needed locally.

## Gotchas
- **German quotes** „…“ = U+201E (open) + U+201C (close) — never ASCII `"`. Edit/Write silently downgrade the closing quote (and turn `\xNN` code-escapes typed into content into literal control bytes). Verify bytes after writing, then repair with **codepoint escapes** (literal smart chars in the `-e` program don't survive): `perl -CSD -i -pe 's/\x{201E}([^\x{201E}"]*)"/\x{201E}$1\x{201C}/g; s/\x{2014}/\x{2013}/g' FILE`. ⚠ That first pattern is greedy across a line: it will also eat a legitimate ASCII `"` further along the same line. Repair line-ranges, then re-audit.
- **German dash** the Gedankenstrich is the **en-dash with spaces** „ – “ (U+2013), not the em-dash „—“ (U+2014). Use `–` in client copy.
- **Quote constants must be codepoint escapes, never literal characters.** `ratgeberCopy.ts` writes `"\u201C"` / `"\u201D"` deliberately: Write/Edit downgrade a literal U+201C to U+201D, which would silently make `CLOSE_QUOTE === WRONG_CLOSE` and leave a detector that can never fire. Same reason its bad-quote *test fixture* is an escape — a typography repair pass over the test file would otherwise „fix“ the fixture and the test would assert against clean input. (This bit twice in one session.)
- **Der Korpus-Test prüft jede Datei einzeln — Serien-Masche sieht er nicht.** Beim 9-Artikel-Batch schlossen 7 von 12 Artikeln auf demselben Satzstamm („Das ist der Merak-Effekt“) und 7 von 9 Pull-Quotes auf derselben Figur („X ist nicht Y. Es ist Z.“) — jeder Artikel für sich gut, hintereinander gelesen eine Masche. Nach jedem Batch die Schlusssätze und Pull-Quotes **als Liste** lesen (`grep -h '^> ' content/ratgeber/*.mdx`), nicht Datei für Datei.
- **The three May-2026 Ratgeber articles are exempt from the slug-matches-cover rule** — they use short cover names (`ratgeber-system/zeit/termine`) that predate it. `ratgeber.corpus.test.ts` carries an explicit `LEGACY` set; renaming live assets was judged out of scope. Don't „fix“ the test by widening it.
- **CRLF vs. the Edit tool:** several existing test files (e.g. `src/components/kontakt/SchedulerEmbed.test.tsx`) are stored CRLF. The Edit tool matches on LF and fails to find the string. Append via a small script doing a CRLF-aware replace, then verify the file is intact.
- **`scroll-margin-top` must sit on the anchored element itself.** `scroll-mt-*` on an ancestor `Section` does nothing — the browser scrolls to the element carrying the `id`, so a sticky header covers the heading. Put the class on the same element as the `id` (see `TerminSection`).
- **`<dt>` forbids heading content.** `<h3>` inside `<dt>` is invalid HTML; use `<ul>`/`<li>` when the items are cards rather than term/definition pairs.
- **papier token = `#f4efe6`** (site-wide base). The **Ratgeber article pages only** use a deeper reading surface **`lesepapier = #ece3d2`** via **`Section tone="reading"`**, to cut full-page glare on long-form text — a deliberate scoped exception. Every text token clears AA on lesepapier (stumm 4.67, ember 5.13, tinte 14.0); going darker (sepia `#e7ddc9`) would drop stumm below 4.5. Article body is `text-lg` for reading comfort.
- **stumm token = `#696359`** (darkened from Brand.md's `#7a7468`) so small uppercase eyebrow/label text clears WCAG AA — 5.19:1 on papier, 4.67:1 on lesepapier. Accessibility override like ember — confirm hue with the founder before reverting.
- **Grey-on-dark text:** on dark sections the body grey is **`gletscher` `#dce7eb`** (7:1 on petrol, 12:1 on deep water). The mid-grey **`stein` `#a8b5ba`** is only safe on the darkest **`tiefes-wasser` `#0a2538`** (Footer, 7.5:1) — it **fails AA on `vrelo-petrol`** (4.2:1), so **never `text-stein` on a petrol section**. Hero text over the *photo* depends on `.hero-overlay-scrim`, not just the token.
- **ember token = `#7e5527`** (darkened from Brand.md's `#8b5e2c`) so small ember text on sonnenlicht clears AA. Confirm with the founder before reverting.
- **`bg-amber` gold form cards (Newsletter + Kontakt):** the saturated `amber` `#d4a24c` is dark enough that mid-tone on-light accents fail AA — so on these cards **links are navy** (`lightLinkClass`; plain `text-vrelo-petrol` is only 3.8:1 on amber) and **errors use `signal-tief` `#6b1f14`** (4.95:1). Heading/label/body stay navy/`tinte`, inputs are `bg-papier` wells, the button is navy. The **on-dark** error token `signal` `#f0a79a` + `darkLinkClass` are unchanged; the **compact footer `NewsletterForm`** keeps its amber button + `ember` error.
- **Cal.com embed = EU region:** Vrelo's Cal account is on **`cal.eu`**, so `SchedulerEmbed` pins **`calOrigin="https://cal.eu"`** — the default `cal.com` origin 404s the booking iframe. The default embed *script* still mounts an EU iframe fine. The iframe loads only on click, so no third-party request on page load. `fallbackHint` overrides the not-configured line (defaults to the `/kontakt` wording, which points at a form below the embed).
- **OG images:** `ImageResponse`/satori needs a **static** TTF (variable fonts crash it) — `src/app/_og/Fraunces-SemiBold-static.ttf`.
- **Resend mock (tests):** under Vitest v4 a `vi.mock("resend")` must use a constructable `function`/`class` (an arrow impl is not a constructor).
- **Vitest v4 mock hoisting:** a plain top-level `const fn = vi.fn()` referenced *directly* inside a `vi.mock(mod, () => ({ fn }))` factory throws `Cannot access 'fn' before initialization` (factories hoist above `const`s). Wrap in **`vi.hoisted(() => ({ … }))`**.
- **Anthropic streaming shape:** `messages.stream(...).toReadableStream()` emits **newline-delimited JSON events**, NOT text — piping it to a client that concatenates bytes shows raw `{"type":…}`. Transform server-side via `s.on("text", …)` and stream **plain text**.
- **Resend = Segments + full-access key:** Resend renamed Audiences → Segments; add contacts with `contacts.create({ segments:[{ id }] })` (env is `NEWSLETTER_SEGMENT_ID`). The **`RESEND_API_KEY` must have Full access** — a sending-only key 401s `restricted_api_key` on contacts.create. `confirmSubscription` logs the Resend error to Vercel; check runtime logs first if confirm fails.
- **RSC boundary:** you cannot pass a component **as a prop** (`as={Link}`) from a Server Component into a Client Component — wrap it as a child instead.
- **`backdrop-filter` containing block:** any element with `backdrop-filter`/`backdrop-blur` becomes the containing block for `fixed` descendants — portal full-screen overlays out to `document.body` (see `MobileNav`).
- **Section backdrop = `isolate`:** a `-z-…` decorative image inside a `Section` paints *behind the section's own opaque background* unless the section is a stacking context. `position: relative` alone is **not** one. Add **`isolate`** (see `Steps`/`Proof`/`MerakClose`).
- **Stacked `Section`s double their padding** — `PageIntro`/`PageHero` end in a `Section` (`py-24 md:py-32`), so a `Section` directly after renders a ~16rem (md) gap. Pull the next section up with **`-mt-24 md:-mt-32`** (every `PageHero` consumer does this). Those subpages also **separate sections by `tone`/`tint`, not divider lines**. The **Footer has no top margin** — the last section butts it directly, so **don't re-add `mt-*` to the Footer**.
- **Manual/Playwright checks:** use `npm start` (not `npm run dev`) in this environment.
- **Images:** optimized **WebP derivatives live in `public/images/`** (committed; converted from PNG via `sharp`, quality 80). The **`Images/` source drop folder is gitignored, root-anchored (`/Images/`)** — an unanchored `Images/` also matches `public/images/` because Git is case-insensitive on Windows.
- **Image optimizer (Next 16):** `images.qualities` is an allow-list — a `quality` value not listed returns **HTTP 400** (`next.config.ts` = `[65, 75]`). A *sometimes-slow* hero is the **Vercel optimizer cold-cache**, not resolution: first request per image+width is a MISS (~0.7–0.9s), then HIT (~0.16s). Size-independent, self-warms with traffic, resets each deploy.
- **`LazyVideo`** is the reusable video primitive — hydration-safe reduced-motion (poster `<img>` via `useSyncExternalStore`), IntersectionObserver play/pause, `preload="none"`; parents own layout. All clips are 1920×1080 → `aspect-video`. `StoryBeat` accepts `video: false` for a text-only beat.
- **Video re-cut workflow:** sources in `Videos/` map to derivative slugs in `scripts/optimize-videos.mjs` — **Beginning→quelle, Second_Part→ripples, Thrid_Part→fluss, End→merak** (`merak` sunset also backs `MerakClose`). The page plays the **derivatives** in `public/video/`, so after re-cutting a source you must re-run `npm run optimize:videos` (bundled ffmpeg, no system install), then commit source + derivatives together. The poster `image2` warning is non-fatal.

## Owner cutover — TODO (not code; owner/founder action)

**Domain + base URL + legal** (domain `vrelo-ki.de` registered at **united-domains** — registrar + DNS + mail host; all DNS records go in their panel):
- [ ] Add `vrelo-ki.de` (+ `www`) to the Vercel project → set the DNS records → wait for SSL.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de` in Vercel → redeploy. Canonicals/OG/sitemap/robots follow automatically (no code change). **Keep the same `NEWSLETTER_SECRET`** so subscribers and pending opt-in links carry over.
- [ ] Optionally 308-redirect the old `*.vercel.app` URL to the apex.
- [ ] **Founder/lawyer:** replace every `[Platzhalter]` in `src/lib/legal/{impressum,datenschutz}.ts` with real, verified copy (`[label](https://…)` syntax for links). The `/demo` Datenschutz section is already written and confirmed.
- [ ] Post-cutover: resubmit `https://vrelo-ki.de/sitemap.xml` in Google Search Console.

**Already live, for the record:** Kontakt (Resend domain verified — this shipped independently of the domain cutover) · Cal.com scheduler (`NEXT_PUBLIC_CAL_LINK` set in Production + Development; **Preview unset**, add via dashboard for branch previews) · Newsletter signup + sending (`newsletter@` mailbox live and monitored) · `/demo` (Anthropic spend limit + usage alert set, DPA auto-incorporated, `ANTHROPIC_API_KEY` **server-only**, rate-limit IP salted-SHA-256 hashed via optional `DEMO_IP_SALT`).

## Open todos (non-blocking, carry forward)
- **Folder-rename cleanup:** the folder is now `Website/`; stale `Vrelo Website New` refs survive in ~7 docs outside this repo (`grep -r "Vrelo Website New" ..`). Leave `VreloWebsiteNew` (the GitHub remote) untouched.
- **Live nudges:** Steps `Fließen` tint `bg-vrelo-petrol/70`; MerakClose sunset tint `opacity-80`; hero-bloom `blur` 2.5–4px; homepage petrol divider `/15`↔`/20`; `MobileNav` is not a full Tab focus-trap (acceptable v1).
- **Polish backlog:** [Ideas.md](Ideas.md) — incl. an optional dedicated `/demo` hero image (reuses `lead-check-banner.webp` for now).

## Tech stack
- **Next.js 16** (App Router, Turbopack) · **TypeScript**
- **Tailwind CSS v4** — brand palette as `@theme` tokens in `src/app/globals.css` (`bg-papier`, `text-tiefes-wasser`, `bg-amber`, …).
- **Fonts:** self-hosted via `next/font` (`src/lib/fonts.ts`) — Plus Jakarta Sans + Fraunces.
- **Tests:** Vitest + React Testing Library (jsdom).
- **Conversion:** `resend` (email) · `@calcom/embed-react` (scheduler). Env documented in `.env.example` (real values in Vercel).
- **Deploy:** Vercel (project `ajdin42-7733s-projects/vrelo-website`). Push to `main` auto-deploys.

## Project structure
```
src/app/            layout.tsx, page.tsx (homepage), globals.css (brand tokens), per-route pages
src/components/     shared primitives (BrandWord, CTAButton, ChromeGate, Section, PageHero, Reveal, …)
                    + one folder per route (home/ leistungen/ faq/ ueber-mich/ kontakt/ lead-check/ demo/ makler/)
src/lib/            fonts.ts, nav.ts (navLinks + focusRoutes), site.ts, contact.ts, newsletter.ts,
                    ratgeber.ts, legal/, email/, per-page copy modules (termin-quelle.ts, makler.ts, leadCheck.ts)
content/ratgeber/   the Ratgeber MDX articles (frontmatter + body)
content/newsletter/ newsletter issue .md files (draft until shipped)
scripts/            send-newsletter.mjs + newsletter/*.mjs (send pipeline) · optimize-videos.mjs
public/video/       optimized clips + posters (derivatives, committed)
public/images/      optimized WebP imagery (derivatives, committed)
public/logo/        brand assets (see Brand.md §4)
.claude/skills/     ratgeber-article (new Ratgeber article) · sending-newsletter (author + send an issue)
Videos/             4 source clips: Beginning→Second_Part→Thrid_Part→End (drop→ripple→delta→sunset)
Images/             source image drop folder (gitignored; optimize → public/images/)
docs/superpowers/   specs/ and plans/
Brand.md            brand brief
image_prompt.md     image-generation prompt catalog
```
Brand enforcement lives in two places: the **`<BrandWord>`** component (forces Fraunces italic for „Vrelo“/„Merak“) and the **Tailwind `@theme` tokens** (palette discipline). Use them; don't hand-roll colors or italics. **`PageIntro`/`PageHero` auto-wrap brand words** in `title` and `lead` via `withBrandWords`.

## Commands
```bash
npm run dev      # local dev (http://localhost:3000)
npm test         # Vitest
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check
git push         # deploy: push to main → Vercel auto-deploys to production
```

> **To write a new Ratgeber article, use the project skill `.claude/skills/ratgeber-article/`** — interactive intake → full first draft in brand voice → frontmatter (incl. required `cover`/`coverAlt`, `draft: true`) → cover prompt + generation checklist. The covers test requires the cover WebP to actually exist, so `npm test` fails until you drop it in.

## How we work
Greenfield workflow via the superpowers skills, one feature/phase at a time, each on its own `feat/*` (or `fix/*`) branch:
1. **brainstorm** → design decisions (visual choices resolved via live demos)
2. **writing-plans** → bite-sized, TDD, per-task-commit plan in `docs/superpowers/plans/`
3. **build** → verified on test/tsc/lint/build, then code review
4. **finishing-a-development-branch** → merge to `main`

Frequent commits; commit messages end with a `Co-Authored-By:` line naming the model that actually wrote them.

## Key decisions (locked)
- German only; personal brand („Ich“); multi-page content/SEO site; calm-over-loud per Brand.md.
- **Generic masculine** in client copy („Kunden“, „Kollegen“) — **not** `:innen`/gendered forms. The founder's voice; applied site-wide.
- **Founder name = `Ajdin Dzafic`** (ASCII, no diacritics) across the website incl. JSON-LD (`FOUNDER` in `src/lib/jsonld.ts`). Deliberate — don't realign it to the company-docs form `Ajdin Džafić`.
- Future prod domain: **vrelo-ki.de** (base URL centralized + env-driven in `src/lib/site.ts`).
- Hero = **full-bleed flowing-water backdrop** (cool petrol, abstract), **replacing** the warm *Merak* „work done“ desk scene — the founder preferred the calm „system runs itself“ flow as a quiet background over the literal payoff. Still **no people** (brand rule holds).
- **Centered spine:** homepage sections center heading + intro; lists/cards/grids keep their form and body text stays left-aligned — one calm focus down the page without the scannability cost of centering body copy.
- **Hero copy = short pain H1 + substance in the sub:** H1 „Manuelle Aufgaben rauben dir die Zeit.“ (one line; „manuelle“ implies *automatable*); the sub names service + tasks and ends on „So gewinnst du jede Woche Stunden zurück.“ Why: a two-sentence H1 ran to 6 lines. Use honest quantities („Stunden“) — no invented precise figures.
- **Primary CTA = „Zeit zurückgewinnen“** — the `CTAButton` *default*, so it's site-wide (asserted in `CTAButton.test.tsx`). Benefit-led, echoes the time/hours hero, and works everywhere because the nav also has a plain „Kontakt“ link.
- **Prices never appear on the site** — they're revealed in the Angebot after Discovery. Guarded by tests on the `/makler` copy module.
- **Hormozi skills are framework/output only** — keep the Vrelo voice (calm-over-hype) on top; their artifacts live in `Knowledge/marketing/`, never shipped verbatim. **Review lens:** score every customer-facing change against the **Hormozi Value Equation**, defined in HQ [CLAUDE.md](../CLAUDE.md) §8.
- Videos: full 4-clip sequence on **Über mich**; sunset at the homepage Merak-close; **not** in the hero (LCP). Lazy-load, poster fallback, respect `prefers-reduced-motion`.
- No tracking cookies on load (cookieless analytics + click-to-load Cal.com) → no consent banner needed for now.
- Legal pages are drafts-to-review (founder/lawyer must verify before go-live).

> **Changelog** (newest first, one line each; git has the detail):
> - **2026-08-08** – Lead-Check-Ergebnis-Mails: der Lead bekommt erstmals wirklich seine „Zusammenfassung per Mail“ (branded HTML, € zentral, `schnell` ohne €-Versprechen), interne Benachrichtigung als KPI-Kacheln + Tabelle (Detail im Lead-Reaktions-Check-Bullet oben).
> - **2026-08-06** — KI-Bildwelt deklariert: Hinweissatz auf `/ueber-mich` + `Bildnachweis` im Impressum (Regel oben unter *Status*).
> - **2026-08-01** – `/demo`-Reveal schließt auf Direktbuchung (`SchedulerEmbed` inline) statt `/kontakt`-Link; Karte scrollt sich selbst ins Bild, Verlauf in `<details>` (im Fail-safe offen).
> - **2026-07-28/29** — Ratgeber-Cluster **live**: 9 Artikel (3 → 12) + Cover, Typografie-Copy-Guard (pure core + Korpus-Test), Cross-Article-Pass gegen Serien-Masche.
> - **2026-07-23** — `/makler` landing page + `ChromeGate` (Details in der eigenen Section oben).
> - **2026-07-04** — CTA conversion pass (hero + mid-page Steps CTA microcopy, compact mobile header CTA, `CTAButton tone="petrol"`); `/demo` shipped live and cleared for outreach.
> - **Juni 2026** — Aufbau: Landing page + centered spine, Ratgeber live, subpage design pass (`PageHero`, petrol/papier rhythm, `WaterSection`), `TerminQuelleAngebot`, Cal.com scheduler, Newsletter-Versand, `/lead-check`, `stumm` für AA abgedunkelt.
