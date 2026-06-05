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
