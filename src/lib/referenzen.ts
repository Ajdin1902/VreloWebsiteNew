// The named references (spec 2026-11-05-referenzen-page-design.md). Both owners
// agreed to be named on 2026-11-05. The full card lives on /referenzen; the
// homepage and the /leistungen hub show the compact card only.
// MDZ is Ajdin's father's business: wherever the MDZ name appears, the family
// tie appears with it (UWG §5).
// Velp lists the HubSpot → Angebot → BoldSign → Drive → ClickUp chain, which is
// still in test: the page goes live only once Velp takes it live (Ajdin 2026-11-05).

export type Referenz = {
  slug: string; // also the anchor suffix on /referenzen
  name: string; // the logo's alt text and the compact eyebrow
  label: string; // place line, e.g. Regensburg
  inhaber: string;
  logo: { src: string; width: number; height: number };
  familie?: { kurz: string; lang: string };
  intro: string;
  problem: string[];
  loesung: string[];
  visual:
    | { kind: "clip"; mp4: string; poster: string }
    | { kind: "ablauf"; schritte: { titel: string; werkzeug: string }[] };
  werkzeuge: string[]; // tool names only, never tool logos (trademark rule, Werkzeuge.tsx)
  stimme?: { text: string; name: string }; // the owner's approved quote
  titel: string; // compact headline
  kompakt: string; // compact one-liner
  kennzahl: string; // compact number (Velp: none until Alen approves one)
  kennzahlLabel: string;
};

export function referenzAnchorId(slug: string): string {
  return `referenz-${slug}`;
}

export const referenzen: Referenz[] = [
  {
    slug: "mdz",
    name: "MDZ Hausmeisterservice",
    label: "Regensburg",
    inhaber: "Mirsad Dzafic",
    logo: { src: "/images/referenzen/mdz-logo.webp", width: 720, height: 280 },
    familie: {
      kurz: "Betrieb meines Vaters",
      lang: "Der Betrieb meines Vaters. Hier konnte ich anfangen und habe gesehen, wie meine Systeme ihm die Arbeit leichter machen.",
    },
    intro: "Hausmeisterservice seit 2008, mit eigenem Team.",
    problem: [
      "Mirsad ist den ganzen Tag auf seinen Objekten, selten am Schreibtisch.",
      "E-Mails, Termine, Aufgaben fürs Team und Rechnungen blieben bis zum Abend liegen.",
      "Zwei Stunden Büroarbeit nach der eigentlichen Arbeit, jeden Tag.",
      "Rechnungen entstanden jeden Monat von Hand aus der Vorlage des Vormonats.",
      "Der Entsorgungsplan deckte nur die Stadt ab, die Objekte im Landkreis fehlten.",
    ],
    loesung: [
      "Telegram-Assistent: Mirsad spricht eine Nachricht ein. Der Assistent schreibt und verschickt die E-Mail, trägt den Termin ein und gibt die Aufgabe an den richtigen Mitarbeiter.",
      "Rechnungsautomat: Aus jedem Eintrag wird eine nummerierte Rechnung als Word und PDF, abgelegt im richtigen OneDrive-Ordner.",
      "MDZ Core: Alle Objekte, Preise und Rechnungen seit 2022 in einer Datenbank. Darauf baut die Rechnung per Telegram auf.",
      "Entsorgungsplan für Stadt und Landkreis, jeden Monat direkt aus dem offiziellen Abfallkalender.",
      "Website: Nebenbei kam eine neue Website dazu.",
    ],
    visual: { kind: "clip", mp4: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" },
    werkzeuge: ["Telegram", "n8n", "Claude", "Notion", "Google Kalender", "OneDrive", "Word"],
    // Mirsad's own words (2026-11-05).
    stimme: {
      text: "„Meine ganze Büroarbeit wird unterwegs direkt per Chatnachricht erledigt. Nichts wird vergessen.“",
      name: "Mirsad Dzafic",
    },
    titel: "Das Büro läuft per Sprachnachricht.",
    kompakt: "Ein KI-Assistent, in alle Systeme integriert, erledigt die täglichen Verwaltungsaufgaben.",
    kennzahl: "2 Std./Tag",
    kennzahlLabel: "Büroarbeit weniger",
  },
  {
    slug: "velp",
    name: "Velp",
    label: "Marketingagentur · Regensburg",
    inhaber: "Alen Purisic",
    logo: { src: "/images/referenzen/velp-logo.webp", width: 720, height: 354 },
    intro: "Jeder neue Kunde durchläuft bei Velp dieselben Schritte, vom Angebot bis zur Betreuung.",
    problem: [
      "Viele verschiedene Systeme, in denen die neueste Information ständig von Hand nachgetragen werden musste.",
      "Kein Ort, an dem der aktuelle Stand eines Kunden auf einen Blick zu sehen war.",
      "Angebote von Hand schreiben, prüfen, verschicken und nachhalten.",
      "Dokumentation kostete Stunden, trotzdem ging immer wieder etwas verloren.",
      "Kundenkarten, Aufgaben und Fristen wurden von Hand angelegt und weitergeschoben.",
    ],
    loesung: [
      "HubSpot ist die eine Quelle der Wahrheit: Alle Kundendaten stehen an einem Ort.",
      "Angebote gehen automatisch raus, vollständig und korrekt. Per BoldSign kommen sie unterschrieben zurück.",
      "Nach der Unterschrift entstehen Kundenordner, Willkommensmail und Kundenkarte von selbst.",
      "Die Kundenkarte schaltet in die nächste Phase, sobald ihre Aufgaben erledigt sind. Die neuen Aufgaben kommen mit Fristen.",
      "Alles wird automatisch dokumentiert. Der neueste Stand jedes Kunden ist sofort lesbar.",
      "Das Team gewinnt mehrere Stunden für die Arbeit mit den Kunden und kann sich darauf verlassen, dass alles stimmt.",
    ],
    visual: {
      kind: "ablauf",
      schritte: [
        { titel: "Deal", werkzeug: "HubSpot" },
        { titel: "Angebot", werkzeug: "sevDesk" },
        { titel: "Unterschrift", werkzeug: "BoldSign" },
        { titel: "Kundenordner und Willkommensmail", werkzeug: "Google Drive" },
        { titel: "Kundenkarte mit Aufgaben", werkzeug: "ClickUp" },
      ],
    },
    werkzeuge: ["HubSpot", "sevDesk", "BoldSign", "Google Drive", "ClickUp", "n8n"],
    titel: "Vom Angebot bis zur Kundenkarte läuft alles von selbst.",
    kompakt: "Eine Quelle der Wahrheit in HubSpot: Angebot, Unterschrift, Kundenordner und Aufgaben entstehen automatisch.",
    kennzahl: "Projektdokumentation",
    kennzahlLabel: "läuft von selbst",
  },
];
