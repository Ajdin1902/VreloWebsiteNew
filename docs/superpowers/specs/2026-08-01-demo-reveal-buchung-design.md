# Demo-Reveal: Direktbuchung + sichtbare Zusammenfassung

**Datum:** 2026-08-01
**Betrifft:** `/demo` – die Reveal-Phase der interaktiven Termin-Quelle-Demo
**Status:** Design abgenommen

## Problem

Zwei Brüche am Ende der Demo, genau an der Stelle, an der der Makler am wärmsten ist:

1. **Der CTA schickt ihn weg.** [`Protokoll.tsx:139`](../../../src/components/demo/Protokoll.tsx) ist ein `<a href="/kontakt">`. Er hat gerade erlebt, wie aus einer Anfrage in Sekunden ein Termin wurde – und soll dann selbst auf eine andere Seite wechseln und ein Formular ausfüllen. Der `calLink` wird bereits an `Protokoll` durchgereicht, aber nur für die Zeile „15 Minuten, unverbindlich.“ benutzt; die Buchungsabsicht war also schon halb verdrahtet.
2. **Die Zusammenfassung ist unsichtbar.** [`Demo.tsx:21-22`](../../../src/components/demo/Demo.tsx) tauscht die Chat-Karte gegen die Reveal-Karte aus, ohne zu scrollen. Der Nutzer steht nach einem langen Chat unten auf der Seite; der Kartenkopf mit Überschrift und Terminnotiz liegt über dem Viewport. Er müsste hochscrollen, um das Ergebnis überhaupt zu sehen.

Dazu kommt eine Reihenfolge-Falle: die Karte rendert heute `Terminnotiz → Mailvorschau → **kompletter Gesprächsverlauf** → CTA`. Selbst nach einem Scroll an den Kartenkopf läge der Button hinter dem gesamten nachgedruckten Chat.

## Nicht-Ziele

- Die Demo-Engine, die drei Routen unter `src/app/demo/`, der Prompt oder das `[ENDE]`-Sentinel werden nicht angefasst.
- `SchedulerEmbed` wird **nicht** verändert – es ist auf `/kontakt` und `/makler` live.
- Die Fail-safe-Semantik von `/demo/summary` (jeder Fehler → `EMPTY_NOTIZ` mit 200) bleibt wie sie ist.
- Kein Preis, keine neue Datenspeicherung. Die Terminnotiz und die Mailvorschau bleiben reine Anzeige.

## Entwurf

### 1. Reihenfolge in der Reveal-Karte

Nur die Anordnung innerhalb der bestehenden Karte ändert sich; der asynchrone Summary-Fetch und seine drei Zustände bleiben unberührt.

```
Überschrift  „Das hat dein Kunde gerade erlebt.“   ← Scroll- und Fokusziel
Terminnotiz                                        (unverändert)
Bestätigungsmail (Vorschau)                        (unverändert, nur wenn E-Mail vorhanden)
──────── Abschluss-CTA (Petrol-Band) ────────      ← NEU an dieser Stelle
▸ Gespräch nachlesen                               ← <details>, zugeklappt
```

Die drei Summary-Zustände verhalten sich exakt wie heute:

| Zustand | Darstellung |
|---|---|
| `loading` | „Einen Moment – ich fasse das Gespräch zusammen …“ |
| `ready` + Notiz | Terminnotiz-Karte, darunter Mailvorschau falls E-Mail |
| `ready` ohne Notiz (Fehler oder leer) | „Termin gebucht & protokolliert.“ |

**Der CTA-Block rendert in allen drei Zuständen**, auch während `loading` und im Fehlerfall. Er darf nie davon abhängen, dass die Zusammenfassung gelingt – dieselbe Begründung wie beim bestehenden Fail-safe.

Der Verlauf wandert in ein natives `<details>` mit `<summary>Gespräch nachlesen</summary>`. Kein JavaScript, kein handgebautes ARIA, und der Inhalt bleibt im DOM, sodass die vorhandenen Transcript-Assertions weiter greifen.

