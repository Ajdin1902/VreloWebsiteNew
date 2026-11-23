import { describe, expect, it } from "vitest";
import { AREA_IDS, PROGRAMM_CHIPS } from "@/lib/prozessCheck";
import { AREA_IDEE, KANAL_VARIANTE, KANAL_WEG, MENGE_ZEILE, PDF_UI, TIPPS, WER_ZEILE } from "./blocks";
import { zuerstIdee } from "./fallback";
import { LIMITS } from "./content";

function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

const ALL = strings({ AREA_IDEE, KANAL_VARIANTE, KANAL_WEG, MENGE_ZEILE, WER_ZEILE, PDF_UI, TIPPS: TIPPS.map((t) => t.text) });

describe("blocks copy guards", () => {
  it("keeps the German punctuation and voice rules", () => {
    for (const s of ALL) {
      expect(s, s).not.toMatch(/"|–|—|€|\bEUR\b|,\s+und\b/);
      expect((s.match(/„/g) ?? []).length, s).toBe((s.match(/“/g) ?? []).length);
      for (const w of ["skalieren", "Game-Changer", "KI-Magie", "revolution"]) expect(s.toLowerCase(), s).not.toContain(w.toLowerCase());
    }
  });

  it("has an idea for every area within the caps", () => {
    for (const id of AREA_IDS) {
      const b = AREA_IDEE[id];
      expect(b.titel.length).toBeLessThanOrEqual(LIMITS.titel);
      expect(b.lang.length).toBeLessThanOrEqual(LIMITS.idee);
      expect(b.kurz.length).toBeLessThanOrEqual(160);
      expect(b.lang).toMatch(/\. \S/); // two sentences: the first one is swappable
    }
  });

  it("has 15 to 20 channel variants that keep the idea within the cap", () => {
    const entries = Object.entries(KANAL_VARIANTE).flatMap(([area, m]) => Object.keys(m ?? {}).map((k) => [area, k]));
    expect(entries.length).toBeGreaterThanOrEqual(15);
    expect(entries.length).toBeLessThanOrEqual(20);
    for (const id of AREA_IDS) {
      for (const k of Object.keys(KANAL_VARIANTE[id] ?? {})) {
        expect(zuerstIdee(id, [k as never]).length).toBeLessThanOrEqual(LIMITS.idee);
      }
    }
  });

  it("has 10 to 15 sourced tips for chip programs only", () => {
    expect(TIPPS.length).toBeGreaterThanOrEqual(10);
    expect(TIPPS.length).toBeLessThanOrEqual(15);
    for (const t of TIPPS) {
      expect(PROGRAMM_CHIPS).toContain(t.programm);
      expect(t.programm).not.toBe("Papier und Zettel");
      expect(t.quelle).toMatch(/^https:\/\//);
      expect(t.abgerufen).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
      expect(t.text.length).toBeLessThanOrEqual(LIMITS.tipp);
    }
  });
});
