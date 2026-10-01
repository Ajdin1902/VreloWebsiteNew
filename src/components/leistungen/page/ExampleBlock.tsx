import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { LazyVideo } from "@/components/LazyVideo";
import type { LeistungPage } from "@/lib/leistungenPages";

// The comprehension core: one concrete run, before → three steps → after.
// Nobody understands „Prozessautomatisierung“, everyone understands three
// steps. An optional real clip sits above the steps (credibility in action).
export function ExampleBlock({ example }: { example: LeistungPage["example"] }) {
  return (
    <Section tone="petrol" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-bausteine-b.webp" tintRgb="27 80 99" tintOpacity={0.7} />
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {example.heading}
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 max-w-2xl text-pretty text-lg text-gletscher">
          {example.before}
        </Reveal>

        {example.video ? (
          <Reveal as="figure" delayMs={120} className="mx-auto mt-10 max-w-sm">
            <LazyVideo
              mp4={example.video.src}
              poster={example.video.poster}
              className="w-full rounded-2xl shadow-deepwater"
            />
            <figcaption className="mt-3 text-center text-sm text-gletscher">{example.video.caption}</figcaption>
          </Reveal>
        ) : null}

        <Reveal as="ol" delayMs={160} className="mt-10 grid gap-5 md:grid-cols-3">
          {example.steps.map((s, i) => (
            <li key={s} className="card-depth rounded-2xl bg-papier p-6 text-tinte">
              <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber font-semibold text-tiefes-wasser">
                {i + 1}
              </span>
              <p className="mt-3">{s}</p>
            </li>
          ))}
        </Reveal>

        <Reveal as="p" delayMs={240} className="mt-8 max-w-2xl text-pretty text-lg font-medium text-papier">
          {example.after}
        </Reveal>
      </div>
    </Section>
  );
}
