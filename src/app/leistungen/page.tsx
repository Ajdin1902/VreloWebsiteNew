import type { Metadata } from "next";
import { CompactHero } from "@/components/CompactHero";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { ServiceGroups } from "@/components/leistungen/ServiceGroups";
import { PainBlock } from "@/components/leistungen/page/PainBlock";
import { SzenenBlock } from "@/components/leistungen/page/SzenenBlock";
import { WarumBlock } from "@/components/leistungen/page/WarumBlock";
import { leistungenHub } from "@/lib/leistungenPages";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/leistungen") },
  title: "Leistungen",
  description:
    "Prozess-Audit, Prozessautomatisierung, KI-Automatisierung mit Claude, KI-Server und KI-Schulung, Betreuung und Wartung aus einer Hand.",
};

// The hub (slim redesign, Ajdin 2026-11-11): the subpages' order, with the
// three doors (ServiceGroups) as the Lösung. Copy in src/lib/leistungenPages.ts.
export default function LeistungenPage() {
  return (
    <>
      <CompactHero
        eyebrow="KI und Automatisierung"
        title="Leistungen"
        line="Ich baue KI- und Prozessautomatisierungen, richte sie ein und halte sie am Laufen."
        image="/images/leistungen-banner.webp"
        imageClassName="scale-125 origin-bottom"
      />
      <PainBlock pain={leistungenHub.pain} />
      <Section tone="paper">
        <ServiceGroups />
      </Section>
      <SzenenBlock szenen={leistungenHub.szenen} />
      <WarumBlock warum={leistungenHub.warum} />
      <ClosingCta heading={leistungenHub.cta.heading} lead={leistungenHub.cta.lead} src={leistungenHub.cta.src} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Leistungen", path: "/leistungen" }])} />
    </>
  );
}
