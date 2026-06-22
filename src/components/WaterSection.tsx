import type { ReactNode } from "react";
import { Section } from "@/components/Section";

// A petrol Section with a faint flowing-water backdrop (the homepage `Steps`
// treatment): the fliessen texture under a petrol/70 overlay keeps content
// legible. Children render above the backdrop.
export function WaterSection({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Section tone="petrol" className={`relative isolate overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/fliessen.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-vrelo-petrol/70" />
      {children}
    </Section>
  );
}
