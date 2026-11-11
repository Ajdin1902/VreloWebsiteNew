import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { KI_AGENTEN, KI_AGENTEN_PATH } from "./kiAgenten";
import { findCopyIssues } from "./ratgeberCopy";

// Copy approved by Ajdin 2026-11-11 (docs/superpowers/specs/2026-11-11-abteilungs-agenten-copy.md).
describe("KI-Agenten page copy", () => {
  it("lives under /leistungen/ki-agenten with its own hero image", () => {
    expect(KI_AGENTEN_PATH).toBe("/leistungen/ki-agenten");
    expect(existsSync(join(process.cwd(), "public", KI_AGENTEN.heroImage))).toBe(true);
    expect(KI_AGENTEN.line.length).toBeLessThanOrEqual(90);
  });

  it("shows the six agents in the agreed order, the Inhaber-Assistent last as the top floor", () => {
    expect(KI_AGENTEN.agenten.map((a) => a.name)).toEqual([
      "Marketing-Agent",
      "Vertriebs-Agent",
      "Kundenservice-Agent",
      "Projektdoku-Agent",
      "Buchhaltungs-Agent",
      "Inhaber-Assistent",
    ]);
    expect(KI_AGENTEN.agenten.filter((a) => a.oberste).map((a) => a.id)).toEqual(["inhaber"]);
    for (const a of KI_AGENTEN.agenten) {
      expect(a.aufgaben.length, a.id).toBeGreaterThanOrEqual(2);
      expect(a.aufgaben.length, a.id).toBeLessThanOrEqual(4);
      expect(a.ergebnis.trim(), a.id).not.toBe("");
    }
  });

  it("carries the approved copy word for word", () => {
    const by = (id: string) => KI_AGENTEN.agenten.find((a) => a.id === id)!;
    expect(by("kundenservice").aufgaben[2]).toBe("Beantwortet Fragen wie „Wann kommt ihr?“ sofort");
    expect(by("inhaber").aufgaben[0]).toBe("Beantwortet Sprachnachrichten wie „Welche Rechnungen sind offen?“");
    expect(by("vertrieb").ergebnis).toBe("Alles über einen Kunden steht in deinem CRM, bevor du zum Hörer greifst.");
    expect(KI_AGENTEN.cta.heading).toBe("Welcher Agent nimmt dir am meisten ab?");
    expect(KI_AGENTEN.cta.lead).toBe("In 30 Minuten zeige ich dir, wie das in deinem Betrieb aussieht.");
  });

  // Ajdin 2026-11-11: no absolute promise on invoices.
  it("words the Buchhaltung result without promising zero errors", () => {
    const b = KI_AGENTEN.agenten.find((a) => a.id === "buchhaltung")!;
    expect(b.ergebnis).toBe("Kein Abtippen und Rumkopieren mehr bei Rechnungen. Das Geld kommt früher.");
    expect(JSON.stringify(KI_AGENTEN)).not.toMatch(/Keine Fehler/);
  });

  // Only built cases name a client; built, not necessarily live (Velp go-live waits on Alen).
  it("names a client only where I built that agent, Marketing none", () => {
    expect(Object.fromEntries(KI_AGENTEN.agenten.map((a) => [a.id, a.gebautFuer ?? null]))).toEqual({
      marketing: null,
      vertrieb: "Velp",
      kundenservice: "Velp",
      projektdoku: "Velp",
      buchhaltung: "MDZ Hausmeisterservice",
      inhaber: "MDZ Hausmeisterservice",
    });
    expect(JSON.stringify(KI_AGENTEN)).not.toMatch(/Läuft schon/);
  });

  it("books the call with its own src and names no price", () => {
    expect(KI_AGENTEN.cta.src).toBe("agenten");
    expect(JSON.stringify(KI_AGENTEN)).not.toMatch(/€|Euro|\d+\s?EUR/);
  });

  it("passes the site's German copy guards", () => {
    const strings = [
      KI_AGENTEN.title,
      KI_AGENTEN.line,
      KI_AGENTEN.metaDescription,
      KI_AGENTEN.heading,
      KI_AGENTEN.gebautPrefix,
      KI_AGENTEN.cta.heading,
      KI_AGENTEN.cta.lead,
      ...KI_AGENTEN.agenten.flatMap((a) => [a.name, a.ergebnis, ...a.aufgaben]),
    ];
    for (const s of strings) expect(findCopyIssues(s), s).toEqual([]);
  });
});
