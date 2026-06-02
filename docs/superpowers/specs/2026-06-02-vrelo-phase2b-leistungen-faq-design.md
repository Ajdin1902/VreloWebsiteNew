# Vrelo Website — Phase 2b: Leistungen + FAQ (Design)

> Scope: the `/leistungen` and `/faq` pages. Extends the master design spec
> ([2026-06-01-vrelo-website-design.md](2026-06-01-vrelo-website-design.md)) and reuses the
> Phase 2a building blocks (`Section`, `CTAButton`, `BrandWord`, brand `@theme` tokens).
> Client-facing copy is **German** (drafts below — founder refines); code & comments **English**.

## Goal

Ship the two core content pages that the homepage and global nav already point at — turning two of
the five dead nav links (`/leistungen`, `/faq`) into real pages. Both are calm Papier/Editorial
pages that end on a warm CTA, consistent with the homepage's cool→warm rhythm. The Leistungen page
expands the homepage's four "Was ich baue" categories into a proper "what & how" page with
folded-in proof; the FAQ page answers the questions small businesses ask before reaching out.

## Scope & boundaries

**In scope:** `/leistungen` page, `/faq` page, the reusable `PageIntro` + `ClosingCta` components,
typed content data, native-`<details>` FAQ accordion, minimal per-page `<title>`/description,
tests, responsive review.

**Explicitly deferred (NOT in 2b):**
- **JSON-LD / FAQPage / OG images / sitemap / canonical** → Phase 3 SEO pass. (2b ships only a
  minimal `metadata` export per page.)
- Real testimonials → Referenzen is a labelled placeholder, like the homepage `Proof`.
- A real `/kontakt` page → Phase 4. **2b CTAs link to `/kontakt` anyway** (consistent with the
  homepage `CTAButton`; it 404s until Phase 4, same as today).
- `/ueber-mich`, `/ratgeber` (other dead nav links) → later phases; untouched here.
- Mobile hamburger nav → still footer-served (unchanged from Phase 1/2a).

## Brand guardrails (every task)

Papier background, never white. „Vrelo"/„Merak" ALWAYS via `<BrandWord>` (Fraunces italic);
Fraunces otherwise only for permitted pull-quotes/manifest lines. **Deep-water (cool, dark) is
Hero-only — inner pages stay Papier/Editorial.** 70/20/10 palette — Amber is the accent/CTA only.
Calm, German, first-person „du"/„ich", no hype. German typographic quotes „…" = U+201E/U+201C.

---

## Architecture

