// src/app/sitemap.test.ts
import { describe, it, expect, vi } from "vitest";
import sitemap from "./sitemap";
import { siteUrl } from "@/lib/site";

// Isolate from the real content dir: seed articles currently lack cover/coverAlt
// (added in Task 4). getAllArticles is the filesystem boundary — mock it here.
vi.mock("@/lib/ratgeber", () => ({
  getAllArticles: vi.fn(() => []),
}));

describe("sitemap", () => {
  it("includes the core live routes and excludes unbuilt ones", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}`);
    expect(urls).toContain(`${siteUrl}/leistungen`);
    expect(urls).toContain(`${siteUrl}/ueber-mich`);
    expect(urls).toContain(`${siteUrl}/faq`);
    expect(urls).toContain(`${siteUrl}/ratgeber`);
  });

  it("includes the new Kontakt + legal routes", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}/kontakt`);
    expect(urls).toContain(`${siteUrl}/impressum`);
    expect(urls).toContain(`${siteUrl}/datenschutz`);
  });

  it("includes /newsletter but not the transactional confirm route", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}/newsletter`);
    expect(urls).not.toContain(`${siteUrl}/newsletter/bestaetigt`);
  });

  it("never lists draft articles", () => {
    // getAllArticles is mocked to return [] → no /ratgeber/<slug> entries
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.startsWith(`${siteUrl}/ratgeber/`))).toBe(false);
  });
});
