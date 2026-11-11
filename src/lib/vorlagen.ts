// src/lib/vorlagen.ts
// Copy + routing data for the public /vorlagen hub (2026-11-06). Each item keeps
// its own gate: the Haus PDF downloads directly, the Claude-Gehirn stays the
// ungated gift page, the two Baupläne are sent by e-mail (the request notifies
// Ajdin). The coded /bauplan/<code> outreach pages stay separate and noindex.
import type { BauplanVariant } from "@/lib/bauplan";
import { CHECK_SRC, kontaktHref, questionCountPhrase } from "@/lib/prozessCheckCta";
import { STEPS } from "@/lib/prozessCheck";

export const VORLAGEN_PATH = "/vorlagen";

// Public Bauplan copies: /vorlagen/<slug> renders the same page as the coded one.
export const vorlageBauplaene: Record<string, { variant: BauplanVariant; title: string; description: string }> = {
  "agentur-bauplan": {
    variant: "agentur",
    title: "Bauplan für Agenturen",
    description:
      "Kostenloser Bauplan für Agenturen: der Weg eines Kunden vom Angebot bis zur Projektdoku, mit Bögen zum Ausfüllen. Als PDF per E-Mail.",
  },
  "elektro-bauplan": {
    variant: "elektro",
    title: "Bauplan für Elektrobetriebe",
    description:
      "Kostenloser Bauplan für Elektrobetriebe: in fünf Stufen zum eigenen Büroassistenten für Angebote, Rechnungen und Bestellungen. Als PDF per E-Mail.",
  },
  "shk-bauplan": {
    variant: "shk",
    title: "Bauplan für SHK-Betriebe",
    description:
      "Kostenloser Bauplan für SHK-Betriebe: vom ersten Anruf bis zur Rechnung, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "gebaeudereinigung-bauplan": {
    variant: "gebaeudereinigung",
    title: "Bauplan für Gebäudereiniger",
    description:
      "Kostenloser Bauplan für Gebäudereiniger: von der ersten Anfrage bis zur Monatsrechnung, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "hausmeister-bauplan": {
    variant: "hausmeister",
    title: "Bauplan für Hausmeisterdienste",
    description:
      "Kostenloser Bauplan für Hausmeisterdienste: vom Auftrag der Hausverwaltung bis zum Leistungsnachweis, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "dach-bauplan": {
    variant: "dach",
    title: "Bauplan für Dachdecker und Spengler",
    description:
      "Kostenloser Bauplan für Dachdecker und Spengler: von der Schadensmeldung bis zur Rechnung, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "schreiner-bauplan": {
    variant: "schreiner",
    title: "Bauplan für Schreiner und Zimmerer",
    description:
      "Kostenloser Bauplan für Schreiner und Zimmerer: von der Anfrage bis zur Montage, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "maler-bauplan": {
    variant: "maler",
    title: "Bauplan für Malerbetriebe",
    description:
      "Kostenloser Bauplan für Malerbetriebe: von der Anfrage bis zur Schlussrechnung, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "fliesen-bauplan": {
    variant: "fliesen",
    title: "Bauplan für Fliesenleger",
    description:
      "Kostenloser Bauplan für Fliesenleger: von den ersten Fotos bis zur fertigen Fuge, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "galabau-bauplan": {
    variant: "galabau",
    title: "Bauplan für Garten- und Landschaftsbauer",
    description:
      "Kostenloser Bauplan für Garten- und Landschaftsbauer: von der Gartenanfrage bis zur Rechnung, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "spedition-bauplan": {
    variant: "spedition",
    title: "Bauplan für Speditionen",
    description:
      "Kostenloser Bauplan für Speditionen: von der Transportanfrage bis zur Rechnung, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "kurier-bauplan": {
    variant: "kurier",
    title: "Bauplan für Kurierdienste",
    description:
      "Kostenloser Bauplan für Kurierdienste: vom Auftrag am Telefon bis zum Zustellnachweis, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "umzug-bauplan": {
    variant: "umzug",
    title: "Bauplan für Umzugsunternehmen",
    description:
      "Kostenloser Bauplan für Umzugsunternehmen: von der Umzugsanfrage bis zum Festpreisangebot, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "architektur-bauplan": {
    variant: "architektur",
    title: "Bauplan für Architektur- und Ingenieurbüros",
    description:
      "Kostenloser Bauplan für Architektur- und Ingenieurbüros: von der Anfrage bis zum Honorarangebot, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "makler-bauplan": {
    variant: "makler",
    title: "Bauplan für Immobilienmakler",
    description:
      "Kostenloser Bauplan für Immobilienmakler: von den Objektunterlagen bis zum Exposé, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
  "finanzmakler-bauplan": {
    variant: "finanzmakler",
    title: "Bauplan für Finanz- und Versicherungsmakler",
    description:
      "Kostenloser Bauplan für Finanz- und Versicherungsmakler: von der Schadenmeldung bis zum Jahresgespräch, mit einem Weg in fünf Tagen zur ersten Station. Als PDF per E-Mail.",
  },
};

export const HAUS_PDF = "/vorlagen/vrelo-ki-betriebssystem.pdf";

// Hub groups in page order; a niche group appears once its first Bauplan is live (spec §7: group past six cards).
export const VORLAGEN_GRUPPEN = [
  { id: "alle", titel: "Für jeden Betrieb" },
  { id: "handwerk", titel: "Handwerk" },
  { id: "gebaeude", titel: "Gebäude und Garten" },
  { id: "logistik", titel: "Logistik" },
  { id: "buero", titel: "Büros, Agenturen und Makler" },
] as const;

export type Vorlage = {
  id: string;
  gruppe: (typeof VORLAGEN_GRUPPEN)[number]["id"];
  titel: string;
  text: string;
  umfang: string;
  link: { text: string; href: string };
};

export const vorlagenPage: {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; line: string };
  items: Vorlage[];
  /** The free next step under the cards (2026-11-11): Vorlage, then Gespräch, then Fahrplan. */
  weiter: { text: string; link: { text: string; href: string } };
} = {
  meta: {
    title: "Kostenlose Vorlagen",
    description:
      "Kostenlose Vorlagen für Betriebe und Unternehmen: das KI-Betriebssystem auf einer Seite, ein fertiger Prompt für Claude und Baupläne für Handwerk, Gebäude, Garten, Logistik, Büros, Agenturen und Makler.",
  },
  hero: {
    eyebrow: "Kostenlos zum Mitnehmen",
    title: "Vorlagen",
    line: "Übersichten, Baupläne und ein Prompt für deinen Betrieb.",
  },
  items: [
    {
      id: "prozess-check",
      gruppe: "alle",
      titel: "Prozess-Check",
      text: `Drei Minuten, ${questionCountPhrase(STEPS.length)}. Du siehst sofort, wie viele Stunden pro Woche der Kleinkram kostet.`,
      umfang: "3 Minuten · direkt auf der Seite",
      link: { text: "Prozess-Check starten", href: "/prozess-check?src=vorlagen" },
    },
    {
      id: "haus",
      gruppe: "alle",
      titel: "Dein KI-Betriebssystem",
      text: "Die 13 Stationen, die jeder Betrieb hat, als Haus auf einer Seite: von der ersten Anfrage bis zur Rechnung. So siehst du, wo du anfangen kannst.",
      umfang: "1 Seite · PDF, sofort",
      link: { text: "PDF öffnen", href: HAUS_PDF },
    },
    {
      id: "claude-gehirn",
      gruppe: "alle",
      titel: "Das Claude-Gehirn",
      text: "Ein fertiger Text für Claude Cowork: Claude legt ein Gehirn für deinen Betrieb an, lernt aus deinen Unterlagen und hält sein Wissen selbst aktuell.",
      umfang: "Ein Prompt · direkt auf der Seite",
      link: { text: "Zum Prompt", href: "/claude-gehirn" },
    },
    {
      id: "agentur-bauplan",
      gruppe: "buero",
      titel: "Bauplan für Agenturen",
      text: "Der Weg eines Kunden durch deine Agentur, vom Angebot bis zur Projektdoku. Mit Bögen zum Ausfüllen, damit du siehst, was davon von allein laufen kann.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/agentur-bauplan` },
    },
    {
      id: "elektro-bauplan",
      gruppe: "handwerk",
      titel: "Bauplan für Elektrobetriebe",
      text: "Mehr Büro als Baustelle? In fünf Stufen zum eigenen Büroassistenten, der Angebote, Rechnungen und Bestellungen vorbereitet.",
      umfang: "7 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/elektro-bauplan` },
    },
    {
      id: "shk-bauplan",
      gruppe: "handwerk",
      titel: "Bauplan für SHK-Betriebe",
      text: "Vom ersten Anruf bis zur Rechnung: Du siehst, wo ein Auftrag Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/shk-bauplan` },
    },
    {
      id: "dach-bauplan",
      gruppe: "handwerk",
      titel: "Bauplan für Dachdecker und Spengler",
      text: "Von der Schadensmeldung bis zur Rechnung: Du siehst, wo ein Auftrag Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/dach-bauplan` },
    },
    {
      id: "schreiner-bauplan",
      gruppe: "handwerk",
      titel: "Bauplan für Schreiner und Zimmerer",
      text: "Von der Anfrage bis zur Montage: Du siehst, wo ein Auftrag Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/schreiner-bauplan` },
    },
    {
      id: "maler-bauplan",
      gruppe: "handwerk",
      titel: "Bauplan für Malerbetriebe",
      text: "Von der Anfrage bis zur Schlussrechnung: Du siehst, wo ein Auftrag Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/maler-bauplan` },
    },
    {
      id: "fliesen-bauplan",
      gruppe: "handwerk",
      titel: "Bauplan für Fliesenleger",
      text: "Von den ersten Fotos bis zur fertigen Fuge: Du siehst, wo ein Auftrag Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/fliesen-bauplan` },
    },
    {
      id: "galabau-bauplan",
      gruppe: "gebaeude",
      titel: "Bauplan für Garten- und Landschaftsbauer",
      text: "Von der Gartenanfrage bis zur Rechnung: Du siehst, wo ein Auftrag Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/galabau-bauplan` },
    },
    {
      id: "spedition-bauplan",
      gruppe: "logistik",
      titel: "Bauplan für Speditionen",
      text: "Von der Transportanfrage bis zur Rechnung: Du siehst, wo eine Tour Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/spedition-bauplan` },
    },
    {
      id: "kurier-bauplan",
      gruppe: "logistik",
      titel: "Bauplan für Kurierdienste",
      text: "Vom Auftrag am Telefon bis zum Zustellnachweis: Du siehst, wo eine Fahrt Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/kurier-bauplan` },
    },
    {
      id: "umzug-bauplan",
      gruppe: "logistik",
      titel: "Bauplan für Umzugsunternehmen",
      text: "Von der Umzugsanfrage bis zum Festpreis: Du siehst, wo ein Umzug Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/umzug-bauplan` },
    },
    {
      id: "architektur-bauplan",
      gruppe: "buero",
      titel: "Bauplan für Architektur- und Ingenieurbüros",
      text: "Von der Anfrage bis zum Honorarangebot: Du siehst, wo ein Projekt Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/architektur-bauplan` },
    },
    {
      id: "makler-bauplan",
      gruppe: "buero",
      titel: "Bauplan für Immobilienmakler",
      text: "Von den Objektunterlagen bis zum Exposé: Du siehst, wo ein Objekt Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/makler-bauplan` },
    },
    {
      id: "finanzmakler-bauplan",
      gruppe: "buero",
      titel: "Bauplan für Finanz- und Versicherungsmakler",
      text: "Von der Schadenmeldung bis zum Jahresgespräch: Du siehst, wo ein Kunde Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/finanzmakler-bauplan` },
    },
    {
      id: "gebaeudereinigung-bauplan",
      gruppe: "gebaeude",
      titel: "Bauplan für Gebäudereiniger",
      text: "Von der ersten Anfrage bis zur Monatsrechnung: Du siehst, wo ein Objekt Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/gebaeudereinigung-bauplan` },
    },
    {
      id: "hausmeister-bauplan",
      gruppe: "gebaeude",
      titel: "Bauplan für Hausmeisterdienste",
      text: "Vom Auftrag der Hausverwaltung bis zum Leistungsnachweis: Du siehst, wo ein Objekt Zeit frisst. Danach wählst du deine erste Station.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/hausmeister-bauplan` },
    },
  ],
  weiter: {
    text: "Danach: 30 Minuten Gespräch, dann dein Fahrplan. Kostenlos.",
    link: { text: "Gespräch buchen", href: kontaktHref(CHECK_SRC.vorlagen) },
  },
};
