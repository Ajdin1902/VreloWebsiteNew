import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

export function Problem() {
  return (
    <Section tone="paper">
      <Reveal as="p" delayMs={0} className="text-sm font-medium uppercase tracking-wider text-stumm">Das Problem</Reveal>
      <Reveal as="h2" delayMs={80} className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Der Kleinkram frisst deinen Tag.
      </Reveal>
      <Reveal as="p" delayMs={160} className="mt-5 max-w-2xl text-lg text-tinte">
        Termine bestätigen, nachfassen, Daten von A nach B tippen. Stunden, die für die
        Arbeit fehlen, die du eigentlich liebst.
      </Reveal>
    </Section>
  );
}
