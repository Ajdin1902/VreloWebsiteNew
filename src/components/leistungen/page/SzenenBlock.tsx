import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import type { Szenen } from "@/lib/leistungenPages";

// The proof: named scenes from real cases with the confirmed result (Ajdin
// 2026-11-11). A deep band after the paper Lösung, on the near-featureless
// texture: the pebble image made the Vorher text hard to read (Ajdin
// 2026-11-11). Vorher is a solid dark tile, Nachher stays sunlit.
export function SzenenBlock({ szenen }: { szenen: Szenen }) {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/section-texture.webp" tintRgb="10 37 56" tintOpacity={0.65} />
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {szenen.heading}
        </Reveal>
        <div className="mt-10 flex flex-col gap-12">
          {szenen.items.map((s, i) => (
            <Reveal key={s.titel} as="article" delayMs={80 + i * 80}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-honig">{s.kunde}</p>
              <h3 className="mt-2 text-balance text-2xl font-semibold text-papier">{s.titel}</h3>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-gletscher/20 bg-vrelo-petrol/70 p-6 md:p-7">
                  <span className="rounded-full bg-gletscher/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gletscher">
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
