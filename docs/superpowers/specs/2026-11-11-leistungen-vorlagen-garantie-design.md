# Leistungen in vier Seiten, Vorlagen als Haustür, 2-Wochen-Garantie, Wartung neu (Design)

Date: 2026-11-11 · Status: draft, waiting for Ajdin's approval · Owner: Ajdin Dzafic
Sources: this brainstorm (2026-11-11), the Weboro-Media review (same session), Pricing.md §4/§5, HQ CLAUDE.md §4.

## 1. Intent and why

The site has eight Leistungen subpages behind four doors. Visitors cannot tell what Vrelo concretely does, and the KI work reads as a list of products. Weboro Media shows the fix: fewer pages, each with real scenes and results. At the same time, the lead path changes: the free assets on `/vorlagen` become the front door (Vorlage → Gespräch → Fahrplan, all free), and the guarantee becomes a sharper, time-bound promise that sits in the hero.

Four changes, one release:
1. **Leistungen: four pages instead of eight**, sub-services shown as a visual overview on the page, each page with concrete scenes from real cases and their numbers.
2. **Every primary CTA points to `/vorlagen`**; the Prozess-Check becomes one of the free tools there.
3. **New guarantee** replaces the 14-day Feinschliff guarantee everywhere (site, FAQ, `_kit` Angebot, HQ docs).
4. **Wartung tiers redesigned** (Minimum / Standard / Partner) on their own page.

## 2. Goals, non-goals, anti-goals

**Goals**
- A visitor understands within one screen per page what gets built, with a real example and a number.
- The hero names what is free (Prozess-Audit + Fahrplan) and what is guaranteed (first results in 2 weeks or money back).
- One path for cold visitors: `/vorlagen` → Gespräch → Fahrplan. Attribution via `?src=` keeps working.
- Wartung is visible as an option, never as an obligation: „Einmal gebaut, gehört es dir.“

**Non-goals**
- No new Leistung, no new Vorlage, no redesign of the visual system (palette, hero image, sections stay).
- No live KI demo, no public build prices, no city pages (Weboro patterns rejected in the review).
- The Elektro offer (`/bauplan/<code>`, „Erste Ergebnisse nach 2 Tagen“, deposit back) stays as it is. The Agentur-Paket guarantee (unconditional, 14 days) stays as it is.

**Anti-goals** (failure even if it technically works)
- A guarantee line in the hero whose condition the visitor can't find → UWG §5 risk.
- An old URL (LinkedIn, Ratgeber, outreach mails, Google profile) that 404s.
- A number on the page that the client hasn't confirmed.
- Tier prices on a Leistungen page (rule: offer pages carry no prices; the FAQ may).

## 3. Decisions (Ajdin's, as decided)

### 3.1 Guarantee
- Promise: **first results within 2 weeks after the onboarding meeting; a small win counts. If not: money back.**
- Clock starts only when Vrelo has access, which is set up in the onboarding.
- „Results“ are measured against the **requirements list** in the Angebot: the process requirements specified for him (the end result of the implementation and the process). The **first item on that list is named as the one ready in 2 weeks.**
- „Geld zurück“ = everything paid up to then (true for every payment option: 50/50 → the deposit; Vorkasse → the full price; after-acceptance → nothing paid yet).
- Replaces the 14-day Feinschliff guarantee on the site and in the Angebot.
- **Conditions (Ajdin 2026-11-11), spelled out in the FAQ, the `leistungen-weg` step and the Angebot clause:**
  1. Applies only to builds that come out of the free Prozess-Audit (the abuse guard stays).
  2. After a refund, Vrelo removes the build („ich baue alles sauber zurück“).
  3. The 2 weeks pause while Vrelo waits on the client (data, access, an answer); the Angebot says so.
  4. No second guarantee at Abnahme. The 14 days after handover stay as **Feinschliff** (Vrelo keeps adjusting), without money back.

