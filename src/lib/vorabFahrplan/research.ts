// The research result n8n posts back (spec §8.2) and the gate that turns it into the
// visitor's Vorab-Fahrplan (spec §8.5): only claims whose sources the research really
// fetched and that hold nothing forbidden reach the visitor, polished.
import { z } from "zod";
import { AREA_IDS, PROGRAMM_CHIPS } from "@/lib/prozessCheck";
import { LIMITS, type ProgrammZeile, type Quelle, type Schritt, type VorabFahrplan } from "./content";
import { findForbidden, polish } from "./sanitize";

const Bereich = z.enum(AREA_IDS);

export const ResearchResultSchema = z.object({
  jobId: z.string(),
  fallback: z.boolean(),
  grund: z.string().optional(),
  erlaubteQuellen: z.array(z.string()).default([]), // the n8n error payload (spec §8.1) sends none
  pdf: z
    .object({
      schritte: z.array(
        z.object({
          bereich: Bereich,
          titel: z.string(),
          idee: z.string(),
          mitProgrammen: z.string().optional(),
          tipp: z.string().optional(),
          quellen: z.array(z.string()),
        }),
      ),
      programme: z.array(
        z.object({ name: z.string(), zeilen: z.array(z.object({ text: z.string(), quellen: z.array(z.string()) })) }),
      ),
    })
    .optional(),
  dossier: z
    .object({
      programme: z.array(
        z.object({ name: z.string(), befunde: z.string(), unbestaetigt: z.string(), blocker: z.string(), n8n: z.string(), api: z.string() }),
      ),
      website: z.string().optional(),
      aufwand: z.array(z.object({ bereich: Bereich, groesse: z.enum(["S", "M", "L"]) })),
      kartenStationen: z.array(z.string()),
      fragen: z.array(z.string()).length(5),
      kostenUsd: z.number(),
      capsGetroffen: z.array(z.string()),
    })
    .optional(),
});
export type ResearchResult = z.infer<typeof ResearchResultSchema>;

const MAX_PROGRAMME = 8; // parseProgramme keeps at most 8
const MAX_ZEILEN = 3;
// „Lex Office“, „lexoffice“ and „LexOffice.“ are one program.
const normName = (s: string) => s.toLowerCase().replace(/[\s.]/g, "");

/**
 * Turns the fallback plan into the researched one. A claim reaches the visitor only when
 * every source is in erlaubteQuellen and findForbidden finds nothing; otherwise it is
 * dropped whole into `verworfen` (with the reason), never cut. `programme` = the visitor's
 * parsed programs: research about any other program is dropped.
 */
