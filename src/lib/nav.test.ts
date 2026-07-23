import { describe, it, expect } from "vitest";
import { navLinks, focusRoutes, isFocusRoute } from "./nav";

describe("focus routes", () => {
  it("treats /makler as a focus route", () => {
    expect(focusRoutes).toContain("/makler");
    expect(isFocusRoute("/makler")).toBe(true);
  });

  it("never hides the chrome on a nav route", () => {
    for (const l of navLinks) {
      expect(isFocusRoute(l.href)).toBe(false);
    }
    expect(isFocusRoute("/")).toBe(false);
  });

  it("keeps full chrome on the other noindex pages", () => {
    // /lead-check and /demo deliberately keep the site header and footer.
    expect(isFocusRoute("/lead-check")).toBe(false);
    expect(isFocusRoute("/demo")).toBe(false);
  });

  it("falls back to showing the chrome when the pathname is unknown", () => {
    expect(isFocusRoute(null)).toBe(false);
  });
});
