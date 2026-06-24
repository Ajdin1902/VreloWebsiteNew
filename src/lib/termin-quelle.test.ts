import { describe, it, expect } from "vitest";
import { terminQuelle } from "./termin-quelle";

describe("terminQuelle offer copy", () => {
  it("has all required text fields, non-empty", () => {
    expect(terminQuelle.label.trim()).not.toBe("");
    expect(terminQuelle.name.trim()).not.toBe("");
    expect(terminQuelle.promise.trim()).not.toBe("");
    expect(terminQuelle.body.trim()).not.toBe("");
    expect(terminQuelle.outcome.trim()).not.toBe("");
    expect(terminQuelle.foundingNote.trim()).not.toBe("");
    expect(terminQuelle.cta.label.trim()).not.toBe("");
  });

  it("is the Termin-Quelle offer: promise turns Anfragen into Termine", () => {
    expect(terminQuelle.name).toBe("Die Termin-Quelle");
    expect(terminQuelle.promise).toContain("Anfrage");
    expect(terminQuelle.promise).toContain("Termin");
  });

  it("has exactly the five-step flow, each non-empty", () => {
    expect(terminQuelle.flow).toHaveLength(5);
    terminQuelle.flow.forEach((step) => expect(step.trim()).not.toBe(""));
  });

  it("CTA links to the Kontakt page", () => {
    expect(terminQuelle.cta.href).toBe("/kontakt");
  });

  it("shows no price anywhere (the site stays price-free)", () => {
    const serialized = JSON.stringify(terminQuelle);
    expect(serialized).not.toMatch(/€|\bEUR\b|\d+\s?Euro/i);
  });
});
