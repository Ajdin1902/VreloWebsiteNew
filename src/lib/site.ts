// Single source for the public base URL. Set NEXT_PUBLIC_SITE_URL in Vercel
// (e.g. "https://vrelo-ki.de") to switch the production base; unset falls back
// to the Vercel deployment URL. NEXT_PUBLIC_* is inlined at build, so canonicals,
// OG, sitemap and robots all follow automatically.
const FALLBACK_BASE = "https://vrelo-website.vercel.app";

export function normalizeBase(value: string | undefined): string {
  // `||` (not `??`) so a set-but-empty env var ("") also falls back, rather
  // than producing siteUrl = "" and breaking every canonical.
  return (value || FALLBACK_BASE).replace(/\/+$/, "");
}

export const siteUrl = normalizeBase(process.env.NEXT_PUBLIC_SITE_URL);
export const siteName = "Vrelo";

export function canonical(path: string): string {
  return `${siteUrl}${path}`;
}
