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

export type ContactState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; errors: ContactErrors };

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

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const decision = evaluateSubmission(parse(formData), Date.now());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", errors: decision.errors };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
    await resend.emails.send({
      from: contactFrom()!,
      to: contactTo()!,
      replyTo: decision.email.replyTo,
      subject: decision.email.subject,
      text: decision.email.text,
    });
    return { status: "ok" };
  } catch {
    return { status: "error", message: "Da ist etwas schiefgelaufen. Schreib mir gern direkt." };
  }
}
