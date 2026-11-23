import { describe, expect, it } from "vitest";
import { findForbidden, polish } from "./sanitize";

const p = (x: string, max = 500) => polish(x, max);

const PROBES: string[] = [
  "Lexoffice kostet ab 9,90 € im Monat – das lohnt sich.",
  "Mit „Outlook“-Regeln, und Filtern",
  "Mit \"Outlook\"-Regeln, und Filtern",
  "siehe https://x.de/a?utm=1)",
  "(siehe https://x.de/a?utm=1)",
  "Das ist ein Game-Changer!",
  "Preis: 12 EUR",
  "ca. 20 % schneller",
  "E-Mail-Postfach",
  "Outlook-Regeln und E-Mail-Vorlagen",
  "Mo.–Fr. erreichbar",
  "z. B. Rechnungen",
  "Lexoffice (ab 9,90 €/Monat) hat eine API.",
  "Der Tarif kostet 7,90 Euro pro Monat.",
  "Microsoft 365 Business",
  "Version 2.30.5 von n8n",
  "Lexware Office (früher lexoffice) hat eine REST-API.",
  "Die Funktion heißt „Regeln“ – sie sortiert Mails.",
  "Er sagt: \"Das geht\", und fertig.",
  "Outlook.com und Gmail",
  "50 € Rabatt, aber 5 Euro-Cent",
  "kostenlos bis 100 Belege/Monat",
  "Du sparst 30 % Zeit",
  "Termine 9 - 17 Uhr",
  "Das Rechnungs-Tool—ein Klassiker—kann das",
  "Beträge in EURO",
  "€19",
  "19€",
  "1 000 €",
  "USD 29 per month, $29, 29 Dollar",
  "Teams.Chat bleibt",
  "Nutze calendly.com nicht",
  "Telefon 0941 1234567 an",
  "Ein revolutionärer Ansatz",
  "Excel-Listen; \"Ablage\"; Ordner",
  "Rechnungen, Angebote, und Mahnungen",
  "Mit Lexoffice-Belegen geht das",
  "Gmail-Filter - kostenlos",
  "über 1.000 Nutzer",
  "Tarif „M“ für 1.299,00 €",
  "Tarif ab EUR 29 im Monat",
  "kostet 9,90\u00a0€ im Monat",
  "kostet 1\u00a0000 € im Jahr",
  "kostet 1\u202f000\u00a0€ im Jahr",
  "kostet 29 $ im Monat",
  "kostet CHF 20 im Monat",
  "(siehe lexoffice.de)",
  "Mit monday.com lässt sich das planen",
  "Die „Regel greift",
  "Der Plus-Tarif (12 Euro) reicht",
  "Zapier kostet 19,99 USD",
  "Mails, „und Termine",
  "Mails, “und Termine",
  "Lexoffice—, und mehr",
  "Mails, —und Termine",
  "Mails \u2012 Termine \u2015 Ablage",
  "Rechnungen;, und Belege: , fertig",
  "Ein \"x, und y",
  "Mo. – Fr., 1.–3. Dezember",
];

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
    expect(findForbidden("Siehe monday.com/preise", { allowNames })).toContain("domain");
  });
  it("finds banned words, whole word with endings", () => {
    expect(findForbidden("Das ist ein Game-Changer!")).toContain("banned");
    expect(findForbidden("Damit kannst du skalieren")).toContain("banned");
    expect(findForbidden("Ein revolutionärer Ansatz")).toContain("banned");
    expect(findForbidden("KI-Magie pur")).toContain("banned");
    expect(findForbidden("Das skaliert")).toContain("banned");
    expect(findForbidden("Ein Gamechanger")).toContain("banned");
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
  it("never outputs a comma before und, double marks, dashes or ASCII quotes (probe property)", () => {
    for (const x of PROBES) {
      for (const max of [500, 20]) {
        const out = p(x, max);
        expect(out, x).not.toMatch(/,\s*und\b|[,:;]\s*[,:;]|[\u2012-\u2015"]/);
        expect(out.length, x).toBeLessThanOrEqual(max);
      }
    }
  });
  it("turns spaced range dashes into bis, maps U+2012 and U+2015", () => {
    expect(p("Mo. \u2013 Fr. erreichbar")).toBe("Mo. bis Fr. erreichbar");
    expect(p("1.\u20133. Dezember")).toBe("1. bis 3. Dezember");
    expect(p("1. \u2013 3. Dezember")).toBe("1. bis 3. Dezember");
    expect(p("9 \u2013 17 Uhr")).toBe("9 bis 17 Uhr");
    expect(p("9\u201217 Uhr")).toBe("9 bis 17 Uhr");
    expect(p("Outlook \u2015 das kennst du")).toBe("Outlook, das kennst du");
    expect(p("Die Mails gehen raus. \u2013 Danach Ruhe.")).toBe("Die Mails gehen raus. Danach Ruhe.");
  });
  it("collapses double marks and the comma before und as the last step", () => {
    expect(p("Mails, \u201eund Termine")).toBe("Mails und Termine");
    expect(p("Lexoffice\u2014, und mehr")).toBe("Lexoffice und mehr");
    expect(p("Rechnungen;, fertig")).toBe("Rechnungen; fertig");
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
