// src/lib/leadCheck.ts

export type Reaktionszeit = "unter5min" | "unter1std" | "selberTag" | "1bis2tage" | "wennZeit";
export type AbendsWochenende = "immer" | "manchmal" | "nein";
export type ImTermin = "automatisch" | "wartet" | "gehtUnter";
export type Nachfassen = "mehrmals" | "einmal" | "selten" | "nie";

export type LeadCheckAnswers = {
  anfragenProWoche: number;
  reaktionszeit: Reaktionszeit;
  abendsWochenende: AbendsWochenende;
  imTermin: ImTermin;
  nachfassen: Nachfassen;
  provision?: number;
};

export const DEFAULT_PROVISION = 4000;

type ChoiceOption<V extends string> = { value: V; label: string };

export type Step =
  | { id: "anfragenProWoche"; kind: "number"; label: string; placeholder: string; min: number }
  | {
      id: "provision";
      kind: "number";
      label: string;
      placeholder: string;
      min: number;
      optional: true;
      hint: string;
    }
  | { id: "reaktionszeit"; kind: "choice"; label: string; options: readonly ChoiceOption<Reaktionszeit>[] }
  | { id: "abendsWochenende"; kind: "choice"; label: string; options: readonly ChoiceOption<AbendsWochenende>[] }
  | { id: "imTermin"; kind: "choice"; label: string; options: readonly ChoiceOption<ImTermin>[] }
  | { id: "nachfassen"; kind: "choice"; label: string; options: readonly ChoiceOption<Nachfassen>[] };

export const STEPS: readonly Step[] = [
  {
    id: "anfragenProWoche",
    kind: "number",
    label: "Wie viele Anfragen bekommst du im Schnitt pro Woche?",
    placeholder: "z. B. 10",
    min: 0,
  },
  {
    id: "reaktionszeit",
    kind: "choice",
    label: "Wie schnell antwortest du typischerweise auf eine neue Anfrage?",
    options: [
      { value: "unter5min", label: "unter 5 Minuten" },
      { value: "unter1std", label: "unter 1 Stunde" },
      { value: "selberTag", label: "am selben Tag" },
      { value: "1bis2tage", label: "1 bis 2 Tage" },
      { value: "wennZeit", label: "wenn ich dazu komme" },
    ],
  },
  {
    id: "abendsWochenende",
    kind: "choice",
    label: "Bekommt eine Anfrage auch abends und am Wochenende eine Antwort?",
    options: [
      { value: "immer", label: "immer" },
      { value: "manchmal", label: "manchmal" },
      { value: "nein", label: "nein" },
    ],
  },
  {
    id: "imTermin",
    kind: "choice",
    label: "Was passiert mit einer Anfrage, während du im Termin sitzt?",
    options: [
      { value: "automatisch", label: "wird automatisch beantwortet" },
      { value: "wartet", label: "wartet, bis ich Zeit habe" },
      { value: "gehtUnter", label: "geht manchmal unter" },
    ],
  },
  {
    id: "nachfassen",
    kind: "choice",
    label: "Wie oft fasst du bei jemandem nach, der sich nicht meldet?",
    options: [
      { value: "mehrmals", label: "mehrmals, systematisch" },
      { value: "einmal", label: "einmal" },
      { value: "selten", label: "selten" },
      { value: "nie", label: "nie" },
    ],
  },
  {
    id: "provision",
    kind: "number",
    label: "Was ist dir ein abgeschlossener Kunde im Schnitt wert?",
    placeholder: "4000",
    min: 0,
    optional: true,
    hint: "Lässt du das Feld leer, rechnen wir mit 4.000 € pro Abschluss. Ist dein Schnitt anders? Hier anpassen.",
  },
];

// --- scoring model (append to src/lib/leadCheck.ts) ---

export type Score = "schnell" | "solide" | "langsam";

export type LeadCheckResult = {
  currentLossPct: number;
  score: Score;
  anfragenProJahr: number;
  verloreneAnfragenProJahr: number;
  /** Lost inquiries a faster reply could in principle address (loss above the floor). */
  adressierbareAnfragen: number;
  /** Of those, the share that realistically comes back as a booked appointment. */
  recoverableTermine: number;
  zusaetzlicheAbschluesse: number;
  eurUpside: number;
  provisionUsed: number;
  provisionWasDefault: boolean;
};

