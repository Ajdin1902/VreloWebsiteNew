// src/app/layout.metadata.test.ts
import { describe, it, expect, vi } from "vitest";
import { metadata } from "./layout";
import { findCopyIssues } from "@/lib/ratgeberCopy";

// next/font only runs inside the Next compiler; the metadata object doesn't need it.
vi.mock("@/lib/fonts", () => ({ jakarta: { variable: "" }, fraunces: { variable: "" } }));

// The default title is what the homepage (and any page without its own title) shows in Google.
describe("root metadata", () => {
  it("defaults to a keyword title with the place, and keeps the template for subpages", () => {
    const title = metadata.title as { default: string; template: string };
    expect(title.default).toBe("KI- und Prozessautomatisierung aus Regensburg - Vrelo");
    expect(title.default.length).toBeLessThanOrEqual(60);
    expect(title.template).toBe("%s - Vrelo");
  });

  it("describes the offer with the region and passes the copy guards", () => {
    const d = metadata.description as string;
    expect(d).toContain("Regensburg");
    expect(d).toContain("Oberpfalz");
    expect(findCopyIssues(d)).toEqual([]);
  });
});
