// src/components/claude-gehirn/PromptBox.tsx
"use client";

import { useState } from "react";

// The Claude-Gehirn prompt with a copy button. The text stays selectable so a
// failed clipboard call (old browser, denied permission) still leaves a way.
export function PromptBox({
  text,
  boxLabel,
  copyLabel,
  copiedLabel,
  failedLabel,
  hintLabel,
}: {
  text: string;
  boxLabel: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
  hintLabel: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="card-depth rounded-2xl bg-papier p-4 text-tinte md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm font-medium text-tiefes-wasser">
          {state === "copied" ? copiedLabel : state === "failed" ? failedLabel : hintLabel}
        </p>
        <button
          type="button"
          onClick={copy}
          className="cta-fx rounded-full bg-vrelo-petrol px-5 py-2.5 text-sm font-semibold text-papier hover:bg-tiefes-wasser focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
        >
          {copyLabel}
        </button>
      </div>
      {/* Short by decision (Ajdin 2026-10-04): the next section shows in the first
          screen; the fade says there is more, the hint says the button takes it all. */}
      <div className="relative mt-4">
        <pre
          tabIndex={0}
          aria-label={boxLabel}
          className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-lesepapier p-4 font-mono text-sm leading-relaxed text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol"
        >
          {text}
        </pre>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-linear-to-t from-lesepapier to-transparent" />
      </div>
    </div>
  );
}
