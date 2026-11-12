import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { ClosingCta } from "@/components/ClosingCta";
import { ReferenzDetail } from "@/components/referenzen/ReferenzDetail";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { referenzen } from "@/lib/referenzen";
import { CHECK_SRC } from "@/lib/prozessCheckCta";
import { canonical } from "@/lib/site";

// Named references on one page, readable without a click (spec 2026-11-05).
// Ajdin's second round: hero straight into two cards side by side, each ending
// on its own quote. No page-level openGraph: the layout's share card stays.
export const metadata: Metadata = {
  alternates: { canonical: canonical("/referenzen") },
  title: "Referenzen",
  description:
    "Zwei Betriebe aus Regensburg, einer davon der Betrieb meines Vaters: was ich gebaut habe und was sich seitdem im Alltag verändert hat.",
};

export default function ReferenzenPage() {
  return (
    <>
      <PageHero title="Das sagen die Kunden." src="/images/bg-steps.webp" size="compact" />

      <Section tone="warm" className="relative isolate overflow-hidden">
        <SectionBackdrop src="/images/bg-karst-quelle.webp" tintRgb="244 228 193" tintOpacity={0.7} />
        <Reveal as="ul" className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {referenzen.map((r) => (
            <li key={r.slug}>
              <ReferenzDetail referenz={r} />
            </li>
          ))}
        </Reveal>
      </Section>

      <ClosingCta
        heading="Fang klein an."
        lead="Nimm dir die kostenlose Vorlage für deine Branche. Wenn du danach reden willst, bin ich da."
        src={CHECK_SRC.referenzen}
      />

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Referenzen", path: "/referenzen" }])} />
    </>
  );
}