A `tone`-driven `Section` already encodes the tonal rhythm. Phase 2b adds two **shared inner-page
primitives** (reused by future pages too), per-page **typed content data** (separated from
presentation so it's testable), and small **presentational components** composed by the route
files.

```
src/components/PageIntro.tsx              shared inner-page header: eyebrow + H1 + lead (paper tone)
src/components/ClosingCta.tsx             shared warm closing CTA section (heading + lead + CTAButton)
src/lib/leistungen.ts                     typed service data array (content, not markup)
src/lib/faq.ts                            typed grouped Q&A data
src/components/leistungen/LeistungDetail.tsx   renders one service block (icon/number, title, pain→gain, chips)
src/components/leistungen/Referenzen.tsx       folded-in proof placeholder (Leistungen)
src/components/faq/FaqAccordion.tsx       maps groups → FaqGroup; renders themed sections
src/components/faq/FaqItem.tsx            one native <details>/<summary> Q&A
src/app/leistungen/page.tsx              composes PageIntro + 4 LeistungDetail + Referenzen + ClosingCta (+ metadata)
src/app/faq/page.tsx                     composes PageIntro + FaqAccordion + ClosingCta (+ metadata)
```

### Component contracts

- **`PageIntro({ eyebrow?, title, lead })`** — renders a `<Section tone="paper">` with an optional
  uppercase eyebrow `<p>`, an `<h1>`, and a lead `<p>`. One `<h1>` per page. No logic beyond
  optional eyebrow.
- **`ClosingCta({ heading, lead, ctaHref? })`** — `<Section tone="warm">` with an `<h2>`, lead `<p>`,
  and `<CTAButton href={ctaHref ?? "/kontakt"} />`. Shared by both pages (and future ones).
- **`LeistungDetail({ leistung, index })`** — renders one service: a number/icon, `<h2>` title, a
  short "was wegfällt → was du gewinnst" body, and a chip list of outcomes. The parent decides the
  alternating background (see tonal treatment); `LeistungDetail` itself is background-agnostic and
  takes its `<Section>` wrapper from the page, OR exposes a `tint` boolean. **Decision:** the page
  maps over the data and wraps each in a `<Section tone="paper">`, passing `className` for the
  alternating tint — keeps `LeistungDetail` purely about inner content.
- **`FaqItem({ question, answer })`** — a single `<details>` with `<summary>` (the question) and the
  answer body. Native disclosure: **no client JS**, keyboard-accessible, open/close for free.
- **`FaqAccordion({ groups })`** — maps grouped data to themed blocks (small heading per theme +
  the group's `FaqItem`s).

### Data shapes (`src/lib/`)

```ts
// leistungen.ts
export type Leistung = {
  slug: string;          // stable key, e.g. "termine"
  title: string;         // "Termine & Bestätigungen"
  punchline: string;     // one-line promise, e.g. "Schluss mit Hinterhertelefonieren."
  body: string;          // 1–2 sentences: what falls away → what you gain
  outcomes: string[];    // 2–3 short chips
};
export const leistungen: Leistung[] = [ /* 4 entries, order matches homepage WasIchBaue */ ];

// faq.ts
export type FaqEntry = { question: string; answer: string };
export type FaqGroup = { theme: string; entries: FaqEntry[] };
export const faqGroups: FaqGroup[] = [ /* ~3 groups, ~9 entries */ ];
```

### Tonal treatment (Leistungen)

Inner pages are NOT deep-water. The four service blocks alternate plain **Papier** and a **subtle
`bg-gletscher/30`** tint, each separated by `border-faden`, for gentle rhythm within the editorial
palette. `Referenzen` is Papier with a top border; `ClosingCta` is the one warm (`tone="warm"`)
block, mirroring the homepage's warm close.

---

## Page structure & draft copy

> All German copy below is a **Claude-authored draft for the founder to refine**. Claims that touch
> compliance (e.g. DSGVO) or specifics (timelines, scope) are **draft-to-verify** before go-live.

### `/leistungen`

1. **PageIntro** — eyebrow „Was ich baue", H1 „Leistungen",
   lead: „Ich baue dir eine saubere Quelle für die Aufgaben, die sich jeden Tag wiederholen —
   maßgeschneidert für deinen Betrieb, nicht von der Stange. Kein Flickenteppich aus zehn Tools,
   sondern eine ruhige Lösung, die still im Hintergrund läuft."

2. **Four service blocks** (`LeistungDetail`, order matches homepage):

   - **Termine & Bestätigungen** — „Schluss mit Hinterhertelefonieren."
     „Termine werden automatisch bestätigt, erinnert und nachgehalten. Deine Kund:innen bekommen
     rechtzeitig Bescheid — und du musst nicht mehr daran denken."
     Outcomes: „weniger No-Shows" · „automatische Erinnerungen" · „kein Nachtelefonieren"

   - **Nachfass-Mails** — „Nichts fällt mehr durchs Raster."
     „Angebote und offene Anfragen werden automatisch nachgefasst — freundlich, pünktlich und in
     deinem Ton. Kein Auftrag geht mehr verloren, weil eine Mail liegen geblieben ist."
     Outcomes: „pünktliche Follow-ups" · „mehr abgeschlossene Angebote" · „in deinem Ton"

   - **Dateneingabe** — „Daten landen dort, wo sie hingehören."
     „Informationen aus Formularen, Mails oder PDFs werden automatisch erfasst und in deine Systeme
     übertragen — ohne Abtippen, ohne Copy-Paste, ohne Zahlendreher."
     Outcomes: „kein Abtippen" · „weniger Fehler" · „saubere Daten"

   - **Wiederkehrende Kommunikation** — „Routine-Nachrichten schreiben sich von selbst."
     „Wiederkehrende E-Mails und Benachrichtigungen — Bestätigungen, Status-Updates, Rückmeldungen —
     laufen automatisch. Persönlich genug, dass niemand den Unterschied merkt."
     Outcomes: „immer rechtzeitig" · „persönlich & automatisch" · „mehr Zeit für echte Gespräche"

3. **Referenzen** (folded-in proof placeholder) — eyebrow „Vertrauen",
   H2 „Bald: Stimmen aus echten Betrieben.",
   body: „Hier stehen in Kürze konkrete Beispiele und Referenzen aus kleinen Betrieben, für die ich
   gebaut habe." (TODO marker — replaced with real Referenzen later.)

4. **ClosingCta** (warm) — H2 „Lass uns deine Quelle bauen.",
   lead: „Erzähl mir, was dich täglich Zeit kostet — ich zeige dir unverbindlich, was sich
   automatisieren lässt.", CTA → `/kontakt`.

### `/faq`

1. **PageIntro** — eyebrow „FAQ", H1 „Häufige Fragen",
   lead: „Was kleine Betriebe vor der Zusammenarbeit am häufigsten fragen. Deine Frage ist nicht
   dabei? Schreib mir einfach."

2. **FaqAccordion** — three themed groups (native `<details>`):

   **Zusammenarbeit**
   - „Wie läuft ein Projekt mit dir ab?" — „In drei ruhigen Schritten: Wir schauen gemeinsam hin, wo
     dir Zeit verloren geht. Ich baue daraus eine saubere, dokumentierte Lösung. Danach läuft sie
     von selbst — für Anpassungen bleibe ich erreichbar."
   - „Für welche Betriebe baust du?" — „Für kleine Betriebe und Selbstständige im DACH-Raum —
     Handwerk, Praxen, Agenturen, lokale Dienstleister. Wenn sich bei dir täglich derselbe Kleinkram
     wiederholt, lohnt es sich."
   - „Arbeitest du auch remote?" — „Ja, komplett remote. Die Zusammenarbeit läuft über kurze Calls
     und klare Absprachen — egal, wo dein Betrieb sitzt."

   **Technik & Sicherheit**
   - „Muss ich meine bestehenden Tools wechseln?" — „Nein. Ich baue auf dem auf, was du schon nutzt,
     und verbinde deine Tools miteinander — statt dir ein neues System aufzuzwingen."
   - „Was passiert mit meinen Daten?" — „Deine Daten bleiben deine. Ich arbeite DSGVO-konform, nutze
     nur die nötigen Zugänge und dokumentiere, was wohin fließt." *(draft-to-verify: compliance claim)*
   - „Was, wenn etwas nicht mehr funktioniert?" — „Jede Automatisierung wird dokumentiert und
     überwacht. Ändert sich etwas, passe ich sie an — du stehst nie mit einem kaputten Ablauf allein
     da."

   **Kosten & Ablauf**
   - „Was kostet eine Automatisierung?" — „Das hängt vom Umfang ab — jede Lösung ist maßgeschneidert.
     Nach einem kurzen Gespräch bekommst du ein klares, unverbindliches Angebot ohne versteckte
     Kosten." *(draft-to-verify: pricing stance)*
   - „Wie lange dauert die Umsetzung?" — „Die meisten ersten Automatisierungen stehen innerhalb
     weniger Wochen, kleinere Abläufe oft schon in Tagen." *(draft-to-verify: timeline)*
   - „Wie fange ich an?" — „Mit einem unverbindlichen Gespräch. Du erzählst mir, was dich Zeit
     kostet — ich sage dir ehrlich, ob und wie ich helfen kann."

3. **ClosingCta** (warm) — H2 „Offene Frage?",
   lead: „Schreib mir kurz, was du wissen willst — ich melde mich persönlich.", CTA → `/kontakt`.

---

## Accessibility

- One `<h1>` per page (`PageIntro`); themes/services use `<h2>`; FAQ questions are the `<summary>`
  inside `<details>` (interactive, keyboard-operable natively).
- Outcome chips are a `<ul>` labelled by the service title (`aria-labelledby`), matching the
  homepage `WasIchBaue` pattern.
- Decorative icons/numbers `aria-hidden`. Links/CTAs carry the established `focus-visible` rings.
- No client JS; nothing depends on motion. (Honors `prefers-reduced-motion` by having no motion.)

## Testing (Vitest + RTL, jsdom)

- `src/lib/leistungen.ts` / `faq.ts`: data sanity — non-empty; each `Leistung` has title/punchline/
  body and 2–3 outcomes; each `FaqGroup` has a theme and ≥1 entry with question+answer.
- `PageIntro`: renders the `<h1>` with given title + lead; eyebrow optional.
- `ClosingCta`: renders heading/lead and a CTA linking to `/kontakt` by default.
- `FaqItem`: renders a `<details>` containing the question (`<summary>`) and answer.
- `FaqAccordion`: renders every question from the data (count check across groups) and each theme
  heading.
- `LeistungDetail`: renders title, body, and all outcome chips.
- Full gate per task: `npm test && npm run build && npm run lint && npx tsc --noEmit`.
- Responsive review (Playwright) at desktop 1280 / mobile 390 on both pages; verify tonal rhythm,
  accordion open/close, no deep-water on inner pages, calm spacing, warm close.

## Out-of-scope reminders (so the plan doesn't drift)

No JSON-LD/OG/sitemap; no real testimonials; no `/kontakt` build; no nav/header changes; no new
dependencies; deep-water stays Hero-only.
