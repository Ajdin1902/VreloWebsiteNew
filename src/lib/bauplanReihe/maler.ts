// Malerbetriebe Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 7 (7.1 Landkarte, 7.7 Recherche, researched 2026-11-07); door station #1 Anfrage, Fragen
// vor der Anfahrt, Besichtigung/Aufmaß, Angebot; #2 Nachfassen as the "danach".
import type { ReiheNische } from "./index";

export const maler: ReiheNische = {
  slug: "maler",
  label: "Malerbetriebe",
  kicker: "Bauplan für Malerbetriebe",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Auftrag, viel Büro drumherum",
  // Landkarte 7.1 "Heute typisch" for stations 1 to 3, 5 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Anfrage auf dem Anrufbeantworter" },
    { schritt: "Rückruf nach Tagen, Räume und Untergrund fehlen", verlust: "nachtelefoniert" },
    { schritt: "Besichtigung, Aufmaß mit Zollstock und Laser" },
    { schritt: "Angebot abends in Excel", verlust: "abgetippt" },
    { schritt: "Angebot raus, dann Stille", verlust: "vergessen" },
    { schritt: "Farbton am Vortag am Telefon", verlust: "nachgefragt" },
    { schritt: "Schlussrechnung, Stunden vom Zettel", verlust: "zusammengesucht" },
  ],
  // Copy rule (7.7 Statistik): Fachkräftemangel, Innungsbetriebe in the footnote, the report's
  // headline value (page 16); never as office time or Bürokratie, never next to another number.
  statistik: {
    zahl: "46 Prozent",
    satz: "der befragten Maler- und Lackiererbetriebe sagen, der Fachkräftemangel bremst ihre Aufträge: Die Arbeit verzögert sich, Aufträge werden zurückgestellt oder abgelehnt.",
    quelle: "Bundesverband Farbe Gestaltung Bautenschutz, Konjunkturbefragung 2026",
    linkText: "farbe.de (PDF)",
    href: "https://www.farbe.de/fileadmin/Bundesverband_Farbe/Bundesverband/Mitarbeiter/Naser/2026-05-04_Konjunkturbefragung_2026.pdf",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Malerbetriebe.pdf",
    readerSubject: "Dein Bauplan für Malerbetriebe",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Maler-Bauplan angefordert",
  },
  pdfPath: "/bauplan/maler-bauplan-4bd06071.pdf",
  template: "content/bauplan/maler-bauplan.html",
  pages: 8,
  knownTools: [
    "WinWorker", "plancraft", "Chroma", "Sander & Doll", "STREIT V.1", "STREIT",
    "HERO", "ToolTime", "Craftboxx", "openHandwerk",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel",
    "WhatsApp", "Telegram",
    "Brillux", "Caparol", "MEGA",
    "IDS Connect", "Datanorm", "GAEB", "ZUGFeRD", "XRechnung",
  ],
  // Exactly "Verifizierte Schnittstellen" in 7.7 (APIs and software-side standards), plus Telegram
  // via the n8n Telegram node. Not here on purpose: WinWorker, plancraft, Chroma/Sander & Doll,
  // STREIT (no public API found); Brillux, Caparol, MEGA (only "in WinWorker angebunden", never
  // stand-alone); WhatsApp (not checked).
  verifiedInterfaces: [
    "HERO", "Craftboxx", "openHandwerk", "ToolTime", "Lexware Office", "sevDesk", "DATEV", "Google Calendar",
    "IDS Connect", "Datanorm", "GAEB", "ZUGFeRD", "XRechnung", "Telegram",
  ],
};
