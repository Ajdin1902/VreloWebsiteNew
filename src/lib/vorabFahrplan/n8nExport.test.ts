// Guard for the committed n8n exports: inactive, deliverUrl at production, no secret-like strings.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dir = join(process.cwd(), "n8n/prozess-check/workflows");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const DELIVER = "https://vrelo-ki.de/api/prozess-check/deliver";
// deliverUrl sits inside a JSON string (Config node jsonOutput), so its quotes are escaped in the file.
const deliverUrls = (raw: string) => [...raw.matchAll(/\\?"deliverUrl\\?"\s*:\s*\\?"([^"\\]*)/g)].map((m) => m[1]);

describe("n8n/prozess-check/workflows exports", () => {
  it("finds the four exports", () => {
    expect(files.sort()).toEqual(["pc-error.json", "pc-research.json", "pc-seed.json", "pc-sweep.json"]);
  });

  describe.each(files)("%s", (file) => {
    const raw = readFileSync(join(dir, file), "utf8");

    it("is inactive", () => {
      expect(JSON.parse(raw).active ?? false).toBe(false);
    });

    it("points every deliverUrl at production", () => {
      for (const u of deliverUrls(raw)) expect(u).toBe(DELIVER);
    });

    it("holds no 64-hex string and no sk-ant- key", () => {
      expect(raw).not.toMatch(/[0-9a-f]{64}/i);
      expect(raw).not.toContain("sk-ant-");
    });
  });

  it("the three workflows with a Config node carry a deliverUrl", () => {
    const n = files.filter((f) => deliverUrls(readFileSync(join(dir, f), "utf8")).length > 0);
    expect(n.sort()).toEqual(["pc-error.json", "pc-research.json", "pc-sweep.json"]);
  });
});
