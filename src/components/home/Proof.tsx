import { Section } from "@/components/Section";

export function Proof() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Vertrauen</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Ruhig gebaut. Verlässlich im Betrieb.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-tinte">
        Hier stehen bald echte Referenzen und Stimmen aus kleinen Betrieben.
      </p>
      {/* TODO: replace with real Referenzen/testimonials when available */}
    </Section>
  );
}
