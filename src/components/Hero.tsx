import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";
import { RippleImage } from "@/components/RippleImage";

export function Hero() {
  return (
    <section className="hero-deepwater relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32 lg:py-40">
        {/* Left: the message */}
        <div>
          <h1 className="max-w-2xl text-[2.25rem] font-semibold leading-[1.13] tracking-[-0.02em] text-papier md:text-[3.25rem] md:leading-[1.1] lg:text-[3.75rem]">
            <BrandWord>Vrelo</BrandWord> errichtet die Quelle.{" "}
            <br className="hidden sm:block" />
            Du erlebst den <BrandWord>Merak</BrandWord>-Effekt.
          </h1>
          <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed tracking-[-0.005em] text-stein md:text-xl md:leading-relaxed">
            Maßgeschneiderte Automatisierungen für kleine Betriebe. Sie übernehmen den
            wiederkehrenden Kleinkram — du gewinnst Zeit, Ruhe und einen freien Kopf zurück.
          </p>
          <div className="mt-10">
            <CTAButton href="/kontakt" tone="dark" />
          </div>
        </div>

        {/* Right: the rippling water panel with the drop that seeds it */}
        <div className="relative">
          {/* The amber drop — single warm focal point, above the panel, seeds the ripple. */}
          <div
            aria-hidden
            className="hero-drop pointer-events-none absolute -top-6 right-10 z-10 h-16 w-16 rounded-full motion-safe:animate-drop-glow md:right-16 md:h-20 md:w-20"
          />
          <RippleImage
            src="/video/ripples-poster.jpg"
            alt=""
            seedXFraction={0.72}
            className="aspect-[16/10] w-full rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] ring-1 ring-gletscher/10 md:aspect-[4/5]"
          />
        </div>
      </div>
    </section>
  );
}
