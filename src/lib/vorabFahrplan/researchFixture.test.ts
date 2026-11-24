// A real pc-research payload from server1 (plan 2 Task 5 Step 5, made-up firm) must pass the
// deliver contract, so a drift between the n8n workflow and ResearchResultSchema shows up here.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ResearchResultSchema } from "./research";

const load = (f: string) => JSON.parse(readFileSync(join(__dirname, "__fixtures__", f), "utf8"));

// run-1: first build (3 fresh programs, cost stop hit); run-a: after Ruling X (1 fresh program, website read).
describe.each(["research-run-1.json", "research-run-a.json"])("%s (n8n pc-research output)", (f) => {
  const raw = load(f);

  it("parses with ResearchResultSchema as a researched result", () => {
    const r = ResearchResultSchema.parse(raw);
    expect(r.fallback).toBe(false);
    expect(r.pdf?.schritte.length).toBeGreaterThan(0);
    expect(r.dossier?.fragen).toHaveLength(5);
    expect(typeof r.dossier?.kostenUsd).toBe("number");
  });

  it("cites only URLs that n8n allowed", () => {
    const r = ResearchResultSchema.parse(raw);
    const erlaubt = new Set(r.erlaubteQuellen);
    const zitiert = [...r.pdf!.schritte.flatMap((s) => s.quellen), ...r.pdf!.programme.flatMap((p) => p.zeilen.flatMap((z) => z.quellen))];
    expect(r.erlaubteQuellen.every((u) => /^https?:\/\//.test(u))).toBe(true);
    // The website drops a claim with an unknown source; this counts how often the model cited one.
    expect(zitiert.filter((u) => !erlaubt.has(u))).toEqual([]);
  });
});
