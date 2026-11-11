// src/components/vorlagen/SrcLink.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { withSrc } from "@/lib/prozessCheckCta";

// Passes the visitor's ?src= from /vorlagen on to a card's page, so a Bauplan
// request still names the button the visit started from (2026-11-11). Reads on
// the client so /vorlagen stays static; the page wraps it in <Suspense>.
export function SrcLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const params = useSearchParams();
  return (
    <Link href={withSrc(href, params?.get("src"))} className={className}>
      {children}
    </Link>
  );
}
