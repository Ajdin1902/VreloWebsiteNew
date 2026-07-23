import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { CTAButton } from "@/components/CTAButton";
import { makler } from "@/lib/makler";

// Focus-mode chrome: logo and one CTA, no navigation. Every nav link on a
// single-purpose outreach page is an exit before the close, so the only way
// out of this page is the booking section (or the legal links in the footer).
// Rendered by the page itself, not a layout — it can never leak elsewhere.
export function MaklerHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-faden bg-papier/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Vrelo – Startseite"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
        >
          <BrandLockup variant="navy" />
        </Link>
        {/* The full label wraps to two lines at 390px and butts against the
            logo, which also grows the sticky header past the #termin anchor's
            scroll offset. Same split the site Header uses. */}
        <div className="hidden sm:block">
          <CTAButton href={makler.hero.cta.href}>{makler.hero.cta.label}</CTAButton>
        </div>
        <div className="sm:hidden">
          <CTAButton href={makler.hero.cta.href}>{makler.hero.ctaShort}</CTAButton>
        </div>
      </div>
    </header>
  );
}
