// src/lib/elektroBauplanPage.test.ts
import { describe, it, expect } from "vitest";
import { elektroBauplanPage } from "./elektroBauplanPage";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(elektroBauplanPage);
const hits = (re: RegExp) => all.filter((s) => re.test(s));

describe("Elektro /bauplan copy", () => {
  it("follows the house typography in every string", () => {
    expect(all.flatMap((s) => findCopyIssues(s).map((i) => `${i.kind}: ${s}`))).toEqual([]);
  });
  it("names no price and no duration", () => {
    expect(hits(/€|\bEuro\b|\bnetto\b|\bWochen\b|\bTagen?\b|\bMonate?n?\b/)).toEqual([]);
  });
  it("reads as a free guideline, not as an offer", () => {
    expect(hits(/[Mm]it mir|ohne mich|binde ich|richte ich|baue ich|wir zusammen/)).toEqual([]);
  });
  it("names no client and keeps the mail-only lines off the page", () => {
    expect(hits(/Power-Connect|Öksüz|\bMDZ\b|Velp|\bAlen\b|Bergisch|Hausmeister|BMW/)).toEqual([]);
  });
  it("asks for nothing but the PDF", () => {
    expect(hits(/Prozess-Check|buchen|Termin|Erstgespräch/)).toEqual([]);
  });
  it("labels the statistic and answers the objections", () => {
    expect(elektroBauplanPage.schmerz.satz).toContain("der befragten Handwerksbetriebe");
    expect(elektroBauplanPage.pdf.intro).toContain("Kostenlos");
    expect(elektroBauplanPage.pdf.form.hinweis).toContain("nur diese eine Mail");
  });
  it("stays compact: four value points and three comparison rows", () => {
    expect(elektroBauplanPage.inhalt.punkte).toHaveLength(4);
    expect(elektroBauplanPage.loesung.vergleich.reihen).toHaveLength(3);
    expect(elektroBauplanPage.loesung.flow).toHaveLength(4);
  });
});
