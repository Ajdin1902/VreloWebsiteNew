// src/lib/prozessCheck.ts
//
// Pure core for the free /prozess-check funnel (v2: Vorab-Fahrplan). Deterministic,
// no AI, no €. The visitor picks the areas where he wants help, drags an hours
// slider per picked area, describes his most annoying task, names his programs
// and a few facts about his business. The result mirrors his own numbers back:
// total hours/week + a ranked pain profile. No price ever (that is named in the
// call). Spec: docs/superpowers/specs/2026-11-23-prozess-check-v2-vorab-fahrplan-design.md
// Distinct from leadCheck.ts on purpose: that one does € math, this one never does.

export type Branche = "handwerk" | "immobilien" | "reinigung" | "agentur" | "handel" | "anderes";
export type Team = "allein" | "2bis5" | "6bis20" | "ueber20";
export type AreaId = "anfragen" | "angebote" | "auftraege" | "rechnungen" | "postfach" | "daten" | "erinnern" | "orga";
export type Abende = "staendig" | "abundzu" | "nein";
export type Versucht = "nichts" | "toolBrach" | "beauftragt";
export type Kanal = "telefon" | "mail" | "formular" | "whatsapp" | "portal" | "papier";
export type Menge = "bis5" | "5bis20" | "20bis50" | "mehr";
export type Wer = "ich" | "buero" | "alle";
export type Arbeitsort = "buero" | "unterwegs" | "beides";

export type ProzessCheckAnswers = {
  bereiche: AreaId[]; // at least one
  stunden: Partial<Record<AreaId, number>>; // 0..10, only picked areas count
  nervt: AreaId; // one of bereiche
  kanaele: Kanal[];
  menge: Menge;
  wer: Wer;
  // Raw program input: picked chips + the free text. The merged, capped list is
  // built server-side (ParsedAnswers).
  programmeChips: string[];
  programmeText: string;
  arbeitstag: string; // optional free text, ~500 chars
  abende: Abende;
  versucht: Versucht;
  branche: Branche;
  team: Team;
  arbeitsort: Arbeitsort;
  website?: string;
};

/** Server-side shape: the raw program input merged, deduped and capped to a list. */
export type ParsedAnswers = ProzessCheckAnswers & { programme: string[] };

// Order is the tie-break order for equal hours.
export const AREA_IDS: readonly AreaId[] = [
  "anfragen",
  "angebote",
  "auftraege",
  "rechnungen",
  "postfach",
  "daten",
  "erinnern",
  "orga",
];

// Display and tie-break priority of the intake channels (the first one named wins).
export const KANAL_PRIORITY: readonly Kanal[] = ["mail", "formular", "whatsapp", "telefon", "portal", "papier"];

// COPY: Ajdin approves
export const AREA_LABEL: Record<AreaId, string> = {
  anfragen: "Anfragen beantworten und Termine ausmachen",
  angebote: "Angebote schreiben und nachfassen",
  auftraege: "Aufträge verarbeiten und weiterleiten",
  rechnungen: "Rechnungen, Belege und Mahnungen",
  postfach: "Das E-Mail-Postfach",
  daten: "Daten aus Mails oder Zetteln in ein System tippen",
  erinnern: "Kunden erinnern und nachfassen",
  orga: "Interne Orga: Zettel, Listen, Zuruf",
};

// A calm, honest sentence per area on what is typically automatable. No promise,
// no €, no vendor name. One water-metaphor concept at most; kept short.
// COPY: Ajdin approves (angebote, postfach)
export const AREA_SENTENCE: Record<AreaId, string> = {
  anfragen: "Anfragen lassen sich sofort beantworten und zu einem Termin führen, ohne dass du daneben sitzt.",
  angebote: "Angebote entstehen als Entwurf aus deinen Angaben. Das Nachfassen läuft zur richtigen Zeit von selbst.",
  auftraege: "Neue Aufträge landen von selbst als fertige Arbeitsinfo bei der richtigen Person, ohne Ausdrucken und Abtippen.",
  rechnungen: "Belege und Rechnungen lassen sich einlesen, zuordnen und ablegen, statt sie abzutippen.",
  postfach: "Dein Postfach sortiert sich vor. Zu den Mails, die Arbeit machen, liegt ein Antwortentwurf bereit.",
  daten: "Daten wandern von selbst von A nach B, sobald eine Mail oder ein Formular reinkommt.",
  erinnern: "Erinnerungen und Nachfass-Nachrichten gehen automatisch raus, zur richtigen Zeit, an die richtige Person.",
  orga: "Wiederkehrende Abläufe laufen im Hintergrund, damit weniger auf Zetteln und im Kopf hängt.",
};

