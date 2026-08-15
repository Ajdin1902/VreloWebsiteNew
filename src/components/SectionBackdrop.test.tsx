import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SectionBackdrop } from "./SectionBackdrop";

describe("SectionBackdrop", () => {
  it("renders a decorative full-bleed image at the given src", () => {
    const { container } = render(<SectionBackdrop src="/images/bg-wasichbaue.webp" tintRgb="27 80 99" tintOpacity={0.8} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "/images/bg-wasichbaue.webp");
    // Decorative: empty alt + aria-hidden so it never enters the a11y tree.
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("aria-hidden", "true");
    expect(img).toHaveClass("absolute", "inset-0");
  });

  it("lays the image behind the tint, both behind content", () => {
    const { container } = render(<SectionBackdrop src="/images/bg-wasichbaue.webp" tintRgb="27 80 99" tintOpacity={0.8} />);
    const img = container.querySelector("img");
    const overlay = container.querySelector("div[aria-hidden]");
    // Image sits deepest (-z-20), tint above it (-z-10); page content (z-auto) above both.
    expect(img).toHaveClass("-z-20");
    expect(overlay).toHaveClass("-z-10");
  });

  it("tints the overlay with the caller's colour and opacity", () => {
    const { container } = render(<SectionBackdrop src="/images/bg-problem.webp" tintRgb="244 239 230" tintOpacity={0.75} />);
    const overlay = container.querySelector<HTMLElement>("div[aria-hidden]");
    // jsdom normalises `rgb(r g b / a)` to `rgba(r, g, b, a)`.
    expect(overlay?.style.backgroundColor).toContain("244, 239, 230");
    expect(overlay?.style.backgroundColor).toContain("0.75");
  });
});
