// Server-side parsing and the lead-mail retry for the /prozess-check form (spec §6, §10).
// Lives outside actions.ts: a "use server" file may only export async actions, and
// these must not become public endpoints. Plan 2 reuses parseSubmission.
import type { Resend } from "resend";
import { validateEmail } from "@/lib/prozessCheckEmail";
import { normalizeSource } from "@/lib/source";
import { AREA_IDS, PROGRAMM_CHIPS, STEPS, STUNDEN_MAX, totalHours, type ParsedAnswers, type Step, type StepId } from "@/lib/prozessCheck";
import { FORM_ERRORS } from "./blocks";
import { capText, normalizePhone, normalizeWebsite, parseProgramme, stripContacts } from "./guards";
import type { LeadContact, RawInput } from "./mails";

export type ParsedSubmission = {
  answers: ParsedAnswers;
  contact: LeadContact;
  /** Unstripped text for the internal lead mail only (spec §6). */
  raw: RawInput;
  source?: string;
  submittedAt: Date;
  honeypot: string;
  renderedAt: number;
};

// `antworten` is no field: the answers themselves are unusable (crafted post), shown as a generic error.
export type FieldErrors = Partial<Record<"name" | "firma" | "email" | "telefon" | "anruf" | "antworten", string>>;

function pick<T extends string>(raw: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

// Clamp a slider value to 0..10 integer; anything odd falls back to 0.
function clampHours(raw: string): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n > STUNDEN_MAX ? STUNDEN_MAX : n;
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
  // stripContacts is slow on huge input and runs before honeypot and caps: cap the raw value first.
  const clean = (k: string, rawMax: number, max: number) => capText(stripContacts(capText(get(k), rawMax)), max);

  const bereiche = AREA_IDS.filter((id) => all("bereiche").includes(id));
  const stunden = Object.fromEntries(bereiche.map((id) => [id, clampHours(get(`h_${id}`))]));
  const programmeChips = PROGRAMM_CHIPS.filter((c) => all("programmeChips").includes(c));
  const programmeText = capText(get("programmeText"), 1000);
  const website = normalizeWebsite(capText(get("webseite"), 300));

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
    arbeitstag: clean("arbeitstag", 1000, 500),
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
      name: clean("name", 200, MAX_NAME).trim(),
      firma: clean("firma", 200, MAX_NAME).trim(),
      email: get("email").trim(),
      telefon: normalizePhone(get("telefon")) ?? "",
      anrufOk: fd.get("anruf") != null,
    },
    raw: { firma: capText(get("firma"), 2000), arbeitstag: capText(get("arbeitstag"), 2000), programmeText: capText(get("programmeText"), 2000) },
    source: normalizeSource(get("src")),
    submittedAt: new Date(),
    // Not `website`: password managers may autofill that name and silently drop a real lead.
    honeypot: get("hp_url"),
    renderedAt: Number(get("renderedAt")) || 0,
  };
}

export function submissionErrors(s: ParsedSubmission): FieldErrors {
  const c = s.contact;
  const errors: FieldErrors = {};
  // The wizard never sends this; zero hours is no lead (spec §5), so no PDF and no mail.
  if (totalHours(s.answers) === 0) errors.antworten = FORM_ERRORS.generic;
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
