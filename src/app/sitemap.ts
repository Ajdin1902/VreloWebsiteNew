// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getAllArticles } from "@/lib/ratgeber";
import { leistungenPages } from "@/lib/leistungenPages";
import { KI_AGENTEN_PATH } from "@/lib/kiAgenten";
import { VORLAGEN_PATH, vorlageBauplaene } from "@/lib/vorlagen";
import { REGENSBURG_PATH } from "@/lib/regensburg";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/leistungen",
    ...leistungenPages.map((p) => `/leistungen/${p.slug}`),
    KI_AGENTEN_PATH,
    "/referenzen",
    REGENSBURG_PATH,
    "/prozess-check",
    "/claude-gehirn",
    "/ueber-mich",
    "/faq",
    "/ratgeber",
    VORLAGEN_PATH,
    ...Object.keys(vorlageBauplaene).map((slug) => `${VORLAGEN_PATH}/${slug}`),
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/newsletter",
    // No lastModified on static routes: a build date would tell Google everything changes on each deploy.
  ].map((p) => ({ url: `${siteUrl}${p}` }));
  // Always production semantics for the sitemap — drafts are never listed.
  const articles = getAllArticles({ includeDrafts: false }).map((a) => ({
    url: `${siteUrl}/ratgeber/${a.slug}`,
    lastModified: new Date(a.date),
  }));
  return [...staticRoutes, ...articles];
}