### 3.2 Homepage copy (final)
- **H1** unchanged: „Manuelle Prozesse rauben dir die Zeit.“
- **Sub:** „Maßgeschneiderte Automatisierungen geben dir deine Stunden zurück. Kostenloser Prozess-Audit mit Fahrplan. Erste Ergebnisse nach 2 Wochen, sonst bekommst du dein Geld zurück.“
- **Button:** „Kostenlose Vorlagen ansehen“ → `/vorlagen?src=home-hero`
- **Microcopy:** „Bauplan für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos.“
- Second link stays: „Lieber direkt reden? Erstgespräch buchen“ → `/kontakt`.

**DerWeg** („So fängst du an. Kostenlos.“, three steps, new order):
1. **Vorlage holen:** „Nimm dir den Bauplan für deine Branche oder mach den Prozess-Check. Ohne Gespräch, ohne Kosten.“
2. **Gespräch:** „30 Minuten. Ich gehe deine Abläufe mit dir durch und finde die Aufgabe, die dich am meisten Zeit kostet.“
3. **Fahrplan:** current text unchanged.
Button → `/vorlagen?src=home-weg`.

**Proof card** (replaces „14 Tage Geld zurück.“):
- Title: „Erste Ergebnisse in 2 Wochen. Sonst Geld zurück.“
- Text: „Im Angebot steht die Liste deiner Anforderungen. Der erste Punkt läuft zwei Wochen nach dem Onboarding. Wenn nicht, bekommst du alles zurück, was du bis dahin gezahlt hast.“

### 3.3 CTA and funnel
- **Every primary CTA → `/vorlagen?src=<slug>`** (hero, DerWeg, home close, header, Leistungen pages, Ratgeber, Referenzen, Über mich, footer, Karte). The existing `CHECK_SRC` slugs stay the attribution keys.
- The Prozess-Check **stays live** at `/prozess-check` and gets a card on `/vorlagen` as one of the free tools.
- Funnel: Vorlage → contact → free Fahrplan. Everything before the Angebot is free.
- The quiet second path („Erstgespräch buchen“ → `/kontakt?src=…`) stays under every button.

### 3.4 Leistungen: four pages

| Page (URL) | Sub-services shown as overview cards | Scenes + results |
|---|---|---|
| **Prozess-Audit** `/leistungen/prozess-audit` | Prozess-Check (free tool) · 30-min Gespräch · Audit · Fahrplan (all free). KI-Beratung stays folded in here. | An anonymous Fahrplan: one task, hours per week before/after, the first step. |
| **Prozessautomatisierung** `/leistungen/prozessautomatisierung` | Rechnungen und Belege · Angebot bis Auftrag · Kunden-Onboarding · Datenübernahme zwischen Programmen | **MDZ:** a Notion entry becomes a numbered invoice (`.docx` + PDF) in the OneDrive client folder. **Velp:** a won deal starts the onboarding by itself. |
| **KI-Automatisierung** `/leistungen/ki-automatisierung` | KI-Assistenten · KI-Betriebssystem · Claude für Unternehmen · KI-Server · KI-Schulung (cards, each with its own section and anchor on the page) | **MDZ:** a voice message on Telegram becomes an entry. **Own inbox:** „Beim ersten Durchlauf durch 174 E-Mails haben feste Regeln und bekannte Kontakte 96 einsortiert, die KI 66. Acht blieben für mich zur Prüfung.“ |
| **Betreuung & Wartung** `/leistungen/betreuung` (slug stays) | Minimum · Standard · Partner, contents only, **no prices** | — |

**Confirmed numbers (Ajdin 2026-11-11):**
- **MDZ: „2 Stunden am Tag“ saved by the Telegram assistant** (KI-Automatisierung scene). The Rechnungsautomat scene (live since 2026-11-06) shows no number. MDZ is always named with the family tie (it is Ajdin's father's business).
- **Velp: „5 Stunden pro Kunde“ saved.** (Alen confirmed „über 12“ on 2026-10-27; 5 is inside that confirmation. Velp is pro bono; never show a price.)

