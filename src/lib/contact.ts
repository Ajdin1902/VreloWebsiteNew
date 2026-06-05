// src/lib/contact.ts

export function resendKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}
export function contactFrom(): string | undefined {
  return process.env.CONTACT_FROM;
}
export function contactTo(): string | undefined {
  return process.env.CONTACT_TO;
}
export function calLink(): string | undefined {
  return process.env.NEXT_PUBLIC_CAL_LINK;
}

export function isContactConfigured(): boolean {
  return Boolean(resendKey() && contactFrom() && contactTo());
}

export const MIN_FILL_MS = 3000;

export type ContactErrors = Partial<
  Record<"name" | "email" | "message" | "consent", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(f: {
  name: string;
  email: string;
  message: string;
  consent: boolean;
}): ContactErrors {
  const errors: ContactErrors = {};
  if (!f.name.trim()) errors.name = "Bitte gib deinen Namen an.";
  if (!EMAIL_RE.test(f.email.trim())) errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  if (!f.message.trim()) errors.message = "Bitte schreib kurz, worum es geht.";
  if (!f.consent) errors.consent = "Bitte stimme der Datenschutzerklärung zu.";
  return errors;
}

export function isHoneypotTripped(honeypot: string): boolean {
  return honeypot.trim().length > 0;
}

export function isTooFast(renderedAt: number, now: number): boolean {
  return now - renderedAt < MIN_FILL_MS;
}
