export type AppointmentType = "erstberatung" | "baufinanzierung" | "versicherung" | "frei";
export type Tone = "locker" | "foermlich";

export type DemoSeed = {
  business: string;
  appointmentType: AppointmentType;
  tone: Tone;
  sourceUrl?: string;
};

/** Untrusted input to {@link sanitizeSeed} — field values may be anything (JSON, form, URL-derived). */
export type RawSeedInput = {
  business?: unknown;
  appointmentType?: unknown;
  tone?: unknown;
  sourceUrl?: unknown;
};

export const MAX_BUSINESS_LEN = 600;

const APPOINTMENT_TYPES: readonly AppointmentType[] = ["erstberatung", "baufinanzierung", "versicherung", "frei"];
const TONES: readonly Tone[] = ["locker", "foermlich"];

export function pick<T extends string>(raw: unknown, allowed: readonly T[], fallback: T): T {
  return typeof raw === "string" && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  // Strip control chars, collapse whitespace, trim, cap length.
  return raw
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, max);
}

function cleanUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    const u = new URL(raw.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function sanitizeSeed(raw: RawSeedInput): DemoSeed {
  return {
    business: cleanText(raw.business, MAX_BUSINESS_LEN),
    appointmentType: pick(raw.appointmentType, APPOINTMENT_TYPES, "frei"),
    tone: pick(raw.tone, TONES, "foermlich"),
    sourceUrl: cleanUrl(raw.sourceUrl),
  };
}
