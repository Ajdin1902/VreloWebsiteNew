import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { ClosingCta } from "@/components/ClosingCta";
import { CHECK_SRC } from "@/lib/prozessCheckCta";
import { ServiceGroups } from "@/components/leistungen/ServiceGroups";
import { Referenzen } from "@/components/leistungen/Referenzen";
import { WennDuBaust } from "@/components/leistungen/WennDuBaust";
import { WoranEsScheitert } from "@/components/leistungen/WoranEsScheitert";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/leistungen") },
  title: "Leistungen",
  description:
    "KI-Automatisierung, Prozessautomatisierung, KI-Server, Claude für Unternehmen, KI-Schulung, KI-Beratung sowie Betreuung und Wartung aus einer Hand.",
};

// The hub (spec 2026-10-01 §3.2): the seven services in three groups, then the
// trust layer (what you get, the obstacles answered, references). The audit
// card moved to /leistungen/ki-beratung; the six Bausteine became the example
// runs on the subpages.
export default function LeistungenPage() {
  return (
    <>
      <PageHero
        title="Leistungen"
        src="/images/leistungen-banner.webp"
        imageClassName="scale-125 origin-bottom"
        lead="KI-Automatisierung und Prozessautomatisierung: Ich baue sie, richte sie ein und halte sie am Laufen. Such dir aus, wo du anfangen willst."
      />
      <Section tone="petrol" className="relative isolate overflow-hidden">
        <SectionBackdrop src="/images/bg-bausteine-b.webp" tintRgb="27 80 99" tintOpacity={0.7} />
        <ServiceGroups />
      </Section>
      <WennDuBaust />
      <WoranEsScheitert />
      <Referenzen />
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Fang mit drei Minuten an: Der Prozess-Check zeigt dir, welche Aufgabe dich am meisten kostet. Danach reden wir, wenn du willst."
        src={CHECK_SRC.leistungenClose}
      />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Leistungen", path: "/leistungen" }])} />
    </>
  );
}
