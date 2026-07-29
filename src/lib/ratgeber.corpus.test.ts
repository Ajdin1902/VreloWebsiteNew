import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { stripFrontmatter, findCopyIssues } from "./ratgeberCopy";

const DIR = path.join(process.cwd(), "content/ratgeber");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

describe("Ratgeber corpus typography", () => {
  it("finds article files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s has clean German typography", (file) => {
    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const issues = findCopyIssues(stripFrontmatter(raw));
    expect({ file, issues }).toEqual({ file, issues: [] });
  });

  // The three May-2026 articles predate the slug-matches-cover rule and use
  // short cover names (ratgeber-system/zeit/termine). Renaming live assets is
  // out of scope here, so the rule is enforced for articles created after them.
  const LEGACY = new Set([
    "durcheinander-oder-saubere-quelle.mdx",
    "taeglich-stunden-zurueckgewinnen.mdx",
    "terminbestaetigungen-automatisieren.mdx",
  ]);

  // A plain it() with a loop, not it.each - the filtered list is empty until
  // the first new article lands, and it.each([]) throws in Vitest.
  it("new articles have a cover path matching their slug", () => {
    for (const file of files.filter((f) => !LEGACY.has(f))) {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const slug = file.replace(/\.mdx$/, "");
      expect({ file, ok: raw.includes(`cover: "/images/ratgeber-${slug}.webp"`) }).toEqual({
        file,
        ok: true,
      });
    }
  });
});
