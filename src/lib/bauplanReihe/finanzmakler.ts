// Finanz- und Versicherungsmakler Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 15 (15.1 Landkarte, 15.7 Recherche, researched 2026-11-07); door station Schadenmeldung
// (Sach, Haftpflicht, Kfz only), Jahresgespräch und Fristen first in chapter 6. Compliance (spec §6) is
// load-bearing here: no KI on creditworthiness or Gesundheitsfragen (KI-VO Anhang III Nr. 5 b, 5 c),
// Beratungsdokumentation never written by KI, no documents through Telegram or WhatsApp.
import type { ReiheNische } from "./index";

export const finanzmakler: ReiheNische = {
  slug: "finanzmakler",
  label: "Finanz- und Versicherungsmakler",
  kicker: "Bauplan für Finanz- und Versicherungsmakler",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Ein Schaden, viele Telefonate",
  // One Schaden from the client's call to the Regulierung; verbs from Landkarte 15.1 "Heute typisch"
  // and the owners' own words (15.7 Probleme 5); the same verbs as the circling step on page 4.
  auftragsweg: [
    { schritt: "Kunde meldet den Schaden am Telefon" },
    { schritt: "Fotos und Rechnungen fehlen", verlust: "nachgefordert" },
    { schritt: "Fotos kommen per WhatsApp", verlust: "weitergeleitet" },
    { schritt: "Meldung im Portal des Versicherers", verlust: "abgetippt" },
    { schritt: "Kunde fragt nach dem Stand", verlust: "nachgefragt" },
    { schritt: "Rückfrage vom Versicherer, Kunde nicht erreicht", verlust: "nachtelefoniert" },
    { schritt: "Regulierung, das Schreiben von Hand", verlust: "abgelegt" },
  ],
  // Copy rule (15.7 Statistik): an expectation, never a measured saving; never next to a time number;
  // "befragte Vermittler", never "alle Makler". Base (all respondents or KI users) not stated by AfW.
  statistik: {
    zahl: "93 Prozent",
    satz: "der befragten Vermittler erwarten vom KI-Einsatz vor allem Zeitersparnis.",
    quelle: "AfW Bundesverband Finanzdienstleistung, 18. AfW-Vermittlerbarometer, 2026",
    linkText: "afw-verband.de",
    href: "https://afw-verband.de/presse/ki-nutzung-in-der-finanzberatung-erst-rund-jeder-vierte-vermittler-arbeitet-taeglich-mit-ki/",
  },
  mail: {
    attachmentName: "Vrelo-Bauplan-Finanz-Versicherungsmakler.pdf",
    readerSubject: "Dein Bauplan für Finanz- und Versicherungsmakler",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Finanzmakler-Bauplan angefordert",
  },
  pdfPath: "", // set by npm run bauplan:reihe -- finanzmakler --publish
  template: "content/bauplan/finanzmakler-bauplan.html",
  pages: 8,
  knownTools: [
    "AMEISE", "simplr", "MAILIEN", "Professional works", "PWX", "Smart Admin", "Your.Shur", "Smart API",
    "keasy", "ASSFINET ams6", "ASSFINET",
    "Europace One", "Europace", "HYPOFY", "BiPRO",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Google Calendar", "Excel",
    "WhatsApp", "Telegram",
  ],
  // Exactly "Verifizierte Schnittstellen" in 15.7 (APIs and the BiPRO standard, the latter only through
  // the MVP), plus Telegram via the n8n Telegram node. Not here on purpose: Professional works, keasy,
  // ASSFINET (no API found), simplr (only via AMEISE), Smart API (no public docs; named only as such),
  // Europace One (the API is Europace's, access for a small broker not verified), WhatsApp (not checked).
  verifiedInterfaces: [
    "AMEISE", "Smart Admin", "Europace", "HYPOFY", "Lexware Office", "sevDesk", "DATEV", "Google Calendar",
    "BiPRO", "Telegram",
  ],
};
