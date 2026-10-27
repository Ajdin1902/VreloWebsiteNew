import { describe, it, expect, afterEach } from "vitest";
import { bauplanCode, isBauplanCode } from "./bauplan";

const orig = process.env.BAUPLAN_CODE;
afterEach(() => {
  if (orig === undefined) delete process.env.BAUPLAN_CODE;
  else process.env.BAUPLAN_CODE = orig;
});

describe("bauplan code", () => {
  it("is undefined when unset or blank", () => {
    process.env.BAUPLAN_CODE = "  ";
    expect(bauplanCode()).toBeUndefined();
    expect(isBauplanCode("anything")).toBe(false);
  });
  it("matches only the exact configured slug", () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    expect(isBauplanCode("agentur-7k3m")).toBe(true);
    expect(isBauplanCode("agentur-7k3M")).toBe(false);
    expect(isBauplanCode("")).toBe(false);
  });
});
