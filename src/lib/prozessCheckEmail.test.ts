import { describe, it, expect } from "vitest";
import { validateEmail } from "./prozessCheckEmail";

describe("validateEmail", () => {
  it("rejects a malformed address", () => {
    expect(validateEmail("nope")).toBeTruthy();
  });
  it("rejects an address with a line break inside", () => {
    expect(validateEmail("a@b.de\r\nBcc: x@y.de")).toBeTruthy();
  });
  it("accepts a valid address", () => {
    expect(validateEmail("a@b.de")).toBeUndefined();
  });
});
