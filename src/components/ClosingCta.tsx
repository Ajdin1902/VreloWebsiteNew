import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";

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
      <h2 className="max-w-2xl text-3xl font-semibold text-ember md:text-4xl">{heading}</h2>
      <p className="mt-5 max-w-xl text-lg text-tinte">{lead}</p>
      <div className="mt-8">
        <CTAButton href={ctaHref} />
      </div>
    </Section>
  );
}
