// src/app/lead-check/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
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
        eyebrow="Der Lead-Reaktions-Check"
        title="Wie viel lässt du jede Woche liegen?"
        lead="In zwei Minuten siehst du, wie viele Abschlüsse mit deinem heutigen Posteingang mehr drin wären – wenn jede Anfrage sofort eine Antwort bekäme. Sechs Fragen, kein Login, dein Ergebnis sofort."
      />
      <Section tone="paper" className="-mt-12 md:-mt-16">
        <div className="mx-auto max-w-2xl">
          <LeadCheck calLink={calLink()} />
        </div>
      </Section>
    </>
  );
}
