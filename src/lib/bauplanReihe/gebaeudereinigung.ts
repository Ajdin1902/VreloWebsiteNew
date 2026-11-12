// Gebäudereiniger Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 3.7 (researched 2026-11-07); door station #1 Anfrage → Besichtigung → Angebot.
import type { ReiheNische } from "./index";

export const gebaeudereinigung: ReiheNische = {
  slug: "gebaeudereinigung",
  label: "Gebäudereiniger",
  kicker: "Bauplan für Gebäudereiniger",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Eine Anfrage, viele Umwege",
  // Landkarte 3.1 "Heute typisch" for stations 1 to 3 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Anfrage über die Webseite" },
    { schritt: "Rückruf, die Fläche fehlt", verlust: "nachtelefoniert" },
    { schritt: "Besichtigung, Maße auf dem Block" },
    { schritt: "Angebot in Excel gerechnet", verlust: "abgetippt" },
    { schritt: "Angebot raus, keine Antwort", verlust: "vergessen" },
    { schritt: "Neues Objekt, Daten auf Zetteln", verlust: "zusammengesucht" },
    { schritt: "Rechnung, Sonderleistungen vom Stundenzettel", verlust: "übertragen" },
  ],
  // Copy rule (3.7 Statistik): Bürokratie, Verwaltungspersonal and the self-estimate of BIV member
  // firms named; never "kleine Betriebe", never next to another statistic.
  statistik: {
    zahl: "rund 32 Prozent",
    satz: "der Arbeitszeit verbringt das Verwaltungspersonal in Gebäudereinigungsbetrieben mit Bürokratievorgaben. Das ist der Mittelwert, nach eigener Schätzung der befragten Mitgliedsbetriebe.",
    quelle: "Bundesinnungsverband des Gebäudereiniger-Handwerks, Herbst-Konjunkturumfrage 2025",
    linkText: "die-gebaeudedienstleister.de (PDF)",
    href: "https://www.die-gebaeudedienstleister.de/wp-content/uploads/2025/10/251028_Herbst-Konjunkturumfrage_2025.pdf",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Gebaeudereiniger.pdf",
    readerSubject: "Dein Bauplan für Gebäudereiniger",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Gebäudereiniger-Bauplan angefordert",
  },
  pdfPath: "/bauplan/gebaeudereinigung-bauplan-2445acb6.pdf",
  template: "content/bauplan/gebaeudereinigung-bauplan.html",
  pages: 8,
  knownTools: [
    "fortytools", "zvoove", "Profacilo", "Blink", "PlanD", "CleanManager", "TimeTac",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel", "Telegram",
  ],
  // Exactly the list "Verifizierte Schnittstellen" in 3.7 plus Telegram via the n8n Telegram node.
  // Not here on purpose: Blink (API claimed, no public reference), PlanD, Profacilo, CleanManager
  // (no API found), zvoove (ERP API not checked).
  verifiedInterfaces: ["fortytools", "TimeTac", "Lexware Office", "sevDesk", "Google Calendar", "DATEV", "Telegram"],
};