// The chain, and why each link is what it is. These four constants are the whole
// commercial claim of this page, so they are named, exported and reasoned about
// here rather than buried in the arithmetic.
//
// ACHIEVABLE_LOSS — no system reaches 0 % loss; some inquiries are never real.
// RECOVERY_RATE   — of the inquiries currently lost *above* that floor, the share
//   a sub-5-minute reply actually brings back to a booked appointment. This is
//   the constant the 2026-08-08 Rams audit added. Before it, the model implicitly
//   assumed **every** addressable lost inquiry returns, which produced 156 extra
//   closings / 624.000 € for a solo broker at 20 inquiries/week — a promise no
//   undelivered product can carry, and the fastest way to lose a sceptical reader
//   in a word-of-mouth market. 0.3 is a deliberate underclaim: it says a faster
//   reply wins back roughly one in three of the leads speed is costing today.
// CLOSE_RATE      — appointment → signed. 1 in 5 is a normal broker figure and is
//   the one number already disclosed to the reader („jeder fünfte").
export const ACHIEVABLE_LOSS = 0.1;
export const RECOVERY_RATE = 0.3;
export const CLOSE_RATE = 0.2;
const MAX_ANFRAGEN = 200;
const MIN_PROVISION = 100;
const MAX_PROVISION = 1_000_000;

const BASE_LOSS: Record<Reaktionszeit, number> = {
  unter5min: 0.1,
  unter1std: 0.25,
  selberTag: 0.4,
  "1bis2tage": 0.6,
  wennZeit: 0.75,
};
const ABENDS_MOD: Record<AbendsWochenende, number> = { immer: 0, manchmal: 0.05, nein: 0.1 };
const TERMIN_MOD: Record<ImTermin, number> = { automatisch: 0, wartet: 0.05, gehtUnter: 0.1 };
const NACHFASS_MOD: Record<Nachfassen, number> = { mehrmals: -0.1, einmal: 0, selten: 0.05, nie: 0.1 };

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function computeResult(a: LeadCheckAnswers): LeadCheckResult {
  const anfragenWoche = clamp(Number.isFinite(a.anfragenProWoche) ? a.anfragenProWoche : 0, 0, MAX_ANFRAGEN);
  const provisionWasDefault = a.provision == null || !Number.isFinite(a.provision);
  const provisionUsed = provisionWasDefault
    ? DEFAULT_PROVISION
    : clamp(a.provision as number, MIN_PROVISION, MAX_PROVISION);

  const rawLoss =
    BASE_LOSS[a.reaktionszeit] + ABENDS_MOD[a.abendsWochenende] + TERMIN_MOD[a.imTermin] + NACHFASS_MOD[a.nachfassen];
  const currentLoss = clamp(rawLoss, 0.1, 0.85);

  const anfragenProJahr = Math.round(anfragenWoche * 52);
  const verloreneAnfragenProJahr = Math.round(anfragenProJahr * currentLoss);
  const recoverableShare = Math.max(0, currentLoss - ACHIEVABLE_LOSS);
  const adressierbareAnfragen = Math.round(anfragenProJahr * recoverableShare);
  const recoverableTermine = Math.round(adressierbareAnfragen * RECOVERY_RATE);
  const zusaetzlicheAbschluesse = Math.round(recoverableTermine * CLOSE_RATE);
  const eurUpside = zusaetzlicheAbschluesse * provisionUsed;

  const score: Score = currentLoss <= 0.2 ? "schnell" : currentLoss <= 0.45 ? "solide" : "langsam";

  return {
    currentLossPct: Math.round(currentLoss * 100),
    score,
    anfragenProJahr,
    verloreneAnfragenProJahr,
    adressierbareAnfragen,
    recoverableTermine,
    zusaetzlicheAbschluesse,
    eurUpside,
    provisionUsed,
    provisionWasDefault,
  };
}
