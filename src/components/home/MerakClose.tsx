import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";
import { LazyVideo } from "@/components/LazyVideo";
import { Reveal } from "@/components/Reveal";

export function MerakClose() {
  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      {/* Sunset clip (merak) behind the close. Below the fold → no LCP cost.
          Reduced-motion falls back to the poster still inside LazyVideo. */}
      <LazyVideo
        mp4="/video/merak.mp4"
        webm="/video/merak.webm"
        poster="/video/merak-poster.jpg"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/* Warm tint over the footage keeps the amber register + text contrast.
          opacity-90, not -80: at /80 the sunset's dark spots bled through and pulled the
          ember heading to 2.60:1 — under the 3.0 large-text AA bar. /90 restores it to
          3.15:1 (near the gradient-only ceiling of 3.73) and leaves a faint warm shimmer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_120%,#f4e4c1,#e8b86b_55%,#f4e4c1_100%)] opacity-90"
      />
      {/* Centered spine: the payoff lands on the spine like the rest of the page.
          The headline mirrors the hero („Manuelle Prozesse rauben dir die Zeit.“):
          the page opens on the pain and closes on it solved (decision 2026-09-26). */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance font-serif text-3xl italic leading-snug text-ember md:text-4xl">
          Die Prozesse laufen von selbst. Deine Zeit gehört wieder dir.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mx-auto mt-6 max-w-xl text-pretty text-lg text-tinte">
          Das ist der <BrandWord>Merak</BrandWord>-Effekt.
        </Reveal>
        <Reveal delayMs={160} className="mt-8">
          <CTAButton href={checkHref(CHECK_SRC.homeClose)}>{CHECK_CTA.label}</CTAButton>
          {/* Effort reducer at the last decision point: free, no login, result now. */}
          <p className="mt-3 text-sm text-tinte">{CHECK_CTA.microcopy}</p>
          <SecondaryLink tone="light" prefix={CHECK_CTA.directPrefix} label={CHECK_CTA.directLabel} href={CHECK_CTA.directHref} />
        </Reveal>
      </div>
    </Section>
  );
}
