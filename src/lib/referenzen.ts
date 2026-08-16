export type Referenz = {
  slug: string;
  label: string; // anonymized "branch · region"
  titel: string; // one-line headline
  problem: string; // Das Problem
  gebaut: string; // Gebaut
  laeuft: string; // Läuft
  ergebnis: string; // the freier-Kopf close (also the compact result line)
  kennzahl: string; // the one honest number
  kennzahlLabel: string; // caption under the number
};

export const referenzen: Referenz[] = [
  {
    slug: "agentur",
    label: "Marketingagentur · Region Regensburg",
    titel: "Die Kundenübersicht steuert sich selbst.",
    problem:
      "Jeder neue Kunde durchlief dieselben Phasen – von Hand weitergeklickt, Aufgaben jedes Mal neu angelegt, Fristen manuell gesetzt. Das kostete täglich Zeit und ging leicht unter.",
    gebaut:
      "Ein System, das jede Kundenkarte automatisch weiterschaltet, sobald ihre Aufgaben erledigt sind – mit den passenden Aufgaben und Werktags-Fristen für die nächste Phase.",
    laeuft:
      "Seit Monaten still im Hintergrund, quer durch fünf Übersichten – ohne dass jemand eine Karte von Hand bewegt.",
    ergebnis:
      "Am Ende: ein freier Kopf. Ordnung und Struktur statt täglichem Nachhalten – ein verlässlicher Prozess, der den Betrieb im Hintergrund trägt.",
    kennzahl: "5 Übersichten",
    kennzahlLabel: "laufen von selbst",
  },
  {
    slug: "hausmeister",
    label: "Hausmeisterservice · Oberpfalz",
    titel: "Das Büro läuft per Sprachnachricht.",
    problem:
      "Der Inhaber ist den ganzen Tag auf seinen Objekten, selten am Schreibtisch. E-Mails, Termine, Aufgaben und Rechnungsdaten stapelten sich – und wurden abends nachgeholt.",
    gebaut:
      "Ein Assistent per Telegram: Er spricht unterwegs kurz hinein, der Rest passiert von selbst – E-Mail geschrieben und verschickt, Termin eingetragen, Aufgabe an einen Mitarbeiter, Notiz abgelegt, Rechnungsdaten erfasst.",
    laeuft:
      "Aus ein bis zwei Stunden Büroarbeit am Abend wird eine kurze Sprachnachricht zwischendurch.",
    ergebnis:
      "Am Ende: ein freier Kopf. Der Ablauf ist geordnet und läuft verlässlich – der Inhaber muss nicht mehr daran denken.",
    kennzahl: "1–2 Std./Tag",
    kennzahlLabel: "zurückgewonnen",
  },
];
