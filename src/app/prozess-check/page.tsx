// src/app/prozess-check/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProzessCheck } from "@/components/prozess-check/ProzessCheck";
import { calLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Prozess-Check",
  description:
    "In 60 Sekunden findest du heraus, welche Aufgabe dich am meisten kostet, und ob sich ein Prozess-Audit für dich lohnt. Fünf Fragen, kein Login.",
  robots: { index: false, follow: false },
};

export default function ProzessCheckPage() {
  return (
    <>
      <PageHero
        title="Lohnt sich das für deinen Betrieb?"
        src="/images/lead-check-banner.webp"
        lead="Fünf kurze Fragen, und du weißt, welche Aufgabe dich am meisten kostet, und ob ein Prozess-Audit für dich der richtige nächste Schritt ist. Kein Login, dein Ergebnis sofort."
      />
      {/* Same faint cool band as /lead-check so the warm paper card lifts off. */}
      <div className="-mt-10 bg-gletscher/30 md:-mt-12">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-4 md:pb-32 md:pt-6">
          <ProzessCheck calLink={calLink()} />
        </div>
      </div>
    </>
  );
}
