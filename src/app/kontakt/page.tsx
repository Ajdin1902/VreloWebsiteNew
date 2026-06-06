// src/app/kontakt/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { ContactForm } from "@/components/kontakt/ContactForm";
import { calLink, isContactConfigured, contactTo } from "@/lib/contact";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/kontakt") },
  title: "Kontakt",
  description:
    "Buch ein unverbindliches Kennenlern-Gespräch oder schreib mir, was dich täglich Zeit kostet.",
};

export default function KontaktPage() {
  const configured = isContactConfigured();
  const to = contactTo();
  return (
    <>
      <PageIntro
        eyebrow="Kontakt"
        title="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich melde mich und sage dir ehrlich, ob und wie ich helfen kann."
        image={{
          src: "/images/kontakt-banner.webp",
          alt: "Eine ruhige Wasseroberfläche im warmen Morgenlicht; ein erster sanfter Ring breitet sich aus.",
          ratio: "aspect-[21/9]",
        }}
      />

      <Section tone="paper">
        <div className="mx-auto max-w-2xl">
          <SchedulerEmbed calLink={calLink()} />
        </div>
      </Section>

      <Section tone="paper" tint className="border-t border-faden">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-2xl font-medium text-tiefes-wasser">Oder schreib mir.</h2>
          <div className="mt-6">
            {configured ? (
              <ContactForm />
            ) : to ? (
              <p className="text-tinte">
                Schreib mir direkt:{" "}
                <a
                  href={`mailto:${to}`}
                  className="text-vrelo-petrol underline underline-offset-2"
                >
                  {to}
                </a>
                .
              </p>
            ) : (
              <p className="text-tinte">
                Buch dir oben ein Gespräch — oder ruf mich an. Das Formular schalte ich in Kürze frei.
              </p>
            )}
          </div>
        </div>
      </Section>

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
