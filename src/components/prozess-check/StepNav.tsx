"use client";

import { WIZARD_UI } from "@/lib/prozessCheck";
import { backBtn, primaryBtn } from "./ui";

// Back left, optional skip + continue right (forward = right).
export function StepNav({
  onBack,
  showBack,
  onNext,
  nextDisabled,
  onSkip,
}: {
  onBack: () => void;
  showBack: boolean;
  onNext: () => void;
  nextDisabled?: boolean;
  onSkip?: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {showBack ? (
        <button type="button" onClick={onBack} className={backBtn}>
          {WIZARD_UI.back}
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-4">
        {onSkip ? (
          <button type="button" onClick={onSkip} className={backBtn}>
            {WIZARD_UI.skip}
          </button>
        ) : null}
        <button type="button" className={primaryBtn} onClick={onNext} disabled={nextDisabled}>
          {WIZARD_UI.next}
        </button>
      </div>
    </div>
  );
}
