// src/components/newsletter/NewsletterForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/newsletter/actions";
import { NewsletterSuccess } from "./NewsletterSuccess";
import { lightLinkClass } from "@/components/kontakt/onDarkLink";

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
  // variant is the honey (honig) card — on-light text, papier input wells, navy button.
  const inputClass = compact
    ? "mt-1 w-full rounded-md border border-faden bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
    : "mt-1 w-full rounded-md border border-tiefes-wasser/20 bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-honig";
  const labelClass = compact ? "text-sm text-gletscher" : "text-sm font-medium text-tiefes-wasser";
  const consentClass = compact ? "text-xs text-stein" : "text-sm text-tinte";
  const errorClass = compact ? "text-sm text-ember" : "text-sm text-signal-tief";
  const consentLinkClass = compact ? "underline underline-offset-2" : lightLinkClass;
  // Button: amber on the dark footer, navy on the honey card.
  const buttonClass = compact
    ? "bg-amber text-tiefes-wasser hover:bg-honig focus-visible:ring-amber focus-visible:ring-offset-papier"
    : "bg-tiefes-wasser text-papier hover:bg-vrelo-petrol focus-visible:ring-tiefes-wasser focus-visible:ring-offset-honig";

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
        className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonClass}`}>
        {pending ? "Wird gesendet …" : "Anmelden"}
      </button>
    </form>
  );

  if (compact) return form;

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-honig p-8 shadow-deepwater md:p-10">
      <h2 className="font-serif text-2xl font-medium text-tiefes-wasser">Trag dich ein.</h2>
      <p className="mt-2 text-sm text-tiefes-wasser/80">Eine E-Mail genügt. Jederzeit wieder abbestellbar.</p>
      <div className="mt-6">{form}</div>
    </div>
  );
}
