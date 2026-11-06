// SHK pilot of the Bauplan series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 1.7 (researched 2026-11-06, approved by Ajdin the same day).
import type { ReiheNische } from "./index";

export const shk: ReiheNische = {
  slug: "shk",
  label: "SHK-Betriebe",
  kicker: "Bauplan für SHK-Betriebe",
  title: "Weniger Papierkram, mehr Zeit beim Kunden.",
  schmerz: "Der Monteur ruft an, weil auf dem Zettel die Telefonnummer fehlt. Am Abend tippst du seine Notizen ab.",
  // Copy rule (1.7 Statistik): Ausbaugewerbe and Buerokratie named, the report's
  // "ueberdurchschnittlich" kept, never "of SHK firms", never next to another number.
  statistik: {
    zahl: "67 Prozent",
    satz: "der Betriebe des Ausbaugewerbes nennen längere Bearbeitungszeiten durch Bürokratie, ein überdurchschnittlicher Wert.",
    quelle: "Zentralverband des Deutschen Handwerks, Sonderumfrage Bürokratiebelastung im Handwerk, 2023",
    linkText: "zdh.de (PDF)",
    href: "https://www.zdh.de/fileadmin/Oeffentlich/Wirschaft_Energie_Umwelt/Themen/Umfragen/Sonderumfragen/2023/Buerokratiebelastung_SU-1/2023_Sonderumfrage_Buerokratie.pdf",
  },
  inhalt: [
    "Wo du stehst: der Selbstcheck über die 13 Stationen deines Betriebs",
    "Deine Werkzeuge: was deine Software schon kann und wohin deine Daten gehen",
    "Das Fundament: deine Daten an einem Ort, in deinen eigenen Programmen",
    "Die erste Station: der Auftrag auf dem Handy des Monteurs",
    "Die nächsten Stockwerke: von der Wartung bis zum Tagesbild",
  ],
  mail: {
    attachmentName: "Vrelo-Bauplan-SHK-Betriebe.pdf",
    readerSubject: "Dein Bauplan für SHK-Betriebe",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "SHK-Bauplan angefordert",
  },
  pdfPath: "", // set by Task 4's publish step
  template: "content/bauplan/shk-bauplan.html",
  pages: 8,
  knownTools: [
    "HERO", "ToolTime", "Craftboxx", "Label", "pds", "TAIFUN", "openHandwerk", "STREIT", "STREIT V.1",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel", "Outlook",
    "WhatsApp", "Telegram",
    "GC-GRUPPE", "Richter+Frenzel", "Pfeiffer & May",
    "IDS Connect", "Open Masterdata", "DATANORM", "UGL", "ZUGFeRD", "OCI", "SHK-Connect",
  ],
  // Exactly the list "Verifizierte Schnittstellen" in 1.7 (Telegram via the n8n Telegram
  // node added 2026-11-06). Not here on purpose: STREIT and TAIFUN (no public API found),
  // WhatsApp (Business API not checked), SHK-Connect.
  verifiedInterfaces: [
    "IDS Connect", "Open Masterdata", "DATANORM", "UGL", "ZUGFeRD", "OCI",
    "GC-GRUPPE", "Richter+Frenzel", "Pfeiffer & May",
    "HERO", "Craftboxx", "openHandwerk", "Label", "pds", "ToolTime",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Telegram",
  ],
};
