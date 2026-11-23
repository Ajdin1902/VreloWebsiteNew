// src/components/prozess-check/HoursGrid.tsx
"use client";

import { useState } from "react";
import { AREA_LABEL, type AreaId } from "@/lib/prozessCheck";
import { StepNav } from "./StepNav";

// One accessible range slider per picked area. Native <input type=range> carries the
// slider role, keyboard support, and touch for free; we add a visible value
// readout tied to the label via aria. Default 0 is honest: "nothing here" is a
// valid answer and drives the zero-state result.
export function HoursGrid({
  label,
  hint,
  max,
  areas,
  initial,
  onSubmit,
  onBack,
  showBack,
}: {
  label: string;
  hint: string;
  max: number;
  /** Only the picked areas get a slider. */
  areas: readonly AreaId[];
  initial?: Partial<Record<AreaId, number>>;
  onSubmit: (stunden: Partial<Record<AreaId, number>>) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const [stunden, setStunden] = useState<Partial<Record<AreaId, number>>>(() =>
    Object.fromEntries(areas.map((id) => [id, initial?.[id] ?? 0])),
  );

  const setArea = (id: AreaId, value: number) => setStunden((prev) => ({ ...prev, [id]: value }));

  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{label}</h2>
      <p className="mt-2 text-sm text-stumm">{hint}</p>

      <ul className="mt-6 space-y-5">
        {areas.map((id) => {
          const inputId = `pc-h-${id}`;
          const val = stunden[id] ?? 0;
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

      <StepNav onBack={onBack} showBack={showBack} onNext={() => onSubmit(stunden)} />
    </div>
  );
}
