# Claude Design prompts: Leistungs-Grafiken, the other eight pages

> How to use: work in the existing Claude Design project „Leistungsgrafik KI-Automatisierung“, so the drawn icons and the style carry over. Paste **message 0** once, then one page brief per message (one new file per page, file name given in each brief). Ask for the three variants each time, pick one, send me the link: I rebuild the pick as inline SVG in `GrafikBlock.tsx` and add the page's `grafik` entry in `leistungenPages.ts`. The heading above each graphic comes from the code, never from the drawing; the proposed headings are listed per brief so you can judge drawing and heading together. Built so far: KI-Automatisierung (variant A Fluss). No Gedankenstrich in this file, so nothing leaks into the labels.

Order I suggest (most visited and most abstract first): Prozessautomatisierung, KI-Betriebssystem, KI-Server, Prozess-Audit, Betreuung, Claude, KI-Beratung, KI-Schulung.

---

## Message 0: the series rules (paste once)

We are turning the KI-Automatisierung graphic into a series: one graphic for each of the nine service pages on vrelo-ki.de. Each one has the same job: after five seconds the reader remembers what the service does, without reading a paragraph. The reader is a business owner who distrusts tech and skims.

Keep everything that worked in `Leistungsgrafik KI-Automatisierung.dc.html` (variant A Fluss) and treat it as the style reference for the whole series:

- Same canvas: desktop 1200 x 420, mobile 360 x 640 (stacked top to bottom), background Papier `#F4EFE6`, one inline SVG per format, every label as live `<text>`, no raster.
- Same palette and roles: Tiefes Wasser `#0A2538` for the central node and stage titles, Vrelo Petrol `#1B5063` for lines and outlines, Gletscher `#DCE7EB` for tidy fills, Faden `#D4CCBC` for anything messy or not yet sorted, Stumm `#696359` for small labels, Amber `#D4A24C` as the single warm accent, used once per graphic for the moment the reader should remember (the payoff).
- Same vocabulary: the dark rounded square as the "system" node, thin 1.75 px petrol connectors with soft curves, outline icons (reuse `vr-env`, `vr-doc`, `vr-voice` where they fit and draw new ones in the same hand), tidy cards with label rows, the amber circle with a check for approval or done.
- Same type: Plus Jakarta Sans, stage titles 18 to 20 px weight 600, labels 14 to 16 px weight 500, German only, exactly the words given in the brief. No headline or sentence inside the graphic.
- Same reading direction: left to right on desktop, top to bottom on mobile, at most three or four stages.
- Same bans: no robots, brains, sparkles, glowing circuits, people, hands, faces, emojis, logos of real products (no Anthropic, Claude, Microsoft or Google marks), no gradients, shadows or 3D.
- Contrast at least 4.5:1 for every label against Papier, labels at least 14 px on mobile.

For each page brief that follows, make one new file with three variants (desktop plus mobile each) and after them say in two sentences which one is easiest to remember. Wait for the first brief.

---

## 1. Prozessautomatisierung

File: `Leistungsgrafik Prozessautomatisierung.dc.html`
Heading on the page (from code): Einmal festgelegt, läuft es jedes Mal gleich.

The idea: fixed rules. One trigger starts the same chain of steps every time, across several programs, and a timer catches what stays lying around. It is the counterpart to the KI graphic: there the inputs were messy, here they arrive in the same shape every time, so plain rules are enough. Make that visible: the input items are identical and aligned from the start.

Stages:
1. `Anfrage kommt rein`: a form card (new icon: a card with two input lines and a small button), drawn tidy, not messy.
2. `Feste Regel`: the dark system node, with a small `Wenn` / `dann` mark or a switch symbol inside, no gears.
3. `Läuft von allein`: three action cards side by side or stacked: `Kontakt angelegt`, `Eingang bestätigt`, `Zuständiger informiert`. Below them a small clock icon with `Nach 2 Tagen: Erinnerung`.
Amber: one small check on the Zuständiger card (the moment the request lands with the right person).

