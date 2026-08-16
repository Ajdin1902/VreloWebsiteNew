import { describe, it, expect } from "vitest";
import { leistungen } from "./leistungen";

describe("leistungen data", () => {
  it("lists the service categories in customer-journey order", () => {
    expect(leistungen.map((l) => l.title)).toEqual([
      "Anfragen & Leads",
      "Termine & Bestätigungen",
      "Angebote & Rechnungen",
      "Dateneingabe",
      "Persönlicher Assistent",
      "Prozess- & Aufgabensteuerung",
    ]);
  });

  it("gives each service a slug, punchline, kurz teaser and 2–3 outcomes", () => {
    for (const l of leistungen) {
      expect(l.slug).toMatch(/\S/);
      expect(l.punchline).toMatch(/\S/);
      expect(l.kurz).toMatch(/\S/);
      expect(l.outcomes.length).toBeGreaterThanOrEqual(2);
      expect(l.outcomes.length).toBeLessThanOrEqual(3);
    }
  });

  it("has unique slugs", () => {
    const slugs = leistungen.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("frames durability somewhere (the 'it still runs in a year' cue)", () => {
    const text = leistungen.map((l) => `${l.kurz} ${l.outcomes.join(" ")}`).join(" ");
    expect(text).toMatch(/dokumentiert|in einem Jahr|läuft/i);
  });
});
