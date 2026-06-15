import Link from "next/link";
import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";
import { Reveal } from "@/components/Reveal";

// A brief mention only — the full story lives on /ueber-mich.
export function GeschichteTeaser() {
  return (
    <Section tone="warm">
      <Reveal as="p" delayMs={0} className="text-sm font-medium uppercase tracking-wider text-ember">Die Geschichte</Reveal>
      <Reveal as="p" delayMs={80} className="mt-4 max-w-2xl text-pretty text-lg text-tinte">
        <BrandWord>Vrelo</BrandWord> heißt Quelle. Woher der Name kommt – und was er mit
        deinem Betrieb zu tun hat – erzähle ich auf der Seite Über mich.
      </Reveal>
      <Reveal delayMs={160} className="mt-6 block">
        <Link
          href="/ueber-mich"
          className="group inline-block rounded-sm font-medium text-ember underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sonnenlicht focus-visible:ring-ember"
        >
          Die ganze Geschichte{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </Reveal>
    </Section>
  );
}
