// src/lib/prozessCheck.ts
//
// Pure core for the free /prozess-check funnel. Deterministic, no AI, no €.
// The visitor answers Branche + Team, drags an hours slider for each of five
// repetitive-work areas, then three quick feeling questions. The result mirrors
// his own numbers back: total hours/week + a ranked pain profile. No price ever
// (that is named in the call). Spec: Knowledge/marketing/prozess-check-funnel.md
// Distinct from leadCheck.ts on purpose — that one does € math, this one never does.

export type Branche = "handwerk" | "immobilien" | "reinigung" | "praxis" | "handel" | "anderes";
export type Team = "allein" | "2bis5" | "6bis20" | "ueber20";
export type AreaId = "anfragen" | "auftraege" | "rechnungen" | "daten" | "erinnern" | "orga";
export type Abende = "staendig" | "abundzu" | "nein";
export type Versucht = "nichts" | "toolBrach" | "beauftragt";

export type ProzessCheckAnswers = {
  branche: Branche;
  team: Team;
  stunden: Record<AreaId, number>; // 0..10 per area
  nervt: AreaId;
  abende: Abende;
  versucht: Versucht;
};

// Order is the tie-break order for equal hours.
export const AREA_IDS: readonly AreaId[] = ["anfragen", "auftraege", "rechnungen", "daten", "erinnern", "orga"];

export const AREA_LABEL: Record<AreaId, string> = {
  anfragen: "Anfragen beantworten und Termine ausmachen",
  auftraege: "Aufträge verarbeiten und weiterleiten",
  rechnungen: "Rechnungen, Belege und Mahnungen",
  daten: "Daten aus Mails oder Zetteln in ein System tippen",
  erinnern: "Kunden erinnern und nachfassen",
  orga: "Interne Orga: Zettel, Listen, Zuruf",
};

// A calm, honest sentence per area on what is typically automatable. No promise,
// no €, no vendor name. One water-metaphor concept at most; kept short.
export const AREA_SENTENCE: Record<AreaId, string> = {
  anfragen: "Anfragen lassen sich sofort beantworten und zu einem Termin führen, ohne dass du daneben sitzt.",
  auftraege: "Neue Aufträge landen von selbst als fertige Arbeitsinfo bei der richtigen Person, ohne Ausdrucken und Abtippen.",
  rechnungen: "Belege und Rechnungen lassen sich einlesen, zuordnen und ablegen, statt sie abzutippen.",
  daten: "Daten wandern von selbst von A nach B, sobald eine Mail oder ein Formular reinkommt.",
  erinnern: "Erinnerungen und Nachfass-Nachrichten gehen automatisch raus, zur richtigen Zeit, an die richtige Person.",
  orga: "Wiederkehrende Abläufe laufen im Hintergrund, damit weniger auf Zetteln und im Kopf hängt.",
};

type ChoiceOption<V extends string> = { value: V; label: string };

export type Step =
  | { id: "branche"; kind: "choice"; label: string; options: readonly ChoiceOption<Branche>[] }
  | { id: "team"; kind: "choice"; label: string; options: readonly ChoiceOption<Team>[] }
  | { id: "stunden"; kind: "grid"; label: string; hint: string; max: number }
  | { id: "nervt"; kind: "choice"; label: string; options: readonly ChoiceOption<AreaId>[] }
  | { id: "abende"; kind: "choice"; label: string; options: readonly ChoiceOption<Abende>[] }
  | { id: "versucht"; kind: "choice"; label: string; options: readonly ChoiceOption<Versucht>[] };

export const STEPS: readonly Step[] = [
  {
    id: "branche",
    kind: "choice",
    label: "Was machst du?",
    options: [
      { value: "handwerk", label: "Handwerk" },
      { value: "immobilien", label: "Immobilien" },
      { value: "reinigung", label: "Reinigung oder Dienstleistung" },
      { value: "praxis", label: "Praxis oder Kanzlei" },
      { value: "handel", label: "Handel" },
      { value: "anderes", label: "Etwas anderes" },
    ],
  },
  {
    id: "team",
    kind: "choice",
    label: "Wie groß ist dein Team?",
    options: [
      { value: "allein", label: "Ich allein" },
      { value: "2bis5", label: "2 bis 5" },
      { value: "6bis20", label: "6 bis 20" },
      { value: "ueber20", label: "Mehr als 20" },
    ],
  },
  {
    id: "stunden",
    kind: "grid",
    label: "Wo geht deine Zeit hin?",
    hint: "Schätz für jede Aufgabe grob, wie viele Stunden pro Woche sie dich kostet. Null ist völlig in Ordnung.",
    max: 10,
  },
  {
    id: "nervt",
    kind: "choice",
    label: "Was davon nervt dich am meisten?",
    options: AREA_IDS.map((id) => ({ value: id, label: AREA_LABEL[id] })),
  },
  {
    id: "abende",
    kind: "choice",
    label: "Arbeitest du abends oder am Wochenende offene Aufgaben ab?",
    options: [
      { value: "staendig", label: "Ja, regelmäßig" },
      { value: "abundzu", label: "Ab und zu" },
      { value: "nein", label: "Nein" },
    ],
  },
  {
    id: "versucht",
    kind: "choice",
    label: "Hast du schon versucht, das loszuwerden?",
    options: [
      { value: "nichts", label: "Noch nichts" },
      { value: "toolBrach", label: "Software gekauft, aber halb eingerichtet" },
      { value: "beauftragt", label: "Freelancer oder Agentur beauftragt" },
    ],
  },
];

