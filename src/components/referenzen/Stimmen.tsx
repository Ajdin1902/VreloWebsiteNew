import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";
import { stimmen } from "@/lib/referenzen";

// The quote band that closes /referenzen (spec 2026-11-05, layout B): every
// approved quote in one place, then the Prozess-Check. Same deep band and CTA
// pattern as the homepage DerWeg section (contrast already measured there).
export function Stimmen() {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/section-texture.webp" tintRgb="10 37 56" tintOpacity={0.65} />
      <Reveal as="h2" delayMs={0} className="text-center text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
        Das sagen meine Kunden.
      </Reveal>
      <Reveal as="ul" delayMs={80} className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
        {stimmen.map((s) => (
          <li key={s.text}>
            <figure className="card-depth flex h-full flex-col rounded-2xl border border-gletscher/25 bg-gletscher/10 p-6">
              <blockquote className="text-pretty text-lg text-papier">{s.text}</blockquote>
              <figcaption className="mt-auto pt-5 text-sm text-honig">
                {s.name}, {s.firma}
              </figcaption>
            </figure>
          </li>
        ))}
      </Reveal>
      <Reveal delayMs={160} className="mt-12 text-center">
        <CTAButton tone="dark" href={checkHref(CHECK_SRC.referenzen)}>
          {CHECK_CTA.label}
        </CTAButton>
        <p className="mt-3 text-sm text-gletscher">{CHECK_CTA.microcopy}</p>
        <SecondaryLink tone="dark" prefix={CHECK_CTA.directPrefix} label={CHECK_CTA.directLabel} href={CHECK_CTA.directHref} />
      </Reveal>
    </Section>
  );
}
