// src/lib/claudeGehirnPage.test.ts
import { describe, it, expect } from "vitest";
import { gehirnPage } from "./claudeGehirnPage";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(gehirnPage);

describe("/claude-gehirn copy", () => {
  it("collects a substantial body of copy", () => {
    expect(all.length).toBeGreaterThan(50);
  });

  it("follows the house typography in every string", () => {
    const bad = all.flatMap((s) => findCopyIssues(s).map((i) => `${i.kind}: ${s}`));
    expect(bad).toEqual([]);
  });

  it("names no price and no euro figure", () => {
    expect(all.filter((s) => /€|\bEUR\b|\bEuro\b/i.test(s))).toEqual([]);
  });

  it("never claims a partnership or certification with Anthropic", () => {
    expect(all.filter((s) => /Partner|zertifiziert/i.test(s))).toEqual([]);
  });

  it("states the requirements honestly, up front", () => {
    const v = strings(gehirnPage.voraussetzungen).join(" ");
    expect(v).toContain("Pro");
    expect(v).toContain("kostenlosen Tarif nicht enthalten");
    expect(v).toContain("Vorschau");
  });

  it("covers all four storage options plus our own way", () => {
    expect(gehirnPage.ordner.options.map((o) => o.name)).toEqual([
      "Lokal auf deinem Rechner",
      "OneDrive",
      "iCloud Drive",
      "Google Drive",
    ]);
    expect(gehirnPage.ordner.unserWeg.body).toContain("jede Stunde");
  });

  it("asks for nothing: no CTA copy anywhere", () => {
    expect(all.filter((s) => /Erstgespräch|Prozess-Check|buchen|Termin vereinbaren/i.test(s))).toEqual([]);
  });

  // Final review 2026-10-03: „Dokumente“ often lives in OneDrive on Windows,
  // so the local example must not point there; the ask-first rule matches the prompt.
  it("gives a local example path outside Dokumente", () => {
    expect(gehirnPage.ordner.options[0].wo).toContain(String.raw`C:\Mein Gehirn`);
    expect(gehirnPage.ordner.options[0].wo).not.toContain("Dokumente");
  });

  it("describes the ask-first rule the way the prompt scopes it", () => {
    const rule = gehirnPage.regeln.items.find((r) => r.title === "Erst fragen.")!;
    expect(rule.body).toContain("Quellen");
  });

  it("offers adding an existing folder and is honest that Cowork has no write protection", () => {
    expect(gehirnPage.schritte.tipp).toContain("Pfad");
    expect(gehirnPage.schritte.tippHinweis).toContain("keinen Schreibschutz");
  });

  it("says Vrelo is not affiliated with Anthropic", () => {
    expect(gehirnPage.hinweis).toContain("nicht mit Anthropic verbunden");
  });
});
