import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

export function Problem() {
  return (
    <Section tone="paper">
      <Reveal as="h2" delayMs={0} className="max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Der Kleinkram frisst deinen Tag.
      </Reveal>
      <Reveal as="p" delayMs={80} className="mt-5 max-w-2xl text-lg text-tinte">
        Termine bestätigen, nachfassen, Daten von A nach B tippen. Stunden, die für die
        Arbeit fehlen, die du eigentlich liebst.
      </Reveal>
    </Section>
  );
}
