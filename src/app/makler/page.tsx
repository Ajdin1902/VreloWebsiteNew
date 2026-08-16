// src/app/makler/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProblemSection } from "@/components/makler/ProblemSection";
import { TerminQuelleBlock } from "@/components/makler/TerminQuelleBlock";
import { MidCta } from "@/components/makler/MidCta";
import { DocumentConciergeBlock } from "@/components/makler/DocumentConciergeBlock";
import { Voraussetzungen } from "@/components/makler/Voraussetzungen";
import { WarumIch } from "@/components/makler/WarumIch";
import { Garantie } from "@/components/makler/Garantie";
import { Einwaende } from "@/components/makler/Einwaende";
import { TerminSection } from "@/components/makler/TerminSection";
import { makler } from "@/lib/makler";
import { calLink } from "@/lib/contact";

// A focus-mode outreach landing page: sent by direct link to a scored lead, so
// it is noindex, absent from the sitemap, and absent from the navigation. The
// site header and footer are swapped for minimal focus chrome by ChromeGate
// (src/lib/nav.ts focusRoutes + focusChrome) — rendered from the root layout, so
// it stays outside <main> and keeps the banner/contentinfo landmarks.
export const metadata: Metadata = {
  title: "Mehr Termine, weniger Papierkram",
  description:
    "Zwei Systeme für unabhängige Makler und Finanzberater: jede Anfrage in unter fünf Minuten beantwortet und zum Termin gemacht, und die Unterlagen deiner Kunden vollständig eingesammelt, ohne Hinterhertelefonieren.",
  robots: { index: false, follow: false },
};

export default function MaklerPage() {
  return (
    <>
      <PageHero
        title={makler.hero.title}
        lead={makler.hero.lead}
        src="/images/lead-check-banner.webp"
      />
      <ProblemSection />
      <TerminQuelleBlock />
      <MidCta />
      <DocumentConciergeBlock product={makler.documentConcierge} />
      <Voraussetzungen />
      <WarumIch />
      <Garantie />
      <Einwaende />
      <TerminSection calLink={calLink()} />
    </>
  );
}
