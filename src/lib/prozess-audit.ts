// Public, price-free copy for the "Der Prozess-Audit" card on /leistungen.
// Since 2026-08-31 the audit is FREE, fed by the /prozess-check questionnaire
// (Prozess-Check-Funnel). The Fahrplan is price-free and travels; the price is
// named only in the call (HQ §4). No €499, no money-back guarantee, no handbook
// business-case line — those retired with the paid tripwire. Spec:
// Knowledge/marketing/prozess-check-funnel.md
export type ProzessAudit = {
  label: string;
  heading: string;
  body: string;
  deliverableLabel: string;
  deliverables: string[];
  keepNote: string;
  guarantee: string; // repurposed: price-free reassurance, not a money-back line
  cta: { label: string; href: string };
  check: { label: string; href: string };
};

export const prozessAudit: ProzessAudit = {
  label: "Nicht sicher, wo du anfangen sollst?",
  heading: "Der Prozess-Audit: Ich finde die eine Aufgabe, die dich am meisten kostet.",
  body: "Du merkst, dass Zeit und Anfragen durchrutschen, aber nicht genau wo. Wir sprechen 30 Minuten, kostenlos, und danach bekommst du einen Fahrplan: was sich bei dir automatisieren lässt und in welcher Reihenfolge. Der Fahrplan gehört dir. Ob du ihn selbst umsetzt, umsetzen lässt oder mit mir baust, entscheidest du danach.",
  deliverableLabel: "Das bekommst du",
  deliverables: [
    "Ein 30-minütiges Gespräch, in dem wir deine Abläufe durchgehen",
    "Deine Aufgaben, nach dem sortiert, was dich am meisten Zeit kostet",
    "Einen Fahrplan: welche Automatisierung zuerst, in welchen Schritten",
    "Eine klare Empfehlung für den ersten Schritt",
  ],
  keepNote: "Der Fahrplan gehört dir. Du kannst ihn selbst umsetzen, umsetzen lassen oder mit mir bauen.",
  guarantee: "Der Prozess-Check und der Fahrplan kosten dich nichts. Was eine Umsetzung kosten würde, sagen wir dir im Gespräch.",
  cta: { label: "Zum kostenlosen Prozess-Check", href: "/prozess-check" },
  check: { label: "In drei Minuten siehst du, wo deine Zeit hingeht.", href: "/prozess-check" },
};
