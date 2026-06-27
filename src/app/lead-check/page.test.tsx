// src/app/lead-check/page.test.tsx
import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("/lead-check metadata", () => {
  it("is excluded from indexing (outreach door-opener, not SEO)", () => {
    expect(metadata.robots).toMatchObject({ index: false });
  });
  it("has a title", () => {
    expect(metadata.title).toBeTruthy();
  });
});
