// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getAllArticles } from "@/lib/ratgeber";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/leistungen", "/ueber-mich", "/faq", "/ratgeber"].map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
  }));
  // Always production semantics for the sitemap — drafts are never listed.
  const articles = getAllArticles({ includeDrafts: false }).map((a) => ({
    url: `${siteUrl}/ratgeber/${a.slug}`,
    lastModified: new Date(a.date),
  }));
  return [...staticRoutes, ...articles];
}
