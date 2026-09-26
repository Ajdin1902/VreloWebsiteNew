import { describe, it, expect } from "vitest";
import { navLinks, focusRoutes, isFocusRoute, focusChrome, bareRoutes, isBareRoute } from "./nav";

describe("focus routes", () => {
  it("treats the two outreach landing pages as focus routes", () => {
    expect(focusRoutes).toContain("/makler");
    expect(isFocusRoute("/makler")).toBe(true);
    // /lead-check joined after the 2026-08-08 Rams audit: 19 navigational exits
    // and a second, competing email capture around a six-question task.
    expect(focusRoutes).toContain("/lead-check");
    expect(isFocusRoute("/lead-check")).toBe(true);
  });

  it("never hides the chrome on a nav route", () => {
    for (const l of navLinks) {
      expect(isFocusRoute(l.href)).toBe(false);
    }
    expect(isFocusRoute("/")).toBe(false);
  });

  it("keeps full chrome on /demo", () => {
    // A sandbox people are meant to wander out of, unlike the landing pages.
    expect(isFocusRoute("/demo")).toBe(false);
  });

  it("gives every focus route a chrome config", () => {
    for (const route of focusRoutes) {
      expect(focusChrome[route]).toBeDefined();
    }
  });

  it("gives /lead-check no header CTA to compete with the quiz", () => {
    expect(focusChrome["/lead-check"].cta).toBeUndefined();
    expect(focusChrome["/makler"].cta?.href).toBe("#termin");
  });

  it("falls back to showing the chrome when the pathname is unknown", () => {
    expect(isFocusRoute(null)).toBe(false);
  });

  it("keeps /prozess-check logo-only: no header CTA pointing at itself", () => {
    expect(isFocusRoute("/prozess-check")).toBe(true);
    expect(focusChrome["/prozess-check"].cta).toBeUndefined();
    expect(navLinks.map((l) => l.href)).not.toContain("/prozess-check");
  });
});

describe("bare routes", () => {
  it("treats the business card and its QR page as bare (no chrome at all)", () => {
    expect(bareRoutes).toContain("/karte");
    expect(bareRoutes).toContain("/karte/qr");
    expect(isBareRoute("/karte")).toBe(true);
    expect(isBareRoute("/karte/qr")).toBe(true);
  });

  it("keeps chrome on normal routes and falls back safely on null", () => {
    expect(isBareRoute("/")).toBe(false);
    expect(isBareRoute("/makler")).toBe(false);
    expect(isBareRoute(null)).toBe(false);
  });
});
