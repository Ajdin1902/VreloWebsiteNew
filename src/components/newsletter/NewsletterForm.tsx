// src/components/newsletter/NewsletterForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/newsletter/actions";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initial);
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "ok") {
    return (
      <p className={compact ? "text-sm text-gletscher" : "font-serif text-xl text-ember"}>
        Fast geschafft — schau in dein Postfach und bestätige deine Anmeldung.
      </p>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "invalid" || state.status === "error" ? state.values : undefined;
  const labelClass = compact ? "text-sm text-gletscher" : "text-sm font-medium text-tiefes-wasser";
  const consentClass = compact ? "text-xs text-stein" : "text-sm text-tinte";
  const inputClass =
    "mt-1 w-full rounded-md border border-faden bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber";

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="nl-email" className={labelClass}>E-Mail</label>
        <input id="nl-email" name="email" type="email" className={inputClass} defaultValue={values?.email}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "nl-email-err" : undefined} />
        {errors.email && <p id="nl-email-err" className="mt-1 text-sm text-ember">{errors.email}</p>}
      </div>

      <label className={`flex items-start gap-2 ${consentClass}`}>
        <input id="nl-consent" type="checkbox" name="consent" className="mt-1"
          aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "nl-consent-err" : undefined} />
        <span>
          Ich möchte den Newsletter erhalten und habe die{" "}
          <Link href="/datenschutz" className="underline underline-offset-2">Datenschutzerklärung</Link> gelesen.
        </span>
      </label>
      {errors.consent && <p id="nl-consent-err" className="text-sm text-ember">{errors.consent}</p>}

      {state.status === "error" && <p className="text-sm text-ember">{state.message}</p>}

      <button type="submit" disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-amber">
        {pending ? "Wird gesendet …" : "Anmelden"}
      </button>
    </form>
  );
}
