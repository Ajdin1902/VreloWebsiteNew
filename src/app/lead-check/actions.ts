// src/app/lead-check/actions.ts
"use server";

import { Resend } from "resend";
import { isContactConfigured, contactFrom, contactTo, resendKey, calBookingUrl } from "@/lib/contact";
import { evaluateLeadCheckSubmission, type LeadCheckFields } from "@/lib/leadCheckEmail";
import type { LeadCheckAnswers } from "@/lib/leadCheck";

export type LeadCheckEmailState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; error: string };

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

function pick<T extends string>(raw: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

function parse(formData: FormData): LeadCheckFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  const provisionRaw = get("provision");
  const answers: LeadCheckAnswers = {
    anfragenProWoche: Number(get("anfragenProWoche")) || 0,
    reaktionszeit: pick(get("reaktionszeit"), ["unter5min", "unter1std", "selberTag", "1bis2tage", "wennZeit"], "selberTag"),
    abendsWochenende: pick(get("abendsWochenende"), ["immer", "manchmal", "nein"], "manchmal"),
    imTermin: pick(get("imTermin"), ["automatisch", "wartet", "gehtUnter"], "wartet"),
    nachfassen: pick(get("nachfassen"), ["mehrmals", "einmal", "selten", "nie"], "einmal"),
    provision: provisionRaw ? Number(provisionRaw) : undefined,
  };
  return {
    email: get("email"),
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
    answers,
    // Unchecked box submits nothing at all, so absence must mean "no".
    kontaktErlaubt: formData.get("kontakt") != null,
  };
}

export async function submitLeadCheckEmail(
  _prev: LeadCheckEmailState,
  formData: FormData,
): Promise<LeadCheckEmailState> {
  const decision = evaluateLeadCheckSubmission(parse(formData), Date.now(), calBookingUrl());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", error: decision.error };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
    // The lead's summary is the promise on the page — it goes out first and
    // decides the UI state. The internal notification must never break it.
    const lead = await resend.emails.send({
      from: contactFrom()!,
      to: decision.leadEmail.to,
      subject: decision.leadEmail.subject,
      html: decision.leadEmail.html,
      text: decision.leadEmail.text,
    });
    if (lead.error) return { status: "error", message: GENERIC_ERROR };
    try {
      await resend.emails.send({
        from: contactFrom()!,
        to: contactTo()!,
        replyTo: decision.internalEmail.replyTo,
        subject: decision.internalEmail.subject,
        html: decision.internalEmail.html,
        text: decision.internalEmail.text,
      });
    } catch {
      // Internal-only failure: the lead got their summary; don't fail the UI.
    }
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}
