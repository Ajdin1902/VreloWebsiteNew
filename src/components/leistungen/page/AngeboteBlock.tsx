import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { LeistungPage } from "@/lib/leistungenPages";

const cardClass = "card-depth flex h-full flex-col rounded-2xl border border-faden bg-papier p-6 text-tinte";

// The sub-services of a page as one overview (Ajdin 2026-11-11: fewer pages,
// the sub-services named on the page). A card with a target links to its
// section (#…) or page; the others only name what gets built.
export function AngeboteBlock({ angebote }: { angebote: NonNullable<LeistungPage["angebote"]> }) {
  const cols = angebote.karten.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";
  return (
    <Section tint>
      <div className="mx-auto max-w-6xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {angebote.heading}
        </Reveal>
        <Reveal as="ul" delayMs={120} className={`mt-8 grid gap-5 sm:grid-cols-2 ${cols}`}>
          {angebote.karten.map((k) => (
            <li key={k.title}>
              {k.href ? (
                <Link
                  href={k.href}
                  className={`${cardClass} transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5`}
                >
                  <span className="hyphens-auto text-lg font-semibold text-tiefes-wasser">{k.title}</span>
                  <span className="mt-2 flex-1 text-pretty">{k.kurz}</span>
                  <span aria-hidden="true" className="mt-4 text-sm font-semibold text-vrelo-petrol">
                    →
                  </span>
                </Link>
              ) : (
                <div className={cardClass}>
                  <span className="hyphens-auto text-lg font-semibold text-tiefes-wasser">{k.title}</span>
                  <span className="mt-2 text-pretty">{k.kurz}</span>
                </div>
              )}
            </li>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
