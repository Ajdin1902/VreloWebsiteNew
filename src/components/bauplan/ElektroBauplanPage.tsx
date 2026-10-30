import type { ReactNode } from "react";
import Image from "next/image";
import type { elektroBauplanPage } from "@/lib/elektroBauplanPage";

type Data = typeof elektroBauplanPage;

// Compact by design (spec 2026-10-29 landing §5): pain, solution, what the PDF holds, the form.
// Layout follows docs/design/elektro-bauplan/landing-mockup.html. Since 2026-10-30 the offer
// follows the form as the page's last section (Ajdin: done-for-you with the deposit guarantee).
export function ElektroBauplanPage({ data, form }: { data: Data; form?: ReactNode }) {
  const { schmerz, loesung, inhalt, pdf, angebot } = data;
  const letzte = schmerz.zeilen.length - 1;
  return (
    <div className="bg-papier text-tiefes-wasser">
      <section id="schmerz" className="bg-tiefes-wasser py-10 text-papier sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-honig">{data.kicker}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{data.title}</h1>
          <div className="mt-5 text-lg leading-relaxed">
            {schmerz.zeilen.map((z, i) => (
              <p key={z} className={i === letzte ? "font-semibold text-honig" : undefined}>
                {z}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2 border-t border-honig/35 pt-5 sm:flex-row sm:items-center sm:gap-5">
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
          <h2 className="text-balance text-2xl font-bold leading-snug">{loesung.heading}</h2>
          <p className="mt-2 leading-relaxed text-stumm">{loesung.sub}</p>
          <Image
            src={loesung.bild.src}
            alt={loesung.bild.alt}
            width={loesung.bild.width}
            height={loesung.bild.height}
            sizes="(min-width: 672px) 624px, 100vw"
            className="mt-5 h-auto w-full rounded-xl"
          />
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
          <div className="mt-5 overflow-hidden rounded-xl border border-faden">
            <table className="w-full text-sm">
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
          </div>
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

        <section id="angebot" className="rounded-2xl bg-tiefes-wasser p-6 text-papier sm:p-8">
          <h2 className="text-balance text-2xl font-bold leading-snug">{angebot.heading}</h2>
          <p
            data-testid="angebot-beweis"
            className="mt-4 rounded-lg border-l-4 border-honig bg-white/10 px-4 py-3 text-lg font-semibold leading-snug text-honig"
          >
            {angebot.beweis}
          </p>
          <ol className="mt-6 flex flex-col gap-4">
            {angebot.schritte.map((s, i) => (
              <li key={s.titel} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 font-serif text-3xl font-semibold italic leading-none text-honig"
                >
                  {i + 1}
                </span>
                <p className="leading-relaxed">
                  <strong className="font-semibold">{s.titel}</strong> <span className="text-gletscher">{s.text}</span>
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-xl border-l-4 border-honig bg-sonnenlicht p-5 text-tiefes-wasser">
            <p className="font-bold">{angebot.garantie.titel}</p>
            <p className="mt-1 leading-relaxed">{angebot.garantie.text}</p>
          </div>
          <div className="mt-6 border-t border-honig/35 pt-5 text-center">
            <p className="font-semibold leading-relaxed text-honig">{angebot.knappheit}</p>
            <p className="mt-3 leading-relaxed">{angebot.frage}</p>
            <a
              href={angebot.cta.href}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber px-5 py-3 text-sm font-bold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honig focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser"
            >
              {angebot.cta.text}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
