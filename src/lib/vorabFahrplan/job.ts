// The research hand-off to n8n on server1 (spec §8.1). The website parks the whole
// submission in Upstash under an opaque jobId (TTL 2 h, the one place contact data
// is stored) and posts n8n a job without name, e-mail, phone or raw texts (spec §3).
import type { ParsedAnswers } from "@/lib/prozessCheck";
import { redisClient } from "./caps";
import type { ParsedSubmission } from "./submission";

export type ResearchJob = Pick<
  ParsedAnswers,
  "branche" | "team" | "arbeitsort" | "website" | "programme" | "bereiche" | "stunden" | "nervt" | "kanaele" | "menge" | "wer" | "arbeitstag" | "abende" | "versucht"
> & { jobId: string; createdAt: string; firma: string; frischeRecherche: boolean };

const JOB_TTL = 7200;
const jobKey = (jobId: string) => `pc:job:${jobId}`;

/** Research runs only with the webhook URL and a secret of at least 32 random bytes as hex. */
export function researchConfigured(): boolean {
  return Boolean(process.env.N8N_PC_WEBHOOK_URL) && /^[0-9a-f]{64,}$/i.test(process.env.PC_SHARED_SECRET ?? "");
}

// Field by field, never a spread: a new answer field must be added here on purpose.
export function toResearchJob(s: ParsedSubmission, jobId: string, frisch: boolean): ResearchJob {
  const a = s.answers;
  return {
    jobId,
    createdAt: s.submittedAt.toISOString(),
    branche: a.branche,
    team: a.team,
    arbeitsort: a.arbeitsort,
    firma: s.contact.firma, // stripped of links and numbers in parseSubmission
    ...(a.website ? { website: a.website } : {}),
    programme: a.programme,
    bereiche: a.bereiche,
    stunden: a.stunden,
    nervt: a.nervt,
    kanaele: a.kanaele,
    menge: a.menge,
    wer: a.wer,
    arbeitstag: a.arbeitstag, // stripped
    abende: a.abende,
    versucht: a.versucht,
    frischeRecherche: frisch,
  };
}

export async function parkJob(jobId: string, s: ParsedSubmission): Promise<boolean> {
  const redis = redisClient();
  if (!redis) return false;
  try {
    return (await redis.set(jobKey(jobId), s, { ex: JOB_TTL })) === "OK";
  } catch {
    return false;
  }
}

/** Reads and deletes in one step, so a job is delivered at most once. */
export async function takeJob(jobId: string): Promise<ParsedSubmission | null> {
  const redis = redisClient();
  if (!redis) return null;
  try {
    const s = await redis.getdel<Omit<ParsedSubmission, "submittedAt"> & { submittedAt: string }>(jobKey(jobId));
    return s ? { ...s, submittedAt: new Date(s.submittedAt) } : null;
  } catch {
    return null;
  }
}

export async function postJob(job: ResearchJob): Promise<boolean> {
  const url = process.env.N8N_PC_WEBHOOK_URL;
  const secret = process.env.PC_SHARED_SECRET;
  if (!url || !secret || !researchConfigured()) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-vrelo-secret": secret },
      body: JSON.stringify(job),
      signal: AbortSignal.timeout(5000),
      redirect: "error", // the secret header never follows a redirect
    });
    await res.body?.cancel();
    return res.ok;
  } catch {
    return false;
  }
}
