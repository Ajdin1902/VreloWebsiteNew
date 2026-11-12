import { describe, it, expect } from "vitest";
import { signaturHtml, signaturText } from "./signatur";
import { linkedinProfileUrl, siteUrl } from "@/lib/site";

// Ajdin 2026-11-12: his signature, as he gave it, at the end of every lead mail.
describe("e-mail signature", () => {
  it("has the six lines in the agreed order as plain text", () => {
    expect(signaturText()).toEqual([
      "Ajdin Dzafic",
      "Gründer · Vrelo",
      "Durchdachte Automatisierung für Betriebe und Unternehmen.",
      "+49 176 4380 6085  ·  ajdin@vrelo-ki.de",
      `vrelo-ki.de  ·  LinkedIn: ${linkedinProfileUrl}`,
      "Dietrich-Bonhoeffer-Straße 2 · 93055 Regensburg",
    ]);
  });

  it("links phone, mail, site and the founder's LinkedIn profile in html", () => {
    const html = signaturHtml();
    expect(html).toContain('href="tel:+4917643806085"');
    expect(html).toContain('href="mailto:ajdin@vrelo-ki.de"');
    expect(html).toContain(`href="${siteUrl}"`);
    expect(html).toContain(`href="${linkedinProfileUrl}"`);
    expect(html).not.toContain("linkedin.com/company");
    expect(html).toContain("Ajdin Dzafic");
    expect(html).toContain("Dietrich-Bonhoeffer-Straße 2 · 93055 Regensburg");
    expect(html).toMatch(/<em style="[^"]*italic[^"]*">Vrelo<\/em>/);
  });
});
