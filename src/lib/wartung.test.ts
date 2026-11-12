import { describe, it, expect } from "vitest";
import { wartungTiers, wartungZeilen, WARTUNG_HINWEIS, WARTUNG_TITEL, WARTUNG_KUENDIGUNG, wartungPreisSatz } from "./wartung";
import { findCopyIssues } from "./ratgeberCopy";

const txt = (items: string[]) => items.join(" ");

describe("wartung tiers (Ajdin 2026-11-11)", () => {
  it("has three tiers with the agreed names and prices", () => {
    expect(wartungTiers.map((t) => [t.id, t.name, t.preisNetto])).toEqual([
      ["minimum", "Minimum", 249],
      ["standard", "Standard", 945],
      ["partner", "Partner", 9900],
    ]);
    expect(wartungTiers[2].grenze).toBe("Für höchstens zwei Betriebe");
  });

  // Ajdin 2026-11-11: a second line under each name says how close I work with them.
  it("gives every tier a line about our time together, Partner as part of the team", () => {
    expect(wartungTiers[2].motto).toBe("Ich bin Teil von deinem Team");
    for (const t of wartungTiers) expect(t.motto.trim(), t.id).not.toBe("");
    expect(new Set(wartungTiers.map((t) => t.motto)).size).toBe(3);
  });

  it("fills every row for every tier and keeps fix times 48/24/12", () => {
    expect(wartungZeilen).toHaveLength(8);
    for (const t of wartungTiers)
      for (const z of wartungZeilen) {
        expect(t.zeilen[z.id].length, `${t.id}.${z.id}`).toBeGreaterThan(0);
        for (const item of t.zeilen[z.id]) expect(item.trim(), `${t.id}.${z.id}`).not.toBe("");
      }
    expect(wartungTiers.map((t) => t.zeilen.fehler)).toEqual([["48 Stunden"], ["24 Stunden"], ["12 Stunden"]]);
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
    expect(wartungTiers.map((t) => t.zeilen.ergebnis[0])).toEqual(["Es läuft", "Es läuft und wird besser", "Wir automatisieren deinen Betrieb"]);
    for (const t of wartungTiers) expect(t.zeilen.ergebnis[1], t.id).toMatch(/^Richtig, wenn /);
  });

  // Ajdin 2026-11-11: Standard concrete enough that the step up from Minimum shows.
  it("spells out Standard against Minimum", () => {
    const [m, s] = wartungTiers;
    // Ajdin 2026-11-11: the backup line names the test; Standard gets higher priority.
    expect(s.zeilen.laeuft).toEqual(["Alles aus Minimum", "Jedes Quartal ein Backup-Test", "Höhere Priorität"]);
    expect(wartungTiers[2].zeilen.laeuft).toEqual(["Alles aus Standard", "Höchste Priorität"]);
    expect(txt(s.zeilen.anpassen)).toMatch(/Drei Änderungen im Monat, etwa/);
    expect(txt(m.zeilen.anpassen)).toMatch(/Eine Änderung im Monat, etwa/);
    for (const t of wartungTiers) expect(txt(t.zeilen.anpassen)).not.toMatch(/kleine Änderung/);
    expect(txt(s.zeilen.verbessern)).toMatch(/Baustein, etwa/);
    expect(s.zeilen.bericht).toEqual(["Jeden Monat: was gelaufen ist, was ich geändert habe und was als Nächstes möglich ist"]);
    expect(m.zeilen.verbessern).toEqual(["Nicht enthalten"]);
  });

  // Ajdin 2026-11-11: three months minimum, then monthly.
  it("says Ab dem 3. Monat monatlich kündbar wherever it says kündbar", () => {
    expect(WARTUNG_KUENDIGUNG).toBe("Ab dem 3. Monat monatlich kündbar.");
    expect(WARTUNG_HINWEIS.startsWith(WARTUNG_KUENDIGUNG)).toBe(true);
    for (const s of [WARTUNG_HINWEIS, wartungPreisSatz(), JSON.stringify(wartungTiers)])
      expect(s).not.toMatch(/(?<!dem 3\. Monat )monatlich kündbar/i);
  });

  it("puts calls every 4 weeks in Minimum and every 2 weeks in Standard", () => {
    expect(txt(wartungTiers[0].zeilen.zeit)).toMatch(/4 Wochen/);
    expect(txt(wartungTiers[1].zeilen.zeit)).toMatch(/2 Wochen/);
  });

  it("never calls a tier Basis and passes the copy guards", () => {
    const all = [JSON.stringify(wartungTiers), JSON.stringify(wartungZeilen), WARTUNG_HINWEIS].join(" ");
    expect(all).not.toMatch(/Basis/);
    for (const t of wartungTiers)
      for (const s of [t.name, t.motto, t.grenze ?? "", ...Object.values(t.zeilen).flat()]) expect(findCopyIssues(s), s).toEqual([]);
    for (const s of [WARTUNG_TITEL, WARTUNG_HINWEIS, ...wartungZeilen.map((z) => z.label)]) expect(findCopyIssues(s), s).toEqual([]);
  });

  it("builds the FAQ price sentence from the tiers", () => {
    expect(wartungPreisSatz()).toBe(
      "Drei Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: Minimum für 249, Standard für 945 oder Partner für 9.900 Euro im Monat, netto und ab dem 3. Monat monatlich kündbar. Partner gibt es für höchstens zwei Betriebe.",
    );
  });
});
