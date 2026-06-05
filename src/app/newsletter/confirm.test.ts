// src/app/newsletter/confirm.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const create = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(function (this: { contacts: { create: typeof create } }) {
    this.contacts = { create };
  }),
}));

import { confirmSubscription } from "./confirm";
import { signToken } from "@/lib/newsletter";

beforeEach(() => {
  create.mockReset().mockResolvedValue({ data: { id: "c1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
  vi.stubEnv("NEWSLETTER_AUDIENCE_ID", "aud_1");
});
afterEach(() => vi.unstubAllEnvs());

describe("confirmSubscription", () => {
  it("adds the contact to the Resend audience for a valid token", async () => {
    const token = signToken("a@b.de", Date.now());
    const r = await confirmSubscription(token);
    expect(r.status).toBe("ok");
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toEqual({
      audienceId: "aud_1",
      email: "a@b.de",
      unsubscribed: false,
    });
  });

  it("returns invalid for a bad/expired token and does not call Resend", async () => {
    const r = await confirmSubscription("garbage");
    expect(r.status).toBe("invalid");
    expect(create).not.toHaveBeenCalled();
  });

  it("returns error when Resend resolves with an error object", async () => {
    create.mockResolvedValueOnce({ data: null, error: { name: "x", message: "bad" } });
    const token = signToken("a@b.de", Date.now());
    const r = await confirmSubscription(token);
    expect(r.status).toBe("error");
  });

  it("returns error when not configured", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEWSLETTER_SECRET", "s3cret"); // token verifies, but audience/key missing
    const token = signToken("a@b.de", Date.now());
    const r = await confirmSubscription(token);
    expect(r.status).toBe("error");
    expect(create).not.toHaveBeenCalled();
  });
});
