# Vrelo Website — Design Spec

> Date: 2026-06-01 · Status: **awaiting user review** · Market: DACH (German only)
> Brand source of truth: [CLAUDE.md](../../../CLAUDE.md) and `C:\Users\ajdin\OneDrive\AJ19\ADZ\Brand\`.
> This spec captures *what* to build and *why*. The step-by-step implementation plan is produced separately (writing-plans).

---

## 1. Goal & positioning

A **content/SEO website** for **Vrelo**, a one-person AI-automation studio for German-speaking small businesses (DACH Solo-Selbstständige & Kleinunternehmer), framed as a **personal brand** (first-person „Ich").

The site has two jobs, ranked:
1. **Convert** the right visitor into a booked intro call (primary) or a contact-form enquiry (fallback).
2. **Earn organic search traffic** over time via a German Ratgeber (blog) and grow a **newsletter** audience as a warm-nurture channel.

Everything obeys the brand duality: **cool source (*Vrelo*) → warm outcome (*Merak*-Effekt)**, landing on the feeling. All client-facing copy is German; code/comments English.

**Out of scope (Phase 2):** per-use-case long-tail landing pages (e.g. „Terminbestätigung automatisieren"), case-study/Referenzen as its own page, English localization, cookie-consent banner (not needed under the no-tracking-cookies-on-load approach below).

---

## 2. Information architecture (sitemap)

```
/                     Home (Startseite)
/leistungen           Leistungen — what gets built, how it works, proof folded in
/ueber-mich           Über mich — first-person story + 4-clip water video narrative
/ratgeber             Ratgeber — blog index
/ratgeber/[slug]      Article (MDX), 3 seeded starter articles
/faq                  FAQ (with FAQPage JSON-LD)
/kontakt              Kontakt — Cal.com scheduler (primary) + contact form (fallback)
/newsletter           Newsletter signup + value pitch (shareable link)
/newsletter/bestaetigt Double-opt-in confirmation success page
/impressum            Impressum (legal, draft-to-review)
/datenschutz          Datenschutzerklärung / GDPR (legal, draft-to-review)
```

**Global nav:** Logo → Home · Leistungen · Über mich · Ratgeber · FAQ · Kontakt · then **„Quelle erkunden"** CTA button (Amber), pinned right. Mobile: hamburger.

**Footer (cool / Tiefes Wasser):** compact logo + descriptor, nav repeat, **newsletter signup**, Impressum/Datenschutz links, email, LinkedIn, primary tagline in Fraunces italic.

Proof/Referenzen is **folded into Home (section 6) and Leistungen**, not a standalone page.

---

## 3. Visual direction

- **Hero = Direction B "Deep Water Immersive"**: full deep-water background (radial Petrol→Tiefes Wasser gradient), the **amber drop as a glowing focal point** with a subtle, slow shimmer (disabled under `prefers-reduced-motion`).
- **Rest of the site = calm "Editorial"**: Papier (`#F4EFE6`) backgrounds, generous whitespace, restrained.
- **Colour discipline:** 70/20/10 (cool / warm / neutral). Cool sections describe the *work*; warm sections (story, results, closing CTA) describe the *feeling*. Petrol and Amber never weighted equally.
- **Type:** Plus Jakarta Sans everywhere (self-hosted via `next/font`); Fraunces **italic** only for „Vrelo"/„Merak", pull-quotes, and the display logotype.
- **Logo assets:** copy the 7 SVGs from `…\Brand\Vrelo Brand Project\assets\` into `/public`. Standard `vrelo-symbol-navy-amber.svg` on light; `vrelo-symbol-paper-amber.svg` on dark. `merak-submark-amber.svg` for emotional contexts only — never replaces the logo. Drop always points up; never distort/rotate/shadow.
- **Backgrounds are Papier, never pure white.**

### Homepage section flow (cool → warm, lands on Merak)
1. **Hero** (cool) — H1 tagline + subheadline + „Quelle erkunden"
2. **Das Problem** — empathy, „du", mirrors the Kleinkram pain
3. **Was ich baue** — offer overview (Termine · Nachfassen · Dateneingabe · Kommunikation) as outcomes → link to Leistungen
4. **Die Geschichte** (warm) — Quelle→Merak teaser → link to Über mich
5. **So läuft's ab** — 3 steps: Hinschauen · Bauen · Fließen
6. **Vertrauen / Referenzen** — calm proof (placeholders until real)
7. **Abschluss-CTA** (warm) — **End.mp4 sunset loop** behind the Merak-Effekt close + „Quelle erkunden" (+ contact-form link)
8. **Footer** (cool)

---

## 4. Video assets (`/Videos`)

Four clips form the brand arc: `Beginning.mp4` (drop = Quelle) → `Second_Part.mp4` (pond ripples) → `Thrid_Part.mp4` (delta = Fluss) → `End.mp4` (sunset = Merak).

**Placement (concentrated, not scattered):**
- **Über mich** — full 4-clip sequence as the scroll narrative spine, clips alternating left/right beside matching story beats.
- **Homepage closing CTA** — `End.mp4` (sunset) only, behind/above the final Merak CTA (below the fold → no LCP cost).
- **NOT in the hero** (LCP/SEO/mobile cost).

**Handling for all video:** transcode to web-optimized H.264 mp4 **+ webm**, target ≤2 MB where feasible; generate first-frame **poster** images; `muted loop playsinline preload="none"`; autoplay only when scrolled into view (IntersectionObserver); under `prefers-reduced-motion` show the poster still instead of playing. Originals stay in `/Videos`; optimized derivatives live in `/public/video`.

---

## 5. Technical architecture

| Concern | Decision |
|---|---|
| Framework | Next.js (latest, App Router) + TypeScript |
| Styling | Tailwind CSS; brand 70/20/10 palette as named tokens (`papier`, `tiefes-wasser`, `vrelo-petrol`, `amber`, `honig`, `sonnenlicht`, `stein`, `gletscher`, `ember`, `tinte`, `faden`, `stumm`) |
| Fonts | `next/font` self-hosting Plus Jakarta Sans + Fraunces (variable) |
| Content | MDX articles in `/content/ratgeber/*.mdx`, typed frontmatter (title, description, date, slug, tags, cover), build-time typed loading |
| Rendering | Fully static (SSG), incl. articles — fast, cheap, best for SEO/CWV |
| Email | Resend (contact form + newsletter, single vendor) |
| Newsletter emails | React Email templates, brand-styled |
| Scheduler | Cal.com embed, consent-gated (click-to-load) |
| Analytics | Vercel Web Analytics (cookieless) |
| Deploy | Vercel |

**Key components:** `Header`, `Footer`, `Hero`, `SectionBlock`, `CTAButton`, **`BrandWord`** (auto-renders „Vrelo"/„Merak" in Fraunces italic everywhere, incl. MDX), `VideoSequence` / `LazyVideo`, `ArticleCard`, `Prose` (MDX styling), `FAQItem`, `NewsletterSignup`, `ContactForm`, `SchedulerEmbed`.

`BrandWord` and the Tailwind brand tokens are the two enforcement mechanisms that keep the most-violated brand rules (italic brand words; palette discipline) correct by construction.

---

## 6. Forms, scheduler & newsletter

### Contact form (`/kontakt`)
Fields: Name, E-Mail, „Was frisst gerade deine Zeit?" (textarea), optional Betrieb. Submit via Next.js Server Action → Resend email to founder. Honeypot + basic rate-limit for spam. Required **privacy-consent checkbox** → /datenschutz. Calm success state („Danke — ich melde mich. Kein Stress.").

### Scheduler (`/kontakt`)
Cal.com embed as primary CTA, **consent-gated**: third-party scripts load only after the user clicks „Termin anzeigen" — no cookies fire on load.

### Newsletter
- **Value:** „Neue Automatisierungs-Ideen mit KI — ruhig erklärt, wenn's was Gutes gibt."
- **Signup placement (priority):** (1) end of every Ratgeber article, (2) footer site-wide, (3) Ratgeber index block, (4) dedicated `/newsletter` page for sharing. **Never** in the hero or competing with the booking CTA.
- **Tech:** signup → Server Action adds contact to a Resend Audience.
- **GDPR double opt-in (required in DE):** signup → confirmation email → click → `/newsletter/bestaetigt` success + welcome email. Consent line references /datenschutz.
- **Brand:** React Email templates on Papier with the palette; „Vrelo"/„Merak" serif-italic where supported, graceful fallback (brand colour + layout carry identity, since email fonts are unreliable).

### Consent / cookies
No tracking cookies set on load (cookieless analytics + click-to-load Cal.com & video). Therefore **no full cookie-consent banner required**; the Datenschutzerklärung documents the click-to-load embeds. If Calendly/marketing pixels are added later, add a consent banner then.

---

## 7. SEO foundation

- Unique German `<title>` + meta description per page via `generateMetadata`; articles from frontmatter.
- OG/Twitter cards via `next/og` (branded, palette + logo).
- **JSON-LD:** `ProfessionalService`/`LocalBusiness` (Home, DACH service area), `Person` (Über mich), `Article` (each post), `FAQPage` (/faq), `BreadcrumbList` (site-wide).
- Auto `sitemap.xml` + `robots.txt`, canonical URLs, semantic headings, descriptive alt text.
- German keyword targeting per page; long-tail via Ratgeber.
- **3 seeded starter articles** (on-brand drafts): e.g. (a) Terminbestätigungen automatisieren, (b) Wie kleine Betriebe täglich Stunden zurückgewinnen, (c) „Flickenteppich vs. saubere Quelle". User refines/replaces.

---

## 8. Legal (DACH)

- **Impressum** (§5 DDG/TMG) and **Datenschutzerklärung** (GDPR): well-structured German drafts with clearly-marked placeholders for personal details (name, address, contact).
- ⚠️ **Drafts to review:** these are legal documents — founder must review (or use a lawyer / eRecht24) before go-live. Marked as such in-page.

---

## 9. Success criteria

- All pages in §2 build and render statically; Lighthouse SEO ~100, strong Core Web Vitals (LCP not harmed by video).
- Brand compliance (CLAUDE.md §6 checklist): 70/20/10 palette, Papier background, „Vrelo"/„Merak" always Fraunces-italic, logo rules, calm/non-salesy German copy that lands on the Merak-Effekt.
- Contact form delivers email; newsletter double-opt-in flow completes; Cal.com loads only after consent.
- No tracking cookies on load.
- Deploys to Vercel.

---

## 10. Open items for the user

1. Provide real details for Impressum/Datenschutz (or confirm placeholders for now).
2. Provide/confirm Resend + Cal.com accounts (env vars) before forms/scheduler go live.
3. Real Referenzen/testimonials when available (placeholders until then).
