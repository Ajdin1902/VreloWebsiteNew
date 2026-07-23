import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// The differentiators — deliberately no testimonials and no client logos: there
// are none we can show yet, and inventing them would break the whole posture.
export function WarumIch() {
  const w = makler.warumIch;
  return (
    <Section tint>
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {w.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-tinte">{w.intro}</p>
      </div>
      <ul className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        {w.points.map((p, i) => (
          <Reveal
            as="li"
            key={p.title}
            delayMs={i * 60}
            className="card-depth rounded-2xl bg-papier p-6"
          >
            <h3 className="font-semibold text-tiefes-wasser">{p.title}</h3>
            <p className="mt-2 text-pretty leading-relaxed text-tinte">{p.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