### 2. Der Buchungs-Block

Ein Petrol-Band innerhalb der Papier-Karte – das auf der Site etablierte Muster „dunkles CTA-Band auf heller Fläche“.

```
┌ bg-vrelo-petrol, rounded-xl ───────────────┐
│  Genau das für deinen Betrieb.             │  Fraunces italic, text-papier
│                                            │
│  Buch dir ein unverbindliches              │  ← ab hier: SchedulerEmbed
│  Kennenlern-Gespräch.                      │
│         [ Termin anzeigen ]                │
│  Beim Klick wird der Kalender von          │
│  Cal.com geladen.                          │
└────────────────────────────────────────────┘
   Lieber schreiben? Zum Kontaktformular.       klein, auf Papier
```

Alles unterhalb der Überschrift ist `SchedulerEmbed` **unverändert**, montiert mit `prompt=""` – genau so, wie `/makler` es verwendet. Das bringt drei Dinge geschenkt:

- **`calOrigin="https://cal.eu"`** ist in der Komponente gepinnt. Vrelos Cal-Konto liegt in der EU-Region; der Default-Origin `cal.com` würde den Buchungs-Iframe mit 404 quittieren.
- **Click-to-Load** – der Iframe entsteht erst nach dem Klick, also kein Drittanbieter-Request beim Seitenaufruf. Das hält den bereits geschriebenen `/demo`-Abschnitt der Datenschutzerklärung wahr.
- **Geprüfte On-Dark-Kontraste** – `gletscher` 7:1 auf Petrol, Navy-auf-Amber-Button 6.8:1. Der Fokusring der Komponente nutzt `ring-offset-vrelo-petrol`, was auf diesem Band korrekt ist.

Zwei bewusste Entscheidungen:

- **`/kontakt` verschwindet nicht**, sondern wird zum kleinen Textlink unter dem Band degradiert. Wer gerade gesehen hat, wie ein Bot einen Termin bucht, will vielleicht trotzdem lieber schreiben – und der Block ist damit nie eine Sackgasse.
- **Ohne `calLink` ebenfalls keine Sackgasse.** Dann entfällt das Band ganz und der bisherige `/kontakt`-Button rendert unverändert. Ein Petrol-Band, das sich nur entschuldigt („Online-Terminbuchung folgt in Kürze.“) und daneben zweimal auf dasselbe Formular zeigt, wäre schlechter als der Zustand von heute. Praktisch relevant: `NEXT_PUBLIC_CAL_LINK` ist in der Vercel-**Preview**-Umgebung nicht gesetzt, Branch-Previews laufen also durch diesen Pfad.

**Copy:** der heutige Button heißt „Genau das für deinen Betrieb – lass uns reden“. „Lass uns reden“ ist jetzt Aufgabe des Buttons, die Band-Überschrift verkürzt sich also auf „Genau das für deinen Betrieb.“ – kein Gedankenstrich nötig. Die bisherige Zeile „15 Minuten, unverbindlich.“ entfällt, weil `SchedulerEmbed` bereits „unverbindliches Kennenlern-Gespräch“ sagt.

Deutsche Typografie nach Brand-Regel: „…“ = U+201E/U+201C, Gedankenstrich = gespaced en-dash U+2013. Nach jedem Schreibvorgang Bytes prüfen (Edit/Write stufen das schließende Anführungszeichen still herab).

### 3. Scroll und Fokus

`Protokoll` scrollt beim Mounten die eigene Karte in den Blick und setzt den Fokus auf die Überschrift:

```ts
const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
cardRef.current?.scrollIntoView?.({ behavior: reduced ? "auto" : "smooth", block: "start" });
headingRef.current?.focus({ preventScroll: true });
```

Vier Details, die zählen:

