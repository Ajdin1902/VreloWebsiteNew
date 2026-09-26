import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { CHECK_CTA, CHECK_SRC, CHECK_TEASER, SAMPLE_ANSWERS, checkHref } from "@/lib/prozessCheckCta";
import { RESULT_UI, hoursLabel, resultCopy } from "@/lib/prozessCheck";

// The front door on the homepage (spec 2026-09-26): right after the Problem
// beat asks „how much time?“ in general, this section asks „how many hours for
// you?“ and shows the way in. It replaced Steps: its three steps are how
// starting with me works, and the last one carries the build path.
//
// The example card is the Perceived-Likelihood lever: the owner sees what he
// gets before he clicks. It is rendered from the real resultCopy() with fixed
// sample answers, so it can never drift from the live result screen, and it is
// always visibly labelled „Beispiel“ so it never reads as a claim (UWG §5).
//
// Plain petrol band, no backdrop image: it breaks the run of image sections on
// purpose, so the one action on the page reads as different. Papier heading and
// gletscher body on vrelo-petrol, the lesepapier card lifts off it (same tokens
// as the live result card).
const sample = resultCopy(SAMPLE_ANSWERS);
const maxHours = Math.max(...sample.topAreas.map((a) => a.hours));

export function ProzessCheckSection() {
  return (
    <Section id="prozess-check" tone="petrol" className="scroll-mt-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <div>
          <Reveal as="p" delayMs={0} className="text-sm font-semibold uppercase tracking-wider text-honig">
            {CHECK_TEASER.eyebrow}
          </Reveal>
          <Reveal as="h2" delayMs={80} className="mt-3 text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
            {CHECK_TEASER.heading}
          </Reveal>
          <Reveal as="ol" delayMs={160} className="mt-8 flex flex-col gap-6">
            {CHECK_TEASER.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber font-serif text-lg italic text-tiefes-wasser"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-papier">{s.title}</h3>
                  <p className="mt-1 text-pretty text-gletscher">{s.text}</p>
                </div>
              </li>
            ))}
          </Reveal>
          <Reveal delayMs={240} className="mt-8">
            <CTAButton href={checkHref(CHECK_SRC.homeCheck)} tone="petrol">
              {CHECK_CTA.label}
            </CTAButton>
            <p className="mt-3 text-sm text-gletscher">{CHECK_CTA.microcopy}</p>
          </Reveal>
        </div>

        <Reveal delayMs={200}>
          <figure className="card-depth rounded-2xl border border-faden bg-lesepapier p-6 md:p-8">
            <figcaption className="inline-block rounded-full bg-tiefes-wasser/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-tiefes-wasser">
              {CHECK_TEASER.exampleLabel}
            </figcaption>
            <p className="mt-4 text-balance font-serif text-3xl text-tiefes-wasser">{sample.headline}</p>
            <p className="mt-1 text-pretty font-serif text-lg text-tiefes-wasser">{sample.sub}</p>
            <p className="mt-6 text-sm font-medium uppercase tracking-wider text-stumm">{RESULT_UI.profileLabel}</p>
            <ul className="mt-3 space-y-3">
              {sample.topAreas.map((a) => (
                <li key={a.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-tiefes-wasser">{a.label}</span>
                    <span className="shrink-0 text-stumm">{hoursLabel(a.hours)}/Woche</span>
                  </div>
                  <div aria-hidden className="mt-1.5 h-2 rounded-full bg-faden">
                    <div className="h-2 rounded-full bg-amber" style={{ width: `${(a.hours / maxHours) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-pretty text-sm text-tinte">{sample.topAreas[0].sentence}</p>
            <p className="mt-4 text-xs text-stumm">{CHECK_TEASER.exampleNote}</p>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
