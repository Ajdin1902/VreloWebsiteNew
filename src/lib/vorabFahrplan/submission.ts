// Server-side parsing and the lead-mail retry for the /prozess-check form (spec §6, §10).
// Lives outside actions.ts: a "use server" file may only export async actions, and
// these must not become public endpoints. Plan 2 reuses parseSubmission.
import type { Resend } from "resend";
import { validateEmail } from "@/lib/prozessCheckEmail";
import { normalizeSource } from "@/lib/source";
import { AREA_IDS, STEPS, type ParsedAnswers, type Step, type StepId } from "@/lib/prozessCheck";
import { FORM_ERRORS } from "./blocks";
import { capText, normalizePhone, normalizeWebsite, parseProgramme, stripContacts } from "./guards";
import type { LeadContact } from "./mails";

export type ParsedSubmission = {
  answers: ParsedAnswers;
  contact: LeadContact;
  source?: string;
  submittedAt: Date;
  honeypot: string;
  renderedAt: number;
};

export type FieldErrors = Partial<Record<"name" | "firma" | "email" | "telefon" | "anruf", string>>;

function pick<T extends string>(raw: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

// Clamp a slider value to 0..10 integer; anything odd falls back to 0.
function clampHours(raw: string): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n > 10 ? 10 : n;
}

// The allowed values come from the wizard definition, so the form and the server never drift.
const step = <I extends StepId>(id: I) => STEPS.find((s) => s.id === id) as Extract<Step, { id: I }>;
const vals = <V extends string>(opts: readonly { value: V }[]): V[] => opts.map((o) => o.value);
const aufgabe = step("aufgabe");

// Name and Firma end up in the PDF headline: longer ones push it to a third page.
const MAX_NAME = 60;

export function parseSubmission(fd: FormData): ParsedSubmission {
  const get = (k: string) => String(fd.get(k) ?? "");
  const all = (k: string) => fd.getAll(k).map(String);

  const bereiche = AREA_IDS.filter((id) => all("bereiche").includes(id));
  const stunden = Object.fromEntries(bereiche.map((id) => [id, clampHours(get(`h_${id}`))]));
  const programmeChips = all("programmeChips");
  const programmeText = capText(get("programmeText"), 500);
  const website = normalizeWebsite(get("webseite"));

  const answers: ParsedAnswers = {
    bereiche,
    stunden,
    nervt: pick(get("nervt"), bereiche, bereiche[0] ?? "anfragen"),
    kanaele: vals(aufgabe.kanaele).filter((k) => all("kanaele").includes(k)),
    menge: pick(get("menge"), vals(aufgabe.menge), "bis5"),
    wer: pick(get("wer"), vals(aufgabe.wer), "ich"),
    programmeChips,
    programmeText,
    programme: parseProgramme(programmeChips, programmeText),
    arbeitstag: capText(stripContacts(get("arbeitstag")), 500),
    abende: pick(get("abende"), vals(step("abende").options), "nein"),
    versucht: pick(get("versucht"), vals(step("versucht").options), "nichts"),
    branche: pick(get("branche"), vals(step("branche").options), "anderes"),
    team: pick(get("team"), vals(step("team").options), "allein"),
    arbeitsort: pick(get("arbeitsort"), vals(step("arbeitsort").options), "buero"),
    ...(website ? { website } : {}),
  };

  return {
    answers,
    contact: {
      // Name reaches the visitor greeting and the PDF: no links or numbers (no address confirmation, no spam relay).
      name: capText(stripContacts(get("name")), MAX_NAME).trim(),
      firma: capText(stripContacts(get("firma")), MAX_NAME).trim(),
      email: get("email").trim(),
      telefon: normalizePhone(get("telefon")) ?? "",
      anrufOk: fd.get("anruf") != null,
    },
    source: normalizeSource(get("src")),
    submittedAt: new Date(),
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
  };
}

export function submissionErrors(s: ParsedSubmission): FieldErrors {
  const c = s.contact;
  const errors: FieldErrors = {};
  if (!c.name) errors.name = FORM_ERRORS.name;
  if (!c.firma) errors.firma = FORM_ERRORS.firma;
  // The address becomes the lead mail's replyTo. EMAIL_RE rejects any whitespace, so
  // a value that passes (already trimmed above) carries no CR/LF into a header.
  const emailErr = validateEmail(c.email);
  if (emailErr) errors.email = emailErr;
  if (!c.telefon) errors.telefon = FORM_ERRORS.telefon;
  if (!c.anrufOk) errors.anruf = FORM_ERRORS.anruf;
  return errors;
}

type SendPayload = Parameters<Resend["emails"]["send"]>[0];

/** Tries twice. After the second failure it logs the contact once (spec §10: the lead is never lost). */
export async function sendLeadMailWithRetry(mail: {
  resend: Resend;
  payload: SendPayload;
  contact: LeadContact;
  submittedAt: Date;
}): Promise<boolean> {
  for (let i = 0; i < 2; i++) {
    try {
      if (!(await mail.resend.emails.send(mail.payload)).error) return true;
    } catch {
      // counted as a failed try
    }
  }
  const { name, firma, email, telefon } = mail.contact;
  // The one allowed log with contact data.
  console.error("prozess-check lead mail failed", JSON.stringify({ name, firma, email, telefon, submittedAt: mail.submittedAt }));
  return false;
}
