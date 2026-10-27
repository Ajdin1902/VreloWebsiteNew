import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
const send = vi.hoisted(() => vi.fn());
const readFile = vi.hoisted(() => vi.fn());
vi.mock("node:fs/promises", () => ({ readFile, default: { readFile } }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
import { submitBauplanRequest, type BauplanEmailState } from "./actions";
function fd(e: Record<string, string>) { const f = new FormData(); for (const [k, v] of Object.entries(e)) f.set(k, v); return f; }
const idle: BauplanEmailState = { status: "idle" };

const origCode = process.env.BAUPLAN_CODE;
const PDF = Buffer.from("%PDF-1.7 test");
beforeEach(() => {
  send.mockReset();
  readFile.mockReset();
  readFile.mockResolvedValue(PDF);
  process.env.BAUPLAN_CODE = "agentur-7k3m";
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.RESEND_API_KEY = "k"; process.env.CONTACT_FROM = "Vrelo <a@vrelo-ki.de>"; process.env.CONTACT_TO = "me@vrelo-ki.de";
});

afterEach(() => {
  if (origCode === undefined) delete process.env.BAUPLAN_CODE;
  else process.env.BAUPLAN_CODE = origCode;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("submitBauplanRequest", () => {
  it("drops a honeypot hit as a silent ok", async () => {
    expect((await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", website: "bot" }))).status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });
  it("invalidates a bad email", async () => {
    expect((await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "nope" }))).status).toBe("invalid");
  });
  it("sends reader mail with the PDF attached, then the internal mail", async () => {
    send.mockResolvedValue({ error: null });
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", src: "ag01", code: "agentur-7k3m" }));
    expect(s.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].attachments[0].filename).toBe("Vrelo-Bauplan-Agenturen.pdf");
    expect(send.mock.calls[1][0].subject).toBe("Bauplan angefordert: a@b.de");
  });
  it("attaches the PDF bytes as content (not a path) and sets replyTo", async () => {
    send.mockResolvedValue({ error: null });
    await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "agentur-7k3m" }));
    const att = send.mock.calls[0][0].attachments[0];
    expect(att.content).toBe(PDF);
    expect(att).not.toHaveProperty("path");
    expect(send.mock.calls[0][0].replyTo).toBe("me@vrelo-ki.de");
  });
  it("falls back to fetching the PDF when the disk read fails", async () => {
    readFile.mockRejectedValue(new Error("ENOENT"));
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, arrayBuffer: async () => new TextEncoder().encode("%PDF-fetched").buffer })));
    send.mockResolvedValue({ error: null });
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "agentur-7k3m" }));
    expect(s.status).toBe("ok");
    expect(Buffer.from(send.mock.calls[0][0].attachments[0].content).toString()).toBe("%PDF-fetched");
  });
  it("returns the error state, never a false success, when the file is missing and the fetch fallback fails", async () => {
    readFile.mockRejectedValue(new Error("ENOENT"));
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 })));
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "agentur-7k3m" }));
    expect(s.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
  it("rejects a missing or wrong code with the generic error and sends nothing", async () => {
    for (const code of [undefined, "wrong"]) {
      const e: Record<string, string> = { renderedAt: "0", email: "a@b.de" };
      if (code) e.code = code;
      const s = await submitBauplanRequest(idle, fd(e));
      expect(s.status).toBe("error");
    }
    expect(send).not.toHaveBeenCalled();
  });
  it("echoes the typed address back on invalid and error states", async () => {
    expect(await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "nope" }))).toMatchObject({ status: "invalid", email: "nope" });
    send.mockResolvedValueOnce({ error: { message: "boom" } });
    expect(await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "agentur-7k3m" }))).toMatchObject({ status: "error", email: "a@b.de" });
  });
  it("stays ok when only the internal mail rejects", async () => {
    send.mockResolvedValueOnce({ error: null }).mockRejectedValueOnce(new Error("down"));
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "agentur-7k3m" }));
    expect(s.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(2);
  });
  it("returns error and sends nothing when mail is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "agentur-7k3m" }));
    expect(s.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });
  it("returns an error and skips the internal mail when the reader mail fails", async () => {
    send.mockResolvedValueOnce({ error: { message: "boom" } });
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "agentur-7k3m" }));
    expect(s.status).toBe("error");
    expect(send).toHaveBeenCalledTimes(1);
  });
});