**Every build page** (Audit excluded) carries the ownership line and links to the Wartung page: „Einmal gebaut, gehört es dir. Keine monatliche Pflicht: Wartung nur, wenn du sie willst.“

### 3.5 Wartung tiers (replace Basis/Standard/Premium/VIP)

| | **Minimum** · „Es läuft.“ | **Standard** · „Es läuft und wird besser.“ | **Partner** · „Ich gehöre zu deinem Team.“ |
|---|---|---|---|
| Price net/month | **249 €** | **945 €** | **9.900 €**, max. 2 Betriebe |
| Calls with Ajdin, on request | 30 min every 4 weeks · e-mail | 30 min every 2 weeks · reply same working day | weekly 90-min working session · direct line (Telegram/WhatsApp), reply within 2 h · one day a month with his team (on site in the region, else remote) |
| Fix time (Mo bis Fr, 7 bis 17 Uhr) | 48 h | 24 h | 12 h |
| Keeps running | monitoring with a real alarm · KI models and prompts kept current · updates · backup checked · docs updated with every change | + backup restore tested each quarter | same as Standard |
| Adapting | fixes when something breaks · 1 small change/month | proactive, before a connected program breaks it · 3 small changes/month | everything, as it comes up |
| Improving | — | one new small Baustein per quarter · quarterly review, Fahrplan updated | a reserved build day each month |
| Team | — | 1 new employee trained per quarter | as needed |
| Report | one number a month | number + note + recommendation | weekly |

- Main differentiator: **access to Ajdin's time**, then **adapting and improving the system**.
- Hormozi tier logic: three tiers, big jumps (249 → 945 ≈ ×4, 945 → 9.900 ≈ ×10), Partner is the anchor and the wide gap pushes Standard. Entry tier is called „Minimum“, never „Basis“.
- Monthly cancellable. Cancel → the system keeps running, frozen but secure (unchanged rule).
- „KI models and prompts kept current“ applies only where the build carries KI (the old „no KI-Tuning claim unless the build carries AI“ rule stays).

## 4. Constraints

- German copy: „…“ (U+201E/U+201C), no Gedankenstrich (U+2013/U+2014), no comma before „und“, du, generic masculine, founder name `Ajdin Dzafic`. Edit/Write tools downgrade quotes: verify bytes after every write. Copy guards in `Website/` enforce part of it; run `npm test`.
- All new customer-facing prose runs through `stop-slop`; Brand.md wins on conflicts.
- `/leistungen/claude` content keeps its EU-Weg rules (never Microsoft Foundry, never „Deutschland“) and its guard test in `leistungenPages.test.ts` moves with the section.
- The KI-Betriebssystem section links to Claude-Gehirn; Claude-Gehirn never links back (the gift stays ask-free).
- Copy lives in typed modules (`src/lib/*.ts`); components hold no German (existing convention).
- Show the result on localhost; push to `main` (= production deploy) only with Ajdin's OK.

## 5. Everything the change must reach

