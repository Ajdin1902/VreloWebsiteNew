// src/components/kontakt/ContactSuccess.tsx
import Link from "next/link";
import { darkLinkClass } from "./onDarkLink";

export function ContactSuccess() {
  return (
    <div role="status" className="text-center">
      <div
        aria-hidden="true"
        className="success-ring mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber/60"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-amber" />
      </div>
      <p className="font-serif text-2xl text-papier">Danke – ich melde mich.</p>
      <p className="mx-auto mt-3 max-w-[34ch] text-sm leading-relaxed text-gletscher">
        Deine Nachricht ist bei mir. Ich antworte persönlich, meist innerhalb von ein, zwei Werktagen.
      </p>
      <div className="mt-6 flex justify-center gap-5 text-sm">
        <Link href="/leistungen" className={darkLinkClass}>Meine Arbeit ansehen</Link>
        <Link href="/ratgeber" className={darkLinkClass}>Ratgeber lesen</Link>
      </div>
    </div>
  );
}
