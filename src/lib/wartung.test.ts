import { describe, it, expect } from "vitest";
import { wartungTiers, wartungZeilen, WARTUNG_HINWEIS, WARTUNG_TITEL, wartungPreisSatz } from "./wartung";
import { findCopyIssues } from "./ratgeberCopy";

describe("wartung tiers (Ajdin 2026-11-11)", () => {
  it("has three tiers with the agreed names, mottos and prices", () => {
    expect(wartungTiers.map((t) => [t.id, t.name, t.preisNetto])).toEqual([
      ["minimum", "Minimum", 249],
      ["standard", "Standard", 945],
      ["partner", "Partner", 9900],
    ]);
    expect(wartungTiers.map((t) => t.motto)).toEqual(["Es läuft.", "Es läuft und wird besser.", "Ich gehöre zu deinem Team."]);
    expect(wartungTiers[2].grenze).toBe("Für höchstens zwei Betriebe");
  });

  it("fills every row for every tier and keeps fix times 48/24/12", () => {
    expect(wartungZeilen).toHaveLength(7);
    for (const t of wartungTiers) for (const z of wartungZeilen) expect(t.zeilen[z.id].trim(), `${t.id}.${z.id}`).not.toBe("");
    expect(wartungTiers.map((t) => t.zeilen.fehler)).toEqual(["48 Stunden", "24 Stunden", "12 Stunden"]);
  });

  it("puts calls every 4 weeks in Minimum and every 2 weeks in Standard", () => {
    expect(wartungTiers[0].zeilen.zeit).toMatch(/4 Wochen/);
    expect(wartungTiers[1].zeilen.zeit).toMatch(/2 Wochen/);
  });

  it("never calls a tier Basis and passes the copy guards", () => {
    const all = [JSON.stringify(wartungTiers), JSON.stringify(wartungZeilen), WARTUNG_HINWEIS].join(" ");
    expect(all).not.toMatch(/Basis/);
    for (const t of wartungTiers) for (const s of [t.name, t.motto, t.grenze ?? "", ...Object.values(t.zeilen)]) expect(findCopyIssues(s), s).toEqual([]);
    for (const s of [WARTUNG_TITEL, WARTUNG_HINWEIS, ...wartungZeilen.map((z) => z.label)]) expect(findCopyIssues(s), s).toEqual([]);
  });

  it("builds the FAQ price sentence from the tiers", () => {
    expect(wartungPreisSatz()).toBe(
      "Drei Stufen, je nach Zeit mit mir und wie viel ich anpasse und verbessere: Minimum für 249, Standard für 945 oder Partner für 9.900 Euro im Monat, netto und monatlich kündbar. Partner gibt es für höchstens zwei Betriebe.",
    );
  });
});
