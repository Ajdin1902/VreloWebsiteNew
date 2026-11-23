// @vitest-environment node
import { writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ParsedAnswers } from "@/lib/prozessCheck";
import { PDF_UI } from "./blocks";
import { LIMITS, type VorabFahrplan } from "./content";
import { buildFallbackPlan } from "./fallback";
import { pdfFilename, renderVorabFahrplanPdf } from "./pdf";

// pdfkit writes page objects uncompressed, so a regex counts them.
function pageCount(buf: Buffer): number {
  return (buf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

// Real words with umlauts, cut at a word boundary to exactly n characters (padded with „ä“ if needed).
const WORDS = "Über die Schnittstelle gehen Aufträge, Rechnungen und Belege ohne Abtippen in dein Programm, auch größere Mengen pro Woche".split(" ");
function text(n: number): string {
  let s = "";
  for (let i = 0; (s + " " + WORDS[i % WORDS.length]).trim().length <= n; i++) s = (s + " " + WORDS[i % WORDS.length]).trim();
  return s.padEnd(n, "ä");
}

const answers: ParsedAnswers = {
  bereiche: ["anfragen", "rechnungen", "postfach", "orga"],
  stunden: { anfragen: 2, rechnungen: 4, postfach: 3, orga: 2 },
  nervt: "anfragen",
  kanaele: ["mail", "telefon"],
  menge: "20bis50",
  wer: "buero",
  programmeChips: ["Outlook"],
  programmeText: "",
  programme: ["Outlook", "Lexoffice"],
  arbeitstag: text(LIMITS.arbeitstag),
  abende: "nein",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
};
const fallback = buildFallbackPlan(answers, { firma: "Müller & Söhne Haustechnik GmbH", name: "Jürgen Müller" }, new Date("2026-11-23T10:00:00Z"));

const quellen = Array.from({ length: 30 }, (_, i) => ({
  n: i + 1,
  url: `https://help.lexware.de/de-form/articles/5479${String(i).padStart(2, "0")}-rechnung-oder-teilrechnung-erstellen-schritt-fur-schritt`,
  abgerufen: "23.11.2026",
}));
const researched: VorabFahrplan = {
  ...fallback,
  arbeitstag: `„${text(LIMITS.arbeitstag)}“`,
  schritte: fallback.schritte.map((s, i) => ({
    ...s,
    titel: text(LIMITS.titel),
    idee: text(LIMITS.idee),
    mitProgrammen: text(LIMITS.mitProgrammen),
    ...(i === 0 ? { tipp: text(LIMITS.tipp) } : {}),
    quellen: [i * 2 + 1, i * 2 + 2],
  })),
  programme: Array.from({ length: 8 }, (_, i) => ({
    name: `Programm Nummer ${i + 1} Größe`,
    zeilen: [text(LIMITS.programmZeile), text(LIMITS.programmZeile), text(LIMITS.programmZeile)],
    quellen: [i + 7, i + 15, i + 23],
  })),
  quellen,
  recherchiert: true,
};

function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

describe("renderVorabFahrplanPdf", () => {
  it("renders a PDF", async () => {
    const buf = await renderVorabFahrplanPdf(fallback);
    expect(buf.subarray(0, 4).toString("latin1")).toBe("%PDF");
    // Visual check: VF_PDF_OUT=<dir> npx vitest run src/lib/vorabFahrplan/pdf.test.ts
    if (process.env.VF_PDF_OUT) {
      writeFileSync(path.join(process.env.VF_PDF_OUT, "fallback.pdf"), buf);
      writeFileSync(path.join(process.env.VF_PDF_OUT, "recherchiert.pdf"), await renderVorabFahrplanPdf(researched));
    }
  });

  it("fallback fits one page", async () => {
    expect(fallback.schritte).toHaveLength(3);
    expect(fallback.arbeitstag!.length).toBeGreaterThanOrEqual(LIMITS.arbeitstag);
    expect(fallback.schritte[0].tipp).toBeTruthy(); // the tip source line is on the page too
    expect(pageCount(await renderVorabFahrplanPdf(fallback))).toBe(1);
  });

  it("researched plan fits two pages", async () => {
    expect(pageCount(await renderVorabFahrplanPdf(researched))).toBe(2);
  });

  it("has no price", () => {
    for (const s of [...strings(fallback), ...strings(researched), ...strings(PDF_UI)]) {
      expect(s, s).not.toMatch(/€|\bEUR\b|\bEuro\b/i);
    }
  });
});

describe("pdfFilename", () => {
  it("is ASCII and names the Betrieb", () => {
    expect(pdfFilename("Müller & Söhne / GmbH")).toBe("Vrelo-Vorab-Fahrplan-Mueller-Soehne-GmbH.pdf");
  });
});
