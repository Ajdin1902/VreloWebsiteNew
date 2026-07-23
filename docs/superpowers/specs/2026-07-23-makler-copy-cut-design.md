# `/makler` Copy-Cut – Design (2026-07-23)

*A second pass over the `/makler` landing page: cut roughly 60 % of the prose, reorder so the CTA arrives only after the first product has earned it, and add the two reassurance facts that were missing (the server is his; maintenance is optional). The page's job is unchanged – make an independent Makler recognise his own week in the pain section, then book a call.*

Supersedes the page-structure sections of [2026-07-23-makler-landingpage-design.md](2026-07-23-makler-landingpage-design.md); everything else in that spec (route, `noindex`, focus chrome, `ChromeGate`, copy-module pattern, honesty constraints) still governs.

Offer sources of truth, unchanged: `Knowledge/Offers/Termin-Quelle.md` · `Knowledge/Strategy/Document_Concierge.md` · HQ `CLAUDE.md` §2.2 (VreloVPS delivery standard) and §4 (retainer framing).

---

## 1. Why

The first version explained. The founder's read: a broker does not want a system described to him – he wants to recognise his problem and try the thing. Every paragraph between the pain and the demo is a place to leave. The page also lacked two facts that kill the biggest silent objections ("do I need to buy technology?" and "am I locked in?").

**Goal:** shorter page, same conversion path, two objections removed, one honest correction to how the server is described.

---

## 2. Decisions

| Fork | Decision | Why |
|---|---|---|
| Hero CTA | **Removed.** Hero is image + H1 + one sentence. | A CTA before the first argument asks for the close before giving a reason. The sticky header CTA keeps conversion one tap away throughout. |
| Hero lead | **One sentence**, not four. | Without any lead the visitor meets two pain sections before learning what is sold. One sentence orients him; four explain at him. |
| CTA placement | **One mid-page band, after the Termin-Quelle block.** | The first product is the one he can grasp and try. That is the earliest point the ask is earned. |
| Prose | Product bodies, benefit sub-texts and the closing paragraph **deleted**; headlines, flow cards and the demo invitation kept. | „Wir wollen, dass er es ausprobiert, statt dass wir es erklären.“ |
| Pain section | **Untouched.** | It is the recognition moment; cutting it would cut the reason to read on. |
| Bridge section | **Deleted.** | The CTA band now separates the two products visibly; a transition sentence is exactly the prose being removed. |
| Guarantee | **Kept**, between „Warum ich“ and the objections. | Strongest conversion lever on the page; answers „und wenn es nicht klappt?“ before the objections are read. |
| Objections | **6 → 4.** | Drops „Klingt das nicht wie ein Roboter?“ and „Wird das ein großes, riskantes Projekt?“. |
| New: server + maintenance | **Own short strip between the Document Concierge and „Warum ich“.** | Clears the technology question before he weighs the person. |
| Infra cost | **„unter 10 € im Monat“ appears on the page.** | HQ §2.2: saying the infra cost out loud is the cleanest proof the retainer is pure Vrelo-Leistung, not disguised hosting. It is a third-party cost he pays, not a Vrelo price. |
| CTA copy location | Moved out of `hero` to a top-level `cta` object. | The hero no longer has a CTA; leaving CTA copy under `hero.*` would misname it for the next reader. |

### 2.1 The server correction (load-bearing, not cosmetic)

The founder's first phrasing was „wir stellen ihm den Cloud-Server“. That is wrong three ways and must not ship:

1. **Factually:** the delivery standard (HQ §2.2) has the broker open his **own** Hetzner account on his own card during Discovery. Vrelo is never in the payment path.
2. **Legally:** n8n is fair-code under the Sustainable Use License. The client running it on his own server while Vrelo builds and maintains is permitted; **Vrelo hosting or reselling n8n as a service is not.**
3. **Rhetorically:** the Document-Concierge trust paragraph („bei mir liegt keine einzige Datei“) is only true *because* the server is his. Claiming to provide the server would demolish the page's strongest privacy argument two sections earlier.

The copy therefore says: **I set it up and build on it; it runs on your own account; it costs you under 10 € a month; it belongs to you** – which delivers the founder's actual intent (he has to do nothing) without any of the three problems.

---

## 3. Page structure (new)

| # | Section | Change |
|---|---|---|
| 1 | **Hero** | H1 unchanged. Lead cut from four sentences to one. **CTA removed.** |
| 2 | **Die zwei Lecks** | Unchanged. |
| 3 | **Die Termin-Quelle** | Body deleted. The four benefits keep their headlines only. Promise, five-step chip row, outcome and the `/demo` invitation stay. |
| 4 | **CTA-Band** *(new)* | One line + the CTA + the „30 Minuten, unverbindlich“ friction reducer. |
| 5 | **Document Concierge** | Body deleted. Promise, seven flow cards, trust block and the built-to-order note stay. |
| 6 | **Was du dazu brauchst** *(new)* | Two items: his own server (incl. the under-10-€ figure), and maintenance as optional and monthly-cancellable. |
| 7 | **Warum ich** | Intro kept; the four card bodies deleted, headlines only. |
| 8 | **Garantie** | Unchanged. |
| 9 | **Einwände** | Four items. |
| 10 | **Der Termin** | Paragraph deleted. Heading + Cal embed + the written fallback line. |

Removed entirely: the `Bridge` section and its component.

Colour rhythm: paper (hero lead, pain) → petrol panel (TQ) → cool tint (CTA band) → paper (DC) → cool tint (Voraussetzungen) → paper (Warum ich) → warm (Garantie) → paper (Einwände) → petrol water (Termin). Two consecutive cool tints are avoided by the paper DC block between them.

