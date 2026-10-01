import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { leistungGroups, type LeistungPage } from "@/lib/leistungenPages";
import { CHECK_CTA, checkHref, kontaktHref } from "@/lib/prozessCheckCta";

// The subpage hero (Ajdin 2026-10-01, variant A): half a screen of water with
// the group, the title, one short line and the page's button on the image, so
// the first screen says what it is and where to click. No separate lead band.
// The button order follows the page's close: check pages lead with the
// Prozess-Check, kontakt pages with the Erstgespräch.
export function LeistungHero({ page }: { page: LeistungPage }) {
  const group = leistungGroups.find((g) => g.id === page.group)!.label;
  const check = page.cta.kind === "check";
  return (
    <section className="relative isolate flex min-h-[52vh] items-center overflow-hidden py-16">
      <Image src={page.heroImage} alt="" fill priority quality={65} sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="hero-overlay-scrim absolute inset-0 -z-10" />
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honig">Leistungen · {group}</p>
        <h1 className="mt-3 max-w-3xl text-balance hyphens-auto break-words text-4xl font-semibold text-papier [text-shadow:0_2px_16px_rgb(10_37_56_/_0.45)] md:text-6xl">
          {page.title}
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg text-papier/90 md:text-xl">{page.subline}</p>
        <div className="mt-8">
          <CTAButton href={check ? checkHref(page.cta.src) : kontaktHref(page.cta.src)} tone="dark">
            {check ? CHECK_CTA.label : CHECK_CTA.directLabel}
          </CTAButton>
          {check ? (
            <SecondaryLink tone="dark" prefix={CHECK_CTA.directPrefix} label={CHECK_CTA.directLabel} href={CHECK_CTA.directHref} />
          ) : (
            <SecondaryLink tone="dark" prefix={CHECK_CTA.checkPrefix} label={CHECK_CTA.checkLabel} href={checkHref(page.cta.src)} />
          )}
        </div>
      </div>
    </section>
  );
}
