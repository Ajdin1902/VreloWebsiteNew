import type { ComponentType } from "react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { KiFluss } from "@/components/leistungen/grafiken/KiFluss";
import { BetriebssystemBecken } from "@/components/leistungen/grafiken/BetriebssystemBecken";
import { ProzessFliessband } from "@/components/leistungen/grafiken/ProzessFliessband";
import { KiServerRahmen } from "@/components/leistungen/grafiken/KiServerRahmen";
import { ProzessAuditBalken } from "@/components/leistungen/grafiken/ProzessAuditBalken";
import { BetreuungZeitlinie } from "@/components/leistungen/grafiken/BetreuungZeitlinie";
import { ClaudeProjekt } from "@/components/leistungen/grafiken/ClaudeProjekt";
import { BeratungTrichter } from "@/components/leistungen/grafiken/BeratungTrichter";
import { SchulungVorlagen } from "@/components/leistungen/grafiken/SchulungVorlagen";
import type { LeistungGrafik, LeistungPage } from "@/lib/leistungenPages";

// A graphic to remember a service by, instead of more text (Ajdin 2026-10-20).
// One drawing per page in src/components/leistungen/grafiken/; the page data
// picks it by `kind`. The SVG labels are part of the drawing; screen readers
// get the `alt` from the page data instead (role="img").
const DRAWINGS: Record<LeistungGrafik, ComponentType> = {
  "ki-fluss": KiFluss,
  "betriebssystem-becken": BetriebssystemBecken,
  "prozess-fliessband": ProzessFliessband,
  "ki-server-rahmen": KiServerRahmen,
  "prozess-audit-balken": ProzessAuditBalken,
  "betreuung-zeitlinie": BetreuungZeitlinie,
  "claude-projekt": ClaudeProjekt,
  "beratung-trichter": BeratungTrichter,
  "schulung-vorlagen": SchulungVorlagen,
};

export function GrafikBlock({ grafik }: { grafik: NonNullable<LeistungPage["grafik"]> }) {
  const Drawing = DRAWINGS[grafik.kind];
  return (
    <Section tint>
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {grafik.heading}
        </Reveal>
        <Reveal as="figure" delayMs={120} className="mt-8 rounded-2xl border border-faden bg-papier p-4 md:p-8">
          <div role="img" aria-label={grafik.alt}>
            <Drawing />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
