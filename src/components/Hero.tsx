import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { GARANTIE } from "@/lib/garantie";
import { faqHref } from "@/lib/faq";
import { VORLAGEN_CTA, CHECK_SRC, vorlagenHref } from "@/lib/prozessCheckCta";

export function Hero() {
  return (
    <section className="hero-deepwater relative isolate flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Full-bleed flowing-water backdrop (the calm "system runs itself" motif).
          A petrol scrim keeps the papier headline legible; a slow ambient zoom + a
          few drifting light motes give the still image gentle life. Decorative
          (alt=""), so the H1 carries the meaning; reduced-motion stills it. */}
      <Image
        data-testid="hero-image"
        src="/images/hero-flow.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-scene-img -z-20 object-cover"
      />
      <div aria-hidden className="hero-overlay-scrim absolute inset-0 -z-10" />
      <div aria-hidden className="hero-dust pointer-events-none absolute inset-0 -z-10">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <h1 className="hero-reveal-h1 text-balance text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.02em] text-papier md:text-[3.5rem] lg:text-[4rem]">
        Dein Fahrplan zum früheren Feierabend. Kostenlos.
      </h1>
      <p className="hero-reveal-sub mt-6 max-w-xl text-pretty text-[1.05rem] leading-relaxed tracking-[-0.005em] text-gletscher md:text-xl md:leading-relaxed">
        Nimm dir die kostenlose Vorlage für deine Branche. Danach machen wir zusammen deinen Fahrplan, auch kostenlos.{" "}
        {/* The guarantee links to its conditions (final review 2026-11-11, UWG §5). */}
        <Link href={faqHref(GARANTIE.faqFrage)} className="underline decoration-gletscher/40 underline-offset-4 transition-colors hover:text-papier hover:decoration-papier">
          {GARANTIE.hero}
        </Link>
      </p>
      <div className="hero-reveal-cta mt-9">
        <CTAButton href={vorlagenHref(CHECK_SRC.homeHero)} tone="dark">
          {VORLAGEN_CTA.label}
        </CTAButton>
      </div>
    </section>
  );
}
