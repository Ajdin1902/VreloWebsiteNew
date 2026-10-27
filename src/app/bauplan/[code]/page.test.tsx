import { describe, it, expect, vi, afterEach } from "vitest";
import { metadata } from "./page";
const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound }));
import Page from "./page";

const orig = process.env.BAUPLAN_CODE;
afterEach(() => {
  if (orig === undefined) delete process.env.BAUPLAN_CODE;
  else process.env.BAUPLAN_CODE = orig;
  notFound.mockClear();
});

describe("/bauplan/[code]", () => {
  it("is noindex", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
  it("404s on a wrong code", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    await expect(Page({ params: Promise.resolve({ code: "other" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("404s on every code when none is configured", async () => {
    delete process.env.BAUPLAN_CODE;
    await expect(Page({ params: Promise.resolve({ code: "agentur-7k3m" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("renders on the right code", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    const el = await Page({ params: Promise.resolve({ code: "agentur-7k3m" }) });
    expect(el).toBeTruthy();
    expect(notFound).not.toHaveBeenCalled();
  });
});
