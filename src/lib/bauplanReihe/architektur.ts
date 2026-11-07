// Architektur- und Ingenieurbüros Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 13 (13.1 Landkarte, 13.7 Recherche, researched 2026-11-07); door station Anfrage → Erstgespräch →
// Honorarangebot, then Nachfassen of open Honorarangebote.
import type { ReiheNische } from "./index";

export const architektur: ReiheNische = {
  slug: "architektur",
  label: "Architektur- und Ingenieurbüros",
  kicker: "Bauplan für Architektur- und Ingenieurbüros",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Projekt, viele Wartezeiten",
  // Landkarte 13.1 "Heute typisch" for stations 1, 2, 4 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Anfrage eines Bauherrn per Mail" },
    { schritt: "Rückruf, Grundstück und Budget fehlen", verlust: "nachtelefoniert" },
    { schritt: "Erstgespräch, Notizen auf dem Block" },
    { schritt: "Honorarangebot in Excel gerechnet", verlust: "abgetippt" },
    { schritt: "Angebot raus, keine Antwort", verlust: "vergessen" },
    { schritt: "Planfreigabe per Mail, ohne Frist", verlust: "nachgefragt" },
    { schritt: "Erste Abschlagsrechnung, Monate später", verlust: "zusammengesucht" },
  ],
  // Copy rule (13.7 Statistik): the press release's own wording, both parts kept (nicht-projektbezogen,
  // darunter Verwaltung und Bürokratie); never "nicht abrechenbar", never "ein Viertel für Bürokratie",
  // never per office size. Sample line in the template: rund 4.900 Büros, Mai und Juni 2026.
  statistik: {
    zahl: "Rund ein Viertel",
    satz: "der Arbeitszeit in den Büros entfällt auf nicht-projektbezogene Tätigkeiten, darunter Verwaltung und bürokratische Anforderungen.",
    quelle: "Bundesingenieurkammer, Bundesarchitektenkammer, VBI und AHO, Mitgliederbefragung 2026",
    linkText: "bingk.de",
    href: "https://bingk.de/ingenieurbueros-unter-druck-laengere-projektlaufzeiten-und-hoher-buerokratieaufwand/",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Architektur-Ingenieurbueros.pdf",
    readerSubject: "Dein Bauplan für Architektur- und Ingenieurbüros",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Architektur-Bauplan angefordert",
  },
  pdfPath: "", // set by npm run bauplan:reihe -- architektur --publish
  template: "content/bauplan/architektur-bauplan.html",
  pages: 8,
  knownTools: [
    "untermStrich", "PROJEKT PRO", "KOBOLD CONTROL", "ORCA AVA", "PlanRadar",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Microsoft 365", "Outlook", "Google Calendar",
    "Excel", "Word", "Telegram",
    "GAEB", "IFC", "DIN 276", "XRechnung", "ZUGFeRD",
  ],
  // Exactly "Verifizierte Schnittstellen" in 13.7 (APIs, Microsoft Graph Mail via the n8n Outlook node,
  // GAEB/IFC as file exchange), plus Telegram via the n8n Telegram node. Never here: PROJEKT PRO (no API
  // found), KOBOLD CONTROL (Webservice listed, no docs), projo (API only planned), ORCA AVA as an API.
  // untermStrich only for what 13.7 found: read projects, hours, fees; write hours.
  verifiedInterfaces: [
    "untermStrich", "Lexware Office", "sevDesk", "Microsoft 365", "Outlook", "PlanRadar", "Bluebeam Studio",
    "DATEV", "Google Calendar", "GAEB", "IFC", "Telegram",
  ],
};
