import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// The differentiators — deliberately no testimonials and no client logos: there
// are none we can show yet, and inventing them would break the whole posture.
// Headlines only, no bodies: the page shows rather than explains.
// Paper, not tint — the Voraussetzungen section directly above is the cool
// band, and two cool bands in a row would flatten the page's rhythm.
export function WarumIch() {
  const w = makler.warumIch;
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {w.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-tinte">{w.intro}</p>
      </div>
      <ul
        aria-label="Was das für dich bedeutet"
        className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2"
      >
        {w.points.map((p, i) => (
          <Reveal as="li" key={p} delayMs={i * 60} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5 text-vrelo-petrol">
              →
            </span>
            <span className="font-medium text-tiefes-wasser">{p}</span>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
