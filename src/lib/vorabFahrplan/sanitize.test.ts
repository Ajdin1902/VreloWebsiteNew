import { describe, expect, it } from "vitest";
import { findForbidden, polish } from "./sanitize";

const p = (x: string, max = 500) => polish(x, max);

describe("findForbidden", () => {
  it("finds prices in every currency and number format", () => {
    for (const x of [
      "Tarif ab EUR 29 im Monat",
      "kostet 29 $",
      "19,99 USD",
      "CHF 20",
      "1 000 €",
      "1\u00a0000 €",
      "1\u202f000 €",
      "1.000 €",
      "1.299,00 Euro",
      "ab 9,90 €/Monat",
      "€19",
      "19€",
      "7,90 Euro pro Monat",
      "12 Euros",
      "29 US-Dollar",
      "USD 29",
      "5 Euro-Cent",
      "Der Plus-Tarif (12 eur) reicht",
    ]) {
      expect(findForbidden(x), x).toContain("price");
    }
  });
  it("allows kostenlos, gratis and plain numbers", () => {
    for (const x of ["kostenlos bis 100 Belege im Monat", "gratis testen", "über 1.000 Nutzer", "Version 2.30.5 von n8n", "Microsoft 365 Business", "Beträge in EURO"]) {
      expect(findForbidden(x), x).toEqual([]);
    }
  });
  it("finds percent claims", () => {
    expect(findForbidden("30 % schneller")).toContain("percent");
    expect(findForbidden("Du sparst 30% Zeit")).toContain("percent");
    expect(findForbidden("20 Prozent weniger")).toContain("percent");
  });
  it("finds links, domains, mails and phones", () => {
    expect(findForbidden("siehe https://x.de/a")).toContain("url");
    expect(findForbidden("siehe www.x.de")).toContain("url");
    expect(findForbidden("(siehe lexoffice.de)")).toContain("domain");
    expect(findForbidden("Outlook.com und Gmail")).toContain("domain");
    expect(findForbidden("geht über foo.xyz")).toContain("domain");
    expect(findForbidden("schreib an info@agentur.de")).toContain("domain");
    expect(findForbidden("Telefon 0941 1234567 an")).toContain("contact");
  });
  it("keeps German words after a period and abbreviations", () => {
    for (const x of ["ggf.später", "z.B. Co.KG", "Teams.Chat bleibt", "Mo.–Fr. erreichbar"]) expect(findForbidden(x), x).toEqual([]);
  });
  it("lets the visitor's program names pass the domain check", () => {
    const allowNames = ["monday.com", "Outlook"];
    expect(findForbidden("Mit monday.com lässt sich das planen", { allowNames })).toEqual([]);
    expect(findForbidden("Mit Monday.com lässt sich das planen", { allowNames })).toEqual([]);
    expect(findForbidden("Mit monday.com lässt sich das planen")).toContain("domain");
    expect(findForbidden("Mit evil-monday.com geht das", { allowNames })).toContain("domain");
    expect(findForbidden("Mit monday.com.evil.de geht das", { allowNames })).toContain("domain");
  });
  it("finds banned words, whole word with endings", () => {
    expect(findForbidden("Das ist ein Game-Changer!")).toContain("banned");
    expect(findForbidden("Damit kannst du skalieren")).toContain("banned");
    expect(findForbidden("Ein revolutionärer Ansatz")).toContain("banned");
    expect(findForbidden("KI-Magie pur")).toContain("banned");
    expect(findForbidden("Skalierung bleibt")).toEqual([]);
  });
});

describe("polish", () => {
  it("turns dashes into bis for ranges, else into a comma", () => {
    expect(p("Mo.–Fr. erreichbar")).toBe("Mo. bis Fr. erreichbar");
    expect(p("9–17 Uhr")).toBe("9 bis 17 Uhr");
    expect(p("Termine 9 - 17 Uhr")).toBe("Termine 9 bis 17 Uhr");
    expect(p("Outlook — das kennst du")).toBe("Outlook, das kennst du");
    expect(p("Outlook – das kennst du")).toBe("Outlook, das kennst du");
    expect(p("Lexoffice - das Programm")).toBe("Lexoffice, das Programm");
    expect(p("Das Rechnungs-Tool—ein Klassiker—kann das")).toBe("Das Rechnungs-Tool, ein Klassiker, kann das");
    expect(p("E-Mail-Postfach und Outlook-Regeln")).toBe("E-Mail-Postfach und Outlook-Regeln");
  });
  it("converts quote pairs and removes lone ones", () => {
    expect(p('Die Regel "Anfrage" greift')).toBe("Die Regel „Anfrage“ greift");
    expect(p('„halb" korrekt')).toBe("„halb“ korrekt");
    expect(p("“englisch” zitiert")).toBe("„englisch“ zitiert");
    expect(p('Ein " allein')).toBe("Ein allein");
    expect(p("Die „Regel greift")).toBe("Die Regel greift");
    expect(p("„schon richtig“ bleibt")).toBe("„schon richtig“ bleibt");
  });
  it("removes the comma before und", () => {
    expect(p("Mails, und Termine")).toBe("Mails und Termine");
    expect(p('Er sagt: "Das geht", und fertig.')).toBe("Er sagt: „Das geht“ und fertig.");
  });
  it("never removes words", () => {
    expect(p("ggf.später kommt Lexoffice (Plus) dran")).toBe("ggf.später kommt Lexoffice (Plus) dran");
  });
  it("collapses whitespace and cuts at a word boundary without an open quote", () => {
    expect(p("  a   b \n c ")).toBe("a b c");
    expect(p("Eins zwei drei vier", 12)).toBe("Eins zwei");
    expect(p("Eins zwei, drei", 10)).toBe("Eins zwei");
    expect(p("Abcdefghijkl", 5)).toBe("Abcde");
    expect(p("Die Regel „Anfrage neu“", 18)).toBe("Die Regel Anfrage");
  });
});
