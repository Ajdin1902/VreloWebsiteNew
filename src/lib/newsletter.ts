// src/lib/newsletter.ts
import { resendKey, contactFrom, isHoneypotTripped, isTooFast } from "./contact";
import { createHmac, timingSafeEqual } from "crypto";

export function newsletterSecret(): string | undefined {
  return process.env.NEWSLETTER_SECRET;
}
export function newsletterSegmentId(): string | undefined {
  return process.env.NEWSLETTER_SEGMENT_ID;
}

export function isNewsletterConfigured(): boolean {
  return Boolean(resendKey() && contactFrom() && newsletterSecret() && newsletterSegmentId());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidNewsletterEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export type NewsletterErrors = Partial<Record<"email" | "consent", string>>;

export function validateNewsletterSignup(f: { email: string; consent: boolean }): NewsletterErrors {
  const errors: NewsletterErrors = {};
  if (!isValidNewsletterEmail(f.email)) errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  if (!f.consent) errors.consent = "Bitte stimme der Datenschutzerklärung zu.";
  return errors;
}

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" };

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function signToken(email: string, now: number): string {
  const payloadB64 = Buffer.from(JSON.stringify({ email, iat: now })).toString("base64url");
  return `${payloadB64}.${sign(payloadB64, newsletterSecret()!)}`;
}

export function verifyToken(token: string, now: number): VerifyResult {
  const secret = newsletterSecret();
  if (!secret) return { ok: false, reason: "invalid" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid" };
  const [payloadB64, sig] = parts;
  const expected = sign(payloadB64, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, reason: "invalid" };
  }
  let payload: { email?: unknown; iat?: unknown };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (typeof payload.email !== "string" || typeof payload.iat !== "number") {
    return { ok: false, reason: "invalid" };
  }
  if (now - payload.iat > TOKEN_TTL_MS) return { ok: false, reason: "expired" };
  return { ok: true, email: payload.email };
}

export type NewsletterFields = {
  email: string;
  consent: boolean;
  honeypot: string;
  renderedAt: number;
};

export type SignupDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; errors: NewsletterErrors }
  | { action: "send"; email: string };

export function evaluateSignup(f: NewsletterFields, now: number): SignupDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const errors = validateNewsletterSignup(f);
  if (Object.keys(errors).length > 0) return { action: "invalid", errors };
  return { action: "send", email: f.email.trim() };
}
