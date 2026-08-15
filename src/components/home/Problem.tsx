import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";

// The recurring everyday tasks, phrased as daily pains (verbs); the Was-ich-baue
// section then shows them handled (problem -> solution echo).
const tasks = [
  "Aus Kundenanfragen Termine buchen",
  "Fehlenden Unterlagen hinterherlaufen",
  "Rechnungen schreiben und nachfassen",
  "Daten von einem System ins nächste übertragen",
];

// Spine A: this is the "submerged in the problem" beat — the deepest, darkest
// rung. Dark tiefes tone + light text over a navy-dusk seascape backdrop (body
// 5.0:1 at tint 0.6). The task list sits in a faint gletscher glass tile that
// dissolves into the water, matching the deep sections below.
export function Problem() {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-problem.webp" tintRgb="10 37 56" tintOpacity={0.6} />
      {/* Centered spine: heading, intro and close stay centered. The task list
          sits in a contained card-depth panel so it doesn't float in the void. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          Der Kleinkram frisst deinen Tag.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-gletscher">
          Es sind nicht die großen Dinge – es ist das, was sich jeden Tag wiederholt:
        </Reveal>
        <Reveal as="div" delayMs={160} className="card-depth mx-auto mt-8 max-w-xl rounded-2xl border border-gletscher/25 bg-gletscher/10 p-8 text-left">
          <ul className="flex flex-col gap-3 text-lg text-gletscher">
            {tasks.map((task) => (
              <li key={task} className="flex items-start gap-3">
                <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal as="p" delayMs={240} className="mt-7 text-pretty text-lg text-gletscher">
          Jede Aufgabe für sich ist klein. Zusammen sind es Stunden – Zeit, die für die
          Arbeit fehlt, die du eigentlich liebst.
        </Reveal>
      </div>
    </Section>
  );
}
