// src/components/prozess-check/ProzessCheck.tsx
"use client";

import { useState } from "react";
import { STEPS, resultCopy, type ProzessCheckAnswers } from "@/lib/prozessCheck";
import { Question } from "./Question";
import { Result } from "./Result";

export function ProzessCheck({ calLink }: { calLink: string | undefined }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<ProzessCheckAnswers>>({});

  if (index >= STEPS.length) {
    // Every step is required and advances on click, so answers are complete here.
    // Defaults exist only for type-safety.
    const final: ProzessCheckAnswers = {
      aufgabe: answers.aufgabe ?? "anfragen",
      zeit: answers.zeit ?? "1bis3",
      konsequenz: answers.konsequenz ?? "liegen",
      abende: answers.abende ?? "abundzu",
      versucht: answers.versucht ?? "garnicht",
    };
    return <Result copy={resultCopy(final)} calLink={calLink} />;
  }

  const step = STEPS[index];

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    setIndex((i) => i + 1);
  };

  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <p role="status" aria-live="polite" className="text-sm text-stumm">
        Frage {index + 1} von {STEPS.length}
      </p>
      <div className="mt-4">
        <Question
          step={step}
          onAnswer={handleAnswer}
          onBack={() => setIndex((i) => Math.max(0, i - 1))}
          showBack={index > 0}
        />
      </div>
    </div>
  );
}
