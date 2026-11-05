# /referenzen — named client references on one page

**Date:** 2026-11-05 · **Status:** design, waiting for Ajdin's review · **Brainstormed with Ajdin**
**Closes:** review point #40 (own Referenzen page) and #39 (nav slot) from
[2026-11-04-website-review-triage.md](2026-11-04-website-review-triage.md).

## 1. Intent

Until now both references (Velp, MDZ) appear only by shape („eine Agentur“, „ein Hausmeisterservice“),
because neither owner had agreed to be named. Mirsad (MDZ) and Alen (Velp) both agreed on
2026-11-05. A named reference with the owner's own words is the strongest proof Vrelo can show
(Hormozi: perceived likelihood). The page shows what was built and what changed, so a visitor thinks
„das könnte bei mir auch laufen“ and starts the Prozess-Check.

## 2. Goals, non-goals, anti-goals

**Goals**
- One page `/referenzen`, everything readable **without a click** (no detail pages, no accordions).
- One card per client: short overview, „Was ich gebaut habe“ as bullets, the result.
- All quotes gathered **at the end** in one band (Ajdin chose layout B), then the CTA.
- „Referenzen“ in the top nav, the homepage section links here.

**Non-goals**
- No review/rating schema (self-serving reviews get no rich results; not worth the risk).
- No prices, no build durations, no „kostenlos“ (Ajdin: not necessary).
- No client photos or logos in v1 (Ajdin's call pending, see §8); the MDZ clip is the visual.
- The website MDZ got is **not an offer**: it is listed as work done, nothing more (Ajdin 2026-11-05;
  HQ §4 Website-Zusatz rule stays: never offered on the public site).

**Anti-goals (a failure even if it works)**
- A quote the client never approved in its German wording.
- A number the client never approved for publication.
- Hiding that MDZ is Ajdin's father's business (reads as a planted testimonial once noticed, UWG §5).
- Hype register. Brand voice wins (Brand.md): calm, du, „Ich“.

## 3. Constraints

- **Publish gate.** Push to `main` deploys prod. Build on a branch; merge only when every quote on the
  page has its owner's OK on the exact German wording (Mirsad: §6.4; Alen: only if he sends a quote).
  Naming itself is cleared: Alen said yes on 2026-11-05 (Ajdin: name everyone).
- Copy guards apply: German quotes „…“ (U+201E/U+201C), no Gedankenstrich, no comma before „und“
  (`kommaUnd.test.ts`), no prices. The Write/Edit tools downgrade quotes: verify bytes after every write.
- Founder name ASCII `Ajdin Dzafic`; the owner is `Mirsad Dzafic`.
- Generic masculine („Mitarbeiter“, „Kunden“).
- MDZ public facts only from what MDZ already publishes on mdzhausmeisterservice.de:
  seit 2008 · 55+ Objekte · 10+ Hausverwaltungen · eigenes Team. Never client names, staff names,
  revenue, invoice counts, Steuernummer.
- Velp: only what runs live today goes on the card (the ClickUp engine). #9 Angebot/BoldSign and
  #5 Onboarding are still in test; they join the card only once Alen takes them live.

## 4. Decided (by Ajdin, 2026-11-05)

| # | Decision |
|---|---|
| D1 | One page, no clicks to read everything. |
| D2 | Layout B: cards carry facts only; all quotes in one band at the end. |
| D3 | Hero headline „So läuft es heute bei meinen Kunden.“; the quote band carries „Das sagen meine Kunden.“ |
| D4 | MDZ named, with the line that it is his father's business (wording §6.1). No „kostenlos“. |
| D5 | MDZ bullets in this order: Telegram-Assistent · Rechnungsautomat · MDZ Core (the base for the Telegram invoices) · Entsorgungsplan · Website (as a side item, not an offer). |
| D6 | Velp named (Alen's yes, 2026-11-05). |
| D7 | „Referenzen“ replaces „Newsletter“ in the top nav. The newsletter stays (footer form, footer link, Prozess-Check result exit). |
| D8 | Everyone named everywhere: the compact cards on the homepage and the /leistungen hub show the names too. |

## 5. Page structure

1. **Hero** — eyebrow „Referenzen“, h1 „So läuft es heute bei meinen Kunden.“, lead (§6.0).
2. **MDZ card** (full width) — header (name, branch · city, owner, public facts), the father line,
   overview, „Was ich gebaut habe“ bullets, clip `/video/ki-assistent.mp4` (poster `.webp`, already on
   the KI-Assistenten page), result line with the one number.
3. **Velp card** — same structure, no clip.
4. **Quote band** — h2 „Das sagen meine Kunden.“, the approved quotes with attribution
   (name, company), then the Prozess-Check CTA + microcopy + secondary link to `/kontakt`.

## 6. Copy (draft, German; Ajdin reviews, owners approve their own lines)

**6.0 Hero lead:** „Zwei Betriebe aus Regensburg. Was ich gebaut habe und was sich seitdem verändert hat.“

**6.1 MDZ card**
- Name: **MDZ Hausmeisterservice** · Hausmeisterservice · Regensburg · Inhaber Mirsad Dzafic
- Facts line: „Seit 2008, über 55 Objekte, eigenes Team.“
- Father line (Ajdin's words, cleaned): „Der Betrieb meines Vaters. Hier konnte ich anfangen und habe
  gesehen, wie meine Systeme ihm die Arbeit leichter machen.“
- Overview: „Mirsad ist den ganzen Tag auf seinen Objekten. E-Mails, Termine, Aufgaben fürs Team und
  Rechnungsdaten blieben bis zum Abend liegen: zwei Stunden Büroarbeit nach der eigentlichen Arbeit,
  jeden Tag.“ (number confirmed by Mirsad 2026-10-29/30)
- Was ich gebaut habe:
  1. **Telegram-Assistent:** Mirsad spricht eine Nachricht ein. Der Assistent schreibt die E-Mail und
     verschickt sie, trägt den Termin ein, gibt die Aufgabe an den richtigen Mitarbeiter und erfasst
     die Rechnungsdaten.
  2. **Rechnungsautomat:** Aus jedem Rechnungseintrag wird eine nummerierte Rechnung als Word und PDF,
     abgelegt im richtigen OneDrive-Ordner des Kunden.
  3. **MDZ Core:** Alle Objekte, Preise und Rechnungen seit 2022 in einer Datenbank. Darauf baut die
     Rechnung per Telegram auf.
  4. **Entsorgungsplan:** Der Monatsplan, wann an welchem Objekt welche Tonne raus muss, für Stadt und
     Landkreis, direkt aus dem offiziellen Abfallkalender.
  5. **Website:** Nebenbei kam eine neue Website dazu.
- Result: „Mirsad muss sich nichts mehr merken. Seine Mitarbeiter wissen, was zu tun ist, die
  Rechnungen liegen fertig in OneDrive und der Entsorgungsplan stimmt jeden Monat.“
- Number: **2 Std./Tag** · „Büroarbeit weniger“

**6.2 Velp card** — **my call:** new copy in the MDZ shape (facts line, overview,
bullets, result), drafted by the builder from the live `agentur` entry in `src/lib/referenzen.ts` for
Ajdin to review, so both cards look alike. Bullets = only what runs live (today: the ClickUp engine and
its parts: phases, tasks with Werktags-Fristen, BAFA track). Named: **Velp** · Regensburg · Inhaber
Alen Purisic · branch label **Marketingagentur** (my call: today's card + HQ; switch if Alen says Videoagentur).
„über 12 Stunden pro Kunde“ only if Alen approves it for publication (he confirmed it 2026-10-27, but
for the outreach mail only).

**6.3 Velp number and quote:** the card carries no number until Alen approves one for publication.
If he sends no quote, the band carries Mirsad's three and no Velp line.

**6.4 Quote band.** Mirsad's statements (2026-11-05, Ajdin's English notes) put into German. **Mirsad
approves the exact German before publishing.** Three go in the band; the other two are already carried
by the bullets.
- „Ich muss mir nichts mehr merken und nichts mehr aufschreiben. Ich spreche einfach rein und alles
  wird erledigt.“
- „Meine Mitarbeiter wissen, was zu tun ist. Sie müssen nicht mehr ständig anrufen. Wir sind viel
  effizienter geworden.“
- „Der Entsorgungsplan stimmt immer. Das ist eine immense Hilfe.“
- Spare (not in the band): „Auch E-Mails gehen viel leichter. Ich muss nicht mehr anhalten und tippen.
  Alles wird sauber formuliert, formatiert und verschickt.“ · „Die Rechnungen laufen jetzt mit. Alles
  ist mit OneDrive verbunden, Word und PDF liegen sauber abgelegt.“
- Alen: his own two or three sentences from the 2026-11-05 meeting, same approval rule.
- Attribution format: „Mirsad Dzafic, MDZ Hausmeisterservice“ / „Alen Purisic, Velp“.

**6.5 CTA:** the house `CTAButton` → `checkHref(CHECK_SRC.referenzen)` with a new slug
`referenzen: "referenzen"` in `prozessCheckCta.ts`, `CHECK_CTA.microcopy`, plus `SecondaryLink` to
`/kontakt`.

## 7. Touch points outside the page

- `src/lib/nav.ts`: `/newsletter` → `{ href: "/referenzen", label: "Referenzen" }`, placed right after
  „Leistungen“ (Ajdin agreed). Nav/LeistungenMenu tests follow.
- `src/app/sitemap.ts`: add `/referenzen`.
- Homepage `src/components/home/Referenzen.tsx`: link goes to `/referenzen`; the compact cards show the
  names (D8). **My call:** the MDZ compact card keeps the family tie visible with a short addition to its
  label (Betrieb meines Vaters), so the name never appears without it (UWG §5).
- `/leistungen` hub `src/components/leistungen/Referenzen.tsx`: today shows the full cards. **My call:**
  switch it to the compact cards + a link to `/referenzen`, so the full story lives in one place
  (same names + family label as the homepage).
- `src/lib/referenzen.ts`: extend the type for the named fields (name, owner, facts line, father line,
  bullets, clip) rather than a second data file; homepage and hub keep reading `kompakt`/`kennzahl`.
- Page metadata: title „Referenzen“, description ≤ 170 chars; no page-level `openGraph` object (the
  layout's share card stays, see Website/CLAUDE.md).
- Leave by shape on purpose: the KI-Assistenten page `caseLine` („Ein Hausmeisterservice …“) and
  LinkedIn copy. Naming there is a separate decision.

## 8. Left to the builder

- Visual treatment within the existing house style (warm `Section` tone, `SectionBackdrop`, `Reveal`,
  card surfaces as on the homepage Referenzen section); mobile first, 16 px gutter.
- Bullet styling, how the number sits on the card, clip placement within the MDZ card.
- Test shape: a page test pinning h1, the two card headings, the quote band h2, the CTA href
  `/prozess-check?src=referenzen` and the `/kontakt` link; copy-guard tests cover the new strings.
- **My calls, open for Ajdin to overturn:** three of Mirsad's five quotes in the band (§6.4); no photos
  or logos in v1; the hub switches to compact cards (§7); the family label on the MDZ compact card (§7);
  Velp label Marketingagentur (§6.2).

## 9. After publish

- HQ §7: strike #39/#40 from the review list, note `src=referenzen` in the booking review.
- Vault light sync: mdz.md + velp.md („named on /referenzen since …“).
- LinkedIn playbook §91 rule („Form, nie Name“) can name them from then on; Ajdin decides per post.

## 10. Still to collect before merge (does not block the plan)

1. Mirsad: OK on the exact German of his three quotes (§6.4).
2. Alen: two or three sentences for the band, whether a Velp number may go public, the branch label.

## 11. Second round (Ajdin, 2026-11-05, after the first localhost look)

Supersedes D2, D3, §5 and the long copy in §6 where they differ. The build follows this section.
- Hero: „Das sagen die Kunden.“, compact hero, no lead: the page starts on the cards.
- Two cards **side by side** (stacked on phones), each: logo (MDZ lockup, Velp logo) · place + owner ·
  short intro (MDZ: + father line) · **Das Problem → Was ich gebaut habe → So läuft es heute** ·
  visual (MDZ clip; Velp an abstract phase graphic, no client data) · tools as text chips (names only,
  never tool logos) · the owner's quote at the card foot.
- No separate quote band; one quote per card (MDZ: the first of §6.4; Velp: none until Alen sends one).
  The page closes on the house `ClosingCta` (`src=referenzen`).
- MDZ tools: Telegram · n8n · Claude · Notion · Google Kalender · OneDrive · Word. Velp: ClickUp · n8n
  (only what runs live). Ajdin checks both lists before merge.

