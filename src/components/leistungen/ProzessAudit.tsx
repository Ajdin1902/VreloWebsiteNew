import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { prozessAudit } from "@/lib/prozess-audit";

// The paid-audit on-ramp on /leistungen, placed right after the MehrMoeglich
// capstone: for the visitor unsure where to start, a structured Prozess-Audit
// that ends in a process handbook. Price-free (site convention); routes to the
// free Erstgespräch where the fee is named. A dark card that is quieter than the
// flagship Termin-Quelle block (smaller heading, no serif promise) so it reads
// as a secondary on-ramp, not a second flagship.
export function ProzessAudit() {
  const o = prozessAudit;
  return (
    <div className="card-depth mx-auto max-w-3xl rounded-2xl bg-tiefes-wasser/40 p-8 ring-1 ring-amber/25 md:p-10">
      {/* A quiet sentence-case lead-in question — not the flagship's short pill
          badge, which reads heavy and wraps at 390px for a 34-char question. The
          heading answers it. gletscher for AA on the dark card (amber fails). */}
      <p className="text-sm font-medium text-gletscher">{o.label}</p>
      <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-papier md:text-3xl">
        {o.heading}
      </h2>
      <p className="mt-4 max-w-2xl text-pretty text-gletscher">{o.body}</p>

      <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-gletscher">
        {o.deliverableLabel}
      </p>
      <ul className="mt-4 grid gap-3">
        {o.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-3 text-gletscher">
            <span aria-hidden="true" className="mt-1 text-amber">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm font-medium text-papier">{o.keepNote}</p>
      <p className="mt-3 max-w-2xl text-pretty text-sm italic text-gletscher">{o.guarantee}</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <CTAButton href={o.cta.href} tone="dark">
          {o.cta.label}
        </CTAButton>
        <Link
          href={o.check.href}
          className="text-sm font-medium text-gletscher underline underline-offset-4 hover:text-papier"
        >
          {o.check.label}
        </Link>
      </div>
    </div>
  );
}
