import { describe, it, expect } from "vitest";
import { CHECK_SRC, CHECK_CTA, VORLAGEN_CTA, checkHref, kontaktHref, vorlagenHref, withSrc, questionCountPhrase } from "./prozessCheckCta";
import { normalizeSource } from "./source";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const copy = strings(CHECK_CTA);

describe("CHECK_SRC", () => {
  it("uses slugs that survive normalizeSource unchanged", () => {
    for (const slug of Object.values(CHECK_SRC)) {
      expect(normalizeSource(slug), slug).toBe(slug);
    }
  });

  it("has no duplicate slugs and no retired home-steps slug", () => {
    const slugs: string[] = Object.values(CHECK_SRC);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).not.toContain("home-steps");
  });

  it("no longer carries a home teaser slug", () => {
    expect(Object.values(CHECK_SRC)).not.toContain("home-check");
  });

  it("builds the check href with the slug", () => {
    expect(checkHref(CHECK_SRC.homeHero)).toBe("/prozess-check?src=home-hero");
  });
});

describe("check copy", () => {
  it("uses German quotes, never ASCII double quotes", () => {
    expect(copy.filter((s) => s.includes('"'))).toEqual([]);
  });

  it("uses no dash at all (Gedankenstrich retired site-wide)", () => {
    expect(copy.filter((s) => s.includes("—") || s.includes("–"))).toEqual([]);
  });

  it("names no price anywhere", () => {
    expect(copy.filter((s) => /€|\bEUR\b|\d\s*(Euro|netto)\b|\b500\b/i.test(s))).toEqual([]);
  });

  it("never names the mechanism", () => {
    expect(copy.filter((s) => /\bn8n\b|claude/i.test(s))).toEqual([]);
  });
});

// The count claim appears in the FAQ, spelled from STEPS.length, so a quiz
// change can never leave a stale number.
describe("questionCountPhrase", () => {
  it("spells the quiz length in German", () => {
    expect(questionCountPhrase(6)).toBe("sechs kurze Fragen");
    expect(questionCountPhrase(7)).toBe("sieben kurze Fragen");
    expect(questionCountPhrase(1)).toBe("eine kurze Frage");
  });
});

describe("subpage attribution", () => {
  it("has one normalisable slug per Leistungen subpage", () => {
    const slugs = [
      CHECK_SRC.leistungProzessAudit,
      CHECK_SRC.leistungProzessautomatisierung,
      CHECK_SRC.leistungKiAutomatisierung,
      CHECK_SRC.leistungBetreuung,
    ];
    expect(new Set(slugs).size).toBe(4);
    // 2026-11-11: the folded pages lost their slugs.
    expect(Object.keys(CHECK_SRC)).not.toContain("leistungClaude");
    for (const s of slugs) expect(normalizeSource(s)).toBe(s);
  });

  it("builds the Erstgespräch link with the same src", () => {
    expect(kontaktHref(CHECK_SRC.leistungBetreuung)).toBe("/kontakt?src=leistung-betreuung");
  });
});

// Ajdin 2026-11-11: every primary CTA leads to /vorlagen (Vorlage, Gespräch, Fahrplan, all free).
describe("vorlagen front door", () => {
  it("builds the Vorlagen href with the slug", () => {
    expect(vorlagenHref(CHECK_SRC.homeHero)).toBe("/vorlagen?src=home-hero");
  });

  it("carries the approved CTA copy", () => {
    expect(VORLAGEN_CTA.label).toBe("Kostenlose Vorlagen ansehen");
    expect(VORLAGEN_CTA.short).toBe("Vorlagen");
    expect(VORLAGEN_CTA.microcopy).toBe("Bauplan für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos.");
    expect(VORLAGEN_CTA.closeMicrocopy).toBe("Vorlage, Gespräch und Fahrplan: alles kostenlos.");
  });

  it("passes a valid src on to internal links and nothing else", () => {
    expect(withSrc("/vorlagen/shk-bauplan", "home-hero")).toBe("/vorlagen/shk-bauplan?src=home-hero");
    expect(withSrc("/vorlagen/shk-bauplan", null)).toBe("/vorlagen/shk-bauplan");
    expect(withSrc("/vorlagen/shk-bauplan", undefined)).toBe("/vorlagen/shk-bauplan");
    expect(withSrc("/vorlagen/shk-bauplan", "<script>")).toBe("/vorlagen/shk-bauplan");
    expect(withSrc("/vorlagen/shk-bauplan", "x".repeat(40))).toBe("/vorlagen/shk-bauplan");
    expect(withSrc("/prozess-check?src=vorlagen", "home-weg")).toBe("/prozess-check?src=home-weg");
    expect(withSrc("/vorlagen/vrelo-ki-betriebssystem.pdf", "home-hero")).toBe("/vorlagen/vrelo-ki-betriebssystem.pdf");
    expect(withSrc("https://example.com/x", "home-hero")).toBe("https://example.com/x");
  });

  it("passes the copy guards", () => {
    for (const s of Object.values(VORLAGEN_CTA)) expect(findCopyIssues(s), s).toEqual([]);
  });
});
