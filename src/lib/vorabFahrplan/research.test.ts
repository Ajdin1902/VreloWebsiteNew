import { describe, expect, it } from "vitest";
import type { ParsedAnswers } from "@/lib/prozessCheck";
import { TIPPS } from "./blocks";
import { buildFallbackPlan } from "./fallback";
import { mergeResearch, ResearchResultSchema, type ResearchResult } from "./research";

const answers: ParsedAnswers = {
  bereiche: ["anfragen", "rechnungen", "postfach", "orga"],
  stunden: { anfragen: 2, rechnungen: 4, postfach: 3, orga: 2 },
  nervt: "anfragen",
  kanaele: ["mail"],
  menge: "20bis50",
  wer: "buero",
  programmeChips: [],
  programmeText: "",
  programme: ["Outlook", "Lexoffice"],
  arbeitstag: "Morgens Mails, abends Rechnungen.",
  abende: "nein",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
};
const base = buildFallbackPlan(answers, { firma: "Muster GmbH", name: "Max Muster" }, new Date("2026-11-23T10:00:00Z"));
const TIPP = TIPPS.find((t) => t.bereich === "anfragen" && t.programm === "Outlook")!;
const A = "https://learn.microsoft.com/graph/outlook";
const B = "https://developers.lexoffice.io/docs";
const FREMD = "https://ausgedacht.example/seite";

const dossier = {
  programme: [{ name: "Outlook", befunde: "Graph API", unbestaetigt: "", blocker: "", n8n: "native", api: "ja" }],
  aufwand: [{ bereich: "anfragen", groesse: "S" }],
  kartenStationen: ["Anfrage-Reaktion"],
  fragen: ["1?", "2?", "3?", "4?", "5?"],
  kostenUsd: 0.42,
  capsGetroffen: [],
};

function result(pdf: unknown, erlaubteQuellen = [A, B]): ResearchResult {
  return ResearchResultSchema.parse({ jobId: "j1", fallback: false, erlaubteQuellen, pdf, dossier });
}

const step = (bereich: string, extra: Record<string, unknown> = {}) => ({
  bereich,
  titel: `Titel ${bereich}`,
  idee: `Idee für ${bereich}.`,
  quellen: [],
  ...extra,
});

describe("ResearchResultSchema", () => {
  it("accepts a full payload and a bare fallback", () => {
    expect(() => result({ schritte: [], programme: [] })).not.toThrow();
    expect(ResearchResultSchema.safeParse({ jobId: "j", fallback: true, grund: "cap", erlaubteQuellen: [] }).success).toBe(true);
  });
  it("fails with 4 fragen", () => {
    const r = ResearchResultSchema.safeParse({
      jobId: "j",
      fallback: false,
      erlaubteQuellen: [],
      dossier: { ...dossier, fragen: ["1", "2", "3", "4"] },
    });
    expect(r.success).toBe(false);
  });
  it("fails on an unknown area or size", () => {
    expect(
      ResearchResultSchema.safeParse({ jobId: "j", fallback: false, erlaubteQuellen: [], pdf: { schritte: [step("buchhaltung")], programme: [] } }).success,
    ).toBe(false);
    expect(
      ResearchResultSchema.safeParse({ jobId: "j", fallback: false, erlaubteQuellen: [], dossier: { ...dossier, aufwand: [{ bereich: "orga", groesse: "XL" }] } }).success,
    ).toBe(false);
  });
});

