import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";
import { LazyVideo } from "@/components/LazyVideo";
import { Reveal } from "@/components/Reveal";

export function MerakClose() {
  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      {/* Sunset clip (merak) behind the close. Below the fold → no LCP cost.
          Reduced-motion falls back to the poster still inside LazyVideo. */}
      <LazyVideo
        mp4="/video/merak.mp4"
        webm="/video/merak.webm"
        poster="/video/merak-poster.jpg"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/* Warm tint over the footage keeps the amber register + text contrast. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_120%,#f4e4c1,#e8b86b_55%,#f4e4c1_100%)] opacity-80"
      />
      <Reveal as="h2" delayMs={0} className="max-w-2xl text-balance font-serif text-3xl italic leading-snug text-ember md:text-4xl">
        Stell dir den Montagmorgen vor, an dem schon zwei Stunden Arbeit erledigt sind.
      </Reveal>
      <Reveal as="p" delayMs={80} className="mt-6 max-w-xl text-pretty text-lg text-tinte">
        Das ist der <BrandWord>Merak</BrandWord>-Effekt. Kein Druck – schau dir
        unverbindlich an, was möglich ist. Der Anfang einer ruhigen Zusammenarbeit, kein
        Verkaufsgespräch.
      </Reveal>
      <Reveal delayMs={160} className="mt-8">
        <CTAButton href="/kontakt" />
      </Reveal>
    </Section>
  );
}
