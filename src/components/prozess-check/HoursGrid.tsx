// src/components/prozess-check/HoursGrid.tsx
"use client";

import { useState } from "react";
import { AREA_IDS, AREA_LABEL, type AreaId } from "@/lib/prozessCheck";

const primaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-tiefes-wasser px-5 py-2.5 text-sm font-semibold text-papier transition-colors hover:bg-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";

const zeroState: Record<AreaId, number> = { anfragen: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 };

// One accessible range slider per area. Native <input type=range> carries the
// slider role, keyboard support, and touch for free; we add a visible value
// readout tied to the label via aria. Default 0 is honest: "nothing here" is a
// valid answer and drives the zero-state result.
export function HoursGrid({
  label,
  hint,
  max,
  onSubmit,
  onBack,
  showBack,
}: {
  label: string;
  hint: string;
  max: number;
  onSubmit: (stunden: Record<AreaId, number>) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const [stunden, setStunden] = useState<Record<AreaId, number>>(zeroState);

  const setArea = (id: AreaId, value: number) => setStunden((prev) => ({ ...prev, [id]: value }));

  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{label}</h2>
      <p className="mt-2 text-sm text-stumm">{hint}</p>

      <ul className="mt-6 space-y-5">
        {AREA_IDS.map((id) => {
          const inputId = `pc-h-${id}`;
          const val = stunden[id];
          return (
            <li key={id}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={inputId} className="text-tinte">
                  {AREA_LABEL[id]}
                </label>
                <span aria-hidden="true" className="shrink-0 font-medium text-tiefes-wasser">
                  {val === 1 ? "1 Std." : `${val} Std.`}
                </span>
              </div>
              <input
                id={inputId}
                type="range"
                min={0}
                max={max}
                step={1}
                value={val}
                onChange={(e) => setArea(id, Number(e.target.value))}
                aria-valuetext={`${val} Stunden pro Woche`}
                className="mt-2 w-full accent-vrelo-petrol"
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className={primaryBtn} onClick={() => onSubmit(stunden)}>
          Ergebnis zeigen
        </button>
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-stumm underline-offset-4 hover:text-tiefes-wasser hover:underline"
          >
            {"← Zurück"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
