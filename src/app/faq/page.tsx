import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
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
    "Antworten auf die häufigsten Fragen zu Zusammenarbeit, Technik, Sicherheit und Kosten – für kleine Betriebe, die wiederkehrende Aufgaben automatisieren wollen.",
};

export default function FaqPage() {
  return (
    <>
      <PageIntro
        title="Häufige Fragen"
        lead="Was kleine Betriebe vor der Zusammenarbeit am häufigsten fragen. Deine Frage ist nicht dabei? Schreib mir einfach."
      />
      {/* FaqAccordion emits one Section per theme group (alternating petrol/paper);
          its first group is pulled up under the intro. */}
      <FaqAccordion groups={faqGroups} />
      <ClosingCta
        heading="Offene Frage?"
        lead="Schreib mir kurz, was du wissen willst – ich melde mich persönlich."
      />
      <JsonLd data={faqPageLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "FAQ", path: "/faq" }])} />
    </>
  );
}
