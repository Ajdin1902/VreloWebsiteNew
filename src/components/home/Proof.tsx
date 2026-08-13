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
      {/* Sunset-Echo surface: a pale radial echo of the MerakClose sunset
          (sonnenlicht -> honig -> sonnenlicht, each mixed toward paper so it stays
          light). Warms the section into the finale below -- Proof reads as the dawn,
          MerakClose as the sunset -- instead of the old cool teal that echoed the
          petrol header. Cards are a honey-cream (honig 35% -> paper), a step lighter
          than the band's core so they still lift; heading + card titles are ember (the
          MerakClose heading tone), body stays near-black -- all clear AA (ember on the
          honey card ~5:1, ember heading on the band ~4.5:1 large text). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 120%, color-mix(in oklab, var(--color-sonnenlicht) 70%, var(--color-papier)), color-mix(in oklab, var(--color-honig) 55%, var(--color-papier)) 60%, color-mix(in oklab, var(--color-sonnenlicht) 70%, var(--color-papier)) 100%)",
        }}
      />

      {/* Centered spine: heading + connector on the central axis. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-ember md:text-4xl">
          Sorgfältig gebaut. Verlässlich im Betrieb.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-tinte">
          Worauf du dich verlassen kannst:
        </Reveal>
      </div>

      <Reveal as="ul" delayMs={160} className="mx-auto mt-10 grid max-w-3xl gap-5 text-left sm:grid-cols-2">
        {values.map((v) => (
          <li key={v.title} className="card-depth rounded-2xl border border-[color-mix(in_oklab,var(--color-honig)_45%,var(--color-faden))] bg-[color-mix(in_oklab,var(--color-honig)_35%,var(--color-papier))] p-6">
            <h3 className="text-xl font-semibold text-ember">{v.title}</h3>
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
