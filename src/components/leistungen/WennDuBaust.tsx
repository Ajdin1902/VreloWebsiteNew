"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { wennDuBaust, type BauPhase } from "@/lib/leistungen-weg";

// The delivery stack ("Wenn du mit mir baust") as a scroll-driven card
// timeline: the section pins while the six build deliverables slide in one by
// one from the right, each card stacking onto the previous with a small
// offset. Mechanic adapted from a shadcn/motion community block; restyled to
// the Vrelo system (papier band, lesepapier cards, amber number badges).
//
// Safety rails this adaptation adds over the original:
// - SSR/no-JS and prefers-reduced-motion render a plain vertical grid — the
//   animated stage only swaps in client-side after hydration (the original
//   read window.innerWidth during render, which crashes the server build).
// - widths are measured from the DOM (stage + first card) instead of
//   window.innerWidth, so the fly-in distance matches the clipped container.

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Hydration-safe reduced-motion read (same pattern as LazyVideo): the server
// snapshot is false so SSR and first client render agree, then React swaps to
// the real preference without a mismatch.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

// Hydration detector without setState-in-effect: the server snapshot is false,
// the client snapshot true, so React swaps to the animated stage right after
// hydration without a mismatch or a cascading render.
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// How far a stacked card peeks out from under the next one (px), at most.
// The actual peek shrinks so the WHOLE settled stack (card + peek * (n-1))
// always fits the stage — on a phone that collapses to 0 and the cards sit
// exactly on top of each other, which is the intended mobile behavior.
const MAX_PEEK = 64;

function fittingPeek(stageWidth: number, cardWidth: number, count: number) {
  if (count < 2 || stageWidth <= 0 || cardWidth <= 0) return 0;
  return Math.max(0, Math.min(MAX_PEEK, Math.floor((stageWidth - cardWidth) / (count - 1))));
}

const CARD_SIZING =
  "min-w-full max-w-full sm:min-w-[58%] sm:max-w-[58%] lg:min-w-[44%] lg:max-w-[44%]";
const CARD_SURFACE = "card-depth rounded-2xl border border-faden bg-lesepapier p-6 md:p-8";

function CardInner({ phase, index }: { phase: BauPhase; index: number }) {
  return (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber font-serif text-lg italic text-tiefes-wasser">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h3 className="mt-4 text-balance text-xl font-semibold text-tiefes-wasser md:text-2xl">
        {phase.title}
      </h3>
      <p className="mt-3 text-pretty text-tinte">{phase.text}</p>
    </>
  );
}

function Heading() {
  return (
    <div className="mx-auto max-w-[44rem] text-center">
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        {wennDuBaust.heading}
      </h2>
      <p className="mt-5 text-pretty text-lg text-tinte">{wennDuBaust.intro}</p>
    </div>
  );
}

function ScrollCard({
  phase,
  index,
  count,
  progress,
  stageWidth,
  cardWidth,
}: {
  phase: BauPhase;
  index: number;
  count: number;
  progress: MotionValue<number>;
  stageWidth: number;
  cardWidth: number;
}) {
  const start = index / count;
  const end = start + 1 / count;
  const peek = fittingPeek(stageWidth, cardWidth, count);
  const settled = -Math.max(cardWidth - peek, 0) * index;
  const x = useTransform(progress, [start, end], [stageWidth, settled]);
  return (
    <motion.li
      data-card={phase.id}
      style={{ x: index > 0 ? x : 0 }}
      className={`${CARD_SURFACE} ${CARD_SIZING}`}
    >
      <CardInner phase={phase} index={index} />
    </motion.li>
  );
}

function ScrollStage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLOListElement>(null);
  const [dims, setDims] = useState({ stage: 0, card: 0 });
  const { scrollYProgress } = useScroll({ target: scrollRef });

  useEffect(() => {
    const measure = () =>
      setDims({
        stage: stageRef.current?.offsetWidth ?? 0,
        card: stageRef.current?.querySelector("li")?.getBoundingClientRect().width ?? 0,
      });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const count = wennDuBaust.phases.length;
  return (
    <div ref={scrollRef} className="relative h-[330vh]">
      {/* overflow-hidden sits on the sticky element itself — on an ancestor it
          would break position: sticky. */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Heading />
          <ol ref={stageRef} className="mt-10 flex flex-nowrap items-stretch">
            {wennDuBaust.phases.map((phase, index) => (
              <ScrollCard
                key={phase.id}
                phase={phase}
                index={index}
                count={count}
                progress={scrollYProgress}
                stageWidth={dims.stage}
                cardWidth={dims.card}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function StaticStack() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Heading />
      <ol className="mt-10 grid gap-6 md:grid-cols-2">
        {wennDuBaust.phases.map((phase, index) => (
          <li key={phase.id} data-card={phase.id} className={CARD_SURFACE}>
            <CardInner phase={phase} index={index} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function WennDuBaust() {
  const reduced = usePrefersReducedMotion();
  const mounted = useMounted();
  const animated = mounted && !reduced;

  return (
    <section aria-label={wennDuBaust.heading} className="bg-papier text-tinte">
      {animated ? <ScrollStage /> : <StaticStack />}
    </section>
  );
}
