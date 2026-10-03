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

// Ajdin 2026-10-03: the page is the prompt plus the minimum to use it safely.
describe("/claude-gehirn copy", () => {
  it("stays short", () => {
    expect(all.join(" ").length).toBeLessThan(2600);
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

  it("asks for nothing: no CTA copy anywhere", () => {
    expect(all.filter((s) => /Erstgespräch|Prozess-Check|buchen|Termin vereinbaren/i.test(s))).toEqual([]);
  });

  it("states the requirements honestly, in the description too", () => {
    expect(gehirnPage.anleitung.voraussetzungen).toContain("Windows oder Mac");
    expect(gehirnPage.anleitung.voraussetzungen).toContain("ab Pro");
    expect(gehirnPage.anleitung.voraussetzungen).toContain("Vorschau");
    expect(gehirnPage.meta.description).toContain("ab Pro");
  });

  it("offers an added folder and own mails instead of copying", () => {
    expect(gehirnPage.anleitung.tipp).toContain("Pfad");
    expect(gehirnPage.anleitung.tipp).toContain("eigene Mails");
  });

  it("says where the folder goes, outside Dokumente, with our own backup", () => {
    const o = gehirnPage.anleitung.ordner;
    expect(o).toContain(String.raw`C:\Mein Gehirn`);
    expect(o).not.toContain("Dokumente");
    expect(o).toContain("Immer auf diesem Gerät behalten");
    expect(o).toContain("jede Stunde");
  });

  it("is honest about data, write protection and ownership", () => {
    const g = gehirnPage.gutZuWissen.items.join(" ");
    expect(g).toContain("Anthropic");
    expect(g).toContain("keinen Schreibschutz");
    expect(g).toContain("gehören dir");
  });

  it("says Vrelo is not affiliated with Anthropic", () => {
    expect(gehirnPage.hinweis).toContain("nicht mit Anthropic verbunden");
  });
});
