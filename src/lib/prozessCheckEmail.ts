// src/lib/prozessCheckEmail.ts
// E-mail check shared by /prozess-check (v2 sends through src/lib/vorabFahrplan/).
import { EMAIL_RE } from "./contact";

export function validateEmail(email: string): string | undefined {
  if (!EMAIL_RE.test(email.trim())) return "Bitte gib eine gültige E-Mail-Adresse an.";
  return undefined;
}
