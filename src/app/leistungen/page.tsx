import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { LeistungDetail } from "@/components/leistungen/LeistungDetail";
import { TerminQuelleAngebot } from "@/components/leistungen/TerminQuelleAngebot";
import { Referenzen } from "@/components/leistungen/Referenzen";
import { MehrMoeglich } from "@/components/leistungen/MehrMoeglich";
import { ProzessAudit } from "@/components/leistungen/ProzessAudit";
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
      <PageHero
        title="Leistungen"
        src="/images/leistungen-banner.webp"
        lead="Ich baue dir eine saubere Quelle für die Aufgaben, die sich jeden Tag wiederholen – maßgeschneidert für deinen Betrieb, nicht von der Stange. Kein Durcheinander aus zehn Tools, sondern eine Lösung, die still im Hintergrund läuft."
      />
      {/* The flagship: the named, packaged offer lifted above the generic menu. */}
      <Section tone="paper" className="-mt-24 md:-mt-32">
        <Reveal>
          <TerminQuelleAngebot />
        </Reveal>
      </Section>
      {/* Paid-audit on-ramp, right beneath the flagship: the "not sure where to
          start?" entry, caught before the visitor wades through the 7 Bausteine.
          A warm highlighted card (its own component) between the cool flagship
          and the plain menu — the contrast is the highlight. */}
      <Section tone="paper" className="-mt-24 md:-mt-32">
        <Reveal>
          <ProzessAudit />
        </Reveal>
      </Section>
      {/* Reframe the 7 services as the toolbox beneath the flagship. */}
      <Section tone="paper" className="-mt-24 md:-mt-32">
        <Reveal>
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-tiefes-wasser md:text-3xl">
            Die einzelnen Bausteine
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-tinte">
            Die Termin-Quelle bündelt die wichtigsten davon. Jeden Baustein gibt es auch einzeln.
          </p>
        </Reveal>
      </Section>
      {leistungen.map((leistung, index) => {
        // Every other detail sits on a petrol-dark band; the light card floats
        // on it. Same parity that used to drive the faint tint. The petrol/paper
        // contrast is the divider — no line.
        const onDark = index % 2 === 1;
        return (
          <Section
            key={leistung.slug}
            tone={onDark ? "petrol" : "paper"}
            // Pull the first detail up under the intro so the stacked paper
            // Sections don't double their py padding into an oversized gap.
            className={index === 0 ? "-mt-24 md:-mt-32" : ""}
          >
            <Reveal>
              <LeistungDetail leistung={leistung} index={index} onDark={onDark} />
            </Reveal>
          </Section>
        );
      })}
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
