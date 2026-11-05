import { LazyVideo } from "@/components/LazyVideo";
import { referenzAnchorId, type Referenz } from "@/lib/referenzen";

// One client's full card on /referenzen (spec 2026-11-05 §5): header, family
// line (MDZ), overview, the Bausteine, the clip (MDZ), the result with its number.
// Facts only; the quotes are gathered in the band at the end (layout B).
export function ReferenzDetail({ referenz }: { referenz: Referenz }) {
  return (
    <article
      id={referenzAnchorId(referenz.slug)}
      className="card-depth scroll-mt-24 rounded-2xl border border-tinte/10 bg-papier p-7 md:p-10"
    >
      <h2 className="text-balance text-2xl font-semibold text-ember md:text-3xl">{referenz.name}</h2>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-stumm">
        {referenz.label} · Inhaber {referenz.inhaber}
      </p>
      {referenz.fakten ? <p className="mt-1 text-sm text-stumm">{referenz.fakten}</p> : null}
      {/* The family tie, set apart but quiet. Body font: Fraunces italic is reserved for Vrelo/Merak. */}
      {referenz.familie ? <p className="mt-5 text-pretty italic text-[#6f4a20]">{referenz.familie.lang}</p> : null}

      <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">{referenz.ueberblick}</p>

      <div className={referenz.clip ? "mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-start" : "mt-8"}>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stumm">Was ich gebaut habe</h3>
          <ul className="mt-3 space-y-3">
            {referenz.bausteine.map((b) => (
              <li key={b.titel} className="border-l-2 border-amber/60 pl-4 text-pretty text-tinte">
                <strong className="font-semibold">{b.titel}:</strong> {b.text}
              </li>
            ))}
          </ul>
        </div>
        {/* Decorative motion; the first Baustein above says what the clip shows. */}
        {referenz.clip ? (
          <LazyVideo
            mp4={referenz.clip.mp4}
            poster={referenz.clip.poster}
            className="w-full rounded-xl object-cover shadow-deepwater"
          />
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-tinte/10 pt-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <p className="max-w-2xl text-pretty font-medium text-tinte">{referenz.resultat}</p>
        <div className="flex shrink-0 flex-col gap-0.5">
          <span className="text-2xl font-semibold text-ember">{referenz.kennzahl}</span>
          <span className="text-sm text-stumm">{referenz.kennzahlLabel}</span>
        </div>
      </div>
    </article>
  );
}
