import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

export function Proof() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <Reveal as="p" delayMs={0} className="text-sm font-medium uppercase tracking-wider text-stumm">Vertrauen</Reveal>
      <Reveal as="h2" delayMs={80} className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Ruhig gebaut. Verlässlich im Betrieb.
      </Reveal>
      <Reveal as="p" delayMs={160} className="mt-5 max-w-2xl text-lg text-tinte">
        Hier stehen bald echte Referenzen und Stimmen aus kleinen Betrieben.
      </Reveal>
      {/* TODO: replace with real Referenzen/testimonials when available */}
    </Section>
  );
}
