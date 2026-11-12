// src/lib/wartung.ts
//
// The Wartung tiers (Ajdin 2026-11-11, spec
// docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md §3.5).
// One source for the Betreuung page (comparison table with prices) and the FAQ
// price bullets.
// The tiers differ first by how much of Ajdin's time the client gets, then by
// how much the system is adapted and improved. Partner is the anchor (×10).
// Each tier is spelled out row by row, so the step up shows;
// the last row (Ergebnis) tells the reader which tier fits what they want.
// Each cell is a list of short fragments (no full stops): one item renders as
// plain text, several as bullets (Ajdin 2026-11-11).
// Ajdin 2026-11-12: four tiers. Minimum (95) is the floor: updates on the client's
// own server and 72 h fixes, nothing else. The old Minimum is Basis now; Partner
// shows no price („Auf Anfrage“).
export type WartungTierId = "minimum" | "basis" | "standard" | "partner";
export type WartungZeile = "zeit" | "fehler" | "laeuft" | "anpassen" | "verbessern" | "team" | "bericht" | "ergebnis";
export type WartungTier = {
  id: WartungTierId;
  name: string;
  /** Line under the name: how close I work with them. */
  motto: string;
  /** Monthly net price; none for Partner (on request). */
  preisNetto?: number;
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
    motto: "Ich halte dein System aktuell",
    preisNetto: 95,
    zeilen: {
      zeit: ["Nicht enthalten"],
      fehler: ["72 Stunden"],
      laeuft: ["Updates für Server und Programme", "Dein Server bleibt auf deinem Konto"],
      anpassen: ["Nicht enthalten"],
      verbessern: ["Nicht enthalten"],
      team: ["Nicht enthalten"],
      bericht: ["Jeden Monat eine kurze Notiz: welche Updates ich eingespielt habe"],
      ergebnis: ["Es bleibt aktuell", "Richtig, wenn dein System einfach aktuell bleiben soll"],
    },
  },
  {
    id: "basis",
    name: "Basis",
    motto: "Ich passe im Hintergrund auf",
    preisNetto: 249,
    zeilen: {
      zeit: ["Alle 4 Wochen 30 Minuten Call, wenn du ihn brauchst", "Fragen per E-Mail"],
      fehler: ["48 Stunden"],
      laeuft: ["Alles aus Minimum", "Überwachung mit echtem Alarm", "Backup geprüft", "Doku bei jeder Änderung", "KI-Modelle und Prompts aktuell, wenn dein System KI nutzt"],
      anpassen: ["Ich behebe, was bricht", "Eine Änderung im Monat, etwa ein neues Feld"],
      verbessern: ["Nicht enthalten"],
      team: ["Nicht enthalten"],
      bericht: ["Jeden Monat eine Zahl: wie viele Vorgänge dein System erledigt hat"],
      ergebnis: ["Es läuft", "Richtig, wenn dein System zuverlässig laufen soll"],
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
      laeuft: ["Alles aus Basis", "Jedes Quartal ein Backup-Test", "Höhere Priorität"],
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
    grenze: "Für höchstens zwei Betriebe",
    zeilen: {
      zeit: ["Jede Woche 90 Minuten Arbeitssitzung", "Direkter Draht per Telegram oder WhatsApp, Antwort in 2 Stunden", "Ein Tag im Monat mit deinem Team"],
      fehler: ["12 Stunden"],
      laeuft: ["Alles aus Standard", "Höchste Priorität"],
      anpassen: ["Alles, sobald es ansteht"],
      verbessern: ["Jeden Monat ein fester Bautag für den nächsten Baustein"],
      team: ["So oft ihr es braucht"],
      bericht: ["Jede Woche"],
      ergebnis: ["Wir automatisieren deinen Betrieb", "Richtig, wenn du Schritt für Schritt alles automatisieren willst, was sich lohnt"],
    },
  },
];

export const WARTUNG_TITEL = "Die vier Stufen unterscheiden sich darin, wie viel Zeit du von mir bekommst.";

// Ajdin 2026-11-11: three months minimum, then monthly. Every cancellation line says this.
export const WARTUNG_KUENDIGUNG = "Ab dem 3. Monat monatlich kündbar.";

// Ajdin 2026-11-12: without Betreuung nobody updates the system any more; say so
// („von mir“: the server's own OS auto-patching keeps running).
export const WARTUNG_HINWEIS = `${WARTUNG_KUENDIGUNG} Kündigst du, läuft dein System weiter, nur ohne Updates und Anpassungen von mir.`;

const eur = new Intl.NumberFormat("de-DE");

/** Price label in the Betreuung table, e.g. 945 €; Partner reads Auf Anfrage. */
export function wartungPreis(t: WartungTier): string {
  return t.preisNetto === undefined ? "Auf Anfrage" : `${eur.format(t.preisNetto)} €`;
}

export const WARTUNG_PREIS_ZUSATZ = "im Monat, netto";

/** Label of the price row, the last row of the Betreuung table. */
export const WARTUNG_PREIS_LABEL = "Preis";

/** The FAQ's price bullets (the Betreuung table shows the same prices). */
export function wartungPreisPunkte(): string[] {
  const [m, b, s, p] = wartungTiers;
  const n = (t: WartungTier) => eur.format(t.preisNetto!);
  return [
    `Betreuung, wenn du willst: ${m.name} ${n(m)}, ${b.name} ${n(b)} oder ${s.name} ${n(s)} Euro im Monat, netto`,
    `${p.name} auf Anfrage, für höchstens zwei Betriebe`,
    WARTUNG_KUENDIGUNG.replace(/\.$/, ""),
    "Ohne Betreuung läuft dein System weiter, nur ohne Updates und Anpassungen von mir",
  ];
}
