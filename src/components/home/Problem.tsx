import { Section } from "@/components/Section";

export function Problem() {
  return (
    <Section tone="paper">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">Das Problem</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Der Kleinkram frisst deinen Tag.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-tinte">
        Termine bestätigen, nachfassen, Daten von A nach B tippen. Stunden, die für die
        Arbeit fehlen, die du eigentlich liebst.
      </p>
    </Section>
  );
}
