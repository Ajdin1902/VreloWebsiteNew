# Bauplan für Elektrobetriebe: PDF lead magnet (design)

Date: 2026-10-29 · Owner: Ajdin · Status: draft for review
Origin: generalised from the Elektro Power-Connect application of 2026-10-28 (`Knowledge/marketing/prospect-elektro-power-connect.md`, PDF source `Knowledge/marketing/elektro-power-connect/vorschlag.html`). Sibling: the Agentur-Bauplan (`docs/superpowers/specs/2026-10-27-agentur-bauplan-design.md`).

## 1. Intent

A free PDF for owners of small Elektrobetriebe who spend more time on office work than on the actual job. It shows the road to a real KI-Büroassistent: one assistant connected to their invoicing software and their wholesaler, that prepares quotes, invoices and orders, learns their rules into a company brain, and runs DSGVO-konform in their own accounts.

**The pain (Ajdin's words, the spine of the copy):** more time goes to admin than to the actual work. Ten hours on site, then quotes, wholesaler prices, Abschläge and mail in the evening and at the weekend, and all the knowledge (markups, labour times) sits in the owner's head.

**Why now:** the Power-Connect application proved the shape can be described concretely (sevDesk + ELDIS + Betriebsgehirn). The same plan, without the client and without prices, becomes a door-opener for every Elektrobetrieb.

**Later (not this spec):** an unlisted landing page per recipient, same mechanics as the Agentur-Bauplan (`/bauplan/...?src=<id>`, form mails the PDF, notifies Ajdin), sent out by e-mail. This spec covers **only the PDF**. Build it so the landing page can reuse it without rework (same location and render pipeline as the Agentur-Bauplan).

## 2. Goals, non-goals, anti-goals

**Goals**
- The reader recognises his own evening on page 1 and understands within a minute what the assistant does and in which order it gets built.
- Pages 2 to 4 make it concrete enough to be credible (real software, real wholesaler interfaces, a worked example) without turning into a spec.
- Every claim is true today (see §6).

**Non-goals**
- No prices of any kind: no build price, no retainer, no monthly running costs (server, AI, software tariffs), no Förderung amounts.
- No durations (no weeks, no „in X Tagen“).
- No landing page, form or e-mail flow (later spec).
- No SEO agent (Power-Connect exception; §3 of HQ keeps SEO off the menu).

**Anti-goals (a failure even if it renders fine)**
- Reads like a software brochure or hype („KI-Revolution“, „spart 80 %“).
- Promises something we haven't verified (live prices from every wholesaler, an API in every invoicing tool).
- Implies the assistant removes state bureaucracy. The statistic is about Bürokratie and is labelled as such; the assistant takes over quotes, invoices, orders.
- Names a client (Elektro Power-Connect, Herr Öksüz, MDZ, Velp) or reuses Power-Connect specifics (Bergisch Gladbach, Vodafone number, Benetics).

## 3. Constraints

- **Brand (Website/Brand.md + HQ §9):** du-Ansprache; generic masculine; no Gedankenstrich (no en/em dash), ranges with „bis“; no comma before „und“; German quotes „…“; *Vrelo* in Fraunces italic; white page background (client-PDF exception), Petrol/Amber/neutral 70/20/10; first person „ich“ where Ajdin speaks.
- **Prose pass:** copy runs through the `stop-slop` skill; Brand.md wins on conflict.
- **Public-content price rule (HQ §4):** no Vrelo price, no competitor named. Software vendors and wholesalers named as the *reader's* tools are fine.
- **KI-VO Art. 50:** the phone assistant in Stufe 5 must say it announces itself as an AI assistant.
- **Format:** A4 portrait, **6 pages**: the overview, then one stage per page (Ajdin 2026-10-29, after the first PDF review; before that 5 pages). Every page keeps visible white space so it never feels overwhelming. Rendered offline from an HTML template with the kit renderer `Clients/_kit/brand-pdf/render-doc.mjs`, like the Agentur-Bauplan. Template convention: pure ASCII with HTML entities (Bauplan guard test decodes a fixed entity set; add new entities there if the guard is extended to this file).

## 4. Page by page

Copy below is direction plus draft lines, not final copy. Final copy is written in the build, run through stop-slop, and reviewed by Ajdin on the rendered PDF.

### Page 1: overview, landing-page style (approved layout „B with list“, mockup 2026-10-29)

Approved mockup: `docs/design/elektro-bauplan/page1-mockup.html` (a fragment for the brainstorm viewer; its inline `<style>` carries the type sizes and proportions that are the floor for the real template).

Top to bottom:
1. Header line: *Vrelo* wordmark left, „Bauplan für Elektrobetriebe“ right.
2. **Headline:** „Mehr Büro als Baustelle?“
3. **Subline:** „Der Weg zu einem KI-Büroassistenten, der Angebote, Rechnungen und Bestellungen für dich vorbereitet, deine Regeln lernt und DSGVO-konform in deinen eigenen Konten läuft.“
4. **Two columns, Heute | Mit dem Büroassistenten** (four bullets each, paired):
   - Angebote abends nach der Baustelle | Auf der Baustelle einsprechen, Entwurf liegt bereit
   - Preise einzeln im Shop nachschlagen | Deine Einkaufspreise kommen automatisch
   - Abschläge und Rechnungen von Hand | Rechnung aus dem Angebot mit einem „passt“
   - Das Wissen steckt nur in deinem Kopf | Deine Regeln stehen lesbar in deiner Cloud
5. **Statistic:** big „61 %“ + „der Handwerksbetriebe sagen: Durch Bürokratie bleibt weniger Zeit für die Aufträge.“ Source line: „Handwerkskammer Dortmund, Sonderumfrage 2023, rund 700 Betriebe“, with „hwk-do.de“ as visible text linking to the full PDF URL in §6 (Claude's call: no vrelo-ki.de redirect, no new public URL).
6. **„Der Weg in fünf Stufen“** as a numbered list (no cards):
   1. Fundament: deine Konten, Server in Deutschland, KI in der EU
   2. Betriebsgehirn: Zeiten, Aufschläge, Regeln, lernt mit deinem „Ja“
   3. Angebote und Rechnungen: sevDesk, Lexware, Label und Co.
   4. Großhandel: ELDIS, Sonepar, Rexel und Co.: Preise, Suche, Bestellung
   5. Ausbau: Nachkalkulation, Telefon, Anfragen, Termine
7. **„Drei Regeln, die immer gelten“** box: Nichts Verbindliches ohne deine Freigabe. Preise rechnet ein fester Rechenschritt, nicht die KI. Alles läuft auf deinen Namen.
8. Footer: „Ab Seite 2: jede Stufe im Detail · Ajdin Dzafic, Vrelo, Regensburg“.

Page 1 must fit on one page with breathing room; if it doesn't, shorten copy, never shrink type below the mockup sizes.

### Page 2: So arbeitet der Assistent + Stufe 1 Fundament

- **Flow strip:** Eingang (Sprache, Text, Foto, PDF, E-Mail) → KI-Assistent (versteht die Aufgabe, wählt Werkzeuge, fragt nach statt zu raten) → Werkzeuge (Rechnungssoftware, Großhandel, Betriebsgehirn, E-Mail) → deine Freigabe (erst dann wird versendet oder gebucht).
- **One worked scene:** on site he dictates „Angebot für Familie Berger, Unterverteilung tauschen, zwölf Meter NYM-J 5x10, sechs Stunden zu zweit.“ The assistant finds customer and articles, fetches his purchase prices, applies his rules, puts a draft into the invoicing software; he answers „passt“ or „Lohn auf acht Stunden“.
- Why one assistant with tools: new tasks without a new workflow („Fass mir die offenen Angebote vom Oktober zusammen“); a new system = one more tool.
- **Mehrere Nutzer:** everyone in the team may write to it; only people he names may approve.
- **Stufe 1 Fundament:**
  - All accounts in his name: server, AI account, automation platform, input channel, cloud.
  - Server in Germany. The AI model runs in his own account at Amazon Bedrock or Microsoft Azure, processing inside the EU. AVV with Vrelo.
  - Input channel: Microsoft Teams or WhatsApp Business; Telegram is possible but has no AVV, say so.
  - Every binding action (Versand, Rechnung, Änderung am Gedächtnis) only after his click on „Freigeben“; every step logged; errors raise an alarm; daily backup to a second location.

### Page 3: Stufe 2 Betriebsgehirn · Page 4: Stufe 3 Angebote und Rechnungen (each on its own page since the review)

- **Stufe 2 Betriebsgehirn:**
  - Readable documents in a folder in his own cloud (OneDrive or Google Drive, otherwise a German cloud storage), one file per topic: Kalkulationsregeln, Arbeitszeiten je Leistung, Materialaufschläge, bevorzugte Materialien, Angebotstexte.
  - Worked example: he corrects the time for a Zählerschrankerneuerung; the assistant asks „Soll ich mir für Zählerschrankerneuerungen 6 statt 4 Stunden merken?“; only after „Ja“ the rule is written and used.
  - Viewable, editable, deletable in the document or by message; Änderungsprotokoll; older versions from the cloud's history.
  - Prices: the AI picks positions and quantities, a fixed calculation step computes with his rules and purchase prices. Customers, articles and prices stay in his invoicing software, not duplicated in the brain.
- **Stufe 3 Angebote und Rechnungen** (worked example sevDesk; named alongside: Lexware, Label, TopKontor „und andere Handwerkersoftware“):
  - Customer and article matching; asks on multiple hits or a new customer.
  - Quote as a draft in the software; accepted quote → invoice draft after approval.
  - Abschlags-, Teil- und Schlussrechnungen via the software's own functions.
  - § 35a EStG: Material und Arbeitskosten in separate sections.
  - Sending only after approval.
  - One honest line: the connection needs a software tariff with an interface; which one fits is checked together first.

### Page 5: Stufe 4 Großhandel

### Page 6: Stufe 5 Ausbau + Schluss

(Content of pages 5 and 6 below, split at Stufe 5. If page 4 ends up too sparse, the builder may pull the interface explanations into a small panel; if any page still feels full, shorten copy rather than shrink type.)

- **Stufe 4 Großhandel** (worked example ELDIS; named: Sonepar, Rexel, Obeta, FEGA & Schmitt, Alexander Bürkle):
  - Wholesalers offer industry interfaces: Datanorm (article catalogue), IDS Connect (basket and order), OpenMasterData (article data and prices on demand). Explain each in one plain line.
  - Article search with everyday words („Wallbox 11 kW“).
  - His purchase prices into the quote; markups from the Betriebsgehirn; internal view shows Einkaufspreis, Aufschlag, Regel, the customer sees only the selling price.
  - Orders and matching delivery notes / incoming invoices against the order.
  - Availability: not delivered automatically by every interface, checked per wholesaler.
  - „Welche Schnittstelle dein Großhändler anbietet, klären wir vor dem Start.“
- **Stufe 5 Ausbau** (each a new tool on the same assistant, same brain):
  - Nachkalkulation: hours and material by voice, compared to the quote, insights into the brain.
  - Telefonassistent: takes missed calls via call forwarding; announces itself as an AI assistant, as the KI-Verordnung requires.
  - Anfrageformulare on his website (Elektroinstallation, Zählerschrank, Wallbox, PV) with follow-up questions and file upload.
  - Terminbuchung with calendar check, travel times, buffers, reminders.
- **Schluss:**
  - Ownership: „Alles gehört dir: Konten, Daten, Doku. Hörst du mit mir auf, läuft es weiter.“ Workflows exported and documented, any n8n developer can take over.
  - Proof by shape only: „Für einen Hausmeisterservice läuft ein Sprachassistent nach diesem Muster.“
  - One soft next-step sentence in Ajdin's voice, Agentur-Bauplan style (e.g. „Wenn du magst, schauen wir zusammen, welche Stufe bei dir zuerst dran ist.“), plus contact line (ajdin@vrelo-ki.de · vrelo-ki.de · phone as on the Power-Connect PDF). No price, no package, no other CTA.

## 5. Decisions taken in the conversation (2026-10-29)

- Segment: Elektriker first; ELDIS is the worked wholesaler example, others named.
- Invoicing: sevDesk as the example; Lexware, Label, TopKontor named.
- Statistic: the verified HWK Dortmund 61 %, labelled as Bürokratie.
- Page 1: landing-page style, layout B (Heute | Mit), stages as numbered list, rest kept.
- Detail pages: outline in §4 approved by Ajdin.
- Five pages instead of four: room over density (Ajdin, after the builder check).
- **First PDF review (Ajdin, 2026-10-29):** the PDF is a free guideline the reader could follow on his own, not an offer. No first-person service lines (no „mit mir“, „binde ich“, „prüfen wir“); guidance in du-form instead („Prüf vorher …“, „Frag vor dem Start …“, „Mit jedem Dienstleister, der dein System baut oder betreut, schließt du einen Auftragsverarbeitungsvertrag.“). The only ask is the closing **„P.S. Bei Fragen von deiner Seite melde dich einfach bei mir.“** (also in the later e-mail); it replaces the soft next-step sentence. One stage per page → 6 pages. The end goal stays the call.
- **„So gehst du vor“ box (Ajdin, 2026-10-29):** every stage page ends with three concrete next steps the reader can take himself (guideline voice, no Vrelo in them). Page 2 was shortened to fit it (one bullet and one intro sentence out), the proof line on page 6 keeps only its first sentence.
- **Review 3 (Ajdin, 2026-10-29):** shorter sentences and bullets on every page so the reader is not overwhelmed at first glance; the pain on page 1 becomes its own dark band right under the headline (left: „Kennst du das?“ with three short lines about the evening and the weekend; right: the 61 % statistic with its source). Order on page 1 is now headline, pain band, subline, Heute | Mit, stages, rules. §4 drafts above are superseded where the template is shorter.
- **Review 4 (Ajdin, 2026-10-29):** page 1 also shows the solution as its own band („Die Lösung: Dein KI-Büroassistent“, one line of promise, a four-step strip: einsprechen, verstehen, vorbereiten, freigeben) between the pain band and Heute | Mit. Pages 2 to 6 go back to the detailed review-2 text with the „So gehst du vor“ boxes; only page 1 keeps the shorter review-3 copy. Page 1 is `min-height`, so an overflow becomes a seventh page the gate catches instead of being clipped.
- **Review 5 (Ajdin, 2026-10-29):** subheadline „Dein Bauplan zum Selbstbau: der eigene KI-Büroassistent“ (Selbstbau: the reader could build it himself). The P.S. stands at the very end of the PDF, after the contact details (Ajdin, review 6) between the pain band and the solution band; it replaces the band’s kicker „Die Lösung: Dein KI-Büroassistent“.
- Distribution later: landing page per recipient + e-mail, like the Agentur-Bauplan.
- du-Ansprache (brand voice; Ajdin kept it after seeing the mockup).

## 6. Facts the copy must stay inside (verified 2026-10-28/29)

- **61 %:** HWK Dortmund, Presseinformation 57/2023, 26.10.2023, Sonderumfrage bei rund 700 Unternehmern im Kammerbezirk: „Der Mehraufwand durch Bürokratie bedeutet für 61 Prozent der Befragten, dass ihnen weniger Zeit für die Bearbeitung von Aufträgen bleibt …“. Source URL: https://www.hwk-do.de/wp-content/uploads/2023/10/HWK-Pressedienst-57-Konjunktur-Sonderumfrage_Buerokratiebelastungen-im-Handwerk.pdf. Regional, about bureaucracy: never generalise to „alle Elektriker“ or to office work in general.
- **Wholesaler interfaces:** ELDIS/Obeta: IDS Connect 2.5, Datanorm, OpenMasterData confirmed. Sonepar, Bürkle, Zajadacz: IDS Connect confirmed via Handwerkersoftware tutorials. Rexel, FEGA & Schmitt: interface not confirmed → name them as wholesalers, never claim a specific interface for them. Phrase as „viele Elektrogroßhändler bieten …“, never „alle“.
- **Live customer net prices via OpenMasterData** are not yet confirmed for a non-certified integration → say „deine Einkaufspreise über die Schnittstelle deines Großhändlers“, not „live bei jedem Großhändler“.
- **Invoicing APIs:** sevDesk API only in the tariff with interface (Buchhaltung Pro). Label/TopKontor interface not verified → the honest line in Stufe 3 covers it.
- **AI location:** always „innerhalb der EU“, never a city. Microsoft: do not claim Claude specifically on Azure in the EU.
- **Telegram:** no AVV.

## 7. Deliverables and where they live

- Template: `Website/content/bauplan/elektro-bauplan.html` (next to the Agentur-Bauplan).
- Render: kit renderer, same pipeline as `scripts/build-bauplan-pdf.mjs` (extend it with a template argument or add a sibling script; builder's call). Output for the later landing page: `public/bauplan/elektro-bauplan-<hash>.pdf` **only when the landing page is built**; for now render to a review copy.
- Shareable clean-named copy: `Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf` (same convention as `Agentur-Bauplan-Vrelo.pdf`); never a clean-named copy in `public/`.
- One line in the HQ `CLAUDE.md` §2.2 index once approved.

## 8. Done means

- 6 pages, page 1 matches the approved mockup layout, no orphan headings, no page with only a few lines, no page filled edge to edge.
- Copy checks pass on the template: no en/em dash, no „, und“, German quotes, no price/duration strings (€, „Euro“, „Wochen“, „Tage“ as durations).
- stop-slop pass done.
- Ajdin reviewed the rendered PDF and approved it before anything is committed.

## 9. Left to the builder

- Visual details inside the kit's `brand.css`, flow-strip styling, how the worked scenes are set off (quote box or tinted panel).
- Exact wording within §4 direction and §6 limits.
- Whether to extend `build-bauplan-pdf.mjs` or add a script.

## Addendum 2026-10-30: the offer (Ajdin)

Reverses the „guideline, not an offer“ rule for one place only. The landing page gets a last section `#angebot` after the form, the PDF a 7th page, both with the same copy (`angebot` in `src/lib/elektroBauplanPage.ts`): headline „Keine Zeit zum Selbstbauen? Ich baue ihn dir mit Geld-zurück-Garantie.“, directly under it the proof as its own band („Ein Hausmeisterservice arbeitet schon damit: Der Inhaber spart jeden Tag zwei Stunden Büroarbeit.“, Mirsad-confirmed; no intro text), four steps (one hour together · first results after 2 days · then step by step, each block tested by Ajdin · the reader tests last, the final invoice only when it fits), the guarantee („Erfüllt der Assistent deine Anforderungen nicht, bekommst du deine Anzahlung zurück.“), and a soft ask: „Du hast Fragen? Dann lass uns eine halbe Stunde sprechen.“ with a button to `/kontakt?src=bauplan-elektro` (PDF: `bauplan-elektro-pdf`). No price, no timeline beyond the 2 days (internally 2 to 3 weeks for the full build), no client names; the proof stays „ein Hausmeisterservice“. The closing P.S. of page 6 is gone, the contact block moved to page 7. Pages 1 to 6 stay a free guideline. The guarantee wording holds only with 50/50 payment.
