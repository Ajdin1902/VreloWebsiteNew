// src/lib/newsletter.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  newsletterSecret,
  newsletterSegmentId,
  isNewsletterConfigured,
  isValidNewsletterEmail,
  validateNewsletterSignup,
} from "./newsletter";

afterEach(() => vi.unstubAllEnvs());

describe("newsletter env", () => {
  it("reads process.env at call time", () => {
    vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
    vi.stubEnv("NEWSLETTER_SEGMENT_ID", "seg_1");
    expect(newsletterSecret()).toBe("s3cret");
    expect(newsletterSegmentId()).toBe("seg_1");
  });

  it("isNewsletterConfigured needs key+from+secret+segment", () => {
    expect(isNewsletterConfigured()).toBe(false);
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
    vi.stubEnv("NEWSLETTER_SECRET", "s3cret");
    expect(isNewsletterConfigured()).toBe(false);
    vi.stubEnv("NEWSLETTER_SEGMENT_ID", "seg_1");
    expect(isNewsletterConfigured()).toBe(true);
  });
});

describe("newsletter validation", () => {
  it("isValidNewsletterEmail accepts good, rejects bad", () => {
    expect(isValidNewsletterEmail("a@b.de")).toBe(true);
    expect(isValidNewsletterEmail("nope")).toBe(false);
    expect(isValidNewsletterEmail("  ")).toBe(false);
  });

  it("validateNewsletterSignup flags bad email and missing consent", () => {
    expect(validateNewsletterSignup({ email: "a@b.de", consent: true })).toEqual({});
    const e = validateNewsletterSignup({ email: "nope", consent: false });
    expect(e.email).toBeTruthy();
    expect(e.consent).toBeTruthy();
  });
});
