import Image from "next/image";
import { Section } from "@/components/Section";
import { portraits } from "@/lib/portraits";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { CTAButton } from "@/components/CTAButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { withBrandWords } from "@/components/BrandWord";
import { CHECK_CTA, checkHref, type CheckSrc } from "@/lib/prozessCheckCta";

// The site-wide close: every subpage ends on the same sunlit water surface —
// the subpage twin of the homepage's Proof→Merak "surface break". Dark bands
// above it carry deep water; this is where the page comes up for air. The
// image is very bright, so the sonnenlicht tint (0.7) mostly evens out its
// hot spots; the ember heading and tinte body were measured against the
// darkest (blue) patch and the brightest highlight — both clear AA.
//
// Front door (spec 2026-09-26): the button goes to the Prozess-Check with the
// caller's ?src= slug and the Erstgespräch sits under it as the quiet second
// path. primary="kontakt" flips the two (only /faq, where the visitor has a
// question and wants to write).
//
// The founder's sitting photo sits beside the close on desktop and below the
// buttons on mobile, on every caller (decided 2026-10-01): the person you would
// sit down with, next to the step you take. Proof is the offer's weakest
// Value-Equation factor; a real face at the decision point is the cheapest lift.
export function ClosingCta({
  heading,
  lead,
  src,
  primary = "check",
}: {
  heading: string;
  lead: string;
  src: CheckSrc;
  primary?: "check" | "kontakt";
}) {
  const body = (
    <div>
      {/* The closing heading keeps its warm ember; only the button goes navy
          (inverse) — amber blended on the warm band, navy gives it contrast. */}
      <h2 className="max-w-2xl text-balance text-3xl font-semibold text-ember md:text-4xl">{heading}</h2>
      <p className="mt-5 max-w-xl text-pretty text-lg text-tinte">{withBrandWords(lead)}</p>
      <div className="mt-8">
        {primary === "check" ? (
          <>
            <CTAButton href={checkHref(src)} variant="inverse">
              {CHECK_CTA.label}
            </CTAButton>
            <SecondaryLink
              tone="light"
              prefix={CHECK_CTA.directPrefix}
              label={CHECK_CTA.directLabel}
              href={CHECK_CTA.directHref}
            />
          </>
        ) : (
          <>
            <CTAButton href="/kontakt" variant="inverse" />
            <SecondaryLink tone="light" prefix={CHECK_CTA.checkPrefix} label={CHECK_CTA.checkLabel} href={checkHref(src)} />
          </>
        )}
      </div>
    </div>
  );

  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-oberflaeche.webp" tintRgb="244 228 193" tintOpacity={0.7} />
      <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr] md:gap-16">
        {body}
        <Image
          src={portraits.sitzend.src}
          alt={portraits.sitzend.alt}
          width={960}
          height={1200}
          sizes="(min-width: 768px) 30vw, 80vw"
          className="aspect-[4/5] w-full max-w-xs rounded-2xl object-cover shadow-deepwater md:ml-auto md:max-w-sm"
        />
      </div>
    </Section>
  );
}
