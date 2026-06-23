// src/app/ratgeber/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { RatgeberIndex } from "@/components/ratgeber/RatgeberIndex";
import { getAllArticles } from "@/lib/ratgeber";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/ratgeber") },
  title: "Ratgeber",
  description:
    "Praxisnahe Notizen zur ruhigen Automatisierung für kleine Betriebe – wie du wiederkehrende Arbeit abgibst und Kopffreiheit zurückgewinnst.",
};

export default function RatgeberPage() {
  const articles = getAllArticles();
  return (
    <>
      <PageHero
        title="Gedanken zur ruhigen Automatisierung"
        src="/images/ratgeber-banner.webp"
        lead="Praxisnahe Notizen für kleine Betriebe – wie du wiederkehrende Arbeit abgibst und Zeit, Ruhe und einen freien Kopf zurückgewinnst."
      />
      {/* Pull the list up under the intro: both are paper, so the doubled
          Section padding (intro bottom + list top) leaves too big a gap. */}
      <Section tone="paper" className="-mt-24 md:-mt-32">
        <RatgeberIndex articles={articles} />
      </Section>
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet – ich zeige dir unverbindlich, was sich automatisieren lässt."
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Ratgeber", path: "/ratgeber" },
        ])}
      />
    </>
  );
}
