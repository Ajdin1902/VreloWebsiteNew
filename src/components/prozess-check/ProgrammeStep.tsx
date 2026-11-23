"use client";

import { useState } from "react";
import type { Step } from "@/lib/prozessCheck";
import { inputClass } from "./ui";
import { CheckList, toggle } from "./MultiChoice";
import { StepNav } from "./StepNav";

// Chips plus a free-text field. Raw input only: the server merges and caps.
export function ProgrammeStep({
  step,
  initial,
  onSubmit,
  onBack,
  showBack,
}: {
  step: Extract<Step, { kind: "programme" }>;
  initial: { chips: string[]; text: string };
  onSubmit: (v: { chips: string[]; text: string }) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const [chips, setChips] = useState(initial.chips);
  const [text, setText] = useState(initial.text);
  return (
    <div>
      <h2 id="pc-frage-programme" className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">
        {step.label}
      </h2>
      <CheckList
        options={step.chips.map((c) => ({ value: c, label: c }))}
        value={chips}
        onToggle={(c) => setChips((p) => toggle(p, c))}
        labelledBy="pc-frage-programme"
      />
      <label htmlFor="pc-programme-text" className="mt-6 block font-medium text-tiefes-wasser">
        {step.textLabel}
      </label>
      <p className="mt-1 text-sm text-stumm">{step.textHint}</p>
      <input
        id="pc-programme-text"
        type="text"
        maxLength={200}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`mt-2 ${inputClass}`}
      />
      <StepNav onBack={onBack} showBack={showBack} onNext={() => onSubmit({ chips, text })} />
    </div>
  );
}
