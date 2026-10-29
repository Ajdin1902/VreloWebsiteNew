import type { ReactNode } from "react";
import type { elektroBauplanPage } from "@/lib/elektroBauplanPage";

type Data = typeof elektroBauplanPage;

// Compact by design (spec 2026-10-29 landing §5): pain, solution, what the PDF holds, the form.
// Nothing comes after the form. Layout follows docs/design/elektro-bauplan/landing-mockup.html.
export function ElektroBauplanPage({ data, form }: { data: Data; form?: ReactNode }) {
  const { schmerz, loesung, inhalt, pdf } = data;
  const letzte = schmerz.zeilen.length - 1;
  return (
    <div className="bg-papier text-tiefes-wasser">
      <section id="schmerz" className="bg-tiefes-wasser px-4 py-10 text-papier sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-honig">{data.kicker}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{data.title}</h1>
          <div className="mt-5 text-lg leading-relaxed">
            {schmerz.zeilen.map((z, i) => (
              <p key={z} className={i === letzte ? "font-semibold text-honig" : undefined}>
                {z}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2 border-t border-honig/35 pt-5 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="whitespace-nowrap font-serif text-5xl font-semibold italic leading-none text-honig">
              {schmerz.zahl}
            </span>
            <div>
              <p className="leading-relaxed">{schmerz.satz}</p>
              <p className="mt-2 text-xs text-stein">
                {schmerz.quelle} ·{" "}
                <a href={schmerz.quelleLink.href} className="whitespace-nowrap underline underline-offset-2">
                  {schmerz.quelleLink.text}
                </a>
              </p>
            </div>
          </div>
          <a
            href="#pdf"
            className="mt-7 inline-flex items-center justify-center rounded-lg bg-amber px-5 py-3 text-sm font-bold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honig focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser"
          >
            {schmerz.cta}
          </a>
        </div>
      </section>

      <div className="mx-auto flex max-w-2xl flex-col gap-9 px-4 pb-14 pt-9 sm:px-6">
        <section id="loesung">
          <h2 className="text-2xl font-bold leading-snug">{loesung.heading}</h2>
          <p className="mt-2 leading-relaxed text-stumm">{loesung.sub}</p>
          <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {loesung.flow.map((f, i) => (
              <li
                key={f.wort}
                className={`rounded-lg p-3 text-sm font-semibold leading-snug ${i === loesung.flow.length - 1 ? "bg-sonnenlicht" : "bg-gletscher"}`}
              >
                {f.wort}
                <span className="mt-0.5 block text-xs font-normal text-stumm">{f.zusatz}</span>
              </li>
            ))}
          </ol>
          <table className="mt-5 w-full overflow-hidden rounded-xl border border-faden text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider">
                <th className="w-1/2 bg-lesepapier px-3 py-2 text-stumm">{loesung.vergleich.heute}</th>
                <th className="w-1/2 bg-gletscher px-3 py-2 text-vrelo-petrol">{loesung.vergleich.mit}</th>
              </tr>
            </thead>
            <tbody>
              {loesung.vergleich.reihen.map((r) => (
                <tr key={r.heute} className="border-t border-faden align-top">
                  <td className="px-3 py-2.5 leading-snug text-stumm">{r.heute}</td>
                  <td className="bg-gletscher/35 px-3 py-2.5 font-semibold leading-snug">{r.mit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="inhalt" className="rounded-2xl border-l-4 border-honig bg-sonnenlicht p-6">
          <h2 className="text-2xl font-bold">{inhalt.heading}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {inhalt.punkte.map((p) => (
              <li key={p} data-testid="inhalt-punkt" className="flex gap-3 leading-relaxed">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-tiefes-wasser" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="pdf" className="scroll-mt-6 rounded-2xl border-2 border-amber bg-lesepapier p-6">
          <h2 className="text-2xl font-bold">{pdf.heading}</h2>
          <p className="mt-1.5">{pdf.intro}</p>
          {form ? <div className="mt-4">{form}</div> : null}
        </section>
      </div>
    </div>
  );
}
