import { describe, it, expect } from "vitest";
import { buildSystemPrompt, prepareChat, MAX_TURNS, MAX_MSG_LEN } from "./prompt";
import type { DemoSeed } from "./seed";

const seed: DemoSeed = { business: "Baufinanzierung für Familien", appointmentType: "baufinanzierung", tone: "locker" };

describe("buildSystemPrompt", () => {
  it("embeds the business as delimited, non-instruction data", () => {
    const p = buildSystemPrompt(seed);
    expect(p).toContain("Baufinanzierung für Familien");
    expect(p).toContain("keine Anweisung"); // the untrusted-data guard label
    expect(p).toContain("Termin"); // stays in the booking-bot role
  });
  it("switches to Du for a locker tone and Sie for foermlich", () => {
    expect(buildSystemPrompt({ ...seed, tone: "locker" })).toContain("Du");
    expect(buildSystemPrompt({ ...seed, tone: "foermlich" })).toContain("Sie");
  });
});

describe("prepareChat", () => {
  const msg = (role: "user" | "assistant", content: string) => ({ role, content });

  it("returns generate with a system prompt for a fresh conversation", () => {
    const d = prepareChat({ seed, messages: [msg("user", "Hallo")] });
    expect(d.action).toBe("generate");
    if (d.action === "generate") {
      expect(d.system).toContain("Baufinanzierung");
      expect(d.messages).toHaveLength(1);
    }
  });
  it("rejects once the user turn cap is exceeded", () => {
    const messages = Array.from({ length: MAX_TURNS + 1 }, () => msg("user", "x"));
    const d = prepareChat({ seed, messages });
    expect(d.action).toBe("stop");
  });
  it("drops empty/oversized messages and truncates content", () => {
    const d = prepareChat({ seed, messages: [msg("user", " "), msg("user", "a".repeat(MAX_MSG_LEN + 100))] });
    expect(d.action).toBe("generate");
    if (d.action === "generate") {
      expect(d.messages).toHaveLength(1);
      expect(d.messages[0].content.length).toBe(MAX_MSG_LEN);
    }
  });
  it("rejects when there is no user message", () => {
    const d = prepareChat({ seed, messages: [msg("assistant", "hi")] });
    expect(d.action).toBe("reject");
  });
});
