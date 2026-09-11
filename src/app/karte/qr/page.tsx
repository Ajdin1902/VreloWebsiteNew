import type { Metadata } from "next";
import { BrandWord } from "@/components/BrandWord";

export const metadata: Metadata = {
  title: "QR-Code: Visitenkarte",
  robots: { index: false, follow: false },
};

export default function KarteQrPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-papier px-6">
      {/* Static committed SVG; plain img avoids next/image SVG config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/karte-qr.svg" alt="QR-Code zur Visitenkarte" className="w-64 max-w-[80vw]" />
      <p className="text-lg text-vrelo-petrol">
        <BrandWord>Vrelo</BrandWord>
      </p>
    </div>
  );
}