export function totalHours(a: ProzessCheckAnswers): number {
  return AREA_IDS.reduce((sum, id) => sum + (a.stunden[id] || 0), 0);
}

// Areas by hours descending; equal hours keep AREA_IDS order (stable).
export function rankAreas(a: ProzessCheckAnswers): AreaId[] {
  return [...AREA_IDS].sort((x, y) => (a.stunden[y] || 0) - (a.stunden[x] || 0));
}

export type ResultCopy = {
  totalHours: number;
  /** false only when the visitor reports zero hours everywhere. */
  fits: boolean;
  headline: string;
  sub: string;
  /** Only when fits: the same hours extrapolated to full work days per year. */
  yearLine?: string;
  /** Only when fits: names the arithmetic behind the numbers (honesty, no black box). */
  basis?: string;
  topAreas: { id: AreaId; hours: number; label: string; sentence: string }[];
  nervtLabel: string;
  verdict: string;
};

const nf = new Intl.NumberFormat("de-DE");

export function resultCopy(a: ProzessCheckAnswers): ResultCopy {
  const total = totalHours(a);
  const nervtLabel = AREA_LABEL[a.nervt];

  if (total === 0) {
    return {
      totalHours: 0,
      fits: false,
      headline: "Bei dir frisst gerade nichts nennenswert Zeit.",
      sub: "Das ist ein gutes Zeichen. Wenn sich das ändert und dir eine Aufgabe den Tag frisst, weißt du, wo ich bin.",
      topAreas: [],
      nervtLabel,
      verdict: "Ein Gespräch ist gerade noch nicht nötig.",
    };
  }

  // Top areas that actually carry hours; the visitor's "nervt" pick leads if it
  // ties on hours, otherwise hours decide. Show up to three.
  const ranked = rankAreas(a).filter((id) => (a.stunden[id] || 0) > 0);
  // Bring the "nervt" area to the front when it shares the top hour count.
  const topHours = a.stunden[ranked[0]] || 0;
  if (a.stunden[a.nervt] === topHours && ranked[0] !== a.nervt) {
    ranked.splice(ranked.indexOf(a.nervt), 1);
    ranked.unshift(a.nervt);
  }
  const topAreas = ranked.slice(0, 3).map((id) => ({
    id,
    hours: a.stunden[id] || 0,
    label: AREA_LABEL[id],
    sentence: AREA_SENTENCE[id],
  }));

  // 46 work weeks, 8-hour days: a deliberately plain extrapolation the basis
  // line names out loud, so the bigger number stays the visitor's own arithmetic.
  const jahresTage = Math.round((total * 46) / 8);

  return {
    totalHours: total,
    fits: true,
    headline: total === 1 ? "Rund 1 Stunde pro Woche" : `Rund ${nf.format(total)} Stunden pro Woche`,
    sub:
      total === 1
        ? "geht bei dir in Aufgaben, die sich wiederholen."
        : "gehen bei dir in Aufgaben, die sich wiederholen.",
    yearLine: `Aufs Jahr gerechnet sind das rund ${nf.format(jahresTage)} volle Arbeitstage.`,
    basis: "Gerechnet aus deinen eigenen Angaben, mit 46 Arbeitswochen im Jahr und 8 Stunden pro Arbeitstag.",
    topAreas,
    nervtLabel,
    verdict:
      a.abende === "staendig"
        ? "Und ein Teil davon nimmst du mit nach Hause. Genau da fangen wir an."
        : "Das ist Zeit, die sich zurückholen lässt.",
  };
}

// Static UI copy the components render (components hold no German).
export const RESULT_UI = {
  resultLabel: "Dein Ergebnis",
  profileLabel: "Am meisten kostet dich",
  nervtPrefix: "Du sagst, am meisten nervt dich: ",
  reliefTitle: "Das muss nicht so bleiben.",
  schedulerPrompt:
    "Im kostenlosen Erstgespräch schauen wir uns deine größten Zeitfresser gemeinsam an. 30 Minuten, unverbindlich. Danach weißt du, welche Aufgabe zuerst verschwindet, und du bekommst einen Fahrplan, der dir gehört.",
  schedulerFallbackHint: "Schreib mir so lange einfach über das Kontaktformular.",
  emailLabel: "Ergebnis lieber per Mail?",
  emailIntro: "Ich schick dir deine Auswertung zu, dann hast du sie in Ruhe.",
  exitLead: "Schau dich in Ruhe um. Wenn dich eine Aufgabe doch täglich ausbremst, bin ich da.",
  exitNewsletterPrefix: "Bis dahin: ",
  exitNewsletterLabel: "„Die Quelle“",
  exitNewsletterSuffix: ", mein Newsletter mit einem kleinen Tipp pro Woche, oder stöber im ",
  exitRatgeberLabel: "Ratgeber",
  exitSuffix: ".",
} as const;
