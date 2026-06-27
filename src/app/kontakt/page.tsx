// src/app/kontakt/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { RippleImage } from "@/components/RippleImage";
import { WaterSection } from "@/components/WaterSection";
import { JsonLd } from "@/components/JsonLd";
import { ContactForm } from "@/components/kontakt/ContactForm";
import { CardHeading } from "@/components/kontakt/CardHeading";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { lightLinkClass } from "@/components/kontakt/onDarkLink";
import { isContactConfigured, contactTo, calLink } from "@/lib/contact";
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

      {/* The petrol water room holds the two ways to reach me: the booking
          option floats on the water, the amber form card below it is the main
          writing surface. The -mt eases it up under the intro (not all the way,
          so the booking subheadline keeps some breathing room at the top). */}
      <WaterSection className="-mt-12 md:-mt-16">
        <SchedulerEmbed calLink={calLink()} />

        <div className="mx-auto mt-12 max-w-xl rounded-2xl bg-amber p-8 shadow-deepwater md:mt-16 md:p-10">
          {configured ? (
            <ContactForm />
          ) : (
            <>
              <CardHeading />
              <div className="mt-6">
                {to ? (
                  <p className="text-tinte">
                    Schreib mir direkt:{" "}
                    <a href={`mailto:${to}`} className={lightLinkClass}>
                      {to}
                    </a>
                    .
                  </p>
                ) : (
                  <p className="text-tinte">
                    Ruf mich an oder schreib mir – das Formular schalte ich in Kürze frei.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </WaterSection>

      {/* The ripple banner closes the page back on paper — the water motif stays
          in the photo, but the page returns to papier before the dark footer.
          The -mt collapses the doubled gap after the water room; symmetric pt/pb
          keep the space above the caption and below the banner matched (the
          Footer no longer carries a margin, so the banner butts it directly). */}
      <div className="bg-papier -mt-24 md:-mt-32">
        <div className="mx-auto max-w-6xl px-6 pt-32 pb-32 md:pt-40 md:pb-40">
          <figure>
            <figcaption className="mb-5 text-center font-serif text-xl italic text-tiefes-wasser md:text-2xl">
              Der erste Tropfen genügt.
            </figcaption>
            <RippleImage
              src="/images/kontakt-banner.webp"
              alt="Eine ruhige Wasseroberfläche im warmen Morgenlicht; ein erster sanfter Ring breitet sich aus."
              className="aspect-[21/9] w-full rounded-2xl shadow-deepwater ring-1 ring-tiefes-wasser/10"
              seedXFraction={0.5}
              seedYFraction={0.46}
            />
            <p className="mt-5 text-center font-serif text-xl italic text-tiefes-wasser md:text-2xl">
              Den Rest bringe ich ins Fließen.
            </p>
          </figure>
        </div>
      </div>

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
