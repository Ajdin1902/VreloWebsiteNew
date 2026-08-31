import Link from "next/link";
import type { Referenz } from "@/lib/referenzen";

type Props = {
  referenz: Referenz;
  variant: "full" | "compact";
  /** Surface override — defaults to opaque papier. Proof passes a frosted glass bg. */
  surfaceClassName?: string;
};

export function ReferenzCard({ referenz, variant, surfaceClassName }: Props) {
  const beats: Array<{ term: string; body: string }> =
    variant === "full"
      ? [
          { term: "Das Problem", body: referenz.problem },
          { term: "Gebaut", body: referenz.gebaut },
          { term: "Läuft", body: referenz.laeuft },
        ]
      : [];

  return (
    <article
      className={`card-depth flex h-full flex-col rounded-2xl border border-tinte/10 p-7 ${
        surfaceClassName ?? "bg-papier"
      }`}
    >
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">{referenz.label}</p>
      {/* Compact headline links to this project's full card on /leistungen (the
          full card carries the matching anchor id, set where it is rendered). */}
      <h3 className="mt-3 text-balance text-xl font-semibold text-ember">
        {variant === "compact" ? (
          <Link
            href={`/leistungen#referenz-${referenz.slug}`}
            className="rounded-sm underline decoration-ember/30 underline-offset-4 transition hover:decoration-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2"
          >
            {referenz.titel}
          </Link>
        ) : (
          referenz.titel
        )}
      </h3>

      {beats.length > 0 ? (
        <div className="mt-5 space-y-4">
          {beats.map((b) => (
            <div key={b.term}>
              <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{b.term}</p>
              <p className="mt-1 text-pretty text-tinte">{b.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Full card closes on the freier-Kopf Ergebnis; the compact card carries the
          one-line summary instead. */}
      <p className="mt-5 text-pretty font-medium text-tinte">
        {variant === "full" ? referenz.ergebnis : referenz.kompakt}
      </p>

      {/* The one honest number, set off by a hairline. mt-auto pushes it to the
          card foot so cards in a grid line their numbers up regardless of body length. */}
      {/* Caption always stacks below the kennzahl so both cards' footers are the
          same height and the big lines align across the grid (a long kennzahl like
          "Projektdokumentation" would otherwise wrap on one card only). */}
      <div className="mt-auto flex flex-col gap-0.5 border-t border-tinte/10 pt-5">
        <span className="text-2xl font-semibold text-ember">{referenz.kennzahl}</span>
        <span className="text-sm text-stumm">{referenz.kennzahlLabel}</span>
      </div>
    </article>
  );
}
