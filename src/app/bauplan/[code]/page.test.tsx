import { describe, it, expect, vi, afterEach } from "vitest";
const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound }));
import Page, { generateMetadata } from "./page";

const orig = process.env.BAUPLAN_CODE;
afterEach(() => {
  if (orig === undefined) delete process.env.BAUPLAN_CODE;
  else process.env.BAUPLAN_CODE = orig;
  notFound.mockClear();
});

describe("/bauplan/[code]", () => {
  it("is noindex and titled only for the right code", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    const ok = await generateMetadata({ params: Promise.resolve({ code: "agentur-7k3m" }) });
    expect(ok.robots).toMatchObject({ index: false, follow: false });
    expect(ok.title).toBe("Bauplan für Agenturen");
    const wrong = await generateMetadata({ params: Promise.resolve({ code: "x" }) });
    expect(wrong.robots).toMatchObject({ index: false, follow: false });
    expect(wrong.title).toBeUndefined();
  });
  it("404s on a wrong code", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    await expect(Page({ params: Promise.resolve({ code: "other" }), searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
  });
  it("404s on every code when none is configured", async () => {
    delete process.env.BAUPLAN_CODE;
    await expect(Page({ params: Promise.resolve({ code: "agentur-7k3m" }), searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
  });
  it("renders on the right code", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    const el = await Page({ params: Promise.resolve({ code: "agentur-7k3m" }), searchParams: Promise.resolve({}) });
    expect(el).toBeTruthy();
    expect(notFound).not.toHaveBeenCalled();
  });
  it("hands a normalised ?src= to the form and drops junk", async () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m";
    const params = Promise.resolve({ code: "agentur-7k3m" });
    const good = await Page({ params, searchParams: Promise.resolve({ src: "AG01" }) });
    expect(good.props.form.props.source).toBe("ag01");
    expect(good.props.form.props.code).toBe("agentur-7k3m");
    const junk = await Page({ params, searchParams: Promise.resolve({ src: "<script>" }) });
    expect(junk.props.form.props.source).toBeUndefined();
  });
});
