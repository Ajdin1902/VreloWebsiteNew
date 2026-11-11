// src/app/leistungen/ki-agenten/page.tsx
//
// KI-Agenten examples (Ajdin 2026-11-11): hero, one agent per department,
// Warum ich, a close that books the 30-minute call. Not in the top nav; the
// KI-Assistenten card on /leistungen/ki-automatisierung links here. A static
// segment, so it wins over /leistungen/[slug]. Copy: src/lib/kiAgenten.ts.
import type { Metadata } from "next";
import { CompactHero } from "@/components/CompactHero";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { AgentenBlock } from "@/components/leistungen/page/AgentenBlock";
import { WarumBlock } from "@/components/leistungen/page/WarumBlock";
import { KI_AGENTEN, KI_AGENTEN_PATH } from "@/lib/kiAgenten";
import { leistungenHub } from "@/lib/leistungenPages";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: KI_AGENTEN.title,
  description: KI_AGENTEN.metaDescription,
  alternates: { canonical: canonical(KI_AGENTEN_PATH) },
};

export default function KiAgentenPage() {
  const { cta } = KI_AGENTEN;
  return (
    <>
      <CompactHero
        eyebrow="Leistungen · Bauen"
        title={KI_AGENTEN.title}
        line={KI_AGENTEN.line}
        image={KI_AGENTEN.heroImage}
        cta={{ primary: "kontakt", src: cta.src }}
      />
      <AgentenBlock heading={KI_AGENTEN.heading} agenten={KI_AGENTEN.agenten} gebautPrefix={KI_AGENTEN.gebautPrefix} />
      <WarumBlock warum={leistungenHub.warum} />
      <ClosingCta heading={cta.heading} lead={cta.lead} src={cta.src} primary="kontakt" />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
          { name: KI_AGENTEN.title, path: KI_AGENTEN_PATH },
        ])}
      />
    </>
  );
}
