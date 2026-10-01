import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { Proof } from "@/lib/leistungenPages";

// The proof block takes one of three shapes (spec §4): verified study figures,
// one anonymous case, or own practice. Every shape ends on the page's one
// objection line, answered before the CTA (Hormozi: kill the zombies first).
export function ProofBlock({ proof }: { proof: Proof }) {
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-4xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {proof.heading}
        </Reveal>

        {proof.kind === "studies" ? (
          <>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proof.figures.map((f) => (
                <li key={`${f.url}-${f.figure}`} className="card-depth flex flex-col rounded-2xl border border-faden bg-papier p-6">
                  <p className="font-serif text-4xl text-vrelo-petrol">{f.figure}</p>
                  <p className="mt-3 flex-1 text-tinte">{f.claim}</p>
                  <p className="mt-4 text-sm text-stumm">
                    Quelle:{" "}
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm underline underline-offset-4 hover:text-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
                    >
                      {f.source}, {f.year}
                      <span className="sr-only"> (öffnet in neuem Tab)</span>
                    </a>
                  </p>
                </li>
              ))}
            </ul>
            {proof.caseLine ? <p className="mt-8 max-w-3xl text-pretty text-lg text-tinte">{proof.caseLine}</p> : null}
          </>
        ) : null}

        {proof.kind === "case" ? <p className="mt-6 max-w-3xl text-pretty text-lg text-tinte">{proof.body}</p> : null}

        {proof.kind === "practice" ? (
          <>
            <p className="mt-6 max-w-3xl text-pretty text-lg text-tinte">{proof.body}</p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {proof.points.map((pt) => (
                <li key={pt.title} className="card-depth rounded-2xl border border-faden bg-papier p-6">
                  <h3 className="text-lg font-semibold text-tiefes-wasser">{pt.title}</h3>
                  <p className="mt-2 text-tinte">{pt.body}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="mt-10 max-w-3xl border-l-4 border-amber pl-5 text-pretty text-lg font-medium text-tiefes-wasser">
          {proof.objection}
        </p>
      </div>
    </Section>
  );
}
