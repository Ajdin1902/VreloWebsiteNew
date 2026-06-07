import { Section } from "@/components/Section";

export function Referenzen() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Vertrauen</p>
      <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        Bald: Stimmen aus echten Betrieben.
      </h2>
      <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
        Hier stehen in Kürze konkrete Beispiele und Referenzen aus kleinen Betrieben, für die
        ich gebaut habe.
      </p>
      {/* TODO: replace with real Referenzen/testimonials when available */}
    </Section>
  );
}
