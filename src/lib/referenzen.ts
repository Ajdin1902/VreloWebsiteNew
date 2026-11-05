// The named references (spec 2026-11-05-referenzen-page-design.md). Both owners
// agreed to be named on 2026-11-05. The full card lives on /referenzen; the
// homepage and the /leistungen hub show the compact card only.
// MDZ is Ajdin's father's business: wherever the MDZ name appears, the family
// tie appears with it (UWG §5).

export type Referenz = {
  slug: string; // also the anchor suffix on /referenzen
  name: string; // the logo's alt text and the compact eyebrow
  label: string; // place line, e.g. Regensburg
  inhaber: string;
  logo: { src: string; width: number; height: number };
  familie?: { kurz: string; lang: string };
  intro: string;
  problem: string;
  gebaut: string;
  laeuft: string;
  visual: { kind: "clip"; mp4: string; poster: string } | { kind: "phasen" };
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
    intro: "Seit 2008 betreut MDZ über 55 Objekte, mit eigenem Team.",
    problem:
      "Mirsad ist den ganzen Tag auf seinen Objekten. E-Mails, Termine, Aufgaben fürs Team und Rechnungen blieben bis zum Abend liegen: zwei Stunden Büroarbeit, jeden Tag.",
    gebaut:
      "Einen Telegram-Assistenten, einen Rechnungsautomaten auf der eigenen Datenbank MDZ Core, einen automatischen Entsorgungsplan und nebenbei eine neue Website.",
    laeuft:
      "Mirsad spricht eine Nachricht ein, der Rest passiert von selbst: E-Mail, Termin, Aufgabe ans Team, Rechnung als Word und PDF in OneDrive. Der Entsorgungsplan stimmt jeden Monat.",
    visual: { kind: "clip", mp4: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" },
    werkzeuge: ["Telegram", "n8n", "Claude", "Notion", "Google Kalender", "OneDrive", "Word"],
    // Mirsad approves the exact German before the page goes live (spec §6.4).
    stimme: {
      text: "„Ich muss mir nichts mehr merken und nichts mehr aufschreiben. Ich spreche einfach rein und alles wird erledigt.“",
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
    intro: "Jeder neue Kunde durchläuft bei Velp dieselben Phasen, quer durch fünf Übersichten.",
    problem:
      "Jede Kundenkarte wurde von Hand in die nächste Phase geschoben, jede Aufgabe neu angelegt, jede Frist von Hand gesetzt. Das kostete täglich Zeit und ging leicht unter.",
    gebaut:
      "Eine Phasen-Steuerung für die Kundenübersicht. Sind alle Aufgaben einer Phase erledigt, legt sie die nächsten an, mit Werktags-Fristen und Ansprechpartner. Geförderte Kunden bekommen eine eigene BAFA-Spur.",
    laeuft: "Niemand schiebt mehr eine Karte von Hand. Das Team arbeitet am Kunden statt an der Dokumentation.",
    visual: { kind: "phasen" },
    werkzeuge: ["ClickUp", "n8n"],
    titel: "Die Kundenübersicht steuert sich selbst.",
    kompakt:
      "Von manueller Dokumentation und Kundensteuerung zu einem automatisierten Aufgabenkatalog mit Deadline und Ansprechpartner.",
    kennzahl: "Projektdokumentation",
    kennzahlLabel: "läuft von selbst",
  },
];