**Website**
- `src/lib/leistungenPages.ts`: 8 entries → 4; `LeistungSlug` narrows; four doors → four pages; sub-service cards + scenes for the three build/audit pages; KI sections with anchors.
- Redirects in `next.config.*` (permanent): `/leistungen/ki-server` → `/leistungen/ki-automatisierung#ki-server`, `/leistungen/claude` → `…#claude`, `/leistungen/ki-betriebssystem` → `…#ki-betriebssystem`, `/leistungen/ki-schulung` → `…#ki-schulung`. Existing `/leistungen/ki-beratung` → `/leistungen/prozess-audit` stays.
- `src/lib/prozessCheckCta.ts`: primary CTA target and label switch to `/vorlagen?src=…` / „Kostenlose Vorlagen ansehen“; `checkHref` stays for the Prozess-Check card and the kontakt hint. All callers (Header, MobileNav, Footer, Hero, DerWeg, MerakClose, ClosingCta, CompactHero, leistungen, ratgeber, referenzen, ueber-mich, faq, karte, prozess-audit, leistungen-weg) follow.
- `/vorlagen`: Prozess-Check card; `?src=` must survive into the Bauplan form notification and into the Prozess-Check link.
- `src/components/home/Proof.tsx`, `DerWeg.tsx`, `Hero.tsx`.
- `src/lib/leistungen-weg.ts`: „Der Feinschliff“ step becomes the 2-week guarantee.
- `src/lib/faq.ts`: „Was passiert nach dem Projekt?“ (14-day text → new guarantee) and „Fallen laufende Kosten an?“ (219/420/1.019 → Minimum 249 · Standard 945 · Partner 9.900, max. 2 Betriebe; drop „für größere Unternehmen nach Absprache“).
- Ratgeber frontmatter `leistung:` for removed slugs (claude ×2, ki-betriebssystem ×2, ki-server ×2) → `ki-automatisierung` (with anchor if the component supports it).
- Sitemap, JSON-LD service list, `/leistungen` hub, LeistungenMenu: four entries.
- Tests: copy guards, `leistungenPages.test.ts`, `Proof.test.tsx`, `leistungen-weg.test.ts`, `claudeGehirn.test.ts`, page tests for removed slugs.

**Outside the Website repo**
- `Clients/_kit` Angebot template: requirements list with the first item marked „läuft 2 Wochen nach dem Onboarding“; guarantee clause replaces the 14-day clause; Wartung section uses the new tier names.
- `Knowledge/Strategy/Pricing.md` §4/§5: new tier table.
- HQ `CLAUDE.md` §4 (guarantee, tiers, CTA → Vorlagen) + Vault light sync.
- Google-Unternehmensprofil „Leistungen“: Ajdin by hand, four entries.

## 6. Left to the builder

- Visual form of the sub-service overview (card grid, icons or none) within the existing design system.
- Scene format: before/after in two columns or the existing three-step `example`; reuse the existing `LeistungPage` fields where they fit.
- Section order inside each page and the exact anchor ids (keep them stable once shipped).
- Whether the header keeps a separate „Vorlagen“ nav link next to a button that also goes to `/vorlagen` (avoid two identical targets side by side).
- Wording of short connective copy (section intros, card blurbs), within the voice rules and through `stop-slop`; everything quoted in §3 is final.

## 6a. Calls made after the builder check (Claude's, check them)

- **Audit scene carries no numbers.** No real audit has happened yet; the scene shows what a Fahrplan contains (one task, the first step, the order), clearly as the shape of the document. The anonymised real Fahrplan replaces it after the first audit (HQ §7).
- **Velp scene = the live phase engine**, not the #5 onboarding (still waiting on Alen's go-live). „5 Stunden pro Kunde“ belongs to the engine as a whole. Swap in the onboarding once it is live.
- **KI-Automatisierung sections are short:** per sub-service a card on top, then one section with 2 to 3 paragraphs, its one scene or graphic and its Ratgeber links. Old studies blocks and the second comparison table do not move. **Exception: the Claude section keeps the EU-Weg copy in full** (legal accuracy, guard test). Accepted trade-off: „KI-Server“ and „Claude für Unternehmen“ lose their own title/meta; the Ratgeber carry those search terms.
- **`/vorlagen/elektro-bauplan` keeps its offer section unchanged** (Ajdin: the Elektro offer stays „for now“). Deliberate exception; revisit with the Elektro offer.
- **Attribution:** `/vorlagen` passes its `?src=` into every internal card link (Bauplan pages, Prozess-Check). The Bauplan form already lets `?src=` override „vorlagen“, so the PDF request notification names the original button. The Kontakt link at the end of a Bauplan page stays `bauplan-<slug>` (the `src` allow-list caps a slug at 32 chars and four parts, two hops don't fit). Revisit if the per-`src` review needs the second hop.
- **Old guarantee wording also goes** in `Clients/_kit/kalkulator` and `Clients/_kit/prozess-einseiter`.

## 7. Open

- Fixed scope behind „Partner: one day a month with his team“ (travel radius, what happens remote).
