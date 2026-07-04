import { Section } from "@/components/Section";
import { PageImage } from "@/components/PageImage";
import { withBrandWords } from "@/components/BrandWord";

export function PageIntro({
  eyebrow,
  title,
  lead,
  image,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  // Optional banner under the lead. `ratio` is a Tailwind aspect utility,
  // e.g. "aspect-[21/9]" or "aspect-[16/9]" (defaults to 16:9).
  image?: { src: string; alt: string; ratio?: string };
}) {
  return (
    <Section tone="paper">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wider text-stumm">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold text-tiefes-wasser md:text-5xl">
        {withBrandWords(title)}
      </h1>
      {lead ? <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">{withBrandWords(lead)}</p> : null}
      {image ? (
        <PageImage src={image.src} alt={image.alt} ratio={image.ratio} className="mt-10" />
      ) : null}
    </Section>
  );
}
