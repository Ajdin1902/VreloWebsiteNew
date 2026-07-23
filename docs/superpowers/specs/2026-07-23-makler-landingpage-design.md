# Makler-Landingpage `/makler` – Design (2026-07-23)

*A focused, `noindex` outreach landing page that sells the two signature products – **Die Termin-Quelle** and the **Document Concierge** – to independent Makler and Finanz-/Versicherungsmakler, and closes on a booked call. The link is sent directly to a scored lead; the page is the only thing they see.*

Sources of truth (this page is the price-free sales reading of them, never a fork):
- `../../../../Knowledge/Offers/Termin-Quelle.md` – offer, Wertstack, guarantee, Gründungs-Zusage, objections
- `../../../../Knowledge/Strategy/Document_Concierge.md` – service design, flow, trust posture
- `../../../Brand.md` – voice, palette, typography
- Existing block copy: `src/lib/termin-quelle.ts` (the `/leistungen` flagship block)

Related: `2026-06-24-leistungen-termin-quelle-design.md`, `2026-06-27-lead-reaktions-check-design.md`, `2026-07-02-termin-quelle-interaktiv-demo-design.md`.

---

## 1. Purpose and scope

**Job:** a lead opens the link from a cold-but-warm first contact, understands within one scroll what the two products do for *his* week, sees that the risk is on Vrelo's side, and books a call.

**In scope:** one new route, one focus chrome mechanism, one copy module, the DC video slot (empty for now), tests.

**Out of scope (explicitly):**
- Building the Document Concierge itself, and recording its loop video. The page ships with a config-gated slot; the video is a separate piece of work.
- Prices. The site convention is price-free; the ROI anchor (~€4.000 per recovered deal) belongs in the conversation, where it can be run against his numbers.
- `/lead-check`. It is the *cold* door-opener; a visitor already on `/makler` is past that door. Adding it later is one entry in the copy module.
- Any change to the existing site pages, nav, or sitemap.

**Success criteria:** `/makler` renders with no site nav, returns `noindex`, is absent from `sitemap.xml`, links to `/demo`, embeds the Cal scheduler, and every other route keeps its Header and Footer unchanged.

---

## 2. Decisions (locked in brainstorming)

| Fork | Decision | Why |
|---|---|---|
| Product hierarchy | **Termin-Quelle leads; Document Concierge is the second step** | One story with one CTA. The TQ is instantly graspable, has a live demo, and fits both Makler and Finanzberater; the DC is the moat but only lands for the finance side and has nothing to try yet. |
| Chrome | **Focus mode** – no nav, minimal footer | The page has one job. Every nav link is an exit before the CTA. A CTA button stays in the header so the close is always reachable. |
| Price | **None on the page** | Site convention (`termin-quelle.ts`). Price is revealed in the Angebot after Discovery. |
| Route | **`/makler`** | Short and readable aloud in outreach: `vrelo-ki.de/makler`. Covers both Makler senses. |
| Try-it-out | **`/demo`** for the Termin-Quelle | The strongest proof we own – he plays his own client against the booking bot. |
| DC proof | **Config-gated video slot**, flow cards until the video exists | Honest today, one-line upgrade later. Mirrors the Cal/Newsletter/`/demo` "not configured yet" pattern. |
| Risk reversal | **Guarantee + Gründungs-Zusage** | Both, calm, stated once. No countdown, no scarcity theatre. |
| Indexing | **`noindex, nofollow`**, not in nav, not in sitemap | Same posture as `/lead-check` and `/demo`. |

---

## 3. Architecture

### 3.1 The chrome problem and its fix

`Header` and `Footer` render in the root layout (`src/app/layout.tsx`), so a nested `/makler/layout.tsx` cannot remove them – nested layouts render *inside* the root layout.

**Chosen: `ChromeGate`.** A small client component that reads `usePathname()` and returns `null` on focus routes, otherwise its children.

```
src/lib/nav.ts          + export const focusRoutes = ["/makler"]
                        + export function isFocusRoute(pathname: string): boolean
src/components/ChromeGate.tsx   "use client" – returns null on focus routes
src/app/layout.tsx      <ChromeGate><Header /></ChromeGate> … <ChromeGate><Footer /></ChromeGate>
```

