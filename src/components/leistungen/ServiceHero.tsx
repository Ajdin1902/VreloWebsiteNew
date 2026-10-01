import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { CHECK_CTA, checkHref, kontaktHref, type CheckSrc } from "@/lib/prozessCheckCta";

// The Leistungen hero (Ajdin 2026-10-01, variant A): half a screen of water
// carrying an eyebrow, the title, one short line and the page's button, so the
// first screen says what it is and where to click. No separate lead band.
// primary="check" leads with the Prozess-Check, "kontakt" with the
// Erstgespräch; the other path sits underneath as the quiet second link.
// Used by the hub (/leistungen) and, via LeistungHero, every subpage.
export function ServiceHero({
  eyebrow,
  title,
  line,
  image,
  imageClassName = "",
  primary,
  src,
}: {
  eyebrow: string;
  title: string;
  line: string;
  image: string;
  /** Extra classes on the image, e.g. a zoom; the section is overflow-hidden. */
  imageClassName?: string;
  primary: "check" | "kontakt";
  src: CheckSrc;
}) {
  const check = primary === "check";
  return (
    <section className="relative isolate flex min-h-[52vh] items-center overflow-hidden py-16">
      <Image
        src={image}
        alt=""
        fill
        priority
        quality={65}
        sizes="100vw"
        className={["-z-20 object-cover", imageClassName].filter(Boolean).join(" ")}
      />
      <div aria-hidden className="hero-overlay-scrim absolute inset-0 -z-10" />
      {/* The text sits left, so a left-to-right deepening keeps it legible on
          bright images (the hub banner's pale concrete measured 2.8:1 without it). */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-tiefes-wasser/80 via-tiefes-wasser/45 to-transparent" />
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honig">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-balance hyphens-auto break-words text-4xl font-semibold text-papier [text-shadow:0_2px_16px_rgb(10_37_56_/_0.45)] md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg text-papier/90 md:text-xl">{line}</p>
        <div className="mt-8">
          <CTAButton href={check ? checkHref(src) : kontaktHref(src)} tone="dark">
            {check ? CHECK_CTA.label : CHECK_CTA.directLabel}
          </CTAButton>
          {check ? (
            <SecondaryLink tone="dark" prefix={CHECK_CTA.directPrefix} label={CHECK_CTA.directLabel} href={CHECK_CTA.directHref} />
          ) : (
            <SecondaryLink tone="dark" prefix={CHECK_CTA.checkPrefix} label={CHECK_CTA.checkLabel} href={checkHref(src)} />
          )}
        </div>
      </div>
    </section>
  );
}
