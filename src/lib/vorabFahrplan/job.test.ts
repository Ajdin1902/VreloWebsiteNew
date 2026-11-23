import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const kv = new Map<string, unknown>();
const set = vi.fn(async (k: string, v: unknown) => {
  // Upstash serialises objects to JSON and parses them back on read.
  kv.set(k, JSON.parse(JSON.stringify(v)));
  return "OK";
});
const getdel = vi.fn(async (k: string) => {
  const v = kv.get(k) ?? null;
  kv.delete(k);
  return v;
});
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(function (this: Record<string, unknown>) {
    this.set = set;
    this.getdel = getdel;
  }),
}));

import { parkJob, postJob, researchConfigured, takeJob, toResearchJob } from "./job";
import { parseSubmission } from "./submission";

function fd(e: Record<string, string | string[]>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(e)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  return f;
}
const sub = parseSubmission(
  fd({
    name: "Max Muster",
    firma: "Muster GmbH www.muster-raw.de",
    email: "max@muster.de",
    telefon: "0941 123456",
    anruf: "on",
    bereiche: ["anfragen", "rechnungen"],
    h_anfragen: "3",
    h_rechnungen: "5",
    nervt: "rechnungen",
    kanaele: ["mail"],
    menge: "5bis20",
    wer: "buero",
    programmeChips: ["Outlook"],
    programmeText: "Lexoffice, crm.example.com/login", // a bare domain would count as a program name

    arbeitstag: "Morgens Mails, ruf an: 0170 9876543",
    abende: "abundzu",
    versucht: "nichts",
    branche: "handwerk",
    team: "2bis5",
    arbeitsort: "beides",
    webseite: "muster.de",
  }),
);

beforeEach(() => {
  kv.clear();
  set.mockClear();
  getdel.mockClear();
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
  vi.stubEnv("N8N_PC_WEBHOOK_URL", "https://server1.example/webhook/pc");
  vi.stubEnv("PC_SHARED_SECRET", "ab".repeat(32));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("toResearchJob", () => {
  it("never carries name, e-mail, phone or the raw texts (spec §3)", () => {
    const json = JSON.stringify(toResearchJob(sub, "j", true));
    for (const secret of ["Max Muster", "Max", "max@muster.de", "0941", "123456", "+49941123456", "9876543", "www.muster-raw.de", "crm.example.com"]) {
      expect(json).not.toContain(secret);
    }
    // And no key that could hold them.
    for (const key of ["name", "email", "telefon", "contact", "raw", "programmeText"]) expect(json).not.toContain(`"${key}"`);
  });

  it("carries the answers, the stripped Firma, the website and the fresh flag", () => {
    const j = toResearchJob(sub, "job-1", false);
    expect(j).toMatchObject({
      jobId: "job-1",
      createdAt: sub.submittedAt.toISOString(),
      branche: "handwerk",
      team: "2bis5",
      arbeitsort: "beides",
      firma: "Muster GmbH",
      website: "https://muster.de/",
      programme: ["Outlook", "Lexoffice"],
      bereiche: ["anfragen", "rechnungen"],
      stunden: { anfragen: 3, rechnungen: 5 },
      nervt: "rechnungen",
      kanaele: ["mail"],
      menge: "5bis20",
      wer: "buero",
      abende: "abundzu",
      versucht: "nichts",
      frischeRecherche: false,
    });
    expect(j.arbeitstag).toContain("Morgens Mails");
    expect(toResearchJob(sub, "j", true).frischeRecherche).toBe(true);
  });
});

describe("parkJob / takeJob", () => {
  it("parks the whole submission for 2 h and hands it back once, with a Date", async () => {
    expect(await parkJob("abc", sub)).toBe(true);
    expect(set).toHaveBeenCalledWith("pc:job:abc", expect.anything(), { ex: 7200 });
    const back = await takeJob("abc");
    if (back.status !== "ok") throw new Error(back.status);
    expect(back.submission.contact).toEqual(sub.contact);
    expect(back.submission.answers).toEqual(sub.answers);
    expect(back.submission.submittedAt).toBeInstanceOf(Date);
    expect(back.submission.submittedAt.getTime()).toBe(sub.submittedAt.getTime());
    expect(await takeJob("abc")).toEqual({ status: "missing" });
  });

  // The deliver route must tell „already delivered“ from „Redis down, retry“.
  it("fails soft without Upstash or when Redis throws, and says so", async () => {
    set.mockRejectedValueOnce(new Error("net"));
    expect(await parkJob("x", sub)).toBe(false);
    getdel.mockRejectedValueOnce(new Error("net"));
    expect(await takeJob("x")).toEqual({ status: "error" });
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    expect(await parkJob("x", sub)).toBe(false);
    expect(await takeJob("x")).toEqual({ status: "error" });
  });
});

describe("postJob", () => {
  const job = toResearchJob(sub, "j1", true);

  it("posts the job with the secret header, true on 2xx", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await postJob(job)).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://server1.example/webhook/pc");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("x-vrelo-secret")).toBe("ab".repeat(32));
    // The secret header never follows a redirect.
    expect(init.redirect).toBe("error");
    expect(JSON.parse(String(init.body))).toEqual(job);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("releases the response body", async () => {
    const res = new Response("ok", { status: 200 });
    const cancel = vi.spyOn(res.body!, "cancel");
    vi.stubGlobal("fetch", vi.fn(async () => res));
    expect(await postJob(job)).toBe(true);
    expect(cancel).toHaveBeenCalled();
  });

  it("false on 500 and on a network error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("x", { status: 500 })));
    expect(await postJob(job)).toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("down"))));
    expect(await postJob(job)).toBe(false);
  });

  it("gives up after 5000 ms", async () => {
    const ctl = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(ctl.signal);
    // A webhook that never answers: only the abort signal ends it.
    vi.stubGlobal(
      "fetch",
      vi.fn((_u: string, init: RequestInit) => new Promise((_, reject) => init.signal!.addEventListener("abort", () => reject(new Error("aborted"))))),
    );
    const p = postJob(job);
    expect(timeout).toHaveBeenCalledWith(5000);
    ctl.abort();
    expect(await p).toBe(false);
  });

  it("does nothing when research is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("PC_SHARED_SECRET", "");
    expect(await postJob(job)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("researchConfigured", () => {
  it("needs both the webhook URL and the shared secret", () => {
    expect(researchConfigured()).toBe(true);
    vi.stubEnv("N8N_PC_WEBHOOK_URL", "");
    expect(researchConfigured()).toBe(false);
    vi.stubEnv("N8N_PC_WEBHOOK_URL", "https://x");
    vi.stubEnv("PC_SHARED_SECRET", "");
    expect(researchConfigured()).toBe(false);
  });

  it("needs a secret of at least 64 hex characters (32 random bytes)", () => {
    vi.stubEnv("PC_SHARED_SECRET", "ab".repeat(31));
    expect(researchConfigured()).toBe(false);
    vi.stubEnv("PC_SHARED_SECRET", "s".repeat(64));
    expect(researchConfigured()).toBe(false);
    vi.stubEnv("PC_SHARED_SECRET", "AB".repeat(40));
    expect(researchConfigured()).toBe(true);
  });
});
