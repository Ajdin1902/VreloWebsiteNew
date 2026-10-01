// src/app/ratgeber/page.tsx
import type { Metadata } from "next";
import { CompactHero } from "@/components/CompactHero";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { CHECK_SRC } from "@/lib/prozessCheckCta";
import { JsonLd } from "@/components/JsonLd";
import { RatgeberIndex } from "@/components/ratgeber/RatgeberIndex";
import { getAllArticles } from "@/lib/ratgeber";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/ratgeber") },
  title: "Ratgeber",
  description:
    "Praxisnahe Notizen zur ruhigen Automatisierung für Betriebe und Unternehmen, wie du wiederkehrende Arbeit abgibst und Kopffreiheit zurückgewinnst.",
};

export default function RatgeberPage() {
  const articles = getAllArticles();
  return (
    <>
      <CompactHero
        eyebrow="Grundlagen · Praxis · Kosten"
        title="Gedanken zur ruhigen Automatisierung"
        line="Praxisnahe Notizen, wie du wiederkehrende Arbeit abgibst und Zeit zurückgewinnst."
        image="/images/ratgeber-banner.webp"
      />
      <Section tone="paper">
        <RatgeberIndex articles={articles} />
      </Section>
      <ClosingCta
        heading="Wie viel Zeit kostet dich das?"
        lead="Der Prozess-Check zeigt dir in drei Minuten, wie viele Stunden pro Woche bei dir in solchen Aufgaben stecken."
        src={CHECK_SRC.ratgeber}
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
