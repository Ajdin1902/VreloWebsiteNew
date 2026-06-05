import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAllArticles, getArticleSlugs, getArticleBySlug } from "./ratgeber";

let dir: string;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "ratgeber-"));
  fs.writeFileSync(path.join(dir, "alpha.mdx"), `---\ntitle: "Alpha"\ndescription: "A"\ndate: "2026-03-01"\ntags: ["X"]\n---\nKörper A`);
  fs.writeFileSync(path.join(dir, "beta.mdx"), `---\ntitle: "Beta"\ndescription: "B"\ndate: "2026-04-01"\n---\nKörper B`);
  fs.writeFileSync(path.join(dir, "entwurf.mdx"), `---\ntitle: "Entwurf"\ndescription: "E"\ndate: "2026-05-01"\ndraft: true\n---\nKörper E`);
});

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("getAllArticles (IO)", () => {
  it("reads .mdx files, newest-first, drafts excluded by default flag override", () => {
    const r = getAllArticles({ dir, includeDrafts: false });
    expect(r.map((a) => a.slug)).toEqual(["beta", "alpha"]);
  });

  it("includes drafts when asked", () => {
    const r = getAllArticles({ dir, includeDrafts: true });
    expect(r.map((a) => a.slug)).toEqual(["entwurf", "beta", "alpha"]);
  });

  it("returns [] for a missing directory", () => {
    expect(getAllArticles({ dir: path.join(dir, "nope"), includeDrafts: true })).toEqual([]);
  });
});

describe("getArticleSlugs (IO)", () => {
  it("returns published slugs newest-first", () => {
    expect(getArticleSlugs({ dir, includeDrafts: false })).toEqual(["beta", "alpha"]);
  });
});

describe("getArticleBySlug (IO)", () => {
  it("returns the matching article (drafts findable for the route to guard)", () => {
    expect(getArticleBySlug("entwurf", { dir }).title).toBe("Entwurf");
  });

  it("throws when the slug is unknown", () => {
    expect(() => getArticleBySlug("missing", { dir })).toThrow();
  });
});
