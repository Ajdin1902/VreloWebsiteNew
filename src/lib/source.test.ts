import { describe, it, expect } from "vitest";
import { normalizeSource, sourceLabel } from "./source";

describe("normalizeSource", () => {
  it("accepts the letter-batch slugs and lowercases them", () => {
    expect(normalizeSource("brief-handwerk")).toBe("brief-handwerk");
    expect(normalizeSource("Brief-Handwerk")).toBe("brief-handwerk");
    expect(normalizeSource("brief")).toBe("brief");
    expect(normalizeSource("brief-praxen-2")).toBe("brief-praxen-2");
  });
  it("drops anything that is not a short slug", () => {
    expect(normalizeSource("")).toBeUndefined();
    expect(normalizeSource("x")).toBeUndefined();
    expect(normalizeSource("<script>alert(1)</script>")).toBeUndefined();
    expect(normalizeSource("brief handwerk")).toBeUndefined();
    expect(normalizeSource("a".repeat(40))).toBeUndefined();
    expect(normalizeSource(["brief"])).toBeUndefined();
    expect(normalizeSource(undefined)).toBeUndefined();
    expect(normalizeSource(null)).toBeUndefined();
  });
});

describe("sourceLabel", () => {
  it("falls back to Website when there is no source", () => {
    expect(sourceLabel(undefined)).toBe("Website");
    expect(sourceLabel("brief-handwerk")).toBe("brief-handwerk");
  });
});
