import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-faden bg-papier/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl text-tiefes-wasser">
          <BrandWord>Vrelo</BrandWord>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-tinte transition-colors hover:text-vrelo-petrol"
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