describe("mergeResearch", () => {
  it("keeps base facts and the step order, replaces texts, numbers sources", () => {
    const r = result({
      schritte: [
        step("rechnungen", { idee: "Rechnungen gehen aus Lexoffice raus.", mitProgrammen: "Lexoffice hat eine Schnittstelle.", quellen: [B] }),
        step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", quellen: [A] }),
      ],
      programme: [],
    });
    const { plan, verworfen } = mergeResearch(base, r, "24.11.2026");
    expect(verworfen).toEqual([]);
    expect(plan.recherchiert).toBe(true);
    for (const k of ["firma", "name", "datum", "stundenZeile", "stundenProWoche", "arbeitstag", "zeitVerteilung", "aufgabeZeile"] as const) {
      expect(plan[k]).toEqual(base[k]);
    }
    expect(plan.schritte.map((s) => [s.rang, s.bereich])).toEqual(base.schritte.map((s) => [s.rang, s.bereich]));
    const [zuerst, danach, spaeter] = plan.schritte;
    expect(zuerst.titel).toBe("Titel anfragen");
    expect(zuerst.mitProgrammen).toBe("Outlook lässt sich anbinden.");
    expect(danach.idee).toBe("Rechnungen gehen aus Lexoffice raus.");
    expect(spaeter).toEqual(base.schritte[2]); // no research step: base step stays
    // A is first used (Zuerst), the kept fallback tip next, B under Danach.
    expect(plan.quellen).toEqual([
      { n: 1, url: A, abgerufen: "24.11.2026" },
      { n: 2, url: TIPP.quelle, abgerufen: TIPP.abgerufen },
      { n: 3, url: B, abgerufen: "24.11.2026" },
    ]);
    expect(zuerst.tipp).toBe(TIPP.text);
    expect(zuerst.quellen).toEqual([1, 2]);
    expect(danach.quellen).toEqual([3]);
  });

  it("drops a claim citing a URL that was never fetched (Review Focus 2)", () => {
    const r = result({
      schritte: [step("anfragen", { mitProgrammen: "Outlook kann alles.", quellen: [A, FREMD] }), step("rechnungen", { mitProgrammen: "Ohne Quelle.", quellen: [] })],
      programme: [{ name: "Lexoffice", zeilen: [{ text: "Hat eine API.", quellen: [B] }, { text: "Erfunden.", quellen: [FREMD] }] }],
    });
    const { plan, verworfen } = mergeResearch(base, r, "24.11.2026");
    expect(plan.schritte[0].mitProgrammen).toBeUndefined();
    expect(plan.schritte[1].mitProgrammen).toBeUndefined();
    expect(plan.programme).toEqual([{ name: "Lexoffice", zeilen: ["Hat eine API."], quellen: [2] }]);
    expect(plan.quellen.map((q) => q.url)).toEqual([TIPP.quelle, B]);
    expect(plan.quellen.map((q) => q.url)).not.toContain(FREMD);
    expect(verworfen).toHaveLength(3);
    expect(verworfen.join(" ")).toMatch(/Outlook kann alles/);
  });

  it("drops a program that loses every line, and a URL that is not http(s)", () => {
    const js = "javascript:alert(1)";
    const r = result(
      {
        schritte: [step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", quellen: [A] })],
        programme: [{ name: "Fantasie", zeilen: [{ text: "Kann zaubern.", quellen: [js] }] }],
      },
      [A, js],
    );
    const { plan, verworfen } = mergeResearch(base, r, "24.11.2026");
    expect(plan.programme).toEqual([]);
    expect(verworfen.join(" ")).toMatch(/Fantasie/);
  });

  it("falls back to the base plan when no sourced item survives", () => {
    const r = result({ schritte: [step("anfragen", { idee: "KI-Text ohne Beleg.", mitProgrammen: "Behauptung.", quellen: [FREMD] })], programme: [] });
    const { plan, verworfen } = mergeResearch(base, r, "24.11.2026");
    expect(plan).toEqual(base);
    expect(plan.recherchiert).toBe(false);
    expect(verworfen).toHaveLength(1);
  });

  it("returns the base plan for a fallback result", () => {
    const r = ResearchResultSchema.parse({ jobId: "j", fallback: true, erlaubteQuellen: [] });
    expect(mergeResearch(base, r, "24.11.2026")).toEqual({ plan: base, verworfen: [] });
  });

  it("ignores a research step for an area not picked", () => {
    const r = result({
      schritte: [step("daten", { mitProgrammen: "Gehört nicht hierher.", quellen: [A] }), step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", quellen: [A] })],
      programme: [],
    });
    const { plan } = mergeResearch(base, r, "24.11.2026");
    expect(plan.schritte.map((s) => s.bereich)).toEqual(base.schritte.map((s) => s.bereich));
    expect(JSON.stringify(plan)).not.toMatch(/Gehört nicht hierher/);
  });

  it("gives the same URL one number", () => {
    const r = result({
      schritte: [step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", tipp: "Leg eine Regel an.", quellen: [A, A] }), step("postfach", { mitProgrammen: "Auch hier Outlook.", quellen: [A] })],
      programme: [{ name: "Outlook", zeilen: [{ text: "Hat eine API.", quellen: [A] }, { text: "Hat Regeln.", quellen: [A, B] }] }],
    });
    const { plan } = mergeResearch(base, r, "24.11.2026");
    expect(plan.quellen.map((q) => [q.n, q.url])).toEqual([
      [1, A],
      [2, B],
    ]);
    expect(plan.schritte[0].quellen).toEqual([1]);
    expect(plan.schritte[0].tipp).toBe("Leg eine Regel an."); // research tip replaces the fallback tip
    expect(plan.schritte[2].quellen).toEqual([1]);
    expect(plan.programme[0].quellen).toEqual([1, 2]);
  });

  it("sanitises every visitor text: dash, quotes, und, price, link (Review Focus 3)", () => {
    const r = result({
      schritte: [
        step("anfragen", {
          titel: 'Anfragen — schneller "beantworten"',
          idee: "Jede Anfrage bekommt eine Antwort, und zwei Terminvorschläge. Mehr auf https://vrelo.example/x",
          mitProgrammen: "Outlook – ab 9,90 € im Monat – lässt sich anbinden, siehe learn.microsoft.com.",
          tipp: 'Leg eine Regel "Anfrage" an — das dauert fünf Minuten.',
          quellen: [A],
        }),
      ],
      programme: [{ name: "Lexoffice", zeilen: [{ text: "Tarif XL für 29 EUR, und mit API — siehe www.lexoffice.de", quellen: [B] }] }],
    });
    const { plan } = mergeResearch(base, r, "24.11.2026");
    const texts = [
      ...plan.schritte.flatMap((s) => [s.titel, s.idee, s.mitProgrammen ?? "", s.tipp ?? ""]),
      ...plan.programme.flatMap((p) => [p.name, ...p.zeilen]),
    ];
    for (const t of texts) {
      expect(t).not.toMatch(/[–—"€]|, und |https?:|www\.|\.de\b|\.com\b|\.example\b|\d+[.,]\d+|EUR/);
    }
    expect(plan.schritte[0].titel.length).toBeLessThanOrEqual(40);
    expect(plan.schritte[0].tipp).toBe("Leg eine Regel „Anfrage“ an, das dauert fünf Minuten.");
  });
});
