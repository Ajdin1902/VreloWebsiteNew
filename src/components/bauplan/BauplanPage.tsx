import type { ReactNode } from "react";
import { BrandWord, withBrandWords } from "@/components/BrandWord";
import type { bauplanPage } from "@/lib/bauplanPage";

type Data = typeof bauplanPage;

function Zeile({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-vrelo-petrol">{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-tiefes-wasser">{text}</dd>
    </div>
  );
}

function MerakHeading({ text }: { text: string }) {
  const parts = text.split("Merak");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <BrandWord>Merak</BrandWord> : null}
        </span>
      ))}
    </>
  );
}

export function BauplanPage({ data, form }: { data: Data; form?: ReactNode }) {
  return (
    <div className="bg-papier px-4 py-12 text-tiefes-wasser sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="mx-auto w-full max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-stumm">{data.kicker}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{data.title}</h1>
          <p className="mt-5 border-l-4 border-amber pl-4 text-base text-stumm">
            {withBrandWords(data.herkunft)}
          </p>
        </header>

        <section id="schmerz" className="mx-auto w-full max-w-2xl">
          <h2 className="text-2xl font-semibold">{data.schmerz.heading}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {data.schmerz.punkte.map((p) => (
              <li key={p} data-testid="schmerz-punkt" className="flex gap-3 leading-relaxed">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-semibold">{data.schmerz.schluss}</p>
        </section>

        <section id="ki" className="mx-auto w-full max-w-2xl">
          <h2 className="text-2xl font-semibold">{data.ki.heading}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {data.ki.punkte.map((p) => (
              <li key={p} data-testid="ki-punkt" className="flex gap-3 leading-relaxed">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-semibold">{data.ki.schluss}</p>
        </section>

        <section id="schritte" className="mx-auto w-full max-w-2xl">
          <h2 className="text-2xl font-semibold">{data.schritte.heading}</h2>
          <ol data-testid="schritte" className="mt-4 grid gap-4 sm:grid-cols-3">
            {data.schritte.items.map((s, i) => (
              <li key={s.wort} className="rounded-xl border border-faden bg-lesepapier p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-stumm">Schritt {i + 1}</p>
                <p className="mt-1 text-xl font-semibold text-vrelo-petrol">{s.wort}</p>
                <p className="mt-2 text-sm leading-relaxed">{s.satz}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="fundament" className="mx-auto w-full max-w-2xl rounded-2xl bg-sonnenlicht p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">{data.fundament.heading}</h2>
          <p className="mt-3 leading-relaxed">{data.fundament.body}</p>
        </section>

        <section id="stationen">
          <h2 className="mx-auto max-w-2xl text-2xl font-semibold">{data.stationen.heading}</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.stationen.items.map((s) => (
              <li key={s.name} className="rounded-2xl border border-faden bg-lesepapier p-5">
                <h3 data-testid="station-name" className="text-lg font-semibold">
                  {s.name}
                </h3>
                <p className="mt-1 text-sm text-stumm">{s.beispiele}</p>
                <dl className="mt-4 flex flex-col gap-3">
                  <Zeile label="Heute" text={s.heute} />
                  <Zeile label="Im Bauplan" text={s.imBauplan} />
                  <Zeile label="Bleibt bei dir" text={s.bleibtBeiDir} />
                </dl>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-stumm">{data.stationen.tools}</p>
        </section>

        <section id="pdf-inhalt" className="mx-auto w-full max-w-2xl rounded-2xl bg-lesepapier p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">{data.pdfInhalt.heading}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {data.pdfInhalt.punkte.map((p) => (
              <li key={p} data-testid="pdf-punkt" className="flex gap-3 leading-relaxed">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-semibold text-vrelo-petrol">{data.pdfInhalt.ergebnis}</p>
        </section>

        <section id="pdf" className="mx-auto w-full max-w-2xl rounded-2xl border border-faden p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">{data.pdf.heading}</h2>
          {form ? <div className="mt-5">{form}</div> : null}
        </section>
        <section id="merak" className="mx-auto w-full max-w-2xl rounded-2xl bg-sonnenlicht p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            <MerakHeading text={data.merak.heading} />
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {data.merak.punkte.map((p) => (
              <li key={p} data-testid="merak-punkt" className="leading-relaxed">
                {p}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
