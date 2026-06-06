import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { StoryBeat } from "@/components/ueber-mich/StoryBeat";
import { storyBeats } from "@/lib/ueber-mich";
import { JsonLd } from "@/components/JsonLd";
import { personLd, breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/ueber-mich") },
  title: "Über mich",
  description:
    "Wer hinter Vrelo steckt: meine Geschichte von der Quelle bis zum Merak-Effekt — und warum ich Automatisierungen für kleine Betriebe baue.",
};

export default function UeberMichPage() {
  return (
    <>
      <PageIntro
        eyebrow="Die Person hinter der Arbeit"
        title="Über mich"
        lead="[Platzhalter] Ein, zwei einleitende Sätze: wer du bist und warum es dir bei Vrelo um Ruhe, Zeit und einen freien Kopf geht."
      />
      {storyBeats.map((beat, index) => (
        <Section
          key={beat.slug}
          tone="paper"
          tint={index % 2 === 1}
          className="border-t border-faden"
        >
          <StoryBeat beat={beat} index={index} />
        </Section>
      ))}
      <ClosingCta
        heading="Lern mich unverbindlich kennen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich zeige dir ehrlich, ob und wie ich helfen kann."
      />
      <JsonLd data={personLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Über mich", path: "/ueber-mich" }])} />
    </>
  );
}
