export function isSameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return false;
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return false;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export const MAX_BODY_BYTES = 20_000;

/** Read a JSON body, rejecting anything over the cap. Returns null on parse/size failure. */
export async function readJsonCapped<T>(req: Request, max = MAX_BODY_BYTES): Promise<T | null> {
  const raw = await req.text();
  if (raw.length > max) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
