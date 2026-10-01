# Leistungen-Hub: KI- und Automatisierungs-Unterseiten — Design

**Date:** 2026-10-01 · **Status:** approved in conversation, awaiting spec review · **Repo:** `Website/`

## 1. Why

People do not understand „Prozessautomatisierung“ on first hearing (walk-in round 2026-10-01, conversations). The site also hides the KI work: the homepage hero and the service chips never say „KI“. Reference: [ki-helden.net](https://www.ki-helden.net/) — a services menu of everyday nouns, one subpage per service, concrete use cases, an explainer layer.

**Goal:** a company of any size lands on the site and trusts within a minute that **KI-Automatisierung and Prozessautomatisierung is what Vrelo does** — and finds a page for the specific thing it is looking for (Claude, Schulung, KI-Server …).

## 2. Business decisions this design carries (recorded in HQ CLAUDE.md §3)

- **Menu widened (reverses „Menü-Erweiterung verworfen“, 2026-07-28):** seven services, each with its own subpage.
- **Buyer widened:** not only owner-led ≤ 20 staff and not only SHK; bigger companies are welcome. The descriptor „kleine Betriebe“ (Brand.md §5, the swappable slot) moves to a wider wording.
- **Technical terms are allowed** (n8n, Claude, API, Agent). Rule: each term is explained once, in plain words, where it first appears on a page.
- **Address stays „du“**, also for bigger companies (brand voice; KI-Helden proves it works in this market).
- Unchanged: no Vrelo prices on public pages, no competitor named, no Gedankenstrich in German copy, „Vrelo“ in Fraunces italic, KI-Server copy says „innerhalb der EU“ (never „Frankfurt“), never „Partner“/„zertifiziert“ next to Claude or Anthropic (UWG §5).

## 3. Information architecture

### 3.1 The seven subpages (`/leistungen/<slug>`)

| Group | Slug | H1 | Proof kind | Primary CTA |
|---|---|---|---|---|
| Automatisieren | `prozessautomatisierung` | Prozessautomatisierung | case (Velp-shape, anonymous) | Prozess-Check |
| Automatisieren | `ki-automatisierung` | KI-Automatisierung & Assistenten | **studies** (+ MDZ-shape case line) | Prozess-Check |
| Automatisieren | `ki-server` | KI-Server | case (VPS delivery standard) | Erstgespräch |
| Befähigen | `claude` | Claude für Unternehmen | practice | Erstgespräch |
| Befähigen | `ki-schulung` | KI-Schulung | practice | Erstgespräch |
| Befähigen | `ki-beratung` | KI-Beratung | practice | Erstgespräch |
| Betreiben | `betreuung` | Betreuung & Wartung | case (monitoring that provably alerts) | Prozess-Check |

Scope lines that keep pages distinct:
- **Claude für Unternehmen** = „ich richte es ein“ (Claude for the team: projects, own templates/skills, data handling, integration into existing tools). **KI-Schulung** = „dein Team lernt es“ — focused precisely on **Claude + automation**, nothing generic. Each links to the other.
- **KI-Beratung** is the entry point: Erstgespräch → kostenloser Prozess-Audit → Fahrplan. The current `ProzessAudit` card moves here.
- **Betreuung & Wartung** makes the retainer visible (monitoring, Fehlerbehebung, kleine Änderungen). **No tier prices on the page** (tiers stay a spoken menu, HQ §4).
- ❓ **KI-Schulung has no format yet** (length, group size, on-site/online). Page copy says „Format nach Absprache“ until Ajdin decides; no price.

### 3.2 The hub (`/leistungen`)

1. `PageHero` „Leistungen“ + one intro line, e.g. *„KI-Automatisierung und Prozessautomatisierung: Ich baue sie, richte sie ein und halte sie am Laufen.“*
2. **Seven cards in three labelled groups** (Automatisieren · Befähigen · Betreiben). Card = title, one-sentence plain definition, link.
3. Kept as the trust layer: `WennDuBaust`, `WoranEsScheitert`, `Referenzen`, `ClosingCta`.
4. Moved: `ProzessAudit` → `ki-beratung` page. The six `leistungen.ts` Bausteine → Example material for `prozessautomatisierung` and `ki-automatisierung`. Dropped: `MehrMoeglich` (the hub now is „mehr möglich“).
5. Before removing `#prozess-audit`, grep for inbound links to that anchor (site, Ratgeber, flyer/brief copy) and repoint them to `/leistungen/ki-beratung`.

### 3.3 Navigation

- `nav.ts`: „Leistungen“ gets `children` (the seven pages, grouped). Desktop: a disclosure button (`aria-expanded`, opens on click and keyboard, closes on Escape/outside click — never hover-only) opening a panel with the three groups plus „Alle Leistungen“ → `/leistungen`. Mobile drawer: nested list, always expanded under „Leistungen“.
- Header button stays the Prozess-Check.

### 3.4 Homepage

- **Remove `ProzessCheckSection`** (component, its test, `CHECK_SRC.homeCheck`). Hero unchanged, including its Prozess-Check button.
- `WasIchBaue`: the four task chips become the **seven service names, each linking to its subpage**; „Alle Leistungen ansehen“ stays.

### 3.5 Ratgeber as the knowledge layer

- New optional frontmatter: `kategorie: "Grundlagen" | "Kosten" | "Praxis"` and `leistung: <subpage slug>`. `/ratgeber` can filter/group by `kategorie`; an article with `leistung` shows a back-link to its subpage.
- Each subpage lists 2–3 related articles in a small „Mehr dazu“ line under its CTA (`related` in the page data; a test asserts every slug exists).
- Existing articles map now: `claude-im-alltag-nutzen` → claude · `was-ki-im-betrieb-wirklich-kann` → ki-automatisierung · `wo-laeuft-deine-ki` → ki-server · `selbst-bauen-oder-bauen-lassen` → ki-beratung · `taeglich-stunden-zurueckgewinnen` → prozessautomatisierung.
- **New explainers are a separate batch after go-live** (via the `ratgeber-article` skill): *Was ist Prozessautomatisierung?* · *Was ist KI-Automatisierung, was ist ein KI-Agent?* · *KI-Server: Was heißt „Daten bleiben in der EU“?* · *Claude oder ChatGPT im Unternehmen?*

## 4. The subpage template — five blocks

Every subpage renders the same five blocks from data. Each block has one job.

1. **Hero** — H1 = service name (search term). Subline = one sentence that defines the service in plain words. Reuses `PageHero` with an existing water image.
2. **Pain („Kennst du das?“)** — 3–4 concrete everyday moments, then one closing line that turns them into lost hours. Same visual pattern as the homepage `Problem` list.
3. **Proof** — one of three kinds:
   - `studies` (KI-Automatisierung): 2–3 figures, each with claim, **source, year, link**, rendered as „Quelle: Bitkom, 2025“ linking out. Plus one anonymous case line („Ein Hausmeisterservice gibt seinem Assistenten Aufgaben per Sprachnachricht …“).
   - `case`: one short anonymous case, „Ein Betrieb mit … Mitarbeitern …“. No client name until Alen / the MDZ owner give their OK.
   - `practice` (Claude, Schulung, Beratung): own daily use + introductions in earlier positions and for clients, **general, no names**. Draft:
     > „Ich arbeite selbst jeden Tag mit Claude: für Code, Texte, Recherche und meine eigenen Automatisierungen. In meinen früheren Positionen und bei Kunden habe ich Claude eingeführt und in bestehende Abläufe eingebunden. Was du lernst, habe ich selbst im Einsatz.“

     plus two or three honest-promise points („Ein Ansprechpartner“, „Wenn es sich nicht rechnet, sage ich es dir“).
4. **Example (the core)** — one concrete run: a „Vorher“ line, then **three steps** with an icon each, then the result. E.g. *Rechnung kommt per E-Mail → KI liest Lieferant, Betrag, Datum → liegt sortiert in deiner Buchhaltung.* This block carries the comprehension job.
5. **CTA** — `ClosingCta` variant. `check` pages: Prozess-Check primary + Erstgespräch quiet link. `kontakt` pages: Erstgespräch primary + Prozess-Check quiet link. Then the „Mehr dazu“ Ratgeber line.

## 5. Data model and code shape

One data file, one dynamic route; a new page is a new entry, never a new component.

```ts
// src/lib/leistungenPages.ts — all German copy lives here, components hold none
export type LeistungGroup = "automatisieren" | "befaehigen" | "betreiben";
export type StudyFigure = { figure: string; claim: string; source: string; year: number; url: string };
export type Proof =
  | { kind: "studies"; heading: string; figures: StudyFigure[]; caseLine?: string }
  | { kind: "case"; heading: string; body: string }
  | { kind: "practice"; heading: string; body: string; points: { title: string; body: string }[] };
export type LeistungPage = {
  slug: string; group: LeistungGroup; navLabel: string;
  title: string; subline: string; metaDescription: string; heroImage: string;
  pain: { heading: string; moments: string[]; close: string };
  proof: Proof;
  example: { heading: string; before: string; steps: [string, string, string]; after: string };
  cta: { kind: "check" | "kontakt"; heading: string; lead: string };
  related: string[]; // Ratgeber slugs
};
```

- Route `src/app/leistungen/[slug]/page.tsx` with `generateStaticParams`, `generateMetadata` (canonical, title, description), `notFound()` for unknown slugs.
- Block components under `src/components/leistungen/page/` (`PainBlock`, `ProofBlock`, `ExampleBlock`), reusing `Section`, `Reveal`, `SectionBackdrop`, `ClosingCta`.
- **Tracking:** new `CHECK_SRC` slugs per subpage (`leistung-<slug>`). The Erstgespräch-primary pages need `/kontakt?src=<slug>` → **extend `/kontakt` to read `src` (via `normalizeSource`) and pass it into the Cal booking notes**, the same way `/prozess-check` does, so the 2026-10-10 review can see which subpage booked.
- JSON-LD: `Service` per subpage + `breadcrumbLd`. Sitemap gets the seven routes.

## 6. Proof research (before KI-Automatisierung goes live)

A separate research step produces `Knowledge/marketing/ki-studien.md` (durable, indexed in HQ §2.2):
- **Primary sources only**: Bitkom (annual KI study), Destatis (KI-Nutzung in Unternehmen), KfW Research, IW Köln, IfM Bonn, ifo, McKinsey/BCG/Deloitte. Each figure verified on the source page itself, not from a secondary article (KI-Helden's numbers are leads, not sources).
- Per figure: exact wording, sample (size class!), publication year, URL, retrieval date. Prefer figures ≤ 2 years old.
- Pick 2–3 that answer the visitor's question („nutzen andere das schon, und bringt es was?“): adoption, measured time/cost effect, the barrier „fehlendes Wissen“ (which the Schulung/Beratung pages answer).
- No figure without a working link ships. A test asserts every `StudyFigure` has `url`, `source`, `year`.

## 7. Copy rules and review

- All German copy through `stop-slop`; Brand.md wins on conflict. Value-equation check (HQ §8) on the hub + each subpage before shipping.
- Copy-guard tests extended to `leistungenPages.ts`: no Gedankenstrich (U+2013/U+2014), no ASCII `"` in German strings, no „Partner“/„zertifiziert“ within a Claude/Anthropic sentence, no `€` amounts, no „Frankfurt“.
- Verify bytes after every write (the Edit/Write tools downgrade „“).

## 8. Testing

- Data tests: seven pages, unique slugs, every group non-empty, every block filled, `steps` length 3, `related` slugs exist, `studies` figures complete, copy guards.
- Route: `generateStaticParams` returns the seven slugs; unknown slug → 404; metadata canonical per page.
- Components: each block renders its data; CTA kind → correct primary href with `src`.
- Nav: dropdown keyboard/Escape behaviour, `aria-expanded`, mobile nested list.
- Homepage: `ProzessCheckSection` gone, hero CTA still `?src=home-hero`, `WasIchBaue` links to the seven subpages.
- `/kontakt?src=` lands in the booking notes.
- Manual: `npm run build`, then the hub + two subpages at 375 px and desktop (no horizontal scroll, AA contrast on image bands).

## 9. Out of scope

New Ratgeber explainer articles (own batch) · new hero images (reuse existing water imagery first) · prices of any kind · Schulung format decision · Sie-version · English pages · naming Velp/MDZ/Baude.

## 10. Follow-ups outside `Website/`

- HQ CLAUDE.md §3: record the menu reversal + wider buyer; §2.2: index `ki-studien.md` once written; §6: ❓ Schulung format.
- Brand.md §5: widen the descriptor „kleine Betriebe“.
- Google-Unternehmensprofil „Leistungen“ list: align with the seven services.
- Vault light sync.
