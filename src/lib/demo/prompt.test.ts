import { describe, it, expect } from "vitest";
import { buildSystemPrompt, prepareChat, MAX_TURNS, MAX_MSG_LEN } from "./prompt";
import { sandboxSlots } from "./slots";
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
  it("includes provided sandbox slots so the bot proposes grounded times", () => {
    const slots = sandboxSlots(new Date("2026-07-06T09:00:00Z"));
    const p = buildSystemPrompt(seed, slots);
    expect(p).toContain(slots[0]);
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

  it("keeps the newest turns and drops the oldest when the transcript exceeds the char budget", () => {
    // 11 messages (6 user + 5 assistant) of ~499 chars = ~5.5k > MAX_TRANSCRIPT_CHARS (4000).
    const many = Array.from({ length: 11 }, (_, i) => msg(i % 2 === 0 ? "user" : "assistant", `m${i}-` + "a".repeat(495)));
    const d = prepareChat({ seed, messages: many });
    expect(d.action).toBe("generate"); // 6 user turns == MAX_TURNS, so not stopped
    if (d.action === "generate") {
      const total = d.messages.reduce((n, m) => n + m.content.length, 0);
      expect(total).toBeLessThanOrEqual(4000);
      expect(d.messages[d.messages.length - 1].content).toContain("m10"); // newest kept
      expect(d.messages.some((m) => m.content.startsWith("m0-"))).toBe(false); // oldest dropped
    }
  });
});
