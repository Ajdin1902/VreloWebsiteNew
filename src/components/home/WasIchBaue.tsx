import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { RippleImage } from "@/components/RippleImage";

// A curated four-chip highlight of the services; the full set lives on /leistungen.
const leistungen = [
  "Anfragen & Leads",
  "Termine & Bestätigungen",
  "Angebote & Rechnungen",
  "Bewertungen einsammeln",
];

export function WasIchBaue() {
  return (
    <Section tone="petrol">
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Reveal as="h2" delayMs={0} id="was-ich-baue-heading" className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
            Ich nehme dir die immer gleichen Aufgaben ab.
          </Reveal>
          <Reveal as="p" delayMs={80} className="mt-5 max-w-2xl text-pretty text-lg text-gletscher">
            Maßgeschneiderte Automatisierungen, die den wiederkehrenden Kleinkram still im
            Hintergrund übernehmen – nichts, das du lernen oder warten musst.
          </Reveal>
        </div>
        {/* The drop-on-water photo carries the live ripple (pointer + a seeded ripple
            every 3s); degrades to the still on reduced-motion / no-WebGL. */}
        <Reveal delayMs={120}>
          <RippleImage
            src="/images/was-ich-baue.webp"
            alt="Ein einzelner Wassertropfen trifft eine ruhige, tiefblaue Wasseroberfläche und bildet klare, ebenmäßige Ringe."
            seedXFraction={0.5}
            seedYFraction={0.55}
            seedIntervalMs={3000}
            className="aspect-[4/5] w-full rounded-2xl shadow-deepwater ring-1 ring-gletscher/10"
          />
        </Reveal>
      </div>
      <Reveal as="ul" delayMs={200} aria-labelledby="was-ich-baue-heading" className="mt-10 grid gap-3 sm:grid-cols-2">
        {leistungen.map((leistung) => (
          <li
            key={leistung}
            className="card-depth rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 px-4 py-3 text-gletscher"
          >
            {leistung}
          </li>
        ))}
      </Reveal>
      <Reveal delayMs={280} className="mt-8 block">
        <Link
          href="/leistungen"
          className="group inline-block rounded-sm font-medium text-honig underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-honig"
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
