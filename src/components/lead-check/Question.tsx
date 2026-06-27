// src/components/lead-check/Question.tsx
"use client";

import { useState } from "react";
import type { Step } from "@/lib/leadCheck";

const optionClass =
  "w-full rounded-lg border border-tiefes-wasser/20 bg-papier px-4 py-3 text-left text-tinte transition-colors hover:border-vrelo-petrol hover:bg-gletscher/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier";
const primaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-tiefes-wasser px-5 py-2.5 text-sm font-semibold text-papier transition-colors hover:bg-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";
const ghostBtn =
  "inline-flex items-center justify-center rounded-lg border border-stein px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";

// onAnswer receives the typed value for a choice step, a number for a number
// step, or `undefined` when an optional step is skipped (caller applies default).
export function Question({
  step,
  onAnswer,
  onBack,
  showBack,
}: {
  step: Step;
  onAnswer: (value: string | number | undefined) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const isOptional = step.kind === "number" && "optional" in step && step.optional === true;
  const [num, setNum] = useState<string>("");
  const inputId = `lc-${step.id}`;

  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{step.label}</h2>

      {step.kind === "choice" ? (
        <ul className="mt-6 space-y-3">
          {step.options.map((o) => (
            <li key={o.value}>
              <button type="button" className={optionClass} onClick={() => onAnswer(o.value)}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <label htmlFor={inputId} className="sr-only">
            {step.label}
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={step.min}
            placeholder={step.placeholder}
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-full rounded-md border border-tiefes-wasser/20 bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
          />
          {isOptional && "hint" in step ? <p className="mt-2 text-sm text-stumm">{step.hint}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className={primaryBtn} onClick={() => onAnswer(num === "" ? undefined : Number(num))}>
              Weiter
            </button>
            {isOptional ? (
              <button type="button" className={ghostBtn} onClick={() => onAnswer(undefined)}>
                {"Überspringen"}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-stumm underline-offset-4 hover:text-tiefes-wasser hover:underline"
        >
          {"← Zurück"}
        </button>
      ) : null}
    </div>
  );
}
