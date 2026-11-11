// Public, price-free copy for the free Prozess-Audit card on
// /leistungen/prozess-audit (its own subpage since 2026-10-15).
// Since 2026-08-31 the audit is FREE, fed by the /prozess-check questionnaire
// (Prozess-Check-Funnel). The Fahrplan is price-free and travels; the price is
// named only in the call (HQ §4). "Kostenlos" leads the heading by founder
// decision (2026-08-31); the body carries the fahrplan-is-yours close, so there
// is no separate keep-note or price line anymore. Spec:
// Knowledge/marketing/prozess-check-funnel.md
import { VORLAGEN_CTA, CHECK_SRC, vorlagenHref } from "@/lib/prozessCheckCta";

export type ProzessAudit = {
  label: string;
  heading: string;
  body: string;
  deliverableLabel: string;
  deliverables: string[];
  cta: { label: string; href: string };
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
  // One way in since 2026-11-11: the Vorlagen, no Erstgespräch link beside it.
  cta: { label: VORLAGEN_CTA.label, href: vorlagenHref(CHECK_SRC.leistungenAudit) },
};
