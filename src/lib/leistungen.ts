export type Leistung = {
  slug: string;
  title: string;
  punchline: string;
  body: string;
  outcomes: string[];
};

export const leistungen: Leistung[] = [
  {
    slug: "anfragen-leads",
    title: "Anfragen & Leads",
    punchline: "Wer zuerst antwortet, gewinnt.",
    body: "Eine Anfrage kommt per E-Mail, Kontaktformular oder WhatsApp – und bleibt im Tagesgeschäft erst mal drei Tage liegen. Oft genug ist der Auftrag dann beim Wettbewerber, der schneller war. Ich baue dir einen Eingang, der sofort bestätigt, die Anfrage qualifiziert, an den richtigen Kanal weiterleitet und gleich einen Termin vorschlägt.",
    outcomes: ["sofortige Eingangsbestätigung", "automatische Qualifizierung", "kein verlorener Lead"],
  },
  {
    slug: "termine",
    title: "Termine & Bestätigungen",
    punchline: "Schluss mit dem Termin-Pingpong.",
    body: "Statt fünf E-Mails hin und her bekommt dein Kunde einen Buchungslink. Termine werden automatisch bestätigt, rechtzeitig erinnert und bei Absagen oder Verschiebungen sauber nachgehalten. Das spart pro Termin schnell zehn bis fünfzehn Minuten – und senkt No-Shows spürbar.",
    outcomes: ["weniger No-Shows", "kein Termin-Pingpong", "automatische Erinnerungen"],
  },
  {
    slug: "angebote-rechnungen",
    title: "Angebote & Rechnungen",
    punchline: "Vom Angebot bis zur Mahnung – von selbst.",
    body: "Jedes Angebot in Word neu tippen, jede Rechnung einzeln bauen, hinterherschicken und überwachen: Das kostet Zeit und Nerven. Ich baue dir Angebotsvorlagen mit Variablen, automatische Rechnungen nach der Auftragsbestätigung und ein Mahnwesen, das bei offenen Rechnungen freundlich, aber zuverlässig erinnert.",
    outcomes: ["Angebote in Minuten", "Rechnung nach Auftrag", "automatisches Mahnwesen"],
  },
  {
    slug: "nachfass-mails",
    title: "Nachfass-Mails",
    punchline: "Nichts fällt mehr durchs Raster.",
    body: "Angebote und offene Anfragen werden automatisch nachgefasst – freundlich, pünktlich und in deinem Ton. Kein Auftrag geht mehr verloren, weil eine Mail liegen geblieben ist.",
    outcomes: ["pünktliche Follow-ups", "mehr abgeschlossene Angebote", "in deinem Ton"],
  },
  {
    slug: "dateneingabe",
    title: "Dateneingabe",
    punchline: "Eine Eingabe, überall aktuell.",
    body: "Kundendaten landen in der E-Mail, dann im CRM, dann in der Buchhaltung, dann in Excel – jede manuelle Übertragung kostet Zeit und produziert Zahlendreher. Ich baue dir einen zentralen Datenfluss: Eine Eingabe befüllt alle Systeme, synchronisiert sie und hält sie auf demselben Stand.",
    outcomes: ["kein Abtippen", "weniger Fehler", "Systeme im Gleichstand"],
  },
  {
    slug: "kommunikation",
    title: "Wiederkehrende Kommunikation",
    punchline: "Routine-Nachrichten schreiben sich von selbst.",
    body: "Wiederkehrende E-Mails und Benachrichtigungen – Bestätigungen, Status-Updates, Rückmeldungen – laufen automatisch. Persönlich genug, dass niemand den Unterschied merkt. Sauber dokumentiert, damit es auch in einem Jahr noch läuft.",
    outcomes: ["immer rechtzeitig", "persönlich & automatisch", "mehr Zeit für echte Gespräche"],
  },
  {
    slug: "bewertungen",
    title: "Bewertungen einsammeln",
    punchline: "Aus zufriedenen Kunden werden sichtbare Bewertungen.",
    body: "Zufriedene Kunden hinterlassen selten von allein eine Bewertung – einfach, weil im Alltag niemand daran denkt. Nach dem Auftragsabschluss geht automatisch eine freundliche Bitte raus, mit Direktlink zur Bewertung. Ohne Drängeln, im richtigen Moment.",
    outcomes: ["mehr Google-Bewertungen", "im richtigen Moment", "ganz ohne Drängeln"],
  },
];
