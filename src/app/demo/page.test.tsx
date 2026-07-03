import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DemoPage, { metadata } from "./page";

afterEach(() => vi.unstubAllEnvs());

describe("DemoPage", () => {
  it("is noindex", () => {
    expect(metadata.robots).toMatchObject({ index: false });
  });
  it("renders the demo when configured", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    render(<DemoPage />);
    expect(screen.getByText(/Was bietest du an/i)).toBeTruthy();
  });
  it("renders a calm fallback when unconfigured", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    render(<DemoPage />);
    expect(screen.getByText(/bald verfügbar/i)).toBeTruthy();
  });
});
