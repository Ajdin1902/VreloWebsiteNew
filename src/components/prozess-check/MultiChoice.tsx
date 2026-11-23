"use client";

import { useState } from "react";
import type { Step } from "@/lib/prozessCheck";
import { optionClass } from "./ui";
import { StepNav } from "./StepNav";

export function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** Bare checkbox list (role=checkbox + aria-checked), shared by the multi-select steps. */
export function CheckList({
  options,
  value,
  onToggle,
  labelledBy,
}: {
  options: readonly { value: string; label: string }[];
  value: readonly string[];
  onToggle: (v: string) => void;
  labelledBy: string;
}) {
  return (
    <ul role="group" aria-labelledby={labelledBy} className="mt-4 space-y-3">
      {options.map((o) => (
        <li key={o.value}>
          <button
            type="button"
            role="checkbox"
            aria-checked={value.includes(o.value)}
            className={optionClass}
            onClick={() => onToggle(o.value)}
          >
            {o.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

// Multi-select step: Weiter stays disabled until at least one item is picked.
export function MultiChoice<V extends string>({
  step,
  initial,
  onSubmit,
  onBack,
  showBack,
}: {
  step: Extract<Step, { kind: "multi" }>;
  initial: readonly V[];
  onSubmit: (value: V[]) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const [value, setValue] = useState<V[]>([...initial]);
  const headingId = `pc-frage-${step.id}`;
  return (
    <div>
      <h2 id={headingId} className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">
        {step.label}
      </h2>
      <p className="mt-2 text-sm text-stumm">{step.hint}</p>
      <CheckList
        options={step.options}
        value={value}
        onToggle={(v) => setValue((prev) => toggle(prev, v as V))}
        labelledBy={headingId}
      />
      <StepNav onBack={onBack} showBack={showBack} onNext={() => onSubmit(value)} nextDisabled={value.length === 0} />
    </div>
  );
}
