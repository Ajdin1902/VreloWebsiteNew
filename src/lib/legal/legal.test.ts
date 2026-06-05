// src/lib/legal/legal.test.ts
import { describe, it, expect } from "vitest";
import { impressum } from "./impressum";
import { datenschutz } from "./datenschutz";

describe("legal content", () => {
  it("impressum has section headings and a Platzhalter for personal details", () => {
    const headings = impressum.sections.map((s) => s.heading);
    expect(headings.join(" ")).toMatch(/Haftung für Links/i);
    const body = impressum.sections.map((s) => s.body).join("\n");
    expect(body).toContain("[Platzhalter");
  });

  it("datenschutz covers the contact form, Resend, Cal.com, rights, and a newsletter placeholder", () => {
    const all = datenschutz.sections.map((s) => `${s.heading}\n${s.body}`).join("\n");
    expect(all).toMatch(/Verantwortlich/i);
    expect(all).toMatch(/Resend/);
    expect(all).toMatch(/Cal\.com/);
    expect(all).toMatch(/Betroffenenrechte|Rechte/i);
    expect(all).toContain("[Platzhalter");
    expect(all).toMatch(/Newsletter/i);
  });
});
