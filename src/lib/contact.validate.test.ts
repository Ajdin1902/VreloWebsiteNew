// src/lib/contact.validate.test.ts
import { describe, it, expect } from "vitest";
import { validateContact, isHoneypotTripped, isTooFast, MIN_FILL_MS } from "./contact";

describe("validateContact", () => {
  const ok = { name: "Aydin", email: "a@b.de", message: "Hallo", consent: true };

  it("passes a complete valid submission (no errors)", () => {
    expect(validateContact(ok)).toEqual({});
  });
  it("flags missing name, bad email, empty message, missing consent", () => {
    const e = validateContact({ name: "  ", email: "nope", message: "", consent: false });
    expect(e.name).toBeTruthy();
    expect(e.email).toBeTruthy();
    expect(e.message).toBeTruthy();
    expect(e.consent).toBeTruthy();
  });
});

describe("spam helpers", () => {
  it("isHoneypotTripped true only when the hidden field has content", () => {
    expect(isHoneypotTripped("")).toBe(false);
    expect(isHoneypotTripped("   ")).toBe(false);
    expect(isHoneypotTripped("http://spam")).toBe(true);
  });
  it("isTooFast true below MIN_FILL_MS, false at/after", () => {
    const t = 1_000_000;
    expect(isTooFast(t, t + MIN_FILL_MS - 1)).toBe(true);
    expect(isTooFast(t, t + MIN_FILL_MS)).toBe(false);
  });
});
