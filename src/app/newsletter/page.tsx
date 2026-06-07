// src/app/newsletter/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { isNewsletterConfigured } from "@/lib/newsletter";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/newsletter") },
  title: "Newsletter",
  description:
    "Praktische Automatisierungs-Ideen mit KI – ruhig erklärt. Melde dich für den Vrelo-Newsletter an.",
};

export default function NewsletterPage() {
  const configured = isNewsletterConfigured();
  return (
    <>
      <PageIntro
        eyebrow="Newsletter"
        title="Automatisierungs-Ideen, ruhig erklärt."
        lead="Ab und zu eine praktische Idee, wie du mit KI Zeit zurückgewinnst – ohne Hype, ohne Spam. Jederzeit abbestellbar."
        image={{
          src: "/images/newsletter-banner.webp",
          alt: "Ein ruhiger, klarer Wasserlauf fließt gleichmäßig in die Ferne.",
          ratio: "aspect-[16/9]",
        }}
      />
      <Section tone="paper">
        <div className="mx-auto max-w-xl">
          {configured ? (
            <NewsletterForm />
          ) : (
            <p className="text-tinte">Der Newsletter ist bald verfügbar.</p>
          )}
        </div>
      </Section>
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Newsletter", path: "/newsletter" }])} />
    </>
  );
}
