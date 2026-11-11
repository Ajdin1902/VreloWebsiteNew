import { describe, it, expect } from "vitest";
import { wartungTiers, wartungZeilen, WARTUNG_HINWEIS, WARTUNG_TITEL, WARTUNG_PREIS_ZUSATZ, WARTUNG_KUENDIGUNG, wartungPreis, wartungPreisSatz } from "./wartung";
import { findCopyIssues } from "./ratgeberCopy";

describe("wartung tiers (Ajdin 2026-11-11)", () => {
  it("has three tiers with the agreed names, mottos and prices", () => {
    expect(wartungTiers.map((t) => [t.id, t.name, t.preisNetto])).toEqual([
      ["minimum", "Minimum", 249],
      ["standard", "Standard", 945],
      ["partner", "Partner", 9900],
    ]);
    expect(wartungTiers[2].grenze).toBe("Für höchstens zwei Betriebe");
  });

  it("fills every row for every tier and keeps fix times 48/24/12", () => {
    expect(wartungZeilen).toHaveLength(8);
    for (const t of wartungTiers) for (const z of wartungZeilen) expect(t.zeilen[z.id].trim(), `${t.id}.${z.id}`).not.toBe("");
    expect(wartungTiers.map((t) => t.zeilen.fehler)).toEqual(["48 Stunden", "24 Stunden", "12 Stunden"]);
  });

  // Ajdin 2026-11-11: the last row tells which tier to pick, led by the old mottos.
  it("ends on an Ergebnis row that says which tier fits whom", () => {
    expect(wartungZeilen.at(-1)).toEqual({ id: "ergebnis", label: "Ergebnis" });
    const leads = wartungTiers.map((t) => t.zeilen.ergebnis);
    expect(leads[0]).toMatch(/^Es läuft\. /);
    expect(leads[1]).toMatch(/^Es läuft und wird besser\. /);
    expect(leads[2]).toMatch(/^Wir automatisieren deinen Betrieb\. /);
  });

  // Ajdin 2026-11-11: Standard concrete enough that the step up from Minimum shows.
  it("spells out Standard against Minimum", () => {
    const [m, s] = wartungTiers;
    expect(s.zeilen.laeuft).toMatch(/Backup wirklich wiederherstellen/);
    expect(s.zeilen.anpassen).toMatch(/Drei Änderungen im Monat, etwa/);
    expect(m.zeilen.anpassen).toMatch(/Eine Änderung im Monat, etwa/);
    for (const t of wartungTiers) expect(t.zeilen.anpassen).not.toMatch(/kleine Änderung/);
    expect(s.zeilen.verbessern).toMatch(/Baustein, etwa/);
    expect(s.zeilen.bericht).toBe("Jeden Monat: was gelaufen ist, was ich geändert habe und was als Nächstes möglich ist.");
    expect(m.zeilen.verbessern).toBe("Nicht enthalten");
  });

  // Ajdin 2026-11-11: three months minimum, then monthly.
  it("says Ab dem 3. Monat monatlich kündbar wherever it says kündbar", () => {
    expect(WARTUNG_KUENDIGUNG).toBe("Ab dem 3. Monat monatlich kündbar.");
    expect(WARTUNG_HINWEIS.startsWith(WARTUNG_KUENDIGUNG)).toBe(true);
    for (const s of [WARTUNG_HINWEIS, wartungPreisSatz(), JSON.stringify(wartungTiers)])
      expect(s).not.toMatch(/(?<!dem 3\. Monat )monatlich kündbar/i);
  });

  it("puts calls every 4 weeks in Minimum and every 2 weeks in Standard", () => {
    expect(wartungTiers[0].zeilen.zeit).toMatch(/4 Wochen/);
    expect(wartungTiers[1].zeilen.zeit).toMatch(/2 Wochen/);
  });

  it("never calls a tier Basis and passes the copy guards", () => {
    const all = [JSON.stringify(wartungTiers), JSON.stringify(wartungZeilen), WARTUNG_HINWEIS].join(" ");
    expect(all).not.toMatch(/Basis/);
    for (const t of wartungTiers) for (const s of [t.name, t.grenze ?? "", ...Object.values(t.zeilen)]) expect(findCopyIssues(s), s).toEqual([]);
    for (const s of [WARTUNG_TITEL, WARTUNG_HINWEIS, ...wartungZeilen.map((z) => z.label)]) expect(findCopyIssues(s), s).toEqual([]);
  });

  // Ajdin 2026-11-11: the Betreuung page shows the prices in its comparison table.
  it("labels each tier's price for the Betreuung table", () => {
    expect(wartungTiers.map(wartungPreis)).toEqual(["249 €", "945 €", "9.900 €"]);
    expect(WARTUNG_PREIS_ZUSATZ).toBe("im Monat, netto");
  });

  it("builds the FAQ price sentence from the tiers", () => {
    expect(wartungPreisSatz()).toBe(
      "Drei Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: Minimum für 249, Standard für 945 oder Partner für 9.900 Euro im Monat, netto und ab dem 3. Monat monatlich kündbar. Partner gibt es für höchstens zwei Betriebe.",
    );
  });
});
