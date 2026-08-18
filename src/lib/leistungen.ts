export type Leistung = {
  slug: string;
  title: string;
  punchline: string;
  kurz: string; // one short sentence for the compact card
  outcomes: string[];
};

export const leistungen: Leistung[] = [
  {
    slug: "assistent",
    title: "Persönlicher Assistent",
    punchline: "Dein Büro per Sprachnachricht.",
    kurz: "Ein Assistent per Telegram oder WhatsApp, abgestimmt auf deinen Betrieb. Alle Systeme miteinander verbunden. Du sprichst unterwegs kurz hinein, den Rest erledigt er: Mail, Termin, Aufgabe, Notiz.",
    outcomes: ["kein Abendbüro", "per Sprachnachricht erledigt", "auf deinen Betrieb abgestimmt"],
  },
  {
    slug: "anfragen-leads",
    title: "Anfragen & Leads",
    punchline: "Wer zuerst antwortet, gewinnt.",
    kurz: "Jede Anfrage wird sofort bestätigt, qualifiziert und an den richtigen Kanal weitergeleitet, bevor sie im Tagesgeschäft liegen bleibt.",
    outcomes: ["sofortige Eingangsbestätigung", "automatische Qualifizierung", "kein verlorener Lead"],
  },
  {
    slug: "termine",
    title: "Termine & Bestätigungen",
    punchline: "Schluss mit dem Termin-Pingpong.",
    kurz: "Dein Kunde bucht per Link. Termine werden automatisch bestätigt, rechtzeitig erinnert und bei Absagen sauber nachgehalten.",
    outcomes: ["weniger No-Shows", "kein Termin-Pingpong", "automatische Erinnerungen"],
  },
  {
    slug: "angebote-rechnungen",
    title: "Angebote & Rechnungen",
    punchline: "Vom Angebot bis zur Mahnung, von selbst.",
    kurz: "Angebote aus Vorlagen, Rechnungen nach dem Auftrag und ein Mahnwesen, das bei offenen Beträgen freundlich, aber zuverlässig erinnert.",
    outcomes: ["Angebote in Minuten", "Rechnung nach Auftrag", "automatisches Mahnwesen"],
  },
  {
    slug: "dateneingabe",
    title: "Dateneingabe",
    punchline: "Eine Eingabe, überall aktuell.",
    kurz: "Eine Eingabe befüllt alle Systeme, synchronisiert sie und hält sie auf demselben Stand. Sauber dokumentiert, damit es auch in einem Jahr noch läuft.",
    outcomes: ["kein Abtippen", "weniger Fehler", "Systeme im Gleichstand"],
  },
  {
    slug: "prozesssteuerung",
    title: "Prozess- & Aufgabensteuerung",
    punchline: "Aufgaben steuern sich selbst.",
    kurz: "Automatisierte Dokumentation deiner Prozesse. Ob Kundenakquise, Entwicklungsprozess oder Eigenprojekte. Alles mit den passenden Aufgaben, Fristen und Zuständigkeiten.",
    outcomes: ["nichts bleibt liegen", "Fristen automatisch", "immer die nächste Phase"],
  },
];
