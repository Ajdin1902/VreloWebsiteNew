import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";
import { RippleImage } from "@/components/RippleImage";

export function Hero() {
  return (
    <section className="hero-deepwater relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32 lg:py-40">
        {/* Left: the message */}
        <div>
          <h1 className="hero-reveal-h1 max-w-2xl text-[2.25rem] font-semibold leading-[1.13] tracking-[-0.02em] text-papier md:text-[3.25rem] md:leading-[1.1] lg:text-[3.75rem]">
            <BrandWord>Vrelo</BrandWord> errichtet die Quelle.{" "}
            <br className="hidden sm:block" />
            Du erlebst den <BrandWord>Merak</BrandWord>-Effekt.
          </h1>
          <p className="hero-reveal-sub mt-7 max-w-lg text-[1.05rem] leading-relaxed tracking-[-0.005em] text-stein md:text-xl md:leading-relaxed">
            Maßgeschneiderte Automatisierungen für kleine Betriebe. Sie übernehmen den
            Kleinkram – du gewinnst Zeit, Ruhe und einen freien Kopf.
          </p>
          <div className="hero-reveal-cta mt-10">
            <CTAButton href="/kontakt" tone="dark" />
          </div>
        </div>

        {/* Right: the rippling water panel with the drop that seeds it */}
        <div className="relative">
          <RippleImage
            src="/video/hero-quelle.jpg"
            alt=""
            seedXFraction={0.5}
            seedYFraction={0.5}
            seedIntervalMs={3000}
            className="shadow-deepwater aspect-[16/10] w-full rounded-2xl ring-1 ring-gletscher/10 md:aspect-[4/5]"
          />
          {/* The amber drop – single warm focal point, centered on the ripple
              origin; a seamless warm bloom that seeds the ripple from the middle. */}
          <div
            aria-hidden
            className="hero-drop pointer-events-none absolute left-1/2 top-1/2 z-10 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-drop-glow"
          />
        </div>
      </div>
    </section>
  );
}
