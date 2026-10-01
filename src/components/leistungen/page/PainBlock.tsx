import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import type { LeistungPage } from "@/lib/leistungenPages";

// „Kennst du das?“: the homepage Problem pattern (deep band, contained list
// panel, centered spine), reused on every Leistungen subpage.
export function PainBlock({ pain }: { pain: LeistungPage["pain"] }) {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-problem.webp" tintRgb="10 37 56" tintOpacity={0.6} />
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {pain.heading}
        </Reveal>
        <Reveal as="div" delayMs={120} className="card-depth mx-auto mt-8 max-w-xl rounded-2xl border border-gletscher/25 bg-gletscher/10 p-8 text-left">
          <ul className="flex flex-col gap-3 text-lg text-gletscher">
            {pain.moments.map((m) => (
              <li key={m} className="flex items-start gap-3">
                <span aria-hidden className="flex h-[1lh] shrink-0 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal as="p" delayMs={200} className="mt-7 text-pretty text-lg text-gletscher">
          {pain.close}
        </Reveal>
      </div>
    </Section>
  );
}
