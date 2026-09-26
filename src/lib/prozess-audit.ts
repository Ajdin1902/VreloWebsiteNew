// Public, price-free copy for the free Prozess-Audit card on /leistungen.
// Since 2026-08-31 the audit is FREE, fed by the /prozess-check questionnaire
// (Prozess-Check-Funnel). The Fahrplan is price-free and travels; the price is
// named only in the call (HQ §4). "Kostenlos" leads the heading by founder
// decision (2026-08-31); the body carries the fahrplan-is-yours close, so there
// is no separate keep-note or price line anymore. Spec:
// Knowledge/marketing/prozess-check-funnel.md
import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";

export type ProzessAudit = {
  label: string;
  heading: string;
  body: string;
  deliverableLabel: string;
  deliverables: string[];
  cta: { label: string; href: string };
  secondary: { prefix: string; label: string; href: string };
};

export const prozessAudit: ProzessAudit = {
  label: "Nicht sicher, wo du anfangen sollst?",
  heading: "Kostenloser Prozess-Audit: dein Fahrplan zu automatisierten Abläufen",
  body: "Du merkst, dass Zeit und Anfragen durchrutschen, aber du weißt nicht, womit und wie du anfangen sollst? Ich liefere dir einen genauen Fahrplan, ganz nach deinen Anforderungen: was du machen kannst, was sich lohnt und was es dir bringt. Der Fahrplan gehört ganz dir. Ob du ihn selbst umsetzt, umsetzen lässt oder mit mir baust, entscheidest du danach.",
  deliverableLabel: "Das bekommst du",
  deliverables: [
    "Ein 30-minütiges Gespräch, in dem wir deine Abläufe durchgehen",
    "Einen fertigen Fragenkatalog fürs Gespräch: du musst nichts vorbereiten",
    "Deine Aufgaben, nach dem sortiert, was dich am meisten Zeit kostet",
    "Einen Fahrplan: welche Automatisierung zuerst, in welchen Schritten",
    "Eine klare Empfehlung für den ersten Schritt",
  ],
  // Front door since 2026-09-26: primary = the Prozess-Check (answers travel
  // into the booking), secondary = the Erstgespräch for warm visitors.
  cta: { label: CHECK_CTA.label, href: checkHref(CHECK_SRC.leistungenAudit) },
  secondary: { prefix: CHECK_CTA.directPrefix, label: CHECK_CTA.directLabel, href: CHECK_CTA.directHref },
};
