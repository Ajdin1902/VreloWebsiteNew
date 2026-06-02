import { Section } from "@/components/Section";

const steps = [
  { n: "1", t: "Hinschauen", d: "Wir finden gemeinsam die Aufgaben, die dich täglich Zeit kosten." },
  { n: "2", t: "Bauen", d: "Ich baue daraus eine saubere, dokumentierte Quelle." },
  { n: "3", t: "Fließen", d: "Die Arbeit läuft von selbst — still im Hintergrund." },
];

export function Steps() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">So läuft&apos;s ab</p>
      <h2 className="mt-3 text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        In drei ruhigen Schritten.
      </h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="rounded-2xl border border-faden bg-papier p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vrelo-petrol font-serif text-lg italic text-papier">
              {s.n}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-tiefes-wasser">{s.t}</h3>
            <p className="mt-2 text-tinte">{s.d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
