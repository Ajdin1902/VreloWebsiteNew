# 01 — Evidence

Consolidated from three evidence subagents (Structural, Copy & Honesty, Accessibility) plus the orchestrator's own browser measurement. Findings without a source citation were rejected.

---

## A. Structural

### Interactive element counts

| Surface | Elements | Note |
|---|---|---|
| `/makler` | **12 visible at any viewport** (8 links, 1 button, 4 `<summary>`, 0 inputs) | `ChromeGate` suppresses site Header/Footer — `src/lib/nav.ts:16`, `src/components/ChromeGate.tsx:14` |
| `/lead-check`, ambient chrome | **19 links + 2 buttons + 4 inputs** | Header `src/components/Header.tsx:18-52`, Footer `src/components/Footer.tsx:22-57`, footer newsletter form `src/components/newsletter/NewsletterForm.tsx:47-81` |
| `/lead-check`, the actual task | **max 6 on screen at once** (step 2) | `src/components/lead-check/Question.tsx:49-97` |
| `/lead-check`, max simultaneous | **31** (drawer closed) / **39** (drawer open) | |

**A1 — Four of `/makler`'s eight links point at the same anchor `#termin`.** `MaklerHeader.tsx:25` (desktop), `:28` (mobile), `MidCta.tsx:22`, resolving to `src/lib/makler.ts:65`; destination `TerminSection.tsx:19`.

