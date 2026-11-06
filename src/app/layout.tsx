import type { Metadata } from "next";
import { jakarta, fraunces } from "@/lib/fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChromeGate } from "@/components/ChromeGate";
import { siteUrl } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vrelo - Durchdachte Automatisierung für Betriebe und Unternehmen",
    template: "%s - Vrelo",
  },
  description:
    "Maßgeschneiderte Automatisierungen für Betriebe und Unternehmen. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Vrelo",
  },
  // Only the card type: title/description fall back to each page's own metadata.
  // An absolute title here showed the homepage text on every subpage share.
  twitter: { card: "summary_large_image" },
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
        <ChromeGate slot="header">
          <Header />
        </ChromeGate>
        <main className="flex-1">{children}</main>
        <ChromeGate slot="footer">
          <Footer />
        </ChromeGate>
        <Analytics />
      </body>
    </html>
  );
}
