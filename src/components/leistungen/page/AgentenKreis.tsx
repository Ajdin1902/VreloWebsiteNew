"use client";

import { useState } from "react";
import type { Agent } from "@/lib/kiAgenten";

// The agents on a ring around Dein Betrieb (Ajdin 2026-11-11), from lg up.
// The Inhaber-Assistent sits at 12 o'clock in honig, the departments follow
// clockwise. Each node is a button with name and result; a click shows its
// tasks in the middle, a second click (or the close button) returns to Dein
// Betrieb. The cards stay still (rotating text is unreadable); only the dashed
// outer ring turns and small dots run along the lines into the middle, both
// motion-safe. Geometry in percent of a square box, so lines and nodes share
// one coordinate system.
const RADIUS = 40;

function punkt(i: number, n: number) {
  const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
  return { x: 50 + RADIUS * Math.cos(a), y: 50 + RADIUS * Math.sin(a) };
}

export function AgentenKreis({
  agenten,
  mitte,
  hinweis,
  schliessen,
}: {
  agenten: Agent[];
  mitte: { titel: string; text: string };
  hinweis: string;
  schliessen: string;
}) {
  // Ring order: the top floor first (12 o'clock), then the departments clockwise.
  const ring = [...agenten.filter((a) => a.oberste), ...agenten.filter((a) => !a.oberste)];
  const [aktiv, setAktiv] = useState<Agent["id"] | null>(null);
  const gewaehlt = ring.find((a) => a.id === aktiv);

  return (
    <div data-kreis className="relative mx-auto aspect-square w-full max-w-[56rem]">
      <div
        aria-hidden
        className="absolute left-[10%] top-[10%] h-[80%] w-[80%] rounded-full border border-dashed border-gletscher/20 motion-safe:animate-[spin_180s_linear_infinite]"
      />
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {ring.map((a, i) => {
          const p = punkt(i, ring.length);
          return (
            <line
              key={a.id}
              data-linie
              x1={50}
              y1={50}
              x2={p.x}
              y2={p.y}
              vectorEffect="non-scaling-stroke"
              strokeWidth={a.id === aktiv ? 2.5 : 1.5}
              className={`transition-[stroke] duration-300 ${a.id === aktiv ? "stroke-honig" : "stroke-honig/35"}`}
            />
          );
        })}
      </svg>
      {ring.map((a, i) => {
        const p = punkt(i, ring.length);
        return (
          <span
            key={a.id}
            aria-hidden
            style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, animationDelay: `${i * 0.7}s` } as React.CSSProperties}
            className="absolute hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-honig opacity-0 shadow-[0_0_10px_var(--color-honig)] motion-safe:block motion-safe:animate-[agenten-puls_4.2s_linear_infinite]"
          />
        );
      })}

      <div
        id="agenten-mitte"
        data-mitte
        aria-live="polite"
        className="absolute left-1/2 top-1/2 flex aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-sonnenlicht p-[6%] text-center shadow-deepwater"
      >
        {gewaehlt ? (
          <>
            <h3 className="text-xl font-semibold text-tiefes-wasser">{gewaehlt.name}</h3>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-left text-sm text-tinte marker:text-ember">
              {gewaehlt.aufgaben.map((t) => (
                <li key={t} className="text-pretty">
                  {t}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setAktiv(null)}
              className="mt-4 text-sm font-semibold text-tiefes-wasser underline underline-offset-2 transition-colors hover:text-vrelo-petrol focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tiefes-wasser"
            >
              {schliessen}
            </button>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold tracking-tight text-tiefes-wasser">{mitte.titel}</p>
            <p className="mt-3 text-pretty text-tinte">{mitte.text}</p>
            <p className="mt-4 text-pretty text-sm text-stumm">{hinweis}</p>
          </>
        )}
      </div>

      {ring.map((a, i) => {
        const p = punkt(i, ring.length);
        const oben = Boolean(a.oberste);
        const an = a.id === aktiv;
        return (
          <button
            key={a.id}
            type="button"
            data-knoten={a.id}
            data-oberste={oben ? "" : undefined}
            aria-pressed={an}
            aria-controls="agenten-mitte"
            onClick={() => setAktiv(an ? null : a.id)}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 text-left shadow-deepwater transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-honig ${
              oben ? "w-60 border-honig bg-honig" : "w-52 border-gletscher/25 bg-vrelo-petrol/85 backdrop-blur-sm hover:border-honig/60"
            } ${an ? "ring-2 ring-honig ring-offset-4 ring-offset-tiefes-wasser" : ""} ${an && !oben ? "border-honig" : ""}`}
          >
            <span className={`block font-semibold ${oben ? "text-lg text-tiefes-wasser" : "text-papier"}`}>{a.name}</span>
            <span className={`mt-2 block text-pretty font-serif text-sm italic leading-snug ${oben ? "text-tiefes-wasser" : "text-honig"}`}>
              {a.ergebnis}
            </span>
          </button>
        );
      })}
    </div>
  );
}
