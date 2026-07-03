import { describe, it, expect } from "vitest";
import { sanitizeSeed, MAX_BUSINESS_LEN, type DemoSeed } from "./seed";

describe("sanitizeSeed", () => {
  it("passes through valid input", () => {
    const seed = sanitizeSeed({
      business: "Baufinanzierung für junge Familien",
      appointmentType: "baufinanzierung",
      tone: "locker",
      sourceUrl: "https://example.de",
    });
    expect(seed.business).toBe("Baufinanzierung für junge Familien");
    expect(seed.appointmentType).toBe("baufinanzierung");
    expect(seed.tone).toBe("locker");
  });

  it("falls back to enum defaults on unknown values", () => {
    const seed = sanitizeSeed({ business: "x", appointmentType: "hack", tone: "SHOUT" });
    expect(seed.appointmentType).toBe("frei");
    expect(seed.tone).toBe("foermlich");
  });

  it("trims and length-caps business, strips control chars", () => {
    const long = "a".repeat(MAX_BUSINESS_LEN + 50);
    const seed = sanitizeSeed({ business: `  ${long}\x00\x07  `, appointmentType: "frei", tone: "locker" });
    expect(seed.business.length).toBe(MAX_BUSINESS_LEN);
    expect(seed.business).not.toMatch(/[\x00-\x1F]/);
  });

  it("drops a non-string / non-http sourceUrl", () => {
    const seed = sanitizeSeed({ business: "x", appointmentType: "frei", tone: "locker", sourceUrl: "javascript:alert(1)" });
    expect(seed.sourceUrl).toBeUndefined();
  });

  it("coerces missing fields to safe empties", () => {
    const seed = sanitizeSeed({} as Partial<DemoSeed>);
    expect(seed.business).toBe("");
    expect(seed.appointmentType).toBe("frei");
    expect(seed.tone).toBe("foermlich");
  });
});