**A2 — `/lead-check` carries 19 navigational exits around a 6-element task.** Nav link list rendered three times on one page: `Header.tsx:27-42`, `Footer.tsx:20-26`, `MobileNav.tsx:85-95`, all from `src/lib/nav.ts:4-9`. `Website/CLAUDE.md` records this as deliberate („`/lead-check` und `/demo` behalten bewusst die volle Chrome"), and records the opposite reasoning for `/makler`: focus routes exist „for single-purpose outreach pages where every nav link is an exit before the CTA."

**A3 — The task begins 1,016 px down.** Measured on `/makler`-equivalent layout at `/lead-check`: hero section 581 px + intro 410 px before the first question. Page total 1,887 px; footer starts at 1,484 px.

### Nesting depth

- `/makler`: **3** — `page > TerminSection > WaterSection > Section` (`src/app/makler/page.tsx:46` → `TerminSection.tsx:18` → `WaterSection.tsx:15`)
- `/lead-check`: **4** — `page > LeadCheck > Result > SchedulerEmbed > Cal` (`src/app/lead-check/page.tsx:28` → `LeadCheck.tsx:22` → `Result.tsx:85` → `SchedulerEmbed.tsx:64`)

Both shallow. No finding.

### Repeated patterns (21 identified; the load-bearing ones)

| # | Pattern | Instances | Citations |
|---|---|---|---|
| R5 | `card-depth rounded-2xl bg-papier p-…` card surface hand-rolled, no shared primitive | **5×** | `ProblemSection.tsx:20`, `DocumentConciergeBlock.tsx:40`, `Voraussetzungen.tsx:26`, `Garantie.tsx:24`, `Garantie.tsx:38` |
| R3 | Numbered-circle badge markup duplicated verbatim (identical class string) | 2× | `DocumentConciergeBlock.tsx:41-45`, `Garantie.tsx:26-30` |
| R8 | Centred heading spine + near-identical h2 class string | 6× | `ProblemSection.tsx:12`, `Voraussetzungen.tsx:16`, `WarumIch.tsx:15`, `Einwaende.tsx:11`, `Garantie.tsx:12`, `TerminSection.tsx:19` |
| R17 | **Four independent button implementations on one surface** (`/lead-check`) | 4× | `CTAButton.tsx:21-32`, `Question.tsx:7-12`, `SchedulerEmbed.tsx:51`, `ResultEmailForm.tsx:52`, `NewsletterForm.tsx:42-44` |
| R14 | **Two full email-capture forms on the same page**, with duplicated honeypot / `renderedAt` / email input / identical pending label | 2× | `ResultEmailForm.tsx:24-58`, `NewsletterForm.tsx:47-81` via `Footer.tsx:38` |
| R18 | Result copy duplicated across page and both email bodies | 4 blocks × 3 | `Result.tsx:61-65,71-73,82,35` ↔ `leadCheckEmail.ts:76,79-81,85,49` ↔ `:113,116-118,121,101` |
| R19/R20 | `SCORE_LABEL` map and euro formatter each declared twice | 2× each | `Result.tsx:10-14` ↔ `leadCheckEmail.ts:22-26`; `Result.tsx:8` ↔ `leadCheckEmail.ts:18-20` |
| R10/R21 | `bg-gletscher/30` band hand-rolled instead of `<Section tint>` | 2× | `MidCta.tsx:15` vs `Section.tsx:29`; `src/app/lead-check/page.tsx:26` |
| R11 | „Your data stays on your own server" stated three times | 3× | `makler.ts:132-135`, `:143-146`, `:210-214` |

### Dead props / unused imports

**Unused imports: 0** across all 24 files. **Dead props: 6.**

| # | Item | Declared | Read in production |
|---|---|---|---|
| D1 | `MaklerProduct.body?: string` | `makler.ts:20` | never — only `DocumentConciergeBlock.test.tsx:27` |
| D2 | `PageHero.actions?: ReactNode` | `PageHero.tsx:23`, rendered `:46` | never — all 7 call sites omit it |
| D3 | `PageHero.priority?: boolean` | `PageHero.tsx:20` | never passed |
| D4 | `LeadCheckResult.anfragenProJahr` | `leadCheck.ts:108`, computed `:149` | no consumer |
| D5 | `LeadCheckResult.recoverableTermine` | `leadCheck.ts:110`, computed `:152` | no consumer |
| D6 | `Step.defaultValue` (provision) | `leadCheck.ts:30`, set `:96` | never read; default comes from `DEFAULT_PROVISION` `:142` |

**Dead code branch:** `DocumentConciergeBlock.tsx:25-35` — the `p.demoVideo` branch plus its `LazyVideo` import at `:3`. Both products hard-set `demoVideo: null` (`makler.ts:110`, `:137`), so only the `else` at `:37-52` ever renders. `demoVideo` is nonetheless a **required** field (`makler.ts:30`) forcing 6 non-null assertions in consumers (`TerminQuelleBlock.tsx:25,30,40,55,56,61`, `DocumentConciergeBlock.tsx:39,60,61`).

---

## B. Visual (measured, production build, Chrome)

### Type scale — `/makler`

`12 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48` px. Standard, no orphans. The single `25.6px` element is the `PageHero` drop-cap, a documented pattern (`Website/CLAUDE.md`: „title on `.hero-overlay-scrim`, lead on paper below as a Fraunces serif standfirst with a petrol drop-cap") — **intentional, not an orphan style.**

Two font families (`Plus Jakarta Sans`, `Fraunces`), three weights (400/500/600). Eight distinct text colors.

### Spacing scale — `/makler`

- Padding: `4 · 10 · 12 · 16 · 20 · 24 · 32 · 48 · 80 · 96 · 128`
- Margin: `2 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48` (+ `-128` for the documented `-mt-32` section pull-up)
- Gap: `8 · 10 · 12 · 16 · 24`
- Radii: `4 · 8 · 16 · 24` + one pill (`9999`)

**B1 — Two values sit off the 4/8 rhythm:** `10px` (appears in both padding and gap) and `2px` margin. Minor.

### Color system

Base palette actually rendered: Papier `#F4EFE6`, Petrol `#1B5063`, Amber `#D4A24C`, Tiefes Wasser `#0A2538`, Sonnenlicht `#F4E4C1`, plus a disciplined alpha ramp on one token (`.05 / .1 / .3 / .4`). This is a real system, applied consistently. No orphan hex values found.

### States

`prefers-reduced-motion` rules present: **4**. `prefers-color-scheme` rules: **0** — the site commits to a single light identity (Papier is a brand non-negotiable per `Brand.md`), so this is a deliberate single-look commitment, not an oversight.

**B2 — `focus-visible:` classes present on every control probed** (14/14 across header and main). `Reveal` degrades correctly: the hidden state is gated behind `html.reveal-ready` set by an inline script, so **no-JS renders everything visible** (`Reveal.tsx:12-19`).

**B3 — Empty / loading / error / success states all exist on `/lead-check`:** disabled „Weiter" until input (`Question.tsx:72-79`), pending label „Wird gesendet …" (`ResultEmailForm.tsx:54`), error `<p>` (`:57`), success replacement (`:19-21`).

**B4 — One image is upscaled and unoptimized.** `fliessen.webp` is `naturalWidth 1584` displayed at `1905` CSS px, served raw rather than through the Next image optimizer (the other image on the page *is* optimized: `/_next/image?url=...`). Both images carry `loading="auto"`, so neither defers below the fold.

### Weight & friction (production, rokt excluded)

| Metric | `/makler` | `/lead-check` |
|---|---|---|
| Requests | **18** | **17** |
| Total transfer | **361 KB** | **312 KB** |
| JS transfer | **176 KB** | **179 KB** |
| JS decoded | 624 KB | 634 KB |
| DOMContentLoaded | 703 ms | 295 ms |
| Load | 1,699 ms | 956 ms |
| Idle animations | **0** | **0** |
| Modals / badges / notifications on load | **0** | **0** |
| Autoplay video | **none** | **none** |
| Third-party requests on load | **0** (Cal loads only on click, `SchedulerEmbed.tsx:39-60`) | **0** |

---

## C. Copy & honesty

### Brand-rule compliance — clean

Codepoint scan across all 24 files:

- **U+0022 ASCII quote in German copy: 0.** (2 raw hits are HTML attribute delimiters inside email template literals, `leadCheckEmail.ts:65-66`.)
- **U+2014 em-dash in German copy: 0.** All 4 hits are English code comments, which HQ §8 permits.
- **U+201D wrong closing quote: 0.**
- **`:innen` gendered forms: 0.**
- **Hype words (`skalieren`, `KI-Magie`, `Game-Changer`, `revolutionär`, …): 0. `!!`: 0.**
- **Competitor names: 0.**
- **Vrelo prices: 0.** The single euro figure is „rund 30 €" (`makler.ts:145`), matching the mandated site-wide string exactly, and guarded by `makler.test.ts:43-53`.

### No dark patterns

**C1 — The lead-check result is NOT email-gated.** `LeadCheck.tsx:13-23` renders `<Result>` as soon as the steps are done, with no email condition. `Result.tsx:28-78` renders score, € upside, loss %, methodology and the three tips unconditionally. The email form is the last element (`Result.tsx:87-89`). The hero promises „dein Ergebnis sofort" (`page.tsx:20`) and the behavior matches. **Verified empirically:** a full run reached the result with no address given.

**C2 — Scarcity is explicitly de-escalated.** „Für meine ersten drei Kunden … Ich sage das einmal, ohne Countdown – es ist schlicht der Stand." (`makler.ts:188`). No timer, no counter, no „nur noch X" (`Garantie.tsx:38-41`).

**C3 — Cancellation terms stated plainly, against interest.** „Monatlich kündbar. Kündigst du, läuft alles weiter – du verlierst nur meine Aufmerksamkeit … nie die Sicherheit." (`makler.ts:149`); „Der erste Monat Betrieb geht auf mich." (`:180`).

**C4 — The „schnell" branch deliberately shows no € figure** (`Result.tsx:35`) where showing one would have been commercially convenient. The honesty rule was applied in the branch where incentive ran against it.

### Unbacked claims — the weak axis

Both products on `/makler` are **specced but never delivered once** (HQ §2.2). Against that, the page makes absolute promises:

| # | Claim | file:line | Backing on page |
|---|---|---|---|
| I1 | „Jede Anfrage bekommt in unter fünf Minuten eine Antwort." / „Rund um die Uhr. Darauf gebe ich mein Wort." | `makler.ts:176-177` | **None.** No measurement, no SLA definition, no delivered instance. |
| I2 | „Aus jeder Anfrage wird ein Termin – von selbst" | `makler.ts:94` | **None**, and contradicted 8 lines later by the softer „Mehr Termine" (`:102-103`). |
| I3 | „Du fragst nie wieder nach einer Unterlage." | `makler.ts:120` | **None.** The page's own note at `:136` concedes the product isn't finished software. |
| **I4** | **„Die Unterlagen deiner Kunden verlassen nie deine eigene Umgebung."** | `makler.ts:134` | **None, and materially contestable.** Per HQ §2.2 the DC sanity check sends document images to **Amazon Bedrock** in the client's own AWS account. Whether that counts as „deine eigene Umgebung" is an interpretation the page never states. No mention of AWS, Bedrock or any model call appears anywhere on `/makler`. |
| I5 | „EU-gehostet und DSGVO-konform, mit Auftragsverarbeitungsvertrag" | `makler.ts:213`, `:134` | **None.** No counterparty named, no processor list, no link to Datenschutz. |
| I7 | „Lead-Response-Forschung (HBR/InsideSales) … Acht- bis Zehnfache" | `Result.tsx:62-64` | **No citation** — no study name, author, year or link. |
| I8 | „Wir rechnen bewusst konservativ" | `Result.tsx:63-64` | **Partly.** Only `CLOSE_RATE = 0.2` is disclosed („jeder fünfte"). The loss constants that drive the headline € — `BASE_LOSS` 0.10–0.75, the three modifiers, `ACHIEVABLE_LOSS` (`leadCheck.ts:117-132`) — are neither shown nor sourced. |
| I9 | „Wir rechnen mit dem Branchenschnitt" (€4.000) | `leadCheck.ts:97`, `:17` | **None.** Immobilien and Finanz/Versicherung differ materially. |

**C5 — The headline number, measured.** Entering 20 inquiries/week and selecting the worst option at every step produces:

> „Mit einer Antwort in unter 5 Minuten wären bei dir rund **156 Abschlüsse** mehr im Jahr drin – ca. **624.000 €**. Ohne eine einzige neue Anfrage."

156 additional closings a year is three a week, every week, for a solo broker — from response speed alone. The disclosure directly beneath it qualifies only the €4.000 per deal, not the conversion assumption that produces 156 deals. The arithmetic is internally consistent; the *inputs* are undisclosed and unsourced. Per the 2026-08-08 changelog this same figure is now emailed to the lead, so it is the first artifact a Tier-A prospect receives.

### Label → behavior mismatches

| # | Label | Behavior | Citations |
|---|---|---|---|
| **M4** | „Zusammenfassung per Mail – und ich melde mich, **wenn du magst**." + button „Schicken" | Sends **two** mails: the lead's summary **and** an internal notification forwarding every answer plus the € valuation to Vrelo (`replyTo` = the lead). **No Datenschutz link sits next to the field, and „wenn du magst" has no corresponding control.** | Label `ResultEmailForm.tsx:36`, button `:54`; handler `actions.ts:67-73`; internal mail `leadCheckEmail.ts:160-227` |
| **M1** | „Kostenloses Erstgespräch – **30 Minuten**" (`/makler`) | The lead-check email CTA says „**15-Minuten**-Gespräch buchen" for the same booking flow | `makler.ts:66`, `:219` vs `leadCheckEmail.ts:65`, `:122` |
| **M3** | „Überspringen" | Does not omit the value — silently adopts €4.000, which then drives the headline € figure | `Question.tsx:81-82` → `LeadCheck.tsx:29-30` → `leadCheck.ts:140-143` |
| M5 | „Erstgespräch vereinbaren" | Scrolls to a section that requires a **second** click („Termin anzeigen") before the calendar loads | `makler.ts:63,65` → `TerminSection.tsx:19` → `SchedulerEmbed.tsx:48-53` |
| M2 | „Termin anzeigen" | Loads a booking calendar; does not display an appointment. The adjacent line already says so correctly. | `SchedulerEmbed.tsx:53` vs `:56` |
| M6 | „Glaub mir das nicht – probier es aus" / „dem System" → `/demo` | `/demo` is a **Claude-Haiku simulation, not the real engine**. The `/makler` copy never names it as a simulation or as AI. | `makler.ts:105-108` → `TerminQuelleBlock.tsx:57` |
| M7 | Unconfigured fallback: „Schreib mir so lange einfach über das Kontaktformular." | Names a form it does not link to. On `/lead-check` the hint isn't even overridden — it still says „Formular unten", where no contact form exists. | `makler.ts:220`; `Result.tsx:85` (no override) vs `SchedulerEmbed.tsx:17` |

