import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

const steps = [
  { num: "1", title: "Hinschauen", desc: "Wir finden gemeinsam die Aufgaben, die dich täglich Zeit kosten." },
  { num: "2", title: "Bauen", desc: "Ich baue daraus eine saubere, dokumentierte Quelle." },
  { num: "3", title: "Fließen", desc: "Die Arbeit läuft von selbst – still im Hintergrund." },
];

export function Steps() {
  return (
    <Section tone="petrol" className="relative isolate overflow-hidden border-t border-gletscher/15">
      {/* Subtle flowing-water backdrop (Fließen); petrol tint keeps cards + text legible. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/fliessen.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-vrelo-petrol/70" />

      {/* Centered spine: intro on the spine, the three cards keep their grid + left text. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          In drei ruhigen Schritten.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-gletscher">
          Der erste Schritt ist klein – den Rest übernehme ich.
        </Reveal>
      </div>
      <Reveal as="ol" delayMs={160} className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.num} className="card-depth rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 p-6">
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
