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
  it("sends via Resend on a clean submission", async () => {
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("hallo@example.de");
    expect(arg.replyTo).toBe("makler@example.de");
    expect(arg.text).toContain("Score: langsam");
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

  it("returns error when Resend resolves an error object", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "x", message: "bad" } });
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
  });

  it("reports not-configured when env is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when Resend throws", async () => {
    send.mockRejectedValueOnce(new Error("network error"));
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
  });

  it("falls back to safe defaults for unknown enum values (no NaN in the email)", async () => {
    const r = await submitLeadCheckEmail(initial, fd({ ...good, reaktionszeit: "garbage" }));
    expect(r.status).toBe("ok");
    const arg = send.mock.calls[0][0];
    expect(arg.text).not.toContain("NaN");
  });
});
