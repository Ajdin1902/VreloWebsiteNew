// src/app/lead-check/actions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(function (this: { emails: { send: typeof send } }) {
    this.emails = { send };
  }),
}));

import { submitLeadCheckEmail, type LeadCheckEmailState } from "./actions";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const initial: LeadCheckEmailState = { status: "idle" };
const good = {
  email: "makler@example.de",
  website: "",
  renderedAt: "0",
  anfragenProWoche: "10",
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: "4000",
};

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("CONTACT_TO", "hallo@example.de");
});
afterEach(() => vi.unstubAllEnvs());

describe("submitLeadCheckEmail", () => {
  it("sends the lead summary first, then the internal notification", async () => {
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(2);
    const lead = send.mock.calls[0][0];
    expect(lead.to).toBe("makler@example.de");
    expect(lead.subject).toBe("Dein Ergebnis: Lead-Reaktions-Check");
    expect(lead.html).toContain("48.000");
    const internal = send.mock.calls[1][0];
    expect(internal.to).toBe("hallo@example.de");
    expect(internal.replyTo).toBe("makler@example.de");
    expect(internal.text).toContain("Score: langsam");
  });

  it("silently succeeds without sending on a honeypot hit", async () => {
    const r = await submitLeadCheckEmail(initial, fd({ ...good, website: "spam" }));
    expect(r.status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns invalid on a bad email and does not send", async () => {
    const r = await submitLeadCheckEmail(initial, fd({ ...good, email: "nope" }));
    expect(r.status).toBe("invalid");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when the lead send resolves an error object", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "x", message: "bad" } });
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
  });

  it("stays ok when only the internal send fails", async () => {
    send
      .mockResolvedValueOnce({ data: { id: "1" }, error: null })
      .mockRejectedValueOnce(new Error("internal boom"));
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("reports not-configured when env is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when the lead send throws", async () => {
    send.mockRejectedValueOnce(new Error("network error"));
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
  });

  it("falls back to safe defaults for unknown enum values (no NaN in either email)", async () => {
    const r = await submitLeadCheckEmail(initial, fd({ ...good, reaktionszeit: "garbage" }));
    expect(r.status).toBe("ok");
    expect(send.mock.calls[0][0].html).not.toContain("NaN");
    expect(send.mock.calls[1][0].text).not.toContain("NaN");
  });
});
