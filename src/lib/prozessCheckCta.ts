// src/lib/prozessCheckCta.ts
//
// The Prozess-Check is the site's front door (spec 2026-09-26,
// docs/superpowers/specs/2026-09-26-prozess-check-front-door-design.md).
// Every primary CTA links to /prozess-check with its own ?src= slug, which the
// page writes into the Cal booking notes and the result e-mail, so each booked
// call shows the button it came from. Components hold no German.

import { normalizeSource } from "@/lib/source";

export const CHECK_SRC = {
  header: "header",
  homeHero: "home-hero",
  homeClose: "home-close",
  homeWeg: "home-weg",
  leistungenAudit: "leistungen-audit",
  leistungenEinwand: "leistungen-einwand",
  leistungenClose: "leistungen-close",
  leistungProzessautomatisierung: "leistung-prozessautomatisierung",
  leistungKiAutomatisierung: "leistung-ki-automatisierung",
  leistungProzessAudit: "leistung-prozess-audit",
  leistungBetreuung: "leistung-betreuung",
  ratgeber: "ratgeber",
  referenzen: "referenzen",
  ueberMich: "ueber-mich",
  faq: "faq",
  kontakt: "kontakt",
  footer: "footer",
  karte: "karte",
  vorlagen: "vorlagen",
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

// Front door since 2026-11-11 (Ajdin): every primary CTA leads to /vorlagen.
// Vorlage, Gespräch and Fahrplan are all free; the Prozess-Check is one of the
// free tools there (spec docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md §3.3).
export function vorlagenHref(src: CheckSrc): string {
  return `/vorlagen?src=${src}`;
}

/** Appends the visitor's ?src= to an internal page link so attribution survives one hop.
 *  Invalid slugs, files and external links are left as they are. */
export function withSrc(href: string, raw: string | null | undefined): string {
  const src = normalizeSource(raw);
  if (!src || !href.startsWith("/") || href.endsWith(".pdf")) return href;
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("src", src);
  return `${path}?${params.toString()}`;
}

export const VORLAGEN_CTA = {
  label: "Kostenlose Vorlagen ansehen",
  short: "Vorlagen",
  microcopy: "Bauplan für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos.",
  // Homepage close only: echoes the free path (DerWeg) at the last decision point.
  closeMicrocopy: "Vorlage, Gespräch und Fahrplan: alles kostenlos.",
  // The quiet second path under a /kontakt button.
  secondaryPrefix: "Noch unsicher?",
  secondaryLabel: "Erst eine kostenlose Vorlage ansehen",
} as const;

export const CHECK_CTA = {
  label: "Prozess-Check starten",
  short: "Prozess-Check",
  microcopy: "Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.",
  // Homepage close only: echoes the free three-step path (DerWeg) at the last decision point.
  closeMicrocopy: "Check, Audit und Fahrplan: alles kostenlos.",
  // The quiet second path under a check button (warm visitors).
  directPrefix: "Lieber direkt reden?",
  directLabel: "Erstgespräch buchen",
  directHref: "/kontakt",
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

