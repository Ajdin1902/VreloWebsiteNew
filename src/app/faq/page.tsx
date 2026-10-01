import type { Metadata } from "next";
import { CompactHero } from "@/components/CompactHero";
import { ClosingCta } from "@/components/ClosingCta";
import { CHECK_SRC } from "@/lib/prozessCheckCta";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { faqGroups } from "@/lib/faq";
import { JsonLd } from "@/components/JsonLd";
import { faqPageLd, breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/faq") },
  title: "Häufige Fragen",
  description:
    "Antworten auf die häufigsten Fragen zu Zusammenarbeit, Technik, Sicherheit und Kosten, für Betriebe und Unternehmen, die wiederkehrende Aufgaben automatisieren wollen.",
};

export default function FaqPage() {
  return (
    <>
      <CompactHero
        eyebrow="Zusammenarbeit · Technik · Kosten"
        title="Häufige Fragen"
        line="Was Betriebe und Unternehmen vor der Zusammenarbeit am häufigsten fragen."
        image="/images/faq-banner.webp"
      />
      {/* FaqAccordion emits one Section per theme group (alternating petrol/paper). */}
      <FaqAccordion groups={faqGroups} />
      <ClosingCta
        heading="Offene Frage?"
        lead="Schreib mir kurz, was du wissen willst. Ich melde mich persönlich."
        src={CHECK_SRC.faq}
        primary="kontakt"
      />
      <JsonLd data={faqPageLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "FAQ", path: "/faq" }])} />
    </>
  );
}
