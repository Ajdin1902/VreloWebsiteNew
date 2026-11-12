import { describe, it, expect } from "vitest";
import {
  wartungTiers,
  wartungZeilen,
  WARTUNG_HINWEIS,
  WARTUNG_TITEL,
  WARTUNG_KUENDIGUNG,
  WARTUNG_PREIS_ZUSATZ,
  WARTUNG_PREIS_LABEL,
  wartungPreis,
  wartungPreisSatz,
} from "./wartung";
import { findCopyIssues } from "./ratgeberCopy";

const txt = (items: string[]) => items.join(" ");

describe("wartung tiers (Ajdin 2026-11-11, four tiers since 2026-11-12)", () => {
  it("has four tiers with the agreed names and prices, Partner without a price", () => {
    expect(wartungTiers.map((t) => [t.id, t.name, t.preisNetto])).toEqual([
      ["minimum", "Minimum", 95],
      ["basis", "Basis", 249],
      ["standard", "Standard", 945],
      ["partner", "Partner", undefined],
    ]);
    expect(wartungTiers[3].grenze).toBe("Für höchstens zwei Betriebe");
  });

  it("labels each price for the table, Partner on request", () => {
    expect(wartungTiers.map(wartungPreis)).toEqual(["95 €", "249 €", "945 €", "Auf Anfrage"]);
    expect(WARTUNG_PREIS_ZUSATZ).toBe("im Monat, netto");
    expect(WARTUNG_PREIS_LABEL).toBe("Preis");
  });

  // Ajdin 2026-11-12: Minimum is the floor: updates and keeping it running, nothing else.
  it("keeps Minimum to updates on the client's own server and 72 hour fixes", () => {
    const m = wartungTiers[0];
    expect(m.motto).toBe("Ich halte dein System aktuell");
    expect(m.zeilen.laeuft).toEqual(["Updates für Server und Programme", "Dein Server bleibt auf deinem Konto"]);
    for (const z of ["zeit", "anpassen", "verbessern", "team"] as const) expect(m.zeilen[z], z).toEqual(["Nicht enthalten"]);
    // Ajdin 2026-11-12: a short report, so they always see what I do.
    expect(m.zeilen.bericht).toEqual(["Jeden Monat eine kurze Notiz: welche Updates ich eingespielt habe"]);
    expect(m.zeilen.ergebnis).toEqual(["Es bleibt aktuell", "Richtig, wenn dein System einfach aktuell bleiben soll"]);
  });

  // Ajdin 2026-11-11: a second line under each name says how close I work with them.
  it("gives every tier its own line about our time together, Partner as part of the team", () => {
    expect(wartungTiers[1].motto).toBe("Ich passe im Hintergrund auf");
    expect(wartungTiers[3].motto).toBe("Ich bin Teil von deinem Team");
    for (const t of wartungTiers) expect(t.motto.trim(), t.id).not.toBe("");
    expect(new Set(wartungTiers.map((t) => t.motto)).size).toBe(4);
  });

  it("fills every row for every tier and keeps fix times 72/48/24/12", () => {
    expect(wartungZeilen).toHaveLength(8);
    for (const t of wartungTiers)
      for (const z of wartungZeilen) {
        expect(t.zeilen[z.id].length, `${t.id}.${z.id}`).toBeGreaterThan(0);
        for (const item of t.zeilen[z.id]) expect(item.trim(), `${t.id}.${z.id}`).not.toBe("");
      }
    expect(wartungTiers.map((t) => t.zeilen.fehler)).toEqual([["72 Stunden"], ["48 Stunden"], ["24 Stunden"], ["12 Stunden"]]);
  });

  // Ajdin 2026-11-11: several lines become bullets, short and concise.
  it("writes each cell as short bullets, one fragment each", () => {
    for (const t of wartungTiers)
      for (const z of wartungZeilen)
        for (const item of t.zeilen[z.id]) {
          expect(item, `${t.id}.${z.id}`).not.toMatch(/\.$/);
          expect(item, `${t.id}.${z.id}`).not.toMatch(/\. /);
          expect(item.length, `${t.id}.${z.id}: ${item}`).toBeLessThanOrEqual(90);
        }
  });

  // Ajdin 2026-11-11: the last row tells which tier to pick.
  it("ends on an Ergebnis row that says which tier fits whom", () => {
    expect(wartungZeilen.at(-1)).toEqual({ id: "ergebnis", label: "Ergebnis" });
    expect(wartungTiers.map((t) => t.zeilen.ergebnis[0])).toEqual([
      "Es bleibt aktuell",
      "Es läuft",
      "Es läuft und wird besser",
      "Wir automatisieren deinen Betrieb",
    ]);
    for (const t of wartungTiers) expect(t.zeilen.ergebnis[1], t.id).toMatch(/^Richtig, wenn /);
    // Only Minimum is the "nothing else" tier since 2026-11-12.
    expect(wartungTiers[1].zeilen.ergebnis[1]).toBe("Richtig, wenn dein System zuverlässig laufen soll");
    expect(JSON.stringify(wartungTiers.slice(1))).not.toMatch(/sonst nichts/);
  });

  // Basis adds the real alarm over Minimum; Standard is spelled out against Basis.
  it("builds each tier on the one below", () => {
    const [, b, s, p] = wartungTiers;
    expect(b.zeilen.laeuft).toEqual([
      "Alles aus Minimum",
      "Überwachung mit echtem Alarm",
      "Backup geprüft",
      "Doku bei jeder Änderung",
      "KI-Modelle und Prompts aktuell, wenn dein System KI nutzt",
    ]);
    // Ajdin 2026-11-11: the backup line names the test; Standard gets higher priority.
    expect(s.zeilen.laeuft).toEqual(["Alles aus Basis", "Jedes Quartal ein Backup-Test", "Höhere Priorität"]);
    expect(p.zeilen.laeuft).toEqual(["Alles aus Standard", "Höchste Priorität"]);
    expect(txt(s.zeilen.anpassen)).toMatch(/Drei Änderungen im Monat, etwa/);
    expect(txt(b.zeilen.anpassen)).toMatch(/Eine Änderung im Monat, etwa/);
    for (const t of wartungTiers) expect(txt(t.zeilen.anpassen)).not.toMatch(/kleine Änderung/);
    expect(txt(s.zeilen.verbessern)).toMatch(/Baustein, etwa/);
    expect(s.zeilen.bericht).toEqual(["Jeden Monat: was gelaufen ist, was ich geändert habe und was als Nächstes möglich ist"]);
    expect(b.zeilen.verbessern).toEqual(["Nicht enthalten"]);
  });

  // Ajdin 2026-11-11: three months minimum, then monthly. 2026-11-12: cancelling stops updates.
  it("says Ab dem 3. Monat monatlich kündbar and that updates stop after cancelling", () => {
    expect(WARTUNG_KUENDIGUNG).toBe("Ab dem 3. Monat monatlich kündbar.");
    expect(WARTUNG_HINWEIS).toBe(
      "Ab dem 3. Monat monatlich kündbar. Kündigst du, läuft dein System weiter, nur ohne Updates und Anpassungen von mir.",
    );
    for (const s of [WARTUNG_HINWEIS, wartungPreisSatz(), JSON.stringify(wartungTiers)]) {
      expect(s).not.toMatch(/(?<!dem 3\. Monat )monatlich kündbar/i);
      expect(s).not.toMatch(/sicher weiter/);
    }
  });

  it("puts calls every 4 weeks in Basis and every 2 weeks in Standard", () => {
    expect(txt(wartungTiers[1].zeilen.zeit)).toMatch(/4 Wochen/);
    expect(txt(wartungTiers[2].zeilen.zeit)).toMatch(/2 Wochen/);
  });

  it("passes the copy guards", () => {
    expect(WARTUNG_TITEL).toBe("Die vier Stufen unterscheiden sich darin, wie viel Zeit du von mir bekommst.");
    for (const t of wartungTiers)
      for (const s of [t.name, t.motto, t.grenze ?? "", ...Object.values(t.zeilen).flat()]) expect(findCopyIssues(s), s).toEqual([]);
    for (const s of [WARTUNG_TITEL, WARTUNG_HINWEIS, ...wartungZeilen.map((z) => z.label)]) expect(findCopyIssues(s), s).toEqual([]);
  });

  // Never Vrelo hosting: the server stays the client's (n8n licence, ownership promise).
  it("never says the server is hosted by me", () => {
    expect(JSON.stringify(wartungTiers)).not.toMatch(/Hosting|bei mir gehostet/i);
  });

  it("builds the FAQ price sentence from the tiers, Partner without a number", () => {
    expect(wartungPreisSatz()).toBe(
      "Vier Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: Minimum für 95, Basis für 249 oder Standard für 945 Euro im Monat, netto und ab dem 3. Monat monatlich kündbar. Partner gibt es auf Anfrage und für höchstens zwei Betriebe.",
    );
    expect(wartungPreisSatz()).not.toMatch(/9\.?900|undefined|NaN/);
  });
});
