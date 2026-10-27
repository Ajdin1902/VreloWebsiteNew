// src/lib/bauplan.ts

// Unlisted blueprint page for agencies: /bauplan/<BAUPLAN_CODE>.
export const BAUPLAN_BASE = "/bauplan";

// Read at call time (not module load) so tests and Vercel both see the value.
export function bauplanCode(): string | undefined {
  const code = process.env.BAUPLAN_CODE?.trim();
  return code ? code : undefined;
}

export function isBauplanCode(slug: string): boolean {
  const code = bauplanCode();
  return code !== undefined && slug === code;
}
