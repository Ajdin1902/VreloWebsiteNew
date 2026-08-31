// src/components/prozess-check/Question.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/prozessCheck";

const optionClass =
  "w-full rounded-lg border border-vrelo-petrol/70 bg-gletscher/40 px-4 py-3 text-left text-tinte transition-colors hover:border-vrelo-petrol hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier";

// Renders a single choice step. Choice clicks advance immediately (the parent
// appends the answer and moves on). The grid step is handled by the parent via
// HoursGrid, never here.
export function Question({
  step,
  onAnswer,
  onBack,
  showBack,
}: {
  step: Extract<Step, { kind: "choice" }>;
  onAnswer: (value: string) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const headingId = `pc-frage-${step.id}`;
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const isFirstRender = useRef(true);
  const [seenStepId, setSeenStepId] = useState(step.id);
  if (step.id !== seenStepId) setSeenStepId(step.id);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step.id]);

  return (
    <div>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="text-balance text-2xl font-semibold text-tiefes-wasser outline-none md:text-3xl"
      >
        {step.label}
      </h2>

      <ul role="group" aria-labelledby={headingId} className="mt-6 space-y-3">
        {step.options.map((o) => (
          <li key={o.value}>
            <button type="button" className={optionClass} onClick={() => onAnswer(o.value)}>
              {o.label}
            </button>
          </li>
        ))}
      </ul>

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
