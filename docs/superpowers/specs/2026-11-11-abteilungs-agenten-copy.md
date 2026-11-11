# Abteilungs-Agenten: website section (handoff, 2026-11-11)

Copy approved by Ajdin in chat on 2026-11-11. **Built 2026-11-11** as the separate page `/leistungen/ki-agenten` (Ajdin: own page, not in the nav, client names on the cards). Changes against the handoff below: Buchhaltung result reworded (see Decisions), no client names on the agents (Ajdin, same day), the agents sit on a ring around „Dein Betrieb“ with the tasks shown in the middle on click (new copy: „Dein Betrieb“, „Alle Agenten arbeiten mit denselben Daten.“, the click hint, „Zurück zur Übersicht“), the close uses the site button „Erstgespräch buchen“.

## What it is

A short section that shows the KI-Betriebssystem as one agent per company department. Each agent gets a simple name, two to four concrete bullet examples and one result line. The CTA books a 30-minute call where Ajdin shows more. The same text is reused in sales conversations.

## Placement (open, Ajdin decides)

Suggestion: a new section in the KI-Betriebssystem anchor of `/leistungen/ki-automatisierung`, just above the closing CTA. Since 2026-11-11 `/leistungen/ki-betriebssystem` 308-redirects there. Build on top of the unpushed branch `feat/leistungen-vorlagen-garantie`. Show it on localhost and ask before pushing, because a push to `main` deploys.

## Copy (German, final)

Six agents, in this order:

**Marketing-Agent**
- Schreibt Entwürfe für Posts, Newsletter und Anzeigen aus deinen echten Aufträgen
- Erstellt passende Grafiken dazu
- Bittet zufriedene Kunden um eine Google-Bewertung
- Wertet jede Woche aus, welche Anzeige Anfragen bringt

Ergebnis: Dein Marketing wertet sich selbst aus. Du gibst frei, was weiterläuft.

**Vertriebs-Agent**
- Antwortet auf neue Anfragen in wenigen Minuten, auch abends
- Fragt Bedarf, Zeitraum und Budget ab und sortiert ernsthafte Anfragen nach oben
- Schreibt den Angebotsentwurf und fasst nach drei und sieben Tagen nach

Ergebnis: Alles über einen Kunden steht in deinem CRM, bevor du zum Hörer greifst.

**Kundenservice-Agent**
- Schickt jedem neuen Kunden eine Willkommensmail mit der Liste der Unterlagen, die noch fehlen
- Erinnert, bis alles da ist. Jede Unterlage landet im richtigen Ordner.
- Beantwortet Fragen wie „Wann kommt ihr?“ sofort

Ergebnis: Neue Kunden sind startklar, ohne dass du hinterhertelefonierst.

**Projektdoku-Agent**
- Legt für jeden Auftrag Aufgaben und Fristen an
- Macht aus Sprachnachrichten und Baustellenfotos ein Protokoll
- Schiebt den Auftrag in die nächste Phase, sobald ein Schritt erledigt ist

Ergebnis: Dein Team arbeitet am Auftrag. Die Doku führt der Agent.

**Buchhaltungs-Agent**
- Schreibt die Rechnung, sobald der Auftrag abgeschlossen ist
- Erinnert höflich, wenn eine Zahlung ausbleibt
- Sortiert Belege und speichert sie im richtigen Ordner ab

Ergebnis: Kein Abtippen und Rumkopieren mehr bei Rechnungen. Das Geld kommt früher.

**Inhaber-Assistent**
- Beantwortet Sprachnachrichten wie „Welche Rechnungen sind offen?“
- Legt Termine und Notizen an und schreibt Mail-Entwürfe
- Schickt dir jeden Morgen ein Tagesbild

Ergebnis: Du behältst den Überblick, auch wenn du draußen bist.

**Abschluss**
Welcher Agent nimmt dir am meisten ab? In 30 Minuten zeige ich dir, wie das in deinem Betrieb aussieht.
Button: „Gespräch buchen“. Use the site's existing booking path with a new `src` (e.g. `src=agenten`). Check what the other CTAs use after the 2026-11-11 rebuild.

## Rules for the build

- Brand: du, generic masculine, „…“ quotes, no Gedankenstrich, no comma before „und“. Verify bytes after every write (the Edit/Write tools downgrade quotes). Run `stop-slop` on any copy you add.
- No prices and no Vrelo price anywhere in the section.
- The Inhaber-Assistent is the paid top floor. Never present it as a bonus or as included.
- Proof, if shown, is the built cases only:
  - Vertrieb = Postfach-Assistent, Velp angebot → signature
  - Kundenservice = Velp welcome mail
  - Projektdoku = Velp Phase-Engine
  - Buchhaltung = MDZ Rechnungsautomat
  - Inhaber-Assistent = MDZ Telegram-Assistent
  - Marketing has nothing built. Never attach a number that hasn't been confirmed.

## Decisions and risks Ajdin took knowingly

- **„Keine Fehler in deinen Rechnungen“** was an absolute promise and a UWG §5 risk. Ajdin replaced it on 2026-11-11 with „Kein Abtippen und Rumkopieren mehr bei Rechnungen.“ (`kiAgenten.test.ts` fails on „Keine Fehler“).
- **Marketing-Agent** contradicts CLAUDE.md §3 („Menü-Erweiterung verworfen 2026-07-28“: no Social) and the rule that lead generation stays off-strategy for clients. Ajdin keeps it. When it ships, record the reversal in HQ CLAUDE.md §3.
- For a later Marketing build, the Marketing-Automation-Blueprint (2026-11-10) is binding: v1 proposes and a person confirms; generated images only as text on non-realistic backgrounds.
- **Vertriebs-Agent** builds need bot disclosure in the first reply (Art. 50 KI-VO). This belongs in the build, not in this copy.

## On hold (not on the page)

- **Personal-Agent.** If it comes back, it may only confirm, schedule and file. Filtering or ranking applicants is EU AI Act Annex III high-risk.
- **Dispositions-Agent.** Parked by Ajdin.
