import Link from "next/link";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import type { WarumPunkt } from "@/lib/leistungenPages";

// Warum ich (Ajdin 2026-11-11): the page breaks the surface here, like the
// homepage Proof: the sunlit river under a sonnenlicht tint, a deep-espresso
// heading, three frosted papier cards with a check badge. The guarantee card
// links to its conditions in the FAQ (UWG §5); nothing else here is a link.
export function WarumBlock({ warum }: { warum: WarumPunkt[] }) {
  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-proof.webp" tintRgb="244 228 193" tintOpacity={0.55} />
      {/* Warm glow under the heading; -z-[5] keeps it behind the static text (see Proof). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-[5] h-2/3 bg-[radial-gradient(60%_55%_at_50%_16%,color-mix(in_oklab,var(--color-sonnenlicht)_80%,transparent),transparent_72%)]"
      />
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-center text-3xl font-semibold tracking-tight text-[#33210f] md:text-4xl">
          Warum ich
        </Reveal>
        <Reveal as="ul" delayMs={120} className="mt-10 grid gap-5 md:grid-cols-3">
          {warum.map((w) => (
            <li key={w.title} className="card-depth flex flex-col rounded-2xl border border-papier/60 bg-papier/85 p-6 backdrop-blur-sm md:p-7">
              <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-tiefes-wasser text-honig">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h3 className="mt-5 text-balance text-xl font-semibold text-tiefes-wasser">{w.title}</h3>
              <p className="mt-2 flex-1 text-pretty text-tinte">{w.body}</p>
              {w.link ? (
                <Link
                  href={w.link.href}
                  className="mt-4 text-sm text-tiefes-wasser underline underline-offset-2 transition-colors hover:text-vrelo-petrol"
                >
                  {w.link.label}
                </Link>
              ) : null}
            </li>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
