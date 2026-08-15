import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { terminQuelle } from "@/lib/termin-quelle";
import { SectionBackdrop } from "@/components/SectionBackdrop";

// The flagship offer block at the top of /leistungen: a named, productized
// package (Die Termin-Quelle) lifted above the generic service menu. Price-free
// by decision (the offer doc in HQ holds price/guarantee); routes to a call.
// A deep-petrol panel so it reads as THE offer, not page content. On-dark text
// is AA-safe: amber on petrol is only ~3.8:1, so amber carries the *large* serif
// promise (large-text AA = 3:1) while the small label is a navy-on-amber badge
// (6.8:1) and body/label text is gletscher (7:1). CTA is the amber button.
export function TerminQuelleAngebot() {
  const o = terminQuelle;
  return (
    <div className="shadow-deepwater relative isolate mx-auto max-w-3xl overflow-hidden rounded-3xl bg-vrelo-petrol p-8 ring-1 ring-amber/40 md:p-12">
      {/* A single drop and its rings inside the offer panel — the Quelle motif,
          dark and even. Heavy petrol tint (0.85): the panel carries small gletscher
          body text and the amber promise (3.8:1 on plain petrol), so the image may
          only add depth, never lift the base — measured, the promise stays ≥3:1
          (large text) at 1440 and 390. The brighter light-shaft image failed here.*/}
      <SectionBackdrop src="/images/was-ich-baue.webp" tintRgb="27 80 99" tintOpacity={0.85} />
      <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-semibold uppercase tracking-wide text-tiefes-wasser">
        {o.label}
      </span>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
        {o.name}
      </h2>
      {/* Amber on petrol is ~3.8:1 — only AA-valid as large text, so the promise
          stays >=24px at every breakpoint (text-2xl base). */}
      <p className="mt-3 text-pretty font-serif text-2xl italic text-amber md:text-3xl">
        {o.promise}
      </p>
      <p className="mt-6 max-w-2xl text-pretty text-gletscher">{o.body}</p>

      <ol aria-label="Ablauf" className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
        {o.flow.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="rounded-full border border-gletscher/25 bg-gletscher/10 px-3 py-1 text-sm font-medium text-gletscher">
              {step}
            </span>
            {i < o.flow.length - 1 && (
              <span aria-hidden="true" className="text-amber">
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-2xl text-pretty text-lg font-medium text-papier">
        {o.outcome}
      </p>
      <p className="mt-6 text-sm italic text-gletscher">{o.foundingNote}</p>

      <div className="mt-8">
        <CTAButton href={o.cta.href} tone="dark">
          {o.cta.label}
        </CTAButton>
      </div>
      <p className="mt-4 text-sm text-gletscher">
        {o.leadCheck.prompt}{" "}
        <Link
          href={o.leadCheck.href}
          className="font-medium text-papier underline decoration-amber/60 underline-offset-4 transition-colors hover:decoration-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol"
        >
          {o.leadCheck.label}
        </Link>
      </p>
      <p className="mt-2 text-sm text-gletscher">
        {o.demo.prompt}{" "}
        <Link
          href={o.demo.href}
          className="font-medium text-papier underline decoration-amber/60 underline-offset-4 transition-colors hover:decoration-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol"
        >
          {o.demo.label}
        </Link>
      </p>
    </div>
  );
}
