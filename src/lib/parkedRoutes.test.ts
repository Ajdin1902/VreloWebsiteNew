import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

// Parked under Model C (HQ decision 2026-09-19): the broker-era pages /makler,
// /demo and /lead-check are off the site. Their code stays in the repo, but the
// URLs redirect to live pages so links already out in the world (outreach,
// result e-mails) never 404. Redirects run before the filesystem, so this also
// takes the /demo API routes (and their Anthropic spend) offline.
describe("parked broker-era routes", () => {
  it("redirect to live pages instead of rendering", async () => {
    const redirects = await nextConfig.redirects!();
    const bySource = new Map(redirects.map((r) => [r.source, r]));

    for (const [source, destination] of [
      ["/makler", "/leistungen"],
      ["/demo/:path*", "/leistungen"],
      ["/lead-check", "/prozess-check"],
    ] as const) {
      const r = bySource.get(source);
      expect(r, source).toBeDefined();
      expect(r!.destination).toBe(destination);
      // Temporary on purpose: parked, not deleted. A cached 308 would survive
      // an un-parking.
      expect(r!.permanent).toBe(false);
    }
  });
});
