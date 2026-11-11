// src/lib/garantie.ts
//
// The 2-week first-result guarantee (Ajdin 2026-11-11, spec
// docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md §3.1).
// One source for the hero, the homepage Proof card and the FAQ, so the promise
// and its conditions can never drift apart (UWG §5). The Elektro offer and the
// Agentur-Paket keep their own guarantees.
export const GARANTIE = {
  hero: "Erste Ergebnisse nach 2 Wochen, sonst bekommst du dein Geld zurück.",
  titel: "Erste Ergebnisse in 2 Wochen. Sonst Geld zurück.",
  text: "Im Angebot steht die Liste deiner Anforderungen. Der erste Punkt läuft zwei Wochen nach dem Onboarding. Wenn nicht, bekommst du alles zurück, was du bis dahin gezahlt hast.",
  faqFrage: "Wie funktioniert die Garantie?",
  // Link from the Proof card to the conditions (final review 2026-11-11, UWG §5).
  faqLink: "So funktioniert die Garantie",
  faqAntwort:
    "Im Angebot steht die Liste deiner Anforderungen. Der erste Punkt läuft zwei Wochen nach dem Onboarding. Die zwei Wochen beginnen, sobald ich alle Zugänge habe. Warte ich auf etwas von dir, etwa Daten oder eine Antwort, ruht die Frist so lange. Läuft der erste Punkt dann nicht, baue ich alles sauber zurück. Du bekommst alles zurück, was du bis dahin gezahlt hast. Das gilt für jeden Bau, dem der kostenlose Prozess-Audit vorausging. Nach der Übergabe folgen 14 Tage Feinschliff: Ich justiere nach, eine Erstattung gehört nicht dazu.",
} as const;
