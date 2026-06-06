import { describe, it, expect } from "vitest";
import { siteUrl, siteName, canonical, normalizeBase } from "./site";

describe("site constants", () => {
  it("exposes an https base URL with no trailing slash", () => {
    expect(siteUrl).toMatch(/^https:\/\//);
    expect(siteUrl.endsWith("/")).toBe(false);
  });

  it("names the site Vrelo", () => {
    expect(siteName).toBe("Vrelo");
  });
});

describe("normalizeBase", () => {
  it("falls back to the Vercel URL when unset", () => {
    expect(normalizeBase(undefined)).toBe("https://vrelo-website.vercel.app");
  });
  it("uses a provided value", () => {
    expect(normalizeBase("https://vrelo-ki.de")).toBe("https://vrelo-ki.de");
  });
  it("strips trailing slashes", () => {
    expect(normalizeBase("https://vrelo-ki.de/")).toBe("https://vrelo-ki.de");
    expect(normalizeBase("https://vrelo-ki.de///")).toBe("https://vrelo-ki.de");
  });
});

describe("canonical", () => {
  it("builds an absolute URL from a path", () => {
    expect(canonical("/faq")).toBe(`${siteUrl}/faq`);
  });
  it("returns the bare origin for the homepage", () => {
    expect(canonical("")).toBe(siteUrl);
  });
});
