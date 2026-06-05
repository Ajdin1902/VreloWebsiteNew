// src/app/newsletter/confirm.ts
import { Resend } from "resend";
import {
  isNewsletterConfigured,
  newsletterAudienceId,
  verifyToken,
} from "@/lib/newsletter";
import { resendKey } from "@/lib/contact";

export type ConfirmResultData =
  | { status: "ok" }
  | { status: "invalid" }
  | { status: "error" };

export async function confirmSubscription(token: string): Promise<ConfirmResultData> {
  const verified = verifyToken(token, Date.now());
  if (!verified.ok) return { status: "invalid" };
  if (!isNewsletterConfigured()) return { status: "error" };

  try {
    const resend = new Resend(resendKey());
    const { error } = await resend.contacts.create({
      audienceId: newsletterAudienceId()!,
      email: verified.email,
      unsubscribed: false,
    });
    if (error) return { status: "error" };
    return { status: "ok" };
  } catch {
    return { status: "error" };
  }
}
