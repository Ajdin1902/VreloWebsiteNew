// src/app/prozess-check/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { ProzessCheck } from "@/components/prozess-check/ProzessCheck";
import { ProzessCheckFromUrl } from "@/components/prozess-check/ProzessCheckFromUrl";
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
      />
      {/* Deep petrol band (founder feedback 2026-08-31: the pale band read too
          bright); the lesepapier card lifts off it and cuts the glare. No intro
          lead since 2026-09-26: visitors arrive from a button that already said
          what the check is, so the page opens straight on the first question
          (the band no longer tucks up under a lead, hence no negative margin). */}
      <div className="bg-vrelo-petrol">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-10 md:pb-32 md:pt-14">
          {/* ?src=brief-<segment> (letter batches via /brief) is read on the
              client; the fallback renders the same questionnaire without it. */}
          <Suspense fallback={<ProzessCheck calLink={calLink()} />}>
            <ProzessCheckFromUrl calLink={calLink()} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
