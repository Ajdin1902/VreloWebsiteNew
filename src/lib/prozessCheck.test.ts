import { describe, it, expect } from "vitest";
import {
  STEPS,
  AREA_IDS,
  AREA_LABEL,
  AREA_SENTENCE,
  PROGRAMM_CHIPS,
  QUESTION_COUNT,
  activeSteps,
  totalHours,
  rankAreas,
  resultCopy,
  hoursLabel,
  RESULT_UI,
  type ProzessCheckAnswers,
} from "./prozessCheck";

const base: ProzessCheckAnswers = {
  bereiche: ["anfragen"],
  stunden: {},
  nervt: "anfragen",
  kanaele: ["mail"],
  menge: "5bis20",
  wer: "ich",
  programmeChips: [],
  programmeText: "",
  arbeitstag: "",
  abende: "nein",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
};

describe("prozessCheck steps", () => {
  it("has eight areas in tie-break order", () => {
    expect(AREA_IDS).toEqual(["anfragen", "angebote", "auftraege", "rechnungen", "postfach", "daten", "erinnern", "orga"]);
  });

  it("has the thirteen steps in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "intro", "bereiche", "stunden", "nervt", "aufgabe", "programme", "arbeitstag",
      "abende", "versucht", "branche", "team", "arbeitsort", "website",
    ]);
  });

  it("skips nervt with one picked area", () => {
    expect(activeSteps({ bereiche: ["anfragen"] }).map((s) => s.id)).not.toContain("nervt");
    expect(activeSteps({ bereiche: ["anfragen", "orga"] }).map((s) => s.id)).toContain("nervt");
  });

  it("offers only the picked areas under nervt", () => {
    const nervt = activeSteps({ bereiche: ["rechnungen", "anfragen"] }).find((s) => s.id === "nervt");
    expect(nervt && "options" in nervt ? nervt.options.map((o) => o.value) : []).toEqual(["anfragen", "rechnungen"]);
  });

  it("counts the questions without the intro", () => {
    expect(QUESTION_COUNT).toBe(12);
  });

  it("offers at most twelve program chips", () => {
    expect(PROGRAMM_CHIPS.length).toBeLessThanOrEqual(12);
  });
});

describe("totalHours + rankAreas", () => {
  it("ignores hours of areas not picked", () => {
    const a = { ...base, bereiche: ["anfragen" as const], stunden: { anfragen: 3, orga: 9 } };
    expect(totalHours(a)).toBe(3);
    expect(resultCopy(a).topAreas.map((t) => t.id)).toEqual(["anfragen"]);
  });

  it("sums the picked sliders", () => {
    expect(
      totalHours({ ...base, bereiche: ["anfragen", "rechnungen", "daten"], stunden: { anfragen: 3, rechnungen: 5, daten: 1 } }),
    ).toBe(9);
  });

  it("ranks picked areas by hours descending, ties broken by area order", () => {
    expect(
      rankAreas({ ...base, bereiche: ["daten", "anfragen", "rechnungen", "erinnern"], stunden: { anfragen: 2, rechnungen: 5, daten: 2, erinnern: 0 } }),
    ).toEqual(["rechnungen", "anfragen", "daten", "erinnern"]);
  });
});

describe("resultCopy", () => {
  it("puts the summed hours in the headline and marks a real load as fitting", () => {
    const r = resultCopy({ ...base, bereiche: ["anfragen", "rechnungen", "daten"], stunden: { anfragen: 3, rechnungen: 5, daten: 1 } });
    expect(r.fits).toBe(true);
    expect(r.totalHours).toBe(9);
    expect(r.headline).toContain("9");
    // The pain extrapolation: 9 h/week over 46 work weeks at 8 h/day = 52 days.
    expect(r.yearLine).toBe("Aufs Jahr gerechnet sind das rund 52 volle Arbeitstage.");
    expect(r.basis).toContain("46");
    expect(r.topAreas[0].id).toBe("rechnungen");
    expect(r.topAreas[0].sentence.length).toBeGreaterThan(0);
  });

  it("one area at zero hours is the honest exit", () => {
    const r = resultCopy({ ...base, stunden: { anfragen: 0 } });
    expect(r.fits).toBe(false);
    expect(r.totalHours).toBe(0);
    expect(r.topAreas).toEqual([]);
  });

  it("names the area the visitor said annoys him most", () => {
    const r = resultCopy({ ...base, bereiche: ["anfragen", "daten"], nervt: "daten", stunden: { anfragen: 1, daten: 1 } });
    expect(r.nervtLabel).toBe(AREA_LABEL.daten);
    expect(r.topAreas[0].id).toBe("daten");
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
  { ...base, bereiche: ["anfragen", "auftraege", "rechnungen", "daten"], stunden: { anfragen: 6, auftraege: 3, rechnungen: 2, daten: 1 }, abende: "staendig", versucht: "toolBrach" },
  { ...base, stunden: { anfragen: 0 } }, // zero-state
  { ...base, bereiche: [...AREA_IDS], stunden: { anfragen: 1, angebote: 1, auftraege: 1, rechnungen: 1, postfach: 1, daten: 1, erinnern: 1, orga: 1 }, nervt: "orga", abende: "abundzu", versucht: "beauftragt" },
];

const corpus: string[] = [];
strings(STEPS, corpus);
strings(AREA_LABEL, corpus);
strings(AREA_SENTENCE, corpus);
strings(PROGRAMM_CHIPS, corpus);
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

describe("hoursLabel", () => {
  it("uses the singular for one hour", () => {
    expect(hoursLabel(1)).toBe("1 Stunde");
    expect(hoursLabel(4)).toBe("4 Stunden");
    expect(hoursLabel(0)).toBe("0 Stunden");
  });
});

// Ajdin 2026-11-12: the Fahrplan is always part of the free path, never conditional.
describe("Fahrplan promise", () => {
  it("promises the Fahrplan without a condition", () => {
    expect(RESULT_UI.success).toBe("Danke. Dein Vorab-Fahrplan ist unterwegs.");
    expect(RESULT_UI.calSecondary).toBe("Lieber gleich einen Termin?");
    expect(JSON.stringify(RESULT_UI)).not.toMatch(/Lohnt sich etwas|Wenn sich etwas lohnt|wenn es sich lohnt/i);
  });
});
