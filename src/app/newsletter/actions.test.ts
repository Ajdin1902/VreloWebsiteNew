// src/app/newsletter/actions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  // constructable function — arrow impls are not constructors under Vitest v4
  Resend: vi.fn(function (this: { emails: { send: typeof send } }) {
    this.emails = { send };
  }),
}));

import { subscribeToNewsletter, type NewsletterState } from "./actions";
import { verifyToken } from "@/lib/newsletter";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const initial: NewsletterState = { status: "idle" };
const good = { email: "a@b.de", consent: "on", website: "", renderedAt: "0" };

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
  vi.stubEnv("NEWSLETTER_AUDIENCE_ID", "aud_1");
});
afterEach(() => vi.unstubAllEnvs());

describe("subscribeToNewsletter", () => {
  it("sends a confirm email to the subscriber with a verifiable token", async () => {
    const r = await subscribeToNewsletter(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("a@b.de");
    expect(arg.from).toBe("Vrelo <kontakt@example.de>");
    const m = String(arg.text).match(/token=([^\s]+)/);
    expect(m).not.toBeNull();
    const token = decodeURIComponent(m![1]);
    const v = verifyToken(token, Date.now());
    expect(v).toEqual({ ok: true, email: "a@b.de" });
  });

  it("silently succeeds without sending when honeypot filled", async () => {
    const r = await subscribeToNewsletter(initial, fd({ ...good, website: "spam" }));
    expect(r.status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns invalid with field errors and does not send", async () => {
    const r = await subscribeToNewsletter(initial, fd({ ...good, email: "nope" }));
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(r.errors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when Resend resolves with an error object", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "x", message: "bad" } });
    const r = await subscribeToNewsletter(initial, fd(good));
    expect(r.status).toBe("error");
  });
});
