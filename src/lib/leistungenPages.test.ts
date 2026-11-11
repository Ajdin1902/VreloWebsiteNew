import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { leistungenPages, leistungGroups, getLeistungPage, leistungHref, automatisierungVergleich, claudeVergleich, EIGENTUM, type LeistungPage } from "./leistungenPages";
import { findCopyIssues } from "./ratgeberCopy";
import { getAllArticles } from "./ratgeber";

const SLUGS = ["prozess-audit", "prozessautomatisierung", "ki-automatisierung", "betreuung"];
const NON_COPY_KEYS = new Set(["slug", "group", "heroImage", "url", "src", "poster", "href", "related", "kind", "year", "id"]);

// Every German string on a page, skipping paths, URLs and enum-like keys.
function copyStrings(value: unknown, out: string[] = [], key = ""): string[] {
  if (NON_COPY_KEYS.has(key)) return out;
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) copyStrings(v, out, key);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) copyStrings(v, out, k);
  return out;
}

function nonStudyStrings(p: LeistungPage): string[] {
  const { proof, ...rest } = p;
  const proofCopy = proof.kind === "studies"
    ? [proof.heading, proof.caseLine ?? "", proof.objection]
    : copyStrings(proof);
  return [...copyStrings(rest), ...proofCopy];
}

const pub = (p: string) => path.join(process.cwd(), "public", p);
const ki = () => getLeistungPage("ki-automatisierung")!;