Variants: A a straight assembly line with the three actions as stations, B a fan from the rule node into the three actions with the clock as a loop back, C a repeated row: the same chain drawn three times in a stack, faint, to show it runs every time.

## 2. KI-Betriebssystem

File: `Leistungsgrafik KI-Betriebssystem.dc.html`
Heading on the page (from code): Alles fließt an eine Stelle.

The idea: many inputs, one place where everything about the business is true, and everything else builds on that place. Information arrives in the mailbox, the chat, the CRM, forms and meetings; it is captured with its source into one store; automations and an assistant work from that same store. This is the water brand at its clearest: tributaries into one source.

Stages:
1. `Kommt überall an`: five small outline icons spread loosely: `Postfach`, `Chat`, `CRM`, `Formular`, `Termin`.
2. `Eine Stelle`: a larger central shape (a rounded basin or a tidy card stack, Gletscher fill) where every incoming line ends; small tag on the incoming items: `mit Quelle`.
3. `Alles baut darauf auf`: three outputs drawing from the store: `Automatisierung`, `Fristen und Aufgaben`, `Assistent`. The assistent shows a short question chip `Was ist bei Huber offen?` and an answer line coming from the store.
Amber: the central store's outline or a small amber marker on it (the place that makes it work).

Keep it consistent with the existing Haus one-pager (the 13 stations), but do not draw the house here: this graphic only shows the principle "everything into one place, everything out of it".

Variants: A tributaries into a basin with three channels out, B a hub with spokes in and out, C three horizontal layers: Erfassen, Eine Stelle, Nutzen.

## 3. KI-Server

File: `Leistungsgrafik KI-Server.dc.html`
Heading on the page (from code): Die KI kommt zu deinen Daten.

The idea: for sensitive data the KI runs on a server that belongs to the client, and the model computes inside the EU. Nothing leaves the boundary. The memorable picture is the boundary itself: two nested frames, the outer dashed one labelled `Innerhalb der EU`, the inner solid one labelled `Dein Server` with a small key icon and `auf deinen Namen`.

Inside the inner frame, a short flow: `Unterlagen hochladen` (doc icon) to the dark system node `KI prüft` to a folder icon `Dein Ordner`. A request for missing documents loops back out to the customer as a small envelope labelled `Fehlendes nachfragen`, which is the only line that crosses a frame, and it goes to the client's own customer, not to a third party.
Amber: the key icon (ownership).

Avoid any locks with keyholes, shields with checkmarks, padlocks on clouds or "secure" clichés, and never draw a cloud provider logo or a map of Europe with flags.

Variants: A nested frames with the flow inside, B the same as a top down "floor plan" of a room, C minimal: just the two frames and the KI node, with three small icons inside.

## 4. Prozess-Audit

File: `Leistungsgrafik Prozess-Audit.dc.html`
Heading on the page (from code): Wir fangen dort an, wo die meiste Zeit verloren geht.

The idea: the audit finds the one task that costs the most time, and that is where the work starts. Draw it as a calm horizontal bar chart of five everyday tasks, bars in Faden, sorted from longest to shortest, no numbers and no axis values (they would read as a promise): `Anfragen beantworten`, `Rechnungen übertragen`, `Termine abstimmen`, `Angebote schreiben`, `Nachfassen`. The longest bar is Amber with a small label beside it: `Hier fangen wir an`.

A second, small element under or beside the chart shows the order of the audit as three tiny steps: `30 Minuten Gespräch`, `Genauer Blick`, `Fahrplan, wenn es sich lohnt`. The words "wenn es sich lohnt" must stay: the plan is not promised to everyone.
Amber: only the longest bar.

Variants: A bar chart with the steps as a thin timeline underneath, B the bars as a stack of cards with the top one pulled out, C a single row of five task tiles of different sizes (size = time), the largest highlighted.

## 5. Betreuung und Wartung

