import { describe, it, expect } from "vitest";
import { CHECK_SRC, CHECK_CTA, CHECK_TEASER, SAMPLE_ANSWERS, checkHref, questionCountPhrase } from "./prozessCheckCta";
import { normalizeSource } from "./source";
import { STEPS, resultCopy } from "./prozessCheck";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const copy = [...strings(CHECK_CTA), ...strings(CHECK_TEASER)];

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

  // Review Focus 1: the teaser promises „Sechs kurze Fragen“. If the quiz
  // gains or loses a step, this claim must be rewritten before shipping.
  it("promises exactly as many questions as the quiz has", () => {
    expect(CHECK_TEASER.steps[0].title).toBe("Sechs kurze Fragen");
    expect(STEPS).toHaveLength(6);
  });

  it("has three teaser steps, the last one carrying the build path", () => {
    expect(CHECK_TEASER.steps).toHaveLength(3);
    expect(CHECK_TEASER.steps[2].text).toContain("läuft von selbst");
  });
});

// Final review: the count claim appears on the homepage AND in the FAQ. Both
// derive it from STEPS.length, so a quiz change can never leave a stale number.
describe("questionCountPhrase", () => {
  it("spells the quiz length in German", () => {
    expect(questionCountPhrase(6)).toBe("sechs kurze Fragen");
    expect(questionCountPhrase(7)).toBe("sieben kurze Fragen");
    expect(questionCountPhrase(1)).toBe("eine kurze Frage");
  });

  it("feeds the teaser title from the real quiz length", () => {
    const phrase = questionCountPhrase(STEPS.length);
    expect(CHECK_TEASER.steps[0].title).toBe(phrase.charAt(0).toUpperCase() + phrase.slice(1));
  });
});

describe("SAMPLE_ANSWERS", () => {
  it("produce a nine-hour example led by Rechnungen", () => {
    const r = resultCopy(SAMPLE_ANSWERS);
    expect(r.fits).toBe(true);
    expect(r.headline).toBe("Rund 9 Stunden pro Woche");
    expect(r.topAreas.map((a) => a.id)).toEqual(["rechnungen", "anfragen", "daten"]);
  });
});
