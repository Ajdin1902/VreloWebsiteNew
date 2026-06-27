import { describe, it, expect } from "vitest";
import { parseSendArgs, assertSendable } from "./args.mjs";

describe("parseSendArgs", () => {
  it("parses preview mode", () => {
    expect(parseSendArgs(["--preview", "my-slug"])).toEqual({ mode: "preview", slug: "my-slug" });
  });
  it("parses test mode with an email", () => {
    expect(parseSendArgs(["--test", "me@x.de", "my-slug"])).toEqual({ mode: "test", slug: "my-slug", testEmail: "me@x.de" });
  });
  it("parses send mode with optional scheduledAt", () => {
    expect(parseSendArgs(["--send", "my-slug", "--at", "2026-07-01T08:00:00Z"])).toEqual({ mode: "send", slug: "my-slug", scheduledAt: "2026-07-01T08:00:00Z" });
  });
  it("throws without a mode", () => {
    expect(() => parseSendArgs(["my-slug"])).toThrow(/--preview|--test|--send/);
  });
  it("throws on two modes", () => {
    expect(() => parseSendArgs(["--preview", "--send", "s"])).toThrow(/one of/);
  });
  it("throws when --test has no email", () => {
    expect(() => parseSendArgs(["--test", "my-slug"])).toThrow(/email/i);
  });
  it("throws when slug is missing", () => {
    expect(() => parseSendArgs(["--preview"])).toThrow(/slug/i);
  });
});

describe("assertSendable", () => {
  it("rejects a draft issue", () => {
    expect(() => assertSendable({ slug: "s", draft: true })).toThrow(/draft/i);
  });
  it("allows a non-draft issue", () => {
    expect(() => assertSendable({ slug: "s", draft: false })).not.toThrow();
  });
});
