import Image from "next/image";
import { LazyVideo } from "@/components/LazyVideo";
import { AblaufGrafik } from "@/components/referenzen/AblaufGrafik";
import { referenzAnchorId, type Referenz } from "@/lib/referenzen";

const beats = [
  { key: "problem", label: "Das Problem" },
  { key: "loesung", label: "Die Lösung" },
] as const;

// One client's card on /referenzen (Ajdin 2026-11-05, second round): logo, intro,
// Problem and Lösung as bullets, the visual, the tools, the owner's quote at the foot.
// Cards sit side by side; the quote is pushed to the card foot (mt-auto).
export function ReferenzDetail({ referenz }: { referenz: Referenz }) {
  return (
    <article
      id={referenzAnchorId(referenz.slug)}
      className="card-depth flex h-full scroll-mt-24 flex-col rounded-2xl border border-tinte/10 bg-papier p-6 md:p-8"
    >
      <h2>
        <Image
          src={referenz.logo.src}
          alt={referenz.name}
          width={referenz.logo.width}
          height={referenz.logo.height}
          className="h-14 w-auto rounded-md"
        />
      </h2>
      <p className="mt-4 text-sm font-medium uppercase tracking-wider text-stumm">
        {referenz.label} · Inhaber {referenz.inhaber}
      </p>
      <p className="mt-2 text-pretty text-tinte">{referenz.intro}</p>
      {/* The family tie, set apart but quiet. Body font: Fraunces italic is reserved for Vrelo/Merak. */}
      {referenz.familie ? <p className="mt-2 text-pretty text-sm italic text-[#6f4a20]">{referenz.familie.lang}</p> : null}

      {beats.map((b) => (
        <div key={b.key} className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{b.label}</p>
          <ul className="mt-2 space-y-1.5">
            {referenz[b.key].map((t) => (
              <li key={t} className="flex gap-2.5 text-pretty text-tinte">
                <span aria-hidden className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${b.key === "problem" ? "bg-stein" : "bg-amber"}`} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Same panel height for both clients, so the two visuals line up. */}
      <div className="mt-6 flex h-72 items-center justify-center overflow-hidden rounded-xl bg-gletscher/40">
        {referenz.visual.kind === "clip" ? (
          // Decorative motion; the first Lösung bullet above says what it shows.
          <LazyVideo mp4={referenz.visual.mp4} poster={referenz.visual.poster} className="h-full w-auto" />
        ) : (
          <AblaufGrafik schritte={referenz.visual.schritte} />
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stumm">Werkzeuge</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {referenz.werkzeuge.map((w) => (
            <li key={w} className="rounded-full border border-tinte/15 px-3 py-1 text-sm text-tinte">
              {w}
            </li>
          ))}
        </ul>
      </div>

      {/* The quote sits at the card foot (mt-auto), so both columns end on the same line. */}
      {referenz.stimme ? (
        <figure className="mt-auto pt-6">
          <div className="border-t border-tinte/10 pt-5">
            <blockquote className="text-pretty text-lg font-medium text-ember">{referenz.stimme.text}</blockquote>
            <figcaption className="mt-2 text-sm text-stumm">{referenz.stimme.name}</figcaption>
          </div>
        </figure>
      ) : null}
    </article>
  );
}
