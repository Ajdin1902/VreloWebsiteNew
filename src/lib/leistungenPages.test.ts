import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { leistungenPages, leistungenHub, leistungGroups, getLeistungPage, leistungHref, KI_KARTEN_IDS } from "./leistungenPages";
import { findCopyIssues } from "./ratgeberCopy";
import { wartungTiers, WARTUNG_TITEL, WARTUNG_KUENDIGUNG } from "./wartung";
import { GARANTIE } from "./garantie";
import { faqGroups, faqHref } from "./faq";

const SLUGS = ["prozess-audit", "prozessautomatisierung", "ki-automatisierung", "betreuung"];
const NON_COPY_KEYS = new Set(["slug", "group", "heroImage", "href", "src", "kind", "id"]);

// Every German string on a page, skipping paths, URLs and enum-like keys.
function copyStrings(value: unknown, out: string[] = [], key = ""): string[] {
  if (NON_COPY_KEYS.has(key)) return out;
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) copyStrings(v, out, key);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) copyStrings(v, out, k);
  return out;
}

const pub = (p: string) => path.join(process.cwd(), "public", p);
const page = (slug: string) => getLeistungPage(slug)!;
const ki = () => page("ki-automatisierung");
const everything = () => [...leistungenPages, leistungenHub];

// Ajdin 2026-11-11 (second pass): every Leistungen page is Hero → Kennst du
// das? → Lösung in steps → proof (MDZ, Velp) → Warum ich → CTA. Nothing else.
describe("leistungenPages", () => {
  it("has the four agreed pages in order", () => {
    expect(leistungenPages.map((p) => p.slug)).toEqual(SLUGS);
  });

  it("sorts the four pages behind three doors", () => {
    expect(leistungGroups.map((g) => g.label)).toEqual(["Prüfen", "Bauen", "Betreiben"]);
    const by = (g: string) => leistungenPages.filter((p) => p.group === g).map((p) => p.slug);
    expect(by("pruefen")).toEqual(["prozess-audit"]);
    expect(by("bauen")).toEqual(["prozessautomatisierung", "ki-automatisierung"]);
    expect(by("betreiben")).toEqual(["betreuung"]);
  });

  it.each(leistungenPages.map((p) => [p.slug, p] as const))("%s fills the six blocks and nothing else", (_s, p) => {
    expect(Object.keys(p).sort()).toEqual(
      ["cta", "group", "heroImage", "kurz", "loesung", "metaDescription", "navLabel", "pain", "slug", "subline", "szenen", "title", "warum"],
    );
    expect(p.pain.moments.length).toBeGreaterThanOrEqual(3);
    expect(p.pain.moments.length).toBeLessThanOrEqual(4);
    if (p.slug === "betreuung") expect(p.loesung).toEqual({ heading: WARTUNG_TITEL, tabelle: "wartung" });
    else expect(p.loesung.schritte).toHaveLength(3);
    expect(p.szenen.items).toHaveLength(2);
    expect(p.warum).toHaveLength(3);
    expect(p.metaDescription.length).toBeLessThanOrEqual(170);
  });

  it("gives every page its own new hero image, and the file exists", () => {
    for (const p of leistungenPages) {
      expect(p.heroImage).toBe(`/images/leistung-${p.slug}.webp`);
      expect(fs.existsSync(pub(p.heroImage)), p.heroImage).toBe(true);
    }
  });

  it("keeps hero line, pain points and steps short", () => {
    for (const p of everything()) {
      for (const m of p.pain.moments) expect(m.length, m).toBeLessThanOrEqual(42);
      expect(p.pain.close.length, p.pain.close).toBeLessThanOrEqual(75);
    }
    for (const p of leistungenPages) {
      expect(p.subline.length, p.subline).toBeLessThanOrEqual(90);
      for (const s of p.loesung.schritte ?? []) {
        expect(s.title.length, s.title).toBeLessThanOrEqual(32);
        expect(s.text.length, s.text).toBeLessThanOrEqual(110);
      }
    }
    for (const p of everything())
      for (const s of p.szenen.items) for (const t of [s.vorher, s.nachher]) expect(t.length, t).toBeLessThanOrEqual(150);
  });

  // The four former KI pages live on as one card each; the old URLs 308 to these anchors.
  it("shows the five KI sub-services as anchored cards on KI-Automatisierung only", () => {
    expect(KI_KARTEN_IDS).toEqual(["ki-assistenten", "ki-betriebssystem", "claude", "ki-server", "ki-schulung"]);
    expect(ki().loesung.karten!.map((k) => k.id)).toEqual(KI_KARTEN_IDS);
    for (const k of ki().loesung.karten!) expect(k.kurz.length, k.title).toBeLessThanOrEqual(110);
    expect(leistungenPages.filter((p) => p.loesung.karten).map((p) => p.slug)).toEqual(["ki-automatisierung"]);
  });

  // Ajdin 2026-11-10: the EU route. Microsoft Foundry has no EU option for Claude, no route pins Germany.
  it("explains Claude and its EU route without Microsoft, Frankfurt or Germany", () => {
    const claude = ki().loesung.karten!.find((k) => k.id === "claude")!;
    expect(claude.kurz).toContain("Anthropic");
    expect(claude.kurz).toMatch(/EU/);
    expect(copyStrings(ki()).join(" ")).not.toMatch(/Microsoft|Azure|Foundry|Frankfurt|Deutschland/);
  });

  // Ajdin 2026-11-11: proof = MDZ and Velp, only confirmed numbers. MDZ without the
  // family tie on these pages (the tie stays on /referenzen).
  it("proves with MDZ and Velp and only the confirmed numbers", () => {
    const results = everything().flatMap((p) => p.szenen.items).map((s) => s.ergebnis).filter(Boolean);
    expect([...new Set(results)].sort()).toEqual([
      "Rund 2 Stunden am Tag gespart",
      "Rund 4 Stunden Buchhaltung im Monat gespart",
      "Rund 5 Stunden pro Kunde gespart",
    ]);
    for (const p of everything()) {
      const kunden = p.szenen.items.map((s) => s.kunde).join(" ");
      expect(kunden).toMatch(/MDZ/);
    }
    for (const slug of ["prozess-audit", "prozessautomatisierung", "betreuung"])
      expect(page(slug).szenen.items.map((s) => s.kunde).join(" "), slug).toMatch(/Velp/);
    expect(leistungenHub.szenen.items.map((s) => s.kunde).join(" ")).toMatch(/Velp/);
    const mdzRechnung = page("prozessautomatisierung").szenen.items.find((s) => /MDZ/.test(s.kunde))!;
    expect(mdzRechnung.ergebnis).toBe("Rund 4 Stunden Buchhaltung im Monat gespart");
    expect(ki().szenen.items.find((s) => /MDZ/.test(s.kunde))!.ergebnis).toBe("Rund 2 Stunden am Tag gespart");
    // Velp's phase engine runs without KI, so it never proves the KI page.
    expect(ki().szenen.items.map((s) => s.kunde).join(" ")).not.toMatch(/Velp/);
    const all = everything().flatMap((p) => copyStrings(p)).join(" ");
    expect(all).not.toMatch(/meines Vaters|\b(Baude|Alen|Purisic|Zilk|Schmid)\b/);
  });

  // Ajdin 2026-11-11: one Ansprechpartner, the guarantee, it belongs to you (pay once).
  it("says Warum ich in three points, with the guarantee linked to its conditions", () => {
    const titles = (w: { title: string }[]) => w.map((x) => x.title);
    const build = ["Ein Ansprechpartner.", GARANTIE.titel, "Einmal zahlen, alles gehört dir."];
    for (const slug of ["prozessautomatisierung", "ki-automatisierung"]) expect(titles(page(slug).warum), slug).toEqual(build);
    expect(titles(leistungenHub.warum)).toEqual(build);
    expect(titles(page("prozess-audit").warum)).toEqual(["Ein Ansprechpartner.", GARANTIE.titel, "Der Fahrplan gehört dir."]);
    expect(titles(page("betreuung").warum)).toEqual(["Ein Ansprechpartner.", WARTUNG_KUENDIGUNG, "Alles gehört dir."]);
    for (const s of copyStrings(page("betreuung"))) expect(s).not.toMatch(/(?<!dem 3\. Monat )monatlich kündbar/i);
    const questions = faqGroups.flatMap((g) => g.entries.map((e) => e.question));
    for (const p of everything())
      for (const w of p.warum) if (w.title === GARANTIE.titel) {
        expect(w.link?.label).toBe(GARANTIE.faqLink);
        expect(w.link?.href).toBe(faqHref(GARANTIE.faqFrage));
        expect(questions).toContain(GARANTIE.faqFrage);
      }
  });

  // Ajdin 2026-11-11: Betreuung lists details and prices as a comparison table (wartung.ts).
  it("shows Betreuung's tiers as the Wartung table, with no copy of its own", () => {
    expect(page("betreuung").loesung.tabelle).toBe("wartung");
    expect(leistungenPages.filter((p) => p.loesung.tabelle).map((p) => p.slug)).toEqual(["betreuung"]);
  });

  it("leads every page to the Vorlagen with its own src", () => {
    expect(leistungenPages.map((p) => p.cta.kind)).toEqual(["vorlagen", "vorlagen", "vorlagen", "vorlagen"]);
    expect(new Set([...leistungenPages, leistungenHub].map((p) => p.cta.src)).size).toBe(5);
  });

  it("passes the site's German copy guards", () => {
    for (const p of everything())
      for (const s of copyStrings(p)) expect(findCopyIssues(s), s).toEqual([]);
  });

  it("names no price, no Frankfurt, no partner or certification claim", () => {
    const tierNames = new Set(wartungTiers.map((t) => t.name));
    for (const p of everything()) {
      const text = copyStrings(p).filter((s) => !tierNames.has(s)).join(" ");
      expect(text).not.toMatch(/€|\bEUR\b|\d\s*Euro\b/);
      expect(text).not.toMatch(/Frankfurt/);
      // \bPartner\b, case-sensitive: „Ansprechpartner“ is fine, a partner claim is not.
      // The tier „Partner“ comes from wartung.ts, so its name is exempt.
      expect(text).not.toMatch(/\bPartner\b|zertifiziert/);
    }
  });

  // Funnel rule (prozess-check-funnel §1a): the audit is at Vrelo's discretion,
  // so any string that mentions the Fahrplan must make it conditional.
  // Ajdin 2026-11-11: the audit steps say up front that none of it costs anything.
  it("heads the audit steps with Alles kostenlos", () => {
    expect(getLeistungPage("prozess-audit")!.loesung.heading).toBe("So läuft der Audit. Alles kostenlos.");
  });

  // Ajdin 2026-11-12: the Fahrplan is always included (was conditional until then).
  it("promises the Fahrplan without a condition", () => {
    const promises = [
      ...everything().flatMap((p) => [...p.warum.map((w) => w.body), p.cta.lead]),
      ...leistungenPages.flatMap((p) => [p.kurz, p.subline, p.metaDescription, ...(p.loesung.schritte ?? []).map((s) => s.text)]),
    ];
    for (const s of promises) if (/Fahrplan/.test(s)) expect(s).not.toMatch(/[Ll]ohnt/);
  });

  it("looks pages up by slug and builds their href", () => {
    expect(getLeistungPage("ki-automatisierung")?.title).toBe("KI-Automatisierung");
    expect(getLeistungPage("claude")).toBeUndefined();
    expect(leistungHref("betreuung")).toBe("/leistungen/betreuung");
  });
});

// Ajdin 2026-11-12: the Fahrplan is always part of the free path, never conditional.
describe("Fahrplan promise on the Leistungen pages", () => {
  it("never makes the Fahrplan conditional", () => {
    expect(JSON.stringify([leistungenPages, leistungenHub])).not.toMatch(/Lohnt sich etwas|Wenn sich etwas lohnt|wenn es sich lohnt/i);
    const audit = getLeistungPage("prozess-audit")!;
    expect(JSON.stringify(audit)).toContain("Ein bis zwei Werktage später bekommst du deinen Fahrplan.");
  });
});
