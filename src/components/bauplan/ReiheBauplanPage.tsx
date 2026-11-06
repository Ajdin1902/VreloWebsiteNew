import type { ReactNode } from "react";
import type { ReiheNische } from "@/lib/bauplanReihe";
import { abschluss, abschlussHref, deckblatt, formular, wochenplan } from "@/lib/bauplanReihe/shared";

// Web mirror of the series PDF cover: the owner's question, the job flow with the circled
// loss verbs, the statistic with its visible source, the five days, then the form and a
// short close teaser. Visual vocabulary follows ElektroBauplanPage.
const btn =
  "inline-flex items-center justify-center rounded-lg bg-amber px-5 py-3 text-sm font-bold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honig focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser";

export function ReiheBauplanPage({ data, form }: { data: ReiheNische; form?: ReactNode }) {
  const { statistik } = data;
  return (
    <div className="bg-papier text-tiefes-wasser">
      <section id="schmerz" className="bg-tiefes-wasser py-10 text-papier sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-honig">{data.kicker}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{data.title}</h1>
          <h2 className="mt-8 text-xl font-semibold text-honig">{data.schmerz}</h2>
          <ol className="mt-4 flex flex-col gap-2">
            {data.auftragsweg.map((s) => (
              <li key={s.schritt} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-white/10 px-3 py-2 leading-snug">
                <span>{s.schritt}</span>
                {s.verlust ? (
                  <span className="rounded-full border-2 border-amber px-2.5 py-0.5 text-sm font-semibold text-honig">
                    <span className="sr-only">Verlust: </span>
                    {s.verlust}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-4 leading-relaxed text-gletscher">{deckblatt.kreisSatz}</p>
          {statistik ? (
            <div data-testid="statistik" className="mt-6 flex flex-col gap-2 border-t border-honig/35 pt-5 sm:flex-row sm:items-center sm:gap-5">
              <span className="whitespace-nowrap font-serif text-5xl font-semibold italic leading-none text-honig">{statistik.zahl}</span>
              <div>
                <p className="leading-relaxed">{statistik.satz}</p>
                <p className="mt-2 text-xs text-stein">
                  {statistik.quelle} ·{" "}
                  <a href={statistik.href} className="whitespace-nowrap underline underline-offset-2">
                    {statistik.linkText}
                  </a>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto flex max-w-2xl flex-col gap-9 px-4 pb-14 pt-9 sm:px-6">
        <section id="woche" className="rounded-2xl border-l-4 border-honig bg-sonnenlicht p-6">
          <h2 className="text-2xl font-bold">{wochenplan.heading}</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {wochenplan.tage.map((t, i) => (
              <li key={t} className="flex items-baseline gap-3 leading-relaxed">
                <span aria-hidden="true" className="w-6 shrink-0 font-serif text-3xl font-semibold italic leading-none text-vrelo-petrol">
                  {i + 1}
                </span>
                <span>
                  <span className="sr-only">Tag {i + 1}: </span>
                  {t}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-semibold">{wochenplan.schluss}</p>
          <p className="mt-1 text-stumm">{deckblatt.ziel}</p>
        </section>

        <section id="pdf" className="scroll-mt-6 rounded-2xl border-2 border-amber bg-lesepapier p-6">
          <h2 className="text-2xl font-bold">{formular.heading}</h2>
          {form ? <div className="mt-4">{form}</div> : null}
        </section>

        <section id="abschluss" className="rounded-2xl bg-tiefes-wasser p-6 text-center text-papier sm:p-8">
          <h2 className="text-balance text-2xl font-bold leading-snug">{abschluss.heading}</h2>
          <a href={abschlussHref(data.slug, "web")} className={`mt-5 ${btn}`}>
            {abschluss.button}
          </a>
        </section>
      </div>
    </div>
  );
}
