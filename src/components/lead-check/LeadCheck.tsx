// src/components/lead-check/LeadCheck.tsx
"use client";

import { useState } from "react";
import { STEPS, computeResult, type LeadCheckAnswers } from "@/lib/leadCheck";
import { Question } from "./Question";
import { Result } from "./Result";

export function LeadCheck({ calLink }: { calLink: string | undefined }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<LeadCheckAnswers>>({});

  if (index >= STEPS.length) {
    const final: LeadCheckAnswers = {
      anfragenProWoche: answers.anfragenProWoche ?? 0,
      reaktionszeit: answers.reaktionszeit ?? "selberTag",
      abendsWochenende: answers.abendsWochenende ?? "manchmal",
      imTermin: answers.imTermin ?? "wartet",
      nachfassen: answers.nachfassen ?? "einmal",
      provision: answers.provision,
    };
    return <Result answers={final} result={computeResult(final)} calLink={calLink} />;
  }

  const step = STEPS[index];

  const handleAnswer = (value: string | number | undefined) => {
    setAnswers((prev) => {
      if (step.id === "provision") {
        return { ...prev, provision: typeof value === "number" ? value : undefined };
      }
      return { ...prev, [step.id]: value };
    });
    setIndex((i) => i + 1);
  };

  return (
    // A contained paper panel so the question doesn't float on the bare band —
    // the same card-depth surface the homepage Problem list uses.
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <p className="text-sm text-stumm">Frage {index + 1} von {STEPS.length}</p>
      <div className="mt-4">
        <Question step={step} onAnswer={handleAnswer} onBack={() => setIndex((i) => Math.max(0, i - 1))} showBack={index > 0} />
      </div>
    </div>
  );
}
