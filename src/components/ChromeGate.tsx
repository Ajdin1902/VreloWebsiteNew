"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isFocusRoute } from "@/lib/nav";

// Hides the site chrome on focus routes (single-purpose outreach landing pages).
// Header and Footer are Server Components and must be passed as CHILDREN, never
// as a prop — passing a component across the RSC boundary as a prop throws.
// usePathname() resolves during SSR of client components in the App Router, so
// the chrome is already absent in the server-rendered HTML: no flash, no CLS.
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isFocusRoute(pathname)) return null;
  return <>{children}</>;
}
