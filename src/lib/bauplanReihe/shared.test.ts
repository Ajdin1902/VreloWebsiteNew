import { describe, it, expect } from "vitest";
import { LEVELS, abschluss, abschlussHref, deckblatt, levelFor, selbstcheck, wochenplan } from "./shared";
import { findCopyIssues } from "../ratgeberCopy";
import { normalizeSource } from "../source";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

describe("bauplanReihe shared", () => {
  it("maps counts to levels", () => {
    expect(levelFor({ laeuft: 0, papier: 2, kopf: 11 }, false)).toBe(0);
    expect(levelFor({ laeuft: 0, papier: 8, kopf: 5 }, false)).toBe(1);
    expect(levelFor({ laeuft: 2, papier: 6, kopf: 5 }, false)).toBe(2);
    expect(levelFor({ laeuft: 9, papier: 4, kopf: 0 }, false)).toBe(2); // no foundation caps at 2
    expect(levelFor({ laeuft: 4, papier: 6, kopf: 3 }, true)).toBe(3);
    expect(levelFor({ laeuft: 10, papier: 3, kopf: 0 }, true)).toBe(4);
  });
  it("treats a blank sheet as level 0", () => {
    expect(levelFor({ laeuft: 0, papier: 0, kopf: 0 }, false)).toBe(0);
  });
  it("builds the close links", () => {
    expect(abschlussHref("shk", "pdf")).toBe("https://vrelo-ki.de/kontakt?src=bauplan-shk-pdf");
    expect(abschlussHref("shk", "web")).toBe("/kontakt?src=bauplan-shk");
  });
  it("produces src values that pass normalizeSource", () => {
    expect(normalizeSource("bauplan-shk")).toBe("bauplan-shk");
    expect(normalizeSource("bauplan-shk-pdf")).toBe("bauplan-shk-pdf");
  });
  it("keeps every shared string clean", () => {
    const all = strings([selbstcheck, abschluss, LEVELS, wochenplan, deckblatt]);
    expect(all.flatMap((s) => findCopyIssues(s).map((i) => ({ s, i })))).toEqual([]);
    expect(all.filter((s) => /€|\bEUR\b|\d\s*(Euro|netto)\b/i.test(s))).toEqual([]);
    expect(all.filter((s) => /Garantie|noch 3|Wochen|Tage/i.test(s))).toEqual([]);
  });
  it("walks the reader through five days", () => {
    expect(wochenplan.tage).toEqual(["Wo du stehst", "Deine Werkzeuge", "Deine Datenwege", "Das Fundament", "Die erste Station"]);
  });
  it("names five levels in ladder order", () => {
    expect(LEVELS.map((l) => l.name)).toEqual(["Im Kopf", "Verstreut", "Erste Station läuft", "Ein Ort", "Haus steht"]);
  });
});
