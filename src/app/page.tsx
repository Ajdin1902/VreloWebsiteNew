import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-tiefes-wasser md:text-5xl">
        <BrandWord>Vrelo</BrandWord> errichtet die Quelle. Du erlebst den{" "}
        <BrandWord>Merak</BrandWord>-Effekt.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-tinte">
        Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit,
        Ruhe und einen freien Kopf zurück.
      </p>
      <div className="mt-8">
        <CTAButton href="/kontakt" />
      </div>
      <p className="mt-16 text-sm text-stumm">
        Platzhalter-Startseite — das vollständige Hero &amp; die Sektionen folgen in Phase 2.
      </p>
    </section>
  );
}
