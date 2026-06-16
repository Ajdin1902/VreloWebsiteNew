import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { StoryBeat } from "@/components/ueber-mich/StoryBeat";
import { Reveal } from "@/components/Reveal";
import { storyBeats } from "@/lib/ueber-mich";
import { JsonLd } from "@/components/JsonLd";
import { personLd, breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/ueber-mich") },
  title: "Über mich",
  description:
    "Wer hinter Vrelo steckt: meine Geschichte von der Quelle bis zum Merak-Effekt – und warum ich Automatisierungen für kleine Betriebe baue.",
};

export default function UeberMichPage() {
  return (
    <>
      <PageIntro
        title="Über mich"
        lead="Ich bin Ajdin Dzafic, Gründer von Vrelo, mit einem Master of Science in Wirtschaftsinformatik von der OTH Regensburg. Seit Jahren automatisiere ich Prozesse – und die größte Freude war für mich immer der Abschluss eines Projekts. Der Grund: Niemand musste sich mehr um wiederkehrende, zeitraubende Aufgaben kümmern. Sie liefen von selbst. Das brachte Ruhe. Genau hier liegt die Motivation hinter Vrelo."
        image={{
          src: "/images/ueber-mich-banner.webp",
          alt: "Ein türkisfarbener Quellfluss entspringt im Morgenlicht am Fuß bosnischer Kalksteinberge.",
          ratio: "aspect-[16/9]",
        }}
      />
      {storyBeats.map((beat, index) => (
        <Section
          key={beat.slug}
          tone="paper"
          tint={index % 2 === 1}
          className="border-t border-faden"
        >
          <Reveal>
            <StoryBeat beat={beat} />
          </Reveal>
        </Section>
      ))}
      <ClosingCta
        heading="Lern mich unverbindlich kennen."
        lead="Hast du auch einen stressigen Arbeitsalltag voller Kleinkram? Willst du auch wieder ein Gefühl von Merak? Ich zeige dir, wie wir dahin kommen."
      />
      <JsonLd data={personLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Über mich", path: "/ueber-mich" }])} />
    </>
  );
}
