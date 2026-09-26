import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandWord } from "@/components/BrandWord";
import { BrandLockup } from "@/components/BrandLockup";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { isNewsletterConfigured } from "@/lib/newsletter";
import { linkedinUrl } from "@/lib/site";
import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";

export function Footer() {
  return (
    <footer className="bg-tiefes-wasser text-gletscher">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <BrandLockup variant="paper" />
          <p className="mt-3 text-sm text-stein">
            Durchdachte Automatisierung für kleine Betriebe.
          </p>
          {/* The company page, for owners who look Vrelo up before they get in
              touch. Footer, not the homepage close: the close keeps one action.
              One-colour „in“ mark (LinkedIn allows it unaltered to link a page). */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vrelo auf LinkedIn"
            className="mt-4 inline-flex items-center gap-2 rounded-sm text-sm text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
            LinkedIn
          </a>
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
            {/* Not in navLinks: /prozess-check is a focus route (nav.test.ts). */}
            <li>
              <Link
                href={checkHref(CHECK_SRC.footer)}
                className="rounded-sm text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
              >
                {CHECK_CTA.short}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm text-stein">
          <Link
            href="/newsletter"
            className="mb-2 inline-block rounded-sm text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
          >
            Newsletter
          </Link>
          <p className="mb-3">Automatisierungs-Ideen mit KI, ruhig erklärt.</p>
          {isNewsletterConfigured() ? (
            <NewsletterForm compact />
          ) : (
            <Link
              href="/newsletter"
              className="rounded-sm text-honig underline underline-offset-4 hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
            >
              Zum Newsletter <span aria-hidden="true">→</span>
            </Link>
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
