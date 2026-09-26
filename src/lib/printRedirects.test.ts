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

// Referral partners get vrelo-ki.de/empfehlung/<name>; the booking notes then
// show who sent the lead (Tippgeber proof). Review Focus 2: a name that fails
// normalizeSource still loads the check, but attribution silently falls back
// to „Website“. Naming rule: lowercase a–z/0–9, at most two hyphens inside the
// name, at most 24 characters.
describe("partner referral links", () => {
  it("redirect /empfehlung/:partner to the check with a partner- slug", async () => {
    const redirects = await nextConfig.redirects!();
    const r = redirects.find((x) => x.source === "/empfehlung/:partner");
    expect(r).toBeDefined();
    expect(r!.destination).toBe("/prozess-check?src=partner-:partner");
    expect(r!.permanent).toBe(false);
  });

  it("keeps names inside the naming rule attributable", () => {
    expect(normalizeSource("partner-velp")).toBe("partner-velp");
    expect(normalizeSource("partner-muster-agentur")).toBe("partner-muster-agentur");
    expect(normalizeSource("partner-Velp")).toBe("partner-velp");
  });

  it("drops names outside the rule (documented, not silent)", () => {
    expect(normalizeSource("partner-a-b-c-d")).toBeUndefined();
    expect(normalizeSource("partner-müller")).toBeUndefined();
    expect(normalizeSource("partner-" + "a".repeat(25))).toBeUndefined();
  });
});
