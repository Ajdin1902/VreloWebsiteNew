import Link from "next/link";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { woranEsScheitert } from "@/lib/leistungen-weg";

// The founder's obstacle worksheet made visible: each doubt that stops an
// owner, answered with a NAMED solution and a link into the funnel or FAQ.
// Petrol band on the near-featureless texture (a text-carrying band, so grain
// rather than a picture), glass gletscher tiles like the other deep sections;
// warm link text uses honig (amber fails AA for small text on petrol).
export function WoranEsScheitert() {
  return (
    <Section tone="petrol" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/section-texture.webp" tintRgb="27 80 99" tintOpacity={0.65} />
      <Reveal>
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
            {woranEsScheitert.heading}
          </h2>
          <p className="mt-5 text-pretty text-lg text-gletscher">{woranEsScheitert.intro}</p>
        </div>
      </Reveal>
      <Reveal as="ul" delayMs={120} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {woranEsScheitert.rows.map((row) => (
          <li
            key={row.einwand}
            className="card-depth flex flex-col rounded-2xl border border-gletscher/25 bg-gletscher/10 p-6"
          >
            {/* sm:min-h-[2lh] reserves two lines for one- and two-line Einwände,
                so the amber solution names align across a row (Werkzeuge
                pattern). Not on mobile: the grid is single-column there, so the
                reserved line would only leave a gap. */}
            <p className="font-serif text-lg italic text-papier sm:min-h-[2lh]">{row.einwand}</p>
            <p className="mt-4 font-semibold text-honig">{row.loesungName}</p>
            <p className="mt-2 flex-1 text-pretty text-gletscher">{row.satz}</p>
            <p className="mt-4">
              <Link
                href={row.link.href}
                className="text-sm font-medium text-papier underline underline-offset-4 hover:text-honig"
              >
                {row.link.label}
              </Link>
            </p>
          </li>
        ))}
      </Reveal>
    </Section>
  );
}
