// src/components/lead-check/ResultEmailForm.tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitLeadCheckEmail, type LeadCheckEmailState } from "@/app/lead-check/actions";
import type { LeadCheckAnswers } from "@/lib/leadCheck";

const initial: LeadCheckEmailState = { status: "idle" };

// Posts the answers as hidden fields so the Server Action recomputes the result
// server-side (never trusts client math). The whole block is optional capture.
export function ResultEmailForm({ answers }: { answers: LeadCheckAnswers }) {
  const [state, formAction, pending] = useActionState(submitLeadCheckEmail, initial);
  const [renderedAt] = useState(() => Date.now());

  const errorMsg =
    state.status === "invalid" ? state.error : state.status === "error" ? state.message : undefined;

  if (state.status === "ok") {
    return (
      <p role="status" className="text-gletscher">
        Danke {"–"} die Zusammenfassung ist unterwegs.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-3" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <input type="hidden" name="anfragenProWoche" value={answers.anfragenProWoche} />
      <input type="hidden" name="reaktionszeit" value={answers.reaktionszeit} />
      <input type="hidden" name="abendsWochenende" value={answers.abendsWochenende} />
      <input type="hidden" name="imTermin" value={answers.imTermin} />
      <input type="hidden" name="nachfassen" value={answers.nachfassen} />
      {answers.provision != null ? <input type="hidden" name="provision" value={answers.provision} /> : null}
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <label htmlFor="lc-email" className="block text-sm text-gletscher">
        Zusammenfassung per Mail
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="lc-email"
          name="email"
          type="email"
          placeholder="deine@mail.de"
          required
          aria-invalid={errorMsg != null}
          aria-describedby={`lc-email-hinweis${errorMsg ? " lc-email-err" : ""}`}
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

      {/* Says what actually happens: two mails go out, and the second one puts
          these answers on Ajdin's desk. The checkbox is what makes the old
          "ich melde mich, wenn du magst" true — unchecked, nobody writes. */}
      <p id="lc-email-hinweis" className="text-sm text-gletscher/90">
        Du bekommst die Zusammenfassung einmalig. Deine Antworten und deine Adresse sehe ich dabei mit {"–"}{" "}
        Details in der{" "}
        <Link href="/datenschutz" className="underline underline-offset-4 hover:text-papier">
          Datenschutzerklärung
        </Link>
        .
      </p>

      <label className="flex items-start gap-2 text-sm text-gletscher">
        <input id="lc-kontakt" type="checkbox" name="kontakt" className="mt-1" />
        <span>Du darfst dich bei mir melden.</span>
      </label>

      {errorMsg ? (
        <p id="lc-email-err" role="alert" className="text-sm text-signal">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
