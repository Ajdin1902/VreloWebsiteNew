# Homepage-Sektion „Läuft mit deinen Werkzeugen" — Design

**Datum:** 2026-08-12
**Status:** Spec, freigegeben zur Planung
**Betroffenes Repo:** `Website/`

## Ziel

Eine ruhige Homepage-Sektion, die dem Besucher die stille Sorge nimmt:
*„Muss ich mein CRM / meine Programme wechseln oder etwas Neues lernen?"*
Antwort: **Nein — du behältst die Werkzeuge, die du schon nutzt; ich baue die
Automatisierung darum herum.**

Das ist die **kalme** Fassung der ursprünglichen Idee (einer durchlaufenden
Logo-Karussell-Leiste). Bewusst **kein** Karussell und **keine** echten Logos:

- Ein rotierendes Logo-Band ist die Signatur der Hype-„KI-Agentur" — genau der
  Foil, gegen den Vrelo sich positioniert (Brand.md: *Ruhe vor Hype*;
  CLAUDE.md §3a Foil-Liste). Es verkauft Mechanik statt Ergebnis.
- Echte Fremd-Logos (HubSpot, Microsoft, Google, onOffice, sevDesk …)
  suggerieren eine Partnerschaft/Empfehlung, die nicht besteht — ein reales
  Marken-/UWG-Risiko im DACH-Markt.
- „Integrationen" würde ein fertiges, getestetes Produkt je Werkzeug behaupten.
  Ehrlich ist „läuft mit den Werkzeugen, die du schon nutzt".

## Einordnung / Abgrenzung

- **Homepage**, direkt **nach `WasIchBaue`** und **vor `Steps`**. Lesefluss:
  *das nehme ich dir ab* (WasIchBaue) → *und du behältst deine Werkzeuge*
  (Werkzeuge) → *so läuft es ab* (Steps).
- **Keine Dopplung** mit `makler/Voraussetzungen`: dort werden zwei andere
  Einwände geklärt („muss ich Technik *kaufen*?" / „bin ich *gebunden*?").
  Diese Sektion klärt den Einwand „muss ich meine bestehenden Werkzeuge
  *wechseln*?". Komplementär, nicht überlappend.
- Nur Homepage (Entscheid). Nicht auf `/makler` oder `/leistungen`.

## Inhalt (deutsche Copy — Brand-Voice)

- **Überschrift:** „Läuft mit den Werkzeugen, die du schon nutzt.“
- **Subline:** „Du wechselst nichts und lernst nichts Neues. Ich baue die Automatisierung um das herum, womit du heute schon arbeitest.“
- **Werkzeug-Raster — Namen als Text, keine Logos, leicht gruppiert** (wirkt
  überlegt statt als Aufzählung). Nur genuin anbindbare Werkzeuge (hält die
  Aussage ehrlich):
  - **E-Mail & Kalender:** Outlook · Gmail · Google Kalender
  - **CRM & Kontakte:** onOffice · HubSpot · Pipedrive
  - **Aufgaben & Ablage:** ClickUp · Notion · Google Sheets
  - **Rechnung & Buchhaltung:** sevDesk · lexoffice · DATEV
- **Ruhiger Auffang-Satz** unter dem Raster: „Und viele weitere – wenn dein Werkzeug eine Schnittstelle hat, lässt es sich meist anbinden.“ (Ehrlich,
  keine Partnerschaft behauptet, keine aufgeblähte Zahl.)

Alle Werkzeuge haben eine öffentliche Schnittstelle (DATEV/lexoffice per API,
kein nativer n8n-Node nötig) — die Aussage bleibt ehrlich. WhatsApp/Telegram
sind zugunsten der beiden Buchhaltungswerkzeuge rausgefallen (Entscheid: für die
Makler-Zielgruppe zählt Rechnung/Buchhaltung mehr als Messaging). Bewusst
ausgelassen: Calendly/Cal.com (Buchung ist bei Vrelo maßgeschneidert). Später
leicht ergänzbar.

## Oberfläche & Einordnung in den Farb-Bogen (wichtig)

Die Homepage läuft bewusst **kühl → warm**: Hero → Problem → `WasIchBaue`
(Petrol) → `Steps` (Petrol) → `Proof` (Teal-Band) → `MerakClose` (warm). Die
beiden Petrol-Sektionen sind ein **absichtlicher Petrol-Block** (CLAUDE.md,
Design system). Eine helle Sektion **zwischen** `WasIchBaue` und `Steps` würde
diesen Block aufreißen und den monotonen kühl→warm-Bogen zu einem Zickzack
(kühl→warm→kühl) brechen.

