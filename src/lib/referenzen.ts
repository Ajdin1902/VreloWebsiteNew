export type Referenz = {
  slug: string;
  label: string; // anonymized "branch · region"
  titel: string; // one-line headline
  problem: string; // Das Problem
  gebaut: string; // Gebaut
  laeuft: string; // Läuft
  ergebnis: string; // the freier-Kopf close (full card only)
  kompakt: string; // one-line summary for the compact homepage card
  kennzahl: string; // the one honest number
  kennzahlLabel: string; // caption under the number
};

export const referenzen: Referenz[] = [
  {
    slug: "agentur",
    label: "Marketingagentur · Regensburg",
    titel: "Die Kundenübersicht steuert sich selbst.",
    problem:
      "Jeder neue Kunde durchlief dieselben Phasen. Jede Karte wurde von Hand weitergeklickt, die Aufgaben jedes Mal neu angelegt, die Fristen manuell gesetzt. Das kostete täglich Zeit und ging leicht unter.",
    gebaut:
      "Ein System, das jede Kundenkarte automatisch weiterschaltet, sobald ihre Aufgaben erledigt sind. Die passenden Aufgaben und Werktags-Fristen für die nächste Phase legt es gleich mit an.",
    laeuft:
      "Seit Monaten läuft es still im Hintergrund, quer durch fünf Übersichten, ohne dass jemand eine Karte von Hand bewegt.",
    ergebnis:
      "Resultat: Der Aufgabenkatalog steuert und aktualisiert sich von selbst. Die Mitarbeiter haben mehr Zeit, um die eigentliche Arbeit zu erledigen, anstatt zu dokumentieren.",
    kompakt:
      "Von manueller Dokumentation und Kundensteuerung zu einem automatisierten Aufgabenkatalog mit Deadline und Ansprechpartner.",
    kennzahl: "5 Übersichten",
    kennzahlLabel: "laufen von selbst",
  },
  {
    slug: "hausmeister",
    label: "Hausmeisterservice · Regensburg",
    titel: "Das Büro läuft per Sprachnachricht.",
    problem:
      "Der Inhaber ist den ganzen Tag auf seinen Objekten, selten am Schreibtisch. E-Mails, Termine, Aufgaben und Rechnungsdaten stapelten sich und wurden abends nachgeholt.",
    gebaut:
      "Ein KI-Assistent per Telegram: Der Inhaber spricht unterwegs kurz hinein, der Rest passiert von selbst. E-Mail geschrieben und verschickt, Termin eingetragen, Aufgabe an einen Mitarbeiter, Notiz abgelegt, Rechnungsdaten erfasst.",
    laeuft:
      "Aus ein bis zwei Stunden Büroarbeit am Abend wird eine kurze Sprachnachricht zwischendurch.",
    ergebnis:
      "Resultat: Sprachnachrichten sparen Stunden an Verwaltungsaufgaben nach dem Feierabend.",
    kompakt:
      "Ein KI-Assistent, in alle Systeme integriert, erledigt die täglichen Verwaltungsaufgaben.",
    kennzahl: "1 bis 2 Std./Tag",
    kennzahlLabel: "zurückgewonnen",
  },
];
