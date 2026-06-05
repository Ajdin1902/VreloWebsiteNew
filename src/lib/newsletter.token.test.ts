// src/lib/newsletter.token.test.ts
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { signToken, verifyToken, TOKEN_TTL_MS } from "./newsletter";

beforeEach(() => vi.stubEnv("NEWSLETTER_SECRET", "s3cret"));
afterEach(() => vi.unstubAllEnvs());

describe("token sign/verify", () => {
  const now = 1_000_000;

  it("round-trips: a freshly signed token verifies and yields the email", () => {
    const t = signToken("a@b.de", now);
    const r = verifyToken(t, now + 1000);
    expect(r).toEqual({ ok: true, email: "a@b.de" });
  });

  it("rejects a tampered signature", () => {
    const t = signToken("a@b.de", now);
    const tampered = t.slice(0, -1) + (t.endsWith("A") ? "B" : "A");
    expect(verifyToken(tampered, now).ok).toBe(false);
  });

  it("rejects a tampered payload (different email, same signature)", () => {
    const t = signToken("a@b.de", now);
    const sig = t.split(".")[1];
    const forgedPayload = Buffer.from(JSON.stringify({ email: "evil@x.de", iat: now })).toString("base64url");
    const r = verifyToken(`${forgedPayload}.${sig}`, now);
    expect(r.ok).toBe(false);
  });

  it("rejects an expired token", () => {
    const t = signToken("a@b.de", now);
    const r = verifyToken(t, now + TOKEN_TTL_MS + 1);
    expect(r).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects when signed with a different secret", () => {
    const t = signToken("a@b.de", now);
    vi.stubEnv("NEWSLETTER_SECRET", "different");
    expect(verifyToken(t, now).ok).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(verifyToken("garbage", now).ok).toBe(false);
    expect(verifyToken("a.b.c", now).ok).toBe(false);
  });
});
