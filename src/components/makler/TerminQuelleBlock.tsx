import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { makler } from "@/lib/makler";

// Product 1, on a deep-petrol panel so it reads as THE offer (the /leistungen
// flagship treatment). On-dark AA: amber on petrol is ~3.8:1, so amber carries
// only the large serif promise (>=24px = large-text AA); the small eyebrow is a
// navy-on-amber badge (6.8:1) and all body copy is gletscher (7:1).
export function TerminQuelleBlock() {
  const p = makler.terminQuelle;
  return (
    <Section tone="paper" className="-mt-24 md:-mt-32">
      <Reveal className="shadow-deepwater relative isolate mx-auto max-w-3xl overflow-hidden rounded-3xl bg-vrelo-petrol p-8 ring-1 ring-amber/40 md:p-12">
        {/* Same drop-and-rings backdrop as the /leistungen flagship panel (0.85
            petrol tint) — one offer, one look. */}
        <SectionBackdrop src="/images/was-ich-baue.webp" tintRgb="27 80 99" tintOpacity={0.85} />
        <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-semibold uppercase tracking-wide text-tiefes-wasser">
          {p.eyebrow}
        </span>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {p.name}
        </h2>
        <p className="mt-3 text-pretty font-serif text-2xl italic text-amber md:text-3xl">
          {p.promise}
        </p>
        <ol aria-label="Ablauf" className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
          {p.chips!.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-gletscher/25 bg-gletscher/10 px-3 py-1 text-sm font-medium text-gletscher">
                {step}
              </span>
              {i < p.chips!.length - 1 && (
                <span aria-hidden="true" className="text-amber">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        <ul aria-label="Was es dir abnimmt" className="mt-10 grid gap-3 sm:grid-cols-2">
          {p.solves!.map((s) => (
            <li key={s} className="flex items-start gap-2">
              {/* Decorative marker: amber is only 3.8:1 on petrol, so it may not
                  carry meaning — the label itself is papier. */}
              <span aria-hidden="true" className="mt-0.5 text-amber">
                →
              </span>
              <span className="font-medium text-papier">{s}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-2xl text-pretty text-lg font-medium text-papier">{p.outcome}</p>

        <div className="mt-8 rounded-2xl border border-gletscher/20 bg-gletscher/5 p-6">
          <p className="font-serif text-xl text-papier">{p.proof!.prompt}</p>
          <p className="mt-2 text-pretty text-gletscher">{p.proof!.body}</p>
          <Link
            href={p.proof!.href}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-amber"
          >
            {p.proof!.label}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
