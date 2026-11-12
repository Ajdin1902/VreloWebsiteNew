// src/app/kontakt/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { CompactHero } from "@/components/CompactHero";
import { RippleImage } from "@/components/RippleImage";
import { WaterSection } from "@/components/WaterSection";
import { JsonLd } from "@/components/JsonLd";
import { ContactForm } from "@/components/kontakt/ContactForm";
import { CardHeading } from "@/components/kontakt/CardHeading";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { SchedulerFromUrl } from "@/components/kontakt/SchedulerFromUrl";
import { CheckHint } from "@/components/kontakt/CheckHint";
import { lightLinkClass } from "@/components/kontakt/onDarkLink";
import { isContactConfigured, contactTo, calLink } from "@/lib/contact";
import { breadcrumbLd } from "@/lib/jsonld";
import { KARTE } from "@/lib/karte";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/kontakt") },
  title: "Kontakt",
  description:
    "Schreib mir, was dich täglich Zeit kostet. Ich melde mich und sage dir ehrlich, ob und wie ich helfen kann.",
};

// The public address (Impressum + Datenschutz name the same one).
const KONTAKT_MAIL = "kontakt@vrelo-ki.de";

export default function KontaktPage() {
  const configured = isContactConfigured();
  const to = contactTo();
  return (
    <>
      {/* Ajdin 2026-11-12: Kontakt opens like the other subpages (compact image
          hero, no button: the page itself is the contact). The evening ripples keep
          the dawn pond (kontakt-banner) for the close below. */}
      <CompactHero
        eyebrow="Kontakt"
        title="Lass uns deine Quelle bauen."
        line="Erzähl mir, was dich täglich Zeit kostet. Ich melde mich persönlich."
        image="/images/bg-abendwellen.webp"
      />

      {/* Who answers, the number and where to write, above the form band (Ajdin 2026-11-12). */}
      <div data-kontakt-zeile className="bg-papier">
        <p className="mx-auto max-w-6xl px-6 py-6 text-center text-lg text-tinte">
          <span className="font-semibold text-tiefes-wasser">Ajdin Dzafic</span>
          <span aria-hidden className="mx-3 text-stumm">·</span>
          {/* Ajdin 2026-11-12: the number on the site after all (one source: the Karte). */}
          <a href={`tel:${KARTE.phone.replace(/\s+/g, "")}`} className={`${lightLinkClass} whitespace-nowrap`}>
            {KARTE.phone}
          </a>
          <span aria-hidden className="mx-3 text-stumm">·</span>
          <a href={`mailto:${KONTAKT_MAIL}`} className={lightLinkClass}>
            {KONTAKT_MAIL}
          </a>
        </p>
      </div>

      {/* The water room holds the two ways to reach me: the booking option floats
          on the water, the amber form card below it is the main writing surface.
          Since 2026-11-12 on the light shaft, which falls onto the form. */}
      <WaterSection src="/images/bg-lichtschacht.webp">
        <CheckHint />
        <Suspense fallback={<SchedulerEmbed calLink={calLink()} />}>
          <SchedulerFromUrl calLink={calLink()} />
        </Suspense>

        <div className="relative mx-auto mt-12 max-w-xl rounded-2xl bg-amber p-8 shadow-deepwater ring-1 ring-honig/60 md:mt-16 md:p-10">
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
                    Ruf mich an oder schreib mir. Das Formular schalte ich in Kürze frei.
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
          cursor through it. No -mt: the water room above is a different tone, and
          the negative margin would pull the image up over its bottom padding so
          the gold card butts the seam (the site-wide -mt trap). Symmetric pt/pb
          inside; the Footer carries no margin, so the image butts it directly. */}
      <figure className="relative isolate flex min-h-[70vh] flex-col justify-between overflow-hidden bg-papier">
        <div className="absolute inset-0 -z-10">
          <RippleImage
            src="/images/kontakt-banner.webp"
            alt="Eine ruhige Wasseroberfläche im warmen Morgenlicht; ein erster sanfter Ring breitet sich aus."
            className="h-full w-full"
            seedXFraction={0.5}
            seedYFraction={0.46}
          />
        </div>
        <figcaption className="pointer-events-none mx-auto w-full max-w-6xl px-6 pt-24 text-center font-serif text-2xl italic text-tiefes-wasser md:pt-32 md:text-3xl">
          Der erste Tropfen genügt.
        </figcaption>
        <p className="pointer-events-none mx-auto w-full max-w-6xl px-6 pb-24 text-center font-serif text-2xl italic text-papier md:pb-32 md:text-3xl">
          Den Rest bringe ich ins Fließen.
        </p>
      </figure>

      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }])} />
    </>
  );
}
