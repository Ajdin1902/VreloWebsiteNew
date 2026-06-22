// src/components/kontakt/ContactSuccess.tsx
import Link from "next/link";
import { lightLinkClass } from "./onDarkLink";

export function ContactSuccess() {
  return (
    <div role="status" className="text-center">
      <div
        aria-hidden="true"
        className="success-ring mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-tiefes-wasser/40"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-tiefes-wasser" />
      </div>
      <p className="font-serif text-2xl text-tiefes-wasser">Danke – ich melde mich.</p>
      <p className="mx-auto mt-3 max-w-[34ch] text-sm leading-relaxed text-tinte">
        Deine Nachricht ist bei mir. Ich antworte persönlich, meist innerhalb von ein, zwei Werktagen.
      </p>
      <div className="mt-6 flex justify-center gap-5 text-sm">
        <Link href="/leistungen" className={lightLinkClass}>Meine Arbeit ansehen</Link>
        <Link href="/ratgeber" className={lightLinkClass}>Ratgeber lesen</Link>
      </div>
    </div>
  );
}
