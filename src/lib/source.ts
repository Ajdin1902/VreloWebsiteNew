// src/lib/source.ts
// Attribution parameter for /prozess-check (`?src=brief-handwerk`). The Lead
// Engine's letter batches point at vrelo-ki.de/brief, which redirects here with
// the parameter, so a reply can be traced back to a batch. The value is
// allow-listed to a short slug because it lands in the internal notification
// e-mail and in the Cal.com booking notes — never rendered raw.
const SOURCE_RE = /^[a-z0-9]+(?:-[a-z0-9]+){0,3}$/;

export function normalizeSource(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const s = raw.trim().toLowerCase();
  if (s.length < 2 || s.length > 32) return undefined;
  return SOURCE_RE.test(s) ? s : undefined;
}

/** Label for humans (internal e-mail, booking notes). */
export function sourceLabel(source: string | undefined): string {
  return source ?? "Website";
}