// Max 12 chips (spec §4.5).
// COPY: Ajdin approves
export const PROGRAMM_CHIPS: readonly string[] = [
  "Outlook",
  "Gmail",
  "Excel",
  "Google Kalender",
  "WhatsApp",
  "Lexoffice",
  "sevDesk",
  "DATEV",
  "Word",
  "Google Drive",
  "Notion",
  "Papier und Zettel",
];

type ChoiceOption<V extends string> = { value: V; label: string };

export type StepId =
  | "intro"
  | "bereiche"
  | "stunden"
  | "nervt"
  | "aufgabe"
  | "programme"
  | "arbeitstag"
  | "abende"
  | "versucht"
  | "branche"
  | "team"
  | "arbeitsort"
  | "website";

export type Step =
  | { id: "intro"; kind: "intro"; title: string; text: string; cta: string; privacy: string }
  | { id: "bereiche"; kind: "multi"; label: string; hint: string; options: readonly ChoiceOption<AreaId>[] }
  | { id: "stunden"; kind: "grid"; label: string; hint: string; max: number }
  | { id: "nervt"; kind: "choice"; label: string; options: readonly ChoiceOption<AreaId>[] }
  | {
      id: "aufgabe";
      kind: "aufgabe";
      label: string;
      kanalLabel: string;
      kanaele: readonly ChoiceOption<Kanal>[];
      mengeLabel: string;
      menge: readonly ChoiceOption<Menge>[];
      werLabel: string;
      wer: readonly ChoiceOption<Wer>[];
    }
  | {
      id: "programme";
      kind: "programme";
      label: string;
      chips: readonly string[];
      textLabel: string;
      textHint: string;
      maxTotal: number;
    }
  | { id: "arbeitstag"; kind: "text"; label: string; hint: string; maxLength: number }
  | { id: "abende"; kind: "choice"; label: string; options: readonly ChoiceOption<Abende>[] }
  | { id: "versucht"; kind: "choice"; label: string; options: readonly ChoiceOption<Versucht>[] }
  | { id: "branche"; kind: "choice"; label: string; options: readonly ChoiceOption<Branche>[] }
  | { id: "team"; kind: "choice"; label: string; options: readonly ChoiceOption<Team>[] }
  | { id: "arbeitsort"; kind: "choice"; label: string; options: readonly ChoiceOption<Arbeitsort>[] }
  | { id: "website"; kind: "url"; label: string; hint: string };

