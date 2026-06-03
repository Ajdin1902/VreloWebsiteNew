import { describe, it, expect } from "vitest";
import { leistungen } from "./leistungen";

describe("leistungen data", () => {
  it("lists the four homepage service categories in order", () => {
    expect(leistungen.map((l) => l.title)).toEqual([
      "Termine & Bestätigungen",
      "Nachfass-Mails",
      "Dateneingabe",
      "Wiederkehrende Kommunikation",
    ]);
  });

  it("gives each service a slug, punchline, body and 2–3 outcomes", () => {
    for (const l of leistungen) {
      expect(l.slug).toMatch(/\S/);
      expect(l.punchline).toMatch(/\S/);
      expect(l.body).toMatch(/\S/);
      expect(l.outcomes.length).toBeGreaterThanOrEqual(2);
      expect(l.outcomes.length).toBeLessThanOrEqual(3);
    }
  });

  it("has unique slugs", () => {
    const slugs = leistungen.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
