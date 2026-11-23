import { describe, expect, it } from "vitest";
import { STEPS, type ParsedAnswers } from "@/lib/prozessCheck";
import { AREA_IDEE, KANAL_VARIANTE, TIPPS } from "./blocks";
import { buildFallbackPlan, schrittOrder } from "./fallback";

const base: ParsedAnswers = {
  bereiche: ["anfragen", "rechnungen", "postfach", "orga"],
  stunden: { anfragen: 0, rechnungen: 4, postfach: 3, orga: 2 },
  nervt: "anfragen",
  kanaele: ["mail"],
  menge: "20bis50",
  wer: "buero",
  programmeChips: [],
  programmeText: "",
  programme: [],
  arbeitstag: "",
  abende: "nein",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
};
const contact = { firma: "Muster GmbH", name: "Max Muster" };
const now = new Date("2026-11-23T23:30:00Z"); // already 24.11. in Berlin

describe("schrittOrder", () => {
  it("puts the nervt area first even at 0 h, then hours, at most 3", () => {
    expect(schrittOrder(base)).toEqual(["anfragen", "rechnungen", "postfach"]);
  });
  it("skips other areas at 0 h", () => {
    expect(schrittOrder({ ...base, stunden: { anfragen: 0, rechnungen: 4 } })).toEqual(["anfragen", "rechnungen"]);
  });
});

describe("buildFallbackPlan", () => {
  it("leads with the nervt area at 0 h and uses the short form after it", () => {
    const p = buildFallbackPlan(base, contact, now);
    expect(p.schritte.map((s) => [s.rang, s.bereich])).toEqual([
      ["Zuerst", "anfragen"],
      ["Danach", "rechnungen"],
      ["Später", "postfach"],
    ]);
    expect(p.schritte[1].idee).toBe(AREA_IDEE.rechnungen.kurz);
    expect(p.schritte[0].titel).toBe(AREA_IDEE.anfragen.titel);
  });

  it("picks the mail variant over papier", () => {
    const p = buildFallbackPlan({ ...base, kanaele: ["papier", "mail"] }, contact, now);
    expect(p.schritte[0].idee.startsWith(KANAL_VARIANTE.anfragen!.mail!)).toBe(true);
    expect(p.schritte[0].idee).toContain(AREA_IDEE.anfragen.lang.slice(AREA_IDEE.anfragen.lang.indexOf(". ") + 2));
  });

  it("adds a tip only under Zuerst, only for a named program, sourced as [1]", () => {
    const none = buildFallbackPlan(base, contact, now);
    expect(none.schritte.every((s) => !s.tipp)).toBe(true);
    expect(none.quellen).toEqual([]);

    // Excel's tip is for daten, not for the Zuerst area: no tip.
    expect(buildFallbackPlan({ ...base, programme: ["Excel"] }, contact, now).schritte[0].tipp).toBeUndefined();

    const p = buildFallbackPlan({ ...base, programme: ["outlook", "Lexoffice"] }, contact, now);
    const tip = TIPPS.find((t) => t.programm === "Outlook" && t.bereich === "anfragen")!;
    expect(p.schritte[0].tipp).toBe(tip.text);
    expect(p.schritte[0].quellen).toEqual([1]);
    expect(p.quellen).toEqual([{ n: 1, url: tip.quelle, abgerufen: "24.11.2026" }]);
    expect(p.schritte.slice(1).every((s) => !s.tipp && s.quellen.length === 0)).toBe(true);
  });

  it("is never marked researched and has no program page", () => {
    const p = buildFallbackPlan({ ...base, programme: ["Outlook"] }, contact, now);
    expect(p.recherchiert).toBe(false);
    expect(p.programme).toEqual([]);
    expect(p.schritte.every((s) => s.mitProgrammen === undefined)).toBe(true);
  });

  it("lists every picked channel in aufgabeZeile", () => {
    const aufgabe = STEPS.find((s) => s.id === "aufgabe")!;
    if (aufgabe.kind !== "aufgabe") throw new Error("step");
    const p = buildFallbackPlan({ ...base, kanaele: ["papier", "telefon", "mail"] }, contact, now);
    for (const k of ["papier", "telefon", "mail"]) {
      expect(p.aufgabeZeile).toContain(aufgabe.kanaele.find((o) => o.value === k)!.label);
    }
    expect(p.aufgabeZeile).toBe("kommt per Mail, per Telefon und auf Papier rein · 20 bis 50 pro Woche · macht das Büro");
  });

  it("fills the header lines from the answers", () => {
    const p = buildFallbackPlan({ ...base, arbeitstag: "  Morgens Mails, dann Baustelle. " }, contact, now);
    expect(p).toMatchObject({ firma: "Muster GmbH", name: "Max Muster", datum: "24.11.2026" });
    expect(p.stundenZeile).toBe("Rund 9 Stunden pro Woche · 52 Arbeitstage im Jahr");
    expect(p.arbeitstag).toBe("„Morgens Mails, dann Baustelle.“");
    expect(p.zeitVerteilung.map((z) => z.stunden)).toEqual([4, 3, 2]);
    expect(buildFallbackPlan(base, contact, now).arbeitstag).toBeUndefined();
  });
});
