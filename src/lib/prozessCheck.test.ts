import { describe, it, expect } from "vitest";
import {
  categorize,
  severity,
  STEPS,
  resultCopy,
  RESULT_UI,
  type ProzessCheckAnswers,
  type Aufgabe,
  type Konsequenz,
} from "./prozessCheck";

// A base answer set that scores severity 0 (D) unless overridden.
const base: ProzessCheckAnswers = {
  aufgabe: "anfragen",
  zeit: "unter1",
  konsequenz: "nichts",
  abende: "nein",
  versucht: "garnicht",
};

describe("prozessCheck categorization", () => {
  it("has five steps in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual(["aufgabe", "zeit", "konsequenz", "abende", "versucht"]);
  });

  it("routes anyone who already automates to C, regardless of severity", () => {
    expect(
      categorize({ ...base, zeit: "ueber5", konsequenz: "liegen", abende: "staendig", versucht: "laeuft" }),
    ).toBe("C");
    expect(categorize({ ...base, versucht: "laeuft" })).toBe("C");
  });

  it("routes the clear low-pain case (severity 0) to D", () => {
    expect(severity(base)).toBe(0);
    expect(categorize(base)).toBe("D");
  });

  it("routes moderate pain (severity 1-2) to B", () => {
    expect(categorize({ ...base, zeit: "1bis3" })).toBe("B"); // severity 1
    expect(categorize({ ...base, zeit: "1bis3", konsequenz: "liegen" })).toBe("B"); // severity 2
  });

  it("routes strong pain (severity >= 3) to A", () => {
    expect(categorize({ ...base, zeit: "3bis5", konsequenz: "liegen" })).toBe("A"); // 2+1 = 3
    expect(categorize({ ...base, zeit: "ueber5", abende: "staendig" })).toBe("A"); // 3+2 = 5
  });
});

// Collect every German string the feature can render: STEPS, the static UI copy,
// and resultCopy over a matrix covering all nouns × consequences × categories.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const AUFGABEN: Aufgabe[] = ["anfragen", "termine", "angebote", "nachfassen", "daten", "nachrichten"];
const KONSEQUENZEN: Konsequenz[] = ["liegen", "termine", "warten", "nichts"];
// One answer set per category (severity: A>=3, B 1-2, C laeuft, D 0).
const CATEGORY_SAMPLES: ProzessCheckAnswers[] = [
  { aufgabe: "anfragen", zeit: "ueber5", konsequenz: "liegen", abende: "staendig", versucht: "garnicht" }, // A
  { aufgabe: "anfragen", zeit: "1bis3", konsequenz: "nichts", abende: "nein", versucht: "garnicht" }, // B
  { aufgabe: "anfragen", zeit: "1bis3", konsequenz: "liegen", abende: "abundzu", versucht: "laeuft" }, // C
  { aufgabe: "anfragen", zeit: "unter1", konsequenz: "nichts", abende: "nein", versucht: "garnicht" }, // D
];

const corpus: string[] = [];
strings(STEPS, corpus);
strings(RESULT_UI, corpus);
for (const aufgabe of AUFGABEN)
  for (const konsequenz of KONSEQUENZEN)
    for (const s of CATEGORY_SAMPLES) strings(resultCopy({ ...s, aufgabe, konsequenz }), corpus);

const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("prozessCheck copy", () => {
  it("uses German quotes, never ASCII double quotes", () => {
    expect(corpus.filter((s) => s.includes('"'))).toEqual([]);
  });

  it("uses the en-dash, never the em-dash", () => {
    expect(corpus.filter((s) => s.includes("—"))).toEqual([]);
  });

  it("pairs every opening German quote with a closing one", () => {
    for (const s of corpus) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });

  it("never names a price", () => {
    // resultCopy + RESULT_UI only (STEPS legitimately say '1 bis 3 Stunden').
    const resultStrings: string[] = [];
    strings(RESULT_UI, resultStrings);
    for (const s of CATEGORY_SAMPLES) strings(resultCopy(s), resultStrings);
    expect(resultStrings.filter((s) => CURRENCY.test(s))).toEqual([]);
  });

  it("emits no number in the result headline/body/verdict", () => {
    for (const s of CATEGORY_SAMPLES) {
      const r = resultCopy(s);
      expect(/\d/.test(r.headline + r.body + r.verdict)).toBe(false);
    }
  });

  it("mirrors the visitor's task and consequence in A", () => {
    const r = resultCopy({
      aufgabe: "termine",
      zeit: "ueber5",
      konsequenz: "warten",
      abende: "staendig",
      versucht: "garnicht",
    });
    expect(r.category).toBe("A");
    expect(r.body).toContain("Terminvergabe");
    expect(r.body).toContain("warten Kunden");
  });

  it("marks A/B/C as fitting (scheduler) and D as not", () => {
    expect(resultCopy(CATEGORY_SAMPLES[0]).fits).toBe(true); // A
    expect(resultCopy(CATEGORY_SAMPLES[1]).fits).toBe(true); // B
    expect(resultCopy(CATEGORY_SAMPLES[2]).fits).toBe(true); // C
    expect(resultCopy(CATEGORY_SAMPLES[3]).fits).toBe(false); // D
  });
});
