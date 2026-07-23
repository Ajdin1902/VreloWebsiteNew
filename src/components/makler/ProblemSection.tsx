import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// The two leaks, in his day rather than our tech — establishes the need for
// both products before either is named. Heading and intro centre on the page
// spine; the leak bodies stay left-aligned (centred body copy hurts scanning).
export function ProblemSection() {
  const p = makler.problem;
  return (
    <Section tone="paper" className="-mt-24 md:-mt-32">
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {p.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-tinte">{p.intro}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {p.leaks.map((leak, i) => (
          <Reveal key={leak.title} delayMs={i * 80} className="card-depth rounded-2xl bg-papier p-6 md:p-8">
            <h3 className="font-serif text-xl text-vrelo-petrol md:text-2xl">{leak.title}</h3>
            <p className="mt-3 text-pretty leading-relaxed text-tinte">{leak.body}</p>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-[44rem] text-center text-lg font-medium text-tiefes-wasser">
        {p.close}
      </p>
    </Section>
  );
}
