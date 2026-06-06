import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

const steps = [
  { num: "1", title: "Hinschauen", desc: "Wir finden gemeinsam die Aufgaben, die dich täglich Zeit kosten." },
  { num: "2", title: "Bauen", desc: "Ich baue daraus eine saubere, dokumentierte Quelle." },
  { num: "3", title: "Fließen", desc: "Die Arbeit läuft von selbst — still im Hintergrund." },
];

export function Steps() {
  return (
    <Section tone="petrol" className="border-t border-gletscher/15">
      <Reveal as="p" delayMs={0} className="text-sm font-medium uppercase tracking-wider text-stein">So läuft&apos;s ab</Reveal>
      <Reveal as="h2" delayMs={80} className="mt-3 text-3xl font-semibold text-papier md:text-4xl">
        In drei ruhigen Schritten.
      </Reveal>
      <Reveal as="ol" delayMs={160} className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.num} className="rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber font-serif text-lg italic text-tiefes-wasser">
              {s.num}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-papier">{s.title}</h3>
            <p className="mt-2 text-gletscher">{s.desc}</p>
          </li>
        ))}
      </Reveal>
    </Section>
  );
}
