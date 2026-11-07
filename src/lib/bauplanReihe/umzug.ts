// Umzugsunternehmen Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 12.7 (researched 2026-11-07); door station #1 + #2 Anfrage → Kunde erfasst sein Umzugsgut
// selbst → Besichtigung nur wenn nötig → Festpreisangebot, Nachfassen as the "danach";
// runner-up Halteverbotszone-Fristen je Adresse (first in chapter 6).
import type { ReiheNische } from "./index";

export const umzug: ReiheNische = {
  slug: "umzug",
  label: "Umzugsunternehmen",
  kicker: "Bauplan für Umzugsunternehmen",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Umzug, viele Anfahrten",
  // Landkarte 12.1 "Heute typisch" for stations 1, 2, 4 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Anfrage per Telefon, Mail oder Portal" },
    { schritt: "Rückruf am Abend, Etage und Aufzug fehlen", verlust: "nachtelefoniert" },
    { schritt: "Besichtigung vor Ort, Liste auf Papier", verlust: "hingefahren" },
    { schritt: "Angebot abends, Kubikmeter geschätzt", verlust: "abgetippt" },
    { schritt: "Angebot raus, keine Antwort", verlust: "vergessen" },
    { schritt: "Kolonne, Möbellift und Halteverbot per Anruf", verlust: "zusammengesucht" },
    { schritt: "Rechnung Tage später, Mehraufwand vom Arbeitsschein", verlust: "übertragen" },
  ],
  // No primary number fits (12.7 Statistik: the AMÖ line is an estimate with a money amount, the DIHK
  // figure covers the wider Straßengüterverkehr). Spec §5.3: the cover carries a pain block instead.
  statistik: null,
  mail: {
    attachmentName: "Vrelo-Bauplan-Umzugsunternehmen.pdf",
    readerSubject: "Dein Bauplan für Umzugsunternehmen",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Umzugs-Bauplan angefordert",
  },
  pdfPath: "", // set by npm run bauplan:reihe -- umzug --publish
  template: "content/bauplan/umzug-bauplan.html",
  pages: 8,
  knownTools: [
    "movingSTAR", "moventuPRO", "meinumzug.online", "Xlado", "movingpilot", "FastMove", "stressfrei solutions",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel",
    "Telegram",
  ],
  // Exactly the list "Verifizierte Schnittstellen" in 12.7 (APIs from 1.7; HERO and Craftboxx only if the
  // reader runs them, so not named in the template) plus Telegram via the n8n Telegram node. Never here:
  // movingSTAR, moventuPRO, meinumzug.online, Xlado, movingpilot, FastMove, stressfrei solutions
  // (no public API found), Halteverbot services, city portals, lead portals, WhatsApp.
  verifiedInterfaces: [
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "HERO", "Craftboxx",
    "Telegram",
  ],
};
