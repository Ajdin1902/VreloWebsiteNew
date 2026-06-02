import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export function MerakClose() {
  return (
    <Section tone="warm" className="relative overflow-hidden">
      {/* Video slot (Phase 2c): the sunset clip mounts here behind the text. Warm gradient stands in for now. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_120%,#f4e4c1,#e8b86b_55%,#f4e4c1_100%)] opacity-60"
      />
      <h2 className="max-w-2xl font-serif text-3xl italic leading-snug text-ember md:text-4xl">
        Stell dir den Montagmorgen vor, an dem schon zwei Stunden Arbeit erledigt sind.
      </h2>
      <p className="mt-6 max-w-xl text-lg text-tinte">
        Das ist der <BrandWord>Merak</BrandWord>-Effekt. Kein Druck — schau dir
        unverbindlich an, was möglich ist.
      </p>
      <div className="mt-8">
        <CTAButton href="/kontakt" />
      </div>
    </Section>
  );
}
