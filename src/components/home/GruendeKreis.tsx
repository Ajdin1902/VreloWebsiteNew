"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandWord } from "@/components/BrandWord";

export type Grund = { id: string; title: string; body: string; link?: { href: string; label: string } };

// The reasons on a ring around Vrelo (Ajdin 2026-11-12, like the KI-Agenten
// ring), from lg up on the warm Proof band. Each reason is a frosted papier
// button; a click shows its text in the dark middle, a second click (or the
// close button) returns to Vrelo. Only small amber dots move, running along the
// lines into the middle, motion-safe (keyframes agenten-puls in globals.css).
// Geometry in percent of a square box, so lines and nodes share one system.
const RADIUS = 40;

function punkt(i: number, n: number) {
  const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
  return { x: 50 + RADIUS * Math.cos(a), y: 50 + RADIUS * Math.sin(a) };
}

export function GruendeKreis({
  gruende,
  hinweis,
  schliessen,
}: {
  gruende: Grund[];
  hinweis: string;
  schliessen: string;
}) {
  const [aktiv, setAktiv] = useState<string | null>(null);
  const gewaehlt = gruende.find((g) => g.id === aktiv);

  return (
    <div data-kreis className="relative mx-auto aspect-square w-full max-w-[52rem]">
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {gruende.map((g, i) => {
          const p = punkt(i, gruende.length);
          return (
            <line
              key={g.id}
              x1={50}
              y1={50}
              x2={p.x}
              y2={p.y}
              vectorEffect="non-scaling-stroke"
              strokeWidth={g.id === aktiv ? 2.5 : 1.5}
              className={`transition-[stroke] duration-300 ${g.id === aktiv ? "stroke-ember" : "stroke-ember/35"}`}
            />
          );
        })}
      </svg>
      {gruende.map((g, i) => {
        const p = punkt(i, gruende.length);
        return (
          <span
            key={g.id}
            aria-hidden
            style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, animationDelay: `${i * 0.7}s` } as React.CSSProperties}
            className="absolute hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber opacity-0 shadow-[0_0_10px_var(--color-amber)] motion-safe:block motion-safe:animate-[agenten-puls_4.2s_linear_infinite]"
          />
        );
      })}

      <div
        id="gruende-mitte"
        data-mitte
        aria-live="polite"
        className="absolute left-1/2 top-1/2 flex aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-tiefes-wasser p-[6%] text-center shadow-deepwater"
      >
        {gewaehlt ? (
          <>
            <h3 className="text-balance text-lg font-semibold text-honig">{gewaehlt.title}</h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-gletscher">{gewaehlt.body}</p>
            {gewaehlt.link ? (
              <Link
                href={gewaehlt.link.href}
                className="mt-3 text-sm text-honig underline underline-offset-2 transition-colors hover:text-papier"
              >
                {gewaehlt.link.label}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setAktiv(null)}
              className="mt-4 text-sm font-semibold text-papier underline underline-offset-2 transition-colors hover:text-honig focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-honig"
            >
              {schliessen}
            </button>
          </>
        ) : (
          <>
            <BrandWord className="text-6xl text-papier">Vrelo</BrandWord>
            <p className="mt-4 text-pretty text-sm text-gletscher">{hinweis}</p>
          </>
        )}
      </div>

      {gruende.map((g, i) => {
        const p = punkt(i, gruende.length);
        const an = g.id === aktiv;
        return (
          <button
            key={g.id}
            type="button"
            data-knoten={g.id}
            aria-pressed={an}
            aria-controls="gruende-mitte"
            onClick={() => setAktiv(an ? null : g.id)}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className={`card-depth absolute w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 text-left backdrop-blur-sm transition duration-300 hover:border-ember/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember ${
              an ? "border-ember bg-papier ring-2 ring-ember" : "border-papier/50 bg-papier/80"
            }`}
          >
            <span className="block text-pretty text-lg font-semibold leading-snug text-ember">{g.title}</span>
          </button>
        );
      })}
    </div>
  );
}
