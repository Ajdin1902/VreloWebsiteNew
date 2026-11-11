import { Fragment } from "react";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { GrafikBlock } from "./GrafikBlock";
import { VergleichBlock } from "./VergleichBlock";
import { NoteCard } from "./NoteBlock";
import type { Abschnitt } from "@/lib/leistungenPages";

// The four former KI subpages as sections of KI-Automatisierung (2026-11-11).
// Each keeps its anchor (old URLs redirect to /leistungen/ki-automatisierung#<id>),
// so the id and scroll-mt sit on the same element (Website/CLAUDE.md gotcha).
// Text band: petrol over the featureless texture (subpage backdrop rule).
export function AbschnitteBlock({ abschnitte }: { abschnitte: Abschnitt[] }) {
  return (
    <>
      {abschnitte.map((a) => (
        <Fragment key={a.id}>
          <Section id={a.id} tone="petrol" className="relative isolate scroll-mt-24 overflow-hidden">
            <SectionBackdrop src="/images/section-texture.webp" tintRgb="27 80 99" tintOpacity={0.6} />
            <div className="mx-auto max-w-3xl">
              <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
                {a.title}
              </Reveal>
              <Reveal as="p" delayMs={80} className="mt-4 text-pretty font-serif text-xl leading-snug text-honig">
                {a.lead}
              </Reveal>
              <Reveal as="div" delayMs={160} className="mt-6 flex flex-col gap-4 text-pretty text-lg text-gletscher">
                {a.absaetze.map((s) => (
                  <p key={s}>{s}</p>
                ))}
              </Reveal>
              {a.note ? (
                <div className="mt-10">
                  <NoteCard note={a.note} />
                </div>
              ) : null}
            </div>
          </Section>
          {a.grafik ? <GrafikBlock grafik={a.grafik} /> : null}
          {a.vergleich ? <VergleichBlock vergleich={a.vergleich} current="ki-automatisierung" /> : null}
        </Fragment>
      ))}
    </>
  );
}
