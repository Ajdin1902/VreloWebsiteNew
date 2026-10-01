// src/lib/prozessCheckCta.ts
//
// The Prozess-Check is the site's front door (spec 2026-09-26,
// docs/superpowers/specs/2026-09-26-prozess-check-front-door-design.md).
// Every primary CTA links to /prozess-check with its own ?src= slug, which the
// page writes into the Cal booking notes and the result e-mail, so each booked
// call shows the button it came from. Components hold no German.

export const CHECK_SRC = {
  header: "header",
  homeHero: "home-hero",
  homeClose: "home-close",
  leistungenAudit: "leistungen-audit",
  leistungenEinwand: "leistungen-einwand",
  leistungenClose: "leistungen-close",
  leistungenHero: "leistungen-hero",
  leistungProzessautomatisierung: "leistung-prozessautomatisierung",
  leistungKiAutomatisierung: "leistung-ki-automatisierung",
  leistungKiServer: "leistung-ki-server",
  leistungClaude: "leistung-claude",
  leistungKiSchulung: "leistung-ki-schulung",
  leistungKiBeratung: "leistung-ki-beratung",
  leistungBetreuung: "leistung-betreuung",
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

// The Erstgespräch twin of checkHref: /kontakt reads ?src= on the client and
// writes it into the Cal booking notes, so a call booked from a subpage whose
// primary button is the Erstgespräch stays attributable (spec 2026-10-01 §5).
export function kontaktHref(src: CheckSrc): string {
  return `/kontakt?src=${src}`;
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

// The question count is promised in the FAQ, spelled from STEPS.length there, so adding or removing a quiz step can never leave a stale
// number in public copy (UWG §5).
const NUMBER_WORDS = ["null", "eine", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"];

export function questionCountPhrase(n: number): string {
  const word = NUMBER_WORDS[n] ?? String(n);
  return n === 1 ? `${word} kurze Frage` : `${word} kurze Fragen`;
}

