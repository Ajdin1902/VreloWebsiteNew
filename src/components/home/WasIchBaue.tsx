import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

const leistungen = [
  "Termine & Bestätigungen",
  "Nachfass-Mails",
  "Dateneingabe",
  "Wiederkehrende Kommunikation",
];

export function WasIchBaue() {
  return (
    <Section tone="petrol">
      <Reveal as="p" delayMs={0} id="was-ich-baue-label" className="text-sm font-medium uppercase tracking-wider text-stein">Was ich baue</Reveal>
      <Reveal as="h2" delayMs={80} className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-papier md:text-4xl">
        Eine saubere Quelle – kein Flickenteppich.
      </Reveal>
      <Reveal as="p" delayMs={160} className="mt-5 max-w-2xl text-lg text-gletscher">
        Ich baue maßgeschneiderte Automatisierungen, die den wiederkehrenden Kleinkram
        still im Hintergrund übernehmen.
      </Reveal>
      <Reveal as="ul" delayMs={240} aria-labelledby="was-ich-baue-label" className="mt-8 grid gap-3 sm:grid-cols-2">
        {leistungen.map((leistung) => (
          <li
            key={leistung}
            className="card-depth rounded-2xl border border-gletscher/20 bg-tiefes-wasser/40 px-4 py-3 text-gletscher"
          >
            {leistung}
          </li>
        ))}
      </Reveal>
      <Reveal delayMs={320} className="mt-8 block">
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
