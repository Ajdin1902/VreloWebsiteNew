import { describe, expect, it } from "vitest";
import type { ParsedAnswers } from "@/lib/prozessCheck";
import { TIPPS } from "./blocks";
import type { VorabFahrplan } from "./content";
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
  programme: ["Outlook", "lexoffice"],
  arbeitstag: "Morgens Mails, abends Rechnungen.",
  abende: "nein",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
};
const PROG = answers.programme;
const base = buildFallbackPlan(answers, { firma: "Muster GmbH", name: "Max Muster" }, new Date("2026-11-23T10:00:00Z"));
const TIPP = TIPPS.find((t) => t.bereich === "anfragen" && t.programm === "Outlook")!;
const A = "https://learn.microsoft.com/graph/outlook";
const B = "https://developers.lexoffice.io/docs";
const FREMD = "https://ausgedacht.example/seite";
const AM = "24.11.2026";

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

/** Every number in quellen is cited by something the visitor sees, and every cited number exists. */
function expectOnlyVisibleSources(plan: VorabFahrplan) {
  const cited = new Set([...plan.schritte.flatMap((s) => s.quellen), ...plan.programme.flatMap((p) => p.quellen)]);
  expect(plan.quellen.map((q) => q.n).sort()).toEqual([...cited].sort());
  for (const s of plan.schritte) if (!s.mitProgrammen && !s.tipp) expect(s.quellen).toEqual([]);
}

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
    const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
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
      { n: 1, url: A, abgerufen: AM },
      { n: 2, url: TIPP.quelle, abgerufen: TIPP.abgerufen },
      { n: 3, url: B, abgerufen: AM },
    ]);
    expect(zuerst.tipp).toBe(TIPP.text);
    expect(zuerst.quellen).toEqual([1, 2]);
    expect(danach.quellen).toEqual([3]);
    expectOnlyVisibleSources(plan);
  });

  it("drops a claim citing a URL that was never fetched (Review Focus 2)", () => {
    const r = result({
      schritte: [step("anfragen", { mitProgrammen: "Outlook kann alles.", quellen: [A, FREMD] }), step("rechnungen", { mitProgrammen: "Ohne Quelle.", quellen: [] })],
      programme: [{ name: "Lexoffice", zeilen: [{ text: "Hat eine API.", quellen: [B] }, { text: "Erfunden.", quellen: [FREMD] }] }],
    });
    const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
    expect(plan.schritte[0].mitProgrammen).toBeUndefined();
    expect(plan.schritte[1].mitProgrammen).toBeUndefined();
    expect(plan.programme).toEqual([{ name: "lexoffice", zeilen: ["Hat eine API."], quellen: [2] }]);
    expect(plan.quellen.map((q) => q.url)).toEqual([TIPP.quelle, B]);
    expect(verworfen).toHaveLength(3);
    expect(verworfen.join(" ")).toMatch(/Outlook kann alles/);
    expectOnlyVisibleSources(plan);
  });

  it("drops a program that loses every line, and a URL that is not http(s)", () => {
    const js = "javascript:alert(1)";
    const r = result(
      {
        schritte: [step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", quellen: [A] })],
        programme: [{ name: "Outlook", zeilen: [{ text: "Kann zaubern.", quellen: [js] }] }],
      },
      [A, js],
    );
    const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
    expect(plan.programme).toEqual([]);
    expect(verworfen.join(" ")).toMatch(/Kann zaubern/);
  });

  it("drops a program the visitor never named", () => {
    const r = result({
      schritte: [],
      programme: [
        { name: "HubSpot", zeilen: [{ text: "Hat ein CRM.", quellen: [A] }] },
        { name: "Lex Office", zeilen: [{ text: "Hat eine API.", quellen: [B] }] },
      ],
    });
    const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
    expect(plan.programme.map((p) => p.name)).toEqual(["lexoffice"]);
    expect(verworfen.join(" ")).toMatch(/HubSpot/);
    expect(JSON.stringify(plan)).not.toMatch(/HubSpot|CRM/);
  });

  it("keeps monday.com only when the visitor named it", () => {
    const pdf = { schritte: [step("anfragen", { mitProgrammen: "Mit monday.com lässt sich das planen.", quellen: [A] })], programme: [] };
    expect(mergeResearch(base, result(pdf), AM, [...PROG, "monday.com"]).plan.schritte[0].mitProgrammen).toBe(
      "Mit monday.com lässt sich das planen.",
    );
    const { plan, verworfen } = mergeResearch(base, result(pdf), AM, PROG);
    expect(JSON.stringify(plan)).not.toMatch(/monday/);
    expect(verworfen.join(" ")).toMatch(/domain/);
  });

  it("falls back to the base plan when no sourced item survives", () => {
    const r = result({ schritte: [step("anfragen", { idee: "KI-Text ohne Beleg.", mitProgrammen: "Behauptung.", quellen: [FREMD] })], programme: [] });
    const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
    expect(plan).toEqual(base);
    expect(plan.recherchiert).toBe(false);
    expect(verworfen).toHaveLength(1);
  });

  it("returns the base plan for a fallback result", () => {
    const r = ResearchResultSchema.parse({ jobId: "j", fallback: true, erlaubteQuellen: [] });
    expect(mergeResearch(base, r, AM, PROG)).toEqual({ plan: base, verworfen: [] });
  });

  it("ignores a research step for an area not picked", () => {
    const r = result({
      schritte: [step("daten", { mitProgrammen: "Gehört nicht hierher.", quellen: [A] }), step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", quellen: [A] })],
      programme: [],
    });
    const { plan } = mergeResearch(base, r, AM, PROG);
    expect(plan.schritte.map((s) => s.bereich)).toEqual(base.schritte.map((s) => s.bereich));
    expect(JSON.stringify(plan)).not.toMatch(/Gehört nicht hierher/);
  });

  it("gives the same URL one number", () => {
    const r = result({
      schritte: [step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", tipp: "Leg eine Regel an.", quellen: [A, A] }), step("postfach", { mitProgrammen: "Auch hier Outlook.", quellen: [A] })],
      programme: [{ name: "Outlook", zeilen: [{ text: "Hat eine API.", quellen: [A] }, { text: "Hat Regeln.", quellen: [A, B] }] }],
    });
    const { plan } = mergeResearch(base, r, AM, PROG);
    expect(plan.quellen.map((q) => [q.n, q.url])).toEqual([
      [1, A],
      [2, B],
    ]);
    expect(plan.schritte[0].quellen).toEqual([1]);
    expect(plan.schritte[0].tipp).toBe("Leg eine Regel an."); // research tip replaces the fallback tip
    expect(plan.schritte[2].quellen).toEqual([1]);
    expect(plan.programme[0].quellen).toEqual([1, 2]);
  });

  it("numbers no source of a discarded Danach tip", () => {
    const r = result({
      schritte: [step("anfragen", { mitProgrammen: "Outlook lässt sich anbinden.", quellen: [A] }), step("rechnungen", { tipp: "Probier die Vorlage.", quellen: [B] })],
      programme: [],
    });
    const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
    expect(plan.quellen.map((q) => q.url)).not.toContain(B);
    expect(plan.schritte[1].tipp).toBeUndefined();
    expect(verworfen.join(" ")).toMatch(/Probier die Vorlage/);
    expectOnlyVisibleSources(plan);
  });

  it("drops every claim with a price or percent, leaving no fragment (Ruling O)", () => {
    const preise = [
      "Tarif ab EUR 29 im Monat",
      "kostet 29 $",
      "kostet 19,99 USD",
      "kostet CHF 20",
      "kostet 1 000 €",
      "kostet 1\u00a0000 €",
      "kostet 1\u202f000 €",
      "kostet 1.000 €",
      "ab 9,90 €/Monat",
      "macht dich 30 % schneller",
    ];
    for (const x of preise) {
      const r = result({
        schritte: [step("anfragen", { mitProgrammen: `Outlook ${x}.`, quellen: [A] })],
        programme: [{ name: "Outlook", zeilen: [{ text: `Lexoffice ${x}.`, quellen: [A] }, { text: "Hat Regeln.", quellen: [A] }] }],
      });
      const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
      expect(JSON.stringify(plan), x).not.toContain(x);
      const texte = [...plan.schritte.flatMap((s) => [s.titel, s.idee, s.mitProgrammen ?? "", s.tipp ?? ""]), ...plan.programme.flatMap((p) => p.zeilen)];
      expect(texte.join(" "), x).not.toMatch(/[€$%\d]|EUR|USD|CHF/);
      expect(plan.schritte[0].mitProgrammen, x).toBeUndefined();
      expect(plan.programme[0].zeilen, x).toEqual(["Hat Regeln."]);
      expect(verworfen.join(" "), x).toMatch(/price|percent/);
    }
  });

  it("uses the base text for a forbidden titel or idee, polishes what it keeps (Review Focus 3)", () => {
    const r = result({
      schritte: [
        step("anfragen", {
          titel: "Anfragen ab 9,90 € beantworten",
          idee: "Jede Anfrage bekommt eine Antwort. Mehr auf https://vrelo.example/x",
          mitProgrammen: 'Outlook — mit "Regeln", und Ordnern.',
          tipp: "Das ist ein Game-Changer!",
          quellen: [A],
        }),
        step("rechnungen", { titel: 'Rechnungen "sofort"', idee: "Mo.–Fr. geht jede Rechnung raus, und keine bleibt liegen.", mitProgrammen: "Lexoffice hat eine API.", quellen: [B] }),
      ],
      programme: [],
    });
    const { plan, verworfen } = mergeResearch(base, r, AM, PROG);
    const [zuerst, danach] = plan.schritte;
    expect(zuerst.titel).toBe(base.schritte[0].titel);
    expect(zuerst.idee).toBe(base.schritte[0].idee);
    expect(zuerst.mitProgrammen).toBe("Outlook, mit „Regeln“ und Ordnern.");
    expect(zuerst.tipp).toBe(TIPP.text); // research tip dropped (banned word): fallback tip stays
    expect(danach.titel).toBe("Rechnungen „sofort“");
    expect(danach.idee).toBe("Mo. bis Fr. geht jede Rechnung raus und keine bleibt liegen.");
    expect(verworfen.join(" ")).toMatch(/titel \(price\)/);
    expect(verworfen.join(" ")).toMatch(/idee \(url/);
    expect(verworfen.join(" ")).toMatch(/tipp \(banned\)/);
    expect(JSON.stringify({ ...plan, quellen: [] })).not.toMatch(/[–—€]|, und |https?:|Game-Changer|vrelo\.example/);
    expectOnlyVisibleSources(plan);
  });
});
