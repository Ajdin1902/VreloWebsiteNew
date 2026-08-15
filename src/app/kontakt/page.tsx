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

      {/* The ripple image IS the closing section: still image + WebGL canvas fill
          the band edge to edge, and the two lines sit where the photo hands them
          contrast — navy on the warm morning sky at the top, papier on the deep
          water at the bottom. No tint: a scrim over the canvas would dull the
          ripple. Text is pointer-events-none so the water still answers the
          cursor through it. The -mt collapses the doubled gap after the water
          room; the Footer carries no margin, so the image butts it directly. */}
      <figure className="relative isolate -mt-24 flex min-h-[70vh] flex-col justify-between overflow-hidden bg-papier md:-mt-32">
        <div className="absolute inset-0 -z-10">
          <RippleImage
            src="/images/kontakt-banner.webp"
            alt="Eine ruhige Wasseroberfläche im warmen Morgenlicht; ein erster sanfter Ring breitet sich aus."
            className="h-full w-full"
            seedXFraction={0.5}
            seedYFraction={0.46}
          />
        </div>
        <figcaption className="pointer-events-none mx-auto w-full max-w-6xl px-6 pt-32 text-center font-serif text-2xl italic text-tiefes-wasser md:pt-40 md:text-3xl">
          Der erste Tropfen genügt.
        </figcaption>
        <p className="pointer-events-none mx-auto w-full max-w-6xl px-6 pb-32 text-center font-serif text-2xl italic text-papier md:pb-40 md:text-3xl">
          Den Rest bringe ich ins Fließen.
        </p>
      </figure>

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
