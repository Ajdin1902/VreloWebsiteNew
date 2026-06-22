// src/app/newsletter/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { WaterSection } from "@/components/WaterSection";
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
        lead="Jede Woche eine praktische Idee, wie du mit KI Zeit zurückgewinnst – ohne Hype, ohne Spam. Jederzeit abbestellbar."
      />
      {/* Petrol water section: the dark form card floats on flowing water. The
          -mt pulls it up under the intro so the gap isn't doubled. */}
      <WaterSection className="-mt-24 md:-mt-32">
        {configured ? (
          <NewsletterForm />
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl bg-amber p-8 text-center shadow-deepwater md:p-10">
            <p className="text-tinte">Der Newsletter ist bald verfügbar.</p>
          </div>
        )}
      </WaterSection>
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Newsletter", path: "/newsletter" }])} />
    </>
  );
}
