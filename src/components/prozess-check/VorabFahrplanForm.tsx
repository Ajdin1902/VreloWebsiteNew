// src/components/prozess-check/VorabFahrplanForm.tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitVorabFahrplan, type VorabFahrplanState } from "@/app/prozess-check/actions";
import { RESULT_UI, type ProzessCheckAnswers } from "@/lib/prozessCheck";
import { FORM_FIELDS, FORM_UI, consentFor } from "@/lib/vorabFahrplan/blocks";

const initial: VorabFahrplanState = { status: "idle" };

const FIELDS = [
  { name: "name", type: "text", autoComplete: "name" },
  { name: "firma", type: "text", autoComplete: "organization" },
  { name: "email", type: "email", autoComplete: "email" },
  { name: "telefon", type: "tel", autoComplete: "tel" },
] as const;
type FieldName = (typeof FIELDS)[number]["name"];

const INPUT =
  "w-full rounded-md border border-papier/60 bg-tiefes-wasser/40 px-3 py-2 text-papier placeholder:text-gletscher/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol";

export function VorabFahrplanForm({
  answers,
  source,
  research,
}: {
  answers: ProzessCheckAnswers;
  source?: string;
  /** Research configured on the server: show the KI sentence (it is part of the consent proof). */
  research: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitVorabFahrplan, initial);
  const [renderedAt] = useState(() => Date.now());
  // Controlled, so React 19's form reset after the action keeps what the visitor typed.
  const [values, setValues] = useState<Record<FieldName, string>>({ name: "", firma: "", email: "", telefon: "" });
  const [anruf, setAnruf] = useState(false);

  if (state.status === "ok") {
    return (
      <p role="status" className="mt-4 text-gletscher">
        {state.recherche ? RESULT_UI.successRecherche : RESULT_UI.success}
      </p>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const hidden: [string, string][] = [
    ["renderedAt", String(renderedAt)],
    // Which consent text this form showed: the action records it and runs research only for the KI one.
    ["consentVersion", consentFor(research).version],
    ...answers.bereiche.map((id): [string, string] => ["bereiche", id]),
    ...answers.bereiche.map((id): [string, string] => [`h_${id}`, String(answers.stunden[id] ?? 0)]),
    ["nervt", answers.nervt],
    ...answers.kanaele.map((k): [string, string] => ["kanaele", k]),
    ["menge", answers.menge],
    ["wer", answers.wer],
    ...answers.programmeChips.map((c): [string, string] => ["programmeChips", c]),
    ["programmeText", answers.programmeText],
    ["arbeitstag", answers.arbeitstag],
    ["abende", answers.abende],
    ["versucht", answers.versucht],
    ["branche", answers.branche],
    ["team", answers.team],
    ["arbeitsort", answers.arbeitsort],
    ...(answers.website ? [["webseite", answers.website] as [string, string]] : []),
    ...(source ? [["src", source] as [string, string]] : []),
  ];

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      {hidden.map(([name, value], i) => (
        <input key={`${name}-${i}`} type="hidden" name={name} value={value} />
      ))}
      {/* Honeypot. Not named `website`: password managers may autofill that and drop a real lead. */}
      <input type="text" name="hp_url" tabIndex={-1} aria-hidden="true" autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const err = errors[f.name];
          return (
            <div key={f.name}>
              <label htmlFor={`vf-${f.name}`} className="block text-sm text-gletscher">
                {FORM_FIELDS[f.name]}
              </label>
              <input
                id={`vf-${f.name}`}
                name={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                required
                value={values[f.name]}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? `vf-${f.name}-err` : undefined}
                className={`mt-1 ${INPUT}`}
              />
              {err ? (
                <p id={`vf-${f.name}-err`} className="mt-1 text-sm text-signal">
                  {err}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gletscher/90">{FORM_UI.consentAnruf}</p>
      {research ? <p className="text-sm text-gletscher/90">{FORM_UI.consentKi}</p> : null}
      <div>
        <label className="flex items-start gap-2 text-sm text-gletscher">
          <input
            type="checkbox"
            name="anruf"
            required
            checked={anruf}
            onChange={(e) => setAnruf(e.target.checked)}
            aria-invalid={errors.anruf ? true : undefined}
            aria-describedby={errors.anruf ? "vf-anruf-err" : undefined}
            className="mt-1"
          />
          <span>{FORM_UI.checkbox}</span>
        </label>
        {errors.anruf ? (
          <p id="vf-anruf-err" className="mt-1 text-sm text-signal">
            {errors.anruf}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-amber"
      >
        {pending ? FORM_FIELDS.pending : FORM_FIELDS.submit}
      </button>

      {state.status === "error" ? (
        <p role="alert" className="text-sm text-signal">
          {state.message}
        </p>
      ) : null}

      <p className="text-sm text-gletscher/90">
        {FORM_FIELDS.datenschutzPrefix}
        <Link href="/datenschutz" className="underline underline-offset-4 hover:text-papier">
          {FORM_FIELDS.datenschutzLabel}
        </Link>
        {FORM_FIELDS.datenschutzSuffix}
      </p>
    </form>
  );
}
