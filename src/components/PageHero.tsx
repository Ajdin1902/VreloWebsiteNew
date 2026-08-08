import Image from "next/image";
import { Section } from "@/components/Section";
import { withBrandWords } from "@/components/BrandWord";

// A full-bleed image hero with the page title overlaid on a petrol scrim (the
// homepage-hero treatment), followed by the long lead on paper. The image is
// decorative (alt=""), so the H1 carries the page's meaning. A soft text-shadow
// keeps the papier title legible across images of varying brightness (the FAQ
// pebble pool is far lighter than the underwater Ratgeber scene).
export function PageHero({
  title,
  lead,
  src,
}: {
  title: string;
  lead: string;
  src: string;
}) {
  return (
    <>
      <section className="relative isolate flex min-h-[68vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* quality 65 (vs default 75): the petrol scrim hides the difference, but
            it cuts every optimized hero variant ~25-35% — lighter cold-MISS and
            warm loads on all four content-page heroes. */}
        <Image src={src} alt="" fill priority quality={65} sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="hero-overlay-scrim absolute inset-0 -z-10" />
        <h1 className="max-w-4xl text-balance text-4xl font-semibold text-papier [text-shadow:0_2px_16px_rgb(10_37_56_/_0.45)] md:text-5xl">
          {title}
        </h1>
      </section>

      {/* The lead drops to paper just below the hero — a Fraunces serif
          standfirst (a magazine deck, responsive: ~1.25rem → 1.6rem) with a
          petrol drop-cap initial. The cap is sized in `em` so it scales with the
          responsive text. Echoes the Ratgeber article drop-cap. */}
      <Section tone="paper">
        <p className="max-w-2xl text-pretty font-serif text-xl leading-[1.5] text-tiefes-wasser md:text-[1.6rem] first-letter:float-left first-letter:pr-2 first-letter:pt-1 first-letter:text-[2.8em] first-letter:font-medium first-letter:leading-[0.7] first-letter:text-vrelo-petrol">
          {withBrandWords(lead)}
        </p>
      </Section>
    </>
  );
}
