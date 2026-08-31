// src/components/prozess-check/ProzessCheck.tsx
"use client";

import { useState } from "react";
import { STEPS, resultCopy, type ProzessCheckAnswers, type AreaId } from "@/lib/prozessCheck";
import { Question } from "./Question";
import { HoursGrid } from "./HoursGrid";
import { Result } from "./Result";

type PartialAnswers = Partial<Omit<ProzessCheckAnswers, "stunden">> & {
  stunden?: Record<AreaId, number>;
};

export function ProzessCheck({ calLink }: { calLink: string | undefined }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});

  if (index >= STEPS.length) {
    // Every step is required and advances on interaction, so answers are complete.
    const final: ProzessCheckAnswers = {
      branche: answers.branche ?? "anderes",
      team: answers.team ?? "allein",
      stunden: answers.stunden ?? { anfragen: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 },
      nervt: answers.nervt ?? "anfragen",
      abende: answers.abende ?? "nein",
      versucht: answers.versucht ?? "nichts",
    };
    return <Result answers={final} copy={resultCopy(final)} calLink={calLink} />;
  }

  const step = STEPS[index];
  const advance = (patch: PartialAnswers) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <p role="status" aria-live="polite" className="text-sm text-stumm">
        Frage {index + 1} von {STEPS.length}
      </p>
      <div className="mt-4">
        {step.kind === "grid" ? (
          <HoursGrid
            label={step.label}
            hint={step.hint}
            max={step.max}
            onSubmit={(stunden) => advance({ stunden })}
            onBack={back}
            showBack={index > 0}
          />
        ) : (
          <Question
            step={step}
            onAnswer={(value) => advance({ [step.id]: value } as PartialAnswers)}
            onBack={back}
            showBack={index > 0}
          />
        )}
      </div>
    </div>
  );
}
