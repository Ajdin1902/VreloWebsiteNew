import { describe, it, expect, vi, beforeEach } from "vitest";
const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
import { submitBauplanRequest, type BauplanEmailState } from "./actions";
function fd(e: Record<string, string>) { const f = new FormData(); for (const [k, v] of Object.entries(e)) f.set(k, v); return f; }
const idle: BauplanEmailState = { status: "idle" };

beforeEach(() => {
  send.mockReset();
  process.env.RESEND_API_KEY = "k"; process.env.CONTACT_FROM = "Vrelo <a@vrelo-ki.de>"; process.env.CONTACT_TO = "me@vrelo-ki.de";
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
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", src: "ag01" }));
    expect(s.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].attachments[0].filename).toBe("Vrelo-Bauplan-Agenturen.pdf");
    expect(send.mock.calls[1][0].subject).toBe("Bauplan angefordert: a@b.de");
  });
  it("returns an error and skips the internal mail when the reader mail fails", async () => {
    send.mockResolvedValueOnce({ error: { message: "boom" } });
    const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de" }));
    expect(s.status).toBe("error");
    expect(send).toHaveBeenCalledTimes(1);
  });
});
