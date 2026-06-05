// src/lib/contact.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import { contactTo, contactFrom, resendKey, calLink, isContactConfigured } from "./contact";

afterEach(() => vi.unstubAllEnvs());

describe("contact env getters", () => {
  it("read process.env at call time", () => {
    vi.stubEnv("CONTACT_TO", "hallo@example.de");
    vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("NEXT_PUBLIC_CAL_LINK", "vrelo/kennenlernen");
    expect(contactTo()).toBe("hallo@example.de");
    expect(contactFrom()).toBe("Vrelo <kontakt@example.de>");
    expect(resendKey()).toBe("re_test");
    expect(calLink()).toBe("vrelo/kennenlernen");
  });

  it("isContactConfigured is true only when key+from+to are all set", () => {
    expect(isContactConfigured()).toBe(false);
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM", "x@y.de");
    expect(isContactConfigured()).toBe(false);
    vi.stubEnv("CONTACT_TO", "z@y.de");
    expect(isContactConfigured()).toBe(true);
  });
});
