// src/components/kontakt/SchedulerFromUrl.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { normalizeSource } from "@/lib/source";
import { SchedulerEmbed } from "./SchedulerEmbed";

// Reads `?src=` on the client so /kontakt stays static (same pattern as
// ProzessCheckFromUrl). The slug is allow-listed by normalizeSource before it
// reaches the Cal notes field.
export function SchedulerFromUrl({ calLink }: { calLink: string | undefined }) {
  const params = useSearchParams();
  const source = normalizeSource(params?.get("src"));
  return <SchedulerEmbed calLink={calLink} notes={source ? `Quelle: ${source}` : undefined} />;
}
