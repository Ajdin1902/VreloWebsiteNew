import { describe, it, expect } from "vitest";
import {
  STEPS,
  AREA_IDS,
  AREA_LABEL,
  totalHours,
  rankAreas,
  resultCopy,
  RESULT_UI,
  type ProzessCheckAnswers,
} from "./prozessCheck";

const base: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "2bis5",
  stunden: { anfragen: 0, auftraege: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 },
  nervt: "anfragen",
  abende: "nein",
  versucht: "nichts",
};

describe("prozessCheck steps", () => {
  it("has the six steps in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "branche",
      "team",
      "stunden",
      "nervt",
      "abende",
      "versucht",
    ]);
  });

  it("the stunden step is the grid kind and lists all six areas", () => {
    const grid = STEPS.find((s) => s.id === "stunden");
    expect(grid?.kind).toBe("grid");
    expect(AREA_IDS).toEqual(["anfragen", "auftraege", "rechnungen", "daten", "erinnern", "orga"]);
  });
});

describe("totalHours + rankAreas", () => {
  it("sums the six sliders", () => {
    expect(
      totalHours({ ...base, stunden: { anfragen: 3, auftraege: 2, rechnungen: 5, daten: 1, erinnern: 2, orga: 1 } }),
    ).toBe(14);
  });

  it("ranks areas by hours descending, ties broken by area order", () => {
    expect(
      rankAreas({ ...base, stunden: { anfragen: 2, auftraege: 0, rechnungen: 5, daten: 2, erinnern: 0, orga: 0 } }),
    ).toEqual(["rechnungen", "anfragen", "daten", "auftraege", "erinnern", "orga"]);
  });
});

describe("resultCopy", () => {
  it("puts the summed hours in the headline and marks a real load as fitting", () => {
    const r = resultCopy({ ...base, stunden: { anfragen: 3, auftraege: 0, rechnungen: 5, daten: 1, erinnern: 0, orga: 0 } });
    expect(r.fits).toBe(true);
    expect(r.totalHours).toBe(9);
    expect(r.headline).toContain("9");
    // The pain extrapolation: 9 h/week over 46 work weeks at 8 h/day = 52 days.
    expect(r.yearLine).toContain("52");
    expect(r.yearLine).toContain("Arbeitstage");
    expect(r.basis).toContain("46");
    // Top area leads the profile and carries a calm what-is-automatable sentence.
    expect(r.topAreas[0].id).toBe("rechnungen");
    expect(r.topAreas[0].sentence.length).toBeGreaterThan(0);
  });

  it("returns the honest zero-state when nothing costs time", () => {
    const r = resultCopy(base); // all sliders 0
    expect(r.fits).toBe(false);
    expect(r.totalHours).toBe(0);
    expect(r.topAreas).toEqual([]);
  });

  it("names the area the visitor said annoys him most", () => {
    const r = resultCopy({ ...base, nervt: "daten", stunden: { anfragen: 1, auftraege: 1, rechnungen: 1, daten: 1, erinnern: 1, orga: 1 } });
    expect(r.nervtLabel).toBe(AREA_LABEL.daten);
  });
});

// Copy-guard: collect every renderable German string.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const SAMPLES: ProzessCheckAnswers[] = [
  { ...base, stunden: { anfragen: 6, auftraege: 3, rechnungen: 2, daten: 1, erinnern: 0, orga: 0 }, nervt: "anfragen", abende: "staendig", versucht: "toolBrach" },
  { ...base, stunden: { anfragen: 0, auftraege: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 } }, // zero-state
  { ...base, stunden: { anfragen: 1, auftraege: 1, rechnungen: 1, daten: 1, erinnern: 1, orga: 1 }, nervt: "orga", abende: "abundzu", versucht: "beauftragt" },
];

const corpus: string[] = [];
strings(STEPS, corpus);
strings(RESULT_UI, corpus);
for (const s of SAMPLES) strings(resultCopy(s), corpus);

const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("prozessCheck copy-guard", () => {
  it("uses German quotes, never ASCII double quotes", () => {
    expect(corpus.filter((s) => s.includes('"'))).toEqual([]);
  });
  it("uses no dash at all", () => {
    expect(corpus.filter((s) => s.includes("—") || s.includes("–"))).toEqual([]);
  });
  it("pairs every opening German quote with a closing one", () => {
    for (const s of corpus) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });
  it("never names a price (hours numbers are allowed, currency is not)", () => {
    expect(corpus.filter((s) => CURRENCY.test(s))).toEqual([]);
  });
});
