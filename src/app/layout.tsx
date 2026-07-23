import type { Metadata } from "next";
import { jakarta, fraunces } from "@/lib/fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChromeGate } from "@/components/ChromeGate";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
    template: "%s — Vrelo",
  },
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Vrelo",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
      template: "%s — Vrelo",
    },
    description:
      "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${jakarta.variable} ${fraunces.variable}`}>
      <head>
        {/* Enable scroll-reveal hidden states only when JS is available, before
            first paint — so no-JS renders everything visible (no FOUC). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('reveal-ready')",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ChromeGate>
          <Header />
        </ChromeGate>
        <main className="flex-1">{children}</main>
        <ChromeGate>
          <Footer />
        </ChromeGate>
      </body>
    </html>
  );
}
