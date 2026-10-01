import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Ajdin 2026-10-01: no comma before „und“ anywhere in the site's German copy.
// Ratgeber bodies and the Leistungen data run through findCopyIssues; this
// sweeps the rest of the source (pages, components, FAQ, e-mails). English
// comments never contain „und“, so a plain substring check is enough.
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : [];
  });
}

describe("German copy", () => {
  it("never puts a comma before und", () => {
    const hits = sourceFiles(path.join(process.cwd(), "src")).flatMap((f) =>
      fs
        .readFileSync(f, "utf8")
        .split("\n")
        .flatMap((line, i) => (/,\s+und\b/.test(line) ? [`${path.relative(process.cwd(), f)}:${i + 1}`] : [])),
    );
    expect(hits).toEqual([]);
  });
});
