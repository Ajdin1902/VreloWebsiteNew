// src/app/lead-check/actions.ts
"use server";

import { Resend } from "resend";
import { isContactConfigured, contactFrom, contactTo, resendKey } from "@/lib/contact";
import { evaluateLeadCheckSubmission, type LeadCheckFields } from "@/lib/leadCheckEmail";
import type {
  LeadCheckAnswers,
  Reaktionszeit,
  AbendsWochenende,
  ImTermin,
  Nachfassen,
} from "@/lib/leadCheck";

export type LeadCheckEmailState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; error: string };

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

function parse(formData: FormData): LeadCheckFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  const provisionRaw = get("provision");
  const answers: LeadCheckAnswers = {
    anfragenProWoche: Number(get("anfragenProWoche")) || 0,
    reaktionszeit: get("reaktionszeit") as Reaktionszeit,
    abendsWochenende: get("abendsWochenende") as AbendsWochenende,
    imTermin: get("imTermin") as ImTermin,
    nachfassen: get("nachfassen") as Nachfassen,
    provision: provisionRaw ? Number(provisionRaw) : undefined,
  };
  return {
    email: get("email"),
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
    answers,
  };
}

export async function submitLeadCheckEmail(
  _prev: LeadCheckEmailState,
  formData: FormData,
): Promise<LeadCheckEmailState> {
  const decision = evaluateLeadCheckSubmission(parse(formData), Date.now());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", error: decision.error };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
    const { error } = await resend.emails.send({
      from: contactFrom()!,
      to: contactTo()!,
      replyTo: decision.email.replyTo,
      subject: decision.email.subject,
      text: decision.email.text,
    });
    if (error) return { status: "error", message: GENERIC_ERROR };
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}
