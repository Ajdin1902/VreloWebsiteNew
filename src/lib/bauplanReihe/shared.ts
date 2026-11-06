// Shared copy and level rule for the Bauplan series (one free PDF guide per niche).
// Consumed by the PDF template guard and the web page; no price, duration,
// guarantee or capacity line belongs here (spec 2026-11-06-bauplan-reihe-design §4).

export type StationStand = "laeuft" | "papier" | "kopf";
export type Level = 0 | 1 | 2 | 3 | 4;

export function levelFor(counts: { laeuft: number; papier: number; kopf: number }, fundament: boolean): Level {
  if (counts.laeuft === 0) return counts.papier > counts.kopf ? 1 : 0;
  if (!fundament) return 2;
  return counts.laeuft >= 10 ? 4 : 3;
}

export const LEVELS: { level: Level; name: string; satz: string }[] = [
  { level: 0, name: "Im Kopf", satz: "Schreib auf, was du heute nur im Kopf trägst. Eine Station reicht für den Anfang." },
  { level: 1, name: "Verstreut", satz: "Vieles steht schon auf Papier oder in Dateien. Such dir die eine Station aus, die dich am meisten Zeit kostet." },
  { level: 2, name: "Erste Station läuft", satz: "Eine Station läuft von selbst. Als Nächstes brauchen deine Daten einen festen Platz, damit alles auf denselben Ort zugreift." },
  { level: 3, name: "Ein Ort", satz: "Deine Daten liegen an einem Ort. Jetzt holst du eine Station nach der anderen in dein System." },
  { level: 4, name: "Haus steht", satz: "Fast alles läuft von selbst. Schließ die letzten Lücken und schreib auf, wie die Stationen zusammenhängen." },
];

export const selbstcheck = {
  heading: "Dein Stand je Station",
  intro:
    "Mach pro Station ein Kreuz in einer der drei Spalten: läuft von selbst, auf Papier oder in Dateien, nur im Kopf. Zähl am Ende die Kreuze je Spalte.",
  spalten: ["Läuft von selbst", "Auf Papier oder in Dateien", "Nur im Kopf"] as [string, string, string],
  fundamentFrage: "Liegen deine Kundendaten an einem festen Ort, auf den alles zugreift?",
  blankHinweis: "Eine leere Zeile zählt als \u201Enur im Kopf\u201C.",
};

export const abschluss = {
  heading: "Wenn du es nicht allein bauen willst",
  text: [
    "Im Prozess-Audit schauen wir gemeinsam, wo in deinem Betrieb die meiste Zeit hängen bleibt. Er kostet dich nichts.",
    "Den Anfang macht ein Gespräch von 30 Minuten. Ergibt sich daraus etwas Sinnvolles, schreibe ich dir einen Fahrplan. Wenn nicht, sage ich es dir ehrlich.",
  ],
  button: "30 Minuten Gespräch vereinbaren",
};

export function abschlussHref(slug: string, medium: "pdf" | "web"): string {
  // Not kontaktHref: it only accepts the typed CheckSrc slugs of the front door.
  return medium === "pdf" ? `https://vrelo-ki.de/kontakt?src=bauplan-${slug}-pdf` : `/kontakt?src=bauplan-${slug}`;
}
