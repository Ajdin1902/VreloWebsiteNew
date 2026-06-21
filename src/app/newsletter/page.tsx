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
        title="Automatisierungs-Ideen, ruhig erklärt."
        lead="Ab und zu eine praktische Idee, wie du mit KI Zeit zurückgewinnst – ohne Hype, ohne Spam. Jederzeit abbestellbar."
      />
      {/* Pull the card up under the intro: two stacked paper Sections otherwise
          double their py padding into an oversized gap. */}
      <Section tone="paper" className="-mt-24 md:-mt-32">
        {configured ? (
          <NewsletterForm />
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl bg-tiefes-wasser p-8 text-center shadow-deepwater md:p-10">
            <p className="text-gletscher">Der Newsletter ist bald verfügbar.</p>
          </div>
        )}
      </Section>
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Newsletter", path: "/newsletter" }])} />
    </>
  );
}
