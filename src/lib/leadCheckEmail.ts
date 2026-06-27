// src/lib/leadCheckEmail.ts
import { EMAIL_RE, isHoneypotTripped, isTooFast } from "./contact";
import { computeResult, type LeadCheckAnswers, type LeadCheckResult } from "./leadCheck";

export function validateLeadCheckEmail(email: string): string | undefined {
  if (!EMAIL_RE.test(email.trim())) return "Bitte gib eine gültige E-Mail-Adresse an.";
  return undefined;
}

export type LeadCheckEmail = { subject: string; text: string; replyTo: string };

export function buildLeadCheckEmail(p: {
  email: string;
  answers: LeadCheckAnswers;
  result: LeadCheckResult;
}): LeadCheckEmail {
  const { email, answers, result } = p;
  const lines = [
    `E-Mail: ${email.trim()}`,
    "",
    "Antworten:",
    `Anfragen/Woche: ${answers.anfragenProWoche}`,
    `Reaktionszeit: ${answers.reaktionszeit}`,
    `Abends/Wochenende: ${answers.abendsWochenende}`,
    `Im Termin: ${answers.imTermin}`,
    `Nachfassen: ${answers.nachfassen}`,
    `Provision: ${result.provisionUsed}${result.provisionWasDefault ? " (Standard)" : ""}`,
    "",
    "Ergebnis:",
    `Score: ${result.score}`,
    `Aktueller Verlust: ${result.currentLossPct}%`,
    `Verlorene Anfragen/Jahr: ${result.verloreneAnfragenProJahr}`,
    `Zusaetzliche Abschluesse/Jahr: ${result.zusaetzlicheAbschluesse}`,
    `Euro-Potenzial/Jahr: ${result.eurUpside}`,
  ];
  return { subject: "Neuer Lead-Reaktions-Check", text: lines.join("\n"), replyTo: email.trim() };
}

export type LeadCheckFields = {
  email: string;
  honeypot: string;
  renderedAt: number;
  answers: LeadCheckAnswers;
};

export type LeadCheckDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; error: string }
  | { action: "send"; email: LeadCheckEmail };

export function evaluateLeadCheckSubmission(f: LeadCheckFields, now: number): LeadCheckDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const emailErr = validateLeadCheckEmail(f.email);
  if (emailErr) return { action: "invalid", error: emailErr };
  const result = computeResult(f.answers);
  return { action: "send", email: buildLeadCheckEmail({ email: f.email, answers: f.answers, result }) };
}
