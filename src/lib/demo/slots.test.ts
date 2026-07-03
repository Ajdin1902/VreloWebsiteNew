import { describe, it, expect } from "vitest";
import { sandboxSlots } from "./slots";

describe("sandboxSlots", () => {
  it("returns 3 future weekday slots relative to a given now, deterministically", () => {
    const now = new Date("2026-07-06T09:00:00Z"); // a Monday
    const a = sandboxSlots(now);
    const b = sandboxSlots(now);
    expect(a).toHaveLength(3);
    expect(a).toEqual(b);
    expect(a[0]).toMatch(/\d{1,2}\.\d{1,2}\./); // German date fragment
  });
  it("skips weekends", () => {
    const now = new Date("2026-07-10T09:00:00Z"); // a Friday
    for (const s of sandboxSlots(now)) {
      expect(s.toLowerCase()).not.toContain("samstag");
      expect(s.toLowerCase()).not.toContain("sonntag");
    }
  });
});