### Jargon

13 flagged. The load-bearing ones for a non-technical German broker: „Document Concierge" (English product name, `makler.ts:119`), „Lead-Reaktions-Check" / „Deine Lead-Reaktion" (`page.tsx:8`, `Result.tsx:29`), „Lead-Response-Forschung (HBR/InsideSales)" — two unexplained acronyms (`Result.tsx:62`), „mit Auftragsverarbeitungsvertrag" (legal term, unexplained, no counterparty, `makler.ts:134`), and the bare chips „Qualifizieren" / „Protokoll" (`makler.ts:95`).

### AI disclosure

**No AI runs on either surface** — `/lead-check` scoring is pure arithmetic (`leadCheck.ts:138-169`), `/makler` is static copy. No Art. 50 obligation is triggered, and none is claimed. Correct.

Two adjacent facts: `/makler` sends the sceptic to `/demo`, which *does* run a Claude-Haiku bot, while calling it only „dem System" (`makler.ts:105-108`). And the page never states that the Termin-Quelle's replies are deliberately **AI-free** — per HQ §2.2 that is true and is a selling point the page doesn't use; per the quote bank, three prospects independently volunteered that they reject AI on the phone.

---

## D. Accessibility

See the accessibility subagent's report, folded in below. Orchestrator-measured facts:

**D1 — Focus is never moved when a quiz step advances.** Measured across all six steps: `document.activeElement` remains `BODY` after every advance. A keyboard or screen-reader user who selects an option loses their place and must tab from the top of the document again. `LeadCheck.tsx` contains no focus management.

**D2 — No live region anywhere in the quiz.** `[aria-live]`, `[role=status]`, `[role=alert]`, `[role=progressbar]` all return **0 matches** in `<main>`. The visible „Frage N von 6" counter (`LeadCheck.tsx:41`) is never announced; a screen-reader user gets no progress signal and no notification that the step changed. Similarly `fieldset`/`legend`: **0**.

**D3 — Answer options are real `<button>` elements** (`Question.tsx:46-54`), not divs with handlers. Keyboard-operable. „← Zurück" present from step 2 onward (`:89-97`).

**D4 — `focus-visible:` utility classes present on 14/14 controls probed.**
