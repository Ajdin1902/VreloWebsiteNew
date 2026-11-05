import Link from "next/link";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { ReferenzCard } from "@/components/referenzen/ReferenzCard";
import { referenzen } from "@/lib/referenzen";

// Compact reference cards + a link to /referenzen, where the full story lives
// (spec 2026-11-05). Same warm treatment as the homepage: the bright karst-spring
// backdrop under a warm sonnenlicht tint. It lands just before the sunlit ClosingCta,
// so the page comes up warm out of the dark MehrMoeglich card and holds the light
// into the close. Heading and link sit directly on the backdrop: deep-espresso
// #33210f and deep ember #6f4a20, both measured (same colours as the homepage).
export function Referenzen() {
  return (
    <Section tone="warm" id="referenzen" className="relative isolate overflow-hidden scroll-mt-24">
      <SectionBackdrop src="/images/bg-karst-quelle.webp" tintRgb="244 228 193" tintOpacity={0.7} />
      <Reveal>
        <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-[#33210f] md:text-4xl">
          Zwei Betriebe, zwei Aufgaben weniger.
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {referenzen.map((r) => (
            <li key={r.slug}>
              <ReferenzCard referenz={r} />
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link
            href="/referenzen"
            className="inline-flex items-center gap-1 font-medium text-[#6f4a20] underline decoration-[#6f4a20]/40 underline-offset-4 transition hover:text-[#4d3216] hover:decoration-[#4d3216]"
          >
            Beide Projekte im Detail ansehen
            <span aria-hidden> →</span>
          </Link>
        </p>
      </Reveal>
    </Section>
  );
}
