// src/components/lead-check/Question.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/leadCheck";

// Interactive boundaries must clear WCAG 1.4.11 (3:1) against the surface they
// sit on. These options sit on the bg-papier card and used to be bg-papier
// themselves: a 1.00 fill delta with a border at 1.49:1, i.e. no perceivable
// boundary at all. The border now carries it at 3.77:1 (vrelo-petrol/70
// composited over papier — measured, not estimated; /60 lands on 2.98 and
// misses). The gletscher/40 fill is only 1.04:1, so it is a visual nicety, not
// the affordance — do not weaken the border on the strength of it.
const optionClass =
  "w-full rounded-lg border border-vrelo-petrol/70 bg-gletscher/40 px-4 py-3 text-left text-tinte transition-colors hover:border-vrelo-petrol hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier";
const primaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-tiefes-wasser px-5 py-2.5 text-sm font-semibold text-papier transition-colors hover:bg-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";
const ghostBtn =
  "inline-flex items-center justify-center rounded-lg border border-vrelo-petrol/70 px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";

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

  // Reset the input when the parent advances to a different step (it reuses this
  // component instance). Adjusting state during render is React's sanctioned
  // alternative to a setState-in-effect.
  const [seenStepId, setSeenStepId] = useState(step.id);
  if (step.id !== seenStepId) {
    setSeenStepId(step.id);
    setNum("");
  }

  const inputId = `lc-${step.id}`;
  const headingId = `lc-frage-${step.id}`;
  const hintId = `lc-hint-${step.id}`;

  // Advancing a step unmounts whatever held focus, dropping it to <body>: a
  // keyboard user then re-tabs from the top of the document, once per question.
  // Move focus to the new question instead. Skipped on first mount so landing on
  // the page doesn't yank the viewport down to the card.
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

      {step.kind === "choice" ? (
        // role=group + aria-labelledby ties the options to the question they
        // answer; without it a screen reader announces N unrelated buttons.
        <ul role="group" aria-labelledby={headingId} className="mt-6 space-y-3">
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
            aria-describedby={isOptional && "hint" in step ? hintId : undefined}
            className="w-full rounded-md border border-vrelo-petrol/70 bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
          />
          {isOptional && "hint" in step ? (
            <p id={hintId} className="mt-2 text-sm text-stumm">
              {step.hint}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className={`${primaryBtn} disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={!isOptional && num.trim() === ""}
              onClick={() => onAnswer(num === "" ? undefined : Number(num))}
            >
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
