import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { LeistungPage } from "@/lib/leistungenPages";

// Named scenes from real cases (Ajdin 2026-11-11, after the Weboro review):
// who, before, after, and the confirmed result where there is one. The labels
// come from ExampleBlock's vocabulary, so the two read as one family.
export function SzenenBlock({ szenen }: { szenen: NonNullable<LeistungPage["szenen"]> }) {
  return (
    <Section id={szenen.id} tone="paper" className="scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {szenen.heading}
        </Reveal>
        <div className="mt-10 flex flex-col gap-12">
          {szenen.items.map((s, i) => (
            <Reveal key={s.titel} as="article" delayMs={80 + i * 80}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stumm">{s.kunde}</p>
              <h3 className="mt-2 text-balance text-2xl font-semibold text-tiefes-wasser">{s.titel}</h3>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-tiefes-wasser p-6 md:p-7">
                  <span className="rounded-full bg-gletscher/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gletscher">
                    Vorher
                  </span>
                  <p className="mt-4 text-pretty text-lg text-gletscher">{s.vorher}</p>
                </div>
                <div className="rounded-2xl bg-sonnenlicht p-6 shadow-deepwater md:p-7">
                  <span className="rounded-full bg-tiefes-wasser px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-papier">
                    Nachher
                  </span>
                  <p className="mt-4 text-pretty font-serif text-xl leading-snug text-tiefes-wasser">{s.nachher}</p>
                </div>
              </div>
              {s.ergebnis ? (
                <p className="mt-5 inline-block rounded-full bg-amber px-4 py-2 font-semibold text-tiefes-wasser">{s.ergebnis}</p>
              ) : null}
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
