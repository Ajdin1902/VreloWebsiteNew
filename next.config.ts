import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 locks the image optimizer to an allow-list of quality values.
    // 75 is the default used site-wide; 65 is the lighter setting for the
    // full-bleed PageHero heroes (the petrol scrim hides the difference, and it
    // cuts each optimized hero variant ~25-35%). See PageHero.tsx.
    qualities: [65, 75],
  },
  // Short printed URLs for the Lead Engine letter batches (HQ: Knowledge/marketing/
  // prozess-check-funnel.md §7). `vrelo-ki.de/brief` fits on paper and in a QR;
  // the redirect carries the batch as `?src=` so replies stay attributable.
  async redirects() {
    return [
      { source: "/brief", destination: "/prozess-check?src=brief", permanent: false },
      { source: "/brief/:segment", destination: "/prozess-check?src=brief-:segment", permanent: false },
      // Walk-in flyer (HQ: Knowledge/marketing/flyer/flyer-brief.md), same pattern.
      { source: "/flyer", destination: "/prozess-check?src=flyer", permanent: false },
      // Parked under Model C (2026-09-19): the broker-era pages are off the site.
      // The code stays in the repo; redirects run before the filesystem, so the
      // pages and the /demo API routes are unreachable while links already out
      // in the world land on a live page instead of a 404. Remove a line to un-park.
      { source: "/makler", destination: "/leistungen", permanent: false },
      { source: "/demo/:path*", destination: "/leistungen", permanent: false },
      { source: "/lead-check", destination: "/prozess-check", permanent: false },
    ];
  },
};

export default nextConfig;
