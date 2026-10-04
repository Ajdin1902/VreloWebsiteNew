// src/lib/claudeGehirnPage.test.ts
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { gehirnPage } from "./claudeGehirnPage";
import { getGehirnPrompt } from "./claudeGehirn";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(gehirnPage);

// Ajdin 2026-10-04: prompt first, then steps + video, folder table, folder tree,
// three things to keep in mind and the honest „Gut zu wissen“.
describe("/claude-gehirn copy", () => {
  it("stays short", () => {
    expect(all.join(" ").length).toBeLessThan(3600);
  });

  it("follows the house typography in every string", () => {
    const bad = all.flatMap((s) => findCopyIssues(s).map((i) => `${i.kind}: ${s}`));
    expect(bad).toEqual([]);
  });

  it("names no price and no euro figure", () => {
    expect(all.filter((s) => /€|\bEUR\b|\bEuro\b/i.test(s))).toEqual([]);
  });

  it("never claims a partnership or certification with Anthropic", () => {
    expect(all.filter((s) => /\bPartner|zertifiziert/i.test(s))).toEqual([]);
  });

  it("asks for nothing: no CTA copy anywhere", () => {
    expect(all.filter((s) => /Erstgespräch|Prozess-Check|buchen|Termin vereinbaren/i.test(s))).toEqual([]);
  });

  it("keeps the opening line to the three actions (Ajdin 2026-10-04)", () => {
    expect(gehirnPage.top.line).toBe("Kopieren, in Claude einfügen, abschicken.");
  });

  it("states the requirements honestly, in the description too", () => {
    const v = gehirnPage.top.voraussetzungen.join(" ");
    expect(v).toContain("Claude Pro oder höher");
    expect(v).toContain("Windows oder Mac");
    expect(v).toContain("15 Minuten");
    expect(gehirnPage.meta.description).toContain("ab Pro");
  });

  it("opens with the vision: three points, the goal, three example questions, my own use", () => {
    const v = gehirnPage.vision;
    expect(v.items).toHaveLength(3);
    expect(v.items[1]).toContain("Sparringspartner");
    expect(v.ziel).toBe("Das Ziel: dein eigenes KI-Gehirn.");
    expect(v.fragen).toHaveLength(3);
    for (const f of v.fragen) expect(f).toMatch(/^„.+“$/);
    expect(v.ich).toContain("So arbeite ich selbst");
  });

  it("has three setup steps, starting with an empty folder", () => {
    expect(gehirnPage.anleitung.steps).toHaveLength(3);
    expect(gehirnPage.anleitung.steps[0]).toContain("leeren Ordner");
  });

  it("ships the tutorial video and its poster", () => {
    const { src, poster } = gehirnPage.anleitung.video;
    expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
    expect(existsSync(join(process.cwd(), "public", poster))).toBe(true);
  });

  it("compares local and cloud folders in four columns, with our own backup", () => {
    const s = gehirnPage.speicherort;
    expect(s.columns).toHaveLength(4);
    expect(s.rows).toHaveLength(2);
    const [lokal, cloud] = s.rows;
    expect(lokal.ort).toContain(String.raw`C:\Mein Gehirn`);
    expect(lokal.wann).toContain("jede Stunde");
    expect(cloud.ort).toContain("OneDrive");
    expect(cloud.nachteile).toContain("Immer auf diesem Gerät behalten");
  });

  it("shows exactly the folder structure the prompt builds", () => {
    const prompt = getGehirnPrompt();
    const names = gehirnPage.ordner.tree.map((e) => e.name);
    expect(names).toEqual(["CLAUDE.md", "inhalt.md", "verlauf.md", "quellen/", "wissen/"]);
    for (const n of names) expect(prompt).toContain(n);
  });

  it("lists the three things to keep in mind", () => {
    expect(gehirnPage.beachten.items).toHaveLength(3);
    expect(gehirnPage.beachten.items[0]).toContain("in diesem Ordner");
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
