import Link from "next/link";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { leistungenPages, leistungHref } from "@/lib/leistungenPages";

// The seven services as links into their subpages (spec 2026-10-01 §3.4).

// Spine A "die Quelle": a dark blue-hour karst pool with ripples spreading from a
// single drop — the effect of taking the tasks off the plate, rippling outward.
// The image is very dark (mean ~16,52,75), so it only needs a light 0.5 tint to
// keep the ripples visible while light text clears AA with room (heading papier
// 8.5:1, body gletscher 9.2:1, chips gletscher 5.7:1 measured).
export function WasIchBaue() {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-wasichbaue.webp" tintRgb="10 37 56" tintOpacity={0.5} />
      {/* Centered spine: the offer leads, the service chips below carry the visual. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} id="was-ich-baue-heading" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          Automatisieren. Befähigen. Betreiben.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-balance text-lg text-gletscher">
          Von der ersten Automatisierung bis zum laufenden System: such dir aus, wo du anfängst.
        </Reveal>
      </div>
      <Reveal as="ul" delayMs={200} aria-labelledby="was-ich-baue-heading" className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leistungenPages.map((p, i) => (
          // Seven cards leave the last one alone in its row: center it (half
          // width in the two-column grid, middle column in the three-column one).
          <li
            key={p.slug}
            className={
              i === leistungenPages.length - 1
                ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.375rem)] lg:col-span-1 lg:col-start-2 lg:mx-0 lg:w-auto"
                : undefined
            }
          >
            <Link
              href={leistungHref(p.slug)}
              className="card-depth block h-full rounded-2xl border border-gletscher/25 bg-gletscher/10 px-4 py-3 text-center text-gletscher transition-colors hover:border-honig hover:text-papier focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
            >
              {p.navLabel}
            </Link>
          </li>
        ))}
      </Reveal>
      <Reveal delayMs={280} className="mt-8 block text-center">
        <Link
          href="/leistungen"
          className="group inline-block rounded-sm font-medium text-honig underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
        >
          Alle Leistungen ansehen{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </Reveal>
    </Section>
  );
}
