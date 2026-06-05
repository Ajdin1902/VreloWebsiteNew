import { describe, it, expect } from "vitest";
import { siteUrl, siteName } from "./site";

describe("site constants", () => {
  it("exposes an https base URL with no trailing slash", () => {
    expect(siteUrl).toMatch(/^https:\/\//);
    expect(siteUrl.endsWith("/")).toBe(false);
  });

  it("names the site Vrelo", () => {
    expect(siteName).toBe("Vrelo");
  });
});
