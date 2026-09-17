import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";
import { normalizeSource } from "./source";

// The short URLs below are printed on paper (letters, flyers) and encoded in
// QR codes. Once printed they can never change, so they are pinned here.
describe("printed short URLs", () => {
  it("redirect to the Prozess-Check with an allow-listed src slug", async () => {
    const redirects = await nextConfig.redirects!();
    const bySource = new Map(redirects.map((r) => [r.source, r]));

    for (const [source, slug] of [
      ["/brief", "brief"],
      ["/flyer", "flyer"],
    ] as const) {
      const r = bySource.get(source);
      expect(r, source).toBeDefined();
      expect(r!.destination).toBe(`/prozess-check?src=${slug}`);
      // Temporary on purpose: a cached 308 would pin the target forever.
      expect(r!.permanent).toBe(false);
      expect(normalizeSource(slug)).toBe(slug);
    }
  });
});
