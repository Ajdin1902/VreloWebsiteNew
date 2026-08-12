// src/components/prozess-check/Result.tsx
"use client";

import Link from "next/link";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { RESULT_UI, type ResultCopy } from "@/lib/prozessCheck";

export function Result({ copy, calLink }: { copy: ResultCopy; calLink: string | undefined }) {
  return (
    <div className="space-y-8">
      <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stumm">{RESULT_UI.resultLabel}</h2>
        <p className="mt-3 text-balance font-serif text-2xl text-tiefes-wasser md:text-3xl">{copy.headline}</p>
        <p className="mt-4 text-pretty text-tinte">{copy.body}</p>
        <p className="mt-6 font-medium text-tiefes-wasser">{copy.verdict}</p>
      </div>

      {copy.fits ? (
        <div className="rounded-2xl bg-vrelo-petrol p-8 md:p-10">
          <p className="text-balance font-serif text-xl text-papier md:text-2xl">{RESULT_UI.schedulerPrompt}</p>
          <div className="mt-6">
            <SchedulerEmbed
              calLink={calLink}
              prompt=""
              fallbackHint={RESULT_UI.schedulerFallbackHint}
              fallbackHref="/kontakt"
            />
          </div>
        </div>
      ) : (
        <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
          <p className="text-pretty text-tinte">{RESULT_UI.exitLead}</p>
          <p className="mt-4 text-pretty text-tinte">
            {RESULT_UI.exitNewsletterPrefix}
            <Link
              href="/newsletter"
              className="text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser"
            >
              {RESULT_UI.exitNewsletterLabel}
            </Link>
            {RESULT_UI.exitNewsletterSuffix}
            <Link
              href="/ratgeber"
              className="text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser"
            >
              {RESULT_UI.exitRatgeberLabel}
            </Link>
            {RESULT_UI.exitSuffix}
          </p>
        </div>
      )}
    </div>
  );
}
