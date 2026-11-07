// Fliesenleger Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 8.7 (researched 2026-11-07); door station #1 Anfrage → Fragen vor dem Aufmaß → Aufmaß → Angebot,
// runner-up #3 Bemusterung und Freigabe (first in chapter 6).
import type { ReiheNische } from "./index";

export const fliesen: ReiheNische = {
  slug: "fliesen",
  label: "Fliesenleger",
  kicker: "Bauplan für Fliesenleger",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Bad, viele Absprachen",
  // Landkarte 8.1 "Heute typisch" for stations 1 to 3 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Anfrage per WhatsApp, Fotos vom alten Bad" },
    { schritt: "Rückruf, Maße und Format fehlen", verlust: "nachtelefoniert" },
    { schritt: "Aufmaß, Notizen auf dem Block" },
    { schritt: "Angebot mit Verschnitt in Excel", verlust: "abgetippt" },
    { schritt: "Angebot raus, keine Antwort", verlust: "vergessen" },
    { schritt: "Bemusterung in der Ausstellung, Etikett als Foto", verlust: "zusammengesucht" },
    { schritt: "Rechnung aus Stundenzetteln, Tage später", verlust: "übertragen" },
  ],
  // Copy rule (8.7 Statistik, same as 1.7): Ausbaugewerbe and Bürokratie named, "überdurchschnittlich"
  // kept, never "of Fliesenleger", never next to another number. Scope note (page 8 of the report
  // lists Fliesen-, Platten- und Mosaikleger in the Ausbaugewerbe) sits in the template's source line.
  statistik: {
    zahl: "67 Prozent",
    satz: "der Betriebe des Ausbaugewerbes nennen längere Bearbeitungszeiten durch Bürokratie, ein überdurchschnittlicher Wert.",
    quelle: "Zentralverband des Deutschen Handwerks, Sonderumfrage Bürokratiebelastung im Handwerk, 2023",
    linkText: "zdh.de (PDF)",
    href: "https://www.zdh.de/fileadmin/Oeffentlich/Wirschaft_Energie_Umwelt/Themen/Umfragen/Sonderumfragen/2023/Buerokratiebelastung_SU-1/2023_Sonderumfrage_Buerokratie.pdf",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Fliesenleger.pdf",
    readerSubject: "Dein Bauplan für Fliesenleger",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Fliesen-Bauplan angefordert",
  },
  pdfPath: "", // set by npm run bauplan:reihe -- fliesen --publish
  template: "content/bauplan/fliesen-bauplan.html",
  pages: 8,
  knownTools: [
    "Ceram", "Sander & Doll", "STREIT", "STREIT V.1", "plancraft", "Sage", "Palette CAD", "ViSoft",
    "HERO", "ToolTime", "Craftboxx", "openHandwerk",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel",
    "WhatsApp", "Telegram",
    "IDS", "OCI", "Datanorm", "GAEB", "ZUGFeRD", "XRechnung",
  ],
  // Exactly the list "Verifizierte Schnittstellen" in 8.7 (APIs from 1.7, file standards, Telegram via
  // the n8n Telegram node). Not here on purpose: Ceram/Sander & Doll, plancraft, STREIT (no public API
  // found), Palette CAD, ViSoft, Sage (not checked), WhatsApp (not checked), any Fliesen wholesaler.
  verifiedInterfaces: [
    "HERO", "Craftboxx", "openHandwerk", "ToolTime", "Lexware Office", "sevDesk", "DATEV", "Google Calendar",
    "IDS", "OCI", "Datanorm", "GAEB", "ZUGFeRD", "XRechnung",
    "Telegram",
  ],
};
