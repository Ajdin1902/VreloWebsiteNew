// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
const send = vi.hoisted(() => vi.fn());
const checkSendCaps = vi.hoisted(() => vi.fn());
const checkResearchCaps = vi.hoisted(() => vi.fn());
const releaseResearch = vi.hoisted(() => vi.fn());
const parkJob = vi.hoisted(() => vi.fn());
const takeJob = vi.hoisted(() => vi.fn());
const headerMap = vi.hoisted(() => ({ current: new Map<string, string>() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
vi.mock("@/lib/vorabFahrplan/caps", () => ({ checkSendCaps, checkResearchCaps, releaseResearch }));
// Upstash parking is mocked; toResearchJob, postJob and researchConfigured run for real.
vi.mock("@/lib/vorabFahrplan/job", async (importOriginal) => ({ ...(await importOriginal<object>()), parkJob, takeJob }));
const pdfFail = vi.hoisted(() => ({ on: false }));
vi.mock("@/lib/vorabFahrplan/pdf", async (importOriginal) => {
  const m = await importOriginal<typeof import("@/lib/vorabFahrplan/pdf")>();
  return {
    ...m,
    renderVorabFahrplanPdf: async (p: Parameters<typeof m.renderVorabFahrplanPdf>[0]) => {
      if (pdfFail.on) throw new Error("render");
      return m.renderVorabFahrplanPdf(p);
    },
  };
});
const planFail = vi.hoisted(() => ({ on: false }));
vi.mock("@/lib/vorabFahrplan/fallback", async (importOriginal) => {
  const m = await importOriginal<typeof import("@/lib/vorabFahrplan/fallback")>();
  return {
    ...m,
    buildFallbackPlan: (...a: Parameters<typeof m.buildFallbackPlan>) => {
      if (planFail.on) throw new Error("plan");
      return m.buildFallbackPlan(...a);
    },
  };
});
vi.mock("next/headers", () => ({ headers: async () => new Headers(Object.fromEntries(headerMap.current)) }));
import { submitVorabFahrplan, type VorabFahrplanState } from "./actions";
import { parseSubmission } from "@/lib/vorabFahrplan/submission";
import { AREA_LABEL } from "@/lib/prozessCheck";
import { CAP_GRUND, CONSENT_TEXT, CONSENT_VERSION, FORM_ERRORS, FORM_UI, LEAD_STATUS, PDF_FEHLER_GRUND, RECHERCHE_GRUND, VERSAND_FEHLER_GRUND, consentFor } from "@/lib/vorabFahrplan/blocks";

type Entries = Record<string, string | string[] | undefined>;
const fd = fdPlain;
function fdPlain(e: Entries): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(e)) {
    if (v === undefined) continue;
    for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  }
  return f;
}
const idle: VorabFahrplanState = { status: "idle" };

const good: Entries = {
  renderedAt: "0",
  name: "Max Muster",
  firma: "Muster GmbH",
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
  programmeText: "Lexoffice",
  arbeitstag: "",
  abende: "abundzu",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
  src: "brief-handwerk",
};

beforeEach(() => {
  pdfFail.on = false;
  planFail.on = false;
  send.mockReset();
  send.mockResolvedValue({ error: null });
  checkSendCaps.mockReset();
  checkSendCaps.mockResolvedValue({ ok: true });
  checkResearchCaps.mockReset();
  checkResearchCaps.mockResolvedValue({ research: true, frisch: true });
  releaseResearch.mockReset();
  parkJob.mockReset();
  parkJob.mockResolvedValue(true);
  takeJob.mockReset();
  takeJob.mockResolvedValue(null);
  headerMap.current = new Map([["x-forwarded-for", "1.2.3.4, 10.0.0.1"]]);
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.RESEND_API_KEY = "k";
  process.env.CONTACT_FROM = "Vrelo <a@vrelo-ki.de>";
  process.env.CONTACT_TO = "me@vrelo-ki.de";
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("submitVorabFahrplan", () => {
  it("sends the lead mail first, then the visitor mail with the PDF", async () => {
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(send).toHaveBeenCalledTimes(2);
    const [lead, visitor] = send.mock.calls.map((c) => c[0]);
    expect(lead.to).toBe("me@vrelo-ki.de");
    expect(lead.replyTo).toBe("max@muster.de");
    expect(lead.subject).toContain("Neuer Lead: Muster GmbH");
    expect(visitor.to).toBe("max@muster.de");
    expect(visitor.attachments).toHaveLength(1);
    expect(visitor.attachments[0].filename).toMatch(/^Vrelo-Vorab-Fahrplan-.+\.pdf$/);
    expect(Buffer.from(visitor.attachments[0].content).subarray(0, 4).toString("latin1")).toBe("%PDF");
    // The lead mail carries the same PDF.
    expect(lead.attachments[0].filename).toBe(visitor.attachments[0].filename);
  }, 30000);

  it("without research env: no research caps, no job, the consent without KI", async () => {
    await submitVorabFahrplan(idle, fd(good));
    expect(checkResearchCaps).not.toHaveBeenCalled();
    expect(parkJob).not.toHaveBeenCalled();
    const lead = send.mock.calls[0][0];
    expect(lead.text).toContain(`Einwilligung: ${CONSENT_TEXT}`);
    expect(lead.text).toContain(`Textversion: ${CONSENT_VERSION}`);
    expect(lead.text).not.toContain(FORM_UI.consentKi);
  }, 30000);

  it("passes the first x-forwarded-for entry to the caps, or „unknown“", async () => {
    await submitVorabFahrplan(idle, fd(good));
    expect(checkSendCaps).toHaveBeenLastCalledWith({ ip: "1.2.3.4", email: "max@muster.de" });
    headerMap.current = new Map();
    await submitVorabFahrplan(idle, fd(good));
    expect(checkSendCaps).toHaveBeenLastCalledWith({ ip: "unknown", email: "max@muster.de" });
  }, 30000);

  it("a missing phone is invalid.telefon", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, telefon: "" }));
    expect(s.status).toBe("invalid");
    expect(s.status === "invalid" && s.errors.telefon).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("an unchecked consent is invalid.anruf and sends nothing", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, anruf: undefined }));
    expect(s.status === "invalid" && s.errors.anruf).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
    expect(checkSendCaps).not.toHaveBeenCalled();
  });

  it("an e-mail with a line break is invalid, never a replyTo", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, email: "max@muster.de\r\nBcc: x@y.de" }));
    expect(s.status === "invalid" && s.errors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("capped: only the lead mail goes out, flagged „nicht versendet“ with the PDF, status ok", async () => {
    checkSendCaps.mockResolvedValue({ ok: false, grund: "adresse" });
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(send).toHaveBeenCalledTimes(1);
    const lead = send.mock.calls[0][0];
    expect(lead.subject).toMatch(/^\[nicht versendet\] /);
    expect(lead.text).toContain("nicht versendet");
    expect(lead.text).toContain(CAP_GRUND.adresse);
    expect(lead.text).toContain(LEAD_STATUS.gesperrt);
    expect(lead.text).not.toContain(LEAD_STATUS.vonHand);
    expect(lead.attachments).toHaveLength(1);
  }, 30000);

  it("lead mail fails twice: one console.error, the visitor still gets the PDF", async () => {
    send
      .mockResolvedValueOnce({ error: { message: "x" } })
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce({ error: null });
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(console.error).mock.calls[0][0])).toBe("prozess-check lead mail failed");
    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls[2][0].to).toBe("max@muster.de");
  }, 30000);

  it("a PDF that fails to render still sends the flagged lead mail, then an error", async () => {
    pdfFail.on = true;
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s.status).toBe("error");
    expect(send).toHaveBeenCalledTimes(1);
    const lead = send.mock.calls[0][0];
    expect(lead.subject).toMatch(/^\[nicht versendet\] /);
    expect(lead.text).toContain(PDF_FEHLER_GRUND);
    expect(lead.text).toContain(LEAD_STATUS.vonHand);
    expect(lead.attachments).toBeUndefined();
  });

  it("a visitor-mail failure is an error and sends a second lead mail flagged „nicht versendet“ with the PDF", async () => {
    for (const fail of [() => send.mockResolvedValueOnce({ error: { message: "x" } }), () => send.mockRejectedValueOnce(new Error("down"))]) {
      send.mockClear();
      send.mockResolvedValueOnce({ error: null });
      fail();
      expect((await submitVorabFahrplan(idle, fd(good))).status).toBe("error");
      expect(send).toHaveBeenCalledTimes(3);
      const second = send.mock.calls[2][0];
      expect(second.to).toBe("me@vrelo-ki.de");
      expect(second.subject).toMatch(/^\[nicht versendet\] /);
      expect(second.text).toContain(VERSAND_FEHLER_GRUND);
      expect(second.text).toContain(LEAD_STATUS.vonHand);
      expect(second.attachments).toHaveLength(1);
      expect(second.attachments[0].filename).toMatch(/^Vrelo-Vorab-Fahrplan-.+\.pdf$/);
    }
  }, 60000);

  it("a plan that fails to build still sends the flagged lead mail, then an error", async () => {
    planFail.on = true;
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "error", message: FORM_ERRORS.generic });
    expect(send).toHaveBeenCalledTimes(1);
    const lead = send.mock.calls[0][0];
    expect(lead.subject).toMatch(/^\[nicht versendet\] /);
    expect(lead.text).toContain(PDF_FEHLER_GRUND);
  });

  it.each([
    ["no area", { bereiche: undefined }],
    ["zero hours", { h_anfragen: "0", h_rechnungen: "0" }],
  ])("a crafted post with %s is a generic error and sends nothing", async (_, patch: Entries) => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, ...patch }));
    expect(s).toEqual({ status: "error", message: FORM_ERRORS.generic });
    expect(send).not.toHaveBeenCalled();
    expect(checkSendCaps).not.toHaveBeenCalled();
  });

  it("a name that is only contact data is invalid.name and sends nothing", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, name: "www.spam.example 0941 123456" }));
    expect(s.status === "invalid" && s.errors.name).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("the honeypot is a silent ok with no send", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, hp_url: "bot" }));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(send).not.toHaveBeenCalled();
  });

  it("an autofilled `website` field is no honeypot hit", async () => {
    await submitVorabFahrplan(idle, fd({ ...good, website: "https://muster.de" }));
    expect(send).toHaveBeenCalledTimes(2);
  }, 30000);

  it("the lead mail carries the raw input as „Original-Eingabe“, the visitor mail does not", async () => {
    await submitVorabFahrplan(idle, fd({ ...good, firma: "Muster GmbH <b>www.muster.de</b>", arbeitstag: "Ruf an: 0941 123456", programmeText: "Lexoffice, crm.example.com" }));
    const [lead, visitor] = send.mock.calls.map((c) => c[0]);
    expect(lead.text).toContain("Original-Eingabe");
    for (const raw of ["Muster GmbH <b>www.muster.de</b>", "Ruf an: 0941 123456", "Lexoffice, crm.example.com"]) expect(lead.text).toContain(raw);
    expect(lead.html).toContain("&lt;b&gt;www.muster.de&lt;/b&gt;");
    expect(lead.html).not.toContain("<b>www");
    for (const part of [visitor.text, visitor.html, visitor.subject]) {
      expect(part).not.toContain("www.muster.de");
      expect(part).not.toContain("123456");
      expect(part).not.toContain("crm.example.com");
    }
  }, 30000);

  it("a too-fast submit is an error", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, renderedAt: String(Date.now()) }));
    expect(s.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });

  it("ignores hours of areas that were not picked", async () => {
    await submitVorabFahrplan(idle, fd({ ...good, h_daten: "7" }));
    const lead = send.mock.calls[0][0];
    expect(lead.text).toContain("Summe: 8 Std./Woche");
    expect(lead.text).not.toContain(AREA_LABEL.daten);
  }, 30000);
});

