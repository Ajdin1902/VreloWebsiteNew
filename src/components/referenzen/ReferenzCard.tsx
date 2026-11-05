import Link from "next/link";
import { referenzAnchorId, type Referenz } from "@/lib/referenzen";

// The compact reference card (homepage + /leistungen hub). The full story lives
// on /referenzen; the headline links to the client's card there. The eyebrow
// carries the family tie for MDZ, so the name never appears without it (UWG §5).
export function ReferenzCard({ referenz }: { referenz: Referenz }) {
  const eyebrow = [referenz.name, referenz.label, referenz.familie?.kurz].filter(Boolean).join(" · ");

  return (
    <article className="card-depth flex h-full flex-col rounded-2xl border border-tinte/10 bg-papier p-7">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">{eyebrow}</p>
      <h3 className="mt-3 text-balance text-xl font-semibold text-ember">
        <Link
          href={`/referenzen#${referenzAnchorId(referenz.slug)}`}
          className="rounded-sm underline decoration-ember/30 underline-offset-4 transition hover:decoration-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2"
        >
          {referenz.titel}
        </Link>
      </h3>

      <p className="mt-5 text-pretty font-medium text-tinte">{referenz.kompakt}</p>

      {/* The one honest number, set off by a hairline. mt-auto pushes it to the
          card foot so cards in a grid line their numbers up regardless of body
          length; the caption always stacks below so both footers match. */}
      <div className="mt-auto flex flex-col gap-0.5 border-t border-tinte/10 pt-5">
        <span className="text-2xl font-semibold text-ember">{referenz.kennzahl}</span>
        <span className="text-sm text-stumm">{referenz.kennzahlLabel}</span>
      </div>
    </article>
  );
}
