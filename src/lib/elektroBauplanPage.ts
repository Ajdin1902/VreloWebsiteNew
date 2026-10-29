// src/lib/elektroBauplanPage.ts
// Copy for the Elektro variant of /bauplan/[code]. Source: spec section 5
// (docs/superpowers/specs/2026-10-29-elektro-bauplan-landing-design.md), frozen
// after Ajdin's approval: change only with his OK. German quotes as escapes.
import type { PdfFormCopy } from "@/components/bauplan/BauplanPdfForm";

export const HWK_URL =
  "https://www.hwk-do.de/wp-content/uploads/2023/10/HWK-Pressedienst-57-Konjunktur-Sonderumfrage_Buerokratiebelastungen-im-Handwerk.pdf";

export const elektroBauplanPage: {
  kicker: string;
  title: string;
  schmerz: {
    zeilen: string[];
    zahl: string;
    satz: string;
    quelle: string;
    quelleLink: { text: string; href: string };
    cta: string;
  };
  loesung: {
    heading: string;
    sub: string;
    flow: { wort: string; zusatz: string }[];
    vergleich: { heute: string; mit: string; reihen: { heute: string; mit: string }[] };
  };
  inhalt: { heading: string; punkte: string[] };
  pdf: { heading: string; intro: string; form: PdfFormCopy };
} = {
  kicker: "Bauplan für Elektrobetriebe",
  title: "Mehr Büro als Baustelle?",
  schmerz: {
    zeilen: ["Tagsüber auf der Baustelle.", "Abends Angebote und Rechnungen.", "Am Wochenende der Rest."],
    zahl: "61\u00A0%",
    satz: "der befragten Handwerksbetriebe sagen: Durch Bürokratie bleibt weniger Zeit für die Aufträge.",
    quelle: "Handwerkskammer Dortmund, Sonderumfrage 2023, rund 700 Betriebe",
    quelleLink: { text: "hwk-do.de", href: HWK_URL },
    cta: "Bauplan kostenlos anfordern",
  },
  loesung: {
    heading: "Dein Bauplan zum Selbstbau: der eigene KI-Büroassistent",
    sub: "Er bereitet Angebote, Rechnungen und Bestellungen vor. DSGVO-konform.",
    flow: [
      { wort: "Du sprichst ein", zusatz: "Sprache, Foto, Mail" },
      { wort: "Er versteht", zusatz: "und fragt nach" },
      { wort: "Er bereitet vor", zusatz: "Angebot, Rechnung" },
      { wort: "Du gibst frei", zusatz: "dann geht es raus" },
    ],
    vergleich: {
      heute: "Heute",
      mit: "Mit dem Büroassistenten",
      reihen: [
        { heute: "Angebote am Abend", mit: "Einsprechen, Entwurf liegt bereit" },
        { heute: "Preise einzeln nachschlagen", mit: "Einkaufspreise kommen automatisch" },
        { heute: "Rechnungen von Hand", mit: "Rechnung mit einem \u201Epasst\u201C" },
      ],
    },
  },
  inhalt: {
    heading: "Das steht im Bauplan",
    punkte: [
      "Fünf Stufen: Fundament, Betriebsgehirn, Angebote und Rechnungen, Großhandel, Ausbau. Du fängst mit einer an.",
      "Zu jeder Stufe: \u201ESo gehst du vor\u201C, Schritt für Schritt.",
      "Beispiele mit Programmen, die du kennst: sevDesk, Lexware, ELDIS, Datanorm.",
      "Drei Regeln, damit nichts ohne deine Freigabe rausgeht und alles DSGVO-konform bleibt.",
    ],
  },
  pdf: {
    heading: "Den Bauplan als PDF",
    intro: "Kostenlos, sechs Seiten. Ich schicke ihn dir per Mail.",
    form: {
      label: "Deine E-Mail-Adresse",
      button: "PDF zuschicken",
      pending: "Wird gesendet …",
      hinweis: "Du bekommst nur diese eine Mail.",
      success: "Ist unterwegs. Schau auch im Spam-Ordner nach.",
    },
  },
};
