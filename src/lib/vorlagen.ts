// src/lib/vorlagen.ts
// Copy + routing data for the public /vorlagen hub (2026-11-06). Each item keeps
// its own gate: the Haus PDF downloads directly, the Claude-Gehirn stays the
// ungated gift page, the two Baupläne are sent by e-mail (the request notifies
// Ajdin). The coded /bauplan/<code> outreach pages stay separate and noindex.
import type { BauplanVariant } from "@/lib/bauplan";

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
};

export const HAUS_PDF = "/vorlagen/vrelo-ki-betriebssystem.pdf";

export type Vorlage = { id: string; titel: string; text: string; umfang: string; link: { text: string; href: string } };

export const vorlagenPage: {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; line: string };
  items: Vorlage[];
} = {
  meta: {
    title: "Kostenlose Vorlagen",
    description:
      "Kostenlose Vorlagen für Betriebe und Unternehmen: das KI-Betriebssystem auf einer Seite, ein fertiger Prompt für Claude und Baupläne für Agenturen, Elektrobetriebe und SHK-Betriebe.",
  },
  hero: {
    eyebrow: "Kostenlos zum Mitnehmen",
    title: "Vorlagen",
    line: "Übersichten, Baupläne und ein Prompt für deinen Betrieb.",
  },
  items: [
    {
      id: "haus",
      titel: "Dein KI-Betriebssystem",
      text: "Die 13 Stationen, die jeder Betrieb hat, als Haus auf einer Seite: von der ersten Anfrage bis zur Rechnung. So siehst du, wo du anfangen kannst.",
      umfang: "1 Seite · PDF, sofort",
      link: { text: "PDF öffnen", href: HAUS_PDF },
    },
    {
      id: "claude-gehirn",
      titel: "Das Claude-Gehirn",
      text: "Ein fertiger Text für Claude Cowork: Claude legt ein Gehirn für deinen Betrieb an, lernt aus deinen Unterlagen und hält sein Wissen selbst aktuell.",
      umfang: "Ein Prompt · direkt auf der Seite",
      link: { text: "Zum Prompt", href: "/claude-gehirn" },
    },
    {
      id: "agentur-bauplan",
      titel: "Bauplan für Agenturen",
      text: "Der Weg eines Kunden durch deine Agentur, vom Angebot bis zur Projektdoku. Mit Bögen zum Ausfüllen, damit du siehst, was davon von allein laufen kann.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/agentur-bauplan` },
    },
    {
      id: "elektro-bauplan",
      titel: "Bauplan für Elektrobetriebe",
      text: "Mehr Büro als Baustelle? In fünf Stufen zum eigenen Büroassistenten, der Angebote, Rechnungen und Bestellungen vorbereitet.",
      umfang: "7 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/elektro-bauplan` },
    },
    {
      id: "shk-bauplan",
      titel: "Bauplan für SHK-Betriebe",
      text: "Vom ersten Anruf bis zur Rechnung: wo bei einem Auftrag Zeit verloren geht und mit welcher Station du anfängst.",
      umfang: "8 Seiten · PDF per E-Mail",
      link: { text: "Zum Bauplan", href: `${VORLAGEN_PATH}/shk-bauplan` },
    },
  ],
};
