import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { CTAButton } from "@/components/CTAButton";
import type { FocusCta } from "@/lib/nav";

// Focus-mode chrome: logo and at most one CTA, no navigation. Every nav link on
// a single-purpose outreach page is an exit before the close, so the only way
// out is the page's own close (or the legal links in the footer).
//
// Rendered by ChromeGate from the root layout, NOT by the page — that keeps this
// <header> a sibling of <main>, so it still maps to the banner landmark. When
// /makler rendered its own header from inside the page, the page had exactly one
// landmark and zero <nav> elements.
export function FocusHeader({ cta }: { cta?: FocusCta }) {
  return (
    <header className="sticky top-0 z-50 border-b border-faden bg-papier/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Vrelo, Startseite"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
        >
          <BrandLockup variant="navy" />
        </Link>
        {cta ? (
          <>
            {/* The full label wraps to two lines at 390px and butts against the
                logo, which also grows the sticky header past the #termin
                anchor's scroll offset. Same split the site Header uses. */}
            <div className="hidden sm:block">
              <CTAButton href={cta.href}>{cta.label}</CTAButton>
            </div>
            <div className="sm:hidden">
              <CTAButton href={cta.href}>{cta.short}</CTAButton>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
