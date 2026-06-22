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
        lead="Ich bin Ajdin Dzafic, Gründer von Vrelo, jahrelanger Prozessautomatisierer mit einem Master of Science in Wirtschaftsinformatik – und Kaffeeliebhaber. Das Schönste an meiner Arbeit war für mich immer der Moment am Ende eines Projekts: Niemand musste sich mehr um die wiederkehrenden, zeitraubenden Aufgaben kümmern. Sie liefen von selbst. Das brachte Ruhe. Genau das ist die Motivation hinter Vrelo."
        image={{
          src: "/images/ueber-mich-banner.webp",
          alt: "Eine klare, türkisfarbene Quelle zwischen moosbewachsenen Felsen; im ruhigen Wasser breitet sich ein sanfter Ring aus.",
          ratio: "aspect-[3/2]",
        }}
      />
      {storyBeats.map((beat, index) => {
        // Every other beat (Ripples, Merak) is a petrol-dark anchor, giving the
        // page a light/dark reading rhythm; the rest stay paper. Same parity that
        // used to drive the faint tint.
        const onDark = index % 2 === 1;
        return (
          <Section
            key={beat.slug}
            tone={onDark ? "petrol" : "paper"}
            // The petrol/paper contrast is the divider — no line. Pull the first
            // beat up under the intro so the stacked paper Sections don't double
            // their py padding into an oversized gap.
            className={index === 0 ? "-mt-24 md:-mt-32" : ""}
          >
            <Reveal>
              <StoryBeat beat={beat} onDark={onDark} />
            </Reveal>
          </Section>
        );
      })}
      <ClosingCta
        heading="Lern mich unverbindlich kennen."
        lead="Fressen die immer gleichen Aufgaben deine Zeit – und du hättest gern wieder dieses Gefühl von Ruhe, von Merak? Lass uns unverbindlich reden; wir finden gemeinsam den ersten Schritt."
      />
      <JsonLd data={personLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Über mich", path: "/ueber-mich" }])} />
    </>
  );
}
