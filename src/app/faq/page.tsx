import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { faqGroups } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Häufige Fragen",
  description:
    "Antworten auf die häufigsten Fragen zu Zusammenarbeit, Technik, Sicherheit und Kosten — für kleine Betriebe, die wiederkehrende Aufgaben automatisieren wollen.",
};

export default function FaqPage() {
  return (
    <>
      <PageIntro
        eyebrow="FAQ"
        title="Häufige Fragen"
        lead="Was kleine Betriebe vor der Zusammenarbeit am häufigsten fragen. Deine Frage ist nicht dabei? Schreib mir einfach."
      />
      <Section tone="paper" className="border-t border-faden">
        <FaqAccordion groups={faqGroups} />
      </Section>
      <ClosingCta
        heading="Offene Frage?"
        lead="Schreib mir kurz, was du wissen willst — ich melde mich persönlich."
      />
    </>
  );
}
