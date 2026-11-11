import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { Agent } from "@/lib/kiAgenten";

// One agent per department (Ajdin 2026-11-11), on paper after the dark hero.
// Five sunlit cards (three, then two on a six-column grid, so no row ends in
// a gap), then the Inhaber-Assistent as a dark card across the full width: the
// top floor that builds on the others, never a sixth card that comes along.
// Each card ends on its result in ember serif, the way Ergebnis closes the
// Wartung table; under it a chip names the client, only where I built that agent.
const spans = (i: number) => (i < 3 ? "lg:col-span-2" : i === 4 ? "md:col-span-2 lg:col-span-3" : "lg:col-span-3");

function Karte({ a, gebautPrefix, className }: { a: Agent; gebautPrefix: string; className: string }) {
  const dunkel = Boolean(a.oberste);
  return (
    <li
      data-agent={a.id}
      data-oberste={a.oberste ? "" : undefined}
      className={`card-depth flex flex-col rounded-2xl p-6 md:p-7 ${dunkel ? "bg-tiefes-wasser" : "bg-sonnenlicht"} ${className}`}
    >
      <h3 className={`text-xl font-semibold ${dunkel ? "text-papier" : "text-tiefes-wasser"}`}>{a.name}</h3>
      <ul
        className={`mt-4 flex list-disc flex-col gap-2 pl-5 ${dunkel ? "text-gletscher marker:text-honig md:grid md:grid-cols-3 md:gap-x-8" : "text-tinte marker:text-vrelo-petrol"}`}
      >
        {a.aufgaben.map((t) => (
          <li key={t} className="text-pretty">
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <p
          className={`border-t pt-4 font-serif text-lg italic leading-snug text-pretty ${
            dunkel ? "border-gletscher/20 text-honig" : "border-ember/20 text-ember"
          }`}
        >
          {a.ergebnis}
        </p>
        {a.gebautFuer ? (
          <span
            className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${dunkel ? "bg-honig text-tiefes-wasser" : "bg-tiefes-wasser text-papier"}`}
          >
            {gebautPrefix} {a.gebautFuer}
          </span>
        ) : null}
      </div>
    </li>
  );
}

export function AgentenBlock({ heading, agenten, gebautPrefix }: { heading: string; agenten: Agent[]; gebautPrefix: string }) {
  const abteilungen = agenten.filter((a) => !a.oberste);
  const oberste = agenten.filter((a) => a.oberste);
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-6xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {heading}
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {abteilungen.map((a, i) => (
            <Karte key={a.id} a={a} gebautPrefix={gebautPrefix} className={spans(i)} />
          ))}
          {oberste.map((a) => (
            <Karte key={a.id} a={a} gebautPrefix={gebautPrefix} className="md:col-span-2 lg:col-span-6" />
          ))}
        </ul>
      </div>
    </Section>
  );
}
