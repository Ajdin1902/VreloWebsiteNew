# Leistungen – „Die Termin-Quelle“ flagship block

**Goal:** Surface Vrelo's first packaged offer, *Die Termin-Quelle* (speed-to-lead), as a named, featured flagship block at the top of `/leistungen`, above the existing 7-service capability menu.

**Source of truth for the offer:** `../../Knowledge/Offers/Termin-Quelle.md` (HQ). This page is the public, **price-free** expression of it.

---

## Why
Items #1 (Anfragen & Leads), #2 (Termine) and #4 (Nachfass-Mails) in `src/lib/leistungen.ts` already describe the *parts* of the Termin-Quelle as generic capabilities. Packaging them into one named product (Hormozi productization) gives prospects a concrete thing to say yes to, while the menu below stays as the broader toolbox.

## Decisions (locked in brainstorming, 2026-06-24)
- **Placement:** featured section directly under the `PageHero` lead, above the menu. The menu gets a new heading **„Die einzelnen Bausteine“** reframing the 7 services as components.
- **No price on the page** – consistent with the whole site (LANDING_PAGE §6, bespoke). Price is revealed in the Angebot after a call.
- **Founding promise included** as a calm public note: „Meine ersten drei Kunden bekommen eine zusätzliche Zusage – frag mich einfach danach.“ No countdown, no „!!!“.
- **Promised speed = „unter fünf Minuten“** (rationale recorded in the offer doc).
- **Panel visual** (amber-accent vs petrol band) resolved live in-browser during build, AA-checked, 1440/390.

## Components / files
- **New** `src/lib/termin-quelle.ts` – typed copy object (one source of truth, testable): `label`, `name`, `promise`, `body`, `flow: string[]` (the 5 steps), `outcome`, `foundingNote`, `cta: { label, href }`.
- **New** `src/components/leistungen/TerminQuelleAngebot.tsx` – the featured panel; renders the copy object. Distinct, richer treatment than the light `LeistungDetail` cards; the 5-step `flow` as a horizontal row (wraps on mobile). CTA links to `/kontakt`.
- **Modify** `src/app/leistungen/page.tsx` – render `<TerminQuelleAngebot>` as the first `Section` after the hero (taking the `-mt-24 md:-mt-32` pull-up that currently sits on the first `LeistungDetail`), then a heading „Die einzelnen Bausteine“, then the unchanged `leistungen.map`.

## Copy (final, brand-voice – German)
- **label:** „Mein Angebot“
- **name:** „Die Termin-Quelle“
- **promise:** „Aus jeder Anfrage wird ein Termin – von selbst, während du arbeitest.“
- **body:** „Eine Anfrage kommt herein – und bleibt im Tagesgeschäft liegen, bis der Wettbewerber schneller war. Die Termin-Quelle schließt diese Lücke: Jede Anfrage bekommt in unter fünf Minuten eine persönliche Antwort, wird qualifiziert, bekommt einen Termin direkt in deinen Kalender – und wer sich nicht meldet, wird höflich nachgefasst. Alles sauber protokolliert, maßgeschneidert auf deinen Betrieb. Nichts, das du lernen oder warten musst.“
- **flow:** [„Antwort in 5 Minuten“, „Qualifizieren“, „Termin buchen“, „Nachfassen“, „Protokoll“]
- **outcome:** „Du gewinnst mehr Termine aus den Anfragen, die du ohnehin schon hast – und einen ruhigen Kopf, weil nichts mehr durchs Raster fällt.“
- **foundingNote:** „Meine ersten drei Kunden bekommen eine zusätzliche Zusage – frag mich einfach danach.“
- **cta:** { label: „Lass uns deine Termin-Quelle bauen“, href: „/kontakt“ }

## Constraints / gates
- Client copy German; generic masculine; calm, no hype.
- German typography: „…“ (U+201E/U+201C), spaced en-dash (U+2013) not em-dash. **Byte-verify after every write** (Edit/Write downgrade them – repo gotcha).
- Tokens only (no hand-rolled colors), no pure white, AA contrast (≥4.5 body / ≥3 large). `BrandWord` not needed (no „Vrelo“/„Merak“ in this copy; „Termin-Quelle“ is a product name, normal type).
- The page's single water metaphor is spent on the product name; body stays water-free.

## Testing (Vitest + RTL)
- `src/lib/termin-quelle.test.ts` – the copy object has all required fields; flow has 5 steps; **no euro/price string** (`/€|EUR|\d+\s?€/` absent) – locks the no-price decision.
- `src/components/leistungen/TerminQuelleAngebot.test.tsx` – renders name, promise, all 5 flow steps, founding note; CTA is a link to `/kontakt`; asserts no price string in output.

## Out of scope
- The n8n build (Option B). A dedicated `/leistungen/termin-quelle` sales page (could come later). WhatsApp/KPI upsells.
