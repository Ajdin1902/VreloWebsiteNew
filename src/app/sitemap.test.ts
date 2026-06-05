// src/app/sitemap.test.ts
import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { siteUrl } from "@/lib/site";

describe("sitemap", () => {
  it("includes the core live routes and excludes unbuilt ones", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteUrl}`);
    expect(urls).toContain(`${siteUrl}/leistungen`);
    expect(urls).toContain(`${siteUrl}/ueber-mich`);
    expect(urls).toContain(`${siteUrl}/faq`);
    expect(urls).toContain(`${siteUrl}/ratgeber`);
    expect(urls).not.toContain(`${siteUrl}/kontakt`);
    expect(urls).not.toContain(`${siteUrl}/impressum`);
  });

  it("never lists draft articles", () => {
    // all seed articles are drafts → no /ratgeber/<slug> entries
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.startsWith(`${siteUrl}/ratgeber/`))).toBe(false);
  });
});
