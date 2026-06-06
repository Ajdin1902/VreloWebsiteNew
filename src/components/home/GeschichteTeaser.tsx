import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";
import { Reveal } from "@/components/Reveal";

export function GeschichteTeaser() {
  return (
    <Section tone="warm">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <Reveal as="p" delayMs={0} className="text-sm font-medium uppercase tracking-wider text-ember">Die Geschichte</Reveal>
          <Reveal as="blockquote" delayMs={80} className="mt-4 max-w-3xl text-balance font-serif text-2xl italic leading-snug text-ember md:text-3xl">
            „In Bosnien sind Quellen heilig – wo das Wasser entspringt, beginnt der Fluss.“
          </Reveal>
          <Reveal as="p" delayMs={160} className="mt-6 max-w-2xl text-pretty text-lg text-tinte">
            <BrandWord>Vrelo</BrandWord> heißt Quelle. Warum dieser Name – und was er mit
            deinem Betrieb zu tun hat.
          </Reveal>
          <Reveal delayMs={240} className="mt-8 block">
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
        </div>
        <Reveal delayMs={120} className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl shadow-deepwater ring-1 ring-gletscher/10">
          <Image
            src="/images/geschichte-quelle.webp"
            alt="Eine türkisfarbene Karstquelle, die im bosnischen Bergland aus hellem Kalkstein entspringt."
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </Section>
  );
}