---

## 4. Copy (the exact new and changed strings)

**Hero lead** (replaces four sentences):
> Zwei Systeme: eines macht aus jeder Anfrage einen Termin, eines sammelt die Unterlagen ein. Beide baue ich dir, beide laufen ohne dich.

**CTA band line:**
> Klingt das nach deiner Woche?

**Was du dazu brauchst** – section title:
> Was du dazu brauchst: fast nichts

- **Deinen eigenen Server** – Ich richte ihn ein und baue alles darauf. Er läuft auf deinem eigenen Konto – unter 10 € im Monat, und er gehört dir. Deshalb liegen deine Daten auch bei dir und nicht bei mir.
- **Wartung nur, wenn du willst** – Monatlich kündbar. Kündigst du, läuft alles weiter – du verlierst nur meine Aufmerksamkeit und die laufenden Verbesserungen, nie die Sicherheit.

Everything else is deletion of existing strings. No other copy is rewritten.

---

## 5. Data model changes (`src/lib/makler.ts`)

```ts
// new top-level CTA object, shared by MaklerHeader, the CTA band and any future use
cta: { label: string; short: string; href: string; note: string };

hero: { title: string; lead: string };              // cta/ctaShort/ctaNote removed
midCta: { line: string };                            // new
voraussetzungen: { title: string; items: MaklerBullet[] };  // new

// MaklerProduct
body?: string;                 // was required – deleted for both products
solves?: string[];             // was MaklerBullet[] – headlines only

warumIch: { title: string; intro: string; points: string[] };  // was MaklerBullet[]
close: { title: string; fallbackHint: string; fallback: {…} }; // body removed
bridge                          // field removed
```

`MaklerBullet` (`{ title, body }`) survives – `problem.leaks`, `garantie.promises` and the new `voraussetzungen.items` still use it.

---

## 6. Component changes

- **`PageHero`** – **unchanged.** The hero keeps a (one-sentence) lead and simply stops passing `actions`, so the optional `actions` slot added in the previous build now goes unused on this page. No shared-component change is needed in this pass.
- **`TerminQuelleBlock`** – drop the body paragraph; render `solves` as a compact list of headline-only items.
- **`DocumentConciergeBlock`** – drop the body paragraph.
- **`WarumIch`** – render `points` as headline-only items.
- **`TerminSection`** – drop the body paragraph.
- **`MaklerHeader`** – read from `makler.cta` instead of `makler.hero.cta`.
- **New `MidCta`** – cool-tint band: one line, `CTAButton` to `#termin`, the note beneath.
- **New `Voraussetzungen`** – cool-tint section, two `MaklerBullet` items.
- **Deleted `Bridge`** (component + its test cases).
- **`page.tsx`** – hero without `actions`, new order, `Bridge` removed, `MidCta` and `Voraussetzungen` inserted.

---

## 7. The price guard

`src/lib/makler.test.ts` currently fails on any `€`. The infra figure is a deliberate, single exception, so the guard is **narrowed rather than weakened**:

- Every string in the copy object **except** those under `voraussetzungen` must contain no `€`, no `EUR`, and no digit-plus-`Euro`/`netto`.
- Exactly one string in the whole object may contain `€`, and it must be the server item.
- `src/app/makler/page.test.tsx`'s „never shows a price“ assertion changes the same way: the rendered page may contain `€` exactly once, and must still contain no `netto`, no „Setup“ price and no monthly rate.

This keeps the locked „no Vrelo prices on the site“ decision enforced while permitting the one third-party cost HQ wants said out loud.

---

## 8. Testing

1. Copy guard as in §7, plus the existing punctuation guards unchanged.
2. Shape guard: `hero` has no `cta`; `makler.cta.href === "#termin"`; `bridge` is gone.
3. Hero – the page passes no `actions`, so no CTA renders above the pain section.
4. `TerminQuelleBlock` – renders four benefit headlines and **no** benefit body text; still links to `/demo`.
5. `DocumentConciergeBlock` – flow cards and trust block render; no product body paragraph.
6. `WarumIch` – four headlines, no bodies.
7. `MidCta` – one CTA pointing at `#termin`, note rendered.
8. `Voraussetzungen` – both items render; the server item carries the infra figure.
9. `Einwaende` – exactly four items.
10. `TerminSection` – no body paragraph; anchor and `scroll-mt-` co-location assertions retained.
11. Page – section order matches §3; exactly one H1; three `#termin` anchors in the DOM (the header's desktop and mobile variants plus the mid-page band), and none of them inside the hero.

Gate: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, punctuation byte audit, and a browser pass at **true** 390 and 1440 – the viewport must be verified via `window.innerWidth`, not assumed from the resize call (the sandbox scales it).

---

## 9. Risks

- **Orientation.** The hero now carries one sentence. If it fails to say what is sold, the visitor meets two pain sections with no context. Mitigated by the sentence naming both systems in its first clause.
- **The AI question goes unmentioned.** Dropping „Klingt das nicht wie ein Roboter?“ removes the page's only acknowledgement that a bot answers. The EU-AI-Act Art. 50 duty falls on the assistant when it talks to *his leads* – it is met in the running system and in `/demo`, not by this marketing page – so this is legal, but it is a deliberate choice, not an oversight.
- **Copy drift.** The infra figure („unter 10 €“) and the retainer framing must stay aligned with HQ §2.2/§4. If the delivery standard changes, this page changes with it.
