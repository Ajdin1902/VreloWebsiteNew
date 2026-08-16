import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Demo } from "@/components/demo/Demo";
import { isDemoConfigured } from "@/lib/demo/config";
import { calLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Termin-Quelle live ausprobieren",
  description: "Beschreib kurz deinen Betrieb und erlebe die Termin-Quelle aus Sicht deines Kunden.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <>
      <PageHero
        title="Probier die Termin-Quelle selbst aus."
        src="/images/lead-check-banner.webp"
        lead="Beschreib kurz deinen Betrieb. Dann schlüpfst du in die Rolle deines eigenen Kunden und erlebst, wie aus einer Anfrage von selbst ein Termin wird."
      />
      <div className="-mt-10 bg-gletscher/30 md:-mt-12">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-4 md:pb-32 md:pt-6">
          {isDemoConfigured() ? (
            <Demo calLink={calLink()} />
          ) : (
            <div className="card-depth rounded-2xl border border-faden bg-papier p-6 text-center md:p-10">
              <p className="text-tinte">Die Demo ist gleich bald verfügbar. Schreib mir gern direkt. Ich zeig sie dir persönlich.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
