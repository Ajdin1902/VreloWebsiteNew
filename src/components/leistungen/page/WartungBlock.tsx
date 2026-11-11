import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { WARTUNG_HINWEIS, WARTUNG_TITEL, wartungTiers, wartungZeilen } from "@/lib/wartung";

// The three Wartung tiers, contents only (2026-11-11): prices stay in the FAQ
// (offer pages carry no price). Standard is the tier most clients should pick,
// so it carries the stronger frame; no „beliebt“ label, that would be a claim.
export function WartungBlock() {
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-6xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {WARTUNG_TITEL}
        </Reveal>
        <Reveal as="div" delayMs={120} className="mt-10 grid gap-6 lg:grid-cols-3">
          {wartungTiers.map((t) => (
            <article
              key={t.id}
              className={`card-depth flex flex-col rounded-2xl bg-papier p-6 md:p-8 ${t.id === "standard" ? "border-2 border-vrelo-petrol" : "border border-faden"}`}
            >
              <h3 className="text-2xl font-semibold text-tiefes-wasser">{t.name}</h3>
              <p className="mt-1 font-serif text-lg italic text-ember">{t.motto}</p>
              {t.grenze ? <p className="mt-2 text-sm font-semibold text-stumm">{t.grenze}</p> : null}
              <dl className="mt-6 flex flex-col gap-4">
                {wartungZeilen.map((z) => (
                  <div key={z.id}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-stumm">{z.label}</dt>
                    <dd className="mt-1 text-pretty text-tinte">{t.zeilen[z.id]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </Reveal>
        <p className="mt-8 max-w-3xl text-pretty text-tinte">{WARTUNG_HINWEIS}</p>
      </div>
    </Section>
  );
}
