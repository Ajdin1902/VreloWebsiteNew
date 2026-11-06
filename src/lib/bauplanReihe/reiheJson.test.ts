import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { reiheNischen } from "./index";

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
