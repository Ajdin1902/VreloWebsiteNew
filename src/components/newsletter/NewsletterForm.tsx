// src/components/newsletter/NewsletterForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/newsletter/actions";
import { NewsletterSuccess } from "./NewsletterSuccess";
import { darkLinkClass } from "@/components/kontakt/onDarkLink";

const initial: NewsletterState = { status: "idle" };

// `compact` = the small footer embed (kept on its existing dark-footer styling).
// The full variant is the standalone Kontakt-style dark card on /newsletter.
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initial);
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "ok") {
    // Footer keeps a quiet inline confirmation; the full page shows the payoff.
    return compact ? (
      <p className="text-sm text-gletscher">
        Fast geschafft – schau in dein Postfach und bestätige deine Anmeldung.
      </p>
    ) : (
      <NewsletterSuccess />
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "invalid" || state.status === "error" ? state.values : undefined;

  // Compact (footer) keeps its prior on-dark-footer styling untouched; the full
  // variant matches the Kontakt dark card (gletscher fields, signal errors).
  const inputClass = compact
    ? "mt-1 w-full rounded-md border border-faden bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
    : "mt-1 w-full rounded-md border border-gletscher/25 bg-gletscher/10 px-3 py-2 text-papier focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser";
  const labelClass = compact ? "text-sm text-gletscher" : "text-sm font-medium text-gletscher";
  const consentClass = compact ? "text-xs text-stein" : "text-sm text-gletscher";
  const errorClass = compact ? "text-sm text-ember" : "text-sm text-signal";
  const buttonOffset = compact ? "focus-visible:ring-offset-papier" : "focus-visible:ring-offset-tiefes-wasser";
  const consentLinkClass = compact ? "underline underline-offset-2" : darkLinkClass;

  const form = (
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
        {errors.email && <p id="nl-email-err" className={`mt-1 ${errorClass}`}>{errors.email}</p>}
      </div>

      <label className={`flex items-start gap-2 ${consentClass}`}>
        <input id="nl-consent" type="checkbox" name="consent" className="mt-1"
          aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "nl-consent-err" : undefined} />
        <span>
          Ich möchte den Newsletter erhalten und habe die{" "}
          <Link href="/datenschutz" className={consentLinkClass}>Datenschutzerklärung</Link> gelesen.
        </span>
      </label>
      {errors.consent && <p id="nl-consent-err" className={errorClass}>{errors.consent}</p>}

      {state.status === "error" && <p className={errorClass}>{state.message}</p>}

      <button type="submit" disabled={pending}
        className={`inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber ${buttonOffset}`}>
        {pending ? "Wird gesendet …" : "Anmelden"}
      </button>
    </form>
  );

  if (compact) return form;

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-tiefes-wasser p-8 shadow-deepwater md:p-10">
      <h2 className="font-serif text-2xl font-medium text-papier">Trag dich ein.</h2>
      <p className="mt-2 text-sm text-gletscher">Eine E-Mail genügt. Jederzeit wieder abbestellbar.</p>
      <div className="mt-6">{form}</div>
    </div>
  );
}
