// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
const send = vi.hoisted(() => vi.fn());
const checkSendCaps = vi.hoisted(() => vi.fn());
const headerMap = vi.hoisted(() => ({ current: new Map<string, string>() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
vi.mock("@/lib/vorabFahrplan/caps", () => ({ checkSendCaps }));
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
vi.mock("next/headers", () => ({ headers: async () => new Headers(Object.fromEntries(headerMap.current)) }));
import { submitVorabFahrplan, type VorabFahrplanState } from "./actions";
import { parseSubmission } from "@/lib/vorabFahrplan/submission";
import { AREA_LABEL } from "@/lib/prozessCheck";
import { CAP_GRUND, PDF_FEHLER_GRUND, VERSAND_FEHLER_GRUND } from "@/lib/vorabFahrplan/blocks";

type Entries = Record<string, string | string[] | undefined>;
function fd(e: Entries): FormData {
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
  send.mockReset();
  send.mockResolvedValue({ error: null });
  checkSendCaps.mockReset();
  checkSendCaps.mockResolvedValue({ ok: true });
  headerMap.current = new Map([["x-forwarded-for", "1.2.3.4, 10.0.0.1"]]);
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.RESEND_API_KEY = "k";
  process.env.CONTACT_FROM = "Vrelo <a@vrelo-ki.de>";
  process.env.CONTACT_TO = "me@vrelo-ki.de";
});
afterEach(() => vi.restoreAllMocks());

describe("submitVorabFahrplan", () => {
  it("sends the lead mail first, then the visitor mail with the PDF", async () => {
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok" });
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
    expect(s).toEqual({ status: "ok" });
    expect(send).toHaveBeenCalledTimes(1);
    const lead = send.mock.calls[0][0];
    expect(lead.subject).toMatch(/^\[nicht versendet\] /);
    expect(lead.text).toContain("nicht versendet");
    expect(lead.text).toContain(CAP_GRUND.adresse);
    expect(lead.attachments).toHaveLength(1);
  }, 30000);

  it("lead mail fails twice: one console.error, the visitor still gets the PDF", async () => {
    send
      .mockResolvedValueOnce({ error: { message: "x" } })
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce({ error: null });
    const s = await submitVorabFahrplan(idle, fd(good));
    expect(s).toEqual({ status: "ok" });
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
      expect(second.attachments).toHaveLength(1);
      expect(second.attachments[0].filename).toMatch(/^Vrelo-Vorab-Fahrplan-.+\.pdf$/);
    }
  }, 60000);

  it("a name that is only contact data is invalid.name and sends nothing", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, name: "www.spam.example 0941 123456" }));
    expect(s.status === "invalid" && s.errors.name).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("the honeypot is a silent ok with no send", async () => {
    const s = await submitVorabFahrplan(idle, fd({ ...good, website: "bot" }));
    expect(s).toEqual({ status: "ok" });
    expect(send).not.toHaveBeenCalled();
  });

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

  it("strips contacts from the workday text and caps it at 500", () => {
    const p = parseSubmission(fd({ ...good, arbeitstag: `Ruf mich an 0941 123456 ${"x".repeat(600)}` }));
    expect(p.answers.arbeitstag).not.toContain("123456");
    expect(p.answers.arbeitstag.length).toBe(500);
  });
});
