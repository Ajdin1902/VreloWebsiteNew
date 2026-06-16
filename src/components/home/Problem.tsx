import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

// The recurring everyday tasks, phrased as daily pains (verbs); the Was-ich-baue
// section then shows them handled (problem -> solution echo).
const tasks = [
  "Termine bestätigen und daran erinnern",
  "Nach jedem Auftrag um eine Bewertung bitten",
  "Rechnungen schreiben und nachfassen",
  "Daten von einem Tool ins nächste übertragen",
];

export function Problem() {
  return (
    <Section tone="paper">
      {/* Centered spine: heading, intro and close are centered; the task list sits
          as a centered block but stays left-aligned so it reads cleanly. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          Der Kleinkram frisst deinen Tag.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-tinte">
          Es sind nicht die großen Dinge – es ist das, was sich jeden Tag wiederholt:
        </Reveal>
        <Reveal as="ul" delayMs={160} className="mx-auto mt-7 inline-flex flex-col gap-3 text-left text-lg text-tinte">
          {tasks.map((task) => (
            <li key={task} className="flex items-start gap-3">
              <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
              <span>{task}</span>
            </li>
          ))}
        </Reveal>
        <Reveal as="p" delayMs={240} className="mt-7 text-pretty text-lg text-tinte">
          Jede Aufgabe für sich ist klein. Zusammen sind es Stunden – Zeit, die für die
          Arbeit fehlt, die du eigentlich liebst.
        </Reveal>
      </div>
    </Section>
  );
}
