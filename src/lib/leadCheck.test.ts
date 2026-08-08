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
    // 520 × (0.50 − 0.10) = 208 addressable, of which RECOVERY_RATE (0.3) come
    // back as a booked appointment, of which CLOSE_RATE (0.2) close.
    expect(r.adressierbareAnfragen).toBe(208);
    expect(r.recoverableTermine).toBe(62);
    expect(r.zusaetzlicheAbschluesse).toBe(12);
    expect(r.eurUpside).toBe(48000);
  });

  it("never claims more recovered appointments than inquiries currently lost", () => {
    // The honesty invariant: a faster reply can only ever win back a subset of
    // what is being lost today. Guards against a future constant change that
    // would make the upside exceed the leak it is derived from.
    for (const reaktionszeit of ["unter5min", "unter1std", "selberTag", "1bis2tage", "wennZeit"] as const) {
      const r = computeResult({ ...base, reaktionszeit });
      expect(r.recoverableTermine).toBeLessThanOrEqual(r.verloreneAnfragenProJahr);
      expect(r.zusaetzlicheAbschluesse).toBeLessThanOrEqual(r.recoverableTermine);
      expect(r.adressierbareAnfragen).toBeLessThanOrEqual(r.verloreneAnfragenProJahr);
    }
  });

  it("keeps the worst-case upside inside a defensible band", () => {
    // 20 inquiries/week, worst answer everywhere. Before the 2026-08-08 audit
    // this produced 156 extra closings / 624.000 € — a promise no undelivered
    // product can carry. The model must stay well under that.
    const r = computeResult({
      anfragenProWoche: 20,
      reaktionszeit: "wennZeit",
      abendsWochenende: "nein",
      imTermin: "gehtUnter",
      nachfassen: "nie",
    });
    expect(r.zusaetzlicheAbschluesse).toBeLessThan(60);
    expect(r.eurUpside).toBeLessThan(250_000);
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
    expect(r.adressierbareAnfragen).toBe(0);
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
    expect(r.eurUpside).toBe(12 * 6000);
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