File: `Leistungsgrafik Betreuung.dc.html`
Heading on the page (from code): Ich merke es zuerst.

The idea: monitoring that provably alerts. A system runs through the night, a connection breaks, the alarm reaches Ajdin (not the customer), he fixes it and lets the stuck items run again, all before the working day starts. Draw it as one calm timeline from left (night) to right (morning) with a steady petrol line that runs flat, dips once, and returns.

Markers on the line: `Läuft`, a small break at the dip labelled `Verbindung bricht ab`, a bell icon just after it `Alarm kommt bei mir an`, a wrench or a small repair mark `Behoben, Vorgänge laufen nach`, and at the right end `Arbeitsbeginn`. Time hints under the axis as words only: `Nacht`, `Morgen`. No clock times, no percentages.
Amber: the repaired point after the dip (the moment it is fixed).

Avoid medical heartbeat or ECG shapes; the line is a quiet water level, not a pulse.

Variants: A one timeline with markers, B the same as a loop (läuft, Alarm, behoben, läuft), C three small panels side by side: Nacht, Alarm, Morgen.

## 6. Claude für Unternehmen

File: `Leistungsgrafik Claude.dc.html`
Heading on the page (from code): Einmal eingerichtet, für das ganze Team.

The idea: before, everyone uses KI on their own and gets different results; after, one shared workspace knows the business (services, prices, templates, rules) and every request comes out in the company's tone. Draw the shared workspace as one tidy card in the middle (dark node or a Gletscher card with a small label `Euer Projekt`), fed from the left by four knowledge cards: `Leistungen`, `Preise`, `Vorlagen`, `Regeln für Daten`. To the right, three outputs in identical style: `Angebot`, `E-Mail`, `Zusammenfassung`, all marked `in eurem Ton`.

Do not draw the Claude or Anthropic logo, no chat bubbles with faces. The product name only appears as plain text if needed, and it is not needed: keep the drawing product neutral.
Amber: the small `in eurem Ton` marker that the three outputs share.

Variants: A knowledge in, workspace, same-style outputs out; B before and after: left half shows three scattered chat windows with mismatched outputs in Faden, right half the one workspace; C a single card with the four knowledge tabs and the three outputs fanned below.

## 7. KI-Beratung

File: `Leistungsgrafik KI-Beratung.dc.html`
Heading on the page (from code): Aus vielen Ideen wird ein erster Schritt.

The idea: the owner arrives with many ideas and offers about KI and no first step. The free conversation sorts them: what pays off, what does not, what comes first. Draw many small idea cards scattered on the left in Faden (short words: `Chatbot`, `Rechnungen`, `Social Media`, `Angebote`, `Termine`, `Agent`), a calm sieve or narrowing shape in the middle labelled `Lohnt es sich?`, and on the right one amber card `Erster Schritt` with two faint cards behind it `Danach` and `Später`.

Two of the scattered ideas visibly fall away (drop down, greyed), so the reader sees that saying no is part of the advice.
Amber: the `Erster Schritt` card only.

Variants: A scatter, sieve, one card; B a funnel drawn as converging lines; C a list of six ideas where four are crossed out quietly, one highlighted, one kept for later.

## 8. KI-Schulung

File: `Leistungsgrafik KI-Schulung.dc.html`
Heading on the page (from code): Jede Aufgabe wird zu einer Vorlage.

The idea: the team learns on its own real tasks, and each session leaves a reusable template the team uses the next day. Draw a short loop or staircase of three stages: `Echte Aufgabe` (a doc icon from the team's day) to `Vorlage gebaut` (a tidy card with label rows and a small bookmark) to `Am nächsten Tag im Einsatz` (the same template used three times, small copies). An arrow returns from the last stage to a new `Nächste Aufgabe`, so the reader sees it repeats. Optionally a small shelf that fills with templates over the loop.
Amber: the finished template card.

Variants: A a loop of three stages, B a staircase going up with one template per step, C a shelf that fills from left to right, one template per session.
