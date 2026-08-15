import type { ReactNode } from "react";
import { Section } from "@/components/Section";

// A petrol Section with a faint water backdrop (the homepage `Steps` treatment):
// an image under a petrol/70 overlay keeps content legible. Children render
// above the backdrop. `src` defaults to the Fließen river (Newsletter); /kontakt
// passes the blue-hour horizon so the water room and the misty ripple pond that
// closes the page share one still, dusk-lit register.
export function WaterSection({
  className = "",
  src = "/images/fliessen.webp",
  children,
}: {
  className?: string;
  src?: string;
  children: ReactNode;
}) {
  return (
    <Section tone="petrol" className={`relative isolate overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-vrelo-petrol/70" />
      {children}
    </Section>
  );
}
