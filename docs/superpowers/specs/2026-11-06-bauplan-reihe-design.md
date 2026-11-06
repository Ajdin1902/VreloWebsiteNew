# Bauplan-Reihe: one Bauplan per niche, built on the Haus (design)

Date: 2026-11-06 · Owner: Ajdin · Status: draft for review
Siblings: Agentur-Bauplan (`2026-10-27-agentur-bauplan-design.md`), Elektro-Bauplan (`2026-10-29-elektro-bauplan-pdf-design.md`, `2026-10-29-elektro-bauplan-landing-design.md`), the public Vorlagen hub (`Website/CLAUDE.md`, „/vorlagen hub“).

## 1. Intent

A series of free PDF Baupläne, one per niche, each a step-by-step guide an owner can work through himself. The reader downloads it from the website (`/vorlagen`). How he got to the website is out of scope for now.

**What the reader has after one week with it (Ajdin's words, the yardstick for every page):** he knows where he stands, which tools he has, where his data comes from, where it goes through and how his business works inside. He knows how to automate it, and he has built the foundation of the Haus plus the first steps inside it.

**The frame:** the Haus (`Clients/_kit/fahrplan/vrelo-betriebssystem-haus-vorlage.pdf`, public at `/vorlagen/vrelo-ki-betriebssystem.pdf`), i.e. the 13 stations of the spine (`Knowledge/marketing/prozess-landkarten.md` §0), translated into each trade. Every Bauplan has the same overall structure; the specifics differ per niche.

**Why now:** the two existing Baupläne (Agentur, Elektro) each tell a different story, so a reader who saw one learns nothing about how to read the next. A shared skeleton makes sixteen of them producible and recognisable as one series. The Outreach Engine design also requires one Bauplan per niche before a niche goes live (`Tools/LeadEngine/docs/superpowers/specs/2026-10-30-outreach-niches.md`, „Open per niche“).

## 2. Goals, non-goals, anti-goals

**Goals**
- The reader recognises his own trade on the first page: his tools by name, his problems in his words, one verified number.
- He can do the self-check, the tool map and the foundation without help, with paper and a pen.
- The first station is described concretely enough to build, at the Elektro depth (see §4).
- Every Bauplan ends on the same page: the free Prozess-Audit, done together for his business.
- Every claim is true today and every number has a primary source.

**Non-goals**
- No prices of any kind (build, retainer, running costs, Förderung amounts) and no Vrelo durations.
- No offer page per niche, no capacity line („noch 3 Betriebe“ stays on the existing Elektro page only).
- No node-by-node n8n recipes (they go stale and tie the reader to a tool he doesn't own).
- No outreach in this project: no mails, no letters, no LinkedIn.

**Anti-goals (a failure even if it renders fine)**
- Reads like a software brochure or a sales pitch.
- Recommends building something the reader's software already does (Bordmittel rule, HQ §8). If his Handwerkersoftware covers a station, the Bauplan says so plainly.
- A statistic from a secondary source, a blog or a vendor survey presented as fact.
- Names a client or prospect (Schmid, Zilk, M1, Velp, MDZ, Power-Connect) or uses details only they could recognise.
- Sixteen PDFs that differ only in the trade name: the niche content has to be real.

## 3. Scope and order

**Sixteen niches:** the fifteen of the Outreach Engine niche list (Elektro · SHK · Dach/Spenglerei · Maler · Schreiner/Zimmerei · Fliesen · Gebäudereinigung · Hausmeisterservice · Garten- und Landschaftsbau · Spedition/Transport · Kurier · Umzug · Agenturen · Architektur-/Ingenieurbüros · Immobilienmakler) plus **Finanz- und Versicherungsmakler** (Ajdin 2026-11-06, although that niche stays out of the Outreach Engine and the broker direction is on hold in HQ §3).

**Pilot: SHK**, start to finish (research → PDF → page), reviewed by Ajdin before any other niche starts. **Hard deadline (Ajdin 2026-11-06): a printed SHK copy for the Schmid Heizung meeting on 2026-11-26.** Target dates (Claude's call, buffer before the meeting): research summary to Ajdin by 2026-11-11, rendered PDF to Ajdin by 2026-11-17, print-ready by 2026-11-21. Print-ready means A4, prints cleanly on an office printer and at a copy shop, no bleed needed. The page can go live after the meeting if the timeline gets tight; the printed copy cannot slip.

**Pace (Ajdin 2026-11-06): finish the whole series as fast as possible.** Once the pilot is approved, the remaining niches run in batches, with research for several niches in parallel (Claude's call), each batch reviewed by Ajdin before it goes live. Reasons: the only fully written Landkarte section, the walk-in target, and a finished SHK Bauplan can be left with the Schmid Heizung meeting on 2026-11-26 (without naming him anywhere in it).

**After the pilot (Claude's proposal, Ajdin can reorder):** Gebäudereinigung + Hausmeisterservice (MDZ-shape) → Dach, Maler, Schreiner/Zimmerei, Fliesen (one Handwerk pattern) → Garten- und Landschaftsbau → Spedition, Kurier, Umzug → Architektur-/Ingenieurbüros → Immobilienmakler → Finanz- und Versicherungsmakler → **Agentur and Elektro last**, rebuilt on the skeleton once it has proven itself (they already have working versions).

## 4. The shared skeleton

Same chapters, same order, same visual system in every Bauplan. A4 portrait, white page (client-PDF exception), Vrelo brand. Page count: **8 pages as the target** (Claude's call; Agentur has 8, Elektro 7), with visible white space; the render gate pins the count per niche once the pilot is approved.

| # | Chapter | What it does | Niche-specific content |
|---|---|---|---|
| 1 | **Cover** | **Series pattern (Ajdin 2026-11-06):** headline = the owner's question („Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?“); the pain as a picture, one job today from the first contact to the invoice as a flow, every hand-off where time is lost circled in amber with its verb, under it „Jeder Kreis ist eine Stelle, an der Zeit verloren geht. Im Bauplan findest du deine.“ (ties to the circling step of chapter 3; the circled verbs match the verbs of that step); the verified statistic with source, smaller; the answer as the reader's one-week path (`wochenplan` in `shared.ts`, word for word, the guard requires it: Tag 1 to Tag 5 over chapters 2 to 5, his pace, not a Vrelo duration) plus the line „Schritt für Schritt zu deinem KI-Betriebssystem“; the caption and this line are shared copy too (`deckblatt` in `shared.ts`, guarded word for word); a short „Für wen“ line at the foot. No contents list, no Haus strip | the flow (`auftragsweg` in the niche data: steps + circled verbs, reused by the landing page), the pain headline over it, statistic, trade vocabulary |
| 2 | **Wo du stehst** | Self-check over the five floors of the Haus: per station, does it run, live on paper, or live in his head. Ends in a level 0 to 4 (0 Im Kopf · 1 Verstreut · 2 Erste Station läuft · 3 Ein Ort · 4 Haus steht, the ladder from the notebook „Lead magnets“ §2). **Mechanics (Claude's call):** a simple count per station (läuft / auf Papier / im Kopf) that maps to the level; the later Stufen-Check questionnaire adopts the same count, so the two never give different levels. The notebook draft criteria are not used | station names in his vocabulary, typical examples |
| 3 | **Deine Werkzeuge und Datenwege** | Fill-in map: per station, which tool holds it today, where the data comes in, where it goes next. Pre-filled examples with the tools that trade actually runs | the tool landscape of the trade (Handwerkersoftware, CRM, accounting, portals), with what each already ships |
| 4 | **Das Fundament** | Data in one place, in his own programs: how to choose the system of record for his trade, which fields every station needs, how to get the first station writing into it | the fitting system of record per trade |
| 5 | **Die erste Station, Schritt für Schritt** | The door station of that niche in „So gehst du vor“ boxes, in the ladder order: what your software already does → a workflow tool like n8n → a custom build. Honest notes where the Bordmittel suffice | which station is the door (research decides), the concrete steps |
| 6 | **Die nächsten Stockwerke** | The remaining stations as an outlook, one or two lines each, in the order that makes sense for the trade | ranking and lines per trade |
| 7 | **Abschluss (shared)** | **Heading changed by Ajdin 2026-11-06:** „Wenn du Fragen hast, melde dich. Kostenlos.“ (source of truth: `abschluss.heading` in `shared.ts`); the page's form heading is the shared `formular.heading` („Hol dir den Bauplan als PDF.“, so „Kostenlos.“ appears once) and „Er kostet dich nichts.“ was dropped. Same page in every Bauplan: the close, the free Prozess-Audit for his business, done together (Ajdin). **Claude's calls:** the button goes to the free 30-minute conversation, `/kontakt?src=bauplan-<niche>` (PDF: `-pdf` suffix), as Elektro does today; the copy offers the audit, the Fahrplan stays conditional (funnel rule, `prozess-check-funnel.md` §1a); **no guarantee line** (a document without a price is the wrong place for a refund promise; the guarantee belongs to the Angebot); no capacity line, no price | none (copy identical across the series) |

**No station numbers in a Bauplan (Ajdin 2026-11-06):** the floor grouping reorders the spine numbers (1, 2, 3, 4, 5, 8, 6 …), which reads as a mistake, so stations are named only, the floors give the structure; the guard rejects `Station <digit>`. The public Haus one-pager keeps its numbers.

The two pages beyond the seven chapters are the builder's to place (e.g. chapter 3 or 5 over two pages); the content above is the floor.

**Depth (Ajdin 2026-11-06): the Elektro level.** Concrete tools and settings in „So gehst du vor“ boxes, real software names, a worked example; no node-by-node recipes.

**Shared copy:** chapters 2 and 7 are word-for-word identical across the series except for the station vocabulary; that shared copy lives once in a data module and the guard tests check every template against it (the same pattern the Elektro PDF test uses against its landing page copy).

## 5. Research before writing (rule: no niche is written before its research is done)

Per niche, before any copy:

1. **Tools:** which software the trade actually runs (trade software, CRM, accounting, industry portals), what each ships natively, which have a public API. Feeds chapters 3, 5 and every Bordmittel note.
2. **Reported problems:** what owners in that trade say eats their time, from chambers (HWK, IHK), trade associations (e.g. ZVSHK for SHK), trade press and owner forums. Quotes stay internal; the copy paraphrases (rule from the quote bank, HQ §2.2).
3. **One verified statistic per niche:** primary source only (survey report, official statistics, chamber or association study), with source, year and link, the same rule as `Knowledge/marketing/ki-studien.md`. If no primary source exists, the niche gets no number rather than a weak one, and the cover uses a pain line only.
4. **What we already hold:** the niche's section in `prozess-landkarten.md`, the Outreach Engine niche list, dossiers and prep (`first-client-conversations.md`, `prospect-zilk-immobilien.md` for Makler, the broker-era docs for Finanzmakler), Lead Engine segment data.

**Where it lives:** the findings go into that niche's `##` section of `Knowledge/marketing/prozess-landkarten.md` (its rule: one section per segment, never a new file). A new research part is added to each section: tools with native features and API, reported problems with sources, the statistic with link. SHK also gets the missing station 13 row.

**Method (Claude's call):** web research via WebSearch (standard first, extended for niche facts) and Firecrawl for full pages (keys in the HQ `.env`, within the standing budget). Each statistic is opened at its source and its exact wording is checked before it is used.

**Review gate:** for the pilot, Ajdin reads the research summary before the PDF is written (it decides which station is the door). For later niches the research is reviewed together with the rendered PDF.

## 6. Constraints

- **Brand (Website/Brand.md + HQ §9):** du; generic masculine; no Gedankenstrich, ranges with „bis“; no comma before „und“; German quotes; *Vrelo*/*Merak* in Fraunces italic; Petrol/Amber/neutral 70/20/10.
- **Prose pass:** all copy through `stop-slop`; Brand.md wins.
- **Public-content rules (HQ §4):** no Vrelo price, no competitor named; the reader's own software and suppliers may be named.
- **Compliance by niche:** stations that touch personal documents say „einsammeln und ablegen, nie bewerten“. For Finanz- und Versicherungsmakler this is load-bearing: no AI assessment of a person's creditworthiness (KI-VO Annex III), extraction and filing only. Any assistant or bot named in a Bauplan carries the Art. 50 disclosure line. Health data niches are out by decision (Praxen).
- **Facts check per niche:** no interface promised unless verified („wenn sie eine Schnittstelle haben“ wording otherwise, as in the Elektro guard).
- **„KI“ is allowed in the Baupläne, Handwerk included (Ajdin 2026-11-06):** the Haus keeps its name „Dein KI-Betriebssystem“. This overrides `prozess-landkarten.md` rule 5 for the Baupläne only. The Elektro outreach rule (no „KI“ in mail subjects, mails or the Bauplan name) stays as it is for the rebuilt Elektro Bauplan's title (Claude's call: that rule was not overturned).
- **Agentur and Elektro closes (Claude's call):** decided when they are rebuilt at the end of the series. Until then Elektro keeps its offer page and the shared chapter 7 stays identical everywhere; no per-niche override is built now.

## 7. Delivery (how it reaches the reader)

- **PDF pipeline:** one HTML template per niche in `Website/content/bauplan/<niche>-bauplan.html`, sharing one stylesheet and the shared copy; rendered with the kit renderer like the Elektro one, with a page-count gate; publish step copies the reviewed file to `Knowledge/Offers/<Niche>-Bauplan-Vrelo.pdf` and `public/bauplan/<niche>-bauplan-<hash>.pdf`. Generalising `scripts/render-elektro-bauplan.mjs` into one script taking the niche is the builder's call.
- **Page per niche:** `/vorlagen/<niche>-bauplan`, indexable, with the existing e-mail form (public token per niche, default `src=vorlagen`, `?src=` overrides). One shared data-driven page component for the new niches (Claude's call): a short landing page (cover line, statistic, what is inside, form), not a bespoke page like Elektro's. The Agentur and Elektro pages keep their own components until their rebuild.
- **Mails:** per-niche reader and internal mail in `bauplanEmail.ts` (internal mail names the niche), attachment name `Vrelo-Bauplan-<Niche>.pdf`.
- **Vorlagen hub:** each finished Bauplan adds one card; with sixteen cards the hub will need grouping (e.g. Handwerk, Gebäudedienste, Logistik, Büros und Makler), the builder's call when the card count passes six.
- **Outreach compatibility (Claude's call):** a later outreach link can be the public page with `?src=<prefix><nn>`; no coded `/bauplan/<code>` page per niche is needed. This replaces the per-niche `BAUPLAN_CODE_<NICHE>` plan in the Outreach Engine niche doc; that doc gets a one-line update when the pilot ships.

## 8. Review gates

1. Pilot research summary → Ajdin (before writing).
2. Rendered pilot PDF → Ajdin reviews before commit (same gate as both existing Baupläne).
3. Pilot page on localhost → Ajdin, then push on his OK.
4. Each later niche: research + rendered PDF + page reviewed together, pushed on his OK.

## 9. Left to the builder

Visual layout within the brand system (page 1 can follow the Elektro page-1 approach), how chapters 3 and 5 split across pages, the exact self-check mechanics (checkboxes vs. a scoring grid), the shared stylesheet structure, the renderer generalisation, the hub grouping, test structure (copy guards per template, page gate, PDF file exists, shared-copy match).

## Carry-forward from the SHK pilot (2026-11-06)

Fix before the next niche batch (from the pilot's reviews):
- Guard: `Winter` (client-name check) will hit a plain „im Winter“ in Hausmeister/GaLaBau copy; scope it to the name.
- Guard: the sentence split on ". " breaks on „z. B.“ and fails open; the page-section count includes HTML comments; the title exemption in the first-person check is broad.
- Republish deletes the previous hash, so PDF links in already-sent mails break; keep the previous file for a while once a niche has traffic.
- The page's form reuses the Agentur form defaults (label, button, hint, success); give the series its own copy if they ever diverge.
- The web page shows the statistic's source but not the PDF's scope note (e.g. which trades the Ausbaugewerbe covers).
