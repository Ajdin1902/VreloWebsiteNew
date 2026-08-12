import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { prozessAudit } from "@/lib/prozess-audit";

// The paid-audit on-ramp, lifted directly beneath the flagship Termin-Quelle as
// the "not sure where to start?" entry. A warm sonnenlicht card seated on a
// petrol band: the dark background fills the top of the page and the light card
// pops off it as the highlighted recommended path. A crisp light edge + deep
// shadow lift it off the petrol (the amber ring would vanish against the dark);
// it stays distinct from the dark MehrMoeglich capstone at the end. On-light
// AA: ember for small accent text
// (clears AA on sonnenlicht), tinte body, tiefes-wasser headings, navy inverse
// CTA. Price-free (site convention); routes to the free Erstgespräch where the
// fee is named. No mechanism (Claude/n8n) — that is how Vrelo builds.
export function ProzessAudit() {
  const o = prozessAudit;
  return (
    <div className="shadow-deepwater mx-auto max-w-3xl rounded-2xl bg-sonnenlicht p-8 ring-1 ring-papier/25 md:p-10">
      {/* Sentence-case lead-in (not an uppercase/pill badge — a 34-char question
          reads heavy that way and wraps at 390px). The heading answers it. */}
      <p className="text-sm font-medium text-ember">{o.label}</p>
      <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-tiefes-wasser md:text-3xl">
        {o.heading}
      </h2>
      <p className="mt-4 max-w-2xl text-pretty text-tinte">{o.body}</p>

      <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-ember">
        {o.deliverableLabel}
      </p>
      <ul className="mt-4 grid gap-3">
        {o.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-3 text-tinte">
            <span aria-hidden="true" className="mt-1 text-ember">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm font-medium text-tiefes-wasser">{o.keepNote}</p>
      <p className="mt-3 max-w-2xl text-pretty text-sm italic text-stumm">{o.guarantee}</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <CTAButton href={o.cta.href} variant="inverse">
          {o.cta.label}
        </CTAButton>
        <Link
          href={o.check.href}
          className="text-sm font-medium text-tiefes-wasser underline decoration-amber/60 underline-offset-4 transition-colors hover:decoration-amber"
        >
          {o.check.label}
        </Link>
      </div>
    </div>
  );
}
