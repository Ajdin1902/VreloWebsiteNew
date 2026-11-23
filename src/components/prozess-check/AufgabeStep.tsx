"use client";

import { useState } from "react";
import type { Kanal, Menge, Step, Wer } from "@/lib/prozessCheck";
import { optionClass } from "./ui";
import { CheckList, toggle } from "./MultiChoice";
import { StepNav } from "./StepNav";

type Value = { kanaele: Kanal[]; menge?: Menge; wer?: Wer };

function Radios<V extends string>({
  label,
  id,
  options,
  value,
  onPick,
}: {
  label: string;
  id: string;
  options: readonly { value: V; label: string }[];
  value: V | undefined;
  onPick: (v: V) => void;
}) {
  return (
    <div className="mt-6">
      <p id={id} className="font-medium text-tiefes-wasser">
        {label}
      </p>
      <ul role="radiogroup" aria-labelledby={id} className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <li key={o.value}>
            <button type="button" role="radio" aria-checked={value === o.value} className={optionClass} onClick={() => onPick(o.value)}>
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// One screen, three groups: how it comes in (multi), how often, who does it.
export function AufgabeStep({
  step,
  initial,
  onSubmit,
  onBack,
  showBack,
}: {
  step: Extract<Step, { kind: "aufgabe" }>;
  initial: Value;
  onSubmit: (v: { kanaele: Kanal[]; menge: Menge; wer: Wer }) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const [v, setV] = useState<Value>(initial);
  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{step.label}</h2>
      <div className="mt-6">
        <p id="pc-aufgabe-kanal" className="font-medium text-tiefes-wasser">
          {step.kanalLabel}
        </p>
        <CheckList
          options={step.kanaele}
          value={v.kanaele}
          onToggle={(k) => setV((p) => ({ ...p, kanaele: toggle(p.kanaele, k as Kanal) }))}
          labelledBy="pc-aufgabe-kanal"
        />
      </div>
      <Radios label={step.mengeLabel} id="pc-aufgabe-menge" options={step.menge} value={v.menge} onPick={(menge) => setV((p) => ({ ...p, menge }))} />
      <Radios label={step.werLabel} id="pc-aufgabe-wer" options={step.wer} value={v.wer} onPick={(wer) => setV((p) => ({ ...p, wer }))} />
      <StepNav
        onBack={onBack}
        showBack={showBack}
        nextDisabled={v.kanaele.length === 0 || !v.menge || !v.wer}
        onNext={() => v.menge && v.wer && onSubmit({ kanaele: v.kanaele, menge: v.menge, wer: v.wer })}
      />
    </div>
  );
}
