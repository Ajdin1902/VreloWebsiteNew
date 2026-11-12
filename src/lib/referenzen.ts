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
  branche?: string; // full card only, where the name doesn't already carry it (MDZ)
  inhaber: string;
  logo: { src: string; width: number; height: number };
  familie?: { kurz: string; lang: string };
  intro: string;
  problem: string[];
  ergebnis: string[];
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

// A bullet may mark its key phrase as **phrase**; the card sets it in bold.
export function hervorTeile(s: string): { text: string; hervor: boolean }[] {
  return s
    .split("**")
    .map((text, i) => ({ text, hervor: i % 2 === 1 }))
    .filter((t) => t.text.length > 0);
}

export function ohneHervor(s: string): string {
  return s.replaceAll("**", "");
}

export function referenzAnchorId(slug: string): string {
  return `referenz-${slug}`;
}

export const referenzen: Referenz[] = [
  {
    slug: "mdz",
    name: "MDZ Hausmeisterservice",
    label: "Regensburg",
    branche: "Hausmeisterservice",
    inhaber: "Mirsad Dzafic",
    logo: { src: "/images/referenzen/mdz-logo.webp", width: 720, height: 280 },
    familie: {
      kurz: "Betrieb meines Vaters",
      lang: "Der Betrieb meines Vaters. Hier konnte ich anfangen und habe gesehen, wie meine Systeme ihm die Arbeit leichter machen.",
    },
    intro: "Die Verwaltung der Termine, Aufgaben, Rechnungen und E-Mails nimmt viel Zeit in Anspruch.",
    problem: [
      "Den ganzen Tag auf den Objekten, danach zwei Stunden Büroarbeit.",
      "E-Mails, Termine und Aufgaben abends von Hand nachgetragen.",
      "Jede Rechnung von Hand aus der Vorlage geschrieben.",
      "Entsorgungsplan für die Objekte im Landkreis von Hand rausgesucht.",
    ],
    ergebnis: [
      "**Telegram-Assistent:** Sprachnachricht rein, E-Mail, Termin und Aufgabe erledigt.",
      "**Rechnungsautomatisierung: Rechnung per Chat**, fertig als Word und PDF in OneDrive.",
      "MDZ Core: alle Rechnungen seit 2022 in einer Datenbank.",
      "**Entsorgungsplan:** Stadt und Landkreis, **jeden Monat automatisch**.",
    ],
    visual: { kind: "clip", mp4: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" },
    werkzeuge: ["Telegram", "n8n", "Hetzner Server", "Notion", "Trello", "E-Mail", "Google Kalender", "OneDrive", "Word"],
    // Mirsad's words; second sentence reworded 2026-11-09, approved by Mirsad.
    stimme: {
      text: "„Meine ganze Büroarbeit wird unterwegs direkt per Chatnachricht erledigt. Endlich kann ich, wenn ich nach Hause komme, wirklich Feierabend machen.“",
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
    intro: "Hohe Zeitinvestition für Projektdokumentation, Onboarding und Dokumentenerstellung.",
    problem: [
      "HubSpot, ClickUp, Google Drive: jede Info von Hand nachgetragen.",
      "Angebote von Hand geschrieben, geprüft und verschickt.",
      "Kein zentraler Ort mit einem Überblick über alle Kundenprojekte.",
      "Onboarding jedes Kunden von Hand: Ordner, Mails, Aufgaben.",
    ],
    ergebnis: [
      "HubSpot ist die **eine Quelle der Wahrheit** für alle Kundendaten.",
      "Angebote gehen **automatisch und korrekt raus**, mit dokumentierter Unterschrift.",
      "Nach der Unterschrift: Kundenordner, Willkommensmail und Kundenliste von selbst.",
      "**Jeder Schritt automatisch dokumentiert**, der Stand jedes Kunden auf einen Blick.",
      "**Eingesparte Stunden fließen in die Arbeit mit den Kunden.**",
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
    werkzeuge: ["HubSpot", "sevDesk", "BoldSign", "Google Drive", "Google Docs", "Gmail", "ClickUp", "n8n", "Hetzner Server"],
    // Approved by Alen 2026-11-09.
    stimme: {
      text: "„Unsere zentrale Übersicht über alle Kundenprojekte wird automatisch aktualisiert. Nichts bleibt liegen und alle Deadlines werden eingehalten. Das allein nimmt uns schon enorm viel Arbeit ab.“",
      name: "Alen Purisic",
    },
    titel: "Vom Angebot bis zur Kundenkarte läuft alles von selbst.",
    kompakt: "Eine Quelle der Wahrheit in HubSpot: Angebot, Unterschrift, Kundenordner und Aufgaben entstehen automatisch.",
    kennzahl: "Projektdokumentation",
    kennzahlLabel: "läuft von selbst",
  },
];
