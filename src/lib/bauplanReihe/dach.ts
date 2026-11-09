// Dachdecker und Spengler Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 5 (5.1 Landkarte, 5.7 Recherche, researched 2026-11-07); door station #1 Reparatur- und
// Schadensanfrage, #2 Nachfassen as the "danach", #8 DachCheck first in chapter 6.
import type { ReiheNische } from "./index";

export const dach: ReiheNische = {
  slug: "dach",
  label: "Dachdecker und Spengler",
  kicker: "Bauplan für Dachdecker und Spengler",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Schaden, viele Anläufe",
  // Landkarte 5.1 "Heute typisch" for stations 1, 2, 5 and 6; the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Sturmschaden, der Kunde ruft an" },
    { schritt: "Du bist auf dem Dach, keiner geht ran", verlust: "verpasst" },
    { schritt: "Rückruf am Abend, Adresse und Fotos fehlen", verlust: "nachtelefoniert" },
    { schritt: "Erst mal hin, der Schaden ist unklar", verlust: "hingefahren" },
    { schritt: "Skizze vom Dach, abends ins Angebot", verlust: "abgetippt" },
    { schritt: "Angebot raus, keiner fasst nach", verlust: "vergessen" },
    { schritt: "Rechnung, Regiestunden vom Zettel", verlust: "zusammengesucht" },
  ],
  // Copy rule (5.7 Statistik): Bauhauptgewerbe and Buerokratie named, the report's
  // "ueberdurchschnittlich" kept, never "of Dachdecker", never next to another number
  // (the 67 % Ausbaugewerbe of the Klempner stays out on purpose).
  statistik: {
    zahl: "62 Prozent",
    satz: "der Betriebe des Bauhauptgewerbes, zu dem die Dachdecker zählen, nennen längere Bearbeitungszeiten durch Bürokratie, ein überdurchschnittlicher Wert.",
    quelle: "Zentralverband des Deutschen Handwerks, Sonderumfrage Bürokratiebelastung im Handwerk, 2023",
    linkText: "zdh.de (PDF)",
    href: "https://www.zdh.de/fileadmin/Oeffentlich/Wirschaft_Energie_Umwelt/Themen/Umfragen/Sonderumfragen/2023/Buerokratiebelastung_SU-1/2023_Sonderumfrage_Buerokratie.pdf",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Dachdecker-Spengler.pdf",
    readerSubject: "Dein Bauplan für Dachdecker und Spengler",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Dach-Bauplan angefordert",
  },
  pdfPath: "/bauplan/dach-bauplan-cf92a56c.pdf",
  template: "content/bauplan/dach-bauplan.html",
  pages: 8,
  knownTools: [
    "Casa Dach", "MF Dach", "MF Dach plus", "Craftnote", "HERO", "Plancraft", "Airteam", "DachCheck",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel",
    "WhatsApp", "Telegram",
  ],
  // Exactly "Verifizierte Schnittstellen" in 5.7 (APIs, standards, chat). Not here on purpose:
  // Casa Dach and MF Dach (no web API; ODBC only with the vendor), Airteam (5.7 lists its file
  // export under standards but also under "never call connectable"; the stricter rule wins),
  // Plancraft (no public API found), WhatsApp (not checked).
  verifiedInterfaces: [
    "Craftnote", "HERO", "Craftboxx", "openHandwerk", "Lexware Office", "sevDesk", "DATEV", "Google Calendar",
    "GAEB", "Datanorm", "ZUGFeRD", "XRechnung", "Telegram",
  ],
};