describe("parseSubmission", () => {
  it("re-validates enums, clamps hours, keeps only picked areas", () => {
    const p = parseSubmission(
      fd({ ...good, bereiche: ["anfragen", "bogus"], h_anfragen: "99", h_daten: "4", menge: "x", nervt: "daten", kanaele: ["mail", "fax"] }),
    );
    expect(p.answers.bereiche).toEqual(["anfragen"]);
    expect(p.answers.stunden).toEqual({ anfragen: 10 });
    expect(p.answers.nervt).toBe("anfragen");
    expect(p.answers.menge).toBe("bis5");
    expect(p.answers.kanaele).toEqual(["mail"]);
    expect(p.answers.programme).toEqual(["Outlook", "Lexoffice"]);
    expect(p.source).toBe("brief-handwerk");
  });

  it("caps firma and name at 60, strips contacts from firma, normalises phone and website", () => {
    const long = "A".repeat(80);
    const p = parseSubmission(
      fd({ ...good, name: long, firma: `Muster GmbH www.muster.de ${long}`, telefon: "+49 (941) 12-34-56", webseite: "muster.de" }),
    );
    expect(p.contact.name).toHaveLength(60);
    expect(p.contact.firma.length).toBeLessThanOrEqual(60);
    expect(p.contact.firma).not.toContain("www");
    expect(parseSubmission(fd({ ...good, name: "Max www.x.de" })).contact.name).toBe("Max");
    expect(p.contact.telefon).toBe("+49941123456");
    expect(p.answers.website).toBe("https://muster.de/");
    expect(parseSubmission(fd({ ...good, webseite: "http://localhost" })).answers.website).toBeUndefined();
  });

  it("keeps the raw firma, workday and program text, capped at 2000", () => {
    const p = parseSubmission(fd({ ...good, firma: `Muster www.muster.de ${"x".repeat(3000)}`, arbeitstag: "Tel 0941 123456", programmeText: "a.example.com" }));
    expect(p.raw.firma.startsWith("Muster www.muster.de")).toBe(true);
    expect(p.raw.firma).toHaveLength(2000);
    expect(p.raw.arbeitstag).toBe("Tel 0941 123456");
    expect(p.raw.programmeText).toBe("a.example.com");
  });

  it("keeps only known program chips", () => {
    const p = parseSubmission(fd({ ...good, programmeChips: ["Outlook", "<b>x</b>", "y".repeat(5000), "Outlook"] }));
    expect(p.answers.programmeChips).toEqual(["Outlook"]);
  });

  it("caps raw input before stripping: 200k-char fields parse in under 200 ms", () => {
    const big = (c: string) => c.repeat(200_000);
    const t = performance.now();
    const p = parseSubmission(fd({ ...good, name: big("a"), firma: big("b"), arbeitstag: big("c"), programmeText: big("d"), webseite: big("e") }));
    expect(performance.now() - t).toBeLessThan(200);
    expect(p.contact.name).toHaveLength(60);
    expect(p.contact.firma).toHaveLength(60);
    expect(p.answers.arbeitstag).toHaveLength(500);
  });

  it("strips contacts from the workday text and caps it at 500", () => {
    const p = parseSubmission(fd({ ...good, arbeitstag: `Ruf mich an 0941 123456 ${"x".repeat(600)}` }));
    expect(p.answers.arbeitstag).not.toContain("123456");
    expect(p.answers.arbeitstag.length).toBe(500);
  });
});