**Entscheid: `Section tone="petrol"`, direkt nach `WasIchBaue`, vor `Steps`.**
Das verlängert den Petrol-Block um einen Satz („das nehme ich dir ab – und du
behältst deine Werkzeuge"), hält den Bogen intakt und setzt die konzeptuell
engste Nachbarschaft (WasIchBaue = was ich abnehme; Werkzeuge = womit es läuft).

**Abgrenzung gegen Chip-Monotonie:** `WasIchBaue` steht direkt darüber und
nutzt bereits Petrol-Chips. Damit die neue Sektion nicht wie eine Wiederholung
liest, ist sie **anders gebaut**: gruppierte Cluster mit leiser Eyebrow-Zeile
je Gruppe (E-Mail & Kalender / CRM & Kontakte / …) statt eines flachen 4-Chip-
Rasters. Andere Struktur, gleiche Ruhe.

*Verworfene Alternative:* helle `tint`-Sektion nach `Steps` (vor `Proof`) —
löst die Monotonie, verliert aber die enge WasIchBaue-Nachbarschaft und drängt
die Reassurance hinter die Prozess-Schritte. Bei Bedarf im Spec-Review
umschaltbar.

## Visuelles Verhalten

- **Statisches** Raster kleiner `card-depth`-Chips (gleiche Chip-Sprache wie
  `WasIchBaue`, on-dark: `bg-tiefes-wasser/40`, `text-gletscher`,
  `border-gletscher/20`). Cluster-Label als leise Eyebrow-Zeile über jeder
  Gruppe.
- **Markup:** Cluster + Chips als `ul`/`li` — **kein `dl`/`dt`**: `<dt>`
  verbietet Überschrifteninhalt, und die Cluster-Label sind eher Rubriken als
  Definitionsterme (CLAUDE.md-Gotcha). Eyebrow als `<p>`/`<span>` über der
  jeweiligen `ul`.
- `Reveal` für das sanfte, gestaffelte Einblenden wie im Rest der Seite.
- **Keine Auto-Bewegung, kein Karussell** — nichts, worauf man warten muss,
  voll scanbar, per Default zugänglich.
- Zentrierte Spine für Überschrift + Subline (`mx-auto max-w-[44rem]
  text-center`), Cluster-Raster darunter (Homepage-Konvention: Überschrift
  zentriert, Inhaltsblock behält seine Form).
- Responsiv: mobil ein Cluster untereinander (Chips 2 Spalten) → Desktop die
  vier Cluster nebeneinander.

## Datenmodell

- Werkzeugliste als einfacher `const` im Komponentenfile (analog zu
  `leistungen` in `WasIchBaue`): ein Array von Clustern
  `{ label: string; tools: string[] }`. Kein neues lib-File für 12 statische
  Strings.

## Komponenten

- Neu: `src/components/home/Werkzeuge.tsx`
- Neu: `src/components/home/Werkzeuge.test.tsx`
- Geändert: `src/app/page.tsx` — Import + Einbau zwischen `WasIchBaue` und
  `Steps`.

## Tests (Vitest + Testing Library, Muster der bestehenden Per-Komponente-Tests)

- rendert die Überschrift,
- rendert jeden Werkzeug-Namen (alle 12),
- rendert jedes Cluster-Label,
- rendert den Auffang-Satz.

## Nicht-Ziele (YAGNI)

- Kein Karussell / keine Marquee-Animation.
- Keine echten Logos / Bild-Assets.
- Keine lib-Abstraktion, kein CMS, keine Konfigurierbarkeit über Werkzeugliste
  hinaus.
- Keine Platzierung außerhalb der Homepage.

## Brand-/Compliance-Konformität

- **Ruhe vor Hype / Ergebnis vor Mechanik** — statischer, scanbarer Block; die
  Werkzeug-Namen dienen der Beruhigung, nicht der Angeberei.
- **Deutsche Interpunktion** (Brand.md): „…"-Anführungszeichen (U+201E/U+201C),
  gespacete En-Dashes „ – " (U+2013) — Bytes nach dem Schreiben prüfen.
- **Kein Vrelo-Preis, kein Wettbewerber namentlich** — nicht betroffen.
- **stop-slop** auf die Copy anwenden (kundenzugewandter Text).
