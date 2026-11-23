// src/components/prozess-check/ProzessCheck.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  RESULT_UI,
  WIZARD_UI,
  activeSteps,
  resultCopy,
  type AreaId,
  type ProzessCheckAnswers,
} from "@/lib/prozessCheck";
import { Question } from "./Question";
import { HoursGrid } from "./HoursGrid";
import { MultiChoice } from "./MultiChoice";
import { AufgabeStep } from "./AufgabeStep";
import { ProgrammeStep } from "./ProgrammeStep";
import { TextStep } from "./TextStep";
import { IntroStep } from "./IntroStep";
import { Result } from "./Result";

type PartialAnswers = Partial<ProzessCheckAnswers>;

export function ProzessCheck({
  calUrl,
  source,
}: {
  calUrl: string | undefined;
  /** Attribution slug from `?src=` (e.g. `brief-handwerk`), already normalized. */
  source?: string;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});

  const steps = activeSteps(answers);

  // The clicked button unmounts on every step change: move focus to the new step.
  // Skipped on first render so the page does not steal focus on load.
  const stepRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);
  const stepId = steps[index]?.id;
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepRef.current?.focus();
  }, [stepId]);

  if (index >= steps.length) {
    // Required steps gate their own Weiter, so the defaults only cover skipped optional steps.
    const bereiche = answers.bereiche ?? [];
    const final: ProzessCheckAnswers = {
      bereiche,
      stunden: answers.stunden ?? {},
      nervt: answers.nervt ?? bereiche[0] ?? "anfragen",
      kanaele: answers.kanaele ?? [],
      menge: answers.menge ?? "bis5",
      wer: answers.wer ?? "ich",
      programmeChips: answers.programmeChips ?? [],
      programmeText: answers.programmeText ?? "",
      arbeitstag: answers.arbeitstag ?? "",
      abende: answers.abende ?? "nein",
      versucht: answers.versucht ?? "nichts",
      branche: answers.branche ?? "anderes",
      team: answers.team ?? "allein",
      arbeitsort: answers.arbeitsort ?? "buero",
      ...(answers.website ? { website: answers.website } : {}),
    };
    return <Result answers={final} copy={resultCopy(final)} calUrl={calUrl} source={source} />;
  }

  const step = steps[index];
  const advance = (patch: PartialAnswers) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));
  const showBack = index > 0;

  // Picking areas keeps stunden/nervt consistent: drop what is no longer picked;
  // a single area is also the nervt answer (that step is skipped).
  const pickAreas = (bereiche: AreaId[]) => {
    const stunden = Object.fromEntries(
      Object.entries(answers.stunden ?? {}).filter(([id]) => bereiche.includes(id as AreaId)),
    );
    const nervt =
      bereiche.length === 1 ? bereiche[0] : answers.nervt && bereiche.includes(answers.nervt) ? answers.nervt : undefined;
    advance({ bereiche, stunden, nervt });
  };

  let body;
  switch (step.kind) {
    case "intro":
      body = <IntroStep step={step} onStart={() => setIndex(1)} />;
      break;
    case "multi":
      body = <MultiChoice step={step} initial={answers.bereiche ?? []} onSubmit={pickAreas} onBack={back} showBack={showBack} />;
      break;
    case "grid":
      body = (
        <HoursGrid
          label={step.label}
          hint={step.hint}
          max={step.max}
          areas={answers.bereiche ?? []}
          initial={answers.stunden}
          onSubmit={(stunden) => advance({ stunden })}
          onBack={back}
          showBack={showBack}
        />
      );
      break;
    case "aufgabe":
      body = (
        <AufgabeStep
          step={step}
          initial={{ kanaele: answers.kanaele ?? [], menge: answers.menge, wer: answers.wer }}
          onSubmit={advance}
          onBack={back}
          showBack={showBack}
        />
      );
      break;
    case "programme":
      body = (
        <ProgrammeStep
          step={step}
          initial={{ chips: answers.programmeChips ?? [], text: answers.programmeText ?? "" }}
          onSubmit={({ chips, text }) => advance({ programmeChips: chips, programmeText: text })}
          onBack={back}
          showBack={showBack}
        />
      );
      break;
    case "text":
    case "url":
      body = (
        <TextStep
          step={step}
          initial={(answers[step.id] as string | undefined) ?? ""}
          onSubmit={(value) => advance({ [step.id]: value } as PartialAnswers)}
          onBack={back}
          showBack={showBack}
        />
      );
      break;
    case "choice":
      body = (
        <Question
          step={step}
          onAnswer={(value) => advance({ [step.id]: value } as PartialAnswers)}
          onBack={back}
          showBack={showBack}
        />
      );
      break;
  }

  return (
    <div className="card-depth rounded-2xl border border-faden bg-lesepapier p-6 md:p-10">
      {step.kind === "intro" ? null : (
        // The intro is not a question: the counter starts at 1 on the first real step.
        <p role="status" aria-live="polite" className="text-sm text-stumm">
          {WIZARD_UI.progress(index, steps.length - 1)}
        </p>
      )}
      {index === 1 ? <p className="mt-1 text-sm text-stumm">{RESULT_UI.privacyLine}</p> : null}
      <div ref={stepRef} tabIndex={-1} className="mt-4 outline-none">
        {body}
      </div>
    </div>
  );
}
