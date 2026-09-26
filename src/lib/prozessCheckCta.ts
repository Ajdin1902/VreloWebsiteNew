// src/lib/prozessCheckCta.ts
//
// The Prozess-Check is the site's front door (spec 2026-09-26,
// docs/superpowers/specs/2026-09-26-prozess-check-front-door-design.md).
// Every primary CTA links to /prozess-check with its own ?src= slug, which the
// page writes into the Cal booking notes and the result e-mail, so each booked
// call shows the button it came from. Components hold no German.
import { STEPS, type ProzessCheckAnswers } from "@/lib/prozessCheck";

export const CHECK_SRC = {
  header: "header",
  homeHero: "home-hero",
  homeCheck: "home-check",
  homeClose: "home-close",
  leistungenAudit: "leistungen-audit",
  leistungenEinwand: "leistungen-einwand",
  leistungenClose: "leistungen-close",
  ratgeber: "ratgeber",
  ueberMich: "ueber-mich",
  faq: "faq",
  kontakt: "kontakt",
  footer: "footer",
  karte: "karte",
} as const;

export type CheckSrc = (typeof CHECK_SRC)[keyof typeof CHECK_SRC];

export function checkHref(src: CheckSrc): string {
  return `/prozess-check?src=${src}`;
}

export const CHECK_CTA = {
  label: "Prozess-Check starten",
  short: "Prozess-Check",
  microcopy: "Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.",
  // The quiet second path under a check button (warm visitors).
  directPrefix: "Lieber direkt reden?",
  directLabel: "Erstgespräch buchen",
  directHref: "/kontakt",
  // The quiet second path under a /kontakt button (the FAQ exception).
  checkPrefix: "Noch unsicher?",
  checkLabel: "Erst den Prozess-Check machen",
  // One line above the scheduler on /kontakt.
  kontaktHintPrefix: "Noch unsicher, ob sich ein Gespräch lohnt?",
  kontaktHintLink: "Der Prozess-Check",
  kontaktHintSuffix: "zeigt es dir in drei Minuten.",
} as const;

// The question count is promised on the homepage and in the FAQ. Both spell it
// from STEPS.length, so adding or removing a quiz step can never leave a stale
// number in public copy (UWG §5).
const NUMBER_WORDS = ["null", "eine", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"];

export function questionCountPhrase(n: number): string {
  const word = NUMBER_WORDS[n] ?? String(n);
  return n === 1 ? `${word} kurze Frage` : `${word} kurze Fragen`;
}

const countPhrase = questionCountPhrase(STEPS.length);

export const CHECK_TEASER = {
  eyebrow: "Der Prozess-Check",
  heading: "Wie viele Stunden sind es bei dir?",
  steps: [
    {
      title: countPhrase.charAt(0).toUpperCase() + countPhrase.slice(1),
      text: "Kein Login, nichts vorzubereiten. Du schätzt, ich rechne.",
    },
    {
      title: "Dein Ergebnis sofort",
      text: "Deine Stunden pro Woche und die Aufgabe, die dich am meisten kostet. Direkt auf dem Bildschirm, ohne E-Mail-Adresse.",
    },
    {
      title: "Wenn du willst: 30 Minuten mit mir",
      text: "Wir klären, welche Aufgabe ein System übernehmen kann. Lohnt sich etwas, bekommst du in ein bis zwei Tagen einen Fahrplan. Kostenlos, und er gehört dir. Auf Wunsch baue ich ihn dir, und die Arbeit läuft von selbst.",
    },
  ],
  exampleLabel: "Beispiel",
  exampleNote: "So sieht dein Ergebnis aus, gerechnet aus deinen eigenen Angaben.",
} as const;

// Fixed answers behind the homepage example card. Run through the real
// resultCopy(), so the preview always matches the live result screen.
export const SAMPLE_ANSWERS: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "2bis5",
  stunden: { anfragen: 3, auftraege: 0, rechnungen: 4, daten: 2, erinnern: 0, orga: 0 },
  nervt: "rechnungen",
  abende: "abundzu",
  versucht: "nichts",
};