- **`scroll-mt-24` gehört auf das Kartenelement selbst.** `/demo` behält die Site-Chrome, der Header ist `sticky top-0`. Laut Projekt-Gotcha wirkt `scroll-margin-top` nur auf dem Element, zu dem der Browser tatsächlich scrollt – auf einem Vorfahren tut es nichts.
- **`preventScroll: true`** beim Fokussieren. Ein Fokuswechsel scrollt das Element sonst von sich aus in den Blick und kämpft gegen das smooth scrolling.
- **`tabIndex={-1}` an der Überschrift** – programmatisch fokussierbar, nicht in der Tab-Reihenfolge. Ohne das bliebe der Phasenwechsel für Screenreader stumm.
- **Optional-Call `?.()` bei beiden Aufrufen.** Weder `scrollIntoView` noch `matchMedia` existieren in jsdom; so kann in Tests nichts werfen.

Der Scroll läuft, während die Zusammenfassung noch lädt. Der Nutzer sieht also „Einen Moment – ich fasse das Gespräch zusammen …“ und dann, wie sich die Terminnotiz füllt. Anker ist der **Kartenkopf**, wachsender Inhalt schiebt daher ausschließlich nach unten – nichts springt unter ihm weg.

## Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/components/demo/Protokoll.tsx` | Reihenfolge, CTA-Band, `<details>`, Scroll/Fokus, `scroll-mt-24` |
| `src/components/demo/Protokoll.test.tsx` | drei CTA-Assertions umstellen, neue Fälle ergänzen |
| `src/components/kontakt/SchedulerEmbed.tsx` | **keine** – nur Wiederverwendung |
| `src/components/demo/Demo.tsx` | **keine** – der Phasenwechsel bleibt wie er ist |

Das CTA-Band bleibt eine lokale Komponente in `Protokoll.tsx`, neben `MailVorschau`. Die Datei ist heute 145 Zeilen; ein weiterer kleiner Block ist kein Anlass für eine neue Datei.

## Tests

Bestehende Fälle, die brechen: drei Tests prüfen `getByRole("link", { name: /reden|kontakt/i })` mit `href` auf `/kontakt` als primären CTA. Diese werden auf den Buchungs-Button umgestellt, plus eine Assertion, dass der degradierte `/kontakt`-Link weiterhin existiert.

Neue Fälle:

1. **Scroll beim Mounten** – `Element.prototype.scrollIntoView` als Spy setzen, Aufruf mit `block: "start"` prüfen.
2. **CTA vor dem Verlauf** – DOM-Reihenfolge prüfen (`compareDocumentPosition`), damit die Reihenfolge nicht still zurückkippt.
3. **Verlauf im `<details>`** – `<summary>Gespräch nachlesen</summary>` vorhanden, Transcript-Text weiterhin im DOM.
4. **CTA im Fehlerfall** – Summary-Fetch schlägt fehl, Buchungs-Button ist trotzdem da.
5. **Ohne `calLink`** – Fallback-Text statt Button, `/kontakt`-Link vorhanden.

Cal wird wie in `SchedulerEmbed.test.tsx` gestubbt: `vi.mock("@calcom/embed-react", …)` mit einer `vi.hoisted`-Fabrik (unter Vitest v4 wirft eine direkt referenzierte Top-Level-`const` in der Fabrik „Cannot access before initialization“).

Verifikation vor dem Merge: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, dazu ein manueller Durchlauf mit `npm start` (nicht `npm run dev`) – Demo komplett spielen und prüfen, dass der Reveal von selbst ins Bild kommt und der Kalender im Band aufgeht.

## Bewertung gegen die Value Equation

- **Time Delay ↓** – Termin buchen ohne Seitenwechsel und ohne Formular; der Weg vom Aha-Moment zum Kalender schrumpft auf einen Klick.
- **Effort & Sacrifice ↓** – kein Hochscrollen, um das Ergebnis zu sehen; kein zweites Eintippen von Daten, die er gerade im Rollenspiel schon eingegeben hat.
- **Perceived Likelihood ↑** – Terminnotiz und Mailvorschau stehen direkt über dem Buchungs-Band; der Beweis und der Ask liegen im selben Blickfeld.
