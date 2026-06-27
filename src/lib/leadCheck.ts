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
      defaultValue: number;
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
      { value: "1bis2tage", label: "1–2 Tage" },
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
    defaultValue: DEFAULT_PROVISION,
    hint: "Wir rechnen mit dem Branchenschnitt. Ist dein Schnitt anders? Hier anpassen.",
  },
];