`Header` and `Footer` are passed as **children**, never as a prop – passing a component as a prop from a Server Component into a Client Component crosses the RSC boundary and throws (recorded gotcha).

`usePathname()` resolves during SSR of client components in the App Router, so the chrome is absent in the server-rendered HTML – no flash, no layout shift.

**Rejected: route groups.** Moving all twelve existing route folders into `src/app/(site)/` is idiomatic but costs a large diff across metadata, canonical, sitemap and robots tests for zero functional gain.

### 3.2 Focus chrome

- **`MaklerHeader`** – `BrandLockup` on the left (links to `/`), `CTAButton` on the right anchored to the page's own booking section (`#termin`). No nav, no burger, no `MobileNav`. On mobile the CTA label shortens, following the pattern already used in `Header`.
- **`MaklerFooter`** – one line: `Impressum` · `Datenschutz` · `Kontakt`. Legal reachability is not optional; the rest is.

Both live in `src/components/makler/` and are rendered by the page itself, not by a layout – so they cannot leak onto other routes.

### 3.3 Content module

All page copy lives in **`src/lib/makler.ts`**, typed, in the shape of `termin-quelle.ts`:

```ts
export type MaklerProduct = {
  eyebrow: string;
  name: string;
  promise: string;
  body: string;
  flow: string[];          // the mechanism, as short steps
  solves: { title: string; body: string }[];
  proof?: { prompt: string; label: string; href: string };   // TQ -> /demo
  demoVideo?: { slug: string; caption: string } | null;      // DC -> null for now
};
export type MaklerPage = { hero; problem; terminQuelle; bridge; documentConcierge; warumIch; garantie; einwaende; close };
```

Rules: no prices, no invented numbers, no testimonials. German copy per Brand.md – „…“ quotes (U+201E/U+201C), spaced en-dash „ – “, generic masculine, first person, no hype vocabulary.

### 3.4 Reused, not rebuilt

`PageHero` · `Section` (`tone`, `tint`) · `WaterSection` · `Reveal` · `CTAButton` (`tone="petrol"`, `variant="inverse"`) · `FaqItem` · `SchedulerEmbed` · `LazyVideo` · `BrandWord` / `withBrandWords` · `.card-depth` · `PageImage`. No new design tokens, no new motion primitives.

**One small upstream change:** `SchedulerEmbed`'s not-configured fallback currently reads „Schreib mir so lange einfach über das Formular unten.“ – there is no form below it on `/makler`. Add an optional `fallbackHint` prop defaulting to the existing string, so `/kontakt` is untouched and `/makler` can point at `mailto:`/`/kontakt` instead.

---

## 4. Page structure

Cool to warm down the page, the homepage rhythm. One CTA target: the booking section.

| # | Section | Tone | Content |
|---|---|---|---|
| 1 | **Hero** | full-bleed image + petrol scrim | Pain H1 addressed to him; sub names both outcomes (mehr Termine, keine Unterlagen-Jagd); primary CTA + friction reducer „Kostenloses Erstgespräch – 30 Minuten, unverbindlich.“ |
| 2 | **Die zwei Lecks** | paper | His day, not our tech. Leak 1: the enquiry that arrives at 21:00 and is cold by morning. Leak 2: chasing Gehaltsabrechnung, Kontoauszug, SCHUFA. Establishes the need for both products before either is named. |
| 3 | **Die *Termin-Quelle*** | petrol panel | Promise → mechanism (5 steps) → what each step removes. Ends on the demo invitation: „Spiel deinen eigenen Kunden“ → `/demo`. |
| 4 | **Brücke** | paper, narrow | One sentence: the appointment is booked, then the paperwork starts. Frames product 2 as the *next step*, not a second option. |
| 5 | **Document Concierge** | paper | Promise → flow (kickoff, invite, upload + sanity check, reminders, files land, status ping, escalation) → **trust block** (his own cloud, EU-hosted, AVV, in transit only). Video slot or flow cards. |
| 6 | **Warum ich** | cool tint | One accountable person · bespoke, not a template dump · plain German · nothing to learn or maintain. No fabricated references – the honest-references stance of the main site holds. |
| 7 | **Garantie + Gründungs-Zusage** | warm | „Ich gehe in Vorleistung, nicht du.“ – payment after his own Abnahme · the word on the five minutes · first month of Betrieb refundable. Then the limit to the first three, stated once. |
| 8 | **Einwände** | paper | `FaqItem` accordion, six entries verbatim-in-spirit from `Termin-Quelle.md` §Einwände. |
| 9 | **Der Termin** (`id="termin"`) | `WaterSection` | `SchedulerEmbed`, click-to-load, plus a plain fallback line to `/kontakt`. One hop fewer between persuasion and booking. |
| – | **Footer** | – | `MaklerFooter` only. |

