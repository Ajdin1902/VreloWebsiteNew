"use client";

import { useState } from "react";
import type { Step } from "@/lib/prozessCheck";
import { inputClass } from "./ui";
import { StepNav } from "./StepNav";

// Optional free text (Arbeitstag as textarea) or URL (Website). Skip = empty answer.
export function TextStep({
  step,
  initial,
  onSubmit,
  onBack,
  showBack,
}: {
  step: Extract<Step, { kind: "text" | "url" }>;
  initial: string;
  onSubmit: (value: string) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const [value, setValue] = useState(initial);
  const inputId = `pc-text-${step.id}`;
  const maxLength = step.kind === "text" ? step.maxLength : 200;
  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">
        <label htmlFor={inputId}>{step.label}</label>
      </h2>
      <p className="mt-2 text-sm text-stumm">{step.hint}</p>
      {step.kind === "text" ? (
        <textarea id={inputId} rows={5} maxLength={maxLength} value={value} onChange={(e) => setValue(e.target.value)} className={`mt-4 ${inputClass}`} />
      ) : (
        <input id={inputId} type="url" inputMode="url" maxLength={maxLength} value={value} onChange={(e) => setValue(e.target.value)} className={`mt-4 ${inputClass}`} />
      )}
      <StepNav onBack={onBack} showBack={showBack} onNext={() => onSubmit(value.trim())} onSkip={() => onSubmit("")} />
    </div>
  );
}
