// src/lib/bauplan.ts

// Unlisted blueprint pages: /bauplan/<code>. Two variants, each with its own
// secret code: BAUPLAN_CODE (Agenturen) and BAUPLAN_CODE_ELEKTRO (Elektrobetriebe).
export const BAUPLAN_BASE = "/bauplan";

import { reiheNischen, type ReiheSlug } from "./bauplanReihe";

export type BauplanVariant = "agentur" | "elektro" | ReiheSlug;

// Read at call time (not module load) so tests and Vercel both see the value.
function envCode(name: string): string | undefined {
  const code = process.env[name]?.trim();
  return code ? code : undefined;
}

export function bauplanCode(): string | undefined {
  return envCode("BAUPLAN_CODE");
}

// Agentur is checked first, so a misconfigured pair of equal codes serves the Agentur page.
export function bauplanVariant(slug: string): BauplanVariant | undefined {
  if (slug === bauplanCode()) return "agentur";
  if (slug === envCode("BAUPLAN_CODE_ELEKTRO")) return "elektro";
  return undefined;
}

export function isBauplanCode(slug: string): boolean {
  return bauplanVariant(slug) !== undefined;
}

// Public copies under /vorlagen post this token instead of a secret code, so the
// code never appears in public HTML. Only the form accepts it: /bauplan/<token>
// stays a 404 (the route checks bauplanVariant).
export const VORLAGE_TOKEN: Record<BauplanVariant, string> = {
  agentur: "vorlage-agentur",
  elektro: "vorlage-elektro",
  ...(Object.fromEntries(Object.keys(reiheNischen).map((s) => [s, `vorlage-${s}`])) as Record<ReiheSlug, string>),
};

export function bauplanFormVariant(token: string): BauplanVariant | undefined {
  return bauplanVariant(token) ?? (Object.keys(VORLAGE_TOKEN) as BauplanVariant[]).find((v) => VORLAGE_TOKEN[v] === token);
}
