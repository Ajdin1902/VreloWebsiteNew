"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isFocusRoute, focusChrome } from "@/lib/nav";
import { FocusHeader } from "@/components/focus/FocusHeader";
import { FocusFooter } from "@/components/focus/FocusFooter";

// Swaps the site chrome for minimal focus chrome on focus routes (single-purpose
// outreach landing pages). Header and Footer are Server Components and must be
// passed as CHILDREN, never as a prop — passing a component across the RSC
// boundary as a prop throws. usePathname() resolves during SSR of client
// components in the App Router, so the right chrome is already in the
// server-rendered HTML: no flash, no CLS.
//
// `slot` decides which half of the focus chrome this gate stands in for. Both
// gates live in the root layout as siblings of <main>, which is what keeps the
// banner and contentinfo landmarks intact — a <header> rendered from inside the
// page is scoped to <main> and maps to neither.
export function ChromeGate({ children, slot }: { children: ReactNode; slot: "header" | "footer" }) {
  const pathname = usePathname();

  if (isFocusRoute(pathname)) {
    const config = focusChrome[pathname!] ?? {};
    return slot === "header" ? <FocusHeader cta={config.cta} /> : <FocusFooter />;
  }

  return <>{children}</>;
}
