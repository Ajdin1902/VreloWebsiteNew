// src/app/canonical.metadata.test.ts
import { describe, it, expect } from "vitest";
import { metadata as leistungen } from "./leistungen/page";
import { metadata as faq } from "./faq/page";
import { metadata as home } from "./page";
import { canonical } from "@/lib/site";

describe("per-page canonical", () => {
  it("leistungen sets its canonical via canonical()", () => {
    expect(leistungen.alternates?.canonical).toBe(canonical("/leistungen"));
  });
  it("faq sets its canonical", () => {
    expect(faq.alternates?.canonical).toBe(canonical("/faq"));
  });
  it("home sets the origin as its canonical", () => {
    expect(home.alternates?.canonical).toBe(canonical(""));
  });
});
