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
    "Jede Woche eine kurze Mail: eine Idee aus der KI-Welt, ein Tipp zum Ausprobieren und das Meme der Woche. So lernst du KI im Arbeitsalltag kennen, verständlich erklärt.",
};

export default function NewsletterPage() {
  const configured = isNewsletterConfigured();
  return (
    <>
      <PageIntro
        title="Der Vrelo Newsletter"
        lead="Jede Woche eine kurze Mail: eine Idee aus der KI-Welt, ein Tipp zum Ausprobieren, wie ich es selbst im Alltag nutze, und zum Schluss gibt es das Meme der Woche. So lernst du KI im Arbeitsalltag kennen, verständlich erklärt, ohne dass es kompliziert wird."
      />
      {/* Petrol water section: the amber form card floats on flowing water. The
          -mt eases it up under the intro (not all the way, so the form keeps
          some breathing room at the top — matches Kontakt). */}
      <WaterSection className="-mt-12 md:-mt-16">
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
