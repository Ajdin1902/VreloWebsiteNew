// src/lib/legal/legal.test.ts
import { describe, it, expect } from "vitest";
import { impressum } from "./impressum";
import { datenschutz } from "./datenschutz";

describe("legal content", () => {
  it("impressum is live copy: real Anbieter, no Platzhalter, no Entwurf marker", () => {
    const headings = impressum.sections.map((s) => s.heading);
    expect(headings.join(" ")).toMatch(/Haftung für Links/i);
    const body = impressum.sections.map((s) => s.body).join("\n");
    expect(body).not.toContain("[Platzhalter");
    expect(impressum.intro).not.toMatch(/Entwurf/);
    expect(body).toContain("Dietrich-Bonhoeffer-Straße 2\n93055 Regensburg");
    expect(body).toContain("kontakt@vrelo-ki.de");
    // Steuernummer is deliberately not published (no § 5 DDG duty, misuse risk).
    expect(body).not.toMatch(/Steuernummer/);
  });

  it("impressum carries the USt-IdNr (§ 5 DDG, soweit vorhanden)", () => {
    const body = impressum.sections.map((s) => s.body).join("\n");
    expect(body).toContain("DE464014191");
  });

  it("impressum names the V.i.S.d.P. (Art. 50 Abs. 4b KI-VO exemption needs a named person)", () => {
    const v = impressum.sections.find((s) => /Verantwortlich für den Inhalt/i.test(s.heading));
    expect(v).toBeDefined();
    expect(v!.body).toMatch(/V.i.S.d.P./);
    expect(v!.body).toContain("Ajdin Dzafic");
  });

  it("impressum carries no Bildnachweis claiming no real persons", () => {
    // Removed 2026-10-01 by founder decision: generated landscapes need no
    // label, and /ueber-mich now shows real photos of the founder, so the old
    // „keine realen Personen“ line would be false.
    expect(impressum.sections.find((s) => /Bildnachweis/i.test(s.heading))).toBeUndefined();
    const all = impressum.sections.map((s) => s.body).join("\n");
    expect(all).not.toMatch(/keine realen Personen/);
  });

  it("impressum no longer links the EU ODR platform (shut down 2025-07-20) but keeps the § 36 VSBG line", () => {
    const all = impressum.sections.map((s) => `${s.heading}\n${s.body}`).join("\n");
    expect(all).not.toMatch(/ec\.europa\.eu\/consumers\/odr/);
    expect(all).toMatch(/nicht bereit, an Streitbeilegungsverfahren/);
  });

  it("datenschutz covers the contact form, Resend, Cal.com, rights, and the newsletter (no placeholder)", () => {
    const all = datenschutz.sections.map((s) => `${s.heading}\n${s.body}`).join("\n");
    expect(all).toMatch(/Verantwortlich/i);
    expect(all).toMatch(/Resend/);
    expect(all).toMatch(/Cal\.com/);
    expect(all).toMatch(/Betroffenenrechte|Rechte/i);
    expect(all).not.toContain("[Platzhalter");
    expect(datenschutz.intro).not.toMatch(/Entwurf/);
    expect(all).toMatch(/Newsletter/i);
  });

  it("datenschutz Newsletter section describes double opt-in, Resend and Widerruf (no placeholder)", () => {
    const nl = datenschutz.sections.find((s) => /Newsletter/i.test(s.heading));
    expect(nl).toBeDefined();
    expect(nl!.body).not.toContain("[Platzhalter");
    expect(nl!.body).toMatch(/Double-Opt-In|Bestätigung/i);
    expect(nl!.body).toMatch(/Resend/);
    expect(nl!.body).toMatch(/Widerruf|abbestellen|Abmeldelink/i);
  });
});

// Ajdin 2026-11-12: one line that the offer is B2B only.
describe("B2B line", () => {
  it("says in the Impressum that the offer is for businesses only", () => {
    const all = impressum.sections.map((s) => s.body).join(" ");
    expect(all).toContain("Mein Angebot richtet sich ausschließlich an Unternehmen, nicht an Verbraucher.");
    const anbieter = impressum.sections.find((s) => s.heading === "Anbieter")!;
    expect(anbieter.body).not.toContain("Verbraucher");
  });
});
