// src/lib/prozessCheck.ts
//
// Pure core for the /prozess-check qualification quiz. Deterministic, no AI, no
// numbers in the result. Five pain-surfacing questions categorize the visitor
// (A/B/C/D); the result gives an honest fit verdict for Der Prozess-Audit.
// Distinct from leadCheck.ts on purpose - no € scoring here.
// Design: docs/superpowers/specs/2026-08-12-prozess-check-quiz-design.md

export type Aufgabe = "anfragen" | "termine" | "angebote" | "nachfassen" | "daten" | "nachrichten";
export type Zeit = "unter1" | "1bis3" | "3bis5" | "ueber5";
export type Konsequenz = "liegen" | "termine" | "warten" | "nichts";
export type Abende = "staendig" | "abundzu" | "nein";
export type Versucht = "toolBrach" | "gebastelt" | "garnicht" | "laeuft";

export type ProzessCheckAnswers = {
  aufgabe: Aufgabe;
  zeit: Zeit;
  konsequenz: Konsequenz;
  abende: Abende;
  versucht: Versucht;
};

type ChoiceOption<V extends string> = { value: V; label: string };

export type Step =
  | { id: "aufgabe"; label: string; options: readonly ChoiceOption<Aufgabe>[] }
  | { id: "zeit"; label: string; options: readonly ChoiceOption<Zeit>[] }
  | { id: "konsequenz"; label: string; options: readonly ChoiceOption<Konsequenz>[] }
  | { id: "abende"; label: string; options: readonly ChoiceOption<Abende>[] }
  | { id: "versucht"; label: string; options: readonly ChoiceOption<Versucht>[] };

export const STEPS: readonly Step[] = [
  {
    id: "aufgabe",
    label: "Welche Aufgabe machst du gefühlt jede Woche immer und immer wieder?",
    options: [
      { value: "anfragen", label: "Anfragen beantworten und qualifizieren" },
      { value: "termine", label: "Termine ausmachen und hin- und herschieben" },
      { value: "angebote", label: "Angebote und Rechnungen schreiben" },
      { value: "nachfassen", label: "Hinterhertelefonieren und nachfassen" },
      { value: "daten", label: "Dieselben Daten von A nach B tippen" },
      { value: "nachrichten", label: "Immer die gleichen Nachrichten beantworten" },
    ],
  },
  {
    id: "zeit",
    label: "Wie viel Zeit frisst diese eine Sache – ehrlich geschätzt – pro Woche?",
    options: [
      { value: "unter1", label: "unter 1 Stunde" },
      { value: "1bis3", label: "1 bis 3 Stunden" },
      { value: "3bis5", label: "3 bis 5 Stunden" },
      { value: "ueber5", label: "mehr als 5 Stunden" },
    ],
  },
  {
    id: "konsequenz",
    label: "Und wenn du mal nicht hinterherkommst – was passiert dann?",
    options: [
      { value: "liegen", label: "Anfragen bleiben liegen oder springen ab" },
      { value: "termine", label: "Termine verrutschen oder gehen unter" },
      { value: "warten", label: "Kunden warten länger, als mir lieb ist" },
      { value: "nichts", label: "Nichts geht verloren, es kostet mich nur Zeit" },
    ],
  },
  {
    id: "abende",
    label: "Nimmst du solche Aufgaben abends oder am Wochenende mit nach Hause?",
    options: [
      { value: "staendig", label: "Ja, ständig" },
      { value: "abundzu", label: "Ab und zu" },
      { value: "nein", label: "Nein, das lasse ich im Betrieb" },
    ],
  },
  {
    id: "versucht",
    label: "Hast du schon versucht, das loszuwerden?",
    options: [
      { value: "toolBrach", label: "Ein Tool gekauft, aber es liegt brach" },
      { value: "gebastelt", label: "Selbst etwas gebastelt, hält aber nicht" },
      { value: "garnicht", label: "Noch nicht, ich weiß nicht, wo ich anfangen soll" },
      { value: "laeuft", label: "Läuft schon teilweise automatisch" },
    ],
  },
];

export type Category = "A" | "B" | "C" | "D";

const ZEIT_PTS: Record<Zeit, number> = { unter1: 0, "1bis3": 1, "3bis5": 2, ueber5: 3 };
const KONSEQUENZ_PTS: Record<Konsequenz, number> = { liegen: 1, termine: 1, warten: 1, nichts: 0 };
const ABENDE_PTS: Record<Abende, number> = { staendig: 2, abundzu: 1, nein: 0 };

export function severity(a: ProzessCheckAnswers): number {
  return ZEIT_PTS[a.zeit] + KONSEQUENZ_PTS[a.konsequenz] + ABENDE_PTS[a.abende];
}

// Order matters: "already automating" overrides severity (engagement is the
// signal → optimization, not a fresh build). Otherwise severity buckets:
// 0 → D (too small), 1-2 → B (moderate), >=3 → A (clear).
export function categorize(a: ProzessCheckAnswers): Category {
  if (a.versucht === "laeuft") return "C";
  const s = severity(a);
  if (s === 0) return "D";
  if (s >= 3) return "A";
  return "B";
}
