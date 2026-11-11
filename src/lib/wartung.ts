// src/lib/wartung.ts
//
// The three Wartung tiers (Ajdin 2026-11-11, spec
// docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md §3.5).
// One source for the Betreuung page (contents, no prices) and the FAQ (prices).
// The tiers differ first by how much of Ajdin's time the client gets, then by
// how much the system is adapted and improved. Partner is the anchor (×10).
export type WartungTierId = "minimum" | "standard" | "partner";
export type WartungZeile = "zeit" | "fehler" | "laeuft" | "anpassen" | "verbessern" | "team" | "bericht";
export type WartungTier = {
  id: WartungTierId;
  name: string;
  motto: string;
  preisNetto: number;
  grenze?: string;
  zeilen: Record<WartungZeile, string>;
};

export const wartungZeilen: { id: WartungZeile; label: string }[] = [
  { id: "zeit", label: "Zeit mit mir" },
  { id: "fehler", label: "Fehler behoben in (Mo bis Fr, 7 bis 17 Uhr)" },
  { id: "laeuft", label: "Läuft weiter" },
  { id: "anpassen", label: "Anpassen" },
  { id: "verbessern", label: "Verbessern" },
  { id: "team", label: "Dein Team" },
  { id: "bericht", label: "Bericht" },
];

export const wartungTiers: WartungTier[] = [
  {
    id: "minimum",
    name: "Minimum",
    motto: "Es läuft.",
    preisNetto: 249,
    zeilen: {
      zeit: "Alle 4 Wochen 30 Minuten Call, wenn du ihn brauchst. Dazu E-Mail.",
      fehler: "48 Stunden",
      laeuft: "Überwachung mit echtem Alarm, KI-Modelle und Prompts aktuell, Updates, Backup geprüft, Doku bei jeder Änderung",
      anpassen: "Ich behebe, was bricht. Eine kleine Änderung im Monat.",
      verbessern: "Nicht enthalten",
      team: "Nicht enthalten",
      bericht: "Eine Zahl im Monat",
    },
  },
  {
    id: "standard",
    name: "Standard",
    motto: "Es läuft und wird besser.",
    preisNetto: 945,
    zeilen: {
      zeit: "Alle 2 Wochen 30 Minuten Call, wenn du ihn brauchst. Antwort am selben Werktag.",
      fehler: "24 Stunden",
      laeuft: "Wie Minimum, dazu jedes Quartal eine getestete Wiederherstellung",
      anpassen: "Ich passe an, bevor ein angebundenes Programm etwas kaputt macht. Drei kleine Änderungen im Monat.",
      verbessern: "Jedes Quartal ein neuer kleiner Baustein. Im Quartalsgespräch aktualisieren wir deinen Fahrplan.",
      team: "Jedes Quartal ein neuer Mitarbeiter eingewiesen",
      bericht: "Zahl, Notiz und Empfehlung",
    },
  },
  {
    id: "partner",
    name: "Partner",
    motto: "Ich gehöre zu deinem Team.",
    preisNetto: 9900,
    grenze: "Für höchstens zwei Betriebe",
    zeilen: {
      zeit: "Jede Woche 90 Minuten Arbeitssitzung. Direkter Draht per Telegram oder WhatsApp, Antwort in 2 Stunden. Ein Tag im Monat mit deinem Team.",
      fehler: "12 Stunden",
      laeuft: "Wie Standard",
      anpassen: "Alles, sobald es ansteht.",
      verbessern: "Jeden Monat ein fester Bautag für den nächsten Baustein.",
      team: "So oft ihr es braucht",
      bericht: "Jede Woche",
    },
  },
];

export const WARTUNG_HINWEIS =
  "KI-Modelle und Prompts halte ich aktuell, wenn dein System KI nutzt. Monatlich kündbar: Kündigst du, läuft dein System sicher weiter, nur ohne Anpassungen.";

const eur = new Intl.NumberFormat("de-DE");

/** The FAQ's price sentence; prices appear nowhere else on the site. */
export function wartungPreisSatz(): string {
  const [m, s, p] = wartungTiers;
  return `Drei Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: ${m.name} für ${eur.format(m.preisNetto)}, ${s.name} für ${eur.format(s.preisNetto)} oder ${p.name} für ${eur.format(p.preisNetto)} Euro im Monat, netto und monatlich kündbar. ${p.name} gibt es für höchstens zwei Betriebe.`;
}
