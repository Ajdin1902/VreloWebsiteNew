import Link from "next/link";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { leistungGroups, type LeistungGroup } from "@/lib/leistungenPages";

// The three doors as three cards (four until 2026-11-11, when Befähigen folded
// into KI-Automatisierung). Prüfen and Betreiben are one page each, so they go
// straight there; Bauen lands on its group on the hub.
const doors: Record<LeistungGroup, { body: string; href: string }> = {
  pruefen: { body: "Erst prüfen, dann bauen: dein Fahrplan zeigt, womit du anfängst.", href: "/leistungen/prozess-audit" },
  bauen: { body: "Prozessautomatisierung und KI: vom kleinen Baustein bis zum Assistenten.", href: "/leistungen#gruppe-bauen" },
  betreiben: { body: "Wartung, wenn du sie willst. Was ich baue, gehört dir.", href: "/leistungen/betreuung" },
};

// Spine A "die Quelle": a dark blue-hour karst pool with ripples spreading from a
// single drop — the effect of taking the tasks off the plate, rippling outward.
// The image is very dark (mean ~16,52,75), so it only needs a light 0.5 tint to
// keep the ripples visible while light text clears AA with room (heading papier
// 8.5:1, body gletscher 9.2:1, chips gletscher 5.7:1 measured).
export function WasIchBaue() {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/bg-wasichbaue.webp" tintRgb="10 37 56" tintOpacity={0.5} />
      {/* Centered spine: the offer leads, the four door cards below carry the visual. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} id="was-ich-baue-heading" className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          Prüfen. Bauen. Betreiben.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-balance text-lg text-gletscher">
          Drei Wege, ein System: such dir aus, wo du anfängst.
        </Reveal>
      </div>
      <Reveal as="ul" delayMs={200} aria-labelledby="was-ich-baue-heading" className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
        {leistungGroups.map((g) => (
          <li key={g.id}>
            <Link
              href={doors[g.id].href}
              className="card-depth flex h-full flex-col rounded-2xl border border-gletscher/25 bg-gletscher/10 p-6 text-left text-gletscher transition-colors hover:border-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
            >
              <span className="text-xl font-semibold text-papier">{g.label}</span>
              <span className="mt-2">{doors[g.id].body}</span>
            </Link>
          </li>
        ))}
      </Reveal>
      <Reveal delayMs={280} className="mt-8 block text-center">
        <Link
          href="/leistungen"
          className="group inline-block rounded-sm font-medium text-honig underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
        >
          Alle Leistungen ansehen{" "}
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
