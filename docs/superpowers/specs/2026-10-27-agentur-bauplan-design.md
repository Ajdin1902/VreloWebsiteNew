# Agentur-Bauplan: unlisted blueprint page + PDF guide (design)

**Date:** 2026-10-27 · **Status:** approved by Ajdin 2026-10-27 (Velp line confirmed; Datenschutz: add both sections; back-page sentence stays) · **Owner:** Ajdin Dzafic
**Context:** HQ `CLAUDE.md` §7 (Walk-in-Runde, Agenturen), `Knowledge/Offers/agentur-paket.md`, `Knowledge/marketing/leads/agentur-profile.md`. Brainstormed 2026-10-27 with Ajdin; mockups in `.superpowers/brainstorm/1089-1793092929/content/blueprint-outline-v3.html`.

## 1. Intent

A **lead magnet for owner-led agencies** (social media, video, web, advertising). Ajdin sends the link after a first contact (LinkedIn message, walk-in, letter). The reader should come away thinking: *these people understand how an agency like mine works, and here is the plan for taking the busywork off my plate.*

The page is a gift. It asks for nothing except, optionally, an e-mail address to receive the PDF guide. The PDF is the implementation guide: principles for mapping and connecting the agency's own process, with blank worksheets.

**Why now:** the first agency contact is out (Local Stories, 2026-10-27); more follow one by one. The red-team's most likely deal-killer for the Agentur-Paket is „it doesn't exist yet“ (§16 #1). The blueprint is the concrete thing to point at.

## 2. Goals, non-goals, anti-goals

**Goals**
- One neutral blueprint that any owner-led agency recognises itself in (examples from shoots, website builds, campaigns).
- The message: the client relationship is the core of the agency; Vrelo only automates the tasks that don't serve that core.
- The reader *feels* the end result (the *Merak*-Effekt) at the end of the page.
- Optional PDF by e-mail, sent automatically on request.

**Non-goals**
- No price, no package name, no call-to-action for a call. The reader comes to the conversation on their own.
- No newsletter sign-up from this page.
- Not a tool manual: the PDF gives principles and worksheets, not n8n/HubSpot instructions.
- Not a public page: not in the sitemap, not linked from the site, `noindex`.

**Anti-goals (failure even if it works)**
- Naming Velp or Alen, or showing anything Velp-specific (texts, phases, templates). Velp appears only by shape: „eine Videoagentur in Regensburg“ (Agentur-Paket §6.2/§12).
- Claiming the whole blueprint already runs anywhere. Only the project documentation is live; the rest is in build.
- Hype register, exclamation marks, „KI“ as magic. Brand.md wins.
- Collecting more than an e-mail address.

## 3. Constraints

- **Brand:** `Website/Brand.md`. Papier background, Plus Jakarta Sans, *Vrelo*/*Merak* in Fraunces italic via `<BrandWord>`. „du“ throughout. German quotes „…“. **No Gedankenstrich** in German copy (no en-dash, no em-dash; HQ §9). **No comma before „und“.** Generic masculine.
- **Prose:** page copy and PDF copy go through the `stop-slop` skill before shipping (HQ §8).
- **Public-price rule (HQ §4):** no Vrelo price, no competitor name.
- **Art. 50 KI-VO:** the page describes AI drafts („Entwurf, dein Team entscheidet“); no AI-generated images on the page (HQ §4, 2026-10-01 decision: real or none).
- **DSGVO:** the e-mail address is processed to send the PDF once and to notify Ajdin. No marketing consent is implied. The Datenschutz page gets a section for it (same pattern as the Prozess-Check section). Mail goes through Resend (already a listed processor).
- **UWG § 7:** sending the PDF is fulfilment of the reader's own request, not advertising. Any later follow-up by Ajdin is a personal message, not automated.
- **Copy-guard tests** in `Website/` (dash-free, no comma before „und“, „rund 30 €“) must stay green; the new page's copy should be covered by the same guards where the test harness allows.

## 4. The page

**Route:** `/bauplan/[code]` where `code` is a single configured secret slug (env `BAUPLAN_CODE`, e.g. `agentur-7k3m`). Any other value → 404. Changing the env value invalidates an old link. **Builder's call:** implement as a dynamic route reading the env, or as a static route whose path is renamed when needed; the dynamic version is preferred because rotation then needs no deploy of code.

**Metadata:** `robots: { index: false, follow: false }` (as `/karte`); not in `sitemap.ts`; not linked from any navigation, footer or page. Add a `robots.test.ts`/`sitemap.test.ts` assertion that the route is absent from the sitemap.

**Layout (Claude's call after builder check):** a **focus route** like `/prozess-check`: logo-only header, minimal footer with Impressum/Datenschutz only. The normal header carries the Prozess-Check CTA and the footer carries the newsletter form, both of which this page must not show. `focusRoutes` in `src/lib/nav.ts` and `ChromeGate` match exact paths today; the dynamic `/bauplan/<code>` path needs a prefix match (extend `nav.ts` + its tests). The page itself is single-column, phone-first, max-width ~720 px for text and full width for the station strip.

**Sections, top to bottom (copy is draft; final copy after `stop-slop`):**

1. **Kicker + headline + lead**
   - Kicker: „Bauplan für Agenturen“
   - H1: „Deine Agentur lebt von der Beziehung zu deinen Kunden. Dieser Bauplan nimmt dir das Drumherum ab.“
   - Lead: „Ob Shooting, Website oder Kampagne: Hier steht, welche Handgriffe zwischen Zusage und Abschluss von allein laufen können und welche bei dir bleiben.“
   - Origin line (amber left border): „Entstanden ist dieser Bauplan bei meiner Arbeit mit einer Videoagentur in Regensburg. Ich habe ihn so konzipiert, dass er für jede Agentur passt.“

2. **Das Fundament: dein Kunde** (warm block, Sonnenlicht background)
   „Verstehen, was der Kunde will. Erstgespräch, Briefing, die kreative Arbeit, das Feedback-Gespräch. Das bleibt bei dir und deinem Team. Alles darunter dient diesem einen Ziel.“

3. **Der Weg eines Kunden, Station für Station**: five stations, each a card with four lines. Examples deliberately mix agency types.

   | Station | Beispiele | Heute | Im Bauplan | Bleibt bei dir |
   |---|---|---|---|---|
   | Angebot | Shooting-Paket · Website-Relaunch · Kampagne | von Hand geschrieben, Nachfassen nach Gefühl | aus den Deal-Daten gebaut, du gibst mit einem Klick frei, Erinnerung nach 5 und 12 Tagen | der Preis, das Gespräch, die Freigabe |
   | Onboarding | Drehort und Zielgruppe · Seitenstruktur und Logos · Zielgruppe und Budget | Willkommensmail von Hand, Antworten abgetippt | Fragebogen geht nach dem Ja raus, Antworten landen im Kundenordner und auf der Projektkarte | das Onboarding-Gespräch |
   | Skripte | Reel-Skript · Imagefilm · Erklärvideo | leere Seite | Entwurf aus den Onboarding-Antworten, im Stil deiner Agentur | die Idee, der Feinschliff, die Entscheidung |
   | Texte | Captions · Ad-Copy · Website-Texte | jedes Mal neu | Entwürfe im Stil deiner Agentur | dein Team entscheidet, was rausgeht |
   | Projektdoku | Dreh → Schnitt → Feedback · Design → Entwicklung → Launch · Setup → Laufzeit → Report | Board von Hand nachziehen, Fristen im Kopf | jede Phase legt ihre Aufgaben mit Frist an, die Karte rückt weiter, wenn alles erledigt ist | das Feedback-Gespräch, die Abnahme |

   Below the strip, one sentence: „Läuft in den Programmen, die du schon hast.“ (tools unnamed on the page).

   **Velp line (settled from Agentur-Paket §6.2, Ajdin 2026-10-22):** general mechanics travel (task-per-phase with deadline, questionnaire into the client folder, approval click, follow-up cadence); Velp's texts, templates, phase names, tools and data do not. The 5/12-day follow-up cadence is the package design (Agentur-Paket §4), not a Velp setting, and stays. Phase names on the page and in the PDF are generic per agency type (Dreh → Schnitt → Feedback; Design → Entwicklung → Launch; Setup → Laufzeit → Report), never Velp's list or board names. No ClickUp/HubSpot/sevDesk named anywhere.

4. **So fühlt es sich an: der *Merak*-Effekt** (warm block, the emotional close). Six short statements, Ajdin's words:
   - Deine Kunden sind zufrieden. Das Angebot kommt schnell, jeder Schritt kommt pünktlich.
   - Dein Team macht die Arbeit, die Spaß macht: drehen, gestalten, schreiben.
   - Du nimmst mehr Kunden an, ohne dass es im Büro eng wird.
   - Du siehst jederzeit, wo jedes Projekt steht.
   - Nichts geht verloren. Jeder Schritt ist dokumentiert.
   - Alles läuft ruhig.

5. **PDF offer** (bordered card, the only form on the page)
   - Title: „Den Bauplan als PDF“
   - Text: „Mit den Prinzipien, wie du ihn in deiner Agentur umsetzt, und Platz für deine eigenen Phasen. Ich schicke ihn dir per Mail.“
   - Fields: e-mail (required), honeypot, renderedAt (same anti-spam as Prozess-Check). **No consent checkbox** (fulfilment of their request); one line under the button: „Du bekommst nur diese eine Mail. Datenschutz: /datenschutz“.
   - Button: „PDF zuschicken“
   - Success state (inline, no redirect): „Ist unterwegs. Schau auch im Spam-Ordner nach.“
   - No call CTA anywhere on the page.

## 5. The PDF guide

**Format:** branded A4 PDF, rendered **offline on Ajdin's machine** (not in the Vercel build) from an HTML template with `Clients/_kit/brand-pdf/render-doc.mjs` (same pipeline as the Prozess-Einseiter), committed as a static asset to `Website/public/` under an unguessable filename (e.g. `/bauplan/agentur-bauplan-<hash>.pdf`) **and** attached to the e-mail. Serving it only as an attachment would be stricter, but a static file lets the e-mail stay small and the link in the mail is enough; **builder's call** whether to attach, link, or both (attach + link preferred).

**Length:** 6 to 8 pages. Not a one-pager (the `creating-process-one-pagers` skill is the wrong shape here); the kit's `render-doc.mjs` handles multi-page.

**Structure:**

1. **Cover + one paragraph:** what this is (the blueprint from the page, plus how to implement it), who it's for, the one rule: *start with one station, not all at once.*
2. **Das Fundament** (same as the page, half a page).
3. **Prinzip 1: Jede Phase abbilden.** One profile per phase, always the same fields:
   - **Input:** was kommt rein, von wem, in welcher Form
   - **Output:** was muss am Ende da sein
   - **Wer** macht es
   - **Was** ist zu tun (die Schritte)
   - **Start / Ende:** woran erkennst du, dass die Phase beginnt und fertig ist *(Claude's addition)*
   Worked example (one agency type, e.g. Dreh → Schnitt), then **a blank profile page** with the fields as fillable boxes (two or three blank profiles).
4. **Prinzip 2: Die Phasen verbinden.** Output of one phase = input of the next. Then the tool inventory:
   - Programm · wofür (Kunden, Projekte, Rechnungen, Dateien) · was es schon selbst kann · lässt es sich anbinden, und was braucht das (Tarif mit Schnittstelle, Konto, Zugang)
   - *Claude's additions as principles:* „Erst prüfen, was dein Programm schon kann“ (Bordmittel rule, HQ §8) and „Ein Programm hält die Kundendaten, alle anderen holen sie sich dort“ (KI-Betriebssystem, one system of record).
   - Worked example + **a blank tool table** to fill in.
5. **Prinzip 3: Der Blick drauf.** For each step a person checks: who, what to look out for, what already lives in their head (that's their job, they know it). *Claude's addition:* „Nichts geht an den Kunden ohne den Klick eines Menschen.“ Worked example + blank lines per phase („Wer prüft · worauf“).
6. **Prinzip 4: Nachschärfen.** Over time the process and the automation get more examples and new inputs (more past scripts, a new project type, a new phase) and are adjusted. Short, half a page, with a blank „was fehlt noch“ box.
7. **Der ganze Weg auf einer Seite:** the whole workflow start to finish, every phase with Input · Output · Wer · Was, as one overview page, filled with the worked example; followed by **the same page blank**.
8. **Back page:** one paragraph in Ajdin's voice (first person, calm), contact line, Datenschutz reference. No price, no package, no call CTA beyond „Wenn du magst, leg ich den Bauplan mit dir neben deinen Ablauf.“ Ajdin 2026-10-27: the sentence stays (the softest possible ask; the page itself has none).

**Worked examples:** rotate agency types across the principles (video shoot in 3, website relaunch in 4, campaign in 5) so each reader meets their own world at least once.

**Copy rules:** same as the page; all non-ASCII as HTML entities in the template (kit convention), dash-free check after render.

## 6. The e-mail flow

Mirrors `/prozess-check` (`src/app/prozess-check/actions.ts`, `src/lib/prozessCheckEmail.ts`): a server action, Resend, honeypot + minimum fill time, one branded mail to the reader and one internal notification to `CONTACT_TO`.

- **Reader mail:** subject „Dein Bauplan für Agenturen“; short body in Ajdin's voice (3 to 5 sentences), the PDF attached and linked; no further ask. Plain-text alternative included.
- **Internal mail:** subject „Bauplan angefordert: <email>“; body = address + timestamp + `src` if present. `replyTo` = the reader. This is the lead signal; Ajdin follows up by hand when it fits. Postfach-Assistent will pick the internal mail up like any other (no change needed there; **builder check:** confirm the subject pattern doesn't collide with an existing PA rule).
- **Source tag:** accept an optional `?src=` on the page URL (reuse `normalizeSource`) so Ajdin can tell which agency's link produced the request (e.g. `?src=ag01`). Keep it out of the reader's view.
- **Rate/abuse:** same honeypot/time guards; additionally cap sends per address to one per 24 h in memory is *not* required (serverless); accept duplicates.
- **Env:** `BAUPLAN_CODE` (page slug). Everything else reuses `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`. Vercel env must be set before merge; local `.env.local` for dev.
- **Attachment size:** keep the PDF under ~1 MB (no photos; vector logo only). Resend attachments are supported in the installed SDK (6.12.x); on Vercel read the file via its public URL, not `fs`. If the attachment path is awkward, link only.
- **PDF outlives code rotation (Claude's call):** the file under `public/` stays reachable at its unguessable name even after `BAUPLAN_CODE` changes. Acceptable: the PDF is the gift, and the file is `noindex` by never being linked publicly. Rotation protects the page, not the file.

## 7. Datenschutz page

There is **no Prozess-Check section today** (`src/lib/legal/datenschutz.ts` has Kontaktformular, E-Mail-Kontakt, Newsletter, Demo …). **Ajdin 2026-10-27: add both**, a „Prozess-Check“ section (result mail + internal mail via Resend, lit. b) and a section „Bauplan-PDF anfordern“, each modelled on **Kontaktformular**: purpose (sending the requested PDF once, and an internal notification), legal basis (Art. 6 Abs. 1 lit. b DSGVO, fulfilment of the request), processor (Resend, already listed), retention (the address stays in the mailbox / Notion like any other inbound mail; the Postfach-Assistent rule already covers it), no newsletter, no profiling. Same wording style as the existing sections.

## 7a. Copy review gate (Claude's call)

Order of work: page copy and PDF HTML template are drafted first, run through `stop-slop`, and **Ajdin reviews the rendered PDF preview before the file is committed** under its final name. Every later copy change means re-render, new filename, re-commit; the plan budgets one review round.

## 8. Tests (what „done“ means)

- Unit: server action parses/validates like Prozess-Check (honeypot, too fast, invalid e-mail); wrong `code` → 404; page absent from sitemap; metadata carries `noindex`.
- Copy guards: page copy and the PDF template pass dash-free + no „, und“ checks (extend the existing guard tests to the new files).
- Manual: `npm start`, open the page on a phone width, request the PDF with a real address, confirm both mails arrive (reader mail with attachment, internal mail), confirm PDF renders one clean page per section with no orphan headings.
- Vercel preview before prod; prod deploy only on Ajdin's go (memory: ask before pushing).

## 9. Left to the builder

- Exact Tailwind classes/components (reuse the site's card and section patterns; `BrandWord` for *Vrelo*/*Merak*).
- Whether the station strip is a horizontal scroll on phones or stacked cards (stacked preferred for readability).
- PDF template layout details inside the kit's `brand.css`; page breaks between principles.
- Where the HTML template for the PDF lives: proposed `Website/content/bauplan/agentur-bauplan.html` with a `npm run bauplan:pdf` script that calls the kit renderer (the kit lives in another repo; a relative path is acceptable since both sit under the HQ root, or copy `render-doc.mjs` minimal deps into `Website/scripts/`). **Builder's call**, documented in `Website/CLAUDE.md`.

## 10. Out of scope (later, if the page works)

- A version for Betriebe (SHK, Handwerk) with the 13 stations.
- Tracking page views (no analytics on this page beyond what the site already runs).
- Any automated follow-up sequence.
