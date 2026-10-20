import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false },
};

// Catches every unknown URL (old flyer links, typos, retired routes). Calm, one
// way out: back to the home page. Renders inside the root layout, so the site
// header and footer stay around it.
export default function NotFound() {
  return (
    <Section tone="paper">
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center text-center">
        <p aria-hidden="true" className="font-serif text-7xl italic leading-none text-vrelo-petrol/70 md:text-8xl">
          404
        </p>
        <h1 className="mt-6 text-balance text-3xl font-semibold text-tiefes-wasser md:text-4xl">
          Diese Seite gibt es nicht.
        </h1>
        <p className="mt-4 text-pretty text-lg text-tinte">
          Der Link ist alt oder enthält einen Tippfehler.
          <br />
          Auf der Startseite geht es weiter.
        </p>
        <div className="mt-8">
          <CTAButton href="/">Zur Startseite</CTAButton>
        </div>
      </div>
    </Section>
  );
}
