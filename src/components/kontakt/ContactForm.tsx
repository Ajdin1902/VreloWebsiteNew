// src/components/kontakt/ContactForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { sendContactMessage, type ContactState } from "@/app/kontakt/actions";
import { ContactSuccess } from "./ContactSuccess";
import { CardHeading } from "./CardHeading";
import { lightLinkClass } from "./onDarkLink";

const initial: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initial);
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "ok") {
    return <ContactSuccess />;
  }

  const errors = state.status === "invalid" ? state.errors : {};
  // Repopulate fields after an error (React 19 resets the form on submit).
  const values =
    state.status === "invalid" || state.status === "error" ? state.values : undefined;
  const fieldClass =
    "mt-1 w-full rounded-md border border-tiefes-wasser/20 bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-amber";

  return (
    <>
      <CardHeading />
      <form action={formAction} className="mt-6 space-y-5" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      {/* honeypot — hidden from humans and assistive tech */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="cf-name" className="text-sm font-medium text-tiefes-wasser">Name</label>
        <input id="cf-name" name="name" type="text" className={fieldClass} defaultValue={values?.name}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "cf-name-err" : undefined} />
        {errors.name && <p id="cf-name-err" className="mt-1 text-sm text-signal-tief">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="cf-email" className="text-sm font-medium text-tiefes-wasser">E-Mail</label>
        <input id="cf-email" name="email" type="email" className={fieldClass} defaultValue={values?.email}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "cf-email-err" : undefined} />
        {errors.email && <p id="cf-email-err" className="mt-1 text-sm text-signal-tief">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="cf-message" className="text-sm font-medium text-tiefes-wasser">Was raubt dir gerade deine Zeit?</label>
        <textarea id="cf-message" name="message" rows={5} className={fieldClass} defaultValue={values?.message}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "cf-message-err" : undefined} />
        {errors.message && <p id="cf-message-err" className="mt-1 text-sm text-signal-tief">{errors.message}</p>}
      </div>

      <div>
        <label htmlFor="cf-company" className="text-sm font-medium text-tiefes-wasser">Betrieb <span className="text-tiefes-wasser/60">(optional)</span></label>
        <input id="cf-company" name="company" type="text" className={fieldClass} defaultValue={values?.company} />
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-tinte">
          <input type="checkbox" name="consent" className="mt-1"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "cf-consent-err" : undefined} />
          <span>
            Ich habe die <Link href="/datenschutz" className={lightLinkClass}>Datenschutzerklärung</Link> gelesen und bin einverstanden.
          </span>
        </label>
        {errors.consent && <p id="cf-consent-err" className="mt-1 text-sm text-signal-tief">{errors.consent}</p>}
      </div>

      {state.status === "error" && <p className="text-sm text-signal-tief">{state.message}</p>}

      <button type="submit" disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-tiefes-wasser px-5 py-2.5 text-sm font-semibold text-papier transition-colors hover:bg-vrelo-petrol disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-amber focus-visible:ring-tiefes-wasser">
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </button>
      </form>
    </>
  );
}
