import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { leistungenPages, leistungGroups, getLeistungPage, leistungHref, type LeistungPage } from "./leistungenPages";
import { findCopyIssues } from "./ratgeberCopy";
import { getAllArticles } from "./ratgeber";

const SLUGS = ["prozessautomatisierung", "ki-automatisierung", "ki-server", "claude", "ki-schulung", "ki-beratung", "betreuung"];
const NON_COPY_KEYS = new Set(["slug", "group", "heroImage", "url", "src", "poster", "href", "related", "kind", "year"]);

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

describe("leistungenPages", () => {
  it("has the seven agreed pages in order", () => {
    expect(leistungenPages.map((p) => p.slug)).toEqual(SLUGS);
  });

  it("groups three, three and one", () => {
    expect(leistungGroups.map((g) => g.label)).toEqual(["Automatisieren", "Befähigen", "Betreiben"]);
    const by = (g: string) => leistungenPages.filter((p) => p.group === g).map((p) => p.slug);
    expect(by("automatisieren")).toEqual(["prozessautomatisierung", "ki-automatisierung", "ki-server"]);
    expect(by("befaehigen")).toEqual(["claude", "ki-schulung", "ki-beratung"]);
    expect(by("betreiben")).toEqual(["betreuung"]);
  });

  it.each(leistungenPages.map((p) => [p.slug, p] as const))("%s fills every block", (_s, p) => {
    for (const s of [p.navLabel, p.title, p.subline, p.metaDescription, p.kurz, p.pain.heading, p.pain.close, p.proof.heading, p.proof.objection, p.example.heading, p.cta.heading, p.cta.lead])
      expect(s.trim().length).toBeGreaterThan(0);
    expect(p.pain.moments.length).toBeGreaterThanOrEqual(3);
    expect(p.pain.moments.length).toBeLessThanOrEqual(4);
    if ("steps" in p.example) {
      expect(p.example.before.trim()).not.toBe("");
      expect(p.example.after.trim()).not.toBe("");
      expect(p.example.steps).toHaveLength(3);
    } else {
      expect(p.example.video.src).toMatch(/^\/video\//);
    }
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
    const proof = getLeistungPage("ki-automatisierung")!.proof;
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

  it("uses practice proof on Claude, Schulung and Beratung, without client names", () => {
    for (const s of ["claude", "ki-schulung", "ki-beratung"]) expect(getLeistungPage(s)!.proof.kind).toBe("practice");
    const all = leistungenPages.flatMap((p) => copyStrings(p)).join(" ");
    expect(all).not.toMatch(/\b(Velp|MDZ|Baude|Alen|Purisic)\b/);
  });

  it("splits the CTA: check on automation pages, Erstgespräch elsewhere", () => {
    const kinds = Object.fromEntries(leistungenPages.map((p) => [p.slug, p.cta.kind]));
    expect(kinds).toEqual({
      prozessautomatisierung: "check", "ki-automatisierung": "check", betreuung: "check",
      "ki-server": "kontakt", claude: "kontakt", "ki-schulung": "kontakt", "ki-beratung": "kontakt",
    });
    expect(new Set(leistungenPages.map((p) => p.cta.src)).size).toBe(7);
  });

  it("carries the Digitalbonus note only on KI-Beratung, as a possibility", () => {
    expect(leistungenPages.filter((p) => p.note).map((p) => p.slug)).toEqual(["ki-beratung"]);
    const note = getLeistungPage("ki-beratung")!.note!;
    expect(note.body).toContain("kann");
    expect(note.body).toContain("Antrag");
    expect(note.body).toContain("bevor");
    expect(note.body).not.toMatch(/€|%/);
    expect(note.link.href).toBe("https://www.digitalbonus.bayern/foerderprogramm/");
  });

  it("shows the audit card only on KI-Beratung", () => {
    expect(leistungenPages.filter((p) => p.auditCard).map((p) => p.slug)).toEqual(["ki-beratung"]);
  });

  it("points every video at a file that exists", () => {
    for (const p of leistungenPages) {
      if (!("video" in p.example)) continue;
      expect(fs.existsSync(pub(p.example.video.src))).toBe(true);
      expect(fs.existsSync(pub(p.example.video.poster))).toBe(true);
    }
  });

  it("passes the site's German copy guards", () => {
    for (const p of leistungenPages)
      for (const s of copyStrings(p)) expect(findCopyIssues(s), `${p.slug}: ${s}`).toEqual([]);
  });

  it("names no price, no Frankfurt, no partner or certification claim", () => {
    for (const p of leistungenPages) {
      const text = nonStudyStrings(p).join(" ");
      expect(text, p.slug).not.toMatch(/€|\bEUR\b|\d\s*Euro\b/);
      expect(text, p.slug).not.toMatch(/Frankfurt/);
      // \bPartner\b, case-sensitive: „Ansprechpartner“ is fine, a partner claim is not.
      expect(text, p.slug).not.toMatch(/\bPartner\b|zertifiziert/);
    }
  });

  it("looks pages up by slug and builds their href", () => {
    expect(getLeistungPage("claude")?.title).toBe("Claude für Unternehmen");
    expect(getLeistungPage("gibt-es-nicht")).toBeUndefined();
    expect(leistungHref("ki-server")).toBe("/leistungen/ki-server");
  });

  // Funnel rule (prozess-check-funnel §1a): the audit is at Vrelo's discretion,
  // so any string that mentions the Fahrplan must make it conditional.
  it("promises the Fahrplan only conditionally", () => {
    for (const p of leistungenPages) {
      // The strings that promise delivery; a point title about ownership
      // („Der Fahrplan gehört dir.“) is not a promise to deliver one.
      const run = "steps" in p.example ? [...p.example.steps, p.example.after] : [];
      const promises = [p.kurz, p.subline, p.metaDescription, ...run, p.cta.lead];
      for (const s of promises)
        if (/Fahrplan/.test(s)) expect(s, `${p.slug}: ${s}`).toMatch(/[Ww]enn|[Ll]ohnt/);
    }
  });

  it("states the EZB figure as a median, not an average", () => {
    const proof = getLeistungPage("ki-automatisierung")!.proof;
    if (proof.kind !== "studies") throw new Error("expected studies");
    const ezb = proof.figures.find((f) => f.source === "Europäische Zentralbank")!;
    expect(ezb.claim).toContain("Median");
    expect(ezb.claim).not.toContain("im Mittel");
  });

  // Spec §2: a technical term is explained once where it first appears on a page.
  it("explains Claude in the subline wherever the subline names it", () => {
    for (const p of leistungenPages)
      if (/Claude/.test(p.subline)) expect(p.subline, p.slug).toContain("Anthropic");
  });

  // Ajdin 2026-10-01 (hero A + pain 3): one short sentence in the hero and
  // three-to-six-word pain points, so the first screens carry little text.
  it("keeps the hero line and the pain points short", () => {
    for (const p of leistungenPages) {
      expect(p.subline.length, `${p.slug}: ${p.subline}`).toBeLessThanOrEqual(90);
      for (const m of p.pain.moments) expect(m.length, `${p.slug}: ${m}`).toBeLessThanOrEqual(42);
      expect(p.pain.close.length, `${p.slug}: ${p.pain.close}`).toBeLessThanOrEqual(75);
    }
  });

  // Ajdin 2026-10-01: KI-Automatisierung shows the real clip on its own, no
  // text run around it (the invoice example and the caption are gone).
  it("shows the clip alone on KI-Automatisierung", () => {
    const ex = getLeistungPage("ki-automatisierung")!.example;
    expect("video" in ex).toBe(true);
    expect("steps" in ex).toBe(false);
    expect(JSON.stringify(ex)).not.toMatch(/Rechnung|Vorher|Nachher|Testdaten/);
  });
});
