// src/lib/elektroBauplanPage.test.ts
import { describe, it, expect } from "vitest";
import { elektroBauplanPage } from "./elektroBauplanPage";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

// The offer section (Ajdin 2026-10-30) is the one place that sells, books and names the
// Hausmeisterservice; every other string stays a free guideline. The offer has its own guards.
const { angebot, ...guide } = elektroBauplanPage;
const all = strings(guide);
const offer = strings(angebot);
const hits = (re: RegExp) => all.filter((s) => re.test(s));
const offerHits = (re: RegExp) => offer.filter((s) => re.test(s));

describe("Elektro /bauplan copy", () => {
  it("follows the house typography in every string", () => {
    expect([...all, ...offer].flatMap((s) => findCopyIssues(s).map((i) => `${i.kind}: ${s}`))).toEqual([]);
  });
  it("names no price and no duration", () => {
    expect(hits(/€|\bEuro\b|\bnetto\b|\bWochen\b|\bTagen?\b|\bMonate?n?\b/)).toEqual([]);
  });
  it("reads as a free guideline, not as an offer", () => {
    expect(hits(/[Mm]it mir|ohne mich|binde ich|richte ich|baue ich|wir zusammen/)).toEqual([]);
  });
  it("names no client and keeps the mail-only lines off the page", () => {
    expect(hits(/Power-Connect|Öksüz|\bMDZ\b|Velp|\bAlen\b|Bergisch|Hausmeister|BMW/)).toEqual([]);
  });
  it("asks for nothing but the PDF", () => {
    expect(hits(/Prozess-Check|buchen|Termin|Erstgespräch/)).toEqual([]);
  });
  it("labels the statistic and answers the objections", () => {
    expect(elektroBauplanPage.schmerz.satz).toContain("der befragten Handwerksbetriebe");
    expect(elektroBauplanPage.pdf.intro).toContain("Kostenlos");
    expect(elektroBauplanPage.pdf.form.hinweis).toContain("nur diese eine Mail");
  });
  it("says the PDF has seven pages", () => {
    expect(elektroBauplanPage.pdf.intro).toContain("sieben Seiten");
  });
  it("stays compact: four value points and three comparison rows", () => {
    expect(elektroBauplanPage.inhalt.punkte).toHaveLength(4);
    expect(elektroBauplanPage.loesung.vergleich.reihen).toHaveLength(3);
    expect(elektroBauplanPage.loesung.flow).toHaveLength(4);
  });
});

describe("Elektro /bauplan offer", () => {
  it("leads with the guarantee and asks for one hour", () => {
    expect(angebot.heading).toBe("Keine Zeit zum Selbstbauen? Ich baue ihn dir mit Geld-zurück-Garantie.");
    expect(angebot.schritte.map((s) => s.titel)).toEqual([
      "Eine Stunde mit dir.",
      "Erste Ergebnisse nach 2 Tagen.",
      "Danach Schritt für Schritt.",
      "Zum Schluss testest du.",
    ]);
  });
  it("puts the proof right under the headline, with the confirmed number", () => {
    expect(angebot.beweis).toBe(
      "Ein Hausmeisterservice arbeitet schon damit: Der Inhaber spart jeden Tag zwei Stunden Büroarbeit.",
    );
    expect("intro" in angebot).toBe(false);
  });
  it("promises the deposit back and no final invoice until it fits", () => {
    expect(angebot.garantie.text).toBe("Erfüllt der Assistent deine Anforderungen nicht, bekommst du deine Anzahlung zurück.");
    expect(offer.join(" ")).toContain("Die Schlussrechnung kommt erst, wenn alles für dich passt.");
  });
  it("names no price and no timeline beyond the first two days", () => {
    expect(offerHits(/€|\bEuro\b|\bnetto\b|\bWochen\b|\bMonate?n?\b/)).toEqual([]);
    expect(offerHits(/\bTagen?\b/)).toEqual(["Erste Ergebnisse nach 2 Tagen."]);
  });
  it("names no client and never says KI", () => {
    expect(offerHits(/Power-Connect|\bMDZ\b|Mirsad|Velp|\bAlen\b|BMW|\bKI\b/)).toEqual([]);
  });
  it("states the real capacity limit before the ask", () => {
    expect(angebot.knappheit).toBe("Ich habe nur Kapazität für noch 3 Betriebe.");
  });
  it("books a half-hour call on /kontakt, tagged with the source", () => {
    expect(angebot.frage).toBe("Du hast Fragen? Dann lass uns eine halbe Stunde sprechen.");
    expect(angebot.cta).toEqual({ text: "30 Minuten Gespräch buchen", href: "/kontakt?src=bauplan-elektro" });
  });
});
