import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import type { Agent } from "@/lib/kiAgenten";
import { AgentenKreis } from "./AgentenKreis";

// One agent per department (Ajdin 2026-11-11) on a deep, calm band (the same
// near-featureless texture as the proof band, so the diagram stays readable).
// From lg up the agents circle Dein Betrieb (AgentenKreis); below lg the circle
// would not fit, so Dein Betrieb sits on top and the agents hang off one line
// as cards with tasks and result. Both are in the DOM; CSS shows one.
export function AgentenBlock({
  heading,
  agenten,
  mitte,
  hinweis,
  schliessen,
}: {
  heading: string;
  agenten: Agent[];
  mitte: { titel: string; text: string };
  hinweis: string;
  schliessen: string;
}) {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/section-texture.webp" tintRgb="10 37 56" tintOpacity={0.7} />
      <div className="mx-auto max-w-6xl">
        <Reveal as="h2" className="text-balance text-center text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {heading}
        </Reveal>

        <div className="mt-12 hidden lg:block">
          <AgentenKreis agenten={agenten} mitte={mitte} hinweis={hinweis} schliessen={schliessen} />
        </div>

        <div data-liste className="mt-10 lg:hidden">
          <div className="rounded-2xl bg-sonnenlicht p-6 text-center shadow-deepwater">
            <p className="text-2xl font-semibold tracking-tight text-tiefes-wasser">{mitte.titel}</p>
            <p className="mt-2 text-pretty text-tinte">{mitte.text}</p>
          </div>
          <ul className="ml-4 flex flex-col gap-5 border-l-2 border-honig/40 pb-2 pl-6 pt-6">
            {agenten.map((a) => {
              const oben = Boolean(a.oberste);
              return (
                <li
                  key={a.id}
                  data-agent={a.id}
                  className={`relative rounded-2xl border p-5 ${oben ? "border-honig bg-honig" : "border-gletscher/20 bg-vrelo-petrol/80"}`}
                >
                  <span aria-hidden className="absolute -left-[33px] top-7 h-3 w-3 rounded-full bg-honig" />
                  <h3 className={`text-lg font-semibold ${oben ? "text-tiefes-wasser" : "text-papier"}`}>{a.name}</h3>
                  <ul className={`mt-3 flex list-disc flex-col gap-1.5 pl-5 ${oben ? "text-tiefes-wasser marker:text-tiefes-wasser" : "text-gletscher marker:text-honig"}`}>
                    {a.aufgaben.map((t) => (
                      <li key={t} className="text-pretty">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p
                    className={`mt-4 border-t pt-3 text-pretty font-serif italic leading-snug ${oben ? "border-tiefes-wasser/20 text-tiefes-wasser" : "border-gletscher/20 text-honig"}`}
                  >
                    {a.ergebnis}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
