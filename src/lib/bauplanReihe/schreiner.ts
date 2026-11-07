// Schreiner und Zimmerer Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 6 (6.1 Landkarte, 6.7 Recherche, researched 2026-11-07); door station Anfrage → Fotos und
// grobe Maße → Aufmaß-Termin → Angebot, then Nachfassen of Angebot and Zeichnungsfreigabe.
import type { ReiheNische } from "./index";

export const schreiner: ReiheNische = {
  slug: "schreiner",
  label: "Schreiner und Zimmerer",
  kicker: "Bauplan für Schreiner und Zimmerer",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Auftrag, viele offene Enden",
  // Landkarte 6.1 "Heute typisch" for stations 1 to 4 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Anruf in der Werkstatt" },
    { schritt: "Rückruf abends, Maße fehlen", verlust: "nachtelefoniert" },
    { schritt: "Aufmaß auf dem Block", verlust: "abgetippt" },
    { schritt: "Angebot raus, keine Antwort", verlust: "vergessen" },
    { schritt: "Zeichnung wartet auf Freigabe", verlust: "nachgefragt" },
    { schritt: "Kunde fragt nach der Montage", verlust: "zurückgerufen" },
    { schritt: "Schlussrechnung, Wochen später", verlust: "zusammengesucht" },
  ],
  // Copy rule (6.7 Statistik): both numbers come from the same sentence of the same report, each with
  // its group (Tischler in the Ausbaugewerbe, Zimmerer in the Bauhauptgewerbe), "überdurchschnittlich"
  // kept, labelled as Bürokratie; never "67 Prozent der Schreiner", never next to the Elektro 61 %.
  statistik: {
    zahl: "67 Prozent",
    satz: "der Betriebe des Ausbaugewerbes (dazu zählen die Tischler) nennen längere Bearbeitungszeiten durch Bürokratie, ein überdurchschnittlicher Wert. Im Bauhauptgewerbe mit den Zimmerern sind es 62 Prozent, ebenfalls überdurchschnittlich.",
    quelle: "Zentralverband des Deutschen Handwerks, Sonderumfrage Bürokratiebelastung im Handwerk, 2023",
    linkText: "zdh.de (PDF)",
    href: "https://www.zdh.de/fileadmin/Oeffentlich/Wirschaft_Energie_Umwelt/Themen/Umfragen/Sonderumfragen/2023/Buerokratiebelastung_SU-1/2023_Sonderumfrage_Buerokratie.pdf",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Schreiner-Zimmerer.pdf",
    readerSubject: "Dein Bauplan für Schreiner und Zimmerer",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Schreiner-Bauplan angefordert",
  },
  pdfPath: "", // set by npm run bauplan:reihe -- schreiner --publish
  template: "content/bauplan/schreiner-bauplan.html",
  pages: 8,
  knownTools: [
    "Forma", "Casa Zimmerer", "STREIT", "STREIT V.1", "Borm", "Triviso", "Craftnote",
    "HERO", "Craftboxx", "openHandwerk",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel", "Word",
    "WhatsApp", "Telegram",
    "Dietrich's 3D", "GAEB", "Datanorm", "ZUGFeRD", "XRechnung",
  ],
  // Exactly "Verifizierte Schnittstellen" in 6.7 (APIs and standards), plus Telegram via the n8n
  // Telegram node. Never here: Forma, Casa Zimmerer (ODBC only), Borm, Triviso, STREIT (no public
  // API found), CAD/Abbund programs such as Dietrich's 3D, WhatsApp.
  verifiedInterfaces: [
    "Craftnote", "HERO", "Craftboxx", "openHandwerk",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar",
    "GAEB", "Datanorm", "ZUGFeRD", "XRechnung", "Telegram",
  ],
};
