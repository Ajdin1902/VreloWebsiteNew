import Link from "next/link";
import type { ReactNode } from "react";

export function CTAButton({
  href,
  children = "Quelle erkunden",
  variant = "primary",
}: {
  href: string;
  children?: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-amber";
  const styles =
    variant === "primary"
      ? "bg-amber text-tiefes-wasser hover:bg-honig"
      : "border border-stein text-tiefes-wasser hover:bg-gletscher";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
