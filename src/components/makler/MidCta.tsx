import { CTAButton } from "@/components/CTAButton";
import { makler } from "@/lib/makler";

// The only CTA before the closing booking section. It sits directly under the
// Termin-Quelle block — the earliest point the ask is earned, because that is
// the product he can grasp and try. The hero deliberately has none; the sticky
// header keeps one reachable above the fold.
//
// Plain markup rather than `Section`: a CTA band wants to sit tight against the
// product it follows, and `Section`'s inner wrapper hard-codes py-24/32, which
// an arbitrary child variant cannot reliably override. The negative top margin
// cancels the preceding section's bottom padding (the site-wide pattern).
export function MidCta() {
  return (
    <section className="-mt-24 bg-gletscher/30 text-tinte md:-mt-32">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[44rem] text-center">
          <p className="text-balance font-serif text-2xl italic text-vrelo-petrol md:text-3xl">
            {makler.midCta.line}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <CTAButton href={makler.cta.href}>{makler.cta.label}</CTAButton>
            <p className="text-sm text-stumm">{makler.cta.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
