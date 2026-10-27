"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitBauplanRequest, type BauplanEmailState } from "@/app/bauplan/actions";
import { bauplanPage } from "@/lib/bauplanPage";

const initial: BauplanEmailState = { status: "idle" };

export function BauplanPdfForm({ source, code }: { source?: string; code: string }) {
  const [state, formAction, pending] = useActionState(submitBauplanRequest, initial);
  const [renderedAt] = useState(() => Date.now());
  const { label, button, pending: pendingLabel, hinweis, success } = bauplanPage.pdf;

  const errorMsg =
    state.status === "invalid" ? state.error : state.status === "error" ? state.message : undefined;

  if (state.status === "ok") {
    return (
      <p role="status" className="text-tiefes-wasser">
        {success}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <input type="hidden" name="src" value={source ?? ""} />
      <input type="hidden" name="code" value={code} />
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <label htmlFor="bp-email" className="block text-sm">
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="bp-email"
          name="email"
          type="email"
          required
          defaultValue={state.status === "invalid" || state.status === "error" ? state.email : undefined}
          autoComplete="email"
          aria-invalid={errorMsg != null}
          aria-describedby={`bp-email-hinweis${errorMsg ? " bp-email-err" : ""}`}
          className="min-w-[14rem] flex-1 rounded-md border border-faden bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2"
        >
          {pending ? pendingLabel : button}
        </button>
      </div>
      <p id="bp-email-hinweis" className="text-sm">
        {hinweis}{" "}
        <Link href="/datenschutz" className="underline underline-offset-4">
          Datenschutz
        </Link>
      </p>
      {errorMsg ? (
        <p id="bp-email-err" role="alert" className="text-sm text-signal">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