describe("leistungenPages", () => {
  // Ajdin 2026-11-11: four pages instead of eight, the sub-services shown on the page.
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

  it.each(leistungenPages.map((p) => [p.slug, p] as const))("%s fills every block", (_s, p) => {
    for (const s of [p.navLabel, p.title, p.subline, p.metaDescription, p.kurz, p.pain.heading, p.pain.close, p.proof.heading, p.proof.objection, p.cta.heading, p.cta.lead])
      expect(s.trim().length).toBeGreaterThan(0);
    expect(p.pain.moments.length).toBeGreaterThanOrEqual(3);
    expect(p.pain.moments.length).toBeLessThanOrEqual(4);
    if (p.example && "steps" in p.example) {
      expect(p.example.before.trim()).not.toBe("");
      expect(p.example.after.trim()).not.toBe("");
      expect(p.example.steps).toHaveLength(3);
    } else if (p.example) {
      expect(p.example.video.src).toMatch(/^\/video\//);
    }
    expect(p.example || p.szenen, p.slug).toBeTruthy();
    expect(p.related.length).toBeGreaterThanOrEqual(1);
    expect(p.related.length).toBeLessThanOrEqual(3);
    expect(fs.existsSync(pub(p.heroImage))).toBe(true);
    expect(p.metaDescription.length).toBeLessThanOrEqual(170);
  });

  it("links only Ratgeber articles that exist", () => {
    const slugs = new Set(getAllArticles({ includeDrafts: true }).map((a) => a.slug));
    for (const p of leistungenPages) for (const r of p.related) expect(slugs.has(r), `${p.slug} → ${r}`).toBe(true);
  });

  it("proves KI-Automatisierung with 2–3 complete, recent, linked study figures", () => {
    const proof = ki().proof;
    expect(proof.kind).toBe("studies");
    if (proof.kind !== "studies") return;
    expect(proof.figures.length).toBeGreaterThanOrEqual(2);
    expect(proof.figures.length).toBeLessThanOrEqual(3);
    for (const f of proof.figures) {
      expect(f.figure.trim()).not.toBe("");
      expect(f.claim.trim()).not.toBe("");
      expect(f.source.trim()).not.toBe("");
      expect(f.year).toBeGreaterThanOrEqual(2024);
      expect(f.url).toMatch(/^https:\/\//);
    }
  });

  it("states the EZB figure as a median, not an average", () => {
    const proof = ki().proof;
    if (proof.kind !== "studies") throw new Error("expected studies");
    const ezb = proof.figures.find((f) => f.source === "Europäische Zentralbank")!;
    expect(ezb.claim).toContain("Median");
    expect(ezb.claim).not.toContain("im Mittel");
  });

  // MDZ is Ajdin's father's business (UWG §5): never named without the family tie.
  it("names MDZ only with the family tie and no other client but Velp", () => {
    for (const p of leistungenPages)
      for (const s of copyStrings(p)) if (/\bMDZ\b/.test(s)) expect(s, `${p.slug}: ${s}`).toMatch(/meines Vaters/);
    const all = leistungenPages.flatMap((p) => copyStrings(p)).join(" ");
    expect(all).not.toMatch(/\b(Baude|Alen|Purisic|Zilk|Schmid)\b/);
  });

  // Ajdin 2026-11-11: only confirmed numbers in the scenes.
  it("uses only the confirmed numbers in the scenes", () => {
    const results = leistungenPages.flatMap((p) => p.szenen?.items ?? []).map((s) => s.ergebnis).filter(Boolean);
    expect(results.sort()).toEqual(["Rund 2 Stunden am Tag gespart", "Rund 5 Stunden pro Kunde gespart"]);
    for (const p of leistungenPages)
      for (const s of p.szenen?.items ?? []) {
        const digits = (s.vorher + " " + s.nachher).match(/\d+/g) ?? [];
        for (const d of digits) expect(["174", "96", "66"], `${p.slug}: ${s.titel}`).toContain(d);
      }
    expect(copyStrings(ki().szenen)).toContain("Beim ersten Durchlauf durch 174 E-Mails haben feste Regeln und bekannte Kontakte 96 einsortiert, die KI 66. Acht blieben für mich zur Prüfung.");
  });

  it("attaches each number to the right scene", () => {
    const mdzKi = ki().szenen!.items.find((s) => /MDZ/.test(s.kunde))!;
    expect(mdzKi.ergebnis).toBe("Rund 2 Stunden am Tag gespart");
    const pa = getLeistungPage("prozessautomatisierung")!.szenen!.items;
    expect(pa.find((s) => /MDZ/.test(s.kunde))!.ergebnis).toBeUndefined();
    expect(pa.find((s) => /Velp/.test(s.kunde))!.ergebnis).toBe("Rund 5 Stunden pro Kunde gespart");
    expect(getLeistungPage("prozess-audit")!.szenen!.items.every((s) => !s.ergebnis)).toBe(true);
  });

  it("leads every page to the Vorlagen with its own src", () => {
    expect(leistungenPages.map((p) => p.cta.kind)).toEqual(["vorlagen", "vorlagen", "vorlagen", "vorlagen"]);
    expect(new Set(leistungenPages.map((p) => p.cta.src)).size).toBe(4);
  });

  it("shows the sub-services as overview cards on the audit and both build pages", () => {
    expect(leistungenPages.filter((p) => p.angebote).map((p) => p.slug)).toEqual(["prozess-audit", "prozessautomatisierung", "ki-automatisierung"]);
    expect(ki().angebote!.karten.map((k) => k.href)).toEqual(["#ki-assistenten", "#ki-betriebssystem", "#claude", "#ki-server", "#ki-schulung"]);
    expect(getLeistungPage("prozess-audit")!.angebote!.karten[0].href).toBe("/prozess-check?src=leistung-prozess-audit");
    for (const p of leistungenPages) for (const k of p.angebote?.karten ?? []) expect(k.kurz.length, k.title).toBeLessThanOrEqual(110);
  });

  it("folds the four former KI pages into anchored sections", () => {
    expect(ki().abschnitte!.map((a) => a.id)).toEqual(["ki-betriebssystem", "claude", "ki-server", "ki-schulung"]);
    expect(ki().szenen!.id).toBe("ki-assistenten");
    for (const a of ki().abschnitte!) {
      expect(a.absaetze.length, a.id).toBeGreaterThanOrEqual(2);
      expect(a.absaetze.length, a.id).toBeLessThanOrEqual(3);
      expect(a.lead.length, a.id).toBeLessThanOrEqual(90);
    }
  });

  // Ajdin 2026-11-10: the EU route. Microsoft Foundry has no EU option for Claude, no route pins Germany.
  it("keeps the Claude section's EU route verbatim", () => {
    const claude = ki().abschnitte!.find((a) => a.id === "claude")!;
    expect(claude.vergleich).toBe(claudeVergleich);
    expect(claude.note!.link.href).toBe("/claude-gehirn");
    expect(claude.lead).toContain("Anthropic");
    const all = [...copyStrings(claudeVergleich), ...copyStrings(claude)].join(" ");
    expect(all).toMatch(/innerhalb der EU/);
    expect(all).not.toMatch(/Microsoft|Azure|Foundry|Frankfurt|Deutschland|€/);
    const v = claudeVergleich;
    expect(v.columns.map((c) => !!c.warm)).toEqual([false, true]);
    for (const r of v.rows) for (const c of r.cells) expect(c.length, c).toBeLessThanOrEqual(95);
  });

  it("keeps the gift link on KI-Betriebssystem and the Art. 4 note on KI-Schulung", () => {
    const by = (id: string) => ki().abschnitte!.find((a) => a.id === id)!;
    expect(by("ki-betriebssystem").note!.link.href).toBe("/claude-gehirn");
    expect(by("ki-schulung").note!.body).toMatch(/Artikel 4/);
  });

  it("carries the Förderung note on both build pages and the audit", () => {
    expect(leistungenPages.filter((p) => p.note).map((p) => p.slug)).toEqual(["prozess-audit", "prozessautomatisierung", "ki-automatisierung"]);
    for (const slug of ["prozessautomatisierung", "ki-automatisierung"] as const)
      expect(getLeistungPage(slug)!.note).toEqual(getLeistungPage("prozess-audit")!.note);
    const note = getLeistungPage("prozess-audit")!.note!;
    expect(note.body).toContain("Antrag");
    expect(note.body).not.toMatch(/€|%/);
    expect(note.link.href).toBe("https://www.digitalbonus.bayern/foerderprogramm/");
  });

  it("says build once, it is yours, on both build pages; the tiers only on Betreuung", () => {
    expect(leistungenPages.filter((p) => p.eigentum).map((p) => p.slug)).toEqual(["prozessautomatisierung", "ki-automatisierung"]);
    expect(leistungenPages.filter((p) => p.wartung).map((p) => p.slug)).toEqual(["betreuung"]);
    expect(EIGENTUM.text).toBe("Einmal gebaut, gehört es dir. Keine monatliche Pflicht: Wartung nur, wenn du sie willst.");
    expect(EIGENTUM.link.href).toBe("/leistungen/betreuung");
  });

  it("shows the audit card only on Prozess-Audit", () => {
    expect(leistungenPages.filter((p) => p.auditCard).map((p) => p.slug)).toEqual(["prozess-audit"]);
  });

  it("points every video at a file that exists", () => {
    for (const p of leistungenPages) {
      if (!p.example || !("video" in p.example)) continue;
      expect(fs.existsSync(pub(p.example.video.src))).toBe(true);
      expect(fs.existsSync(pub(p.example.video.poster))).toBe(true);
    }
  });

  it("passes the site's German copy guards", () => {
    for (const p of leistungenPages)
      for (const s of copyStrings(p)) expect(findCopyIssues(s), `${p.slug}: ${s}`).toEqual([]);
    expect(findCopyIssues(EIGENTUM.text)).toEqual([]);
  });

  it("names no price, no Frankfurt, no partner or certification claim", () => {
    for (const p of leistungenPages) {
      const text = nonStudyStrings(p).join(" ");
      expect(text, p.slug).not.toMatch(/€|\bEUR\b|\d\s*Euro\b/);
      expect(text, p.slug).not.toMatch(/Frankfurt/);
      // \bPartner\b, case-sensitive: „Ansprechpartner“ is fine, a partner claim is not.
      // The Wartung tier „Partner“ lives in src/lib/wartung.ts, not in the page data.
      expect(text, p.slug).not.toMatch(/\bPartner\b|zertifiziert/);
    }
  });

  it("looks pages up by slug and builds their href", () => {
    expect(getLeistungPage("ki-automatisierung")?.title).toBe("KI-Automatisierung");
    expect(getLeistungPage("claude")).toBeUndefined();
    expect(leistungHref("betreuung")).toBe("/leistungen/betreuung");
  });

  // Funnel rule (prozess-check-funnel §1a): the audit is at Vrelo's discretion,
  // so any string that mentions the Fahrplan must make it conditional.
  it("promises the Fahrplan only conditionally", () => {
    for (const p of leistungenPages) {
      const run = p.example && "steps" in p.example ? [...p.example.steps, p.example.after] : [];
      const promises = [p.kurz, p.subline, p.metaDescription, ...run, p.cta.lead];
      for (const s of promises)
        if (/Fahrplan/.test(s)) expect(s, `${p.slug}: ${s}`).toMatch(/[Ww]enn|[Ll]ohnt/);
    }
  });

  it("explains Claude in the subline wherever the subline names it", () => {
    for (const p of leistungenPages)
      if (/Claude/.test(p.subline)) expect(p.subline, p.slug).toContain("Anthropic");
  });

  it("keeps the hero line and the pain points short", () => {
    for (const p of leistungenPages) {
      expect(p.subline.length, `${p.slug}: ${p.subline}`).toBeLessThanOrEqual(90);
      for (const m of p.pain.moments) expect(m.length, `${p.slug}: ${m}`).toBeLessThanOrEqual(42);
      expect(p.pain.close.length, `${p.slug}: ${p.pain.close}`).toBeLessThanOrEqual(75);
    }
  });

  it("keeps before and after short and unprefixed", () => {
    const pairs = leistungenPages.flatMap((p) => [
      ...(p.example && "steps" in p.example ? [p.example.before, p.example.after] : []),
      ...(p.szenen?.items ?? []).flatMap((s) => [s.vorher, s.nachher]),
    ]);
    for (const s of pairs) {
      expect(s).not.toMatch(/^(Vorher|Nachher):/);
      expect(s.length, s).toBeLessThanOrEqual(150);
    }
  });

  it("shows the clip on KI-Automatisierung", () => {
    const ex = ki().example!;
    expect("video" in ex).toBe(true);
  });

  it("compares Prozess- and KI-Automatisierung on exactly those two pages", () => {
    expect(leistungenPages.filter((p) => p.vergleich === automatisierungVergleich).map((p) => p.slug)).toEqual(["prozessautomatisierung", "ki-automatisierung"]);
    const v = automatisierungVergleich;
    expect(v.columns.map((c) => c.slug)).toEqual(["prozessautomatisierung", "ki-automatisierung"]);
    for (const r of v.rows) for (const c of r.cells) expect(c.length, c).toBeLessThanOrEqual(95);
    for (const s of copyStrings(v)) expect(findCopyIssues(s), s).toEqual([]);
  });

  it("draws one graphic per page and one per KI section", () => {
    expect(leistungenPages.map((p) => [p.slug, p.grafik?.kind])).toEqual([
      ["prozess-audit", "prozess-audit-balken"],
      ["prozessautomatisierung", "prozess-fliessband"],
      ["ki-automatisierung", "ki-fluss"],
      ["betreuung", "betreuung-zeitlinie"],
    ]);
    expect(ki().abschnitte!.map((a) => a.grafik?.kind)).toEqual(["betriebssystem-becken", "claude-projekt", "ki-server-rahmen", "schulung-vorlagen"]);
    const all = [...leistungenPages.map((p) => p.grafik!), ...ki().abschnitte!.map((a) => a.grafik!)];
    for (const g of all) {
      expect(g.heading.length, g.kind).toBeLessThanOrEqual(60);
      expect(g.alt.length, g.kind).toBeGreaterThan(80);
    }
  });
});