### 4.1 The Document Concierge slot

```ts
// src/lib/makler.ts
demoVideo: null,   // -> renders the seven flow cards
// later, once the DC is built and the loop is recorded:
demoVideo: { slug: "document-concierge", caption: "…" },   // -> renders LazyVideo
```

The video pipeline is unchanged: source into `Videos/`, add the slug block to `scripts/optimize-videos.mjs`, run `npm run optimize:videos`, commit source and derivatives together (recorded gotcha).

### 4.2 Hero image

Reuse an existing optimized WebP first – `lead-check-banner.webp` is the closest fit (cinematic petrol water with one warm glint) and was made for exactly this audience. A dedicated image is a later polish item, prompt to be added to `image_prompt.md` §Full-bleed page heroes if we take it.

---

## 5. Testing

Vitest + React Testing Library, mirroring the existing route tests.

1. **`ChromeGate`** – renders children on `/`, `/leistungen`, `/kontakt`; renders nothing on `/makler`. `usePathname` mocked.
2. **`nav.test.ts`** – `isFocusRoute` true for `/makler`, false for every entry in `navLinks` and for `/lead-check` and `/demo` (they deliberately keep full chrome).
3. **Page metadata** – `robots.index === false` and `robots.follow === false`.
4. **`sitemap.test.ts`** – extend the existing exclusion assertion so `/makler` is absent, alongside `/lead-check` and `/demo`.
5. **Page render** – heading order H1 → H2s; the `/demo` link is present; the booking section carries `id="termin"` and the header CTA points at `#termin`; `MaklerFooter` exposes Impressum and Datenschutz links.
6. **DC slot** – with `demoVideo: null` the flow cards render and no `<video>` exists; with a slug set, `LazyVideo` renders. Test against the component, injecting the product object, not the live module.
7. **`SchedulerEmbed`** – the existing test still passes with no `fallbackHint`; a new case asserts a passed hint replaces the default.
8. **Copy guard** – `makler.ts` contains no ASCII `"` in German copy, no em-dash (U+2014), and no digit-plus-`€` price token. Cheap regex test; the German-punctuation gotcha has bitten before.

Full gate before merge: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, plus a manual `npm start` check at 1440 and 390 (`npm run dev` is unreliable in this environment).

---

## 6. Risks

- **Chrome leak.** If a future focus route is added to `focusRoutes` without its own header, it renders headless. Mitigated by keeping the list in `nav.ts` next to `navLinks` and by test 2.
- **`usePathname` in SSR.** If it ever returned `null` server-side, the chrome would flash. `ChromeGate` treats a null pathname as "not a focus route" (chrome renders), which fails toward the safe, normal case; verified in the browser at build time.
- **Copy drift.** `makler.ts` duplicates offer wording that lives in HQ. Mitigated by the header comment naming the two HQ files as sources of truth; changes to price, guarantee or Gründungs-Zusage must start there.
- **Honesty.** The Document Concierge is specced, not built. The page must describe it as what Vrelo builds for him, never as a running system he can see today. No fake screenshots, no fake demo button.

---

## 7. Follow-ups (not this build)

- Build the Document Concierge (`Products/DocumentConcierge/`, plan already written) and record the loop video, then flip `demoVideo`.
- Optional: a dedicated `/makler` hero image.
- Optional: re-add the `/lead-check` bridge if outreach shows the page needs a softer intermediate step.
- Outreach: point the Pond-1 and Pond-2 Tier-A sequences at `vrelo-ki.de/makler` once the domain cutover completes (HQ `CLAUDE.md` §7).
