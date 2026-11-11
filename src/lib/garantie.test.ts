import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { GARANTIE } from "./garantie";
import { findCopyIssues } from "./ratgeberCopy";

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sourceFiles(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

describe("GARANTIE", () => {
  it("holds the approved guarantee copy (Ajdin 2026-11-11)", () => {
    // The hero line left the site 2026-11-11 (Ajdin).
    expect(GARANTIE).not.toHaveProperty("hero");
    expect(GARANTIE.titel).toBe("Erste Ergebnisse in 2 Wochen. Sonst Geld zurück.");
    expect(GARANTIE.text).toBe(
      "Im Angebot steht die Liste deiner Anforderungen. Der erste Punkt läuft zwei Wochen nach dem Onboarding. Wenn nicht, bekommst du alles zurück, was du bis dahin gezahlt hast.",
    );
  });

  it("spells out all four conditions in the FAQ answer", () => {
    for (const s of ["Prozess-Audit", "Zugänge", "Warte ich", "zurück", "Feinschliff"]) expect(GARANTIE.faqAntwort).toContain(s);
  });

  it("passes the copy guards", () => {
    for (const s of Object.values(GARANTIE)) expect(findCopyIssues(s), s).toEqual([]);
  });

  // The hero promises 2 weeks; a leftover 14-day money-back line elsewhere would contradict it (UWG §5).
  it("leaves no 14-day money-back promise anywhere in src/", () => {
    const hits: string[] = [];
    for (const f of sourceFiles(path.join(process.cwd(), "src")))
      fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((line, i) => {
        if (/14 Tagen?\b/.test(line) && /vollen Betrag|Geld zurück/.test(line)) hits.push(`${f}:${i + 1}`);
      });
    expect(hits).toEqual([]);
  });
});
