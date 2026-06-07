import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { PageImage } from "@/components/PageImage";
import { Section } from "@/components/Section";
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
        eyebrow="FAQ"
        title="Häufige Fragen"
        lead="Was kleine Betriebe vor der Zusammenarbeit am häufigsten fragen. Deine Frage ist nicht dabei? Schreib mir einfach."
      />
      <Section tone="paper" className="border-t border-faden">
        <FaqAccordion groups={faqGroups} />
      </Section>
      <Section tone="paper" className="border-t border-faden">
        <PageImage
          src="/images/faq-banner.webp"
          alt="Klares, ruhiges Wasser über hellen, glatten Kieselsteinen."
          ratio="aspect-[16/9]"
        />
      </Section>
      <ClosingCta
        heading="Offene Frage?"
        lead="Schreib mir kurz, was du wissen willst – ich melde mich persönlich."
      />
      <JsonLd data={faqPageLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "FAQ", path: "/faq" }])} />
    </>
  );
}
