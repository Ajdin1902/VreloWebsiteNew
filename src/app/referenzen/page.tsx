import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { ReferenzDetail } from "@/components/referenzen/ReferenzDetail";
import { Stimmen } from "@/components/referenzen/Stimmen";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { referenzen } from "@/lib/referenzen";
import { canonical } from "@/lib/site";

// Named references on one page, readable without a click (spec 2026-11-05).
// No page-level openGraph: the layout's share card stays (Website/CLAUDE.md).
export const metadata: Metadata = {
  alternates: { canonical: canonical("/referenzen") },
  title: "Referenzen",
  description:
    "Zwei Betriebe aus Regensburg, einer davon der Betrieb meines Vaters: was ich gebaut habe und was sich seitdem im Alltag verändert hat.",
};

export default function ReferenzenPage() {
  return (
    <>
      <PageHero
        title="So läuft es heute bei meinen Kunden."
        src="/images/hero-flow.webp"
        lead="Zwei Betriebe aus Regensburg. Was ich gebaut habe und was sich seitdem verändert hat."
      />

      <Section tone="warm" className="relative isolate overflow-hidden">
        <SectionBackdrop src="/images/bg-karst-quelle.webp" tintRgb="244 228 193" tintOpacity={0.7} />
        <Reveal className="mx-auto max-w-5xl space-y-8">
          {referenzen.map((r) => (
            <ReferenzDetail key={r.slug} referenz={r} />
          ))}
        </Reveal>
      </Section>

      <Stimmen />

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Referenzen", path: "/referenzen" }])} />
    </>
  );
}
