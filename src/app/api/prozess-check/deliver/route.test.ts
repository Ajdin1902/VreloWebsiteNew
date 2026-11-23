// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
const send = vi.hoisted(() => vi.fn());
const parkJob = vi.hoisted(() => vi.fn());
const takeJob = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
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
import { POST } from "./route";
import { DOSSIER_UI, PDF_FEHLER_GRUND } from "@/lib/vorabFahrplan/blocks";
import { parseSubmission, type ParsedSubmission } from "@/lib/vorabFahrplan/submission";

const SECRET = "a".repeat(64);
const JOB = "3f0c8a52-1d2e-4c1b-9a51-7d4b2f0e9c11";
const A = "https://learn.microsoft.com/graph/outlook";

function fd(e: Record<string, string | string[]>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(e)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  return f;
}
const submission: ParsedSubmission = parseSubmission(
  fd({
    name: "Max Muster",
    firma: "Muster GmbH",
    email: "max@muster.de",
    telefon: "0941 123456",
    anruf: "on",
    bereiche: ["anfragen", "rechnungen"],
    h_anfragen: "3",
    h_rechnungen: "5",
    nervt: "anfragen",
    kanaele: ["mail"],
    menge: "5bis20",
    wer: "buero",
    programmeChips: ["Outlook"],
    abende: "nein",
    versucht: "nichts",
    branche: "handwerk",
    team: "2bis5",
    arbeitsort: "beides",
  }),
);

const fragen = ["Wie viele Anfragen pro Tag?", "Wer liest das Postfach?", "Gibt es Vorlagen?", "Welche Outlook-Version?", "Wie schnell antwortest du heute?"];
const dossier = {
  programme: [{ name: "Outlook", befunde: "Graph API", unbestaetigt: "", blocker: "", n8n: "nativ", api: "ja" }],
  aufwand: [{ bereich: "anfragen", groesse: "S" }],
  kartenStationen: ["Anfrage-Reaktion"],
  fragen,
  kostenUsd: 0.31,
  capsGetroffen: [],
};
const good = {
  jobId: JOB,
  fallback: false,
  erlaubteQuellen: [A],
  pdf: {
    schritte: [{ bereich: "anfragen", titel: "Anfragen beantworten", idee: "Jede Anfrage bekommt schnell eine Antwort.", mitProgrammen: "Outlook liest neue Mails über eine Schnittstelle aus.", quellen: [A] }],
    programme: [{ name: "Outlook", zeilen: [{ text: "Outlook hat eine Schnittstelle für Mails und Kalender.", quellen: [A] }] }],
  },
  dossier,
};

