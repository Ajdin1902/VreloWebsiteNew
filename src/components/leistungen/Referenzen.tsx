import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { ReferenzCard } from "@/components/referenzen/ReferenzCard";
import { referenzen } from "@/lib/referenzen";

// Full reference cards, matching the homepage warm treatment: the bright karst-spring
// backdrop under a warm sonnenlicht tint. It lands just before the sunlit ClosingCta,
// so the page comes up warm out of the dark MehrMoeglich card and holds the light
// into the close. Opaque papier cards carry all the reading; heading + eyebrow sit
// directly on the backdrop (left-aligned) — heading deep-espresso #33210f, eyebrow
// the deep ember #6f4a20 (same choice as the homepage) — contrast measured.
export function Referenzen() {
  return (
    <Section tone="warm" id="referenzen" className="relative isolate overflow-hidden scroll-mt-24">
      <SectionBackdrop src="/images/bg-karst-quelle.webp" tintRgb="244 228 193" tintOpacity={0.7} />
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#6f4a20]">Aus echten Betrieben</p>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-[#33210f] md:text-4xl">
          Zwei Betriebe, zwei Aufgaben weniger.
        </h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
          Zwei Beispiele aus laufenden Systemen. So sieht es aus, wenn eine
          wiederkehrende Aufgabe vom Tisch ist.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {referenzen.map((r) => (
            // Anchor target for the compact homepage card's headline link.
            // scroll-mt sits on the element carrying the id (sticky header).
            <li key={r.slug} id={`referenz-${r.slug}`} className="scroll-mt-24">
              <ReferenzCard referenz={r} variant="full" />
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
