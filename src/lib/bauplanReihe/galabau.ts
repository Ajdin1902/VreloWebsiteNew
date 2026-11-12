// Garten- und Landschaftsbauer Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 9 (9.1 Landkarte, 9.7 Recherche, researched 2026-11-07); door station #1 + #2 Anfrage →
// Besichtigungstermin → Angebot, Nachfassen as the "danach". GaLaBau is not Handwerk (IHK sector):
// no ZDH/HWK framing, the reader is never called a Handwerker.
import type { ReiheNische } from "./index";

export const galabau: ReiheNische = {
  slug: "galabau",
  label: "Garten- und Landschaftsbauer",
  kicker: "Bauplan für Garten- und Landschaftsbauer",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Garten, viel Büro am Abend",
  // Landkarte 9.1 "Heute typisch" for stations 1, 2, 5 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Anfrage, der Chef ist draußen" },
    { schritt: "Rückruf abends, Fläche und Fotos fehlen", verlust: "nachtelefoniert" },
    { schritt: "Besichtigung, Maße auf Papier" },
    { schritt: "Angebot am Wochenende", verlust: "abgetippt" },
    { schritt: "Angebot raus, dann Stille", verlust: "vergessen" },
    { schritt: "Stundenzettel am Freitag", verlust: "zusammengesucht" },
    { schritt: "Rechnung, Aufmaß vom Zettel", verlust: "übertragen" },
  ],
  // Copy rule (9.7 Statistik): Fachkraft-Stellen and "rechnerisch", computed from BA data (never
  // "befragt"), never "jeder zweite Betrieb", never next to the SHK 70,6 %, never a ZDH/HWK number.
  statistik: {
    zahl: "51,1 Prozent",
    satz: "der offenen Stellen für Fachkräfte im Garten-, Landschafts- und Sportplatzbau können rechnerisch nicht besetzt werden, im Jahresdurchschnitt 2025.",
    quelle: "Kompetenzzentrum Fachkräftesicherung (KOFA) im Institut der deutschen Wirtschaft, KOFA Kompakt 6/2026",
    linkText: "kofa.de (PDF)",
    href: "https://www.kofa.de/media/Publikationen/KOFA_Kompakt/KOFA_Kompakt_06-2026_Gartenbau.pdf",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Garten-Landschaftsbau.pdf",
    readerSubject: "Dein Bauplan für Garten- und Landschaftsbauer",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "GaLaBau-Bauplan angefordert",
  },
  pdfPath: "/bauplan/galabau-bauplan-b2528614.pdf",
  template: "content/bauplan/galabau-bauplan.html",
  pages: 8,
  // "KS21" stands for GaLaOffice 360 in the tools table: the degree sign has no entity in ENTITIES.
  knownTools: [
    "DATAflor BUSINESS", "DATAflor", "KS21", "GaLaOffice", "GaLaMobil", "galawork",
    "mexXsoft X2", "mexXsoft", "mexXgo", "Versa Office", "Sander & Doll",
    "plancraft", "mfr", "HERO", "ToolTime", "Craftboxx", "smart to plan", "miamapo",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel",
    "WhatsApp", "Telegram", "GAEB", "DATANORM",
  ],
  // Exactly "Verifizierte Schnittstellen" in 9.7 (APIs plus the file standards GAEB and DATANORM;
  // Telegram via the n8n Telegram node is on that list). Not here on purpose: DATAflor, KS21, galawork,
  // mexXsoft, Versa Office, plancraft (no public API found); miamapo (vendor statement only);
  // smart to plan, WhatsApp (not checked). ToolTime only with "nach eigenen Angaben" (Beta, no docs).
  verifiedInterfaces: [
    "mfr", "HERO", "Craftboxx", "ToolTime", "Lexware Office", "sevDesk", "DATEV", "Google Calendar",
    "Telegram", "GAEB", "DATANORM",
  ],
};
