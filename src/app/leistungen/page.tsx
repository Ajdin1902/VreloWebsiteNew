import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { LeistungDetail } from "@/components/leistungen/LeistungDetail";
import { Referenzen } from "@/components/leistungen/Referenzen";
import { MehrMoeglich } from "@/components/leistungen/MehrMoeglich";
import { Reveal } from "@/components/Reveal";
import { leistungen } from "@/lib/leistungen";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/leistungen") },
  title: "Leistungen",
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe: von Anfragen & Leads über Termine, Angebote & Rechnungen und Nachfass-Mails bis zu Datensync, wiederkehrender Kommunikation und Bewertungen.",
};

export default function LeistungenPage() {
  return (
    <>
      <PageIntro
        eyebrow="Was ich baue"
        title="Leistungen"
        lead="Ich baue dir eine saubere Quelle für die Aufgaben, die sich jeden Tag wiederholen – maßgeschneidert für deinen Betrieb, nicht von der Stange. Kein Durcheinander aus zehn Tools, sondern eine ruhige Lösung, die still im Hintergrund läuft."
        image={{
          src: "/images/leistungen-banner.webp",
          alt: "Klares Wasser fließt durch saubere, geordnete Steinkanäle.",
          ratio: "aspect-[21/9]",
        }}
      />
      {leistungen.map((leistung, index) => (
        <Section
          key={leistung.slug}
          tone="paper"
          tint={index % 2 === 1}
          className="border-t border-faden"
        >
          <Reveal>
            <LeistungDetail leistung={leistung} index={index} />
          </Reveal>
        </Section>
      ))}
      <MehrMoeglich />
      <Referenzen />
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet und welche Leistungen dich interessieren – ich zeige dir unverbindlich, was sich automatisieren lässt."
      />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Leistungen", path: "/leistungen" }])} />
    </>
  );
}
