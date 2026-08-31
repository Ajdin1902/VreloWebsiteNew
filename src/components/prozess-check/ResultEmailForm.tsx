// src/components/prozess-check/ResultEmailForm.tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitProzessCheckEmail, type ProzessCheckEmailState } from "@/app/prozess-check/actions";
import { AREA_IDS, type ProzessCheckAnswers } from "@/lib/prozessCheck";

const initial: ProzessCheckEmailState = { status: "idle" };

export function ResultEmailForm({ answers }: { answers: ProzessCheckAnswers }) {
  const [state, formAction, pending] = useActionState(submitProzessCheckEmail, initial);
  const [renderedAt] = useState(() => Date.now());

  const errorMsg =
    state.status === "invalid" ? state.error : state.status === "error" ? state.message : undefined;

  if (state.status === "ok") {
    return (
      <p role="status" className="text-gletscher">
        Danke. Deine Auswertung ist unterwegs.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-3" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <input type="hidden" name="branche" value={answers.branche} />
      <input type="hidden" name="team" value={answers.team} />
      {AREA_IDS.map((id) => (
        <input key={id} type="hidden" name={`h_${id}`} value={answers.stunden[id]} />
      ))}
      <input type="hidden" name="nervt" value={answers.nervt} />
      <input type="hidden" name="abende" value={answers.abende} />
      <input type="hidden" name="versucht" value={answers.versucht} />
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <label htmlFor="pc-email" className="block text-sm text-gletscher">
        Auswertung per Mail
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="pc-email"
          name="email"
          type="email"
          placeholder="deine@mail.de"
          required
          aria-invalid={errorMsg != null}
          aria-describedby={`pc-email-hinweis${errorMsg ? " pc-email-err" : ""}`}
          className="min-w-[14rem] flex-1 rounded-md border border-papier/60 bg-tiefes-wasser/40 px-3 py-2 text-papier placeholder:text-gletscher/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-amber"
        >
          {pending ? "Wird gesendet …" : "Schicken"}
        </button>
      </div>

      <p id="pc-email-hinweis" className="text-sm text-gletscher/90">
        Du bekommst die Auswertung einmalig. Deine Antworten und deine Adresse sehe ich dabei mit.{" "}
        Details in der{" "}
        <Link href="/datenschutz" className="underline underline-offset-4 hover:text-papier">
          Datenschutzerklärung
        </Link>
        .
      </p>

      <label className="flex items-start gap-2 text-sm text-gletscher">
        <input id="pc-kontakt" type="checkbox" name="kontakt" className="mt-1" />
        <span>Du darfst dich bei mir melden.</span>
      </label>

      {errorMsg ? (
        <p id="pc-email-err" role="alert" className="text-sm text-signal">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
