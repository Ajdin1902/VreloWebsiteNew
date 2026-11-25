// @vitest-environment node
import { writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ParsedAnswers } from "@/lib/prozessCheck";
import { PDF_UI } from "./blocks";
import { LIMITS, type VorabFahrplan } from "./content";
import { buildFallbackPlan } from "./fallback";
import { pdfFilename, programmZeile, renderVorabFahrplanPdf, shortUrl } from "./pdf";

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

  it("fallback with 8 programs of the maximum 40 characters still fits one page", async () => {
    const programme = Array.from({ length: 8 }, (_, i) => `${text(38)} ${i}`);
    const p = buildFallbackPlan({ ...answers, programme }, { firma: text(60), name: "Jürgen Müller" }, new Date("2026-11-23T10:00:00Z"));
    expect(p.programmNamen).toMatch(/ und weitere\.$/);
    expect(pageCount(await renderVorabFahrplanPdf(p))).toBe(1);
  });

  // The program line is a fallback-only section: page 2 names the programs of a researched plan.
  it("shows the program line on a fallback plan only", () => {
    expect(programmZeile(fallback)).toBe("Outlook, Lexoffice. Die schaue ich mir im Gespräch genauer an.");
    expect(programmZeile({ ...researched, programmNamen: "Outlook, Lexoffice." })).toBeNull();
    expect(programmZeile({ ...fallback, programmNamen: undefined })).toBeNull();
  });

  it("researched plan fits two pages", async () => {
    expect(pageCount(await renderVorabFahrplanPdf(researched))).toBe(2);
  });

  // parseSubmission caps firma at 60: the longest allowed name must not push a page over.
  it("a 60-character firma keeps the fallback at 1 page and the researched plan at 2", async () => {
    const firma = text(60);
    expect(firma).toHaveLength(60);
    expect(pageCount(await renderVorabFahrplanPdf({ ...fallback, firma }))).toBe(1);
    expect(pageCount(await renderVorabFahrplanPdf({ ...researched, firma }))).toBeLessThanOrEqual(2);
  });

  // The deliver route and the form action may render at the same time in one instance.
  it("renders 3 PDFs concurrently", async () => {
    const bufs = await Promise.all([fallback, researched, { ...fallback, firma: "Zweite GmbH" }].map(renderVorabFahrplanPdf));
    for (const b of bufs) expect(b.subarray(0, 4).toString("latin1")).toBe("%PDF");
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

describe("shortUrl", () => {
  it("keeps the part that tells sources apart", () => {
    // Same first 60 characters, so a cut from the left alone would print both the same.
    const base = "https://help.lexware.de/de-form/articles/rechnungen-und-mahnungen/";
    const a = `${base}547985-zahlungserinnerungen-erstellen`;
    const b = `${base}547986-rechnung-anlegen`;
    expect(shortUrl(a, 42)).not.toBe(shortUrl(b, 42));
    expect(shortUrl(b, 42)).toBe("help.lexware.de/…/547986-rechnung-anlegen");
    const ms = "https://support.microsoft.com/de-de/office/7a527697-058f-4967-b8f1-aae0774e4813";
    expect(shortUrl(ms, 42)).toBe("support.microsoft.com/…/7a527697-058f-496…");
    for (const u of [a, b, ms]) expect(shortUrl(u, 42).length).toBeLessThanOrEqual(42);
    expect(new Set(researched.quellen.map((q) => shortUrl(q.url, 42))).size).toBe(30);
  });

  it("leaves short URLs whole", () => {
    expect(shortUrl("https://www.notion.com/help/database-templates", 42)).toBe("notion.com/help/database-templates");
  });
});
