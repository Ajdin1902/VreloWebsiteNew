import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";
import { getLeistungPage } from "./leistungenPages";

// 2026-11-11: four KI pages folded into sections of KI-Automatisierung. Links
// already out (LinkedIn, mails, Ratgeber) land on their section, never a 404.
const want: Record<string, string> = {
  "/leistungen/ki-server": "/leistungen/ki-automatisierung#ki-server",
  "/leistungen/claude": "/leistungen/ki-automatisierung#claude",
  "/leistungen/ki-betriebssystem": "/leistungen/ki-automatisierung#ki-betriebssystem",
  "/leistungen/ki-schulung": "/leistungen/ki-automatisierung#ki-schulung",
  "/leistungen/ki-beratung": "/leistungen/prozess-audit",
};

describe("folded Leistungen pages", () => {
  it("redirect permanently to their section, once each", async () => {
    const redirects = await nextConfig.redirects!();
    for (const [source, destination] of Object.entries(want)) {
      const hits = redirects.filter((r) => r.source === source);
      expect(hits, source).toHaveLength(1);
      expect(hits[0].destination).toBe(destination);
      expect(hits[0].permanent).toBe(true);
    }
  });

  it("point only at anchors that exist on the KI page", () => {
    const ids = new Set(getLeistungPage("ki-automatisierung")!.abschnitte!.map((a) => a.id));
    for (const d of Object.values(want)) {
      const hash = d.split("#")[1];
      if (hash) expect(ids.has(hash as never), d).toBe(true);
    }
  });
});
