// The named references (spec 2026-11-05-referenzen-page-design.md). Both owners
// agreed to be named on 2026-11-05. The full story lives on /referenzen; the
// homepage and the /leistungen hub show the compact card only.
// MDZ is Ajdin's father's business: wherever the MDZ name appears, the family
// tie appears with it (UWG §5), so `familie` is not optional for MDZ in spirit.

export type Baustein = { titel: string; text: string };

export type Referenz = {
  slug: string; // also the anchor suffix on /referenzen
  name: string;
  label: string; // place line, e.g. "Regensburg" or "Marketingagentur · Regensburg"
  inhaber: string;
  fakten?: string; // only what the client already publishes himself
  familie?: { kurz: string; lang: string };
  titel: string; // compact headline
  ueberblick: string;
  bausteine: Baustein[];
  clip?: { mp4: string; poster: string };
  resultat: string;
  kompakt: string; // one-line summary for the compact card
  kennzahl: string; // the one honest number (Velp: none until Alen approves one)
  kennzahlLabel: string;
};

export type Stimme = { text: string; name: string; firma: string };

export function referenzAnchorId(slug: string): string {
  return `referenz-${slug}`;
}

export const referenzen: Referenz[] = [
  {
    slug: "mdz",
    name: "MDZ Hausmeisterservice",
    label: "Regensburg",
    inhaber: "Mirsad Dzafic",
    fakten: "Seit 2008, über 55 Objekte, eigenes Team.",
    familie: {
      kurz: "Betrieb meines Vaters",
      lang: "Der Betrieb meines Vaters. Hier konnte ich anfangen und habe gesehen, wie meine Systeme ihm die Arbeit leichter machen.",
    },
    titel: "Das Büro läuft per Sprachnachricht.",
    ueberblick:
      "Mirsad ist den ganzen Tag auf seinen Objekten. E-Mails, Termine, Aufgaben fürs Team und Rechnungsdaten blieben bis zum Abend liegen: zwei Stunden Büroarbeit nach der eigentlichen Arbeit, jeden Tag.",
    bausteine: [
      {
        titel: "Telegram-Assistent",
        text: "Mirsad spricht eine Nachricht ein. Der Assistent schreibt die E-Mail und verschickt sie, trägt den Termin ein, gibt die Aufgabe an den richtigen Mitarbeiter und erfasst die Rechnungsdaten.",
      },
      {
        titel: "Rechnungsautomat",
        text: "Aus jedem Rechnungseintrag wird eine nummerierte Rechnung als Word und PDF, abgelegt im richtigen OneDrive-Ordner des Kunden.",
      },
      {
        titel: "MDZ Core",
        text: "Alle Objekte, Preise und Rechnungen seit 2022 in einer Datenbank. Darauf baut die Rechnung per Telegram auf.",
      },
      {
        titel: "Entsorgungsplan",
        text: "Der Monatsplan, wann an welchem Objekt welche Tonne raus muss, für Stadt und Landkreis, direkt aus dem offiziellen Abfallkalender.",
      },
      { titel: "Website", text: "Nebenbei kam eine neue Website dazu." },
    ],
    clip: { mp4: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" },
    resultat:
      "Mirsad muss sich nichts mehr merken. Seine Mitarbeiter wissen, was zu tun ist, die Rechnungen liegen fertig in OneDrive und der Entsorgungsplan stimmt jeden Monat.",
    kompakt: "Ein KI-Assistent, in alle Systeme integriert, erledigt die täglichen Verwaltungsaufgaben.",
    kennzahl: "2 Std./Tag",
    kennzahlLabel: "Büroarbeit weniger",
  },
  {
    slug: "velp",
    name: "Velp",
    label: "Marketingagentur · Regensburg",
    inhaber: "Alen Purisic",
    titel: "Die Kundenübersicht steuert sich selbst.",
    ueberblick:
      "Jeder neue Kunde durchläuft bei Velp dieselben Phasen. Früher wurde jede Karte von Hand weitergeklickt, jede Aufgabe neu angelegt, jede Frist von Hand gesetzt. Das kostete täglich Zeit und ging leicht unter.",
    bausteine: [
      {
        titel: "Phasen-Steuerung",
        text: "Sind alle Aufgaben einer Phase erledigt, schaltet die Kundenkarte von selbst in die nächste Phase.",
      },
      {
        titel: "Aufgaben mit Fristen",
        text: "Für jede neue Phase legt das System die passenden Aufgaben an, mit Werktags-Fristen und dem richtigen Ansprechpartner.",
      },
      {
        titel: "BAFA-Spur",
        text: "Wird ein Kunde über die BAFA gefördert, legt das System die verknüpfte Förderkarte mit ihren Schritten an und weist jeden Schritt dem richtigen Mitarbeiter zu.",
      },
    ],
    resultat:
      "Niemand bewegt mehr eine Karte von Hand. Das Team hat mehr Zeit für die eigentliche Arbeit, statt zu dokumentieren.",
    kompakt:
      "Von manueller Dokumentation und Kundensteuerung zu einem automatisierten Aufgabenkatalog mit Deadline und Ansprechpartner.",
    kennzahl: "Projektdokumentation",
    kennzahlLabel: "läuft von selbst",
  },
];

// Mirsad approves the exact German before the page goes live (spec §6.4).
export const stimmen: Stimme[] = [
  {
    text: "„Ich muss mir nichts mehr merken und nichts mehr aufschreiben. Ich spreche einfach rein und alles wird erledigt.“",
    name: "Mirsad Dzafic",
    firma: "MDZ Hausmeisterservice",
  },
  {
    text: "„Meine Mitarbeiter wissen, was zu tun ist. Sie müssen nicht mehr ständig anrufen. Wir sind viel effizienter geworden.“",
    name: "Mirsad Dzafic",
    firma: "MDZ Hausmeisterservice",
  },
  {
    text: "„Der Entsorgungsplan stimmt immer. Das ist eine immense Hilfe.“",
    name: "Mirsad Dzafic",
    firma: "MDZ Hausmeisterservice",
  },
];