function post(body: unknown, secret: string | null = SECRET): Request {
  return new Request("https://vrelo-ki.de/api/prozess-check/deliver", {
    method: "POST",
    headers: { "content-type": "application/json", ...(secret === null ? {} : { "x-vrelo-secret": secret }) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const pageCount = (buf: Buffer) => (buf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
const mails = () => send.mock.calls.map((c) => c[0]);

beforeEach(() => {
  pdfFail.on = false;
  send.mockReset().mockResolvedValue({ error: null });
  parkJob.mockReset().mockResolvedValue(true);
  takeJob.mockReset().mockResolvedValue(submission);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("PC_SHARED_SECRET", SECRET);
  vi.stubEnv("N8N_PC_WEBHOOK_URL", "https://server1.example/webhook/pc");
  vi.stubEnv("RESEND_API_KEY", "k");
  vi.stubEnv("CONTACT_FROM", "Vrelo <a@vrelo-ki.de>");
  vi.stubEnv("CONTACT_TO", "me@vrelo-ki.de");
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/prozess-check/deliver", () => {
  it("a wrong, short or missing secret is 401 and nothing is sent", async () => {
    for (const s of ["b".repeat(64), "short", null]) {
      const res = await POST(post(good, s));
      expect(res.status).toBe(401);
    }
    expect(takeJob).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("is 401 when research is not configured", async () => {
    vi.stubEnv("N8N_PC_WEBHOOK_URL", "");
    expect((await POST(post(good))).status).toBe(401);
    expect(send).not.toHaveBeenCalled();
  });

  it("is 400 for a body over 256 KB, no JSON or no usable jobId", async () => {
    const big = JSON.stringify({ ...good, pad: "x".repeat(256 * 1024) });
    for (const b of [big, "not json", { ...good, jobId: "" }, { ...good, jobId: 7 }, [1]]) {
      expect((await POST(post(b))).status).toBe(400);
    }
    expect(takeJob).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("a second delivery of the same jobId sends nothing and answers already-delivered", async () => {
    takeJob.mockResolvedValueOnce(null);
    const res = await POST(post(good));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "already-delivered" });
    expect(takeJob).toHaveBeenCalledWith(JOB);
    expect(send).not.toHaveBeenCalled();
  });

  it("happy path: the visitor gets a 2-page PDF, the dossier the 5 questions and the same PDF", async () => {
    const res = await POST(post(good));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "delivered", verworfen: 0 });
    const [visitor, dossierMail] = mails();
    expect(visitor.to).toBe("max@muster.de");
    expect(visitor.replyTo).toBe("me@vrelo-ki.de");
    const pdf = Buffer.from(visitor.attachments[0].content);
    expect(pdf.subarray(0, 4).toString("latin1")).toBe("%PDF");
    expect(pageCount(pdf)).toBe(2);
    expect(dossierMail.to).toBe("me@vrelo-ki.de");
    expect(dossierMail.replyTo).toBe("max@muster.de");
    expect(dossierMail.subject).toBe("Dossier: Muster GmbH");
    fragen.forEach((f, i) => expect(dossierMail.text).toContain(`${i + 1}. ${f}`));
    expect(dossierMail.attachments[0].filename).toBe(visitor.attachments[0].filename);
    expect(parkJob).not.toHaveBeenCalled();
  }, 30000);

  it("an invalid pdf part sends the fallback PDF, the dossier says Recherche unbrauchbar and keeps the findings", async () => {
    const res = await POST(post({ ...good, pdf: { schritte: "kaputt" } }));
    expect(res.status).toBe(200);
    const [visitor, dossierMail] = mails();
    expect(pageCount(Buffer.from(visitor.attachments[0].content))).toBe(1);
    expect(dossierMail.text).toContain(`${DOSSIER_UI.rechercheUnbrauchbar}: pdf.schritte`);
    expect(dossierMail.text).toContain(fragen[0]);
  }, 30000);

  it("a broken envelope with a usable jobId still delivers the fallback", async () => {
    const res = await POST(post({ jobId: JOB, fallback: "ja" }));
    expect(res.status).toBe(200);
    const [visitor, dossierMail] = mails();
    expect(pageCount(Buffer.from(visitor.attachments[0].content))).toBe(1);
    expect(dossierMail.text).toContain(DOSSIER_UI.rechercheUnbrauchbar);
  }, 30000);

  it("an invalid dossier part: the researched PDF still goes out, the dossier mail says so", async () => {
    const res = await POST(post({ ...good, dossier: { ...dossier, fragen: ["nur eine"] } }));
    expect(res.status).toBe(200);
    const [visitor, dossierMail] = mails();
    expect(pageCount(Buffer.from(visitor.attachments[0].content))).toBe(2);
    expect(dossierMail.text).toContain(`${DOSSIER_UI.dossierUnbrauchbar}: dossier.fragen`);
    expect(dossierMail.text).toContain(DOSSIER_UI.recherchiert);
  }, 30000);

  it("fallback: true gives the fallback PDF (recherchiert: false) and the grund in the dossier", async () => {
    const res = await POST(post({ jobId: JOB, fallback: true, grund: "Kostenlimit erreicht", erlaubteQuellen: [] }));
    expect(res.status).toBe(200);
    const [visitor, dossierMail] = mails();
    expect(pageCount(Buffer.from(visitor.attachments[0].content))).toBe(1);
    expect(dossierMail.text).toContain(DOSSIER_UI.festeBausteine);
    expect(dossierMail.text).toContain("Kostenlimit erreicht");
    expect(dossierMail.text).toContain(DOSSIER_UI.keinDossier);
  }, 30000);

  it("the visitor mail fails: 502, the job is re-parked, no dossier yet", async () => {
    send.mockResolvedValueOnce({ error: { message: "down" } });
    const res = await POST(post(good));
    expect(res.status).toBe(502);
    expect(parkJob).toHaveBeenCalledWith(JOB, submission);
    expect(send).toHaveBeenCalledTimes(1);
  }, 30000);

  it("the render fails: 502, re-parked, the dossier goes out flagged without a PDF", async () => {
    pdfFail.on = true;
    const res = await POST(post(good));
    expect(res.status).toBe(502);
    expect(parkJob).toHaveBeenCalledWith(JOB, submission);
    expect(send).toHaveBeenCalledTimes(1);
    const d = mails()[0];
    expect(d.to).toBe("me@vrelo-ki.de");
    expect(d.text).toContain(PDF_FEHLER_GRUND);
    expect(d.attachments).toBeUndefined();
  });

  it("a failed dossier mail does not fail the response", async () => {
    send.mockResolvedValueOnce({ error: null }).mockResolvedValue({ error: { message: "down" } });
    const res = await POST(post(good));
    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(3); // visitor + two dossier tries
  }, 30000);
});