// COPY: Ajdin approves
export const STEPS: readonly Step[] = [
  {
    id: "intro",
    kind: "intro",
    title: "Dein Vorab-Fahrplan in 5 Minuten",
    text: "Je genauer du antwortest, desto konkreter wird dein Fahrplan. Du bekommst ihn als PDF per Mail.",
    cta: "Los geht's",
    privacy: "Deine Antworten bleiben in deinem Browser, bis du das PDF anforderst.",
  },
  {
    id: "bereiche",
    kind: "multi",
    label: "Wo möchtest du Hilfe?",
    hint: "Such dir aus, was dich Zeit kostet. Mehrere sind möglich.",
    options: AREA_IDS.map((id) => ({ value: id, label: AREA_LABEL[id] })),
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
    label: "Was nervt am meisten?",
    options: AREA_IDS.map((id) => ({ value: id, label: AREA_LABEL[id] })),
  },
  {
    id: "aufgabe",
    kind: "aufgabe",
    label: "Die nervigste Aufgabe, genauer",
    kanalLabel: "Wie kommt das rein?",
    kanaele: [
      { value: "telefon", label: "Telefon" },
      { value: "mail", label: "Mail" },
      { value: "formular", label: "Formular" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "portal", label: "Portal" },
      { value: "papier", label: "Papier" },
    ],
    mengeLabel: "Wie oft pro Woche?",
    menge: [
      { value: "bis5", label: "Bis 5" },
      { value: "5bis20", label: "5 bis 20" },
      { value: "20bis50", label: "20 bis 50" },
      { value: "mehr", label: "Mehr" },
    ],
    werLabel: "Wer macht das?",
    wer: [
      { value: "ich", label: "Ich selbst" },
      { value: "buero", label: "Das Büro" },
      { value: "alle", label: "Jeder ein bisschen" },
    ],
  },
  {
    id: "programme",
    kind: "programme",
    label: "Womit arbeitest du?",
    chips: PROGRAMM_CHIPS,
    textLabel: "Was noch?",
    textHint: "Schreib die Namen mit Komma getrennt.",
    maxTotal: 8,
  },
  {
    id: "arbeitstag",
    kind: "text",
    label: "Dein Arbeitstag",
    hint: "Optional: Beschreib kurz, wie ein normaler Tag bei dir läuft.",
    maxLength: 500,
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
  {
    id: "branche",
    kind: "choice",
    label: "Was machst du?",
    options: [
      { value: "handwerk", label: "Handwerk" },
      { value: "immobilien", label: "Immobilien" },
      { value: "reinigung", label: "Reinigung oder Dienstleistung" },
      { value: "agentur", label: "Agentur oder Beratung" },
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
    id: "arbeitsort",
    kind: "choice",
    label: "Wo arbeitest du meistens?",
    options: [
      { value: "buero", label: "Im Büro" },
      { value: "unterwegs", label: "Unterwegs, auf der Baustelle, beim Kunden" },
      { value: "beides", label: "Beides" },
    ],
  },
  {
    id: "website",
    kind: "url",
    label: "Deine Website",
    hint: "Dann schaue ich sie mir für deinen Fahrplan an.",
  },
];

/** Steps the visitor actually sees: `nervt` only makes sense with two or more areas. */
export function activeSteps(a: Partial<ProzessCheckAnswers>): Step[] {
  const multiple = (a.bereiche?.length ?? 0) >= 2;
  return STEPS.filter((s) => s.id !== "nervt" || multiple);
}

/** Question steps (no intro) when `nervt` is shown: the count the public copy promises. */
export const QUESTION_COUNT: number = STEPS.filter((s) => s.id !== "intro").length;

export function totalHours(a: Pick<ProzessCheckAnswers, "bereiche" | "stunden">): number {
  return a.bereiche.reduce((sum, id) => sum + (a.stunden[id] || 0), 0);
}

// Picked areas by hours descending; equal hours keep AREA_IDS order (stable).
export function rankAreas(a: Pick<ProzessCheckAnswers, "bereiche" | "stunden">): AreaId[] {
  return AREA_IDS.filter((id) => a.bereiche.includes(id)).sort((x, y) => (a.stunden[y] || 0) - (a.stunden[x] || 0));
}

/** „1 Stunde“ / „4 Stunden“: shared by the result screen and the homepage example. */
export function hoursLabel(n: number): string {
  return n === 1 ? "1 Stunde" : `${n} Stunden`;
}

// 46 work weeks, 8-hour days: a deliberately plain extrapolation the basis
// line names out loud, so the bigger number stays the visitor's own arithmetic.
export function jahresArbeitstage(hoursPerWeek: number): number {
  return Math.round((hoursPerWeek * 46) / 8);
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
  if (a.bereiche.includes(a.nervt) && a.stunden[a.nervt] === topHours && ranked[0] !== a.nervt) {
    ranked.splice(ranked.indexOf(a.nervt), 1);
    ranked.unshift(a.nervt);
  }
  const topAreas = ranked.slice(0, 3).map((id) => ({
    id,
    hours: a.stunden[id] || 0,
    label: AREA_LABEL[id],
    sentence: AREA_SENTENCE[id],
  }));

  const jahresTage = jahresArbeitstage(total);

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
  // The form is the primary CTA (spec §5); Cal.com is the secondary link. The
  // Fahrplan is always part of the free path since Ajdin 2026-11-12, no condition.
  // COPY: Ajdin approves (formTitle, calSecondary, success)
  formTitle: "Lass dir deinen Vorab-Fahrplan als PDF schicken. Darin steht, wo ich bei dir anfangen würde.",
  calSecondary: "Lieber gleich einen Termin?",
  // Plan 1 sends the fallback PDF right away; spec §6 wording („Ich recherchiere …“) waits for Plan 2.
  success: "Danke. Dein Vorab-Fahrplan ist unterwegs.",
  exitLead: "Schau dich in Ruhe um. Wenn dich eine Aufgabe doch täglich ausbremst, bin ich da.",
  exitNewsletterPrefix: "Bis dahin: ",
  exitNewsletterLabel: "„Die Quelle“",
  exitNewsletterSuffix: ", mein Newsletter mit einem kleinen Tipp pro Woche, oder stöber im ",
  exitRatgeberLabel: "Ratgeber",
  exitSuffix: ".",
  // COPY: Ajdin approves
  privacyLine: "Deine Antworten bleiben in deinem Browser, bis du dir den Vorab-Fahrplan schicken lässt.",
} as const;

// Wizard chrome (buttons, progress line). COPY: Ajdin approves
export const WIZARD_UI = {
  next: "Weiter",
  skip: "Überspringen",
  back: "← Zurück",
  progress: (n: number, total: number) => `Frage ${n} von ${total}`,
} as const;
