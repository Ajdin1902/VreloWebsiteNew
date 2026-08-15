import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { CTAButton } from "@/components/CTAButton";
import { withBrandWords } from "@/components/BrandWord";

// The site-wide close: every subpage ends on the same sunlit water surface —
// the subpage twin of the homepage's Proof→Merak "surface break". Dark bands
// above it carry deep water; this is where the page comes up for air. The
// image is very bright, so the sonnenlicht tint (0.7) mostly evens out its
// hot spots; the ember heading and tinte body were measured against the
// darkest (blue) patch and the brightest highlight — both clear AA.
export function ClosingCta({
  heading,
  lead,
  ctaHref = "/kontakt",
}: {
  heading: string;
  lead: string;
  ctaHref?: string;
}) {
  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-oberflaeche.webp" tintRgb="244 228 193" tintOpacity={0.7} />
      {/* The closing heading keeps its warm ember; only the button goes navy
          (inverse) — amber blended on the warm band, navy gives it contrast. */}
      <h2 className="max-w-2xl text-balance text-3xl font-semibold text-ember md:text-4xl">{heading}</h2>
      <p className="mt-5 max-w-xl text-pretty text-lg text-tinte">{withBrandWords(lead)}</p>
      <div className="mt-8">
        <CTAButton href={ctaHref} variant="inverse" />
      </div>
    </Section>
  );
}
