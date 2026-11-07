// Speditionen Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 10 (10.1 Landkarte, 10.7 Recherche, researched 2026-11-07).
import type { ReiheNische } from "./index";

export const spedition: ReiheNische = {
  slug: "spedition",
  label: "Speditionen",
  kicker: "Bauplan für Speditionen",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Eine Tour, viele Zettel",
  // Landkarte 10.1 "Heute typisch" for stations 1, 2, 4, 5 and 6.
  auftragsweg: [
    { schritt: "Kunde fragt per Mail nach einem Preis" },
    { schritt: "Gewicht und Lademeter fehlen", verlust: "nachgefragt" },
    { schritt: "Angebot raus, keiner fasst nach", verlust: "vergessen" },
    { schritt: "Zusage, Auftrag auf die Plantafel", verlust: "übertragen" },
    { schritt: "Tour per Telefon an den Fahrer", verlust: "durchgegeben" },
    { schritt: "Foto vom Lieferschein per WhatsApp", verlust: "weitergeleitet" },
    { schritt: "Rechnung, Tage nach der Tour", verlust: "zusammengesucht" },
  ],
  // Copy rule (10.7 Statistik): "befragte Transport- und Logistikunternehmen", never "kleine
  // Betriebe", never a claim about what the other firms use, no second number on the cover.
  // Checked at the source 2026-11-07 (printed page 14 = PDF page 15, base n=458 logistics firms).
  statistik: {
    zahl: "42 Prozent",
    satz: "der befragten Transport- und Logistikunternehmen nutzen ein Transport Management System.",
    quelle: "Bundesamt für Logistik und Mobilität (BALM), Online-Erhebung eFTI, 2024",
    linkText: "balm.bund.de (PDF)",
    href: "https://www.balm.bund.de/SharedDocs/Downloads/DE/Marktbeobachtung/Sonderberichte/Online-Erhebung_eFTI.pdf?__blob=publicationFile&v=2",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Speditionen.pdf",
    readerSubject: "Dein Bauplan für Speditionen",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Speditions-Bauplan angefordert",
  },
  pdfPath: "/bauplan/spedition-bauplan-42955930.pdf",
  template: "content/bauplan/spedition-bauplan.html",
  pages: 8,
  knownTools: [
    "WinSped", "WebSped", "AppSped", "CarLo", "SPEDIFIX", "Logistiqo", "IMPARGO", "TIMOCOM",
    "Webfleet", "YellowFox", "SPEDION", "FleetBoard", "TomTom",
    "Toll Collect", "DKV Mobility",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Sheets", "Excel",
    "WhatsApp", "WhatsApp Business", "Telegram",
  ],
  // Exactly "Verifizierte Schnittstellen" (APIs) in 10.7, plus Telegram via the n8n Telegram node.
  // Not here on purpose: WinSped, CarLo, SPEDIFIX (file formats or no public docs), YellowFox and
  // SPEDION (on request only), Toll Collect (CSV download, no API), WhatsApp (not checked).
  verifiedInterfaces: [
    "Logistiqo", "TIMOCOM", "Webfleet", "IMPARGO", "DKV Mobility",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Telegram",
  ],
};
