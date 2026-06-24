import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 locks the image optimizer to an allow-list of quality values.
    // 75 is the default used site-wide; 65 is the lighter setting for the
    // full-bleed PageHero heroes (the petrol scrim hides the difference, and it
    // cuts each optimized hero variant ~25-35%). See PageHero.tsx.
    qualities: [65, 75],
  },
};

export default nextConfig;
