// src/components/prozess-check/ProzessCheckFromUrl.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { normalizeSource } from "@/lib/source";
import { ProzessCheck } from "./ProzessCheck";

// Reads `?src=` on the client so the page itself stays static (a server-side
// searchParams read would make the indexed page dynamic). The page wraps this
// in <Suspense>, which Next requires around useSearchParams on static routes.
export function ProzessCheckFromUrl({ calUrl, research }: { calUrl: string | undefined; research: boolean }) {
  const params = useSearchParams();
  const source = normalizeSource(params?.get("src"));
  return <ProzessCheck calUrl={calUrl} source={source} research={research} />;
}
