// src/app/makler/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CTAButton } from "@/components/CTAButton";
import { MaklerHeader } from "@/components/makler/MaklerHeader";
import { MaklerFooter } from "@/components/makler/MaklerFooter";
import { ProblemSection } from "@/components/makler/ProblemSection";
import { TerminQuelleBlock } from "@/components/makler/TerminQuelleBlock";
import { Bridge } from "@/components/makler/Bridge";
import { DocumentConciergeBlock } from "@/components/makler/DocumentConciergeBlock";
import { WarumIch } from "@/components/makler/WarumIch";
import { Garantie } from "@/components/makler/Garantie";
import { Einwaende } from "@/components/makler/Einwaende";
import { TerminSection } from "@/components/makler/TerminSection";
import { makler } from "@/lib/makler";
import { calLink } from "@/lib/contact";

// A focus-mode outreach landing page: sent by direct link to a scored lead, so
// it is noindex, absent from the sitemap, and absent from the navigation. The
// site header and footer are suppressed by ChromeGate (src/lib/nav.ts
// focusRoutes); the page brings its own minimal chrome instead.
export const metadata: Metadata = {
  title: "Mehr Termine, weniger Papierkram",
  description:
    "Zwei Systeme für unabhängige Makler und Finanzberater: jede Anfrage in unter fünf Minuten beantwortet und zum Termin gemacht – und die Unterlagen deiner Kunden vollständig eingesammelt, ohne Hinterhertelefonieren.",
  robots: { index: false, follow: false },
};

export default function MaklerPage() {
  return (
    <>
      <MaklerHeader />
      <PageHero
        title={makler.hero.title}
        lead={makler.hero.lead}
        src="/images/lead-check-banner.webp"
        actions={
          <div className="flex flex-col items-start gap-3">
            <CTAButton href={makler.hero.cta.href}>{makler.hero.cta.label}</CTAButton>
            <p className="text-sm text-stumm">{makler.hero.ctaNote}</p>
          </div>
        }
      />
      <ProblemSection />
      <TerminQuelleBlock />
      <Bridge />
      <DocumentConciergeBlock product={makler.documentConcierge} />
      <WarumIch />
      <Garantie />
      <Einwaende />
      <TerminSection calLink={calLink()} />
      <MaklerFooter />
    </>
  );
}
