// src/lib/wartung.ts
//
// The three Wartung tiers (Ajdin 2026-11-11, spec
// docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md §3.5).
// One source for the Betreuung page (comparison table with prices since
// Ajdin 2026-11-11) and the FAQ price sentence.
// The tiers differ first by how much of Ajdin's time the client gets, then by
// how much the system is adapted and improved. Partner is the anchor (×10).
// Standard is spelled out row by row against Minimum, so the step up shows;
// the last row (Ergebnis) tells the reader which tier fits what they want.
// Each cell is a list of short fragments (no full stops): one item renders as
// plain text, several as bullets (Ajdin 2026-11-11).
export type WartungTierId = "minimum" | "standard" | "partner";
export type WartungZeile = "zeit" | "fehler" | "laeuft" | "anpassen" | "verbessern" | "team" | "bericht" | "ergebnis";
export type WartungTier = {
  id: WartungTierId;
  name: string;
  /** Line under the name: how close I work with them. */
  motto: string;
  preisNetto: number;
  grenze?: string;
  zeilen: Record<WartungZeile, string[]>;
};

export const wartungZeilen: { id: WartungZeile; label: string }[] = [
  { id: "zeit", label: "Zeit mit mir" },
  { id: "fehler", label: "Fehler behoben in (Mo bis Fr, 7 bis 17 Uhr)" },
  { id: "laeuft", label: "Läuft weiter" },
  { id: "anpassen", label: "Anpassen" },
  { id: "verbessern", label: "Verbessern" },
  { id: "team", label: "Dein Team" },
  { id: "bericht", label: "Bericht" },
  { id: "ergebnis", label: "Ergebnis" },
];

export const wartungTiers: WartungTier[] = [
  {
    id: "minimum",
    name: "Minimum",
    motto: "Ich passe im Hintergrund auf",
    preisNetto: 249,
    zeilen: {
      zeit: ["Alle 4 Wochen 30 Minuten Call, wenn du ihn brauchst", "Fragen per E-Mail"],
      fehler: ["48 Stunden"],
      laeuft: ["Überwachung mit echtem Alarm", "Updates und Backup geprüft", "Doku bei jeder Änderung", "KI-Modelle und Prompts aktuell, wenn dein System KI nutzt"],
      anpassen: ["Ich behebe, was bricht", "Eine Änderung im Monat, etwa ein neues Feld"],
      verbessern: ["Nicht enthalten"],
      team: ["Nicht enthalten"],
      bericht: ["Jeden Monat eine Zahl: wie viele Vorgänge dein System erledigt hat"],
      ergebnis: ["Es läuft", "Richtig, wenn dein System zuverlässig laufen soll und sonst nichts"],
    },
  },
  {
    id: "standard",
    name: "Standard",
    motto: "Ich bin regelmäßig an deiner Seite",
    preisNetto: 945,
    zeilen: {
      zeit: ["Alle 2 Wochen 30 Minuten Call", "Antwort auf deine Fragen am selben Werktag"],
      fehler: ["24 Stunden"],
      laeuft: ["Alles aus Minimum", "Jedes Quartal teste ich, ob sich dein System aus dem Backup wiederherstellen lässt"],
      anpassen: ["Ich passe an, bevor ein Update etwas kaputt macht", "Drei Änderungen im Monat, etwa ein neues Feld oder eine neue Regel"],
      verbessern: ["Jedes Quartal ein neuer Baustein, etwa eine Erinnerung oder eine Auswertung", "Im Quartalsgespräch planen wir den nächsten Schritt in deinem Fahrplan"],
      team: ["Jedes Quartal weise ich einen neuen Mitarbeiter ein"],
      bericht: ["Jeden Monat: was gelaufen ist, was ich geändert habe und was als Nächstes möglich ist"],
      ergebnis: ["Es läuft und wird besser", "Richtig, wenn dein System mit deinem Betrieb wachsen soll"],
    },
  },
  {
    id: "partner",
    name: "Partner",
    motto: "Ich bin Teil von deinem Team",
    preisNetto: 9900,
    grenze: "Für höchstens zwei Betriebe",
    zeilen: {
      zeit: ["Jede Woche 90 Minuten Arbeitssitzung", "Direkter Draht per Telegram oder WhatsApp, Antwort in 2 Stunden", "Ein Tag im Monat mit deinem Team"],
      fehler: ["12 Stunden"],
      laeuft: ["Alles aus Standard"],
      anpassen: ["Alles, sobald es ansteht"],
      verbessern: ["Jeden Monat ein fester Bautag für den nächsten Baustein"],
      team: ["So oft ihr es braucht"],
      bericht: ["Jede Woche"],
      ergebnis: ["Wir automatisieren deinen Betrieb", "Richtig, wenn du Schritt für Schritt alles automatisieren willst, was sich lohnt"],
    },
  },
];

export const WARTUNG_TITEL = "Die drei Stufen unterscheiden sich darin, wie viel Zeit du von mir bekommst.";

// Ajdin 2026-11-11: three months minimum, then monthly. Every cancellation line says this.
export const WARTUNG_KUENDIGUNG = "Ab dem 3. Monat monatlich kündbar.";

export const WARTUNG_HINWEIS = `${WARTUNG_KUENDIGUNG} Kündigst du, läuft dein System sicher weiter, nur ohne Anpassungen.`;

const eur = new Intl.NumberFormat("de-DE");

/** Price label in the Betreuung table header, e.g. 9.900 €. */
export function wartungPreis(t: WartungTier): string {
  return `${eur.format(t.preisNetto)} €`;
}

export const WARTUNG_PREIS_ZUSATZ = "im Monat, netto";

/** The FAQ's price sentence (the Betreuung table shows the same prices). */
export function wartungPreisSatz(): string {
  const [m, s, p] = wartungTiers;
  return `Drei Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: ${m.name} für ${eur.format(m.preisNetto)}, ${s.name} für ${eur.format(s.preisNetto)} oder ${p.name} für ${eur.format(p.preisNetto)} Euro im Monat, netto und ab dem 3. Monat monatlich kündbar. ${p.name} gibt es für höchstens zwei Betriebe.`;
}
