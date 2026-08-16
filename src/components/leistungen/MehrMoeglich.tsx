import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";

// Capstone after the service list: frames the seven services as examples and
// signals restraint ("only what the client truly needs"). The petrol tone sets
// it apart from the paper service cards, so it reads as a closing statement
// rather than an eighth service.
export function MehrMoeglich() {
  return (
    <Section tone="petrol" className="relative isolate overflow-hidden">
      {/* Evening ripples with a warm rim of light along the top edge — the last
          deep band before the sunlit ClosingCta, so the page's ascent already
          shows a hint of the surface here. The glass card (tiefes-wasser/40)
          sits on top; text contrast measured over the brightest patch. */}
      <SectionBackdrop src="/images/bg-abendwellen.webp" tintRgb="27 80 99" tintOpacity={0.5} />
      <Reveal className="card-depth rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 p-8 md:p-10">
        <h2 className="max-w-2xl text-balance text-2xl font-semibold tracking-tight text-papier md:text-3xl">
          Und vieles mehr, ganz nach deinem Bedarf.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-lg text-gletscher">
          Das sind nur einige Beispiele aus unzähligen Möglichkeiten. Erzähl mir, was dich
          beschäftigt. Gemeinsam finden wir heraus, was sich lohnt, und ich baue nur das, was
          dein Betrieb wirklich braucht.
        </p>
      </Reveal>
    </Section>
  );
}
