import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

const values = [
  {
    title: "Ein Ansprechpartner.",
    body: "Du redest immer mit mir – kein Team, keine Tickets, keine Warteschleife.",
  },
  {
    title: "Praxiserprobt.",
    body: "Seit über drei Jahren automatisiere ich Prozesse in einem internationalen Unternehmen – du bekommst diese Erfahrung in jedem System.",
  },
  {
    title: "Maßgeschneidert statt von der Stange.",
    body: "Ein System, das zu deinem Betrieb passt – bis ins Detail dokumentiert.",
  },
  {
    title: "Du wartest nichts.",
    body: "Einrichten, absichern, am Laufen halten – das übernehme ich. Du musst nichts lernen.",
  },
];

export function Proof() {
  return (
    <Section tone="paper" className="relative isolate overflow-hidden border-t border-faden">
      {/* Soft brand-teal surface: a tint of the brand petrol over paper (color-mix
          30 %) — cool but warmer/greener than gletscher, clearly Vrelo. Breaks the
          warm-paper run and sets up the cool→warm close into the warm MerakClose
          below; warm papier value-cards lift off it, dark text stays AA. A faint
          water texture sits beneath the tint (the site's water motif) for depth. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/section-texture.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[color-mix(in_oklab,var(--color-vrelo-petrol)_30%,var(--color-papier))] opacity-90"
      />

      {/* Centered spine: heading + connector on the central axis. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          Sorgfältig gebaut. Verlässlich im Betrieb.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-tinte">
          Worauf du dich verlassen kannst:
        </Reveal>
      </div>

      <Reveal as="ul" delayMs={160} className="mx-auto mt-10 grid max-w-3xl gap-5 text-left sm:grid-cols-2">
        {values.map((v) => (
          <li key={v.title} className="card-depth rounded-2xl border border-faden bg-papier p-6">
            <h3 className="text-xl font-semibold text-vrelo-petrol">{v.title}</h3>
            <p className="mt-2 text-tinte">{v.body}</p>
          </li>
        ))}
      </Reveal>

      <Reveal as="p" delayMs={240} className="mx-auto mt-8 max-w-xl text-center text-sm text-tinte">
        Erste Kundenreferenzen folgen, sobald die laufenden Projekte abgeschlossen sind.
      </Reveal>
    </Section>
  );
}
