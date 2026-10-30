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
    bild: { src: string; alt: string; width: number; height: number };
    flow: { wort: string; zusatz: string }[];
    vergleich: { heute: string; mit: string; reihen: { heute: string; mit: string }[] };
  };
  inhalt: { heading: string; punkte: string[] };
  pdf: { heading: string; intro: string; form: PdfFormCopy };
  angebot: {
    heading: string;
    beweis: string;
    schritte: { titel: string; text: string }[];
    garantie: { titel: string; text: string };
    knappheit: string;
    frage: string;
    cta: { text: string; href: string };
  };
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
    heading: "Dein Bauplan zum Selbstbau: der eigene Büroassistent",
    sub: "Er bereitet Angebote, Rechnungen und Bestellungen vor. DSGVO-konform.",
    bild: {
      src: "/images/bauplan-elektro-assistent.webp",
      alt: "Ein Handy mit dem Chat des Assistenten, verbunden mit Postfach, Angeboten und Rechnungen, Großhandelskatalog, Dokumenten, Kalender und Baustellenfotos",
      width: 1376,
      height: 768,
    },
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
    intro: "Kostenlos, sieben Seiten. Ich schicke ihn dir per Mail.",
    form: {
      label: "Deine E-Mail-Adresse",
      button: "PDF zuschicken",
      pending: "Wird gesendet …",
      hinweis: "Du bekommst nur diese eine Mail.",
      success: "Ist unterwegs. Schau auch im Spam-Ordner nach.",
    },
  },
  // The offer (Ajdin 2026-10-30): the page's only sales part, last on the page and on PDF page 7.
  // Public timeline = the first 2 days only. "Geld zurück" holds because the deposit is all he has
  // paid before acceptance (50/50, final invoice after acceptance): never pair it with full prepayment.
  angebot: {
    heading: "Keine Zeit zum Selbstbauen? Ich baue ihn dir mit Geld-zurück-Garantie.",
    // Proof right under the headline (Ajdin 2026-10-30); the number is Mirsad's confirmed one.
    beweis: "Ein Hausmeisterservice arbeitet schon damit: Der Inhaber spart jeden Tag zwei Stunden Büroarbeit.",
    schritte: [
      { titel: "Eine Stunde mit dir.", text: "Wir klären, was dein Assistent können soll. Danach baue ich, du arbeitest weiter." },
      {
        titel: "Erste Ergebnisse nach 2 Tagen.",
        text: "Dein Assistent läuft auf deinem Handy. Du sprichst Notizen, Termine und Mails ein, er legt alles an einem Ort ab.",
      },
      {
        titel: "Danach Schritt für Schritt.",
        text: "Angebote, Rechnungen, Großhandel. Jeden Baustein teste ich selbst, bevor du ihn bekommst.",
      },
      { titel: "Zum Schluss testest du.", text: "Die Schlussrechnung kommt erst, wenn alles für dich passt." },
    ],
    garantie: {
      titel: "Geld-zurück-Garantie",
      text: "Erfüllt der Assistent deine Anforderungen nicht, bekommst du deine Anzahlung zurück.",
    },
    // Real capacity, said publicly (Ajdin 2026-10-30). "noch 3" = free slots right now:
    // lower it with every signed build, or the scarcity turns false (UWG §5).
    knappheit: "Ich habe nur Kapazität für noch 3 Betriebe.",
    frage: "Du hast Fragen? Dann lass uns eine halbe Stunde sprechen.",
    cta: { text: "30 Minuten Gespräch buchen", href: "/kontakt?src=bauplan-elektro" },
  },
};
