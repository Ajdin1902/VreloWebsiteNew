"use server";

import { Resend } from "resend";
import { isContactConfigured, contactFrom, contactTo, resendKey, calBookingUrl } from "@/lib/contact";
import { evaluateSubmission, type ProzessCheckFields } from "@/lib/prozessCheckEmail";
import { AREA_IDS, type ProzessCheckAnswers } from "@/lib/prozessCheck";

export type ProzessCheckEmailState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; error: string };

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

function pick<T extends string>(raw: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

// Clamp a slider value to 0..10 integer; anything odd falls back to 0.
function clampHours(raw: string): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n > 10 ? 10 : n;
}

function parse(formData: FormData): ProzessCheckFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  const stunden = Object.fromEntries(
    AREA_IDS.map((id) => [id, clampHours(get(`h_${id}`))]),
  ) as ProzessCheckAnswers["stunden"];
  const answers: ProzessCheckAnswers = {
    branche: pick(get("branche"), ["handwerk", "immobilien", "reinigung", "praxis", "handel", "anderes"], "anderes"),
    team: pick(get("team"), ["allein", "2bis5", "6bis20", "ueber20"], "allein"),
    stunden,
    nervt: pick(get("nervt"), AREA_IDS, "anfragen"),
    abende: pick(get("abende"), ["staendig", "abundzu", "nein"], "nein"),
    versucht: pick(get("versucht"), ["nichts", "toolBrach", "beauftragt"], "nichts"),
  };
  return {
    email: get("email"),
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
    answers,
    kontaktErlaubt: formData.get("kontakt") != null,
  };
}

export async function submitProzessCheckEmail(
  _prev: ProzessCheckEmailState,
  formData: FormData,
): Promise<ProzessCheckEmailState> {
  const decision = evaluateSubmission(parse(formData), Date.now(), calBookingUrl());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", error: decision.error };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
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
