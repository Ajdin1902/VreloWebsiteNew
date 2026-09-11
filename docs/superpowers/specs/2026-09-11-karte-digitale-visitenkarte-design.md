# Digitale Visitenkarte — `/karte`

**Date:** 2026-09-11
**Status:** Design approved, pending spec review

## Goal

A hidden digital business card at `vrelo-ki.de/karte` that shows Ajdin's contact
details on a branded *Vrelo* page, plus a one-tap "save to phone" via vCard. A
separate QR (hidden QR-only page + standalone image file) encodes the card URL so
Ajdin can present it from his phone; whoever scans lands on `/karte` and saves the
contact. The QR is never shown to the person saving the contact — only to Ajdin
when he presents it.

## Contact data (single source of truth)

- Name: **Ajdin Dzafic** (ASCII, no diacritics — company rule)
- Brand / ORG: **Vrelo**
- Descriptor: **Automatisierung für Betriebe**
- Email: **ajdin@vrelo-ki.de**
- Phone: **+49 176 4380 6085**
- Website: **https://vrelo-ki.de**
- Photo: source `C:\Users\ajdin\OneDrive\AJ19\Arbeit\Dokumente\Personal\Dzafic_Ajdin.jpg`

These live in one module (e.g. `src/lib/karte.ts`) consumed by the page, the QR
page, and the `.vcf` route so nothing drifts.

## Routes

All three are hidden the same way `/demo` and `/makler` are: `robots: { index:
false, follow: false }`, absent from `sitemap.ts`, absent from navigation.

### `/karte` — the contact card (page)
- Web-optimized portrait photo (rounded), on Papier background, Petrol/Amber accents.
- `Ajdin Dzafic`, *Vrelo* in Fraunces italic, descriptor line `Automatisierung für Betriebe`.
- Email as `mailto:` link, phone as `tel:` link (tap-to-mail / tap-to-call).
- Discreet "Website ansehen" link → `https://vrelo-ki.de`.
- Primary button **„Kontakt speichern"** → links to `/karte/kontakt.vcf`.
- **No QR on this page.**

### `/karte/qr` — QR-only page
- Nothing but a large, centered QR on a clean *Vrelo* background (Papier).
- QR encodes `https://vrelo-ki.de/karte` (rendered from the committed SVG asset).
- Small caption is acceptable but optional; keep it minimal.

### `/karte/kontakt.vcf` — vCard route handler
- Next.js route handler (`route.ts`) returning vCard 3.0 text.
- Headers: `Content-Type: text/vcard; charset=utf-8`,
  `Content-Disposition: inline; filename="ajdin-dzafic.vcf"`.
- vCard fields: `FN:Ajdin Dzafic`, `N:Dzafic;Ajdin;;;`, `ORG:Vrelo`,
  `TITLE:Automatisierung für Betriebe` (shows as the sub-line under the name in most
  contacts apps), `EMAIL`, `TEL;TYPE=CELL`, `URL:https://vrelo-ki.de`, and `PHOTO`
  embedded as base64 (small square JPEG) so the picture rides along offline.
- Encoding note: vCard 3.0 with UTF-8; the „ü" in the TITLE must survive as bytes
  (verify after generation).

## Assets (generated once, committed — no runtime deps)

Processed by a one-off script (kept in repo under `scripts/`), outputs committed:
1. **Card photo** — web-optimized `.webp` in `public/images/` (reasonable display size).
2. **vCard photo** — small square JPEG (~300px) base64-embedded in the `.vcf` output
   (stored as a committed data file or inlined in `karte.ts`).
3. **QR SVG + PNG** — encoding `https://vrelo-ki.de/karte`, in `public/`. SVG used by
   the `/karte/qr` page; PNG is the standalone "save to phone / print / signature" file.

QR is a static asset because the URL is fixed; no client-side QR library ships.

## Testing (Vitest, matching repo conventions)

- `/karte` renders name, *Vrelo*, descriptor, email, phone, website, save button.
- `/karte` and `/karte/qr` both export `robots: { index: false, follow: false }`.
- Neither `/karte` nor `/karte/qr` appears in `sitemap.ts` output.
- `.vcf` route returns `text/vcard` content-type and a body containing `BEGIN:VCARD`,
  `FN:Ajdin Dzafic`, `ORG:Vrelo`, the email, and the phone number.

## Out of scope

- No analytics/tracking on the card.
- No multi-person cards (URL `/karte` chosen so a second person could be added later,
  but not built now).
- No dynamic/editable contact data (change = edit `karte.ts` + redeploy).

## Deployment

Push to `main` auto-deploys via Vercel; the QR points at production, so it resolves
only once deployed. German copy passes brand punctuation rules (no Gedankenstrich,
„…" quotes) — verify bytes after write.
