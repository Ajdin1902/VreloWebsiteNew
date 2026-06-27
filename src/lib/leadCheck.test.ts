// src/lib/leadCheck.test.ts
import { describe, it, expect } from "vitest";
import { computeResult, type LeadCheckAnswers } from "./leadCheck";

const base: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};

describe("computeResult", () => {
  it("matches the worked example", () => {
    const r = computeResult(base);
    expect(r.currentLossPct).toBe(50);
    expect(r.score).toBe("langsam");
    expect(r.anfragenProJahr).toBe(520);
    expect(r.verloreneAnfragenProJahr).toBe(260);
    expect(r.recoverableTermine).toBe(208);
    expect(r.zusaetzlicheAbschluesse).toBe(42);
    expect(r.eurUpside).toBe(168000);
  });

  it("floors loss at 10% for the fully-fast profile (no invented upside)", () => {
    const r = computeResult({
      anfragenProWoche: 10,
      reaktionszeit: "unter5min",
      abendsWochenende: "immer",
      imTermin: "automatisch",
      nachfassen: "mehrmals",
    });
    expect(r.currentLossPct).toBe(10);
    expect(r.score).toBe("schnell");
    expect(r.recoverableTermine).toBe(0);
    expect(r.eurUpside).toBe(0);
  });

  it("caps current loss at 85%", () => {
    const r = computeResult({
      anfragenProWoche: 10,
      reaktionszeit: "wennZeit",
      abendsWochenende: "nein",
      imTermin: "gehtUnter",
      nachfassen: "nie",
    });
    expect(r.currentLossPct).toBe(85);
  });

  it("defaults provision to 4000 and flags it", () => {
    const r = computeResult({ ...base, provision: undefined });
    expect(r.provisionUsed).toBe(4000);
    expect(r.provisionWasDefault).toBe(true);
  });

  it("uses a supplied provision without the default flag", () => {
    const r = computeResult({ ...base, provision: 6000 });
    expect(r.provisionUsed).toBe(6000);
    expect(r.provisionWasDefault).toBe(false);
    expect(r.eurUpside).toBe(42 * 6000);
  });

  it("clamps absurd request volume to 200/week before computing", () => {
    const r = computeResult({ ...base, anfragenProWoche: 5000 });
    expect(r.anfragenProJahr).toBe(200 * 52);
  });

  it("returns all-zero, no NaN, for zero requests", () => {
    const r = computeResult({ ...base, anfragenProWoche: 0 });
    expect(r.anfragenProJahr).toBe(0);
    expect(r.verloreneAnfragenProJahr).toBe(0);
    expect(r.eurUpside).toBe(0);
    expect(Number.isNaN(r.eurUpside)).toBe(false);
  });

  it("sets score bands at the boundaries", () => {
    const fast = computeResult({ anfragenProWoche: 1, reaktionszeit: "unter1std", abendsWochenende: "immer", imTermin: "automatisch", nachfassen: "selten" });
    expect(fast.score).toBe("solide");
    const schnell = computeResult({ anfragenProWoche: 1, reaktionszeit: "unter5min", abendsWochenende: "manchmal", imTermin: "automatisch", nachfassen: "einmal" });
    expect(schnell.score).toBe("schnell");
  });
});
