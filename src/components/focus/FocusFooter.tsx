import Link from "next/link";
import { BrandWord } from "@/components/BrandWord";

const linkClass =
  "rounded-sm text-stein transition-colors hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig";

// Minimal focus-mode footer: legal reachability is not optional, the rest is.
// stein on tiefes-wasser is 7.5:1 — the only surface where stein clears AA.
//
// The links sit in a <nav aria-label="Rechtliches"> so the page has at least one
// navigation landmark; as a bare <div> they were unreachable by landmark
// navigation. Rendered from the root layout so this stays a sibling of <main>
// and keeps its contentinfo role.
export function FocusFooter() {
  return (
    <footer className="bg-tiefes-wasser text-gletscher">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-stein md:flex-row md:items-center md:justify-between">
        <p className="text-base">
          <BrandWord>Vrelo</BrandWord> errichtet die Quelle. Du erlebst den{" "}
          <BrandWord>Merak</BrandWord>-Effekt.
        </p>
        <nav aria-label="Rechtliches" className="flex gap-4">
          <Link href="/impressum" className={linkClass}>
            Impressum
          </Link>
          <Link href="/datenschutz" className={linkClass}>
            Datenschutz
          </Link>
          <Link href="/kontakt" className={linkClass}>
            Kontakt
          </Link>
        </nav>
      </div>
    </footer>
  );
}
