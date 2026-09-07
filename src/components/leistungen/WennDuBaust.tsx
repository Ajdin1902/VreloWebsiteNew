import { Reveal } from "@/components/Reveal";
import { wennDuBaust, type BauPhase } from "@/lib/leistungen-weg";

// The delivery stack ("Wenn du mit mir baust") as a normal-height section that
// matches the rest of /leistungen: the warm "surface break" between the two
// petrol bands. Sonnenlicht band, warm near-white lichtpapier cards, ember
// heading, and inverse navy/sonnenlicht number badges (amber blends on the warm
// ground). Rendered as a two-then-three-column card grid with a single fade-up
// Reveal, the same rhythm as the neighbouring sections.
//
// History: this used to pin full-screen and scrub the six cards in horizontally
// as a stacked fan (motion/react useScroll). That made the band a whole viewport
// tall with large empty space above and below the cards, so it was replaced with
// this compact grid on founder request (2026-09-07). A grid also keeps every card
// readable, which the fan only managed while you were actively scrubbing.

const CARD_SURFACE = "card-depth rounded-2xl border border-faden bg-lichtpapier p-6 md:p-8";

function CardInner({ phase, index }: { phase: BauPhase; index: number }) {
  return (
    <>
      {/* Navy badge, sonnenlicht numeral: on the warm sonnenlicht band amber
          blends into the ground, so the badge goes inverse (same call as the
          ClosingCta button on its warm band). */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vrelo-petrol font-serif text-lg italic text-sonnenlicht">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h3 className="mt-4 text-balance text-xl font-semibold text-tiefes-wasser md:text-2xl">
        {phase.title}
      </h3>
      <p className="mt-3 text-pretty text-tinte">{phase.text}</p>
    </>
  );
}

export function WennDuBaust() {
  return (
    <section aria-label={wennDuBaust.heading} className="bg-sonnenlicht text-tinte">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="mx-auto max-w-[44rem] text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-ember md:text-4xl">
              {wennDuBaust.heading}
            </h2>
          </div>
        </Reveal>
        <Reveal as="ol" delayMs={120} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wennDuBaust.phases.map((phase, index) => (
            <li key={phase.id} className={CARD_SURFACE}>
              <CardInner phase={phase} index={index} />
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
