import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

// Capstone after the service list: frames the seven services as examples and
// signals restraint ("only what the client truly needs"). The petrol tone sets
// it apart from the paper service cards, so it reads as a closing statement
// rather than an eighth service.
export function MehrMoeglich() {
  return (
    <Section tone="petrol">
      <Reveal className="card-depth rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 p-8 md:p-10">
        <h2 className="max-w-2xl text-balance text-2xl font-semibold tracking-tight text-papier md:text-3xl">
          Und vieles mehr – ganz nach deinem Bedarf.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-lg text-gletscher">
          Das sind nur einige Beispiele aus unzähligen Möglichkeiten. Erzähl mir, was dich
          beschäftigt – gemeinsam finden wir heraus, was sich lohnt, und ich baue nur das, was
          dein Betrieb wirklich braucht.
        </p>
      </Reveal>
    </Section>
  );
}
