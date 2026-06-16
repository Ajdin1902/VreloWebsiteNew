import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";

export function Hero() {
  return (
    <section className="hero-deepwater relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32 lg:py-40">
        {/* Left: the message */}
        <div>
          <h1 className="hero-reveal-h1 max-w-2xl text-balance text-[2.25rem] font-semibold leading-[1.13] tracking-[-0.02em] text-papier md:text-[3.25rem] md:leading-[1.1] lg:text-[3.75rem]">
            Manuelle Aufgaben rauben dir die Zeit.
          </h1>
          <p className="hero-reveal-sub mt-7 max-w-lg text-pretty text-[1.05rem] leading-relaxed tracking-[-0.005em] text-stein md:text-xl md:leading-relaxed">
            Ich baue maßgeschneiderte Automatisierungen für kleine Betriebe – Termine,
            Mails und Datenpflege laufen von selbst. So gewinnst du jede Woche Stunden
            zurück.
          </p>
          <div className="hero-reveal-cta mt-10">
            <CTAButton href="/kontakt" tone="dark" />
          </div>
        </div>

        {/* Right: the Merak „work done" scene — a static photo (LCP) with a slow
            ambient zoom + a few dust motes drifting in the window light. This is
            the gentle life that replaces the old WebGL ripple; decorative, so the
            image is alt="" and the H1 carries the meaning. Reduced-motion stills it. */}
        <div className="relative">
          <div className="shadow-deepwater relative aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-gletscher/10 md:aspect-[4/5]">
            <Image
              data-testid="hero-image"
              src="/images/hero-merak.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="hero-scene-img object-cover"
            />
            {/* Soft dust motes catching the golden-hour light. */}
            <div aria-hidden className="hero-dust pointer-events-none absolute inset-0">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
