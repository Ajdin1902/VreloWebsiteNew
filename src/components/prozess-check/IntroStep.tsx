"use client";

import { RESULT_UI, type Step } from "@/lib/prozessCheck";
import { primaryBtn } from "./ui";

export function IntroStep({ step, onStart }: { step: Extract<Step, { kind: "intro" }>; onStart: () => void }) {
  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{step.title}</h2>
      <p className="mt-3 text-pretty text-tinte">{step.text}</p>
      <button type="button" className={`mt-6 ${primaryBtn}`} onClick={onStart}>
        {step.cta}
      </button>
      <p className="mt-4 text-sm text-stumm">{RESULT_UI.privacyLine}</p>
    </div>
  );
}
