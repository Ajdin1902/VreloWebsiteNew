import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

export function Proof() {
  return (
    <Section tone="paper" className="relative isolate overflow-hidden border-t border-faden">
      {/* Faint cool water texture; heavy papier tint keeps the dark text AA-readable. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/section-texture.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-papier/88" />
      <Reveal as="h2" delayMs={0} className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        Ruhig gebaut. Verlässlich im Betrieb.
      </Reveal>
      <Reveal as="p" delayMs={80} className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
        Echte Referenzen folgen in Kürze. Bis dahin gilt: ein Ansprechpartner, ein sauber
        dokumentiertes System – und Arbeit, die auch dann läuft, wenn ich nicht
        danebenstehe.
      </Reveal>
      {/* TODO: replace with real Referenzen/testimonials when available */}
    </Section>
  );
}
