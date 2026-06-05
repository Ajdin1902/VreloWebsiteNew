// src/app/newsletter/actions.ts
"use server";

import { Resend } from "resend";
import { siteUrl } from "@/lib/site";
import {
  evaluateSignup,
  isNewsletterConfigured,
  signToken,
  type NewsletterErrors,
  type NewsletterFields,
} from "@/lib/newsletter";
import { contactFrom, resendKey } from "@/lib/contact";
import { buildConfirmEmail } from "@/lib/email/newsletter-confirm";

export type NewsletterValues = { email: string };

export type NewsletterState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; values?: NewsletterValues }
  | { status: "invalid"; errors: NewsletterErrors; values: NewsletterValues };

function parse(formData: FormData): NewsletterFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    email: get("email"),
    consent: formData.get("consent") != null,
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
  };
}

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Versuch es bitte später noch einmal.";

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const fields = parse(formData);
  const values: NewsletterValues = { email: fields.email };
  const decision = evaluateSignup(fields, Date.now());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message, values };
  if (decision.action === "invalid") return { status: "invalid", errors: decision.errors, values };

  if (!isNewsletterConfigured()) {
    return { status: "error", message: "Der Newsletter ist gerade nicht verfügbar.", values };
  }

  const token = signToken(decision.email, Date.now());
  const confirmUrl = `${siteUrl}/newsletter/bestaetigt?token=${encodeURIComponent(token)}`;
  const mail = buildConfirmEmail({ confirmUrl });

  try {
    const resend = new Resend(resendKey());
    const { error } = await resend.emails.send({
      from: contactFrom()!,
      to: decision.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    if (error) return { status: "error", message: GENERIC_ERROR, values };
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR, values };
  }
}
