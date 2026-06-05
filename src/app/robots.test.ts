// src/app/robots.test.ts
import { describe, it, expect } from "vitest";
import robots from "./robots";
import { siteUrl } from "@/lib/site";

describe("robots", () => {
  it("allows all and points to the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe(`${siteUrl}/sitemap.xml`);
    expect(r.rules).toEqual({ userAgent: "*", allow: "/" });
  });
});
