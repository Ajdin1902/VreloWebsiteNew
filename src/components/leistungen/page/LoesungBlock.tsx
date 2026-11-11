import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { Loesung } from "@/lib/leistungenPages";
import { WartungTabelle } from "./WartungTabelle";

// The Lösung in three numbered steps (slim redesign 2026-11-11), on paper after
// the dark „Kennst du das?“. KI-Automatisierung adds its sub-services as small
// cards; Betreuung swaps the steps for the Wartung table. Each KI card
// carries the anchor an old URL 308s to, scroll margin on the same element so
// the sticky header never covers it.
export function LoesungBlock({ loesung }: { loesung: Loesung }) {
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {loesung.heading}
        </Reveal>
        {loesung.schritte ? (
          <Reveal as="ol" delayMs={120} className="mt-10 grid gap-5 md:grid-cols-3">
            {loesung.schritte.map((s, i) => (
              <li key={s.title} className="card-depth rounded-2xl bg-tiefes-wasser p-6 md:p-7">
                <p className="font-serif text-3xl italic text-honig" aria-hidden="true">
                  {i + 1}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-papier">{s.title}</h3>
                <p className="mt-2 text-pretty text-gletscher">{s.text}</p>
              </li>
            ))}
          </Reveal>
        ) : null}
        {loesung.tabelle === "wartung" ? <WartungTabelle /> : null}
        {loesung.karten ? (
          // No Reveal here: its hidden offset would move the 308 anchors under the header.
          <div className="mt-14">
            <h3 className="text-2xl font-semibold tracking-tight text-tiefes-wasser">{loesung.kartenHeading}</h3>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loesung.karten.map((k) => (
                <li key={k.id} id={k.id} className="scroll-mt-24 rounded-2xl bg-sonnenlicht p-5">
                  <p className="font-semibold text-tiefes-wasser">{k.title}</p>
                  <p className="mt-1 text-pretty text-tinte">{k.kurz}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
