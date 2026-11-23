// Builds the Vorab-Fahrplan from the fixed blocks, without any research or AI
// (spec §7.3). Plan 2 fills the same VorabFahrplan shape from research.
import {
  KANAL_PRIORITY,
  jahresArbeitstage,
  rankAreas,
  resultCopy,
  type AreaId,
  type Kanal,
  type ParsedAnswers,
} from "@/lib/prozessCheck";
import { capText } from "./guards";
import { AREA_IDEE, KANAL_VARIANTE, KANAL_WEG, MENGE_ZEILE, TIPPS, WER_ZEILE } from "./blocks";
import { LIMITS, type Quelle, type Schritt, type VorabFahrplan } from "./content";

const RANG: Schritt["rang"][] = ["Zuerst", "Danach", "Später"];
const nf = new Intl.NumberFormat("de-DE");
const dateFmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" });

/** nervt first (even at 0 h), then the other picked areas with hours > 0 by hours, at most 3. */
export function schrittOrder(a: Pick<ParsedAnswers, "bereiche" | "stunden" | "nervt">): AreaId[] {
  const rest = rankAreas(a).filter((id) => id !== a.nervt && (a.stunden[id] || 0) > 0);
  return [a.nervt, ...rest].slice(0, 3);
}

/** The long idea with the first sentence swapped for the highest-priority picked channel that has a variant. */
export function zuerstIdee(area: AreaId, kanaele: Kanal[]): string {
  const { lang } = AREA_IDEE[area];
  const k = KANAL_PRIORITY.find((c) => kanaele.includes(c) && KANAL_VARIANTE[area]?.[c]);
  if (!k) return lang;
  return `${KANAL_VARIANTE[area]![k]} ${lang.slice(lang.indexOf(". ") + 2)}`;
}

function joinDe(parts: string[]): string {
  return parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} und ${parts[parts.length - 1]}`;
}

export function buildFallbackPlan(a: ParsedAnswers, contact: { firma: string; name: string }, now: Date): VorabFahrplan {
  const datum = dateFmt.format(now);
  const rc = resultCopy(a);
  const order = schrittOrder(a);

  const programme = new Set(a.programme.map((p) => p.toLowerCase()));
  const tipp = TIPPS.find((t) => t.bereich === order[0] && programme.has(t.programm.toLowerCase()));
  // abgerufen = the day the tip's page was checked by hand, not the PDF date.
  const quellen: Quelle[] = tipp ? [{ n: 1, url: tipp.quelle, abgerufen: tipp.abgerufen }] : [];

  const schritte: Schritt[] = order.map((bereich, i) => ({
    rang: RANG[i],
    bereich,
    titel: AREA_IDEE[bereich].titel,
    idee: i === 0 ? zuerstIdee(bereich, a.kanaele) : AREA_IDEE[bereich].kurz,
    ...(i === 0 && tipp ? { tipp: tipp.text } : {}),
    quellen: i === 0 && tipp ? [1] : [],
  }));

  const kanaele = KANAL_PRIORITY.filter((k) => a.kanaele.includes(k)).map((k) => KANAL_WEG[k]);
  const aufgabeZeile = [kanaele.length ? `kommt ${joinDe(kanaele)} rein` : "", MENGE_ZEILE[a.menge], WER_ZEILE[a.wer]]
    .filter(Boolean)
    .join(" · ");

  const arbeitstag = capText(a.arbeitstag.trim(), LIMITS.arbeitstag);

  return {
    firma: contact.firma,
    name: contact.name,
    datum,
    // Zero hours in total never reaches the PDF (spec §7.2), so the headline is always the hours line.
    stundenZeile: `${rc.headline} · ${nf.format(jahresArbeitstage(rc.totalHours))} Arbeitstage im Jahr`,
    ...(arbeitstag ? { arbeitstag: `„${arbeitstag}“` } : {}),
    zeitVerteilung: rc.topAreas.map((t) => ({ label: t.label, stunden: t.hours, satz: t.sentence })),
    aufgabeZeile,
    schritte,
    programme: [],
    quellen,
    recherchiert: false,
  };
}
