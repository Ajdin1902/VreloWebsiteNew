import { describe, it, expect, afterEach } from "vitest";
import { bauplanCode, bauplanVariant, isBauplanCode } from "./bauplan";

const orig = process.env.BAUPLAN_CODE;
const origElektro = process.env.BAUPLAN_CODE_ELEKTRO;
afterEach(() => {
  if (orig === undefined) delete process.env.BAUPLAN_CODE;
  else process.env.BAUPLAN_CODE = orig;
  if (origElektro === undefined) delete process.env.BAUPLAN_CODE_ELEKTRO;
  else process.env.BAUPLAN_CODE_ELEKTRO = origElektro;
});

describe("bauplan code", () => {
  it("is undefined when unset or blank", () => {
    process.env.BAUPLAN_CODE = "  ";
    delete process.env.BAUPLAN_CODE_ELEKTRO;
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

describe("bauplanVariant", () => {
  it("maps each configured code to its variant", () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    process.env.BAUPLAN_CODE_ELEKTRO = "elektro-quelle-2026";
    expect(bauplanVariant("agentur-7k3m")).toBe("agentur");
    expect(bauplanVariant("elektro-quelle-2026")).toBe("elektro");
    expect(bauplanVariant("other")).toBeUndefined();
  });
  it("works with only the Elektro code set", () => {
    delete process.env.BAUPLAN_CODE;
    process.env.BAUPLAN_CODE_ELEKTRO = "elektro-quelle-2026";
    expect(bauplanVariant("elektro-quelle-2026")).toBe("elektro");
    expect(bauplanVariant("")).toBeUndefined();
  });
  it("trims env values", () => {
    process.env.BAUPLAN_CODE_ELEKTRO = "  elektro-quelle-2026 ";
    expect(bauplanVariant("elektro-quelle-2026")).toBe("elektro");
  });
  it("lets Agentur win when both env vars hold the same code", () => {
    process.env.BAUPLAN_CODE = "same";
    process.env.BAUPLAN_CODE_ELEKTRO = "same";
    expect(bauplanVariant("same")).toBe("agentur");
  });
  it("keeps isBauplanCode true for either variant", () => {
    process.env.BAUPLAN_CODE = "a1";
    process.env.BAUPLAN_CODE_ELEKTRO = "e1";
    expect(isBauplanCode("a1") && isBauplanCode("e1")).toBe(true);
  });
});
