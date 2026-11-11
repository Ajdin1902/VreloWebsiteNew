import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { EIGENTUM } from "@/lib/leistungenPages";

// Ajdin 2026-11-11: every build page says once that the system is the client's
// and that Wartung is an option, with the way to the tiers.
export function EigentumBlock() {
  return (
    <Section tone="paper">
      <Reveal as="div" className="mx-auto max-w-3xl text-center">
        <p className="text-balance font-serif text-2xl leading-snug text-tiefes-wasser md:text-3xl">{EIGENTUM.text}</p>
        <Link
          href={EIGENTUM.link.href}
          className="mt-5 inline-block rounded-sm font-semibold text-vrelo-petrol underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2"
        >
          {EIGENTUM.link.label}
        </Link>
      </Reveal>
    </Section>
  );
}
