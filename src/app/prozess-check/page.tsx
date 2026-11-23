// src/app/prozess-check/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { ProzessCheck } from "@/components/prozess-check/ProzessCheck";
import { ProzessCheckFromUrl } from "@/components/prozess-check/ProzessCheckFromUrl";
import { calBookingUrl } from "@/lib/contact";
import { researchConfigured } from "@/lib/vorabFahrplan/job";

// The form's server action runs in this page's function: PDF render plus two mails need headroom.
export const maxDuration = 60;

// COPY: Ajdin approves
const HERO_SUBLINE = "Ein paar Fragen, danach kommt dein Vorab-Fahrplan als PDF per Mail.";

export const metadata: Metadata = {
  title: "Prozess-Check",
  // COPY: Ajdin approves
  description:
    "In fünf Minuten siehst du, wie viele Stunden pro Woche dich wiederkehrende Aufgaben kosten. Danach bekommst du deinen Vorab-Fahrplan als PDF per Mail. Kein Login.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/prozess-check" },
};

export default function ProzessCheckPage() {
  return (
    <>
      <PageHero
        title="Wie viel Zeit frisst der Kleinkram bei dir?"
        src="/images/lead-check-banner.webp"
        size="compact"
      />
      {/* Deep petrol band (founder feedback 2026-08-31: the pale band read too
          bright); the lesepapier card lifts off it and cuts the glare. No intro
          lead since 2026-09-26: visitors arrive from a button that already said
          what the check is, so the page opens straight on the first question
          (the band no longer tucks up under a lead, hence no negative margin). */}
      <div className="bg-vrelo-petrol">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-10 md:pb-32 md:pt-14">
          {/* One short sub-line under the hero instead of a lead band (keeps question 1 on the first screen). */}
          <p className="mb-6 text-center text-papier/85">{HERO_SUBLINE}</p>
          {/* ?src=brief-<segment> (letter batches via /brief) is read on the
              client; the fallback renders the same questionnaire without it. */}
          {/* research: read from env at render (build time on a static page), same check as the action. */}
          <Suspense fallback={<ProzessCheck calUrl={calBookingUrl()} research={researchConfigured()} />}>
            <ProzessCheckFromUrl calUrl={calBookingUrl()} research={researchConfigured()} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
