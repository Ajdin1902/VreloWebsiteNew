// src/app/ratgeber/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { RatgeberIndex } from "@/components/ratgeber/RatgeberIndex";
import { getAllArticles } from "@/lib/ratgeber";
import { breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Ratgeber",
  description:
    "Praxisnahe Notizen zur ruhigen Automatisierung für kleine Betriebe — wie du wiederkehrende Arbeit abgibst und Kopffreiheit zurückgewinnst.",
};

export default function RatgeberPage() {
  const articles = getAllArticles();
  return (
    <>
      <PageIntro
        eyebrow="Ratgeber"
        title="Gedanken zur ruhigen Automatisierung"
        lead="Praxisnahe Notizen für kleine Betriebe — wie du wiederkehrende Arbeit abgibst und Zeit, Ruhe und einen freien Kopf zurückgewinnst."
      />
      <Section tone="paper">
        <RatgeberIndex articles={articles} />
      </Section>
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich zeige dir unverbindlich, was sich automatisieren lässt."
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
