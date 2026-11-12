// src/lib/garantie.ts
//
// The 2-week first-result guarantee (Ajdin 2026-11-11, spec
// docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md §3.1).
// One source for the homepage Proof card, the Leistungen pages and the FAQ, so the promise
// and its conditions can never drift apart (UWG §5). The Elektro offer and the
// Agentur-Paket keep their own guarantees.
export const GARANTIE = {
  titel: "Erste Ergebnisse in 2 Wochen. Sonst Geld zurück.",
  text: "Im Angebot steht die Liste deiner Anforderungen. Der erste Punkt läuft zwei Wochen nach dem Onboarding. Wenn nicht, bekommst du alles zurück, was du bis dahin gezahlt hast.",
  faqFrage: "Wie funktioniert die Garantie?",
  // Link from the Proof card to the conditions (final review 2026-11-11, UWG §5).
  faqLink: "So funktioniert die Garantie",
  // FAQ bullets (Ajdin 2026-11-12: every FAQ answer is a short list).
  faqAntwort: [
    "Im Angebot steht die Liste deiner Anforderungen",
    "Der erste Punkt läuft zwei Wochen nach dem Onboarding",
    "Die zwei Wochen beginnen, sobald ich alle Zugänge habe",
    "Warte ich auf etwas von dir, etwa Daten oder eine Antwort, ruht die Frist",
    "Läuft der erste Punkt dann nicht, bekommst du alles zurück, was du bis dahin gezahlt hast",
    "Gilt für jeden Bau nach dem kostenlosen Prozess-Audit",
    "Danach 14 Tage Feinschliff, ohne Erstattung",
  ],
} as const;
