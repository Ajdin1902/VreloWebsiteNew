import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { ClosingCta } from "@/components/ClosingCta";
import { StoryBeat } from "@/components/ueber-mich/StoryBeat";
import { Reveal } from "@/components/Reveal";
import { bildhinweis, storyBeats } from "@/lib/ueber-mich";
import { JsonLd } from "@/components/JsonLd";
import { personLd, breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/ueber-mich") },
  title: "Über mich",
  description:
    "Wer hinter Vrelo steckt: meine Geschichte von der Quelle bis zum Merak-Effekt, und warum ich Automatisierungen für kleine Betriebe baue.",
};

export default function UeberMichPage() {
  return (
    <>
      <PageHero
        title="Über mich"
        src="/images/ueber-mich-banner.webp"
        lead="Ich bin Ajdin Dzafic, Gründer von Vrelo, jahrelanger Prozessautomatisierer mit einem Master of Science in Wirtschaftsinformatik, und Kaffeeliebhaber. Das Schönste an meiner Arbeit war für mich immer der Moment am Ende eines Projekts: Niemand musste sich mehr um die wiederkehrenden, zeitraubenden Aufgaben kümmern. Sie liefen von selbst. Das brachte Ruhe. Genau das ist die Motivation hinter Vrelo."
      />

      {storyBeats.map((beat, index) => {
        // Every other beat (Ripples, Merak) is a petrol-dark anchor, giving the
        // page a light/dark reading rhythm; the rest stay paper.
        const onDark = index % 2 === 1;
        return (
          <Section
            key={beat.slug}
            tone={onDark ? "petrol" : "paper"}
            // Pull the first beat up under the lead so the stacked paper Sections
            // don't double their py padding into an oversized gap.
            className={[index === 0 ? "-mt-24 md:-mt-32" : "", onDark ? "relative isolate overflow-hidden" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Dark beats get only the calm water texture: each beat already
                carries a video, and a pictorial backdrop behind a moving clip is
                noise. Heavy tint (0.65) — the beat text sits directly on it. */}
            {onDark ? (
              <SectionBackdrop src="/images/section-texture.webp" tintRgb="27 80 99" tintOpacity={0.65} />
            ) : null}
            <Reveal>
              <StoryBeat beat={beat} onDark={onDark} />
              {/* The AI-imagery note rides the first beat, where the Bosnia
                  story and the generated spring sit side by side. */}
              {index === 0 ? (
                <p className="mt-10 max-w-xl text-sm text-stumm">{bildhinweis}</p>
              ) : null}
            </Reveal>
          </Section>
        );
      })}

      <ClosingCta
        heading="Lern mich unverbindlich kennen."
        lead="Fressen die immer gleichen Aufgaben deine Zeit, und du hättest gern wieder dieses Gefühl von Ruhe, von Merak? Lass uns unverbindlich reden; wir finden gemeinsam den ersten Schritt."
      />
      <JsonLd data={personLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Über mich", path: "/ueber-mich" }])} />
    </>
  );
}
