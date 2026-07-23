// src/app/sitemap.test.ts
import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { siteUrl } from "@/lib/site";
import { getAllArticles } from "@/lib/ratgeber";

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

  it("lists every published article and never a draft", () => {
    const urls = sitemap().map((e) => e.url);
    const published = getAllArticles({ includeDrafts: false });
    const draftSlugs = getAllArticles({ includeDrafts: true })
      .filter((a) => !published.some((p) => p.slug === a.slug))
      .map((a) => a.slug);

    // Published articles appear with their canonical /ratgeber/<slug> URL.
    for (const a of published) {
      expect(urls).toContain(`${siteUrl}/ratgeber/${a.slug}`);
    }
    // Drafts (if any) are always excluded — the sitemap uses production semantics.
    for (const slug of draftSlugs) {
      expect(urls).not.toContain(`${siteUrl}/ratgeber/${slug}`);
    }
  });

  it("excludes the direct-link outreach pages", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).not.toContain(`${siteUrl}/makler`);
    expect(urls).not.toContain(`${siteUrl}/lead-check`);
    expect(urls).not.toContain(`${siteUrl}/demo`);
  });
});
