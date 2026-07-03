import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Static guard: the demo route handlers must not pass request bodies / content to console.
const ROUTES = ["src/app/demo/chat/route.ts", "src/app/demo/extract/route.ts"];

describe("no-PII logging", () => {
  for (const rel of ROUTES) {
    it(`${rel} contains no console.* calls`, () => {
      const src = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
      expect(src).not.toMatch(/console\.(log|info|warn|error|debug)\s*\(/);
    });
  }
});