describe("submitVorabFahrplan with research (Plan 2)", () => {
  const fetchMock = vi.fn();
  // The form posts the consent version it rendered; with research env on it renders the KI one.
  const fd = (e: Entries) => fdPlain({ consentVersion: consentFor(true).version, ...e });
  beforeEach(() => {
    vi.stubEnv("N8N_PC_WEBHOOK_URL", "https://server1.example/webhook/pc");
    vi.stubEnv("PC_SHARED_SECRET", "ab".repeat(32));
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  const expectFallback = (grund: string) => {
    expect(send).toHaveBeenCalledTimes(2);
    const [lead, visitor] = send.mock.calls.map((c) => c[0]);
    expect(lead.to).toBe("me@vrelo-ki.de");
    expect(lead.text).toContain(`Status: ${LEAD_STATUS.fallback}, weil ${grund}`);
    expect(lead.subject).toMatch(/^Neuer Lead/);
    expect(visitor.to).toBe("max@muster.de");
    expect(Buffer.from(visitor.attachments[0].content).subarray(0, 4).toString("latin1")).toBe("%PDF");
  };

  it("happy path: parks, posts with the secret, one send only (lead mail „Recherche läuft“, no PDF)", async () => {
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: true });
    expect(checkResearchCaps).toHaveBeenCalledWith("max@muster.de");
    expect(parkJob).toHaveBeenCalledTimes(1);
    const [jobId, parked] = parkJob.mock.calls[0];
    expect(parked.contact.email).toBe("max@muster.de");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://server1.example/webhook/pc");
    expect(new Headers(init.headers).get("x-vrelo-secret")).toBe("ab".repeat(32));
    const job = JSON.parse(String(init.body));
    expect(job.jobId).toBe(jobId);
    expect(job.frischeRecherche).toBe(true);
    for (const secret of ["Max Muster", "max@muster.de", "123456"]) expect(String(init.body)).not.toContain(secret);
    expect(send).toHaveBeenCalledTimes(1);
    const lead = send.mock.calls[0][0];
    expect(lead.to).toBe("me@vrelo-ki.de");
    expect(lead.text).toContain(`Status: ${LEAD_STATUS.recherche}`);
    expect(lead.attachments).toBeUndefined();
    // The lead records the consent variant the form showed: with the KI sentence.
    const ki = consentFor(true);
    expect(lead.text).toContain(`Einwilligung: ${ki.text}`);
    expect(lead.text).toContain(`Textversion: ${ki.version}`);
    expect(takeJob).not.toHaveBeenCalled();
    expect(releaseResearch).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", undefined],
    ["the non-KI version", CONSENT_VERSION],
    ["an unknown value", "pc-call-ki-forged"],
  ])("a form posted with %s consent version: no research, the non-KI consent recorded", async (_, consentVersion) => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, consentVersion }));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(checkResearchCaps).not.toHaveBeenCalled();
    expect(parkJob).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    const lead = send.mock.calls[0][0];
    expect(lead.text).toContain(`Einwilligung: ${CONSENT_TEXT}`);
    expect(lead.text).toContain(`Textversion: ${CONSENT_VERSION}`);
    expect(lead.text).not.toContain(FORM_UI.consentKi);
    expect(lead.text).toContain(`Status: ${LEAD_STATUS.fallback}`);
    expect(send.mock.calls[1][0].to).toBe("max@muster.de");
  }, 30000);

  it("a second submit within 30 days posts frischeRecherche false", async () => {
    checkResearchCaps.mockResolvedValue({ research: true, frisch: false });
    await submitVorabFahrplan(idle, fd(good));
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).frischeRecherche).toBe(false);
  });

  it("webhook 500: cleans up the job, gives back the slot, sends the fallback PDF with the reason", async () => {
    fetchMock.mockResolvedValue(new Response("x", { status: 500 }));
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(takeJob).toHaveBeenCalledWith(parkJob.mock.calls[0][0]);
    expect(releaseResearch).toHaveBeenCalledWith("max@muster.de", true);
    expectFallback(RECHERCHE_GRUND.webhook);
  }, 30000);

  it("webhook timeout: the same fallback", async () => {
    const ctl = new AbortController();
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(ctl.signal);
    fetchMock.mockImplementation((_u: string, init: RequestInit) => {
      // Never answers; only the 5000 ms abort ends it (fired here at once).
      const p = new Promise((_, reject) => init.signal!.addEventListener("abort", () => reject(new Error("aborted"))));
      ctl.abort();
      return p;
    });
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(AbortSignal.timeout).toHaveBeenCalledWith(5000);
    expect(takeJob).toHaveBeenCalled();
    expectFallback(RECHERCHE_GRUND.webhook);
  }, 30000);

  it("parking fails: no POST, fallback with the storage reason", async () => {
    parkJob.mockResolvedValue(false);
    await submitVorabFahrplan(idle, fd(good));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(takeJob).toHaveBeenCalled();
    expect(releaseResearch).toHaveBeenCalledWith("max@muster.de", true);
    expectFallback(RECHERCHE_GRUND.speicher);
  }, 30000);

  it("the 26th research of the day: fallback with the Tageslimit reason, nothing parked", async () => {
    checkResearchCaps.mockResolvedValue({ research: false, frisch: false, grund: "tag" });
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(parkJob).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(RECHERCHE_GRUND.tag).toContain("Tageslimit");
    expectFallback(RECHERCHE_GRUND.tag);
  }, 30000);

  it("a capped send never starts research, the lead still records the KI consent", async () => {
    checkSendCaps.mockResolvedValue({ ok: false, grund: "ip" });
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok", recherche: false });
    expect(checkResearchCaps).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].text).toContain(`Textversion: ${consentFor(true).version}`);
  }, 30000);
});
