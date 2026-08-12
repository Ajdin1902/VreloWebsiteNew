// src/components/prozess-check/Question.tsx
"use client";

import { useEffect, useRef } from "react";
import type { Step } from "@/lib/prozessCheck";

// Interactive boundaries clear WCAG 1.4.11 (3:1) on the bg-papier card: the
// border carries the affordance at 3.77:1 (vrelo-petrol/70 over papier), the
// gletscher/40 fill is a nicety - same tokens as the lead-check option button.
const optionClass =
  "w-full rounded-lg border border-vrelo-petrol/70 bg-gletscher/40 px-4 py-3 text-left text-tinte transition-colors hover:border-vrelo-petrol hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier";

export function Question({
  step,
  onAnswer,
  onBack,
  showBack,
}: {
  step: Step;
  onAnswer: (value: string) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const headingId = `pc-frage-${step.id}`;

  // Advancing unmounts whatever held focus, dropping it to <body>; move focus to
  // the new question so a keyboard user doesn't re-tab from the top each time.
  // Skipped on first mount so landing on the page doesn't yank the viewport down.
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const isFirstRender = useRef(true);
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

      {/* role=group + aria-labelledby ties the options to the question. */}
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
