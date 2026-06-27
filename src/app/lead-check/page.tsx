// src/app/lead-check/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { LeadCheck } from "@/components/lead-check/LeadCheck";
import { calLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Lead-Reaktions-Check",
  description:
    "In zwei Minuten siehst du, wie viele Abschlüsse mit deinem heutigen Posteingang mehr drin wären – wenn jede Anfrage sofort eine Antwort bekäme.",
  robots: { index: false, follow: false },
};

export default function LeadCheckPage() {
  return (
    <>
      <PageIntro
        title="Wie viel lässt du jede Woche liegen?"
        lead="In zwei Minuten siehst du, wie viele Abschlüsse mit deinem heutigen Posteingang mehr drin wären – wenn jede Anfrage sofort eine Antwort bekäme. Sechs Fragen, kein Login, dein Ergebnis sofort."
      />
      {/* A faint cool band so the warm paper wizard card lifts off the page —
          the petrol/papier two-tone of the other subpages, in a soft key.
          Custom band (not <Section>) so the card sits tight under the lead
          instead of inheriting the section's full top padding. */}
      <div className="-mt-10 bg-gletscher/30 md:-mt-12">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-4 md:pb-32 md:pt-6">
          <LeadCheck calLink={calLink()} />
        </div>
      </div>
    </>
  );
}
