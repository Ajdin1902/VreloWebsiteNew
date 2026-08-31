// src/app/prozess-check/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProzessCheck } from "@/components/prozess-check/ProzessCheck";
import { calLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Prozess-Check",
  description:
    "In drei Minuten siehst du, wie viele Stunden pro Woche dich wiederkehrende Aufgaben kosten, und wo du am meisten Zeit zurückgewinnst. Kein Login, dein Ergebnis sofort.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/prozess-check" },
};

export default function ProzessCheckPage() {
  return (
    <>
      <PageHero
        title="Wie viel Zeit frisst der Kleinkram bei dir?"
        src="/images/lead-check-banner.webp"
        lead="Ein paar kurze Fragen, und du siehst schwarz auf weiß, wie viele Stunden pro Woche in Aufgaben gehen, die sich immer wiederholen, und wo du am meisten zurückholst. Kein Login, dein Ergebnis sofort."
      />
      {/* Deep petrol band (founder feedback 2026-08-31: the pale band read too
          bright); the lesepapier card lifts off it and cuts the glare. */}
      <div className="-mt-10 bg-vrelo-petrol md:-mt-12">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-4 md:pb-32 md:pt-6">
          <ProzessCheck calLink={calLink()} />
        </div>
      </div>
    </>
  );
}
