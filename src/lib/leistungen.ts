export type Leistung = {
  slug: string;
  title: string;
  punchline: string;
  body: string;
  outcomes: string[];
};

export const leistungen: Leistung[] = [
  {
    slug: "termine",
    title: "Termine & Bestätigungen",
    punchline: "Schluss mit Hinterhertelefonieren.",
    body: "Termine werden automatisch bestätigt, erinnert und nachgehalten. Deine Kund:innen bekommen rechtzeitig Bescheid — und du musst nicht mehr daran denken.",
    outcomes: ["weniger No-Shows", "automatische Erinnerungen", "kein Nachtelefonieren"],
  },
  {
    slug: "nachfass-mails",
    title: "Nachfass-Mails",
    punchline: "Nichts fällt mehr durchs Raster.",
    body: "Angebote und offene Anfragen werden automatisch nachgefasst — freundlich, pünktlich und in deinem Ton. Kein Auftrag geht mehr verloren, weil eine Mail liegen geblieben ist.",
    outcomes: ["pünktliche Follow-ups", "mehr abgeschlossene Angebote", "in deinem Ton"],
  },
  {
    slug: "dateneingabe",
    title: "Dateneingabe",
    punchline: "Daten landen dort, wo sie hingehören.",
    body: "Informationen aus Formularen, Mails oder PDFs werden automatisch erfasst und in deine Systeme übertragen — ohne Abtippen, ohne Copy-Paste, ohne Zahlendreher.",
    outcomes: ["kein Abtippen", "weniger Fehler", "saubere Daten"],
  },
  {
    slug: "kommunikation",
    title: "Wiederkehrende Kommunikation",
    punchline: "Routine-Nachrichten schreiben sich von selbst.",
    body: "Wiederkehrende E-Mails und Benachrichtigungen — Bestätigungen, Status-Updates, Rückmeldungen — laufen automatisch. Persönlich genug, dass niemand den Unterschied merkt. Sauber dokumentiert, damit es auch in einem Jahr noch läuft.",
    outcomes: ["immer rechtzeitig", "persönlich & automatisch", "mehr Zeit für echte Gespräche"],
  },
];
