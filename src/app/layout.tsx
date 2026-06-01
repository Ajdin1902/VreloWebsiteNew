import type { Metadata } from "next";
import { jakarta, fraunces } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
  description:
    "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
