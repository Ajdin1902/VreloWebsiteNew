// Hausmeisterdienste Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 4 (4.1 Landkarte, 4.7 Recherche, researched 2026-11-07). A live Vrelo build in this
// trade exists: nothing from it may be recognisable in the copy.
import type { ReiheNische } from "./index";

export const hausmeister: ReiheNische = {
  slug: "hausmeister",
  label: "Hausmeisterdienste",
  kicker: "Bauplan für Hausmeisterdienste",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Auftrag, viele Rückfragen",
  // Landkarte 4.1 "Heute typisch" for stations 1, 4, 5 and 6.
  auftragsweg: [
    { schritt: "Verwaltung schickt den Auftrag per Mail" },
    { schritt: "Auftrag in die Liste im Büro", verlust: "übertragen" },
    { schritt: "Tagesliste für den Mitarbeiter", verlust: "ausgedruckt" },
    { schritt: "Fotos per WhatsApp an den Chef", verlust: "weitergeleitet" },
    { schritt: "Verwaltung ruft an: erledigt oder nicht?", verlust: "nachgefragt" },
    { schritt: "Nachweis aus Galerie und Chat", verlust: "zusammengesucht" },
    { schritt: "Rechnung, die Sonderleistung aus dem Gedächtnis", verlust: "nachgetragen" },
  ],
  // Copy rule (4.7 Statistik): the reader's customers (Immobilienverwaltungen), never a
  // Hausmeister figure, never next to another number, no sample size (2026 n not public).
  statistik: {
    zahl: "62,1 Prozent",
    satz: "der befragten Immobilienverwalter beschreiben ihre Verwaltung als überlastet.",
    quelle: "Verband der Immobilienverwalter Deutschland (VDIV), Branchenbarometer 2026",
    linkText: "vdiv.de",
    href: "https://vdiv.de/news-details/branchenbarometer-2026-wirtschaftlich-auf-wachstumskurs-personell-am-limit",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Hausmeisterdienste.pdf",
    readerSubject: "Dein Bauplan für Hausmeisterdienste",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Hausmeister-Bauplan angefordert",
  },
  pdfPath: "/bauplan/hausmeister-bauplan-81b6e821.pdf",
  template: "content/bauplan/hausmeister-bauplan.html",
  pages: 8,
  knownTools: [
    "iPM-Cloud", "hausmeisterapp", "wowflow", "Blink", "HERO", "Craftboxx",
    "casavi", "facilioo",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Google Sheets", "Excel",
    "WhatsApp", "WhatsApp Business", "Telegram",
  ],
  // Exactly "Verifizierte Schnittstellen" in 4.7 (APIs), plus Telegram via the n8n Telegram node.
  // Not here on purpose: iPM-Cloud, hausmeisterapp, wowflow, casavi (no API found), Blink (vendor
  // statement only), facilioo (Dienstleister API access not verified), WhatsApp (not checked).
  verifiedInterfaces: ["Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Telegram", "HERO", "Craftboxx"],
};
