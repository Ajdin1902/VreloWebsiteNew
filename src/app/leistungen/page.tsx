import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { ClosingCta } from "@/components/ClosingCta";
import { LeistungCard } from "@/components/leistungen/LeistungCard";
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
      <PageHero title="Leistungen" src="/images/leistungen-banner.webp" imageClassName="scale-125 origin-bottom" />
      {/* Paid-audit on-ramp — the lead element now that the Termin-Quelle flagship
          is retired (Model C: the Prozess-Audit is the main entry) and the intro
          deck is dropped. A plain papier band under the hero image: the warm
          sonnenlicht audit card lifts off it on its own shadow (no backdrop). */}
      <Section tone="paper">
        <Reveal>
          <ProzessAudit />
        </Reveal>
      </Section>
      {/* The Bausteine: a petrol image band with a compact two-column card grid
          (six use cases). A water backdrop under a petrol tint; light heading +
          intro sit on the dark band, the opaque papier cards pop on top. Extra
          space (mt-14) after the intro before the grid begins. */}
      <Section tone="petrol" className="relative isolate overflow-hidden">
        <SectionBackdrop src="/images/bg-bausteine-b.webp" tintRgb="27 80 99" tintOpacity={0.7} />
        <Reveal>
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-papier md:text-3xl">
            Die einzelnen Bausteine
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-gletscher">
            Jeder Baustein nimmt dir eine wiederkehrende Aufgabe ab. Einzeln oder kombiniert, ganz nach deinem Betrieb.
          </p>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2">
            {leistungen.map((leistung, index) => (
              <li key={leistung.slug}>
                <LeistungCard leistung={leistung} index={index} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>
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
