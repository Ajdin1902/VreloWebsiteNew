import { CTAButton } from "@/components/CTAButton";
import { terminQuelle } from "@/lib/termin-quelle";

// The flagship offer block at the top of /leistungen: a named, productized
// package (Die Termin-Quelle) lifted above the generic service menu. Price-free
// by decision (the offer doc in HQ holds price/guarantee); routes to a call.
// Distinguished from the light LeistungDetail cards by the warm amber ring.
export function TerminQuelleAngebot() {
  const o = terminQuelle;
  return (
    <div className="card-depth mx-auto max-w-3xl rounded-3xl bg-papier p-8 ring-1 ring-amber/40 md:p-12">
      <p className="text-sm font-semibold text-vrelo-petrol">{o.label}</p>
      <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
        {o.name}
      </h2>
      <p className="mt-3 text-pretty font-serif text-xl italic text-vrelo-petrol md:text-2xl">
        {o.promise}
      </p>
      <p className="mt-6 max-w-2xl text-pretty text-tinte">{o.body}</p>

      <ol aria-label="Ablauf" className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
        {o.flow.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="rounded-full border border-faden bg-gletscher/40 px-3 py-1 text-sm font-medium text-tiefes-wasser">
              {step}
            </span>
            {i < o.flow.length - 1 && (
              <span aria-hidden="true" className="text-vrelo-petrol">
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-2xl text-pretty text-lg font-medium text-tiefes-wasser">
        {o.outcome}
      </p>
      <p className="mt-6 text-sm italic text-stumm">{o.foundingNote}</p>

      <div className="mt-8">
        <CTAButton href={o.cta.href}>{o.cta.label}</CTAButton>
      </div>
    </div>
  );
}
