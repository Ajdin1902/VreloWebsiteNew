import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { withBrandWords } from "@/components/BrandWord";

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
    <Section tone="warm">
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
