import { describe, it, expect } from "vitest";
import { portraits } from "./portraits";

describe("portraits", () => {
  it("describes both founder photos by name and points at the WebP crops", () => {
    for (const p of [portraits.stehend, portraits.sitzend]) {
      expect(p.alt).toContain("Ajdin Dzafic");
      expect(p.src).toMatch(/^\/images\/portrait-.+\.webp$/);
    }
  });
});
