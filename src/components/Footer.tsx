import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandWord } from "@/components/BrandWord";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { isNewsletterConfigured } from "@/lib/newsletter";

export function Footer() {
  return (
    <footer className="mt-24 bg-tiefes-wasser text-gletscher">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="text-2xl">
            <BrandWord>Vrelo</BrandWord>
          </div>
          <p className="mt-2 text-sm text-stein">
            Durchdachte Automatisierung für kleine Betriebe.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-sm text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-sm text-stein">
          <p className="mb-2 text-gletscher">Newsletter</p>
          <p className="mb-3">Automatisierungs-Ideen mit KI — ruhig erklärt.</p>
          {isNewsletterConfigured() ? (
            <NewsletterForm compact />
          ) : (
            <p className="text-xs text-stein">Bald verfügbar.</p>
          )}
        </div>
      </div>
      <div className="border-t border-vrelo-petrol">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-stein md:flex-row md:items-center md:justify-between">
          <p className="text-base">
            <BrandWord>Vrelo</BrandWord> errichtet die Quelle. Du erlebst den{" "}
            <BrandWord>Merak</BrandWord>-Effekt.
          </p>
          <div className="flex gap-4">
            <Link href="/impressum" className="rounded-sm text-stein hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig">Impressum</Link>
            <Link href="/datenschutz" className="rounded-sm text-stein hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
