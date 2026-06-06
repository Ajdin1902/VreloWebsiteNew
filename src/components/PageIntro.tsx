import Image from "next/image";
import { Section } from "@/components/Section";

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
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-tiefes-wasser md:text-5xl">
        {title}
      </h1>
      {lead ? <p className="mt-5 max-w-2xl text-lg text-tinte">{lead}</p> : null}
      {image ? (
        <div
          className={`relative mt-10 w-full overflow-hidden rounded-2xl shadow-deepwater ring-1 ring-gletscher/10 ${
            image.ratio ?? "aspect-[16/9]"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </Section>
  );
}
