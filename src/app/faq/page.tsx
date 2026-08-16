import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ClosingCta } from "@/components/ClosingCta";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { faqGroups } from "@/lib/faq";
import { JsonLd } from "@/components/JsonLd";
import { faqPageLd, breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/faq") },
  title: "Häufige Fragen",
  description:
    "Antworten auf die häufigsten Fragen zu Zusammenarbeit, Technik, Sicherheit und Kosten, für kleine Betriebe, die wiederkehrende Aufgaben automatisieren wollen.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        title="Häufige Fragen"
        src="/images/faq-banner.webp"
        lead="Was kleine Betriebe vor der Zusammenarbeit am häufigsten fragen. Deine Frage ist nicht dabei? Schreib mir einfach."
      />
      {/* FaqAccordion emits one Section per theme group (alternating petrol/paper);
          its first group is pulled up under the intro. */}
      <FaqAccordion groups={faqGroups} />
      <ClosingCta
        heading="Offene Frage?"
        lead="Schreib mir kurz, was du wissen willst. Ich melde mich persönlich."
      />
      <JsonLd data={faqPageLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "FAQ", path: "/faq" }])} />
    </>
  );
}
