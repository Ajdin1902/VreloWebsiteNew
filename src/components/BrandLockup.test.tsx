import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandLockup } from "./BrandLockup";

describe("BrandLockup", () => {
  it("renders the live-text wordmark Vrelo", () => {
    render(<BrandLockup />);
    expect(screen.getByText("Vrelo")).toBeInTheDocument();
  });

  it("renders a decorative symbol (aria-hidden, no double announcement)", () => {
    const { container } = render(<BrandLockup />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("bottom-aligns the wordmark with the symbol", () => {
    const { container } = render(<BrandLockup />);
    expect(container.firstChild).toHaveClass("items-end");
  });

  it("uses the navy funnel by default and the paper funnel on dark", () => {
    const { container, rerender } = render(<BrandLockup variant="navy" />);
    expect(container.querySelector('path[fill="#0a2538"]')).not.toBeNull();
    rerender(<BrandLockup variant="paper" />);
    expect(container.querySelector('path[fill="#f4efe6"]')).not.toBeNull();
  });
});
