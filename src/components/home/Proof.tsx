import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

export function Proof() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <Reveal as="h2" delayMs={0} className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        Ruhig gebaut. Verlässlich im Betrieb.
      </Reveal>
      <Reveal as="p" delayMs={80} className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
        Hier stehen bald echte Referenzen und Stimmen aus kleinen Betrieben.
      </Reveal>
      {/* TODO: replace with real Referenzen/testimonials when available */}
    </Section>
  );
}
