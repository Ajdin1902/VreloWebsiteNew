import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 140% 110% at 80% 0%, #1b5063 0%, #0d3147 30%, #0a2538 58%, #071c2b 100%)",
      }}
    >
      {/*
        Glowing amber drop — the Merak-Effekt made visible.
        Single focal point. Decorative (aria-hidden).
        Subtle 6s shimmer is motion-safe gated.
      */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute",
          // Position: upper-right, breathing room from edge
          "right-10 top-16 md:right-28 md:top-20 lg:right-36 lg:top-24",
          // Size: small on mobile, grows on wider viewports
          "h-20 w-20 md:h-36 md:w-36 lg:h-40 lg:w-40",
          "rounded-full",
          // Inner radial: warm papier core fading to amber rim then transparent
          "bg-[radial-gradient(circle_at_50%_38%,#f9f0de,#f4e4c1_22%,#d4a24c_58%,rgba(212,162,76,0)_74%)]",
          // Outer glow: two-layer — diffuse warmth + tight bright ring
          "shadow-[0_0_80px_22px_rgba(212,162,76,0.38),0_0_20px_6px_rgba(244,228,193,0.22)]",
          // Shimmer: only when motion is OK
          "motion-safe:animate-drop-glow",
        ].join(" ")}
      />

      {/*
        Water-surface accent — a single hairline gradient at the bottom edge.
        Whispers transition to the next section (papier). Not a second focal point.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{
          background:
            "linear-gradient(to top, rgba(244,239,230,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44 lg:py-52">
        <h1
          className={[
            "max-w-2xl",
            // Type scale
            "text-[2.25rem] leading-[1.13] tracking-[-0.02em]",
            "md:text-[3.5rem] md:leading-[1.1]",
            "lg:text-[4rem]",
            // Weight + color
            "font-semibold text-papier",
          ].join(" ")}
        >
          <BrandWord>Vrelo</BrandWord> errichtet die Quelle.{" "}
          <br className="hidden sm:block" />
          Du erlebst den <BrandWord>Merak</BrandWord>-Effekt.
        </h1>

        <p
          className={[
            "mt-7 max-w-lg",
            "text-[1.05rem] leading-relaxed tracking-[-0.005em]",
            "md:text-xl md:leading-relaxed",
            "text-stein",
          ].join(" ")}
        >
          Maßgeschneiderte Automatisierungen für kleine Betriebe. Sie übernehmen den
          wiederkehrenden Kleinkram — du gewinnst Zeit, Ruhe und einen freien Kopf zurück.
        </p>

        <div className="mt-10">
          <CTAButton href="/kontakt" />
        </div>
      </div>
    </section>
  );
}
