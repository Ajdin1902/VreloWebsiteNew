// Immobilienmakler Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 14 (14.1 Landkarte, 14.7 Recherche, researched 2026-11-07); door station #3 Objektunterlagen
// vom Eigentümer einsammeln mit "was fehlt"-Liste (Energieausweis first); runner-up #5 wöchentlicher
// Bericht an den Eigentümer (first in chapter 6). "Anfragen beantworten" is Bordmittel in all three CRMs.
import type { ReiheNische } from "./index";

export const makler: ReiheNische = {
  slug: "makler",
  label: "Immobilienmakler",
  kicker: "Bauplan für Immobilienmakler",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Objekt, viele Unterlagen",
  // Landkarte 14.1 "Heute typisch" for stations 3 and 4 (Eigentümer call to the first Besichtigung);
  // the verbs match the circling step on page 4.
  auftragsweg: [
    { schritt: "Eigentümer ruft an: Wir wollen verkaufen" },
    { schritt: "Liste per Mail, Unterlagen kommen in Etappen", verlust: "zusammengesucht" },
    { schritt: "Grundbuchauszug erst mit Vollmacht", verlust: "nachgefragt" },
    { schritt: "Teilungserklärung liegt beim Verwalter", verlust: "gewartet" },
    { schritt: "Energieausweis fehlt, das Inserat wartet", verlust: "nachtelefoniert" },
    // "Exposé" needs an &eacute; entity the template text decoder does not have yet.
    { schritt: "Exposé am Abend, Werte vom Papier", verlust: "abgetippt" },
    { schritt: "Erste Besichtigung, Käufer fragt nach Protokollen", verlust: "nachgereicht" },
  ],
  // None (14.7 Statistik): no primary number on Makler admin time; the DISQ study has no public
  // figure and tests franchise brands only. The cover carries a pain block instead (spec §5.3).
  statistik: null,
  mail: {
    attachmentName: "Vrelo-Bauplan-Immobilienmakler.pdf",
    readerSubject: "Dein Bauplan für Immobilienmakler",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Makler-Bauplan angefordert",
  },
  pdfPath: "", // set by npm run bauplan:reihe -- makler --publish
  template: "content/bauplan/makler-bauplan.html",
  pages: 8,
  knownTools: [
    "onOffice", "onOffice WP Website", "FlowFact", "Propstack", "DocuSign",
    "ImmoScout24", "Immowelt", "Kleinanzeigen",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel", "Word",
    "Telegram", "WhatsApp",
  ],
  // Exactly "Verifizierte Schnittstellen" in 14.7 plus Telegram via the n8n Telegram node. The copy
  // names FlowFact only as the Cloud editions Residential/Commercial and onOffice only with its paid
  // API module ("Zusatzmodul"). Never here: FlowFact Mini/Performer, Immowelt, Kleinanzeigen,
  // DocuSign, onOffice WP Website, WhatsApp, Grundbuchamt/Bauamt/Verwalter software.
  verifiedInterfaces: [
    "Propstack", "FlowFact", "onOffice", "ImmoScout24", "OpenImmo",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Telegram",
  ],
};
