import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { LazyVideo } from "@/components/LazyVideo";
import type { LeistungPage } from "@/lib/leistungenPages";

// The comprehension core: one concrete run, before → three steps → after.
// Nobody understands „Prozessautomatisierung“, everyone understands three
// steps. A page can instead show a real clip on its own (credibility in action).
export function ExampleBlock({ example }: { example: LeistungPage["example"] }) {
  return (
    <Section tone="petrol" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-bausteine-b.webp" tintRgb="27 80 99" tintOpacity={0.7} />
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {example.heading}
        </Reveal>

        {"video" in example ? (
          // The clip on its own, large: the real run carries the page (Ajdin 2026-10-01).
          <Reveal as="figure" delayMs={120} className="mx-auto mt-10 max-w-2xl">
            <LazyVideo
              mp4={example.video.src}
              poster={example.video.poster}
              className="w-full rounded-2xl shadow-deepwater"
            />
          </Reveal>
        ) : (
          <>
            {/* Vorher: a quiet dark card, the state the reader knows. */}
            <Reveal as="div" delayMs={80} className="mt-8 flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-gletscher/25 bg-tiefes-wasser/45 p-6 sm:flex-row sm:items-center sm:gap-5 md:p-7">
              <span className="shrink-0 rounded-full bg-gletscher/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gletscher">
                Vorher
              </span>
              <p className="text-pretty text-lg text-gletscher md:text-xl">{example.before}</p>
            </Reveal>
            <Reveal as="ol" delayMs={160} className="mt-6 grid gap-5 md:grid-cols-3">
              {example.steps.map((s, i) => (
                <li key={s} className="card-depth rounded-2xl bg-papier p-6 text-tinte">
                  <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber font-semibold text-tiefes-wasser">
                    {i + 1}
                  </span>
                  <p className="mt-3">{s}</p>
                </li>
              ))}
            </Reveal>
            {/* Nachher: the payoff, in the warm sunlight colour so it reads as
                the surface the run comes up to (Ajdin 2026-10-01: make it pop). */}
            <Reveal
              as="div"
              delayMs={240}
              data-nachher
              className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-sonnenlicht p-6 shadow-deepwater sm:flex-row sm:items-center sm:gap-5 md:p-8"
            >
              <span className="shrink-0 rounded-full bg-tiefes-wasser px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-papier">
                Nachher
              </span>
              <p className="text-pretty font-serif text-xl leading-snug text-tiefes-wasser md:text-2xl">{example.after}</p>
            </Reveal>
          </>
        )}
      </div>
    </Section>
  );
}
