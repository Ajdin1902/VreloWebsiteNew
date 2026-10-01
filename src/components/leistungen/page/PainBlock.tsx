import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import type { LeistungPage } from "@/lib/leistungenPages";

// „Kennst du das?“ (Ajdin 2026-10-01, variant 3): heading and the closing line
// on the left, the short pain points as a ruled list on the right, half the
// height of the old centered panel. The close sits before the list in the DOM,
// so a screen reader hears heading → close → points, the same order as seen.
export function PainBlock({ pain }: { pain: LeistungPage["pain"] }) {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-problem.webp" tintRgb="10 37 56" tintOpacity={0.6} />
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-14">
        <div>
          <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
            {pain.heading}
          </Reveal>
          <Reveal as="p" delayMs={120} className="mt-4 max-w-sm text-pretty text-lg text-honig">
            {pain.close}
          </Reveal>
        </div>
        <Reveal as="div" delayMs={200}>
          <ul className="flex flex-col divide-y divide-gletscher/20 text-lg text-gletscher">
            {pain.moments.map((m) => (
              <li key={m} className="flex items-start gap-3 py-3">
                <span aria-hidden className="flex h-[1lh] shrink-0 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
