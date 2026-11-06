import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { reiheNischen } from "./index";
import { PROTECTED, staleFiles } from "../../../scripts/reihe-publish-lib.mjs";

const json = JSON.parse(readFileSync(join(process.cwd(), "content/bauplan/reihe.json"), "utf8"));

describe("reihe.json", () => {
  for (const n of Object.values(reiheNischen)) {
    it(`${n.slug} has a matching entry`, () => {
      expect(json[n.slug]?.pages).toBe(n.pages);
      expect(json[n.slug]?.shareCopy).toMatch(/\.pdf$/);
    });
    it(`${n.slug} pdfPath exists when set`, () => {
      if (n.pdfPath) expect(existsSync(join(process.cwd(), "public", n.pdfPath))).toBe(true);
    });
  }
});

describe("staleFiles", () => {
  const dir = [...PROTECTED, "shk-bauplan-aaaaaaaa.pdf", "shk-bauplan-bbbbbbbb.pdf", "elektro-bauplan-12345678.pdf"];
  it("deletes only older hashed files of the slug", () => {
    expect(staleFiles("shk", dir, "shk-bauplan-bbbbbbbb.pdf")).toEqual(["shk-bauplan-aaaaaaaa.pdf"]);
  });
  it("never selects protected files, even for the agentur and elektro slugs", () => {
    for (const slug of ["agentur", "elektro"]) {
      const hit = staleFiles(slug, dir, "x.pdf");
      for (const p of PROTECTED) expect(hit).not.toContain(p);
    }
    expect(staleFiles("elektro", dir, "x.pdf")).toEqual(["elektro-bauplan-12345678.pdf"]);
  });
});
