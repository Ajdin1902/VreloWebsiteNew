// src/app/kontakt/actions.ts
"use server";

import { Resend } from "resend";
import {
  evaluateSubmission,
  isContactConfigured,
  contactFrom,
  contactTo,
  resendKey,
  type ContactErrors,
  type ContactFields,
} from "@/lib/contact";

export type ContactValues = {
  name: string;
  email: string;
  message: string;
  company: string;
};

export type ContactState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; values?: ContactValues }
  | { status: "invalid"; errors: ContactErrors; values: ContactValues };

function parse(formData: FormData): ContactFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    name: get("name"),
    email: get("email"),
    message: get("message"),
    company: get("company"),
    consent: formData.get("consent") != null,
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
  };
}

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const fields = parse(formData);
  // Echo the user's input back so the form can repopulate after an error
  // (React 19 resets the form on action completion).
  const values: ContactValues = {
    name: fields.name,
    email: fields.email,
    message: fields.message,
    company: fields.company,
  };
  const decision = evaluateSubmission(fields, Date.now());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message, values };
  if (decision.action === "invalid") return { status: "invalid", errors: decision.errors, values };

  if (!isContactConfigured()) {
    return {
      status: "error",
      message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt.",
      values,
    };
  }

  try {
    const resend = new Resend(resendKey());
    // Resend returns { data, error } — it does NOT throw on API-level errors
    // (invalid key, unverified domain, rate limit). Treat a returned error as
    // a failure so the user never sees a success screen for an undelivered mail.
    const { error } = await resend.emails.send({
      from: contactFrom()!,
      to: contactTo()!,
      replyTo: decision.email.replyTo,
      subject: decision.email.subject,
      text: decision.email.text,
    });
    if (error) return { status: "error", message: GENERIC_ERROR, values };
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR, values };
  }
}
