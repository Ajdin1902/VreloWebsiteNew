import Link from "next/link";
import type { ReactNode } from "react";

export function CTAButton({
  href,
  children = "Zeit zurückgewinnen",
  variant = "primary",
  tone = "papier",
}: {
  href: string;
  children?: ReactNode;
  variant?: "primary" | "ghost";
  tone?: "papier" | "dark";
}) {
  const offset =
    tone === "dark"
      ? "focus-visible:ring-offset-tiefes-wasser"
      : "focus-visible:ring-offset-papier";
  const base = `group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${offset} focus-visible:ring-amber`;
  const styles =
    variant === "primary"
      ? "bg-amber text-tiefes-wasser hover:bg-honig"
      : "border border-stein text-tiefes-wasser hover:bg-gletscher";
  // Sheen-sweep + lift on hover, primary only (defined in globals.css, motion-safe).
  const fx = variant === "primary" ? " cta-fx" : "";
  return (
    <Link href={href} className={`${base} ${styles}${fx}`}>
      <span className="relative z-[1]">{children}</span>
      {variant === "primary" ? (
        // Button-in-button trailing arrow: nested circle that shifts on hover.
        // aria-hidden so the accessible name stays the label text.
        <span
          aria-hidden="true"
          className="relative z-[1] flex h-5 w-5 items-center justify-center rounded-full bg-tiefes-wasser/10 text-xs leading-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:translate-x-0.5"
        >
          →
        </span>
      ) : null}
    </Link>
  );
}
