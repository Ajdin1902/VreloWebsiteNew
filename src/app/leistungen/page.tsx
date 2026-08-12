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
    "Maßgeschneiderte Automatisierungen für kleine Betriebe: von Anfragen & Leads über Termine und Angebote & Rechnungen bis zur Dateneingabe.",
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
          start?" entry, caught before the visitor wades through the Bausteine.
          A warm card on a petrol band — the dark background fills the top and
          the light card pops; stays distinct from the dark MehrMoeglich card at
          the end. No -mt here: once the bands alternate colour, collapsing the
          gap pulls the petrol up over the flagship's bottom padding and the card
          butts the seam. Each band keeps its full, symmetric py (same as the
          Bausteine below). */}
      <Section tone="petrol">
        <Reveal>
          <ProzessAudit />
        </Reveal>
      </Section>
      {/* Reframe the services as the toolbox beneath the flagship. No -mt: full
          symmetric py so this paper band doesn't eat the petrol audit's padding. */}
      <Section tone="paper">
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
        // Inverted parity (was index % 2 === 1): the menu now opens on a petrol
        // band and alternates paper/petrol from there, matching the dark-forward
        // ribbon (petrol audit → paper intro → petrol 01 → paper 02 → …). The
        // petrol/paper contrast is the divider — no line.
        const onDark = index % 2 === 0;
        return (
          <Section
            key={leistung.slug}
            tone={onDark ? "petrol" : "paper"}
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
