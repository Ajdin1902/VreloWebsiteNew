import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

// The recurring everyday tasks — phrased as daily pains (verbs); „Was ich baue"
// then shows them handled (problem → solution echo).
const tasks = [
  "Termine bestätigen und daran erinnern",
  "Nach jedem Auftrag um eine Bewertung bitten",
  "Rechnungen schreiben und nachfassen",
  "Daten von einem Tool ins nächste übertragen",
];

export function Problem() {
  return (
    <Section tone="paper">
      <Reveal as="h2" delayMs={0} className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        Der Kleinkram frisst deinen Tag.
      </Reveal>
      <Reveal as="p" delayMs={80} className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
        Es sind nicht die großen Dinge – es ist das, was sich jeden Tag wiederholt:
      </Reveal>
      <Reveal as="ul" delayMs={160} className="mt-6 max-w-2xl space-y-3 text-lg text-tinte">
        {tasks.map((task) => (
          <li key={task} className="flex items-start gap-3">
            <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
            <span>{task}</span>
          </li>
        ))}
      </Reveal>
      <Reveal as="p" delayMs={240} className="mt-6 max-w-2xl text-pretty text-lg text-tinte">
        Jede Aufgabe für sich ist klein. Zusammen sind es Stunden – Zeit, die für die
        Arbeit fehlt, die du eigentlich liebst.
      </Reveal>
    </Section>
  );
}
