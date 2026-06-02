import Link from "next/link";
import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";

export function GeschichteTeaser() {
  return (
    <Section tone="warm">
      <h2 className="text-sm font-medium uppercase tracking-wider text-ember">Die Geschichte</h2>
      <blockquote className="mt-4 max-w-3xl font-serif text-2xl italic leading-snug text-ember md:text-3xl">
        „In Bosnien sind Quellen heilig — wo das Wasser entspringt, beginnt der Fluss.“
      </blockquote>
      <p className="mt-6 max-w-2xl text-lg text-tinte">
        <BrandWord>Vrelo</BrandWord> heißt Quelle. Warum dieser Name — und was er mit
        deinem Betrieb zu tun hat.
      </p>
      <Link
        href="/ueber-mich"
        className="mt-8 inline-block rounded-sm font-medium text-ember underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sonnenlicht focus-visible:ring-ember"
      >
        Die ganze Geschichte <span aria-hidden="true">→</span>
      </Link>
    </Section>
  );
}
