import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-faden bg-papier/90 backdrop-blur">
      <nav aria-label="Hauptnavigation" className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* TODO Phase 2: swap text wordmark for public/logo SVG; add mobile hamburger. Mobile nav is provided by the Footer for now. */}
        <Link href="/" className="rounded-sm text-xl text-tiefes-wasser focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol">
          <BrandWord>Vrelo</BrandWord>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-sm text-sm text-tinte transition-colors hover:text-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <CTAButton href="/kontakt" />
        </div>
      </nav>
    </header>
  );
}
