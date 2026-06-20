// src/app/kontakt/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { RippleImage } from "@/components/RippleImage";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { ContactForm } from "@/components/kontakt/ContactForm";
import { CardHeading } from "@/components/kontakt/CardHeading";
import { darkLinkClass } from "@/components/kontakt/onDarkLink";
import { isContactConfigured, contactTo } from "@/lib/contact";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/kontakt") },
  title: "Kontakt",
  description:
    "Schreib mir, was dich täglich Zeit kostet – ich melde mich und sage dir ehrlich, ob und wie ich helfen kann.",
};

export default function KontaktPage() {
  const configured = isContactConfigured();
  const to = contactTo();
  return (
    <>
      <PageIntro
        title="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet – ich melde mich und sage dir ehrlich, ob und wie ich helfen kann."
      />

      <Section tone="paper">
        <div className="mx-auto max-w-xl rounded-2xl bg-tiefes-wasser p-8 shadow-deepwater md:p-10">
          {configured ? (
            <ContactForm />
          ) : (
            <>
              <CardHeading />
              <div className="mt-6">
                {to ? (
                  <p className="text-gletscher">
                    Schreib mir direkt:{" "}
                    <a href={`mailto:${to}`} className={darkLinkClass}>
                      {to}
                    </a>
                    .
                  </p>
                ) : (
                  <p className="text-gletscher">
                    Ruf mich an oder schreib mir – das Formular schalte ich in Kürze frei.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </Section>

      <Section tone="paper" className="border-t border-faden">
        <figure>
          <figcaption className="mb-5 text-center font-serif text-xl italic text-tiefes-wasser md:text-2xl">
            Der erste Tropfen genügt.
          </figcaption>
          <RippleImage
            src="/images/kontakt-banner.webp"
            alt="Eine ruhige Wasseroberfläche im warmen Morgenlicht; ein erster sanfter Ring breitet sich aus."
            className="aspect-[21/9] w-full rounded-2xl shadow-deepwater ring-1 ring-gletscher/10"
            seedXFraction={0.5}
            seedYFraction={0.46}
          />
        </figure>
      </Section>

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
