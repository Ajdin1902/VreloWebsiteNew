// The research result n8n posts back (spec §8.2) and the gate that turns it into the
// visitor's Vorab-Fahrplan (spec §8.5): only claims whose sources the research really
// fetched reach the visitor, every text goes through the sanitiser.
import { z } from "zod";
import { AREA_IDS } from "@/lib/prozessCheck";
import { LIMITS, type ProgrammZeile, type Quelle, type Schritt, type VorabFahrplan } from "./content";
import { sanitizeVisitorText } from "./sanitize";

const Bereich = z.enum(AREA_IDS);

export const ResearchResultSchema = z.object({
  jobId: z.string(),
  fallback: z.boolean(),
  grund: z.string().optional(),
  erlaubteQuellen: z.array(z.string()),
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
const NAME_MAX = 40;

export function mergeResearch(
  base: VorabFahrplan,
  r: ResearchResult,
  abgerufen: string,
): { plan: VorabFahrplan; verworfen: string[] } {
  if (r.fallback || !r.pdf) return { plan: base, verworfen: [] };
  const erlaubt = new Set(r.erlaubteQuellen.filter((u) => /^https?:\/\//i.test(u)));
  const belegt = (urls: string[]) => urls.length > 0 && urls.every((u) => erlaubt.has(u));
  const verworfen: string[] = [];
  const kurz = (t: string) => t.slice(0, 80);

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
    const out: Schritt = {
      rang: s.rang,
      bereich: s.bereich,
      titel: sanitizeVisitorText(rs.titel, LIMITS.titel) || s.titel,
      idee: sanitizeVisitorText(rs.idee, LIMITS.idee) || s.idee,
      quellen: [],
    };
    const ok = belegt(rs.quellen);
    const claim = (key: "mitProgrammen" | "tipp", text: string | undefined, max: number) => {
      if (text === undefined) return;
      const t = sanitizeVisitorText(text, max);
      if (!ok || !t) return void verworfen.push(`${s.bereich} ${key}: ${kurz(text)}`);
      out[key] = t;
    };
    claim("mitProgrammen", rs.mitProgrammen, LIMITS.mitProgrammen);
    if (s.rang === "Zuerst") claim("tipp", rs.tipp, LIMITS.tipp);
    else if (rs.tipp !== undefined) verworfen.push(`${s.bereich} tipp (nur unter Zuerst): ${kurz(rs.tipp)}`);
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

  const programme: ProgrammZeile[] = [];
  for (const p of r.pdf.programme.slice(0, MAX_PROGRAMME)) {
    const name = sanitizeVisitorText(p.name, NAME_MAX);
    const zeilen: { text: string; quellen: string[] }[] = [];
    for (const z of p.zeilen) {
      const text = sanitizeVisitorText(z.text, LIMITS.programmZeile);
      if (belegt(z.quellen) && text && zeilen.length < MAX_ZEILEN) zeilen.push({ text, quellen: z.quellen });
      else verworfen.push(`Programm ${kurz(p.name)}: ${kurz(z.text)}`);
    }
    if (!name || !zeilen.length) {
      verworfen.push(`Programm ${kurz(p.name)}: ohne Namen oder belegte Zeile verworfen`);
      continue;
    }
    belegtesItem = true;
    const ns = zeilen.flatMap((z) => z.quellen.map((u) => nummer(u, abgerufen)));
    programme.push({ name, zeilen: zeilen.map((z) => z.text), quellen: [...new Set(ns)] });
  }

  // No sourced item: the visitor gets the plain fallback (no KI text without the KI footer).
  if (!belegtesItem) return { plan: base, verworfen };
  return { plan: { ...base, schritte, programme, quellen, recherchiert: true }, verworfen };
}
