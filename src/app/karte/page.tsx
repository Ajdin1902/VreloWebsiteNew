import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { KARTE } from "@/lib/karte";

export const metadata: Metadata = {
  title: "Visitenkarte: Ajdin Dzafic",
  robots: { index: false, follow: false },
};

export default function KartePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
      <div className="card-depth w-full rounded-3xl border border-faden bg-papier p-8 text-center">
        {/* Brand anchor: on a bare route the site chrome that normally carries
            the Vrelo lockup is gone, so the card carries the mark itself. The
            lockup inlines the vrelo-symbol-navy-amber geometry (amber drop). */}
        <BrandLockup variant="navy" className="justify-center" />

        <Image
          src="/images/karte-portrait.webp"
          alt="Porträt von Ajdin Dzafic"
          width={160}
          height={160}
          priority
          className="mx-auto mt-8 rounded-full object-cover"
        />
        <h1 className="mt-6 text-2xl font-semibold text-tinte">{KARTE.fullName}</h1>
        <p className="mt-1 text-sm text-tinte/80">{KARTE.descriptor}</p>

        <div className="mt-6 space-y-2 text-sm">
          <a href={`mailto:${KARTE.email}`} className="block py-2 text-vrelo-petrol underline">
            {KARTE.email}
          </a>
          <a href={`tel:${KARTE.phone.replace(/\s+/g, "")}`} className="block py-2 text-vrelo-petrol underline">
            {KARTE.phone}
          </a>
        </div>

        <a
          href={KARTE.vcfPath}
          className="mt-8 inline-block w-full rounded-xl bg-vrelo-petrol px-6 py-3 font-semibold text-papier"
        >
          Kontakt speichern
        </a>

        <Link href="/" className="mt-4 block py-2 text-xs text-tinte/60 underline">
          Website ansehen
        </Link>
      </div>

      <nav aria-label="Rechtliches" className="mt-6 flex gap-4 text-xs text-tinte/50">
        <Link href="/impressum" className="py-1 underline">
          Impressum
        </Link>
        <Link href="/datenschutz" className="py-1 underline">
          Datenschutz
        </Link>
      </nav>
    </div>
  );
}
