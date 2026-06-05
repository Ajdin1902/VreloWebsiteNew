// src/app/kontakt/actions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  // Use a `function` so `new Resend(...)` is constructable under Vitest v4
  // (an arrow implementation is not a constructor and would throw).
  Resend: vi.fn(function (this: { emails: { send: typeof send } }) {
    this.emails = { send };
  }),
}));

import { sendContactMessage, type ContactState } from "./actions";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const initial: ContactState = { status: "idle" };

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("CONTACT_TO", "hallo@example.de");
});
afterEach(() => vi.unstubAllEnvs());

describe("sendContactMessage", () => {
  const good = { name: "Aydin", email: "a@b.de", message: "Hallo", company: "", consent: "on", website: "", renderedAt: "0" };

  it("sends via Resend on a clean submission and returns ok", async () => {
    const r = await sendContactMessage(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("hallo@example.de");
    expect(arg.from).toBe("Vrelo <kontakt@example.de>");
    expect(arg.replyTo).toBe("a@b.de");
  });

  it("silently succeeds without sending when honeypot is filled", async () => {
    const r = await sendContactMessage(initial, fd({ ...good, website: "spam" }));
    expect(r.status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns invalid with field errors and does not send", async () => {
    const r = await sendContactMessage(initial, fd({ ...good, email: "nope" }));
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(r.errors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when Resend throws", async () => {
    send.mockRejectedValueOnce(new Error("boom"));
    const r = await sendContactMessage(initial, fd(good));
    expect(r.status).toBe("error");
  });

  it("returns error when Resend resolves with an error object (does not throw)", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "validation_error", message: "bad" } });
    const r = await sendContactMessage(initial, fd(good));
    expect(r.status).toBe("error");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("preserves the submitted values on an invalid submission", async () => {
    const r = await sendContactMessage(initial, fd({ ...good, email: "nope", name: "Aydin" }));
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") {
      expect(r.values.email).toBe("nope");
      expect(r.values.name).toBe("Aydin");
    }
  });
});
