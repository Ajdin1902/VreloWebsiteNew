import { Section } from "@/components/Section";

const steps = [
  { num: "1", title: "Hinschauen", desc: "Wir finden gemeinsam die Aufgaben, die dich täglich Zeit kosten." },
  { num: "2", title: "Bauen", desc: "Ich baue daraus eine saubere, dokumentierte Quelle." },
  { num: "3", title: "Fließen", desc: "Die Arbeit läuft von selbst — still im Hintergrund." },
];

export function Steps() {
  return (
    <Section tone="petrol">
      <p className="text-sm font-medium uppercase tracking-wider text-stein">So läuft&apos;s ab</p>
      <h2 className="mt-3 text-3xl font-semibold text-papier md:text-4xl">
        In drei ruhigen Schritten.
      </h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.num} className="rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber font-serif text-lg italic text-tiefes-wasser">
              {s.num}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-papier">{s.title}</h3>
            <p className="mt-2 text-gletscher">{s.desc}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