export function mergeResearch(
  base: VorabFahrplan,
  r: ResearchResult,
  abgerufen: string,
  programme: string[],
): { plan: VorabFahrplan; verworfen: string[] } {
  if (r.fallback || !r.pdf) return { plan: base, verworfen: [] };
  const allowNames = [...programme, ...PROGRAMM_CHIPS];
  const erlaubt = new Set(r.erlaubteQuellen.filter((u) => /^https?:\/\//i.test(u)));
  const belegt = (urls: string[]) => urls.length > 0 && urls.every((u) => erlaubt.has(u));
  const verworfen: string[] = [];
  const verwerfen = (wo: string, grund: string, text: string) => void verworfen.push(`${wo} (${grund}): ${text.slice(0, 80)}`);

  /** The polished claim, or undefined when it must not be shown. */
  const pruefe = (wo: string, text: string, max: number, urls: string[]): string | undefined => {
    const gruende: string[] = [...(belegt(urls) ? [] : ["quelle"]), ...findForbidden(text, { allowNames })];
    const t = polish(text, max);
    if (!t) gruende.push("leer");
    if (gruende.length) return verwerfen(wo, gruende.join(", "), text);
    return t;
  };
  /** Research text for titel/idee, or the base text when it is forbidden or empty. */
  const ersetze = (wo: string, text: string, max: number, alt: string): string => {
    const gruende = findForbidden(text, { allowNames });
    if (gruende.length) {
      verwerfen(wo, gruende.join(", "), text);
      return alt;
    }
    return polish(text, max) || alt;
  };

  // Numbers are handed out only for sources of something the visitor sees.
  const quellen: Quelle[] = [];
  const nummer = (url: string, am: string) => {
    const q = quellen.find((x) => x.url === url);
    if (q) return q.n;
    quellen.push({ n: quellen.length + 1, url, abgerufen: am });
    return quellen.length;
  };
  // The fallback tip carries its own source in base.quellen.
  const baseNummern = (ns: number[]) =>
    ns.flatMap((n) => base.quellen.filter((q) => q.n === n).map((q) => nummer(q.url, q.abgerufen)));
  let belegtesItem = false;

  const schritte = base.schritte.map((s): Schritt => {
    const rs = r.pdf!.schritte.find((x) => x.bereich === s.bereich); // order stays from base
    if (!rs) return { ...s, quellen: baseNummern(s.quellen) };
    const wo = s.bereich;
    const out: Schritt = {
      rang: s.rang,
      bereich: s.bereich,
      titel: ersetze(`${wo} titel`, rs.titel, LIMITS.titel, s.titel),
      idee: ersetze(`${wo} idee`, rs.idee, LIMITS.idee, s.idee),
      quellen: [],
    };
    if (rs.mitProgrammen !== undefined) {
      const t = pruefe(`${wo} mitProgrammen`, rs.mitProgrammen, LIMITS.mitProgrammen, rs.quellen);
      if (t) out.mitProgrammen = t;
    }
    if (rs.tipp !== undefined) {
      const t = s.rang === "Zuerst" ? pruefe(`${wo} tipp`, rs.tipp, LIMITS.tipp, rs.quellen) : verwerfen(`${wo} tipp`, "nur unter Zuerst", rs.tipp);
      if (t) out.tipp = t;
    }
    if (out.mitProgrammen || out.tipp) {
      belegtesItem = true;
      out.quellen = rs.quellen.map((u) => nummer(u, abgerufen));
    }
    if (!out.tipp && s.tipp) {
      out.tipp = s.tipp;
      out.quellen.push(...baseNummern(s.quellen));
    }
    out.quellen = [...new Set(out.quellen)];
    return out;
  });

  const eigene = new Map(programme.map((p) => [normName(p), p]));
  const gesehen = new Set<string>();
  const kandidaten = r.pdf.programme.filter((p) => {
    const key = normName(p.name);
    if (!eigene.has(key)) return verwerfen(`Programm ${p.name}`, "nicht vom Besucher genannt", p.name), false;
    if (gesehen.has(key)) return verwerfen(`Programm ${p.name}`, "doppelt", p.name), false;
    gesehen.add(key);
    return true;
  });
  const programmZeilen: ProgrammZeile[] = [];
  for (const p of kandidaten.slice(0, MAX_PROGRAMME)) {
    const name = eigene.get(normName(p.name))!; // the visitor's own spelling
    const zeilen: { text: string; quellen: string[] }[] = [];
    for (const z of p.zeilen) {
      if (zeilen.length >= MAX_ZEILEN) {
        verwerfen(`Programm ${name}`, "mehr als 3 Zeilen", z.text);
        continue;
      }
      const t = pruefe(`Programm ${name}`, z.text, LIMITS.programmZeile, z.quellen);
      if (t) zeilen.push({ text: t, quellen: z.quellen });
    }
    if (!zeilen.length) {
      verwerfen(`Programm ${name}`, "keine Zeile übrig", name);
      continue;
    }
    belegtesItem = true;
    const ns = zeilen.flatMap((z) => z.quellen.map((u) => nummer(u, abgerufen)));
    programmZeilen.push({ name, zeilen: zeilen.map((z) => z.text), quellen: [...new Set(ns)] });
  }

  // No sourced item: the visitor gets the plain fallback (no KI text without the KI footer).
  if (!belegtesItem) return { plan: base, verworfen };
  return { plan: { ...base, schritte, programme: programmZeilen, quellen, recherchiert: true }, verworfen };
}
